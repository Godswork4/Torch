import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface OAuthCallbackRequest {
  code: string;
  userId: string;
}

interface SyncRequest {
  integrationId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith('/callback') && req.method === 'POST') {
      const { code, userId }: OAuthCallbackRequest = await req.json();

      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
      const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');

      if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('Missing Google OAuth configuration');
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await tokenResponse.json();

      const { data: integration, error } = await supabase
        .from('integrations')
        .insert({
          user_id: userId,
          service: 'gmail',
          credentials: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + tokens.expires_in * 1000,
          },
          is_active: true,
          last_sync: null,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, integration }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.endsWith('/sync') && req.method === 'POST') {
      const { integrationId }: SyncRequest = await req.json();

      const { data: integration, error: fetchError } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', integrationId)
        .single();

      if (fetchError) throw fetchError;

      let accessToken = integration.credentials.access_token;
      const expiresAt = integration.credentials.expires_at;

      if (Date.now() >= expiresAt) {
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            refresh_token: integration.credentials.refresh_token,
            client_id: clientId!,
            client_secret: clientSecret!,
            grant_type: 'refresh_token',
          }),
        });

        const newTokens = await refreshResponse.json();
        accessToken = newTokens.access_token;

        await supabase
          .from('integrations')
          .update({
            credentials: {
              ...integration.credentials,
              access_token: newTokens.access_token,
              expires_at: Date.now() + newTokens.expires_in * 1000,
            },
          })
          .eq('id', integrationId);
      }

      const messagesResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=50&q=is:unread OR is:important',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!messagesResponse.ok) {
        throw new Error('Failed to fetch Gmail messages');
      }

      const messagesData = await messagesResponse.json();
      const messages = messagesData.messages || [];

      let syncedCount = 0;

      for (const message of messages) {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const detail = await detailResponse.json();
        const headers = detail.payload.headers;

        const getHeader = (name: string) => {
          const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
          return header?.value || '';
        };

        const subject = getHeader('Subject');
        const from = getHeader('From');
        const to = getHeader('To').split(',').map((e: string) => e.trim());
        const cc = getHeader('Cc').split(',').filter((e: string) => e.trim()).map((e: string) => e.trim());
        const date = getHeader('Date');

        let bodyPreview = '';
        if (detail.snippet) {
          bodyPreview = detail.snippet;
        }

        const labels = detail.labelIds || [];
        const isImportant = labels.includes('IMPORTANT');
        const isUnread = labels.includes('UNREAD');

        await supabase.from('emails').upsert(
          {
            user_id: integration.user_id,
            integration_id: integrationId,
            message_id: message.id,
            thread_id: detail.threadId,
            subject,
            from_address: from,
            to_addresses: to,
            cc_addresses: cc,
            body_preview: bodyPreview,
            is_read: !isUnread,
            is_important: isImportant,
            labels,
            received_at: new Date(date).toISOString(),
          },
          { onConflict: 'integration_id,message_id' }
        );

        syncedCount++;
      }

      await supabase
        .from('integrations')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', integrationId);

      await supabase.from('integration_sync_log').insert({
        integration_id: integrationId,
        sync_start: new Date().toISOString(),
        sync_end: new Date().toISOString(),
        status: 'success',
        items_synced: syncedCount,
      });

      return new Response(
        JSON.stringify({ success: true, synced: syncedCount }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.endsWith('/auth-url') && req.method === 'GET') {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri!)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly')}&` +
        `access_type=offline&` +
        `prompt=consent`;

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});