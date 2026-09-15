import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CompanySettings, Customer, Invoice, InvoiceItem, PassportReceipt, Payment, PaymentStatus, User } from '../types';
import { INITIAL_COMPANY_SETTINGS, INITIAL_CUSTOMERS, INITIAL_INVOICES, INITIAL_PASSPORT_RECEIPTS, INITIAL_USERS } from '../data/initialData';

export const getSupabaseConfig = (): { url: string; key: string; isConfigured: boolean } => {
  let url = '';
  let key = '';
  try {
    const localUrl = localStorage.getItem('DREX_SUPABASE_URL');
    const localKey = localStorage.getItem('DREX_SUPABASE_KEY');
    if (localUrl && localUrl.trim()) url = localUrl.trim();
    if (localKey && localKey.trim()) key = localKey.trim();
  } catch {}

  if (!url) {
    const metaEnv = (import.meta as any).env || {};
    url =
      metaEnv.VITE_SUPABASE_URL ||
      metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
      metaEnv.SUPABASE_URL ||
      'https://zoaxnquifsvarilfetym.supabase.co';
  }
  if (!key) {
    const metaEnv = (import.meta as any).env || {};
    key =
      metaEnv.VITE_SUPABASE_ANON_KEY ||
      metaEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      metaEnv.SUPABASE_ANON_KEY ||
      metaEnv.SUPABASE_PUBLISHABLE_KEY ||
      'sb_publishable_y3Pzns_J6PWUgTJXvfMTbA_GkxGFN39';
  }

  const isConfigured =
    typeof url === 'string' &&
    url.trim() !== '' &&
    !url.includes('your-project-id') &&
    typeof key === 'string' &&
    key.trim() !== '' &&
    !key.includes('your-anon-key');

  return { url, key, isConfigured };
};

const activeConfig = getSupabaseConfig();
const supabaseUrl = activeConfig.url;
const supabaseAnonKey = activeConfig.key;

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig().isConfigured;
};

export const saveSupabaseCredentials = (url: string, key: string): void => {
  try {
    localStorage.setItem('DREX_SUPABASE_URL', url.trim());
    localStorage.setItem('DREX_SUPABASE_KEY', key.trim());
    window.location.reload();
  } catch (e) {
    console.error('Failed to save Supabase credentials to localStorage', e);
  }
};

export const clearSupabaseCredentials = (): void => {
  try {
    localStorage.removeItem('DREX_SUPABASE_URL');
    localStorage.removeItem('DREX_SUPABASE_KEY');
    window.location.reload();
  } catch (e) {
    console.error('Failed to clear Supabase credentials', e);
  }
};

// Create Supabase Client safely
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// ==============================================================================
// AUTHENTICATION SERVICES
// ==============================================================================

export async function supabaseSignIn(email: string, password: string):Promise<{ user: User | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Demo mode: match against initial users or create temporary session
    const matched = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      return { user: matched, error: null };
    }
    return {
      user: {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].replace(/[._]/g, ' '),
        email: email.trim(),
        role: 'staff',
        avatar: email.substring(0, 2).toUpperCase(),
      },
      error: null,
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'User account not found.' };
    }

    // Fetch user profile from public.profiles
    const profile = await getUserProfile(data.user.id, data.user.email || email);
    return { user: profile, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Login failed. Please check network connection.' };
  }
}

export async function supabaseSignUp(
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'manager' | 'staff' = 'staff'
): Promise<{ user: User | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: name.substring(0, 2).toUpperCase(),
    };
    return { user: newUser, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          role,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Registration could not be completed.' };
    }

    // Upsert into public.profiles to ensure profile exists
    const { error: profError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      name: name.trim(),
      email: email.trim(),
      role: role,
      avatar: name.substring(0, 2).toUpperCase(),
      updated_at: new Date().toISOString(),
    });

    if (profError) {
      console.warn('Profile creation note:', profError.message);
    }

    const newUser: User = {
      id: data.user.id,
      name: name.trim(),
      email: email.trim(),
      role: role,
      avatar: name.substring(0, 2).toUpperCase(),
    };

    return { user: newUser, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Registration failed.' };
  }
}

