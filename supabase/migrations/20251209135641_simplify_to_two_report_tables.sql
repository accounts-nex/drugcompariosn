/*
  # Simplify Report Structure to Two Tables

  1. New Tables
    - `active_report_schedules` - Stores all active report configurations
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `report_name` (text)
      - `person_name` (text)
      - `contact_email` (text array)
      - `customer_id` (text)
      - `report_type` (text)
      - `date_range` (text)
      - `apply_loss_threshold` (boolean)
      - `get_all_data` (boolean)
      - `total_loss_per_order_pack` (numeric)
      - `loss_per_ordered_pack` (numeric)
      - `grand_total_loss` (numeric)
      - `frequency` (text)
      - `delivery_day_of_week` (integer)
      - `delivery_day_of_month` (integer)
      - `delivery_time_hour` (integer)
      - `send_notification_no_data` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `inactive_report_schedules` - Stores all inactive report configurations
      - Same structure as active_report_schedules

  2. Security
    - Enable RLS on both tables
    - Users can only access their own reports

  3. Notes
    - Old tables (contacts, report_preferences, report_contacts) are kept for data safety
    - Data will be migrated from old structure to new tables
*/

-- Create active_report_schedules table
CREATE TABLE IF NOT EXISTS active_report_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_name text NOT NULL DEFAULT 'Unnamed Report',
  person_name text NOT NULL,
  contact_email text[] NOT NULL DEFAULT '{}',
  customer_id text NOT NULL,
  report_type text NOT NULL DEFAULT 'Pack Optimization Loss Report',
  date_range text,
  apply_loss_threshold boolean NOT NULL DEFAULT false,
  get_all_data boolean NOT NULL DEFAULT false,
  total_loss_per_order_pack numeric,
  loss_per_ordered_pack numeric,
  grand_total_loss numeric,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  delivery_day_of_week integer CHECK (delivery_day_of_week >= 0 AND delivery_day_of_week <= 6),
  delivery_day_of_month integer CHECK (delivery_day_of_month >= 1 AND delivery_day_of_month <= 28),
  delivery_time_hour integer NOT NULL DEFAULT 9 CHECK (delivery_time_hour >= 0 AND delivery_time_hour <= 23),
  send_notification_no_data boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create inactive_report_schedules table (same structure)
CREATE TABLE IF NOT EXISTS inactive_report_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_name text NOT NULL DEFAULT 'Unnamed Report',
  person_name text NOT NULL,
  contact_email text[] NOT NULL DEFAULT '{}',
  customer_id text NOT NULL,
  report_type text NOT NULL DEFAULT 'Pack Optimization Loss Report',
  date_range text,
  apply_loss_threshold boolean NOT NULL DEFAULT false,
  get_all_data boolean NOT NULL DEFAULT false,
  total_loss_per_order_pack numeric,
  loss_per_ordered_pack numeric,
  grand_total_loss numeric,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  delivery_day_of_week integer CHECK (delivery_day_of_week >= 0 AND delivery_day_of_week <= 6),
  delivery_day_of_month integer CHECK (delivery_day_of_month >= 1 AND delivery_day_of_month <= 28),
  delivery_time_hour integer NOT NULL DEFAULT 9 CHECK (delivery_time_hour >= 0 AND delivery_time_hour <= 23),
  send_notification_no_data boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE active_report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE inactive_report_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for active_report_schedules
CREATE POLICY "Users can view own active reports"
  ON active_report_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own active reports"
  ON active_report_schedules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active reports"
  ON active_report_schedules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own active reports"
  ON active_report_schedules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for inactive_report_schedules
CREATE POLICY "Users can view own inactive reports"
  ON inactive_report_schedules FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inactive reports"
  ON inactive_report_schedules FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inactive reports"
  ON inactive_report_schedules FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inactive reports"
  ON inactive_report_schedules FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Migrate existing data from old tables to new tables
INSERT INTO active_report_schedules (
  id, user_id, report_name, person_name, contact_email, customer_id,
  report_type, date_range, apply_loss_threshold, get_all_data,
  total_loss_per_order_pack, loss_per_ordered_pack, grand_total_loss,
  frequency, delivery_day_of_week, delivery_day_of_month, delivery_time_hour,
  send_notification_no_data, created_at, updated_at
)
SELECT 
  rp.id,
  c.user_id,
  rp.report_name,
  c.person_name,
  c.contact_email,
  c.customer_id,
  rp.report_type,
  rp.date_range,
  rp.apply_loss_threshold,
  rp.get_all_data,
  rp.total_loss_per_order_pack,
  rp.loss_per_ordered_pack,
  rp.grand_total_loss,
  rp.frequency,
  rp.delivery_day_of_week,
  rp.delivery_day_of_month,
  COALESCE(rp.delivery_time_hour, 9),
  rp.send_notification_no_data,
  rp.created_at,
  rp.updated_at
FROM report_preferences rp
JOIN contacts c ON rp.contact_id = c.id
WHERE rp.is_active = true;

INSERT INTO inactive_report_schedules (
  id, user_id, report_name, person_name, contact_email, customer_id,
  report_type, date_range, apply_loss_threshold, get_all_data,
  total_loss_per_order_pack, loss_per_ordered_pack, grand_total_loss,
  frequency, delivery_day_of_week, delivery_day_of_month, delivery_time_hour,
  send_notification_no_data, created_at, updated_at
)
SELECT 
  rp.id,
  c.user_id,
  rp.report_name,
  c.person_name,
  c.contact_email,
  c.customer_id,
  rp.report_type,
  rp.date_range,
  rp.apply_loss_threshold,
  rp.get_all_data,
  rp.total_loss_per_order_pack,
  rp.loss_per_ordered_pack,
  rp.grand_total_loss,
  rp.frequency,
  rp.delivery_day_of_week,
  rp.delivery_day_of_month,
  COALESCE(rp.delivery_time_hour, 9),
  rp.send_notification_no_data,
  rp.created_at,
  rp.updated_at
FROM report_preferences rp
JOIN contacts c ON rp.contact_id = c.id
WHERE rp.is_active = false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_active_reports_user_id ON active_report_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_inactive_reports_user_id ON inactive_report_schedules(user_id);
