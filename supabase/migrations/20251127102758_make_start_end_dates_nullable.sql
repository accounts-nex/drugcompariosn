/*
  # Make start_date and end_date nullable

  1. Changes
    - Remove NOT NULL constraint from start_date and end_date columns
    - These dates should be calculated dynamically by n8n based on date_range
    - Only date_range (e.g., "last_7_days") should be stored
  
  2. Notes
    - This allows the backend to calculate the actual date range at runtime
    - Supports dynamic date ranges for recurring reports
*/

ALTER TABLE report_preferences 
ALTER COLUMN start_date DROP NOT NULL;

ALTER TABLE report_preferences 
ALTER COLUMN end_date DROP NOT NULL;

COMMENT ON COLUMN report_preferences.start_date IS 'Legacy field - not used. Date range is calculated from date_range field by n8n';
COMMENT ON COLUMN report_preferences.end_date IS 'Legacy field - not used. Date range is calculated from date_range field by n8n';
COMMENT ON COLUMN report_preferences.date_range IS 'Date range specification (e.g., "last_7_days"). n8n calculates actual dates dynamically when report runs';