const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export type IntegrationService = 'gmail' | 'google_calendar' | 'discord';

interface AuthUrlResponse {
  authUrl: string;
}

export async function getOAuthUrl(service: IntegrationService): Promise<string> {
  let endpoint = '';

  switch (service) {
    case 'gmail':
      endpoint = 'gmail-oauth';
      break;
    case 'google_calendar':
      endpoint = 'calendar-oauth';
      break;
    case 'discord':
      endpoint = 'discord-oauth';
      break;
    default:
      throw new Error(`Unsupported service: ${service}`);
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${endpoint}/auth-url`,
    {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get OAuth URL');
  }

  const data: AuthUrlResponse = await response.json();
  return data.authUrl;
}

export async function handleOAuthCallback(
  service: IntegrationService,
  code: string,
  userId: string
): Promise<void> {
  let endpoint = '';

  switch (service) {
    case 'gmail':
      endpoint = 'gmail-oauth';
      break;
    case 'google_calendar':
      endpoint = 'calendar-oauth';
      break;
    case 'discord':
      endpoint = 'discord-oauth';
      break;
    default:
      throw new Error(`Unsupported service: ${service}`);
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${endpoint}/callback`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, userId, source: service === 'google_calendar' ? 'google' : service }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to complete OAuth callback');
  }
}

export async function triggerSync(
  service: IntegrationService,
  integrationId: string
): Promise<number> {
  let endpoint = '';

  switch (service) {
    case 'gmail':
      endpoint = 'gmail-oauth';
      break;
    case 'google_calendar':
      endpoint = 'calendar-oauth';
      break;
    case 'discord':
      endpoint = 'discord-oauth';
      break;
    default:
      throw new Error(`Unsupported service: ${service}`);
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/${endpoint}/sync`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ integrationId }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to trigger sync');
  }

  const data = await response.json();
  return data.synced;
}

export function openOAuthWindow(authUrl: string, onSuccess: () => void): void {
  const width = 600;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const popup = window.open(
    authUrl,
    'OAuth',
    `width=${width},height=${height},left=${left},top=${top}`
  );

  const checkClosed = setInterval(() => {
    if (popup?.closed) {
      clearInterval(checkClosed);
      onSuccess();
    }
  }, 500);
}
