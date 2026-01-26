export interface ReportConfiguration {
  id?: string;
  person_name: string;
  contact_email: string[];
  customer_id: string;
  report_name?: string;
  report_type: string;
  date_range: DateRange;
  apply_loss_threshold: boolean;
  total_loss_per_order_pack?: number;
  loss_per_ordered_pack?: number;
  grand_total_loss?: number;
  frequency: Frequency;
  delivery_day_of_week?: number;
  delivery_day_of_month?: number;
  delivery_time_hour: number;
  send_notification_no_data: boolean;
  is_active: boolean;
}

export type Frequency = 'daily' | 'weekly' | 'monthly';
export type DateRange =
  | 'last_1_days' | 'last_2_days' | 'last_3_days' | 'last_4_days' | 'last_5_days'
  | 'last_6_days' | 'last_7_days' | 'last_8_days' | 'last_9_days' | 'last_10_days'
  | 'last_11_days' | 'last_12_days' | 'last_13_days' | 'last_14_days' | 'last_15_days'
  | 'last_16_days' | 'last_17_days' | 'last_18_days' | 'last_19_days' | 'last_20_days'
  | 'last_21_days' | 'last_22_days' | 'last_23_days' | 'last_24_days' | 'last_25_days'
  | 'last_26_days' | 'last_27_days' | 'last_28_days' | 'last_29_days' | 'last_30_days'
  | 'last_31_days';
