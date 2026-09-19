import React, { useState, useEffect, useMemo } from 'react';
import { CompanySettings, Customer, Invoice, InvoiceItem, PaymentStatus, User } from '../types';
import { InvoiceSheet } from '../components/InvoiceSheet';
import { formatCurrency, generateNextInvoiceNumber, getTodayDateString, numberToWords } from '../utils/formatters';
import { getSafeNextInvoiceNumber } from '../lib/supabase';
import {
  AlertCircle,
  Calendar,
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Maximize2,
  Minimize2,
  Plus,
  Printer,
  Save,
  Trash2,
  UserPlus,
  Users,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface CreateInvoicePageProps {
  settings: CompanySettings;
  customers: Customer[];
  currentUser: User;
  editingInvoice?: Invoice | null;
  onSaveInvoice: (invoice: Invoice, newCustomer?: Customer) => void;
  onOpenPdfModal: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onCancel: () => void;
}

export const CreateInvoicePage: React.FC<CreateInvoicePageProps> = ({
  settings,
  customers,
  currentUser,
  editingInvoice,
  onSaveInvoice,
  onOpenPdfModal,
  onPrintInvoice,
  onCancel,
}) => {
  // Mode: creating or editing
  const isEditing = !!editingInvoice;

  // Invoice Meta State
  const [invoiceNumber, setInvoiceNumber] = useState(
    editingInvoice?.invoice_number || generateNextInvoiceNumber(settings.invoice_prefix, settings.next_invoice_number)
  );
  const [invoiceDate, setInvoiceDate] = useState(editingInvoice?.invoice_date || getTodayDateString());
  const [dueDate, setDueDate] = useState(
    editingInvoice?.due_date ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    editingInvoice?.payment_status || 'unpaid'
  );
  const [notes, setNotes] = useState(editingInvoice?.notes || settings.default_notes || '');
  const [terms, setTerms] = useState(editingInvoice?.terms || settings.default_terms || '');
  const [accountManager, setAccountManager] = useState(
    editingInvoice?.account_manager || settings.account_manager_name || 'Account Manager'
  );

  // Invoice Creator State (auto-filled with logged-in user name e.g. Mr. X)
  const [createdBy, setCreatedBy] = useState<string>(
    editingInvoice?.created_by || currentUser.name || ''
  );

  useEffect(() => {
    if (!editingInvoice && currentUser?.name) {
      setCreatedBy(currentUser.name);
    }
  }, [currentUser?.name, editingInvoice]);

  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    editingInvoice?.customer_id || (customers.length > 0 ? customers[0].id : 'new')
  );

  const [customerName, setCustomerName] = useState(editingInvoice?.customer?.name || '');
  const [companyName, setCompanyName] = useState(editingInvoice?.customer?.company_name || '');
  const [customerAddress, setCustomerAddress] = useState(editingInvoice?.customer?.address || '');
  const [customerPhone, setCustomerPhone] = useState(editingInvoice?.customer?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(editingInvoice?.customer?.email || '');

  // Line items state
  const [items, setItems] = useState<InvoiceItem[]>(
    editingInvoice?.items && editingInvoice.items.length > 0
      ? editingInvoice.items
      : [
          {
            id: 'item-1',
            item_name: 'Strategic Consultancy Service',
            description: 'Corporate business assessment and operational strategy roadmap',
            quantity: 1,
            unit_price: 35000,
            discount: 0,
            total: 35000,
          },
        ]
  );

  const [overallDiscount, setOverallDiscount] = useState<number>(editingInvoice?.discount || 0);

  // UI state
  const [previewScale, setPreviewScale] = useState<number>(0.85);
  const [fullscreenPreview, setFullscreenPreview] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [activeTabMobile, setActiveTabMobile] = useState<'form' | 'preview'>('form');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Concurrency-safe automatic numbering on mount
  useEffect(() => {
    if (!editingInvoice) {
      let isMounted = true;
      getSafeNextInvoiceNumber(settings.invoice_prefix).then((safeNum) => {
        if (isMounted && safeNum) {
          setInvoiceNumber(safeNum);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [editingInvoice, settings.invoice_prefix]);

  // Handle customer auto-population
  useEffect(() => {
    if (selectedCustomerId && selectedCustomerId !== 'new') {
      const found = customers.find((c) => c.id === selectedCustomerId);
      if (found) {
        setCustomerName(found.name);
        setCompanyName(found.company_name || '');
        setCustomerAddress(found.address);
        setCustomerPhone(found.phone);
        setCustomerEmail(found.email);
      }
    } else if (selectedCustomerId === 'new' && !editingInvoice) {
      setCustomerName('');
      setCompanyName('');
      setCustomerAddress('');
      setCustomerPhone('');
      setCustomerEmail('');
    }
  }, [selectedCustomerId, customers, editingInvoice]);

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    const tot = subtotal - (overallDiscount || 0);
    return Math.max(0, tot);
  }, [subtotal, overallDiscount]);

  const inWords = useMemo(() => {
    return numberToWords(grandTotal, settings.currency === 'BDT' ? 'Taka' : settings.currency);
  }, [grandTotal, settings.currency]);

  // Current Live Invoice Object for Preview & Saving
  const currentLiveInvoice: Invoice = useMemo(() => {
    return {
      id: editingInvoice?.id || `inv-${Date.now()}`,
      invoice_number: invoiceNumber,
      customer_id: selectedCustomerId,
      customer: {
        id: selectedCustomerId === 'new' ? `cust-${Date.now()}` : selectedCustomerId,
        name: customerName || 'Valued Client',
        company_name: companyName,
        address: customerAddress || 'Panthapath, Dhaka',
        phone: customerPhone,
        email: customerEmail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      invoice_date: invoiceDate,
      due_date: dueDate,
      items: items,
      subtotal: subtotal,
      discount: overallDiscount,
      total: grandTotal,
      in_words: inWords,
      payment_status: paymentStatus,
      notes: notes,
      terms: terms,
      account_manager: accountManager,
      created_by: (createdBy && createdBy.trim()) || currentUser.name,
      updated_by: currentUser.name,
      created_at: editingInvoice?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }, [
    editingInvoice,
    invoiceNumber,
    selectedCustomerId,
    customerName,
    companyName,
    customerAddress,
    customerPhone,
    customerEmail,
    invoiceDate,
    dueDate,
    items,
    subtotal,
    overallDiscount,
    grandTotal,
    inWords,
    paymentStatus,
    notes,
    terms,
    accountManager,
    createdBy,
    currentUser.name,
  ]);

  // Item Table Handlers
  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === 'quantity' || field === 'unit_price' || field === 'discount') {
      const numVal = typeof value === 'string' ? parseFloat(value) || 0 : value;
      (item as any)[field] = numVal;

      // Recalculate item total
      const qty = field === 'quantity' ? numVal : item.quantity;
      const price = field === 'unit_price' ? numVal : item.unit_price;
      const disc = field === 'discount' ? numVal : item.discount;
      item.total = Math.max(0, qty * price - disc);
    } else {
      (item as any)[field] = value;
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${items.length + 1}`,
      item_name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const handleDuplicateItem = (index: number) => {
    const target = items[index];
    const duplicated: InvoiceItem = {
      ...target,
      id: `item-${Date.now()}-${Math.random()}`,
      item_name: `${target.item_name} (Copy)`,
    };
    const updated = [...items];
    updated.splice(index + 1, 0, duplicated);
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      // Keep at least one empty item
      setItems([
        {
          id: `item-${Date.now()}`,
          item_name: '',
          description: '',
          quantity: 1,
          unit_price: 0,
          discount: 0,
          total: 0,
        },
      ]);
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // Form Validation & Save
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!customerName.trim()) {
      errors.customerName = 'Customer/Client name is required.';
    }
    if (!invoiceNumber.trim()) {
      errors.invoiceNumber = 'Invoice number is required.';
    }
    if (!invoiceDate) {
      errors.invoiceDate = 'Invoice date is required.';
    }

    const hasValidItem = items.some(
      (item) => item.item_name.trim() !== '' && item.quantity > 0
    );
    if (!hasValidItem) {
      errors.items = 'Please specify at least one valid item name with quantity > 0.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!validateForm()) {
      // Scroll to top or switch tab
      setActiveTabMobile('form');
      return;
    }

    setIsSaving(true);
    try {
      let newCustomerObj: Customer | undefined;
      if (selectedCustomerId === 'new') {
        newCustomerObj = {
          id: `cust-${Date.now()}`,
          name: customerName.trim(),
          company_name: companyName.trim(),
          address: customerAddress.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          total_invoices: 1,
          total_spent: grandTotal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      await onSaveInvoice(currentLiveInvoice, newCustomerObj);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto space-y-6">
      {/* Top Header & Fast Action Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F3B2C] bg-emerald-50 px-2.5 py-1 rounded-md">
              {isEditing ? 'Edit Mode' : 'New Invoice'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Created by {currentUser.name}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display mt-1">
            {isEditing ? `Edit Invoice (${editingInvoice.invoice_number})` : 'Create New Invoice'}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onPrintInvoice(currentLiveInvoice)}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenPdfModal(currentLiveInvoice)}
            className="px-4 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Save PDF</span>
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-extrabold text-white bg-[#0F3B2C] hover:bg-[#154d3a] active:bg-[#0a271d] rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving to Database...' : isEditing ? 'Update Invoice' : 'Save Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher (Form vs Live Preview) */}
      <div className="lg:hidden flex bg-slate-200/80 p-1 rounded-xl no-print">
        <button
          type="button"
          onClick={() => setActiveTabMobile('form')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTabMobile === 'form'
              ? 'bg-white text-[#0F3B2C] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Invoice Details & Items
        </button>
        <button
          type="button"
          onClick={() => setActiveTabMobile('preview')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTabMobile === 'preview'
              ? 'bg-white text-[#0F3B2C] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Live A4 Preview
        </button>
      </div>

      {/* Main Two-Column Layout (Form on Left, Live Preview on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Forms */}
        <div
          className={`lg:col-span-6 xl:col-span-6 space-y-6 ${
            activeTabMobile === 'form' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Validation Alert */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Please complete required fields:</span>
              </div>
              <ul className="list-disc list-inside text-rose-700 pl-1 space-y-0.5">
                {Object.values(validationErrors).map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 1. Invoice Metadata Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0F3B2C]" />
                <span>Invoice Date & Creator</span>
              </h2>
              <span className="text-xs font-semibold text-[#0F3B2C] bg-emerald-50 px-2.5 py-1 rounded-lg">
                A4 Document
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Invoice Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Invoice Creator / Generated By
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    placeholder="e.g. Mr. X"
                    className="w-full pr-28 pl-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] transition-all"
                  />
                  <div className="absolute right-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md pointer-events-none">
                    Logged-in User
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Prints at the bottom of the invoice receipt: <span className="font-semibold text-slate-700">"This invoice was generated by Consultant By D'Rex"</span> • Internal record tracks creator: <span className="font-semibold text-slate-700">{createdBy || currentUser.name}</span>
                </p>
              </div>
            </div>
          </div>

          {/* 2. Customer Information Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0F3B2C]" />
                <span>Customer Information (Invoice To)</span>
              </h2>

              {customers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCustomerId(selectedCustomerId === 'new' ? customers[0].id : 'new')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  {selectedCustomerId === 'new' ? (
                    <>
                      <Users className="w-3.5 h-3.5" />
                      <span>Select Existing Client</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add New Client</span>
                    </>
                  )}
                </button>
              )}

            </div>

            {/* Customer Dropdown */}
            {selectedCustomerId !== 'new' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Select Existing Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company_name ? `(${c.company_name})` : ''} - {c.phone}
                    </option>
                  ))}
                  <option value="new">+ Enter New Customer Manually</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Client / Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter client or customer name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company or organization name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 01700-000000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Location / Address (Appears on Invoice To)
                </label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter client address / location"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] transition-all"
                />
              </div>

            </div>
          </div>

          {/* 3. Product / Service Items Table */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Product / Service Items
                </h2>
                <p className="text-xs text-slate-500">
                  Add lines for consultancy fees, services, or billable items
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-1.5 bg-[#0F3B2C] hover:bg-[#154d3a] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Items Dynamic List */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0F3B2C] bg-white px-2 py-0.5 rounded border border-slate-200">
                      SL {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Duplicate line"
                        onClick={() => handleDuplicateItem(index)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Remove line"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-7">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Service Title / Description <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                        placeholder="e.g. Strategic Management Consultation"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                      />
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Detailed note / milestone breakdown (optional)"
                        className="w-full mt-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Fee / Unit Price ({settings.currency_symbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                      />
                      <div className="text-right text-[11px] font-extrabold text-[#0F3B2C] mt-1.5">
                        Total: {formatCurrency(item.total, settings.currency_symbol)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-[#0F3B2C] text-slate-600 hover:text-[#0F3B2C] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Item / Service</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Live Invoice Preview (A4 Dimensions) */}
        <div
          className={`lg:col-span-6 xl:col-span-6 space-y-4 ${
            activeTabMobile === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Live Preview Bar with Zoom & Action Controls */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Live A4 Preview
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewScale((s) => Math.max(0.5, s - 0.1))}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-600 w-12 text-center">
                {Math.round(previewScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setPreviewScale((s) => Math.min(1.2, s + 0.1))}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setFullscreenPreview(true)}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors ml-1"
                title="Full Screen Preview"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sticky Canvas Container */}
          <div className="bg-slate-200/70 rounded-2xl p-3 sm:p-6 border border-slate-300/80 overflow-x-auto flex justify-center sticky top-6 shadow-inner">
            <div
              style={{
                width: `${794 * previewScale}px`,
                minHeight: `${1123 * previewScale}px`,
                transition: 'width 0.15s ease, min-height 0.15s ease',
              }}
            >
              <InvoiceSheet
                invoice={currentLiveInvoice}
                settings={settings}
                scale={previewScale}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {fullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col p-4 sm:p-6 overflow-y-auto no-print">
          <div className="flex items-center justify-between pb-4 max-w-[850px] mx-auto w-full text-white">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg">Focused Invoice Preview</span>
              <span className="text-xs bg-emerald-700/80 px-2.5 py-0.5 rounded-full font-semibold">
                {currentLiveInvoice.invoice_number}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onPrintInvoice(currentLiveInvoice)}
                className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenPdfModal(currentLiveInvoice)}
                className="px-3.5 py-1.5 bg-[#7EA64B] hover:bg-[#8ebb54] text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Save PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setFullscreenPreview(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center py-4">
            <div className="max-w-[794px] w-full">
              <InvoiceSheet
                invoice={currentLiveInvoice}
                settings={settings}
                scale={1}
                currentUser={currentUser}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
