import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, Loader2, X, AlertCircle } from 'lucide-react';
import { sanitizeFileName } from '../utils/formatters';
import { CompanySettings, Invoice, User } from '../types';
import { InvoiceSheet } from './InvoiceSheet';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface SavePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  settings: CompanySettings;
  currentUser?: User;
  onSuccess?: (filename: string) => void;
}

export const SavePdfModal: React.FC<SavePdfModalProps> = ({
  isOpen,
  onClose,
  invoice,
  settings,
  currentUser,
  onSuccess,
}) => {
  const [fileName, setFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offscreenSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && invoice) {
      const clientName = invoice.customer?.name || 'Customer';
      const cleanName = sanitizeFileName(`${invoice.invoice_number} - ${clientName}`);
      setFileName(cleanName);
      setError(null);
    }
  }, [isOpen, invoice]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!fileName.trim()) {
      setError('Please provide a valid filename.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      // Target our dedicated unscaled offscreen container first, fallback to DOM invoice element
      const targetElement =
        offscreenSheetRef.current?.querySelector<HTMLElement>('.invoice-a4-sheet') ||
        offscreenSheetRef.current ||
        document.getElementById('invoice-print-area');

      if (!targetElement) {
        throw new Error('Invoice printable document element could not be found.');
      }

      // Small delay to ensure all DOM nodes and webfonts are painted
      await new Promise((resolve) => setTimeout(resolve, 80));

      // html-to-image renders via SVG foreignObject with native browser engine, supporting modern CSS oklch()
      const imgDataUrl = await toPng(targetElement, {
        quality: 1,
        pixelRatio: 3, // Ultra-crisp HD 300+ DPI capture
        backgroundColor: '#ffffff',
        cacheBust: true,
        fontEmbedCSS: '', // Prevents CORS SecurityError when inlining remote Google Fonts
      });

      // Standard A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = 297;

      // Draw cleanly into the A4 PDF page
      pdf.addImage(imgDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      
      const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      pdf.save(finalFileName);

      setIsGenerating(false);
      onClose();
      if (onSuccess) {
        onSuccess(finalFileName);
      }
    } catch (err: any) {
      console.error('PDF export error:', err);
      setIsGenerating(false);
      setError(
        err?.message ||
          'Failed to generate PDF. You can also print the invoice and select "Save as PDF".'
      );
    }
  };

  return (
    <>
      {/* Hidden Offscreen Container for Clean Full-Scale A4 Capture */}
      <div
        aria-hidden="true"
        className="fixed pointer-events-none opacity-0 select-none overflow-hidden"
        style={{ left: '-9999px', top: '-9999px', width: '794px', zIndex: -999 }}
      >
        <div ref={offscreenSheetRef} style={{ width: '794px' }}>
          <InvoiceSheet
            invoice={invoice}
            settings={settings}
            scale={1}
            printMode={false}
            currentUser={currentUser}
          />
        </div>
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden transform transition-all">
          {/* Header */}
          <div className="bg-[#0F3B2C] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base">Save Invoice as PDF</h3>
                <p className="text-xs text-emerald-200">A4 High-Resolution Document Export</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                File Name
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => {
                    setFileName(sanitizeFileName(e.target.value));
                    if (error) setError(null);
                  }}
                  disabled={isGenerating}
                  placeholder="e.g. INV-2026-1001 - Client Name"
                  className="w-full pl-9 pr-14 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F3B2C] focus:border-transparent transition-all"
                  autoFocus
                />
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <span className="absolute right-3 text-xs font-semibold text-slate-400">
                  .pdf
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Characters like <code className="text-rose-600">/ \ ? * : &quot; &lt; &gt; |</code> are automatically sanitized.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Export Issue</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-900 flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1 flex-shrink-0" />
              <p>
                The document will be formatted with crisp vector fonts, the official header branding, and A4 print dimensions.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating || !fileName.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0F3B2C] hover:bg-[#134937] active:bg-[#09281E] rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Save PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

