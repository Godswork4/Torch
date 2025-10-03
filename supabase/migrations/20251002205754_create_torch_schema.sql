/*
  # Torch AI Database Schema
  
  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique) - Hedera wallet address
      - `username` (text)
      - `email` (text)
      - `preferences` (jsonb) - User settings and preferences
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `tracked_wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `wallet_address` (text) - Wallet being tracked
      - `alias` (text) - Friendly name for the wallet
      - `created_at` (timestamptz)
    
    - `tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `source` (text) - discord, twitter, calendar, manual
      - `content` (text)
      - `priority` (integer)
      - `status` (text) - pending, completed, archived
      - `due_date` (timestamptz)
      - `ai_priority_score` (decimal)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (text) - task, wallet, news, system
      - `title` (text)
      - `content` (text)
      - `priority` (integer)
      - `is_read` (boolean)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
    
    - `ai_briefs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `brief_type` (text) - daily, wallet_analysis, news_summary
      - `content` (text)
      - `audio_url` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
    
    - `integrations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `service` (text) - discord, twitter, calendar, gmail
      - `credentials` (jsonb) - Encrypted credentials
      - `is_active` (boolean)
      - `last_sync` (timestamptz)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text,
  email text,
  preferences jsonb DEFAULT '{"notifications": true, "ai_audio": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Tracked wallets table
CREATE TABLE IF NOT EXISTS tracked_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  wallet_address text NOT NULL,
  alias text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tracked_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tracked wallets"
  ON tracked_wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracked wallets"
  ON tracked_wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracked wallets"
  ON tracked_wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracked wallets"
  ON tracked_wallets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  source text DEFAULT 'manual',
  content text NOT NULL,
  priority integer DEFAULT 3,
  status text DEFAULT 'pending',
  due_date timestamptz,
  ai_priority_score decimal(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  priority integer DEFAULT 3,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- AI Briefs table
CREATE TABLE IF NOT EXISTS ai_briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  brief_type text NOT NULL,
  content text NOT NULL,
  audio_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own briefs"
  ON ai_briefs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own briefs"
  ON ai_briefs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  service text NOT NULL,
  credentials jsonb,
  is_active boolean DEFAULT true,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations"
  ON integrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON integrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON integrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON integrations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_tracked_wallets_user ON tracked_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_briefs_user_created ON ai_briefs(user_id, created_at DESC);