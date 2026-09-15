import React from 'react';
import { CompanySettings, Invoice, PaymentStatus, User } from '../types';
import { InvoiceSheet } from '../components/InvoiceSheet';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Maximize2,
  Printer,
  Receipt,
  UserCheck
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

interface InvoiceDetailPageProps {
  invoice: Invoice;
  settings: CompanySettings;
  currentUser: User;
  onBack: () => void;
  onEdit: (invoice: Invoice) => void;
  onOpenPdfModal: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onUpdateStatus: (invoiceId: string, status: PaymentStatus) => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export const InvoiceDetailPage: React.FC<InvoiceDetailPageProps> = ({
  invoice,
  settings,
  currentUser,
  onBack,
  onEdit,
  onOpenPdfModal,
  onPrintInvoice,
  onUpdateStatus,
  onOpenPaymentModal,
}) => {
  const total = invoice.total || 0;
  const paid = invoice.paid_amount || 0;
  const due = Math.max(0, total - paid);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Action Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Back to invoices"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-[#0F3B2C] bg-emerald-50 px-2.5 py-0.5 rounded">
                {invoice.invoice_number}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                Created on {formatDate(invoice.invoice_date)} by {invoice.created_by}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display mt-0.5">
              Invoice for {invoice.customer.name}
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Payment breakdown badge & modal button */}
          <button
            type="button"
            onClick={() => onOpenPaymentModal(invoice)}
            className="px-3.5 py-2 text-xs font-bold text-[#0F3B2C] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Receipt className="w-4 h-4 text-[#0F3B2C]" />
            <span>Payments & Collections</span>
            {due > 0 ? (
              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] rounded-md font-bold">
                Due: {formatCurrency(due)}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] rounded-md font-bold">
                Paid In Full
              </span>
            )}
          </button>

          {/* Quick status dropdown */}
          <div className="relative">
            <select
              value={invoice.payment_status}
              onChange={(e) => onUpdateStatus(invoice.id, e.target.value as PaymentStatus)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border ${
                invoice.payment_status === 'paid'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : invoice.payment_status === 'partial'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <option value="unpaid">Status: Unpaid</option>
              <option value="partial">Status: Partial</option>
              <option value="paid">Status: Paid</option>
              <option value="overdue">Status: Overdue</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => onEdit(invoice)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Edit className="w-4 h-4 text-slate-600" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onPrintInvoice(invoice)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPdfModal(invoice)}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0F3B2C] hover:bg-[#154d3a] rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Save PDF</span>
          </button>
        </div>
      </div>

      {/* Invoice Document Centered View */}
      <div className="bg-slate-200/60 rounded-3xl p-4 sm:p-8 border border-slate-300 flex justify-center shadow-inner no-print">
        <div className="max-w-[794px] w-full">
          <InvoiceSheet
            invoice={invoice}
            settings={settings}
            scale={1}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
};
