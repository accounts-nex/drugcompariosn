/*
  # Update active_report_configurations view to include date_range

  1. Changes
    - Drop and recreate the `active_report_configurations` view
    - Add `date_range` field from `report_preferences` table to the view
  
  2. Notes
    - The view joins `report_preferences` and `contacts` tables
    - Shows only active report configurations (is_active = true)
*/

DROP VIEW IF EXISTS active_report_configurations;

CREATE VIEW active_report_configurations AS
SELECT 
  rp.id AS preference_id,
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
JOIN contacts c ON c.id = rp.contact_id
WHERE rp.is_active = true;
