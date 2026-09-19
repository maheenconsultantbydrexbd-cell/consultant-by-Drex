import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, CompanySettings, Customer, Invoice, PassportReceipt, Payment, PaymentStatus, User } from './types';
import {
  INITIAL_COMPANY_SETTINGS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_PASSPORT_RECEIPTS,
  INITIAL_USERS,
} from './data/initialData';
import { Navigation } from './components/Navigation';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateInvoicePage } from './pages/CreateInvoicePage';
import { InvoiceHistoryPage } from './pages/InvoiceHistoryPage';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { PassportReceiptsPage } from './pages/PassportReceiptsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SavePdfModal } from './components/SavePdfModal';
import { PaymentModal } from './components/PaymentModal';
import { SupabaseSetupBanner } from './components/SupabaseSetupBanner';
import { InvoiceSheet } from './components/InvoiceSheet';
import { ToastContainer, ToastMessage } from './components/Toast';
import { printInvoiceDocument } from './utils/printHelper';
import {
  dbAddPayment,
  dbDeleteCustomer,
  dbDeleteInvoice,
  dbDeletePassportReceipt,
  dbDeletePayment,
  dbFetchCustomers,
  dbFetchInvoices,
  dbFetchPassportReceipts,
  dbFetchSettings,
  dbSaveCustomer,
  dbSaveInvoice,
  dbSavePassportReceipt,
  dbSaveSettings,
  isSupabaseConfigured,
  setupRealtimeSubscriptions,
  supabase,
  supabaseSignOut
} from './lib/supabase';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('drex_auth_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('drex_is_authenticated') === 'true';
  });

  // Central Database Data States
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('drex_company_settings');
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    // Check if user has updated to clean state
    const isCleaned = localStorage.getItem('drex_demo_cleaned_v2');
    if (!isCleaned) {
      localStorage.setItem('drex_demo_cleaned_v2', 'true');
      localStorage.removeItem('drex_customers');
      localStorage.removeItem('drex_invoices');
      localStorage.removeItem('drex_passport_receipts');
      localStorage.removeItem('drex_passport_receipts_v2');
      return [];
    }
    const saved = localStorage.getItem('drex_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('drex_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [passportReceipts, setPassportReceipts] = useState<PassportReceipt[]>(() => {
    const saved = localStorage.getItem('drex_passport_receipts');
    return saved ? JSON.parse(saved) : INITIAL_PASSPORT_RECEIPTS;
  });


  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Modal & Print States
  const [pdfModalInvoice, setPdfModalInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Dispatcher
  const showToast = useCallback(
    (type: 'success' | 'error' | 'info', title: string, description?: string) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Central Database Fetcher
  const loadDatabaseData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      setIsLoadingData(true);
      const [fetchedSettings, fetchedCustomers, fetchedInvoices, fetchedReceipts] = await Promise.all([
        dbFetchSettings(),
        dbFetchCustomers(),
        dbFetchInvoices(),
        dbFetchPassportReceipts(),
      ]);

      if (fetchedSettings) {
        setSettings(fetchedSettings);
      }
      if (fetchedCustomers) {
        setCustomers(fetchedCustomers);
      }

      if (fetchedInvoices) {
        setInvoices(fetchedInvoices);
      }
      if (fetchedReceipts?.receipts) {
        setPassportReceipts(fetchedReceipts.receipts);
      }
    } catch (err: any) {
      console.warn('Error fetching from Supabase central database:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initial load and Realtime Subscriptions
  useEffect(() => {
    loadDatabaseData();

    // Setup real-time postgres changes broadcast to all employees
    const unsubscribe = setupRealtimeSubscriptions(() => {
      loadDatabaseData();
    });

    return () => {
      unsubscribe();
    };
  }, [loadDatabaseData]);

  // Supabase Auth session listener
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const userObj: User = {
          id: session.user.id,
          name: profile?.name || session.user.email?.split('@')[0] || 'Team Member',
          email: session.user.email || '',
          role: profile?.role || 'staff',
          avatar: (profile?.name || 'TM').substring(0, 2).toUpperCase(),
        };

        setCurrentUser(userObj);
        setIsAuthenticated(true);
        localStorage.setItem('drex_auth_user', JSON.stringify(userObj));
        localStorage.setItem('drex_is_authenticated', 'true');
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        localStorage.setItem('drex_is_authenticated', 'false');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Keep backup in localStorage in case of offline / preview mode
  useEffect(() => {
    localStorage.setItem('drex_company_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('drex_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('drex_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('drex_passport_receipts', JSON.stringify(passportReceipts));
  }, [passportReceipts]);

  useEffect(() => {
    localStorage.setItem('drex_is_authenticated', String(isAuthenticated));
    if (currentUser) {
      localStorage.setItem('drex_auth_user', JSON.stringify(currentUser));
    }
  }, [isAuthenticated, currentUser]);

  // Keep selectedInvoice fresh if invoices update
  useEffect(() => {
    if (selectedInvoice) {
      const refreshed = invoices.find((inv) => inv.id === selectedInvoice.id);
      if (refreshed) {
        setSelectedInvoice(refreshed);
      }
    }
    if (paymentModalInvoice) {
      const refreshed = invoices.find((inv) => inv.id === paymentModalInvoice.id);
      if (refreshed) {
        setPaymentModalInvoice(refreshed);
      }
    }
  }, [invoices]);

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast('success', `Signed in as ${user.name}`, `${user.role.toUpperCase()} privileges active`);
    // Immediately fetch latest shared central database records
    loadDatabaseData();
  };

  const handleLogout = async () => {
    await supabaseSignOut();
    setIsAuthenticated(false);
    showToast('info', 'Logged out successfully', 'Office session ended.');
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    showToast('info', `Active user: ${user.name} (${user.role.toUpperCase()})`);
  };

  // Central Database Invoices CRUD Handlers
  const handleSaveInvoice = async (invoice: Invoice, newCustomer?: Customer) => {
    try {
      // 1. If new customer, save centrally
      if (newCustomer) {
        setCustomers((prev) => [newCustomer, ...prev]);
        await dbSaveCustomer(newCustomer);
      }

      // 2. Optimistic local update
      const existingIndex = invoices.findIndex((inv) => inv.id === invoice.id);
      let updatedInvoices: Invoice[];

      if (existingIndex >= 0) {
        updatedInvoices = [...invoices];
        updatedInvoices[existingIndex] = {
          ...invoice,
          updated_by: currentUser.name,
          updated_at: new Date().toISOString(),
        };
      } else {
        updatedInvoices = [invoice, ...invoices];
      }
      setInvoices(updatedInvoices);

      // 3. Persist to Supabase central database
      const { success, invoice: savedInv, error } = await dbSaveInvoice(invoice, currentUser);

      if (!success) {
        showToast('error', 'Central Sync Failed', error || 'Failed to save to database');
      } else {
        showToast(
          'success',
          existingIndex >= 0 ? 'Invoice Updated' : 'Invoice Created & Synced',
          `Saved as ${savedInv?.invoice_number || invoice.invoice_number}`
        );
      }

      setEditingInvoice(null);
      setSelectedInvoice(invoice);
      setActiveTab('invoice-preview');
    } catch (err: any) {
      showToast('error', 'Save error', err?.message || 'Could not save invoice');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (currentUser.role === 'staff') {
      showToast('error', 'Permission Denied', 'Staff members cannot delete invoices.');
      return;
    }

    const target = invoices.find((inv) => inv.id === invoiceId);
    setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId));

    const { success, error } = await dbDeleteInvoice(invoiceId);
    if (!success) {
      showToast('error', 'Delete Failed', error || 'Could not delete from database');
    } else {
      showToast('info', 'Invoice Deleted Centrally', target?.invoice_number);
    }

    if (selectedInvoice?.id === invoiceId) {
      setSelectedInvoice(null);
      setActiveTab('invoices');
    }
  };

  const handleUpdatePaymentStatus = async (invoiceId: string, status: PaymentStatus) => {
    const target = invoices.find((inv) => inv.id === invoiceId);
    if (!target) return;

    const updated = { ...target, payment_status: status };
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? updated : inv)));
    if (selectedInvoice?.id === invoiceId) {
      setSelectedInvoice(updated);
    }

    await dbSaveInvoice(updated, currentUser);
    showToast('success', 'Status Updated', `Invoice status is now ${status.toUpperCase()}`);
  };

  // Payment Handlers (Real multi-user payment tracking)
  const handleAddPayment = async (
    invoiceId: string,
    amount: number,
    paymentDate: string,
    paymentMethod: string,
    referenceNo: string,
    notes: string
  ): Promise<boolean> => {
    const { success, payment, error } = await dbAddPayment({
      invoice_id: invoiceId,
      amount,
      payment_date: paymentDate,
      payment_method: paymentMethod,
      reference_no: referenceNo,
      notes,
      received_by: currentUser.name,
    });

    if (success && payment) {
      // Optimistic update
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === invoiceId) {
            const currentPayments = inv.payments || [];
            const newPayments = [payment, ...currentPayments];
            const newPaid = (inv.paid_amount || 0) + amount;
            const newDue = Math.max(0, (inv.total || 0) - newPaid);
            const newStatus: PaymentStatus =
              newDue <= 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';

            return {
              ...inv,
              payments: newPayments,
              paid_amount: newPaid,
              due_amount: newDue,
              payment_status: newStatus,
            };
          }
          return inv;
        })
      );

      showToast('success', 'Payment Recorded', `৳ ${amount} received via ${paymentMethod}`);
      return true;
    } else {
      showToast('error', 'Payment Failed', error || 'Failed to record payment');
      return false;
    }
  };

  const handleDeletePayment = async (paymentId: string): Promise<boolean> => {
    if (currentUser.role === 'staff') {
      showToast('error', 'Permission Denied', 'Staff members cannot delete payment records.');
      return false;
    }

    const { success, error } = await dbDeletePayment(paymentId);
    if (success) {
      loadDatabaseData();
      showToast('info', 'Payment Record Removed');
      return true;
    } else {
      showToast('error', 'Failed', error || 'Could not delete payment');
      return false;
    }
  };

  // Customer Central Handlers
  const handleAddCustomer = async (
    newCustData: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const newCust: Customer = {
      ...newCustData,
      id: `cust-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);

    const { success, error } = await dbSaveCustomer(newCust);
    if (!success) {
      showToast('error', 'Database Error', error || 'Could not save customer centrally');
    } else {
      showToast('success', 'Customer Created Centrally', newCust.name);
    }
  };

  const handleUpdateCustomer = async (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    const { success, error } = await dbSaveCustomer(updated);
    if (!success) {
      showToast('error', 'Database Error', error || 'Could not update customer centrally');
    } else {
      showToast('success', 'Customer Updated Centrally', updated.name);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (currentUser.role === 'staff') {
      showToast('error', 'Permission Denied', 'Staff members cannot delete customer profiles.');
      return;
    }

    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    const { success, error } = await dbDeleteCustomer(customerId);
    if (!success) {
      showToast('error', 'Database Error', error || 'Could not delete customer centrally');
    } else {
      showToast('info', 'Customer Removed Centrally');
    }
  };

  const handleCreateInvoiceForCustomer = (customer: Customer) => {
    setEditingInvoice(null);
    setSelectedInvoice(null);
    setActiveTab('create-invoice');
  };

  // Company Settings Central Handlers
  const handleSaveSettings = async (newSettings: CompanySettings) => {
    if (currentUser.role !== 'admin') {
      showToast('error', 'Permission Denied', 'Only Admins can modify company settings.');
      return;
    }

    setSettings(newSettings);
    const { success, error } = await dbSaveSettings(newSettings);
    if (!success) {
      showToast('error', 'Database Error', error || 'Could not save company settings centrally');
    } else {
      showToast('success', 'Company Settings Updated Centrally', 'Applied for all office users');
    }
  };

  // Print Handler
  const handlePrintInvoice = (invoice: Invoice) => {
    setPrintInvoice(invoice);
    printInvoiceDocument(invoice, settings, currentUser?.name);
  };

  // Edit Trigger
  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setActiveTab('create-invoice');
  };

  // View Trigger
  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActiveTab('invoice-preview');
  };

  // Passport Receipts Handlers (পাসপোর্ট জমা রসিদ)
  const handleSavePassportReceipt = async (receipt: PassportReceipt) => {
    setPassportReceipts((prev) => {
      const idx = prev.findIndex((r) => r.id === receipt.id);
      if (idx >= 0) {
        return prev.map((r, i) => (i === idx ? receipt : r));
      }
      return [receipt, ...prev];
    });

    const { success, error } = await dbSavePassportReceipt(receipt);
    if (!success) {
      showToast('error', 'Database Sync Warning', error || 'Saved to local cache');
    }
  };

  const handleDeletePassportReceipt = async (receiptId: string) => {
    if (currentUser.role === 'staff') {
      showToast('error', 'Permission Denied', 'Staff members cannot delete passport receipts.');
      return;
    }

    setPassportReceipts((prev) => prev.filter((r) => r.id !== receiptId));
    const { success, error } = await dbDeletePassportReceipt(receiptId);
    if (!success) {
      showToast('error', 'Database Sync Warning', error || 'Failed to remove centrally');
    } else {
      showToast('info', 'Receipt Deleted', 'Passport receipt record has been removed.');
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-900">
      {/* Sidebar Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'create-invoice' && activeTab !== 'create-invoice') {
            setEditingInvoice(null);
          }
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        settings={settings}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        invoiceCount={invoices.length}
        passportReceiptCount={passportReceipts.filter((r) => r.passport_status === 'With Office').length}
      />

      {/* Main App Content View Area */}
      <main className="flex-1 overflow-y-auto min-h-screen flex flex-col">
        {/* Supabase Central DB Connection Status Banner */}
        <SupabaseSetupBanner
          onRefresh={loadDatabaseData}
          isRefreshing={isLoadingData}
        />

        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <DashboardPage
              invoices={invoices}
              passportReceipts={passportReceipts}
              settings={settings}
              currentUser={currentUser}
              onNavigateTab={setActiveTab}
              onSelectInvoice={handleSelectInvoice}
              onOpenPdfModal={(inv) => setPdfModalInvoice(inv)}
              onPrintInvoice={handlePrintInvoice}
              onEditInvoice={handleEditInvoice}
              onOpenPaymentModal={(inv) => setPaymentModalInvoice(inv)}
            />
          )}

          {activeTab === 'create-invoice' && (
            <CreateInvoicePage
              settings={settings}
              customers={customers}
              currentUser={currentUser}
              editingInvoice={editingInvoice}
              onSaveInvoice={handleSaveInvoice}
              onOpenPdfModal={(inv) => setPdfModalInvoice(inv)}
              onPrintInvoice={handlePrintInvoice}
              onCancel={() => setActiveTab('invoices')}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceHistoryPage
              invoices={invoices}
              settings={settings}
              currentUser={currentUser}
              onSelectInvoice={handleSelectInvoice}
              onEditInvoice={handleEditInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onOpenPdfModal={(inv) => setPdfModalInvoice(inv)}
              onPrintInvoice={handlePrintInvoice}
              onOpenPaymentModal={(inv) => setPaymentModalInvoice(inv)}
              onCreateNew={() => {
                setEditingInvoice(null);
                setActiveTab('create-invoice');
              }}
            />
          )}

          {activeTab === 'passport-receipts' && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              <PassportReceiptsPage
                receipts={passportReceipts}
                customers={customers}
                settings={settings}
                currentUser={currentUser}
                onSaveReceipt={handleSavePassportReceipt}
                onDeleteReceipt={handleDeletePassportReceipt}
                showToast={showToast}
              />
            </div>
          )}

          {activeTab === 'invoice-preview' && selectedInvoice && (
            <InvoiceDetailPage
              invoice={selectedInvoice}
              settings={settings}
              currentUser={currentUser}
              onBack={() => setActiveTab('invoices')}
              onEdit={handleEditInvoice}
              onOpenPdfModal={(inv) => setPdfModalInvoice(inv)}
              onPrintInvoice={handlePrintInvoice}
              onUpdateStatus={handleUpdatePaymentStatus}
              onOpenPaymentModal={(inv) => setPaymentModalInvoice(inv)}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersPage
              customers={customers}
              invoices={invoices}
              currencySymbol={settings.currency_symbol}
              currentUser={currentUser}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onCreateInvoiceForCustomer={handleCreateInvoiceForCustomer}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              settings={settings}
              currentUser={currentUser}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </div>
      </main>

      {/* Payment Recording & History Modal */}
      {paymentModalInvoice && (
        <PaymentModal
          invoice={paymentModalInvoice}
          currentUser={currentUser}
          onClose={() => setPaymentModalInvoice(null)}
          onAddPayment={handleAddPayment}
          onDeletePayment={handleDeletePayment}
        />
      )}

      {/* Save PDF Modal with Filename Editing */}
      {pdfModalInvoice && (
        <SavePdfModal
          isOpen={!!pdfModalInvoice}
          onClose={() => setPdfModalInvoice(null)}
          invoice={pdfModalInvoice}
          settings={settings}
          currentUser={currentUser}
          onSuccess={(filename) => {
            showToast('success', 'PDF Generated Successfully', filename);
          }}
        />
      )}

      {/* Print Dedicated Container (Hidden on screen, Visible only in @media print) */}
      <div className="hidden print:block print-only-container">
        {printInvoice ? (
          <InvoiceSheet invoice={printInvoice} settings={settings} printMode={true} currentUser={currentUser} />
        ) : selectedInvoice ? (
          <InvoiceSheet invoice={selectedInvoice} settings={settings} printMode={true} currentUser={currentUser} />
        ) : invoices[0] ? (
          <InvoiceSheet invoice={invoices[0]} settings={settings} printMode={true} currentUser={currentUser} />
        ) : null}
      </div>

      {/* Toast Feedback Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
