/*
  # Remove report_detail_level column

  1. Changes
    - Drop active_report_configurations view first
    - Remove report_detail_level column from report_preferences table
    - Recreate active_report_configurations view without the removed column
  
  2. Reasoning
    - User requested removal of report detail level feature
    - Keeping other customization options (delivery schedule and content options)
*/

-- Drop the view first to remove dependency
DROP VIEW IF EXISTS active_report_configurations;

-- Drop the report_detail_level column
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_preferences' AND column_name = 'report_detail_level'
  ) THEN
    ALTER TABLE report_preferences DROP COLUMN report_detail_level;
  END IF;
END $$;

-- Recreate the active_report_configurations view without report_detail_level
CREATE VIEW active_report_configurations AS
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
  rp.delivery_day_of_week,
  rp.delivery_day_of_month,
  rp.delivery_time_hour,
  rp.include_charts,
  rp.include_raw_data,
  rp.group_by_category,
  rp.include_trends,
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