export async function supabaseSignOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    }
  }
}

export async function getCurrentUserProfile(): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    return await getUserProfile(session.user.id, session.user.email || '');
  } catch (err) {
    console.error('Error fetching session:', err);
    return null;
  }
}

async function getUserProfile(userId: string, email: string): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data && !error) {
      return {
        id: data.id,
        name: data.name || email.split('@')[0],
        email: data.email || email,
        role: data.role || 'staff',
        avatar: data.avatar || (data.name ? data.name.substring(0, 2).toUpperCase() : 'US'),
        created_at: data.created_at,
      };
    }
  } catch (e) {
    console.error('Profile fetch failed:', e);
  }

  return {
    id: userId,
    name: email.split('@')[0].replace(/[._]/g, ' '),
    email,
    role: 'staff',
    avatar: email.substring(0, 2).toUpperCase(),
  };
}

// ==============================================================================
// COMPANY SETTINGS SERVICES
// ==============================================================================

export async function dbFetchCompanySettings(): Promise<CompanySettings> {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem('drex_company_settings');
    return local ? JSON.parse(local) : INITIAL_COMPANY_SETTINGS;
  }

  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      return INITIAL_COMPANY_SETTINGS;
    }

    return {
      company_name: data.company_name || INITIAL_COMPANY_SETTINGS.company_name,
      sub_title: data.sub_title || INITIAL_COMPANY_SETTINGS.sub_title,
      branch: data.branch || INITIAL_COMPANY_SETTINGS.branch,
      address: data.address || INITIAL_COMPANY_SETTINGS.address,
      phone: data.phone || INITIAL_COMPANY_SETTINGS.phone,
      whatsapp: data.whatsapp || INITIAL_COMPANY_SETTINGS.whatsapp,
      email: data.email || INITIAL_COMPANY_SETTINGS.email,
      website: data.website || INITIAL_COMPANY_SETTINGS.website,
      currency: data.currency || 'BDT',
      currency_symbol: data.currency_symbol || '৳',
      invoice_prefix: data.invoice_prefix || 'INV-2026-',
      next_invoice_number: data.next_invoice_number || 1001,
      account_manager_name: data.account_manager_name || 'Account Manager',
      account_manager_title: data.account_manager_title || 'Authorized Signature',
      default_notes: data.default_notes || '',
      default_terms: data.default_terms || '',
      logo_url: data.logo_url,
    };
  } catch (err) {
    console.error('Error fetching settings:', err);
    return INITIAL_COMPANY_SETTINGS;
  }
}

export async function dbUpdateCompanySettings(settings: CompanySettings): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    localStorage.setItem('drex_company_settings', JSON.stringify(settings));
    return { success: true };
  }

  try {
    const { error } = await supabase.from('company_settings').upsert({
      id: 1,
      company_name: settings.company_name,
      sub_title: settings.sub_title,
      branch: settings.branch,
      address: settings.address,
      phone: settings.phone,
      whatsapp: settings.whatsapp,
      email: settings.email,
      website: settings.website,
      currency: settings.currency,
      currency_symbol: settings.currency_symbol,
      invoice_prefix: settings.invoice_prefix,
      next_invoice_number: settings.next_invoice_number,
      account_manager_name: settings.account_manager_name,
      account_manager_title: settings.account_manager_title,
      default_notes: settings.default_notes,
      default_terms: settings.default_terms,
      logo_url: settings.logo_url,
      updated_at: new Date().toISOString(),
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update company settings.' };
  }
}

export const dbFetchSettings = dbFetchCompanySettings;
export const dbSaveSettings = dbUpdateCompanySettings;

// ==============================================================================
// CUSTOMERS SERVICES
// ==============================================================================

export async function dbFetchCustomers(): Promise<Customer[]> {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem('drex_customers');
    return local ? JSON.parse(local) : INITIAL_CUSTOMERS;
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return [];
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      company_name: c.company_name || '',
      address: c.address || '',
      phone: c.phone || '',
      email: c.email || '',
      total_invoices: c.total_invoices || 0,
      total_spent: Number(c.total_spent || 0),
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));
  } catch (err) {
    console.error('Customer fetch error:', err);
    return [];
  }
}

