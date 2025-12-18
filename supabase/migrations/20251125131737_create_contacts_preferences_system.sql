/*
  # Contact Preferences System

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key) - Unique identifier for the contact
      - `user_id` (uuid, foreign key to auth.users) - Links to authenticated user
      - `person_name` (text) - Contact person's name
      - `contact_email` (text) - Contact email address
      - `customer_id` (text) - Customer identification number
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp
    
    - `report_preferences`
      - `id` (uuid, primary key) - Unique identifier for preferences
      - `contact_id` (uuid, foreign key to contacts) - Links to contact record
      - `report_type` (text) - Type of report requested
      - `start_date` (date) - Report start date
      - `end_date` (date) - Report end date
      - `apply_loss_threshold` (boolean) - Whether to apply loss filters
      - `get_all_data` (boolean) - Whether to get all data regardless of filters
      - `total_loss_per_order_pack` (decimal) - Filter threshold for total loss per order pack
      - `loss_per_ordered_pack` (decimal) - Filter threshold for loss per ordered pack
      - `grand_total_loss` (decimal) - Filter threshold for grand total loss
      - `frequency` (text) - Report delivery frequency (daily/weekly/monthly)
      - `send_notification_no_data` (boolean) - Send notification even when no data matches
      - `is_active` (boolean) - Whether preferences are active
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp
      - `webhook_sent_at` (timestamptz) - Timestamp when data was last sent to N8N
  
  2. Security
    - Enable RLS on both tables
    - Users can only read/write their own contact records
    - Policies check authentication and user ownership
  
  3. Indexes
    - Index on user_id for fast contact lookups
    - Index on contact_id for fast preference lookups
    - Index on is_active for filtering active preferences
  
  4. Functions
    - Trigger to automatically update `updated_at` timestamps
    - Function to get contact with latest preferences
  
  5. N8N Integration Points
    - Webhook trigger can query report_preferences table
    - Filter by is_active = true
    - Use webhook_sent_at to track last sync
    - Join with contacts table for user details
*/

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  person_name text NOT NULL,
  contact_email text NOT NULL,
  customer_id text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create report_preferences table
CREATE TABLE IF NOT EXISTS report_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  report_type text NOT NULL DEFAULT 'Pack Optimization Loss Report',
  start_date date NOT NULL,
  end_date date NOT NULL,
  apply_loss_threshold boolean DEFAULT false NOT NULL,
  get_all_data boolean DEFAULT false NOT NULL,
  total_loss_per_order_pack decimal(10, 2),
  loss_per_ordered_pack decimal(10, 2),
  grand_total_loss decimal(10, 2),
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  send_notification_no_data boolean DEFAULT false NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  webhook_sent_at timestamptz,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_report_preferences_contact_id ON report_preferences(contact_id);
CREATE INDEX IF NOT EXISTS idx_report_preferences_is_active ON report_preferences(is_active);
CREATE INDEX IF NOT EXISTS idx_report_preferences_webhook_sent ON report_preferences(webhook_sent_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_report_preferences_updated_at ON report_preferences;
CREATE TRIGGER update_report_preferences_updated_at
  BEFORE UPDATE ON report_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contacts table
CREATE POLICY "Users can view their own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for report_preferences table
CREATE POLICY "Users can view their own preferences"
  ON report_preferences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = report_preferences.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own preferences"
  ON report_preferences FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = report_preferences.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own preferences"
  ON report_preferences FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = report_preferences.contact_id
      AND contacts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = report_preferences.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own preferences"
  ON report_preferences FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = report_preferences.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- Create a view for N8N integration (combines contact and preferences data)
CREATE OR REPLACE VIEW active_report_configurations AS
SELECT 
  rp.id as preference_id,
  rp.contact_id,
  c.user_id,
  c.person_name,
  c.contact_email,
  c.customer_id,
  rp.report_type,
  rp.start_date,
  rp.end_date,
  rp.apply_loss_threshold,
  rp.get_all_data,
  rp.total_loss_per_order_pack,
  rp.loss_per_ordered_pack,
  rp.grand_total_loss,
  rp.frequency,
  rp.send_notification_no_data,
  rp.is_active,
  rp.webhook_sent_at,
  rp.created_at,
  rp.updated_at
FROM report_preferences rp
JOIN contacts c ON c.id = rp.contact_id
WHERE rp.is_active = true;

-- Grant access to the view
GRANT SELECT ON active_report_configurations TO authenticated;
