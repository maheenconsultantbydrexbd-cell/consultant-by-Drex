-- ==============================================================================
-- D'REX SUITE — SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS)
-- Run this complete script in your Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create User Profiles Table (mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')) DEFAULT 'staff',
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to handle new user registration automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
    UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)) FROM 1 FOR 2))
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when new user signs up in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Create Company Settings Table (Single central configuration)
CREATE TABLE IF NOT EXISTS public.company_settings (
  id INT PRIMARY KEY DEFAULT 1,
  company_name TEXT NOT NULL DEFAULT 'Consultant',
  sub_title TEXT NOT NULL DEFAULT 'By D''Rex',
  branch TEXT NOT NULL DEFAULT 'Dhaka Branch',
  address TEXT NOT NULL DEFAULT 'LEVEL 6, 44-F8, Panthapath, Dhaka 1250',
  phone TEXT NOT NULL DEFAULT '01622-785981',
  whatsapp TEXT NOT NULL DEFAULT '+8801622785981',
  email TEXT NOT NULL DEFAULT 'consultantbydrexbd@gmail.com',
  website TEXT NOT NULL DEFAULT 'www.consultantbydrex.com',
  currency TEXT NOT NULL DEFAULT 'BDT',
  currency_symbol TEXT NOT NULL DEFAULT '৳',
  invoice_prefix TEXT NOT NULL DEFAULT 'INV-2026-',
  next_invoice_number INT NOT NULL DEFAULT 1001,
  account_manager_name TEXT NOT NULL DEFAULT 'Account Manager',
  account_manager_title TEXT NOT NULL DEFAULT 'Authorized Signature',
  default_notes TEXT DEFAULT '',
  default_terms TEXT DEFAULT '',
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default company settings if not exists
INSERT INTO public.company_settings (id, company_name, sub_title, branch, address, phone, whatsapp, email, website, currency, currency_symbol, invoice_prefix, next_invoice_number)
VALUES (1, 'Consultant', 'By D''Rex', 'Dhaka Branch', 'LEVEL 6, 44-F8, Panthapath, Dhaka 1250', '01622-785981', '+8801622785981', 'consultantbydrexbd@gmail.com', 'www.consultantbydrex.com', 'BDT', '৳', 'INV-2026-', 1001)
ON CONFLICT (id) DO NOTHING;

-- 4. Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  total_invoices INT DEFAULT 0,
  total_spent NUMERIC(15, 2) DEFAULT 0.00,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Safe Concurrency Invoice Sequence & Generator Function
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.get_next_invoice_number(prefix_param TEXT DEFAULT 'INV-2026-')
RETURNS TEXT AS $$
DECLARE
  next_val BIGINT;
BEGIN
  SELECT nextval('public.invoice_number_seq') INTO next_val;
  RETURN prefix_param || lpad(next_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_data JSONB NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  due_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  in_words TEXT,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overdue')),
  notes TEXT,
  terms TEXT,
  account_manager TEXT,
  created_by TEXT NOT NULL,
  created_by_id UUID REFERENCES auth.users(id),
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Invoice Items Table
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 1.00,
  unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  reference_no TEXT,
  notes TEXT,
  received_by TEXT,
  created_by_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Automatic Trigger to recalculate Invoice Paid/Due and Payment Status on Payments change
CREATE OR REPLACE FUNCTION public.sync_invoice_payments()
RETURNS TRIGGER AS $$
DECLARE
  target_invoice_id UUID;
  new_paid NUMERIC(15, 2);
  inv_total NUMERIC(15, 2);
  new_due NUMERIC(15, 2);
  new_status TEXT;
  cust_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_invoice_id := OLD.invoice_id;
  ELSE
    target_invoice_id := NEW.invoice_id;
  END IF;

  -- Calculate sum of payments
  SELECT COALESCE(SUM(amount), 0.00) INTO new_paid
  FROM public.payments
  WHERE invoice_id = target_invoice_id;

  -- Get invoice total & customer id
  SELECT total, customer_id INTO inv_total, cust_id
  FROM public.invoices
  WHERE id = target_invoice_id;

  IF inv_total IS NOT NULL THEN
    new_due := GREATEST(0.00, inv_total - new_paid);
    
    IF new_paid >= inv_total THEN
      new_status := 'paid';
    ELSIF new_paid > 0 THEN
      new_status := 'partial';
    ELSE
      new_status := 'unpaid';
    END IF;

    UPDATE public.invoices
    SET
      paid_amount = new_paid,
      due_amount = new_due,
      payment_status = new_status,
      updated_at = NOW()
    WHERE id = target_invoice_id;

    -- Update customer total spent
    IF cust_id IS NOT NULL THEN
      UPDATE public.customers
      SET
        total_spent = (
          SELECT COALESCE(SUM(paid_amount), 0.00)
          FROM public.invoices
          WHERE customer_id = cust_id
        ),
        updated_at = NOW()
      WHERE id = cust_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_payments ON public.payments;
CREATE TRIGGER trigger_sync_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_payments();

-- 10. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 11. Helper function for RLS user role inspection
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies:
-- Any authenticated user can read profiles (to see colleagues' names and avatars)
CREATE POLICY "Allow read profiles for authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- User can update their own profile; admins can update any profile
CREATE POLICY "Allow update own profile or admin update"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.current_user_role() = 'admin');

-- Company Settings Policies:
-- Any authenticated employee or login visitor can read company settings
CREATE POLICY "Allow read company settings"
  ON public.company_settings FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only Admin can update company settings
CREATE POLICY "Allow admin update company settings"
  ON public.company_settings FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- Customers Policies:
-- All authenticated users (Admin, Manager, Staff) can view customers
CREATE POLICY "Allow read customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create & edit customers
CREATE POLICY "Allow insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (true);

-- Only Admin & Manager can delete customers
CREATE POLICY "Allow delete customers"
  ON public.customers FOR DELETE
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'));

-- Invoices Policies:
-- All authenticated users can view invoices
CREATE POLICY "Allow read invoices"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create invoices
CREATE POLICY "Allow insert invoices"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- All authenticated users can update invoices
CREATE POLICY "Allow update invoices"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (true);

-- Only Admin & Manager can delete invoices
CREATE POLICY "Allow delete invoices"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'));

-- Invoice Items Policies:
CREATE POLICY "Allow read invoice items"
  ON public.invoice_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert invoice items"
  ON public.invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update invoice items"
  ON public.invoice_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow delete invoice items"
  ON public.invoice_items FOR DELETE
  TO authenticated
  USING (true);

-- Payments Policies:
-- All authenticated users can read payments
CREATE POLICY "Allow read payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can record payments
CREATE POLICY "Allow insert payments"
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only Admin & Manager can delete payments
CREATE POLICY "Allow delete payments"
  ON public.payments FOR DELETE
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'));

-- ==============================================================================
-- 12. Passport Receipts Table (পাসপোর্ট জমা রসিদ)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.passport_receipts (
  id TEXT PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_name TEXT NOT NULL,
  passport_number TEXT NOT NULL,
  mobile_number TEXT,
  email TEXT,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  service_purpose TEXT NOT NULL DEFAULT 'India Visa Processing for Portugal Workpermit',
  passport_received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  passport_status TEXT NOT NULL CHECK (passport_status IN ('Received', 'With Office', 'Returned')) DEFAULT 'With Office',
  received_by TEXT NOT NULL,
  received_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  returned_date DATE,
  returned_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.passport_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read passport_receipts"
  ON public.passport_receipts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert passport_receipts"
  ON public.passport_receipts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update passport_receipts"
  ON public.passport_receipts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow delete passport_receipts"
  ON public.passport_receipts FOR DELETE
  TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'));

-- 13. Enable Realtime Publications for all collaborative tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.passport_receipts;
