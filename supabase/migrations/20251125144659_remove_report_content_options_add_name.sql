/*
  # Remove report content options and add report name

  1. Changes
    - Remove include_charts, include_raw_data, group_by_category, include_trends columns
    - Add report_name column to allow users to name their reports
    - Update active_report_configurations view
  
  2. Reasoning
    - User wants to simplify configuration by removing content options
    - Users can give meaningful names to their reports for easier identification
*/

-- Drop the view first to remove dependency
DROP VIEW IF EXISTS active_report_configurations;

-- Drop report content option columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_preferences' AND column_name = 'include_charts') THEN
    ALTER TABLE report_preferences DROP COLUMN include_charts;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_preferences' AND column_name = 'include_raw_data') THEN
    ALTER TABLE report_preferences DROP COLUMN include_raw_data;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_preferences' AND column_name = 'group_by_category') THEN
    ALTER TABLE report_preferences DROP COLUMN group_by_category;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_preferences' AND column_name = 'include_trends') THEN
    ALTER TABLE report_preferences DROP COLUMN include_trends;
  END IF;
END $$;

-- Add report_name column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'report_preferences' AND column_name = 'report_name') THEN
    ALTER TABLE report_preferences ADD COLUMN report_name text NOT NULL DEFAULT 'Unnamed Report';
  END IF;
END $$;

-- Recreate the view without removed columns
CREATE VIEW active_report_configurations AS
SELECT 
  rp.id as preference_id,
  rp.contact_id,
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
  rp.delivery_day_of_week,
  rp.delivery_day_of_month,
  rp.delivery_time_hour,
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

-- Add comment
COMMENT ON COLUMN report_preferences.report_name IS 'User-defined name for the report configuration';
