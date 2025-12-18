import { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, Mail, User, Hash, Bell, ArrowLeft, LogOut, Tag, Edit2, Trash2, Power } from 'lucide-react';
import { useEmail } from '../contexts/EmailContext';
import { getAllReports, toggleReportActive, deleteReport } from '../services/reportsService';
import type { ReportSchedule } from '../services/reportsService';

interface ReportsListProps {
  onBackToForm: () => void;
  onEditReport: (reportId: string) => void;
}

export default function ReportsList({ onBackToForm, onEditReport }: ReportsListProps) {
  const { email, clearEmail } = useEmail();
  const [reports, setReports] = useState<ReportSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      if (!email) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getAllReports(email);
        setReports(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();
  }, [email]);

  const handleChangeEmail = () => {
    clearEmail();
  };

  const handleToggleActive = async (reportId: string, currentlyActive: boolean) => {
    setActionLoading(reportId);
    try {
      const updatedReport = await toggleReportActive(reportId, email, currentlyActive);
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId ? updatedReport : report
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update report status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reportId: string, isActive: boolean) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    setActionLoading(reportId);
    try {
      await deleteReport(reportId, email, isActive);
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (reportId: string) => {
    onEditReport(reportId);
  };

  const formatFrequency = (freq: string) => {
    return freq.charAt(0).toUpperCase() + freq.slice(1);
  };

  const formatDayOfWeek = (day?: number | null) => {
    if (day === undefined || day === null) return null;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const formatTime = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDateRange = (dateRange: string | null) => {
    if (!dateRange) return 'Not specified';
    return dateRange.replace('last_', 'Last ').replace('_days', ' days').replace('_day', ' day');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/10 to-transparent blur-xl"></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/image.png" alt="Drug Comparison" className="h-14" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Reports</h1>
              <p className="text-slate-600 mt-1">View all your configured report schedules</p>
            </div>
          </div>
          {email && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-slate-500">Logged in as</p>
                <p className="text-sm font-medium text-slate-700">{email}</p>
              </div>
              <button
                onClick={handleChangeEmail}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Change Email</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onBackToForm}
          className="mb-6 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Configuration</span>
        </button>

        {error && (
          <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Reports Configured</h3>
            <p className="text-slate-600 mb-6">You haven't set up any report configurations yet.</p>
            <button
              onClick={onBackToForm}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Create Your First Report
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{report.report_name}</h3>
                      <p className="text-sm text-slate-600">
                        Configured {formatDateTime(report.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {report.is_active ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-semibold rounded-full">
                        Inactive
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(report.id, report.is_active ?? true)}
                        disabled={actionLoading === report.id}
                        className={`p-2 rounded-lg transition-all ${
                          report.is_active
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } ${actionLoading === report.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={report.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(report.id)}
                        disabled={actionLoading === report.id}
                        className={`p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all ${
                          actionLoading === report.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(report.id, report.is_active ?? true)}
                        disabled={actionLoading === report.id}
                        className={`p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all ${
                          actionLoading === report.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700">{report.person_name}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div className="text-slate-700">
                            {Array.isArray(report.contact_email)
                              ? report.contact_email.filter(e => e).join(', ')
                              : report.contact_email}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Hash className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700">{report.customer_id}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Date Range</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700">{formatDateRange(report.date_range)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Delivery Schedule</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700">{formatFrequency(report.frequency)}</span>
                        </div>
                        {report.frequency === 'weekly' && report.delivery_day_of_week !== undefined && report.delivery_day_of_week !== null && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700">{formatDayOfWeek(report.delivery_day_of_week)}</span>
                          </div>
                        )}
                        {report.frequency === 'monthly' && report.delivery_day_of_month && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700">
                              Day {report.delivery_day_of_month} of month
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700">{formatTime(report.delivery_time_hour)}</span>
                        </div>
                      </div>
                    </div>

                    {report.apply_loss_threshold && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Loss Thresholds</h4>
                        <div className="space-y-2">
                          {report.total_loss_per_order_pack && (
                            <div className="text-sm text-slate-700">
                              Total Loss/Order: {report.total_loss_per_order_pack}
                            </div>
                          )}
                          {report.loss_per_ordered_pack && (
                            <div className="text-sm text-slate-700">
                              Loss/Ordered Pack: {report.loss_per_ordered_pack}
                            </div>
                          )}
                          {report.grand_total_loss && (
                            <div className="text-sm text-slate-700">
                              Grand Total Loss: {report.grand_total_loss}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {report.send_notification_no_data && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Notifications</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Bell className="w-4 h-4 text-blue-600" />
                            Notify when no data matches
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@drugcomparison.co.uk" className="text-blue-600 hover:text-blue-700 font-medium">
              support@drugcomparison.co.uk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