export async function dbSaveCustomer(
  customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'> & { id?: string },
  user?: User
): Promise<{ success: boolean; customer: Customer | null; error?: string }> {
  if (!isSupabaseConfigured()) {
    const newCust: Customer = {
      ...customer,
      id: customer.id || `cust-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_invoices: 0,
      total_spent: 0,
    };
    return { success: true, customer: newCust };
  }

  try {
    if (customer.id && !customer.id.startsWith('cust-')) {
      // Update existing
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: customer.name.trim(),
          company_name: customer.company_name?.trim() || null,
          address: customer.address.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', customer.id)
        .select()
        .single();

      if (error) return { success: false, customer: null, error: error.message };
      return {
        success: true,
        customer: {
          id: data.id,
          name: data.name,
          company_name: data.company_name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          total_invoices: data.total_invoices || 0,
          total_spent: Number(data.total_spent || 0),
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name.trim(),
          company_name: customer.company_name?.trim() || null,
          address: customer.address.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim(),
          created_by: user?.name || 'Staff',
        })
        .select()
        .single();

      if (error) return { success: false, customer: null, error: error.message };
      return {
        success: true,
        customer: {
          id: data.id,
          name: data.name,
          company_name: data.company_name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          total_invoices: 0,
          total_spent: 0,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    }
  } catch (err: any) {
    return { success: false, customer: null, error: err.message || 'Failed to save customer.' };
  }
}

export async function dbDeleteCustomer(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete customer.' };
  }
}

// ==============================================================================
// INVOICE & INVOICE ITEMS SERVICES
// ==============================================================================

export async function dbFetchInvoices(): Promise<Invoice[]> {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem('drex_invoices');
    return local ? JSON.parse(local) : INITIAL_INVOICES;
  }

  try {
    // Query invoices with items and payments in one batch
    const { data: invRows, error: invError } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*),
        payments (*)
      `)
      .order('invoice_date', { ascending: false });

    if (invError) {
      console.error('Error fetching invoices from Supabase:', invError);
      return [];
    }

    return (invRows || []).map((row: any) => {
      const items: InvoiceItem[] = (row.invoice_items || [])
        .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((it: any) => ({
          id: it.id,
          item_name: it.item_name,
          description: it.description || '',
          quantity: Number(it.quantity || 1),
          unit_price: Number(it.unit_price || 0),
          discount: Number(it.discount || 0),
          total: Number(it.total || 0),
        }));

      const payments: Payment[] = (row.payments || [])
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((p: any) => ({
          id: p.id,
          invoice_id: p.invoice_id,
          amount: Number(p.amount || 0),
          payment_date: p.payment_date,
          payment_method: p.payment_method || 'Cash',
          reference_no: p.reference_no || '',
          notes: p.notes || '',
          received_by: p.received_by || '',
          created_by_id: p.created_by_id,
          created_at: p.created_at,
        }));

      const customer: Customer = row.customer_data || {
        id: row.customer_id || 'cust-unknown',
        name: 'Valued Client',
        address: '',
        phone: '',
        email: '',
        created_at: row.created_at,
        updated_at: row.updated_at,
      };

      const paidAmount = Number(row.paid_amount || 0);
      const totalAmount = Number(row.total || 0);
      const dueAmount = Math.max(0, totalAmount - paidAmount);

      return {
        id: row.id,
        invoice_number: row.invoice_number,
        customer_id: row.customer_id,
        customer,
        invoice_date: row.invoice_date,
        due_date: row.due_date,
        items,
        subtotal: Number(row.subtotal || 0),
        discount: Number(row.discount || 0),
        total: totalAmount,
        paid_amount: paidAmount,
        due_amount: dueAmount,
        payments,
        in_words: row.in_words,
        payment_status: row.payment_status as PaymentStatus,
        notes: row.notes || '',
        terms: row.terms || '',
        account_manager: row.account_manager || '',
        created_by: row.created_by || 'Staff',
        created_by_id: row.created_by_id,
        updated_by: row.updated_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });
  } catch (err) {
    console.error('Invoice fetch error:', err);
    return [];
  }
}

// Concurrency-safe atomic invoice number generator
export async function getSafeNextInvoiceNumber(prefix: string = 'INV-2026-'): Promise<string> {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem('drex_company_settings');
    const settings = local ? JSON.parse(local) : INITIAL_COMPANY_SETTINGS;
    return `${prefix}${String(settings.next_invoice_number || 1001).padStart(4, '0')}`;
  }

  try {
    // 1. Try calling the PostgreSQL function
    const { data, error } = await supabase.rpc('get_next_invoice_number', {
      prefix_param: prefix,
    });

    if (!error && data) {
      return data;
    }

    // 2. Fallback: query highest invoice number
    const { data: invData } = await supabase
      .from('invoices')
      .select('invoice_number')
      .ilike('invoice_number', `${prefix}%`)
      .order('invoice_number', { ascending: false })
      .limit(1);

    if (invData && invData.length > 0) {
      const highest = invData[0].invoice_number;
      const numPart = parseInt(highest.replace(prefix, ''), 10);
      if (!isNaN(numPart)) {
        return `${prefix}${String(numPart + 1).padStart(4, '0')}`;
      }
    }

    return `${prefix}1001`;
  } catch (err) {
    console.error('Invoice sequence generation fallback:', err);
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }
}

