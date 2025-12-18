import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, FileText, Filter, Calendar, Save, RotateCcw, CheckCircle, Info, LogOut, Building2, Mail, Hash, Clock, TrendingDown, Bell, List, Tag, Plus, X, Send } from 'lucide-react';
import type { ReportConfiguration, Frequency, DateRange } from '../types/reportConfig';
import { useEmail } from '../contexts/EmailContext';
import { createReport, updateReport, getReportById } from '../services/reportsService';

const WEBHOOK_URL = 'https://co-contracting.app.n8n.cloud/webhook-test/0c4610d6-8f85-4e16-8139-58237e206178';
const TEST_MAIL_WEBHOOK_URL = 'https://co-contracting.app.n8n.cloud/webhook/a369fc77-a1ea-40f6-a314-10c9c39ebfc2';

interface ReportConfigFormProps {
  onViewReports: () => void;
  editingReportId?: string | null;
  onClearEdit: () => void;
}

export default function ReportConfigForm({ onViewReports, editingReportId, onClearEdit }: ReportConfigFormProps) {
  const { email, clearEmail } = useEmail();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReportConfiguration>({
    defaultValues: {
      person_name: '',
      contact_email: [''],
      customer_id: '',
      report_name: '',
      report_type: 'Pack Optimization Loss Report',
      date_range: 'last_1_days',
      apply_loss_threshold: false,
      frequency: 'daily',
      delivery_time_hour: 7,
      send_notification_no_data: false,
      is_active: true,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);
  const [editingIsActive, setEditingIsActive] = useState(true);

  const watchAllFields = watch();
  const watchApplyThreshold = watch('apply_loss_threshold');
  const watchFrequency = watch('frequency');
  const watchEmails = watch('contact_email');

  useEffect(() => {
    async function loadEditingReport() {
      if (editingReportId && editingReportId !== currentEditingId) {
        setIsLoadingPreferences(true);
        try {
          const report = await getReportById(editingReportId, email);
          if (report) {
            setValue('person_name', report.person_name);
            const emails = Array.isArray(report.contact_email)
              ? report.contact_email
              : report.contact_email ? [report.contact_email] : [''];
            setValue('contact_email', emails.length > 0 ? emails : ['']);
            setValue('customer_id', report.customer_id);
            setValue('report_name', report.report_name);
            setValue('report_type', report.report_type);
            setValue('date_range', (report.date_range || 'last_1_days') as DateRange);
            setValue('apply_loss_threshold', report.apply_loss_threshold);
            setValue('total_loss_per_order_pack', report.total_loss_per_order_pack ?? undefined);
            setValue('loss_per_ordered_pack', report.loss_per_ordered_pack ?? undefined);
            setValue('grand_total_loss', report.grand_total_loss ?? undefined);
            setValue('frequency', report.frequency as Frequency);
            setValue('delivery_day_of_week', report.delivery_day_of_week ?? undefined);
            setValue('delivery_day_of_month', report.delivery_day_of_month ?? undefined);
            setValue('delivery_time_hour', report.delivery_time_hour);
            setValue('send_notification_no_data', report.send_notification_no_data);
            setEditingIsActive(report.is_active ?? true);
            setCurrentEditingId(editingReportId);
          }
        } catch (error) {
          console.error('Error loading report for editing:', error);
        } finally {
          setIsLoadingPreferences(false);
        }
      } else if (!editingReportId && currentEditingId) {
        setCurrentEditingId(null);
        setEditingIsActive(true);
      }
    }

    loadEditingReport();
  }, [editingReportId, currentEditingId, setValue]);

  useEffect(() => {
    if (!editingReportId) {
      const savedDraft = localStorage.getItem('reportConfigDraft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          Object.keys(draft).forEach((key) => {
            setValue(key as keyof ReportConfiguration, draft[key]);
          });
        } catch (e) {
          console.error('Error parsing draft:', e);
        }
      }
    }
  }, [editingReportId, setValue]);

  const handleSaveDraft = () => {
    localStorage.setItem('reportConfigDraft', JSON.stringify(watchAllFields));
    setSubmitMessage({ type: 'success', text: 'Draft saved successfully!' });
    setTimeout(() => setSubmitMessage(null), 3000);
  };

  const handleReset = () => {
    reset();
    localStorage.removeItem('reportConfigDraft');
    setShowSummary(false);
  };

  const handleSendTestMail = async () => {
    if (!email) {
      setSubmitMessage({ type: 'error', text: 'Email is required' });
      return;
    }

    const data = watchAllFields;
    const filteredEmails = (data.contact_email || []).filter(e => e && e.trim() !== '');

    if (filteredEmails.length === 0) {
      setSubmitMessage({ type: 'error', text: 'At least one contact email is required' });
      return;
    }

    if (!data.person_name) {
      setSubmitMessage({ type: 'error', text: 'Person name is required' });
      return;
    }

    if (!data.customer_id) {
      setSubmitMessage({ type: 'error', text: 'Customer ID is required' });
      return;
    }

    setIsSendingTestMail(true);
    setSubmitMessage(null);

    try {
      const testMailData = {
        email: email,
        report_name: data.report_name || 'Test Report',
        person_name: data.person_name,
        contact_email: filteredEmails,
        customer_id: data.customer_id,
        report_type: data.report_type,
        date_range: data.date_range,
        apply_loss_threshold: data.apply_loss_threshold,
        total_loss_per_order_pack: data.total_loss_per_order_pack || null,
        loss_per_ordered_pack: data.loss_per_ordered_pack || null,
        grand_total_loss: data.grand_total_loss || null,
        frequency: data.frequency,
        delivery_day_of_week: data.frequency === 'weekly' && data.delivery_day_of_week !== undefined && data.delivery_day_of_week !== ''
          ? Number(data.delivery_day_of_week)
          : null,
        delivery_day_of_month: data.frequency === 'monthly' && data.delivery_day_of_month !== undefined && data.delivery_day_of_month !== ''
          ? Number(data.delivery_day_of_month)
          : null,
        delivery_time_hour: Number(data.delivery_time_hour),
        send_notification_no_data: data.send_notification_no_data,
        is_test: true,
      };

      const response = await fetch(TEST_MAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMailData),
      });

      if (response.ok) {
        setSubmitMessage({ type: 'success', text: 'Test mail sent successfully!' });
      } else {
        setSubmitMessage({ type: 'error', text: 'Failed to send test mail' });
      }
    } catch (error) {
      console.error('Test mail error:', error);
      setSubmitMessage({ type: 'error', text: 'Failed to send test mail' });
    } finally {
      setIsSendingTestMail(false);
      setTimeout(() => setSubmitMessage(null), 5000);
    }
  };

  const onSubmit = async (data: ReportConfiguration) => {
    if (!email) {
      setSubmitMessage({ type: 'error', text: 'Email is required' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      let result;

      if (editingReportId) {
        result = await updateReport(editingReportId, email, data, editingIsActive);
      } else {
        result = await createReport(email, data);
      }

      setSubmitMessage({ type: 'success', text: editingReportId ? 'Report updated successfully!' : 'Report configuration saved successfully!' });
      localStorage.removeItem('reportConfigDraft');
      setShowSummary(true);
      onClearEdit();

      const webhookData = {
        ...data,
        report_id: result.id,
        email: email,
      };

      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      })
        .then((response) => {
          if (!response.ok) {
            console.error('Failed to send data to webhook');
          }
        })
        .catch((error) => {
          console.error('Webhook error:', error);
        });

      setTimeout(() => {
        setShowSummary(false);
        setSubmitMessage(null);
      }, 5000);
    } catch (error: any) {
      setSubmitMessage({ type: 'error', text: error.message || 'Failed to submit configuration' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeEmail = () => {
    clearEmail();
  };

  const addEmailField = () => {
    const currentEmails = watchEmails || [''];
    if (currentEmails.length < 5) {
      setValue('contact_email', [...currentEmails, '']);
    }
  };

  const removeEmailField = (index: number) => {
    const currentEmails = watchEmails || [''];
    if (currentEmails.length > 1) {
      setValue('contact_email', currentEmails.filter((_, i) => i !== index));
    }
  };

  const updateEmailField = (index: number, value: string) => {
    const currentEmails = [...(watchEmails || [''])];
    currentEmails[index] = value;
    setValue('contact_email', currentEmails);
  };

  if (isLoadingPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/10 to-transparent blur-xl"></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/image.png" alt="Drug Comparison" className="h-14" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Data Report Portal</h1>
              <p className="text-slate-600 mt-1">Configure your pharmaceutical reporting preferences</p>
            </div>
          </div>
          {email && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-slate-500">Logged in as</p>
                <p className="text-sm font-medium text-slate-700">{email}</p>
              </div>
              <button
                onClick={onViewReports}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm"
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">My Reports</span>
              </button>
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

        {editingReportId && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Editing Existing Report</p>
                <p className="text-sm text-amber-700">Changes will update the existing report, not create a new one</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClearEdit();
                reset();
              }}
              className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-all font-medium text-sm"
            >
              Cancel Edit
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-lg shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">User Information</h2>
                  <p className="text-sm text-slate-600 mt-0.5">Primary contact details for report delivery</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('person_name', { required: 'Person name is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white ${
                      errors.person_name ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                    placeholder="John Smith"
                  />
                  {errors.person_name && (
                    <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                      <span className="font-medium">{errors.person_name.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    {(watchEmails || ['']).length < 5 && (
                      <button
                        type="button"
                        onClick={addEmailField}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        Add Recipient
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {(watchEmails || ['']).map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => updateEmailField(index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                          placeholder={index === 0 ? "john@example.com" : `Recipient ${index + 1}`}
                        />
                        {(watchEmails || ['']).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEmailField(index)}
                            className="px-3 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all border border-slate-300 hover:border-red-300"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-slate-500" />
                    Customer ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('customer_id', { required: 'Customer ID is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white ${
                      errors.customer_id ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                    placeholder="CUST-12345"
                  />
                  {errors.customer_id && (
                    <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                      <span className="font-medium">{errors.customer_id.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-500" />
                    Report Name
                  </label>
                  <input
                    type="text"
                    {...register('report_name')}
                    className="w-full px-4 py-3 border border-slate-300 hover:border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    placeholder="Monthly Loss Report"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-lg shadow-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Report Configuration</h2>
                  <p className="text-sm text-slate-600 mt-0.5">Select report type and date range</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    Report Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('report_type')}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                  >
                    <option value="Pack Optimization Loss Report">Pack Optimization Loss Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Date Range <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('date_range', { required: true })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((days) => (
                      <option key={days} value={`last_${days}_days`}>
                        Last {days} {days === 1 ? 'day' : 'days'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-lg shadow-sm">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Data Filters</h2>
                  <p className="text-sm text-slate-600 mt-0.5">Apply loss threshold criteria to your reports</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <label className="flex items-start gap-4 p-5 bg-slate-50 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-100 hover:border-blue-300 transition-all group">
                <input
                  type="checkbox"
                  id="apply_loss_threshold"
                  {...register('apply_loss_threshold')}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-semibold text-slate-900">Apply Loss Threshold Filters</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Filter data based on specific loss value thresholds</p>
                </div>
              </label>

              {watchApplyThreshold && (
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200 space-y-6 animate-in fade-in duration-300">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Only include data where loss values are <strong>greater than or equal</strong> to the specified amounts below
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                        Total Loss per Order Pack (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('total_loss_per_order_pack')}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                        Loss per Ordered Pack (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('loss_per_ordered_pack')}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                        Grand Total Loss (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('grand_total_loss')}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-lg shadow-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Report Delivery Schedule</h2>
                  <p className="text-sm text-slate-600 mt-0.5">Configure when and how you receive reports</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Delivery Frequency <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['daily', 'weekly', 'monthly'] as Frequency[]).map((freq) => (
                    <label
                      key={freq}
                      className="relative flex items-center gap-3 p-5 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      <input
                        type="radio"
                        value={freq}
                        {...register('frequency', { required: true })}
                        className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-slate-900 capitalize">{freq}</span>
                    </label>
                  ))}
                </div>
              </div>

              {watchFrequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Delivery Day (Weekly)
                  </label>
                  <select
                    {...register('delivery_day_of_week')}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                  >
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                  </select>
                </div>
              )}

              {watchFrequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Delivery Day of Month
                  </label>
                  <select
                    {...register('delivery_day_of_month')}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Preferred Delivery Time (UK Time) <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('delivery_time_hour', { required: true })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-slate-400"
                >
                  <option value="7">7:00 AM</option>
                  <option value="8">8:00 AM</option>
                  <option value="9">9:00 AM</option>
                  <option value="10">10:00 AM</option>
                  <option value="11">11:00 AM</option>
                  <option value="12">12:00 PM</option>
                  <option value="13">1:00 PM</option>
                  <option value="14">2:00 PM</option>
                  <option value="15">3:00 PM</option>
                  <option value="16">4:00 PM</option>
                  <option value="17">5:00 PM</option>
                  <option value="18">6:00 PM</option>
                  <option value="19">7:00 PM</option>
                  <option value="20">8:00 PM</option>
                  <option value="21">9:00 PM</option>
                </select>
              </div>

              <label className="flex items-start gap-4 p-5 bg-slate-50 rounded-lg border-2 border-slate-200 cursor-pointer hover:bg-slate-100 hover:border-blue-300 transition-all group">
                <input
                  type="checkbox"
                  id="send_notification_no_data"
                  {...register('send_notification_no_data')}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-semibold text-slate-900">Send notification when no data matches</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">Receive email notifications even when filters return no results</p>
                </div>
              </label>
            </div>
          </div>

          {showSummary && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border-2 border-green-200 shadow-sm animate-in fade-in duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-600 p-2.5 rounded-lg shadow-sm">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-green-900">Configuration Summary</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-green-700 mt-1" />
                  <div>
                    <span className="text-sm font-semibold text-green-900 block">Contact</span>
                    <span className="text-sm text-green-700">{watchAllFields.person_name}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-green-700 mt-1" />
                  <div>
                    <span className="text-sm font-semibold text-green-900 block">Email</span>
                    <span className="text-sm text-green-700">{(watchAllFields.contact_email || []).filter(e => e).join(', ')}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hash className="w-4 h-4 text-green-700 mt-1" />
                  <div>
                    <span className="text-sm font-semibold text-green-900 block">Customer ID</span>
                    <span className="text-sm text-green-700">{watchAllFields.customer_id}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-green-700 mt-1" />
                  <div>
                    <span className="text-sm font-semibold text-green-900 block">Report Type</span>
                    <span className="text-sm text-green-700">{watchAllFields.report_type}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-green-700 mt-1" />
                  <div>
                    <span className="text-sm font-semibold text-green-900 block">Date Range</span>
                    <span className="text-sm text-green-700">
                      {watchAllFields.date_range?.replace('last_', 'Last ').replace('_days', ' days').replace('_day', ' day')}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-green-700 mt-1" />
                  <div>
                    <span className="text-sm font-semibold text-green-900 block">Frequency</span>
                    <span className="text-sm text-green-700 capitalize">{watchAllFields.frequency}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {submitMessage && (
            <div
              className={`p-5 rounded-xl text-center font-semibold border-2 shadow-sm ${
                submitMessage.type === 'success'
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-800 border-green-200'
                  : 'bg-gradient-to-br from-red-50 to-rose-50 text-red-800 border-red-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {submitMessage.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
                <span>{submitMessage.text}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 min-w-[200px] text-white px-8 py-4 rounded-lg font-semibold focus:ring-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 ${
                editingReportId
                  ? 'bg-[#EF6603] hover:bg-[#d55a03] focus:ring-orange-300'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-300'
              }`}
            >
              <FileText className="w-5 h-5" />
              {isSubmitting ? (editingReportId ? 'Saving...' : 'Submitting...') : (editingReportId ? 'Save Configuration' : 'Submit Configuration')}
            </button>

            <button
              type="button"
              onClick={handleSendTestMail}
              disabled={isSendingTestMail}
              className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 focus:ring-4 focus:ring-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2.5"
            >
              <Send className="w-5 h-5" />
              {isSendingTestMail ? 'Sending...' : 'Send Test Mail'}
            </button>

            {!editingReportId && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-4 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 focus:ring-4 focus:ring-slate-300 transition-all shadow-md hover:shadow-lg flex items-center gap-2.5"
              >
                <Save className="w-5 h-5" />
                Save Draft
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 hover:border-slate-400 focus:ring-4 focus:ring-slate-200 transition-all flex items-center gap-2.5"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Form
            </button>
          </div>
        </form>

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
