/*
  # Add Multiple Contacts Per Report Support

  1. New Tables
    - `report_contacts` - Junction table linking reports to multiple contacts
      - `id` (uuid, primary key)
      - `report_preference_id` (uuid, foreign key to report_preferences)
      - `contact_id` (uuid, foreign key to contacts)
      - `created_at` (timestamptz)

  2. Changes
    - Make `contact_id` in `report_preferences` nullable (for backward compatibility)
    - Create junction table to support many-to-many relationship
    - Add indexes for performance
    - Set up RLS policies

  3. Notes
    - Existing reports will continue to work with `contact_id` field
    - New reports can use the junction table for multiple contacts
    - Reports can now be sent to multiple different contacts
*/

-- Create junction table for report-contact relationships
CREATE TABLE IF NOT EXISTS report_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_preference_id uuid REFERENCES report_preferences(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(report_preference_id, contact_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_contacts_report_id ON report_contacts(report_preference_id);
CREATE INDEX IF NOT EXISTS idx_report_contacts_contact_id ON report_contacts(contact_id);

-- Enable RLS
ALTER TABLE report_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for report_contacts table
CREATE POLICY "Users can view their report contacts"
  ON report_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = report_contacts.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their report contacts"
  ON report_contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = report_contacts.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their report contacts"
  ON report_contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = report_contacts.contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- Make contact_id nullable in report_preferences for new multi-contact approach
ALTER TABLE report_preferences ALTER COLUMN contact_id DROP NOT NULL;

-- Update the view to handle both old single-contact and new multi-contact reports
DROP VIEW IF EXISTS active_report_configurations;

CREATE VIEW active_report_configurations AS
SELECT DISTINCT
  rp.id AS preference_id,
  rp.contact_id AS legacy_contact_id,
  c.id AS contact_id,
  c.user_id,
  c.person_name,
  c.contact_email,
  c.customer_id,
  rp.report_name,
  rp.report_type,
  rp.start_date,
  rp.end_date,
  rp.apply_loss_threshold,
  rp.get_all_data,
  rp.total_loss_per_order_pack,
  rp.loss_per_ordered_pack,
  rp.grand_total_loss,
  rp.frequency,
  rp.date_range,
  rp.delivery_day_of_week,
  rp.delivery_day_of_month,
  rp.delivery_time_hour,
  rp.send_notification_no_data,
  rp.is_active,
  rp.webhook_sent_at,
  rp.created_at,
  rp.updated_at
FROM report_preferences rp
LEFT JOIN report_contacts rc ON rc.report_preference_id = rp.id
LEFT JOIN contacts c ON c.id = COALESCE(rc.contact_id, rp.contact_id)
WHERE rp.is_active = true AND c.id IS NOT NULL;
