export interface User {
  id: string;
  wallet_address: string;
  username?: string;
  email?: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  notifications: boolean;
  ai_audio: boolean;
  theme?: 'dark' | 'light';
}

export interface TrackedWallet {
  id: string;
  user_id: string;
  wallet_address: string;
  alias?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  source: 'discord' | 'twitter' | 'calendar' | 'manual' | 'gmail';
  content: string;
  priority: number;
  status: 'pending' | 'completed' | 'archived';
  due_date?: string;
  ai_priority_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'task' | 'wallet' | 'news' | 'system';
  title: string;
  content: string;
  priority: number;
  is_read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AIBrief {
  id: string;
  user_id: string;
  brief_type: 'daily' | 'wallet_analysis' | 'news_summary';
  content: string;
  audio_url?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Integration {
  id: string;
  user_id: string;
  service: 'discord' | 'twitter' | 'calendar' | 'gmail';
  credentials?: Record<string, any>;
  is_active: boolean;
  last_sync?: string;
  created_at: string;
}
