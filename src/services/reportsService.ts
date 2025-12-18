import { supabase } from '../lib/supabase';
import type { ReportConfiguration } from '../types/reportConfig';

export interface ReportSchedule {
  id: string;
  email: string;
  report_name: string;
  person_name: string;
  contact_email: string[];
  customer_id: string;
  report_type: string;
  date_range: string | null;
  apply_loss_threshold: boolean;
  total_loss_per_order_pack: number | null;
  loss_per_ordered_pack: number | null;
  grand_total_loss: number | null;
  frequency: string;
  delivery_day_of_week: number | null;
  delivery_day_of_month: number | null;
  delivery_time_hour: number;
  send_notification_no_data: boolean;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}

export async function getActiveReports(email: string): Promise<ReportSchedule[]> {
  const { data, error } = await supabase
    .from('active_report_schedules')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active reports:', error);
    throw new Error('Failed to fetch active reports');
  }

  return (data || []).map(r => ({ ...r, is_active: true }));
}

export async function getInactiveReports(email: string): Promise<ReportSchedule[]> {
  const { data, error } = await supabase
    .from('inactive_report_schedules')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching inactive reports:', error);
    throw new Error('Failed to fetch inactive reports');
  }

  return (data || []).map(r => ({ ...r, is_active: false }));
}

export async function getAllReports(email: string): Promise<ReportSchedule[]> {
  const [active, inactive] = await Promise.all([
    getActiveReports(email),
    getInactiveReports(email),
  ]);

  return [...active, ...inactive].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getReportById(reportId: string, email: string): Promise<ReportSchedule | null> {
  const { data: activeData, error: activeError } = await supabase
    .from('active_report_schedules')
    .select('*')
    .eq('id', reportId)
    .eq('email', email)
    .maybeSingle();

  if (activeError) {
    console.error('Error fetching active report:', activeError);
    throw new Error('Failed to fetch report');
  }

  if (activeData) {
    return { ...activeData, is_active: true };
  }

  const { data: inactiveData, error: inactiveError } = await supabase
    .from('inactive_report_schedules')
    .select('*')
    .eq('id', reportId)
    .eq('email', email)
    .maybeSingle();

  if (inactiveError) {
    console.error('Error fetching inactive report:', inactiveError);
    throw new Error('Failed to fetch report');
  }

  if (inactiveData) {
    return { ...inactiveData, is_active: false };
  }

  return null;
}

export async function createReport(
  email: string,
  formData: ReportConfiguration
): Promise<ReportSchedule> {
  const filteredEmails = formData.contact_email.filter(email => email && email.trim() !== '');

  const reportData = {
    email: email,
    report_name: formData.report_name,
    person_name: formData.person_name,
    contact_email: filteredEmails,
    customer_id: formData.customer_id,
    report_type: formData.report_type,
    date_range: formData.date_range,
    apply_loss_threshold: formData.apply_loss_threshold,
    total_loss_per_order_pack: formData.total_loss_per_order_pack || null,
    loss_per_ordered_pack: formData.loss_per_ordered_pack || null,
    grand_total_loss: formData.grand_total_loss || null,
    frequency: formData.frequency,
    delivery_day_of_week: formData.frequency === 'weekly' && formData.delivery_day_of_week !== undefined && formData.delivery_day_of_week !== ''
      ? Number(formData.delivery_day_of_week)
      : null,
    delivery_day_of_month: formData.frequency === 'monthly' && formData.delivery_day_of_month !== undefined && formData.delivery_day_of_month !== ''
      ? Number(formData.delivery_day_of_month)
      : null,
    delivery_time_hour: Number(formData.delivery_time_hour),
    send_notification_no_data: formData.send_notification_no_data,
  };

  const { data, error } = await supabase
    .from('active_report_schedules')
    .insert(reportData)
    .select()
    .single();

  if (error) {
    console.error('Error creating report:', error);
    throw new Error('Failed to create report');
  }

  return { ...data, is_active: true };
}

export async function updateReport(
  reportId: string,
  email: string,
  formData: ReportConfiguration,
  isActive: boolean
): Promise<ReportSchedule> {
  const filteredEmails = formData.contact_email.filter(email => email && email.trim() !== '');

  const reportData = {
    report_name: formData.report_name,
    person_name: formData.person_name,
    contact_email: filteredEmails,
    customer_id: formData.customer_id,
    report_type: formData.report_type,
    date_range: formData.date_range,
    apply_loss_threshold: formData.apply_loss_threshold,
    total_loss_per_order_pack: formData.total_loss_per_order_pack || null,
    loss_per_ordered_pack: formData.loss_per_ordered_pack || null,
    grand_total_loss: formData.grand_total_loss || null,
    frequency: formData.frequency,
    delivery_day_of_week: formData.frequency === 'weekly' && formData.delivery_day_of_week !== undefined && formData.delivery_day_of_week !== ''
      ? Number(formData.delivery_day_of_week)
      : null,
    delivery_day_of_month: formData.frequency === 'monthly' && formData.delivery_day_of_month !== undefined && formData.delivery_day_of_month !== ''
      ? Number(formData.delivery_day_of_month)
      : null,
    delivery_time_hour: Number(formData.delivery_time_hour),
    send_notification_no_data: formData.send_notification_no_data,
    updated_at: new Date().toISOString(),
  };

  const tableName = isActive ? 'active_report_schedules' : 'inactive_report_schedules';

  const { data, error } = await supabase
    .from(tableName)
    .update(reportData)
    .eq('id', reportId)
    .eq('email', email)
    .select()
    .single();

  if (error) {
    console.error('Error updating report:', error);
    throw new Error('Failed to update report');
  }

  return { ...data, is_active: isActive };
}

export async function toggleReportActive(reportId: string, email: string, currentlyActive: boolean): Promise<ReportSchedule> {
  const sourceTable = currentlyActive ? 'active_report_schedules' : 'inactive_report_schedules';
  const targetTable = currentlyActive ? 'inactive_report_schedules' : 'active_report_schedules';

  const { data: report, error: fetchError } = await supabase
    .from(sourceTable)
    .select('*')
    .eq('id', reportId)
    .eq('email', email)
    .single();

  if (fetchError || !report) {
    console.error('Error fetching report for toggle:', fetchError);
    throw new Error('Failed to fetch report');
  }

  const { id, created_at, updated_at, ...reportData } = report;

  const { data: newReport, error: insertError } = await supabase
    .from(targetTable)
    .insert({
      ...reportData,
      id,
      created_at,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting into target table:', insertError);
    throw new Error('Failed to move report');
  }

  const { error: deleteError } = await supabase
    .from(sourceTable)
    .delete()
    .eq('id', reportId)
    .eq('email', email);

  if (deleteError) {
    console.error('Error deleting from source table:', deleteError);
    throw new Error('Failed to complete toggle');
  }

  return { ...newReport, is_active: !currentlyActive };
}

export async function deleteReport(reportId: string, email: string, isActive: boolean): Promise<void> {
  const tableName = isActive ? 'active_report_schedules' : 'inactive_report_schedules';

  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', reportId)
    .eq('email', email);

  if (error) {
    console.error('Error deleting report:', error);
    throw new Error('Failed to delete report');
  }
}
