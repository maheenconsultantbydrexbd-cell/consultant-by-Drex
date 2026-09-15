import React, { useState, useMemo } from 'react';
import {
  CompanySettings,
  Customer,
  PassportReceipt,
  PassportStatus,
  User,
} from '../types';
import { formatDate } from '../utils/formatters';
import { PassportReceiptSheet } from '../components/PassportReceiptSheet';
import { SavePassportPdfModal } from '../components/SavePassportPdfModal';
import { printPassportReceiptDocument } from '../utils/printPassportHelper';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Edit2,
  FileCheck2,
  FileText,
  Filter,
  Layers,
  MoreVertical,
  Plus,
  Printer,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

interface PassportReceiptsPageProps {
  receipts: PassportReceipt[];
  customers: Customer[];
  settings: CompanySettings;
  currentUser: User;
  onSaveReceipt: (receipt: PassportReceipt) => Promise<void>;
  onDeleteReceipt: (receiptId: string) => Promise<void>;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

const COMMON_PURPOSES = [
  'India Visa Processing for Portugal Workpermit',
  'Portugal Work Permit File Processing',
  'Portugal Embassy Attestation & Stamping',
  'VFS Appointment & Visa Processing',
  'Schengen Visa Processing & Submission',
  'Passport Safe Custody & Verification',
];

export const PassportReceiptsPage: React.FC<PassportReceiptsPageProps> = ({
  receipts,
  customers,
  settings,
  currentUser,
  onSaveReceipt,
  onDeleteReceipt,
  showToast,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PassportStatus>('all');

  // Modals & Sheets
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<PassportReceipt | null>(null);
  const [selectedReceiptForPreview, setSelectedReceiptForPreview] = useState<PassportReceipt | null>(null);
  const [receiptForPdf, setReceiptForPdf] = useState<PassportReceipt | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [receiptToDelete, setReceiptToDelete] = useState<PassportReceipt | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [passportNumber, setPassportNumber] = useState('');
  const [servicePurpose, setServicePurpose] = useState('India Visa Processing for Portugal Workpermit');
  const [customPurpose, setCustomPurpose] = useState('');
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [passportStatus, setPassportStatus] = useState<PassportStatus>('With Office');
  const [receivedBy, setReceivedBy] = useState(currentUser.name);
  const [returnedDate, setReturnedDate] = useState('');
  const [returnedBy, setReturnedBy] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Generate next Receipt Number
  const generateNextReceiptNumber = () => {
    const existingNums = receipts
      .map((r) => {
        const match = r.receipt_number.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 1000;
    return `PR-2026-${maxNum + 1}`;
  };

  // Open Create Form
  const handleOpenCreateForm = () => {
    setEditingReceipt(null);
    setClientName('');
    setMobileNumber('');
    setReceiptNumber(generateNextReceiptNumber());
    setReceiptDate(new Date().toISOString().split('T')[0]);
    setPassportNumber('');
    setServicePurpose('India Visa Processing for Portugal Workpermit');
    setCustomPurpose('');
    setReceivedDate(new Date().toISOString().split('T')[0]);
    setPassportStatus('With Office');
    setReceivedBy(currentUser.name);
    setReturnedDate('');
    setReturnedBy('');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEditForm = (receipt: PassportReceipt) => {
    setEditingReceipt(receipt);
    setClientName(receipt.client_name);
    setMobileNumber(receipt.mobile_number);
    setReceiptNumber(receipt.receipt_number);
    setReceiptDate(receipt.date);
    setPassportNumber(receipt.passport_number);

    if (COMMON_PURPOSES.includes(receipt.service_purpose)) {
      setServicePurpose(receipt.service_purpose);
      setCustomPurpose('');
    } else {
      setServicePurpose('custom');
      setCustomPurpose(receipt.service_purpose);
    }

    setReceivedDate(receipt.passport_received_date);
    setPassportStatus(receipt.passport_status);
    setReceivedBy(receipt.received_by);
    setReturnedDate(receipt.returned_date || '');
    setReturnedBy(receipt.returned_by || '');
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!clientName.trim()) {
      setFormError('Please enter the client name.');
      return;
    }

    if (!passportNumber.trim()) {
      setFormError('Passport number is required.');
      return;
    }

    const finalPurpose =
      servicePurpose === 'custom'
        ? customPurpose.trim() || 'India Visa Processing for Portugal Workpermit'
        : servicePurpose;

    const newOrUpdatedReceipt: PassportReceipt = {
      id: editingReceipt?.id || `pr-${Date.now()}`,
      receipt_number: receiptNumber.trim() || generateNextReceiptNumber(),
      date: receiptDate,
      client_name: clientName.trim(),
      passport_number: passportNumber.trim().toUpperCase(),
      mobile_number: mobileNumber.trim(),
      service_purpose: finalPurpose,
      passport_received_date: receivedDate,
      passport_status: passportStatus,
      received_by: receivedBy.trim() || currentUser.name,
      received_by_id: currentUser.id,
      returned_date: passportStatus === 'Returned' ? returnedDate || new Date().toISOString().split('T')[0] : undefined,
      returned_by: passportStatus === 'Returned' ? returnedBy || currentUser.name : undefined,
      created_at: editingReceipt?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      setIsSaving(true);
      await onSaveReceipt(newOrUpdatedReceipt);
      setIsFormOpen(false);
      showToast(
        'success',
        editingReceipt ? 'Receipt Updated' : 'Passport Receipt Created',
        `${newOrUpdatedReceipt.receipt_number} • ${newOrUpdatedReceipt.passport_number}`
      );
    } catch (err: any) {
      setFormError(err.message || 'Failed to save passport receipt.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Status Change (e.g. Return passport to client)
  const handleQuickStatusChange = async (receipt: PassportReceipt, newStatus: PassportStatus) => {
    const updated: PassportReceipt = {
      ...receipt,
      passport_status: newStatus,
      returned_date:
        newStatus === 'Returned' ? new Date().toISOString().split('T')[0] : receipt.returned_date,
      returned_by: newStatus === 'Returned' ? currentUser.name : receipt.returned_by,
      updated_at: new Date().toISOString(),
    };

    await onSaveReceipt(updated);
    showToast(
      'info',
      'Passport Status Updated',
      `${receipt.receipt_number} marked as ${newStatus.toUpperCase()}`
    );
  };

  // Delete Receipt
  const handleConfirmDelete = async () => {
    if (!receiptToDelete) return;
    if (currentUser.role === 'staff') {
      showToast('error', 'Permission Denied', 'Staff members cannot delete passport receipts.');
      setReceiptToDelete(null);
      return;
    }

    await onDeleteReceipt(receiptToDelete.id);
    showToast('info', 'Receipt Deleted', receiptToDelete.receipt_number);
    setReceiptToDelete(null);
  };

  // Filtered Receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        r.receipt_number.toLowerCase().includes(query) ||
        r.client_name.toLowerCase().includes(query) ||
        r.passport_number.toLowerCase().includes(query) ||
        r.mobile_number.toLowerCase().includes(query) ||
        r.service_purpose.toLowerCase().includes(query);

      // Status
      const matchesStatus = statusFilter === 'all' || r.passport_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [receipts, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = receipts.length;
    const withOffice = receipts.filter((r) => r.passport_status === 'With Office').length;
    const received = receipts.filter((r) => r.passport_status === 'Received').length;
    const returned = receipts.filter((r) => r.passport_status === 'Returned').length;
    return { total, withOffice, received, returned };
  }, [receipts]);

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* PAGE HEADER */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0F3B2C] text-white flex items-center justify-center shadow-xs">
              <FileCheck2 className="w-5 h-5 text-[#7EA64B]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                Passport Receiving Receipts
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                পাসপোর্ট জমা রসিদ • Client Passport Custody & Safe Tracking Module
              </p>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleOpenCreateForm}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0F3B2C] hover:bg-[#154d3a] active:bg-[#0a271d] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 text-[#7EA64B]" />
          <span>New Passport Receipt</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* STATS OVERVIEW CARDS */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Receipts */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Receipts
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              {stats.total}
            </span>
          </div>
        </div>

        {/* With Office (Active Custody) */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              With Office / অফিসে আছে
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-900 font-display">
              {stats.withOffice}
            </span>
          </div>
        </div>

        {/* Newly Received */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Received / গৃহীত
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-900 font-display">
              {stats.received}
            </span>
          </div>
        </div>

        {/* Returned */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
              Returned / ফেরত সম্পন্ন
            </span>
            <span className="text-xl sm:text-2xl font-black text-blue-900 font-display">
              {stats.returned}
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SEARCH AND FILTERS */}
      {/* ===================================================================== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by receipt, client, passport..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:bg-white transition-all placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100/80 rounded-xl">
          {(['all', 'With Office', 'Received', 'Returned'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'All Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* RECEIPTS DATA TABLE */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredReceipts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-[#0F3B2C] flex items-center justify-center mb-3">
              <FileCheck2 className="w-7 h-7 text-[#7EA64B]" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Passport Receipts Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filter to find receipts.'
                : 'Click "+ New Passport Receipt" to log a client passport intake.'}
            </p>
            <button
              onClick={handleOpenCreateForm}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0F3B2C] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#154d3a] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Passport Receipt</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Receipt No</th>
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Passport No</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Purpose / Service</th>
                  <th className="py-3.5 px-4">Received Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredReceipts.map((receipt) => {
                  const isWithOffice = receipt.passport_status === 'With Office';
                  const isReceived = receipt.passport_status === 'Received';
                  const isReturned = receipt.passport_status === 'Returned';

                  return (
                    <tr
                      key={receipt.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Receipt No */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-extrabold text-[#0F3B2C]">
                        {receipt.receipt_number}
                      </td>

                      {/* Client Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{receipt.client_name}</div>
                        {receipt.customer_id && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                            <UserCheck className="w-2.5 h-2.5" /> Client DB
                          </span>
                        )}
                      </td>

                      {/* Passport No */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 tracking-wider">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {receipt.passport_number}
                        </span>
                      </td>

                      {/* Mobile */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {receipt.mobile_number || '—'}
                      </td>

                      {/* Service / Purpose */}
                      <td className="py-3.5 px-4 text-slate-700 max-w-[200px] truncate" title={receipt.service_purpose}>
                        {receipt.service_purpose}
                      </td>

                      {/* Received Date */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(receipt.passport_received_date)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isWithOffice
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : isReceived
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isWithOffice
                                ? 'bg-amber-500'
                                : isReceived
                                ? 'bg-emerald-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <span>{receipt.passport_status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Preview */}
                          <button
                            onClick={() => setSelectedReceiptForPreview(receipt)}
                            title="View Receipt Document"
                            className="p-1.5 text-slate-500 hover:text-[#0F3B2C] hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print */}
                          <button
                            onClick={() => printPassportReceiptDocument(receipt, settings)}
                            title="Print A4 Receipt"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Download PDF */}
                          <button
                            onClick={() => setReceiptForPdf(receipt)}
                            title="Download PDF"
                            className="p-1.5 text-slate-500 hover:text-[#7EA64B] hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEditForm(receipt)}
                            title="Edit Receipt"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Quick Return Status button if not returned yet */}
                          {receipt.passport_status !== 'Returned' && (
                            <button
                              onClick={() => handleQuickStatusChange(receipt, 'Returned')}
                              title="Mark as Returned to Client"
                              className="px-2 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                            >
                              Return
                            </button>
                          )}

                          {/* Delete (Admins & Managers) */}
                          {currentUser.role !== 'staff' && (
                            <button
                              onClick={() => setReceiptToDelete(receipt)}
                              title="Delete Receipt"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL: CREATE / EDIT PASSPORT RECEIPT */}
      {/* ===================================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-[#0F3B2C] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#7EA64B] text-white flex items-center justify-center font-bold">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base font-display">
                    {editingReceipt ? 'Edit Passport Receipt' : 'New Passport Receiving Receipt'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    পাসপোর্ট জমা রসিদ • {receiptNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Receipt Number & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Receipt Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Receipt Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:bg-white"
                  />
                </div>
              </div>

              {/* Client Information (Direct Input - No Select Customer, No Email) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Mr. Rafiqul Islam"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. +8801711223344"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:bg-white"
                  />
                </div>
              </div>

              {/* Passport Specific Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#0F3B2C] uppercase tracking-wider text-[11px] mb-1.5">
                    Passport Number * (পাসপোর্ট নম্বর)
                  </label>
                  <input
                    type="text"
                    required
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. A08492817"
                    className="w-full px-3.5 py-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-slate-900 font-mono font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:bg-white tracking-wider"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Passport Received Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:bg-white"
                  />
                </div>
              </div>

              {/* Service / Purpose */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Service / Purpose (উদ্দেশ্য ও কাজের বিবরণ) *
                </label>
                <select
                  value={servicePurpose}
                  onChange={(e) => setServicePurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:bg-white mb-2"
                >
                  {COMMON_PURPOSES.map((purp) => (
                    <option key={purp} value={purp}>
                      {purp}
                    </option>
                  ))}
                  <option value="custom">+ Write Custom Purpose</option>
                </select>

                {servicePurpose === 'custom' && (
                  <input
                    type="text"
                    required
                    value={customPurpose}
                    onChange={(e) => setCustomPurpose(e.target.value)}
                    placeholder="Enter custom visa or processing purpose..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7EA64B]"
                  />
                )}
              </div>

              {/* Passport Status & Received By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Passport Status *
                  </label>
                  <select
                    value={passportStatus}
                    onChange={(e) => setPassportStatus(e.target.value as PassportStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:bg-white"
                  >
                    <option value="Received">Received / গৃহীত (Just Received)</option>
                    <option value="With Office">With Office / অফিসে সংরক্ষিত (In Custody)</option>
                    <option value="Returned">Returned / ফেরত সম্পন্ন (Delivered back to Client)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Received By (Staff Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:bg-white font-semibold"
                  />
                </div>
              </div>

              {/* If Returned: Date & Officer */}
              {passportStatus === 'Returned' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-blue-900 text-xs mb-1">
                      Date Returned to Client
                    </label>
                    <input
                      type="date"
                      value={returnedDate}
                      onChange={(e) => setReturnedDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-blue-900 text-xs mb-1">
                      Handed Over By
                    </label>
                    <input
                      type="text"
                      value={returnedBy}
                      onChange={(e) => setReturnedBy(e.target.value)}
                      placeholder="Officer Name"
                      className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-slate-900 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#0F3B2C] hover:bg-[#154d3a] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#7EA64B]" />
                      <span>{editingReceipt ? 'Update Receipt' : 'Save & Generate Receipt'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL / DRAWER: VIEW & PREVIEW PASSPORT RECEIPT SHEET */}
      {/* ===================================================================== */}
      {selectedReceiptForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-100 rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[95vh]">
            {/* Top Toolbar */}
            <div className="px-6 py-4 bg-[#0F3B2C] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#7EA64B] flex items-center justify-center text-white font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base font-display">
                    {selectedReceiptForPreview.receipt_number} • Passport Receipt Preview
                  </h3>
                  <p className="text-xs text-emerald-200">
                    {selectedReceiptForPreview.client_name} ({selectedReceiptForPreview.passport_number})
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Print Direct */}
                <button
                  onClick={() => printPassportReceiptDocument(selectedReceiptForPreview, settings)}
                  className="px-3.5 py-1.5 bg-white text-[#0F3B2C] hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print Document</span>
                </button>

                {/* PDF Download */}
                <button
                  onClick={() => setReceiptForPdf(selectedReceiptForPreview)}
                  className="px-3.5 py-1.5 bg-[#7EA64B] hover:bg-[#6e933f] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>

                {/* Edit */}
                <button
                  onClick={() => {
                    const r = selectedReceiptForPreview;
                    setSelectedReceiptForPreview(null);
                    handleOpenEditForm(r);
                  }}
                  className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  title="Edit Receipt"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Close */}
                <button
                  onClick={() => setSelectedReceiptForPreview(null)}
                  className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Preview Stage */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/80">
              <div className="bg-white shadow-xl rounded-sm">
                <PassportReceiptSheet
                  receipt={selectedReceiptForPreview}
                  settings={settings}
                  scale={previewScale}
                />
              </div>
            </div>

            {/* Bottom Scale Controls */}
            <div className="px-6 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
              <span className="font-medium">
                Standard A4 Document Format (210mm × 297mm)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewScale((s) => Math.max(0.7, s - 0.1))}
                  className="p-1 rounded hover:bg-slate-100"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px]">{Math.round(previewScale * 100)}%</span>
                <button
                  onClick={() => setPreviewScale((s) => Math.min(1.3, s + 0.1))}
                  className="p-1 rounded hover:bg-slate-100"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewScale(1)}
                  className="p-1 rounded hover:bg-slate-100 ml-1"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: DOWNLOAD PDF */}
      {/* ===================================================================== */}
      {receiptForPdf && (
        <SavePassportPdfModal
          isOpen={true}
          onClose={() => setReceiptForPdf(null)}
          receipt={receiptForPdf}
          settings={settings}
          onSuccess={(filename) => {
            showToast('success', 'PDF Downloaded', filename);
          }}
        />
      )}

      {/* ===================================================================== */}
      {/* MODAL: CONFIRM DELETE */}
      {/* ===================================================================== */}
      {receiptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">
              Delete Passport Receipt?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1.5 leading-relaxed">
              Are you sure you want to remove receipt{' '}
              <span className="font-bold text-slate-800">{receiptToDelete.receipt_number}</span> for{' '}
              <span className="font-bold text-slate-800">{receiptToDelete.client_name}</span>?
              This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setReceiptToDelete(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
