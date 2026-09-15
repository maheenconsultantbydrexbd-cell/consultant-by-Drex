import React, { useState } from 'react';
import { CompanySettings, Invoice, PassportReceipt, PaymentStatus, User } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FilePlus,
  FileText,
  Filter,
  Plus,
  Printer,
  Receipt,
  Search,
  TrendingUp,
  UserCheck,
  Users
} from 'lucide-react';

interface DashboardPageProps {
  invoices: Invoice[];
  passportReceipts?: PassportReceipt[];
  settings: CompanySettings;
  currentUser: User;
  onNavigateTab: (tab: any) => void;
  onSelectInvoice: (invoice: Invoice) => void;
  onOpenPdfModal: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onOpenPaymentModal?: (invoice: Invoice) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  invoices,
  passportReceipts = [],
  settings,
  currentUser,
  onNavigateTab,
  onSelectInvoice,
  onOpenPdfModal,
  onPrintInvoice,
  onEditInvoice,
  onOpenPaymentModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // KPI Computations
  const totalInvoicesCount = invoices.length;
  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const todayInvoices = invoices.filter((inv) => inv.invoice_date?.startsWith(todayStr));
  const todayAmount = todayInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  const monthInvoices = invoices.filter((inv) => inv.invoice_date?.startsWith(currentMonthStr));
  const monthAmount = monthInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  const paidInvoices = invoices.filter((inv) => inv.payment_status === 'paid');
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  // Filtered recent invoices
  const filteredInvoices = invoices
    .filter((inv) => {
      const matchSearch =
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'all' || inv.payment_status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.created_at || b.invoice_date).getTime() - new Date(a.created_at || a.invoice_date).getTime());

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner with Welcome Greeting & Quick CTA */}
      <div className="bg-gradient-to-r from-[#0F3B2C] to-[#17523f] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Welcome back, {currentUser.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Company Invoices Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1">
            {settings.company_name} — {settings.branch} ({settings.address})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('passport-receipts')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/5 text-white text-sm font-bold rounded-xl border border-white/20 flex items-center gap-2 transition-all shadow-xs"
          >
            <FileCheck2 className="w-4 h-4 text-[#7EA64B]" />
            <span>Passport Receipts</span>
            {passportReceipts.filter((r) => r.passport_status === 'With Office').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">
                {passportReceipts.filter((r) => r.passport_status === 'With Office').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('create-invoice')}
            className="px-5 py-2.5 bg-[#7EA64B] hover:bg-[#8ebb54] active:bg-[#6f9440] text-white text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Invoice</span>
          </button>
        </div>
      </div>

      {/* 4 Main Metrics / KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoices */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Invoices
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#0F3B2C] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 font-display">
            {totalInvoicesCount}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{paidInvoices.length} paid fully</span>
          </div>
        </div>

        {/* Today's Invoices */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today's Invoices
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 font-display">
            {todayInvoices.length}
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
            <span>Amount:</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(todayAmount, settings.currency_symbol)}
            </span>
          </div>
        </div>

        {/* Monthly Invoices */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Invoices
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 font-display">
            {monthInvoices.length}
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
            <span>Month billed:</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(monthAmount, settings.currency_symbol)}
            </span>
          </div>
        </div>

        {/* Total Billed Revenue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Invoiced Value
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#7EA64B] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#0F3B2C] mt-3 font-display truncate">
            {formatCurrency(totalInvoiceAmount, settings.currency_symbol)}
          </p>
          <div className="flex items-center gap-1 text-xs text-emerald-700 mt-2 font-medium">
            <span>Collected: {formatCurrency(paidAmount, settings.currency_symbol)}</span>
          </div>
        </div>
      </div>

      {/* Recent Invoices Section with Search, Filters & Action Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Recent Invoices
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage, preview, print, or download invoices generated by your team
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search invoice or client..."
                className="w-full sm:w-64 pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-8 pr-7 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="overdue">Overdue</option>
                </select>
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="overflow-x-auto">
          {filteredInvoices.length > 0 ? (
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 font-bold">Invoice No</th>
                  <th className="py-3.5 px-4 font-bold">Customer / Client</th>
                  <th className="py-3.5 px-4 font-bold">Date</th>
                  <th className="py-3.5 px-4 font-bold text-right">Amount</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold">Created By</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectInvoice(inv)}
                  >
                    <td className="py-3.5 px-4 font-bold text-[#0F3B2C] whitespace-nowrap">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{inv.customer.name}</div>
                      {inv.customer.company_name && (
                        <div className="text-[11px] text-slate-500">
                          {inv.customer.company_name}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {formatDate(inv.invoice_date)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                      {formatCurrency(inv.total, settings.currency_symbol)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          inv.payment_status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : inv.payment_status === 'partial'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : inv.payment_status === 'overdue'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                      <span className="font-medium">{inv.created_by}</span>
                    </td>
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenPaymentModal && (
                          <button
                            type="button"
                            title="Payments & Collections"
                            onClick={() => onOpenPaymentModal(inv)}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="View Invoice"
                          onClick={() => onSelectInvoice(inv)}
                          className="p-1.5 text-slate-600 hover:text-[#0F3B2C] hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Print Invoice"
                          onClick={() => onPrintInvoice(inv)}
                          className="p-1.5 text-slate-600 hover:text-[#0F3B2C] hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Save as PDF"
                          onClick={() => onOpenPdfModal(inv)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 font-display">
                No invoices found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No invoices match your current search or filter criteria.'
                  : 'Start by creating your first company invoice.'}
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('create-invoice')}
                className="px-4 py-2 bg-[#0F3B2C] hover:bg-[#154d3a] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Invoice</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
