import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, Loader2, X, AlertCircle } from 'lucide-react';
import { sanitizeFileName } from '../utils/formatters';
import { CompanySettings, PassportReceipt } from '../types';
import { PassportReceiptSheet } from './PassportReceiptSheet';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface SavePassportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PassportReceipt;
  settings: CompanySettings;
  onSuccess?: (filename: string) => void;
}

export const SavePassportPdfModal: React.FC<SavePassportPdfModalProps> = ({
  isOpen,
  onClose,
  receipt,
  settings,
  onSuccess,
}) => {
  const [fileName, setFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const offscreenSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && receipt) {
      const clientName = receipt.client_name || 'Client';
      const cleanName = sanitizeFileName(
        `${receipt.receipt_number} - ${clientName} - Passport Receipt`
      );
      setFileName(cleanName);
      setError(null);
    }
  }, [isOpen, receipt]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!fileName.trim()) {
      setError('Please provide a valid filename.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      // Target offscreen container or DOM element
      const targetElement =
        offscreenSheetRef.current?.querySelector<HTMLElement>('.passport-receipt-a4-sheet') ||
        offscreenSheetRef.current ||
        document.getElementById('passport-receipt-print-area');

      if (!targetElement) {
        throw new Error('Passport receipt printable document element could not be found.');
      }

      // Small delay to ensure all DOM nodes and webfonts are fully painted
      await new Promise((resolve) => setTimeout(resolve, 150));

      const imgDataUrl = await toPng(targetElement, {
        quality: 1,
        pixelRatio: 3, // Crisp 300+ DPI capture
        backgroundColor: '#ffffff',
        cacheBust: true,
        fontEmbedCSS: '', // Prevents CORS SecurityError when inlining remote Google Fonts
      });

      // Standard A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      pdf.addImage(imgDataUrl, 'PNG', 0, 0, 210, 297, undefined, 'FAST');

      const fullFileName = fileName.toLowerCase().endsWith('.pdf')
        ? fileName
        : `${fileName}.pdf`;

      pdf.save(fullFileName);
      onSuccess?.(fullFileName);
      onClose();
    } catch (err: any) {
      console.error('PDF generation failure:', err);
      setError(err.message || 'Failed to generate PDF document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F3B2C]/10 text-[#0F3B2C] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#0F3B2C]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-display">
                Download Passport Receipt PDF
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {receipt.receipt_number} • {receipt.passport_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              File Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                disabled={isGenerating}
                placeholder="e.g. PR-2026-1001 - Rafiqul Islam - Passport Receipt"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7EA64B] focus:bg-white transition-all font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono select-none">
                .pdf
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <span>📄 High-Quality A4 Print Document</span>
            </p>
            <p className="text-emerald-700">
              Generates a 300 DPI vector-accurate document ready to be printed or handed to the client.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating || !fileName.trim()}
            className="px-5 py-2.5 bg-[#0F3B2C] hover:bg-[#154d3a] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Offscreen unscaled render container for razor-sharp pixel capture */}
      <div
        style={{
          position: 'fixed',
          top: '-99999px',
          left: '-99999px',
          width: '794px',
          height: '1123px',
          overflow: 'hidden',
          zIndex: -1,
          opacity: 1,
          pointerEvents: 'none',
        }}
      >
        <div ref={offscreenSheetRef}>
          <PassportReceiptSheet receipt={receipt} settings={settings} scale={1} printMode={true} />
        </div>
      </div>
    </div>
  );
};
