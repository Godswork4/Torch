import { supabase } from './supabase';

export interface Integration {
  id: string;
  user_id: string;
  service: 'gmail' | 'google_calendar' | 'apple_calendar' | 'discord';
  credentials: Record<string, unknown>;
  is_active: boolean;
  last_sync: string | null;
  sync_settings: {
    sync_frequency: string;
    auto_sync: boolean;
    filters: Record<string, unknown>;
  };
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  integration_id: string;
  event_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  attendees: Array<{ email: string; name?: string }>;
  status: 'confirmed' | 'tentative' | 'cancelled';
  calendar_source: 'google' | 'apple';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  user_id: string;
  integration_id: string;
  message_id: string;
  thread_id?: string;
  subject: string;
  from_address: string;
  to_addresses: string[];
  cc_addresses: string[];
  body_preview?: string;
  body_full?: string;
  is_read: boolean;
  is_important: boolean;
  labels: string[];
  received_at: string;
  ai_summary?: string;
  ai_action_items: Array<{ action: string; priority: number }>;
  created_at: string;
}

export interface DiscordMessage {
  id: string;
  user_id: string;
  integration_id: string;
  message_id: string;
  channel_id: string;
  channel_name?: string;
  server_id?: string;
  server_name?: string;
  author_id: string;
  author_name?: string;
  content: string;
  mentions_user: boolean;
  is_direct_message: boolean;
  attachments: Array<{ url: string; filename: string }>;
  embeds: Array<Record<string, unknown>>;
  posted_at: string;
  ai_relevance_score?: number;
  created_at: string;
}

export async function getIntegrations(userId: string): Promise<Integration[]> {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addIntegration(
  userId: string,
  service: Integration['service'],
  credentials: Record<string, unknown>
): Promise<Integration> {
  const { data, error } = await supabase
    .from('integrations')
    .insert({
      user_id: userId,
      service,
      credentials,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIntegration(
  integrationId: string,
  updates: Partial<Integration>
): Promise<Integration> {
  const { data, error } = await supabase
    .from('integrations')
    .update(updates)
    .eq('id', integrationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIntegration(integrationId: string): Promise<void> {
  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('id', integrationId);

  if (error) throw error;
}

export async function getUpcomingCalendarEvents(
  userId: string,
  limit: number = 10
): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getRecentEmails(
  userId: string,
  limit: number = 20
): Promise<Email[]> {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('user_id', userId)
    .order('received_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getUnreadEmails(userId: string): Promise<Email[]> {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('received_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getRecentDiscordMessages(
  userId: string,
  limit: number = 50
): Promise<DiscordMessage[]> {
  const { data, error } = await supabase
    .from('discord_messages')
    .select('*')
    .eq('user_id', userId)
    .order('posted_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getDiscordMentions(userId: string): Promise<DiscordMessage[]> {
  const { data, error } = await supabase
    .from('discord_messages')
    .select('*')
    .eq('user_id', userId)
    .eq('mentions_user', true)
    .order('posted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function syncIntegration(integrationId: string): Promise<void> {
  const { error } = await supabase
    .from('integrations')
    .update({ last_sync: new Date().toISOString() })
    .eq('id', integrationId);

  if (error) throw error;
}

export function subscribeToCalendarEvents(
  userId: string,
  callback: (payload: { new: CalendarEvent }) => void
) {
  return supabase
    .channel('calendar_events_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'calendar_events',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToEmails(
  userId: string,
  callback: (payload: { new: Email }) => void
) {
  return supabase
    .channel('emails_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'emails',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToDiscordMessages(
  userId: string,
  callback: (payload: { new: DiscordMessage }) => void
) {
  return supabase
    .channel('discord_messages_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'discord_messages',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}