export async function dbSaveInvoice(
  invoice: Invoice,
  currentUser?: User
): Promise<{ success: boolean; invoice: Invoice | null; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, invoice };
  }

  try {
    const isExisting = invoice.id && !invoice.id.startsWith('inv-temp-') && !invoice.id.startsWith('inv-100');

    // Clean customer data snapshot
    const customerSnapshot = {
      id: invoice.customer.id,
      name: invoice.customer.name,
      company_name: invoice.customer.company_name || '',
      address: invoice.customer.address,
      phone: invoice.customer.phone,
      email: invoice.customer.email,
    };

    let invoiceId = invoice.id;
    let finalInvoiceNumber = invoice.invoice_number;

    if (isExisting) {
      // Update invoice record
      const { error: updateErr } = await supabase
        .from('invoices')
        .update({
          customer_id: invoice.customer_id && !invoice.customer_id.startsWith('cust-') ? invoice.customer_id : null,
          customer_data: customerSnapshot,
          invoice_date: invoice.invoice_date,
          due_date: invoice.due_date,
          subtotal: invoice.subtotal,
          discount: invoice.discount,
          total: invoice.total,
          due_amount: Math.max(0, invoice.total - (invoice.paid_amount || 0)),
          in_words: invoice.in_words,
          payment_status: invoice.payment_status,
          notes: invoice.notes,
          terms: invoice.terms,
          account_manager: invoice.account_manager,
          updated_by: currentUser?.name || 'Staff',
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId);

      if (updateErr) return { success: false, invoice: null, error: updateErr.message };

      // Replace items
      await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId);
    } else {
      // Create new invoice with concurrency safety
      const { data: inserted, error: insertErr } = await supabase
        .from('invoices')
        .insert({
          invoice_number: finalInvoiceNumber,
          customer_id: invoice.customer_id && !invoice.customer_id.startsWith('cust-') ? invoice.customer_id : null,
          customer_data: customerSnapshot,
          invoice_date: invoice.invoice_date,
          due_date: invoice.due_date,
          subtotal: invoice.subtotal,
          discount: invoice.discount,
          total: invoice.total,
          paid_amount: 0,
          due_amount: invoice.total,
          in_words: invoice.in_words,
          payment_status: invoice.payment_status || 'unpaid',
          notes: invoice.notes,
          terms: invoice.terms,
          account_manager: invoice.account_manager,
          created_by: currentUser?.name || invoice.created_by || 'Staff',
          created_by_id: currentUser?.id && currentUser.id.includes('-') && currentUser.id.length > 30 ? currentUser.id : null,
        })
        .select()
        .single();

      if (insertErr) {
        // If unique constraint violated on invoice number, retry with atomic sequence
        if (insertErr.code === '23505') {
          const newNumber = await getSafeNextInvoiceNumber();
          finalInvoiceNumber = newNumber;
          const { data: retryData, error: retryErr } = await supabase
            .from('invoices')
            .insert({
              invoice_number: finalInvoiceNumber,
              customer_id: invoice.customer_id && !invoice.customer_id.startsWith('cust-') ? invoice.customer_id : null,
              customer_data: customerSnapshot,
              invoice_date: invoice.invoice_date,
              due_date: invoice.due_date,
              subtotal: invoice.subtotal,
              discount: invoice.discount,
              total: invoice.total,
              paid_amount: 0,
              due_amount: invoice.total,
              in_words: invoice.in_words,
              payment_status: invoice.payment_status || 'unpaid',
              notes: invoice.notes,
              terms: invoice.terms,
              account_manager: invoice.account_manager,
              created_by: currentUser?.name || invoice.created_by || 'Staff',
              created_by_id: currentUser?.id && currentUser.id.includes('-') && currentUser.id.length > 30 ? currentUser.id : null,
            })
            .select()
            .single();

          if (retryErr) return { success: false, invoice: null, error: retryErr.message };
          invoiceId = retryData.id;
        } else {
          return { success: false, invoice: null, error: insertErr.message };
        }
      } else {
        invoiceId = inserted.id;
      }
    }

    // Insert invoice items
    const itemsToInsert = invoice.items.map((it, idx) => ({
      invoice_id: invoiceId,
      item_name: it.item_name,
      description: it.description || null,
      quantity: it.quantity,
      unit_price: it.unit_price,
      discount: it.discount,
      total: it.total,
      sort_order: idx,
    }));

    if (itemsToInsert.length > 0) {
      const { error: itemErr } = await supabase.from('invoice_items').insert(itemsToInsert);
      if (itemErr) {
        console.error('Invoice items insert error:', itemErr);
      }
    }

    // Update customer's total invoice count
    if (invoice.customer_id && !invoice.customer_id.startsWith('cust-')) {
      try {
        const { count } = await supabase
          .from('invoices')
          .select('id', { count: 'exact', head: true })
          .eq('customer_id', invoice.customer_id);

        if (count !== null) {
          await supabase
            .from('customers')
            .update({ total_invoices: count })
            .eq('id', invoice.customer_id);
        }
      } catch (cErr) {
        console.warn('Customer stats update note:', cErr);
      }
    }

    const savedInvoice: Invoice = {
      ...invoice,
      id: invoiceId,
      invoice_number: finalInvoiceNumber,
    };

    return { success: true, invoice: savedInvoice };
  } catch (err: any) {
    return { success: false, invoice: null, error: err.message || 'Failed to save invoice.' };
  }
}

