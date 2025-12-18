/*
  # Update delivery day of month constraint

  1. Changes
    - Update any existing delivery_day_of_month values > 28 to 28
    - Update constraint from 1-31 to 1-28
    - This ensures the day exists in all months (February safe)
  
  2. Notes
    - Safer scheduling - avoids edge cases with shorter months
    - Existing data adjusted to new maximum
*/

-- Update any values greater than 28 to be 28
UPDATE report_preferences 
SET delivery_day_of_month = 28 
WHERE delivery_day_of_month > 28;

-- Drop old constraint
ALTER TABLE report_preferences 
DROP CONSTRAINT IF EXISTS report_preferences_delivery_day_of_month_check;

-- Add new constraint
ALTER TABLE report_preferences 
ADD CONSTRAINT report_preferences_delivery_day_of_month_check 
CHECK (delivery_day_of_month >= 1 AND delivery_day_of_month <= 28);

-- Update comment
COMMENT ON COLUMN report_preferences.delivery_day_of_month IS 'For monthly reports: day of month (1-28). Limited to 28 to ensure day exists in all months including February';