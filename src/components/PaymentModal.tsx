import React, { useState } from 'react';
import { Invoice, Payment, User } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Plus,
  Receipt,
  Trash2,
  X
} from 'lucide-react';

interface PaymentModalProps {
  invoice: Invoice;
  currentUser: User;
  onClose: () => void;
  onAddPayment: (
    invoiceId: string,
    amount: number,
    paymentDate: string,
    paymentMethod: string,
    referenceNo: string,
    notes: string
  ) => Promise<boolean>;
  onDeletePayment?: (paymentId: string) => Promise<boolean>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  invoice,
  currentUser,
  onClose,
  onAddPayment,
  onDeletePayment,
}) => {
  const total = invoice.total || 0;
  const paid = invoice.paid_amount || 0;
  const due = Math.max(0, total - paid);

  const [amount, setAmount] = useState<number | string>(due > 0 ? due : '');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<string>('bKash');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods = [
    'Cash',
    'Bank Transfer',
    'bKash',
    'Nagad',
    'Rocket',
    'Cheque',
    'Card',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0.');
      return;
    }

    if (parsedAmount > due && due > 0) {
      if (!confirm(`The amount (৳ ${parsedAmount}) is higher than the remaining due (৳ ${due}). Proceed anyway?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    const success = await onAddPayment(
      invoice.id,
      parsedAmount,
      paymentDate,
      paymentMethod,
      referenceNo.trim(),
      notes.trim()
    );

    setIsSubmitting(false);
    if (success) {
      setAmount('');
      setReferenceNo('');
      setNotes('');
    } else {
      setError('Failed to record payment. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0F3B2C] flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                Payments & Collections
              </h2>
              <p className="text-xs text-slate-500">
                Invoice <span className="font-bold text-slate-700">{invoice.invoice_number}</span> •{' '}
                {invoice.customer.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Financial Summary Card */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Billed
              </p>
              <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                {formatCurrency(total)}
              </p>
            </div>
            <div className="border-x border-slate-200 px-2">
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Total Paid
              </p>
              <p className="text-base sm:text-lg font-extrabold text-emerald-700 mt-0.5">
                {formatCurrency(paid)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Due Balance
              </p>
              <p className={`text-base sm:text-lg font-extrabold mt-0.5 ${due > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                {formatCurrency(due)}
              </p>
            </div>
          </div>

          {/* Form to Add New Payment */}
          {due > 0 || (invoice.payments && invoice.payments.length === 0) ? (
            <form onSubmit={handleSubmit} className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0F3B2C] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Record New Payment
                </span>
                <span className="text-[11px] text-slate-500">
                  Receiver: <span className="font-semibold text-slate-700">{currentUser.name}</span>
                </span>
              </div>

              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount Received (৳) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">৳</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                  >
                    {paymentMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reference / Trx ID / Cheque #
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. 9JA728XK12 or Bank Ref"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes about this transaction..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3B2C]"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0F3B2C] hover:bg-[#154d3a] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm & Record Payment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-emerald-100/60 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>This invoice is completely settled and paid in full.</span>
            </div>
          )}

          {/* Payment History List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Payment History ({invoice.payments?.length || 0})
            </h3>

            {(!invoice.payments || invoice.payments.length === 0) ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                No payments have been recorded for this invoice yet.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="bg-slate-50 grid grid-cols-12 px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-3">Date & Method</div>
                  <div className="col-span-4">Reference / Notes</div>
                  <div className="col-span-2">Received By</div>
                  <div className="col-span-3 text-right">Amount</div>
                </div>

                {invoice.payments.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-12 px-3 py-2.5 items-center text-xs hover:bg-slate-50/50"
                  >
                    <div className="col-span-3">
                      <p className="font-semibold text-slate-900">{formatDate(p.payment_date)}</p>
                      <span className="inline-block text-[10px] font-medium px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded mt-0.5">
                        {p.payment_method}
                      </span>
                    </div>

                    <div className="col-span-4 pr-2">
                      <p className="font-mono text-slate-700 text-[11px] truncate">
                        {p.reference_no || '—'}
                      </p>
                      {p.notes && (
                        <p className="text-[10px] text-slate-400 truncate">{p.notes}</p>
                      )}
                    </div>

                    <div className="col-span-2 text-slate-600 text-[11px] truncate">
                      {p.received_by || 'Staff'}
                    </div>

                    <div className="col-span-3 text-right flex items-center justify-end gap-2">
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(p.amount)}
                      </span>
                      {onDeletePayment && currentUser.role !== 'staff' && (
                        <button
                          type="button"
                          onClick={() => onDeletePayment(p.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete payment record (Admin/Manager only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