export async function dbDeleteInvoice(invoiceId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete invoice.' };
  }
}

export async function dbUpdateInvoicePaymentStatus(
  invoiceId: string,
  status: PaymentStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('invoices')
      .update({ payment_status: status, updated_at: new Date().toISOString() })
      .eq('id', invoiceId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update payment status.' };
  }
}

// ==============================================================================
// PAYMENTS SERVICES
// ==============================================================================

export async function dbAddPayment(
  paramsOrInvoiceId:
    | {
        invoice_id: string;
        amount: number;
        payment_date: string;
        payment_method: string;
        reference_no?: string;
        notes?: string;
        received_by?: string;
        created_by_id?: string;
      }
    | string,
  amountArg?: number,
  paymentDateArg?: string,
  paymentMethodArg?: string,
  referenceNoArg?: string,
  notesArg?: string,
  currentUserArg?: User
): Promise<{ success: boolean; payment: Payment | null; error?: string }> {
  let invoiceId: string;
  let amount: number;
  let paymentDate: string;
  let paymentMethod: string;
  let referenceNo: string;
  let notes: string;
  let receivedBy: string;
  let createdById: string | null = null;

  if (typeof paramsOrInvoiceId === 'object') {
    invoiceId = paramsOrInvoiceId.invoice_id;
    amount = paramsOrInvoiceId.amount;
    paymentDate = paramsOrInvoiceId.payment_date;
    paymentMethod = paramsOrInvoiceId.payment_method;
    referenceNo = paramsOrInvoiceId.reference_no || '';
    notes = paramsOrInvoiceId.notes || '';
    receivedBy = paramsOrInvoiceId.received_by || 'Staff';
    createdById = paramsOrInvoiceId.created_by_id || null;
  } else {
    invoiceId = paramsOrInvoiceId;
    amount = amountArg || 0;
    paymentDate = paymentDateArg || new Date().toISOString().split('T')[0];
    paymentMethod = paymentMethodArg || 'Cash';
    referenceNo = referenceNoArg || '';
    notes = notesArg || '';
    receivedBy = currentUserArg?.name || 'Staff';
    createdById = currentUserArg?.id || null;
  }

  if (!isSupabaseConfigured()) {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoice_id: invoiceId,
      amount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_no: referenceNo,
      notes,
      received_by: receivedBy,
      created_at: new Date().toISOString(),
    };
    return { success: true, payment: newPayment };
  }

  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        amount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_no: referenceNo || null,
        notes: notes || null,
        received_by: receivedBy,
        created_by_id: createdById && createdById.includes('-') && createdById.length > 30 ? createdById : null,
      })
      .select()
      .single();

    if (error) return { success: false, payment: null, error: error.message };

    return {
      success: true,
      payment: {
        id: data.id,
        invoice_id: data.invoice_id,
        amount: Number(data.amount),
        payment_date: data.payment_date,
        payment_method: data.payment_method,
        reference_no: data.reference_no || '',
        notes: data.notes || '',
        received_by: data.received_by || receivedBy,
        created_at: data.created_at,
      },
    };
  } catch (err: any) {
    return { success: false, payment: null, error: err.message || 'Failed to record payment.' };
  }
}

