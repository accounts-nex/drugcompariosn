/*
  # Add Report Specificity and Delivery Schedule Configuration

  1. New Columns Added to report_preferences
    - `report_detail_level` (text) - Controls how detailed the report should be
      Options: 'summary', 'standard', 'detailed', 'comprehensive'
      - summary: High-level overview only
      - standard: Standard reporting with key metrics
      - detailed: Detailed breakdown with additional metrics
      - comprehensive: Full data export with all available fields
    
    - `delivery_day_of_week` (integer) - For weekly reports, which day to deliver (0=Sunday, 6=Saturday)
    - `delivery_day_of_month` (integer) - For monthly reports, which day of month to deliver (1-31)
    - `delivery_time_hour` (integer) - Specific hour for delivery (0-23, UK Time)
    - `include_charts` (boolean) - Whether to include visual charts in reports
    - `include_raw_data` (boolean) - Whether to include raw data export
    - `group_by_category` (boolean) - Whether to group results by category
    - `include_trends` (boolean) - Whether to include trend analysis
  
  2. Updates
    - Add check constraints to validate delivery schedule values
    - Add default values for new fields
    - Drop and recreate view to include new columns
  
  3. Benefits
    - Users can control exactly how much detail they want
    - Flexible scheduling for report delivery
    - Customizable report content (charts, raw data, trends)
    - Better alignment with user needs and workflow
*/

-- Add report specificity and detail columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_preferences' AND column_name = 'report_detail_level'
  ) THEN
    ALTER TABLE report_preferences ADD COLUMN report_detail_level text DEFAULT 'standard' NOT NULL
      CHECK (report_detail_level IN ('summary', 'standard', 'detailed', 'comprehensive'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_preferences' AND column_name = 'delivery_day_of_week'
  ) THEN
    ALTER TABLE report_preferences ADD COLUMN delivery_day_of_week integer
      CHECK (delivery_day_of_week >= 0 AND delivery_day_of_week <= 6);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_preferences' AND column_name = 'delivery_day_of_month'
  ) THEN
    ALTER TABLE report_preferences ADD COLUMN delivery_day_of_month integer
      CHECK (delivery_day_of_month >= 1 AND delivery_day_of_month <= 31);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_preferences' AND column_name = 'delivery_time_hour'
  ) THEN
    ALTER TABLE report_preferences ADD COLUMN delivery_time_hour integer DEFAULT 9
      CHECK (delivery_time_hour >= 0 AND delivery_time_hour <= 23);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_preferences' AND column_name = 'include_charts'
  ) THEN
    ALTER TABLE report_preferences ADD COLUMN include_charts boolean DEFAULT true NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_preferences' AND column_name = 'include_raw_data'
  ) THEN
    ALTER TABLE report_preferences ADD COLUMN include_raw_data boolean DEFAULT false NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_preferences' AND column_name = 'group_by_category'
  ) THEN
    ALTER TABLE report_preferences ADD COLUMN group_by_category boolean DEFAULT true NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_preferences' AND column_name = 'include_trends'
  ) THEN
    ALTER TABLE report_preferences ADD COLUMN include_trends boolean DEFAULT true NOT NULL;
  END IF;
END $$;

-- Drop and recreate the view to include new fields
DROP VIEW IF EXISTS active_report_configurations;

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
  rp.report_detail_level,
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

-- Add helpful comments
COMMENT ON COLUMN report_preferences.report_detail_level IS 'Controls report detail: summary (overview), standard (key metrics), detailed (full breakdown), comprehensive (all data)';
COMMENT ON COLUMN report_preferences.delivery_day_of_week IS 'For weekly reports: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';
COMMENT ON COLUMN report_preferences.delivery_day_of_month IS 'For monthly reports: day of month (1-31). If day does not exist in month, uses last day of month';
COMMENT ON COLUMN report_preferences.delivery_time_hour IS 'Preferred delivery hour in 24-hour format (0-23), UK Time';
