import React, { useState, useMemo } from 'react';
import { CompanySettings, Invoice, PaymentStatus, User } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  ArrowDownUp,
  Download,
  Edit,
  Eye,
  FilePlus,
  FileText,
  Filter,
  Printer,
  Receipt,
  Search,
  Trash2
} from 'lucide-react';

interface InvoiceHistoryPageProps {
  invoices: Invoice[];
  settings: CompanySettings;
  currentUser: User;
  onSelectInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onOpenPdfModal: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
  onCreateNew: () => void;
}

export const InvoiceHistoryPage: React.FC<InvoiceHistoryPageProps> = ({
  invoices,
  settings,
  currentUser,
  onSelectInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onOpenPdfModal,
  onPrintInvoice,
  onOpenPaymentModal,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'number'>('date-desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const canDelete = currentUser.role === 'admin' || currentUser.role === 'manager';

  const filteredAndSortedInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        const matchesSearch =
          inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.created_by?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || inv.payment_status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime();
        }
        if (sortBy === 'amount-desc') {
          return (b.total || 0) - (a.total || 0);
        }
        if (sortBy === 'amount-asc') {
          return (a.total || 0) - (b.total || 0);
        }
        if (sortBy === 'number') {
          return b.invoice_number.localeCompare(a.invoice_number);
        }
        return 0;
      });
  }, [invoices, searchTerm, statusFilter, sortBy]);

  const handleDelete = (id: string) => {
    onDeleteInvoice(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Invoice History & Archive
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Central office archive • Search, filter, track payments, reprint, or export invoices
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          className="px-5 py-2.5 bg-[#0F3B2C] hover:bg-[#154d3a] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <FilePlus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice #, customer name, company, staff..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-8 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-8 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] appearance-none"
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="number">Invoice Number</option>
            </select>
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredAndSortedInvoices.length > 0 ? (
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Invoice No</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Billed Total</th>
                  <th className="py-3.5 px-4 text-right">Paid / Due</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Created By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedInvoices.map((inv) => {
                  const paid = inv.paid_amount || 0;
                  const due = Math.max(0, (inv.total || 0) - paid);

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onSelectInvoice(inv)}
                    >
                      <td className="py-3.5 px-4 font-bold text-[#0F3B2C] whitespace-nowrap">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{inv.customer.name}</div>
                        {inv.customer.company_name && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            {inv.customer.company_name}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">{inv.customer.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(inv.invoice_date)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                        {formatCurrency(inv.total, settings.currency_symbol)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="text-xs font-semibold text-emerald-700">
                          Paid: {formatCurrency(paid, settings.currency_symbol)}
                        </div>
                        {due > 0 ? (
                          <div className="text-[11px] font-bold text-rose-600">
                            Due: {formatCurrency(due, settings.currency_symbol)}
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-emerald-600">
                            Settled
                          </div>
                        )}
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
                        {inv.created_by}
                      </td>
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Payments & Collections"
                            onClick={() => onOpenPaymentModal(inv)}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors font-semibold"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
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
                            title="Edit Invoice"
                            onClick={() => onEditInvoice(inv)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
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
                          {canDelete && (
                            <button
                              type="button"
                              title="Delete Invoice (Admin & Manager only)"
                              onClick={() => setDeleteConfirmId(inv.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-16 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 font-display">
                No invoices found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No invoices match your selected search or filter options.'
                  : 'You have not created any invoices yet.'}
              </p>
              <button
                type="button"
                onClick={onCreateNew}
                className="px-4 py-2 bg-[#0F3B2C] hover:bg-[#154d3a] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Create Invoice</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Delete Invoice?</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this invoice? This action cannot be undone and will delete all associated payment logs.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