export async function dbDeletePayment(paymentId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('payments').delete().eq('id', paymentId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete payment.' };
  }
}

// ==============================================================================
// PASSPORT RECEIPTS SERVICES (পাসপোর্ট জমা রসিদ)
// ==============================================================================

const PASSPORT_STORAGE_KEY = 'drex_passport_receipts';

export async function dbFetchPassportReceipts(): Promise<{ receipts: PassportReceipt[]; error?: string }> {
  if (!isSupabaseConfigured()) {
    try {
      const stored = localStorage.getItem(PASSPORT_STORAGE_KEY);
      if (stored) {
        return { receipts: JSON.parse(stored) };
      }
      localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(INITIAL_PASSPORT_RECEIPTS));
      return { receipts: INITIAL_PASSPORT_RECEIPTS };
    } catch {
      return { receipts: INITIAL_PASSPORT_RECEIPTS };
    }
  }

  try {
    const { data, error } = await supabase
      .from('passport_receipts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase passport_receipts fetch failed, using local storage fallback:', error.message);
      const stored = localStorage.getItem(PASSPORT_STORAGE_KEY);
      if (stored) {
        return { receipts: JSON.parse(stored) };
      }
      return { receipts: INITIAL_PASSPORT_RECEIPTS };
    }

    const receipts: PassportReceipt[] = (data || []).map((r: any) => ({
      id: r.id,
      receipt_number: r.receipt_number,
      date: r.date,
      client_name: r.client_name,
      passport_number: r.passport_number,
      mobile_number: r.mobile_number || '',
      email: r.email || undefined,
      customer_id: r.customer_id || undefined,
      service_purpose: r.service_purpose,
      passport_received_date: r.passport_received_date,
      passport_status: r.passport_status,
      received_by: r.received_by,
      received_by_id: r.received_by_id || undefined,
      notes: r.notes || undefined,
      returned_date: r.returned_date || undefined,
      returned_by: r.returned_by || undefined,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    // Cache to localStorage
    try {
      localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(receipts));
    } catch {}

    return { receipts };
  } catch (err: any) {
    const stored = localStorage.getItem(PASSPORT_STORAGE_KEY);
    return {
      receipts: stored ? JSON.parse(stored) : INITIAL_PASSPORT_RECEIPTS,
      error: err.message,
    };
  }
}

