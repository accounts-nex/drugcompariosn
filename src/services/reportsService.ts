import { apiClient } from '../lib/supabase';
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
  try {
    const data = await apiClient.get(`/report-schedules/active?email=${encodeURIComponent(email)}`);
    return (data || []).map((r: ReportSchedule) => ({ ...r, is_active: true }));
  } catch (error) {
    console.error('Error fetching active reports:', error);
    throw new Error('Failed to fetch active reports');
  }
}

export async function getInactiveReports(email: string): Promise<ReportSchedule[]> {
  try {
    const data = await apiClient.get(`/report-schedules/inactive?email=${encodeURIComponent(email)}`);
    return (data || []).map((r: ReportSchedule) => ({ ...r, is_active: false }));
  } catch (error) {
    console.error('Error fetching inactive reports:', error);
    throw new Error('Failed to fetch inactive reports');
  }
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
  try {
    const data = await apiClient.get(`/report-schedules/${reportId}?email=${encodeURIComponent(email)}`);
    return data;
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
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

  try {
    const data = await apiClient.post('/report-schedules', reportData);
    return { ...data, is_active: true };
  } catch (error) {
    console.error('Error creating report:', error);
    throw new Error('Failed to create report');
  }
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
    is_active: isActive,
  };

  try {
    const data = await apiClient.put(`/report-schedules/${reportId}?email=${encodeURIComponent(email)}`, reportData);
    return { ...data, is_active: isActive };
  } catch (error) {
    console.error('Error updating report:', error);
    throw new Error('Failed to update report');
  }
}

export async function toggleReportActive(reportId: string, email: string, currentlyActive: boolean): Promise<ReportSchedule> {
  try {
    const data = await apiClient.put(`/report-schedules/${reportId}/toggle?email=${encodeURIComponent(email)}`, {
      is_active: !currentlyActive,
    });
    return { ...data, is_active: !currentlyActive };
  } catch (error) {
    console.error('Error toggling report:', error);
    throw new Error('Failed to toggle report');
  }
}

export async function deleteReport(reportId: string, email: string, isActive: boolean): Promise<void> {
  try {
    await apiClient.delete(`/report-schedules/${reportId}?email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Error deleting report:', error);
    throw new Error('Failed to delete report');
  }
}
