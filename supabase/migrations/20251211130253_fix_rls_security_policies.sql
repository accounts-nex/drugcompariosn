/*
  # Fix RLS Security Policies

  ## Problem
  The current RLS policies use `USING (true)` which allows unrestricted access to all reports
  by anyone, regardless of email ownership. This is a critical security vulnerability.

  ## Changes
  1. Drop all existing overly permissive RLS policies
  2. Temporarily disable RLS on both tables
  
  ## Important Notes
  - This application currently has NO authentication system
  - Without authentication (auth.uid()), proper RLS cannot be enforced
  - Email-based filtering is only enforced at the application level
  - Anyone can claim to be any email address
  - **RECOMMENDATION**: Implement Supabase Auth to properly secure this application
  
  ## Security Implications
  - Disabling RLS means the database relies entirely on application-level filtering
  - Direct database access (bypassing the app) would expose all data
  - This is a temporary measure until proper authentication is implemented
*/

-- Drop all existing policies for active_report_schedules
DROP POLICY IF EXISTS "Anyone can view active reports" ON active_report_schedules;
DROP POLICY IF EXISTS "Anyone can insert active reports" ON active_report_schedules;
DROP POLICY IF EXISTS "Anyone can update active reports" ON active_report_schedules;
DROP POLICY IF EXISTS "Anyone can delete active reports" ON active_report_schedules;

-- Drop all existing policies for inactive_report_schedules
DROP POLICY IF EXISTS "Anyone can view inactive reports" ON inactive_report_schedules;
DROP POLICY IF EXISTS "Anyone can insert inactive reports" ON inactive_report_schedules;
DROP POLICY IF EXISTS "Anyone can update inactive reports" ON inactive_report_schedules;
DROP POLICY IF EXISTS "Anyone can delete inactive reports" ON inactive_report_schedules;

-- Disable RLS temporarily (until authentication is implemented)
ALTER TABLE active_report_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE inactive_report_schedules DISABLE ROW LEVEL SECURITY;