export async function dbSavePassportReceipt(
  receipt: PassportReceipt
): Promise<{ success: boolean; error?: string }> {
  // Always update local cache for instant UI feedback & offline safety
  try {
    const stored = localStorage.getItem(PASSPORT_STORAGE_KEY);
    const existing: PassportReceipt[] = stored ? JSON.parse(stored) : [...INITIAL_PASSPORT_RECEIPTS];
    const index = existing.findIndex((r) => r.id === receipt.id);
    let updatedList: PassportReceipt[];
    if (index >= 0) {
      updatedList = existing.map((r, i) => (i === index ? receipt : r));
    } else {
      updatedList = [receipt, ...existing];
    }
    localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.warn('Local storage write warning:', e);
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const payload = {
      id: receipt.id,
      receipt_number: receipt.receipt_number,
      date: receipt.date,
      client_name: receipt.client_name,
      passport_number: receipt.passport_number,
      mobile_number: receipt.mobile_number || null,
      email: receipt.email || null,
      customer_id:
        receipt.customer_id &&
        !receipt.customer_id.startsWith('cust-') &&
        receipt.customer_id.length > 20
          ? receipt.customer_id
          : null,
      service_purpose: receipt.service_purpose,
      passport_received_date: receipt.passport_received_date,
      passport_status: receipt.passport_status,
      received_by: receipt.received_by,
      received_by_id:
        receipt.received_by_id &&
        !receipt.received_by_id.startsWith('user-') &&
        receipt.received_by_id.length > 20
          ? receipt.received_by_id
          : null,
      notes: receipt.notes || null,
      returned_date: receipt.returned_date || null,
      returned_by: receipt.returned_by || null,
      created_at: receipt.created_at,
      updated_at: receipt.updated_at,
    };

    const { error } = await supabase.from('passport_receipts').upsert(payload);
    if (error) {
      console.warn('Supabase passport receipt upsert failed, stored in local cache:', error.message);
      return { success: true };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Supabase passport receipt error:', err.message);
    return { success: true };
  }
}

export async function dbDeletePassportReceipt(
  receiptId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const stored = localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (stored) {
      const existing: PassportReceipt[] = JSON.parse(stored);
      const filtered = existing.filter((r) => r.id !== receiptId);
      localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (e) {}

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { error } = await supabase.from('passport_receipts').delete().eq('id', receiptId);
    if (error) {
      console.warn('Supabase delete error:', error.message);
      return { success: true };
    }
    return { success: true };
  } catch (err: any) {
    return { success: true };
  }
}

// ==============================================================================
// REALTIME SUBSCRIPTION
// ==============================================================================

export function setupRealtimeSubscriptions(onDataChanged: (table: string) => void): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  const channel = supabase
    .channel('public-office-data')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'invoices' },
      () => onDataChanged('invoices')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'customers' },
      () => onDataChanged('customers')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'payments' },
      () => onDataChanged('payments')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'company_settings' },
      () => onDataChanged('company_settings')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'passport_receipts' },
      () => onDataChanged('passport_receipts')
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
