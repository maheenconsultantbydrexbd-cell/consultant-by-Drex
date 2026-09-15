export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'overdue';
export type UserRole = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  created_at?: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Rocket' | 'Cheque' | 'Card' | string;
  reference_no?: string;
  notes?: string;
  received_by?: string;
  created_by_id?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  company_name?: string;
  address: string;
  phone: string;
  email: string;
  total_invoices?: number;
  total_spent?: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount: number; // in currency or percentage
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer: Customer;
  invoice_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paid_amount?: number;
  due_amount?: number;
  payments?: Payment[];
  in_words?: string;
  payment_status: PaymentStatus;
  notes?: string;
  terms?: string;
  account_manager?: string;
  created_by: string; // User Name
  created_by_id?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  company_name: string;
  sub_title: string;
  tagline?: string;
  branch: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  currency: string;
  currency_symbol: string;
  invoice_prefix: string;
  next_invoice_number: number;
  account_manager_name: string;
  account_manager_title: string;
  default_notes: string;
  default_terms: string;
  invoice_theme?: 'classic_minimal' | 'modern_compact' | 'full_banner';
  logo_url?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_branch?: string;
}

export type PassportStatus = 'Received' | 'With Office' | 'Returned';

export interface PassportReceipt {
  id: string;
  receipt_number: string;
  date: string;
  client_name: string;
  passport_number: string;
  mobile_number: string;
  email?: string;
  customer_id?: string;
  service_purpose: string;
  passport_received_date: string;
  passport_status: PassportStatus;
  received_by: string;
  received_by_id?: string;
  notes?: string;
  returned_date?: string;
  returned_by?: string;
  created_at: string;
  updated_at: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'create-invoice'
  | 'invoices'
  | 'customers'
  | 'passport-receipts'
  | 'settings'
  | 'invoice-preview';
