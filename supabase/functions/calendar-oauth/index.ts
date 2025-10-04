import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface OAuthCallbackRequest {
  code: string;
  userId: string;
  source: 'google' | 'apple';
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
      const { code, userId, source }: OAuthCallbackRequest = await req.json();

      if (source === 'google') {
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
        const redirectUri = Deno.env.get('GOOGLE_CALENDAR_REDIRECT_URI');

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
            service: 'google_calendar',
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

      return new Response(
        JSON.stringify({ error: 'Apple Calendar integration requires app-specific password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      if (integration.service === 'google_calendar') {
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

        const now = new Date().toISOString();
        const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const eventsResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
          `timeMin=${now}&timeMax=${futureDate}&singleEvents=true&orderBy=startTime&maxResults=100`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch Google Calendar events');
        }

        const eventsData = await eventsResponse.json();
        const events = eventsData.items || [];

        let syncedCount = 0;

        for (const event of events) {
          const startTime = event.start?.dateTime || event.start?.date;
          const endTime = event.end?.dateTime || event.end?.date;

          if (!startTime || !endTime) continue;

          const attendees = (event.attendees || []).map((a: any) => ({
            email: a.email,
            name: a.displayName,
          }));

          await supabase.from('calendar_events').upsert(
            {
              user_id: integration.user_id,
              integration_id: integrationId,
              event_id: event.id,
              title: event.summary || 'Untitled Event',
              description: event.description || null,
              start_time: new Date(startTime).toISOString(),
              end_time: new Date(endTime).toISOString(),
              location: event.location || null,
              attendees,
              status: event.status || 'confirmed',
              calendar_source: 'google',
              metadata: {
                html_link: event.htmlLink,
                hangout_link: event.hangoutLink,
                conference_data: event.conferenceData,
              },
            },
            { onConflict: 'integration_id,event_id' }
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

      return new Response(
        JSON.stringify({ error: 'Unsupported calendar source' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path.endsWith('/auth-url') && req.method === 'GET') {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const redirectUri = Deno.env.get('GOOGLE_CALENDAR_REDIRECT_URI');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri!)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar.readonly')}&` +
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