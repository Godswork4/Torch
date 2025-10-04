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

      const clientId = Deno.env.get('DISCORD_CLIENT_ID');
      const clientSecret = Deno.env.get('DISCORD_CLIENT_SECRET');
      const redirectUri = Deno.env.get('DISCORD_REDIRECT_URI');

      if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('Missing Discord OAuth configuration');
      }

      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
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

      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const discordUser = await userResponse.json();

      const { data: integration, error } = await supabase
        .from('integrations')
        .insert({
          user_id: userId,
          service: 'discord',
          credentials: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + tokens.expires_in * 1000,
            discord_user_id: discordUser.id,
            discord_username: discordUser.username,
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
        const clientId = Deno.env.get('DISCORD_CLIENT_ID');
        const clientSecret = Deno.env.get('DISCORD_CLIENT_SECRET');

        const refreshResponse = await fetch('https://discord.com/api/oauth2/token', {
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

      const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!guildsResponse.ok) {
        throw new Error('Failed to fetch Discord guilds');
      }

      const guilds = await guildsResponse.json();
      let syncedCount = 0;

      for (const guild of guilds) {
        try {
          const channelsResponse = await fetch(
            `https://discord.com/api/guilds/${guild.id}/channels`,
            {
              headers: { Authorization: `Bot ${Deno.env.get('DISCORD_BOT_TOKEN')}` },
            }
          );

          if (!channelsResponse.ok) continue;

          const channels = await channelsResponse.json();
          const textChannels = channels.filter((c: any) => c.type === 0);

          for (const channel of textChannels.slice(0, 5)) {
            const messagesResponse = await fetch(
              `https://discord.com/api/channels/${channel.id}/messages?limit=20`,
              {
                headers: { Authorization: `Bot ${Deno.env.get('DISCORD_BOT_TOKEN')}` },
              }
            );

            if (!messagesResponse.ok) continue;

            const messages = await messagesResponse.json();

            for (const message of messages) {
              const mentionsUser = message.mentions.some(
                (m: any) => m.id === integration.credentials.discord_user_id
              );

              await supabase.from('discord_messages').upsert(
                {
                  user_id: integration.user_id,
                  integration_id: integrationId,
                  message_id: message.id,
                  channel_id: channel.id,
                  channel_name: channel.name,
                  server_id: guild.id,
                  server_name: guild.name,
                  author_id: message.author.id,
                  author_name: message.author.username,
                  content: message.content,
                  mentions_user: mentionsUser,
                  is_direct_message: false,
                  attachments: message.attachments || [],
                  embeds: message.embeds || [],
                  posted_at: new Date(message.timestamp).toISOString(),
                },
                { onConflict: 'integration_id,message_id' }
              );

              syncedCount++;
            }
          }
        } catch (error) {
          console.error(`Error syncing guild ${guild.id}:`, error);
        }
      }

      const dmsResponse = await fetch('https://discord.com/api/users/@me/channels', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (dmsResponse.ok) {
        const dmChannels = await dmsResponse.json();

        for (const dmChannel of dmChannels.slice(0, 10)) {
          try {
            const messagesResponse = await fetch(
              `https://discord.com/api/channels/${dmChannel.id}/messages?limit=20`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );

            if (!messagesResponse.ok) continue;

            const messages = await messagesResponse.json();

            for (const message of messages) {
              await supabase.from('discord_messages').upsert(
                {
                  user_id: integration.user_id,
                  integration_id: integrationId,
                  message_id: message.id,
                  channel_id: dmChannel.id,
                  channel_name: 'Direct Message',
                  server_id: null,
                  server_name: null,
                  author_id: message.author.id,
                  author_name: message.author.username,
                  content: message.content,
                  mentions_user: true,
                  is_direct_message: true,
                  attachments: message.attachments || [],
                  embeds: message.embeds || [],
                  posted_at: new Date(message.timestamp).toISOString(),
                },
                { onConflict: 'integration_id,message_id' }
              );

              syncedCount++;
            }
          } catch (error) {
            console.error(`Error syncing DM channel ${dmChannel.id}:`, error);
          }
        }
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
      const clientId = Deno.env.get('DISCORD_CLIENT_ID');
      const redirectUri = Deno.env.get('DISCORD_REDIRECT_URI');

      const authUrl = `https://discord.com/api/oauth2/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri!)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('identify guilds messages.read')}`;

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