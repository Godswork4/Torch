# Integration Setup Guide

This guide explains how to set up real-time integrations for Gmail, Google Calendar, and Discord.

## Prerequisites

All Edge Functions have been deployed to your Supabase project. You only need to configure the OAuth credentials for each service.

## Required Environment Variables

The following environment variables need to be configured. These are automatically available in your Supabase Edge Functions but need to be obtained from the respective service providers.

### Google Services (Gmail & Calendar)

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Gmail API and Google Calendar API

2. **Create OAuth 2.0 Credentials:**
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     - For Gmail: `https://your-project.supabase.co/functions/v1/gmail-oauth/callback`
     - For Calendar: `https://your-project.supabase.co/functions/v1/calendar-oauth/callback`

3. **Required Variables:**
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://your-project.supabase.co/functions/v1/gmail-oauth/callback
   GOOGLE_CALENDAR_REDIRECT_URI=https://your-project.supabase.co/functions/v1/calendar-oauth/callback
   ```

### Discord

1. **Create a Discord Application:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click "New Application"
   - Go to "OAuth2" section

2. **Configure OAuth2:**
   - Add redirect URL: `https://your-project.supabase.co/functions/v1/discord-oauth/callback`
   - Select scopes: `identify`, `guilds`, `messages.read`

3. **Create a Bot (for message reading):**
   - Go to "Bot" section
   - Click "Add Bot"
   - Enable required intents: "Message Content Intent", "Server Members Intent"
   - Copy the bot token

4. **Required Variables:**
   ```
   DISCORD_CLIENT_ID=your-application-id
   DISCORD_CLIENT_SECRET=your-client-secret
   DISCORD_REDIRECT_URI=https://your-project.supabase.co/functions/v1/discord-oauth/callback
   DISCORD_BOT_TOKEN=your-bot-token
   ```

## How It Works

### OAuth Flow

1. **User clicks "Connect" on an integration**
   - Frontend calls the Edge Function's `/auth-url` endpoint
   - Opens OAuth consent screen in popup window

2. **User authorizes the application**
   - Service redirects back with authorization code
   - Frontend sends code to Edge Function's `/callback` endpoint

3. **Edge Function exchanges code for tokens**
   - Stores access token, refresh token, and expiry in database
   - Creates integration record

### Data Syncing

1. **User clicks "Sync" button**
   - Frontend calls Edge Function's `/sync` endpoint with integration ID

2. **Edge Function refreshes token if needed**
   - Checks if access token is expired
   - Uses refresh token to get new access token if necessary

3. **Fetches and stores data**
   - **Gmail:** Fetches up to 50 recent unread/important emails
   - **Google Calendar:** Fetches next 30 days of events
   - **Discord:** Fetches recent messages from user's guilds and DMs

4. **Updates database**
   - Stores data in respective tables (emails, calendar_events, discord_messages)
   - Updates last_sync timestamp
   - Creates sync log entry

### Automatic Token Refresh

All Edge Functions automatically handle token refresh:
- Before each sync, checks if access token is expired
- Uses refresh token to obtain new access token
- Updates stored credentials in database

## Frontend Integration

The frontend uses these helper functions:

```typescript
import { getOAuthUrl, handleOAuthCallback, triggerSync } from './lib/oauth';

// Get OAuth URL for a service
const authUrl = await getOAuthUrl('gmail');

// Handle OAuth callback
await handleOAuthCallback('gmail', code, userId);

// Trigger sync
const itemsSynced = await triggerSync('gmail', integrationId);
```

## Real-time Updates

The application uses Supabase Realtime to receive live updates:

```typescript
import { subscribeToEmails, subscribeToCalendarEvents, subscribeToDiscordMessages } from './lib/integrations';

// Subscribe to new emails
const emailChannel = await subscribeToEmails(userId, (payload) => {
  console.log('New email:', payload.new);
});

// Subscribe to calendar events
const calendarChannel = await subscribeToCalendarEvents(userId, (payload) => {
  console.log('New event:', payload.new);
});

// Subscribe to Discord messages
const discordChannel = await subscribeToDiscordMessages(userId, (payload) => {
  console.log('New message:', payload.new);
});
```

## Testing

1. **Test OAuth Flow:**
   - Click "Connect" on an integration in Settings
   - Complete OAuth authorization
   - Verify integration appears as connected

2. **Test Sync:**
   - Click "Sync" on a connected integration
   - Check database tables for synced data
   - Verify last_sync timestamp updates

3. **Test Dashboard:**
   - Navigate to Dashboard
   - Verify real-time counts display correctly
   - Check that synced data appears

## Security Notes

- All OAuth tokens are stored encrypted in the database
- Access tokens automatically refresh before expiry
- Row Level Security (RLS) ensures users only see their own data
- All Edge Functions verify JWT authentication
- Secrets are managed securely through Supabase

## Troubleshooting

### OAuth fails to connect
- Verify redirect URIs match exactly in OAuth provider settings
- Check that APIs are enabled in Google Cloud Console
- Ensure client ID and secret are correct

### Sync returns no data
- Verify the user has authorized the correct scopes
- Check that the access token hasn't been revoked
- Review Edge Function logs in Supabase dashboard

### Real-time updates not working
- Ensure Realtime is enabled in Supabase project settings
- Verify RLS policies allow SELECT operations
- Check browser console for WebSocket errors

## Next Steps

1. Configure OAuth credentials for each service
2. Test the OAuth flow for each integration
3. Set up automated sync jobs (optional)
4. Add AI processing for email summaries and calendar insights
5. Implement push notifications for important updates
