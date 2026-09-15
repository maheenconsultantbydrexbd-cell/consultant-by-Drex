import React from 'react';
import { CompanySettings, Invoice, User } from '../types';
import { formatDate, numberToWords } from '../utils/formatters';
import { Mail, MapPin, Phone } from 'lucide-react';
import { CompanyBrandLogo } from './BrandLogo';

interface InvoiceSheetProps {
  invoice: Invoice;
  settings: CompanySettings;
  scale?: number;
  printMode?: boolean;
  currentUser?: User;
}

export const InvoiceSheet: React.FC<InvoiceSheetProps> = ({
  invoice,
  settings,
  scale = 1,
  printMode = false,
  currentUser,
}) => {
  // Creator Name Resolution
  const creatorName =
    (invoice.created_by && invoice.created_by.trim()) ||
    (currentUser?.name && currentUser.name.trim()) ||
    'Authorized Officer';

  // Maintain clean professional row balance
  const displayItems = [...invoice.items];
  const minRows = 8;
  const emptyRowsCount = Math.max(0, minRows - displayItems.length);
  const emptyRows = Array.from({ length: emptyRowsCount }, (_, i) => i);

  // In words computation
  const words =
    invoice.in_words ||
    numberToWords(invoice.total, settings.currency === 'BDT' ? 'Taka' : settings.currency);

  const theme = settings.invoice_theme || 'classic_minimal';

  return (
    <div
      id="invoice-print-area"
      className={`invoice-a4-sheet bg-white text-slate-900 mx-auto relative flex flex-col justify-between select-text overflow-hidden antialiased [text-rendering:optimizeLegibility] ${
        printMode
          ? 'w-[210mm] min-h-[297mm] shadow-none'
          : 'w-full max-w-[794px] min-h-[1123px] shadow-2xl rounded-sm border border-slate-200'
      }`}
      style={{
        transform: !printMode && scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      <div>
        {/* ================= HEADER SECTION ================= */}
        {theme === 'full_banner' ? (
          /* Solid Green Banner (Original heavy-ink format) */
          <div className="bg-[#0F3B2C] text-white px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex flex-col items-start pt-1">
                <CompanyBrandLogo variant="light" size="lg" />
                <h1
                  className="text-4xl sm:text-5xl font-black mt-7 uppercase text-white leading-none tracking-tight select-none"
                  style={{
                    fontFamily: "'Montserrat', 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
                    fontWeight: 900,
                    letterSpacing: '-0.01em',
                  }}
                >
                  INVOICE
                </h1>
              </div>

              <div className="flex flex-col items-start sm:items-end justify-center space-y-2.5 text-xs sm:text-sm text-slate-100 font-medium pt-2">
                {(settings.phone || settings.whatsapp) && (
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold tracking-wide text-white">
                      {settings.phone || settings.whatsapp}
                    </span>
                    <div className="w-5 h-5 rounded bg-[#7EA64B] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <Phone className="w-3 h-3 fill-current" />
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-200">
                    {settings.email || 'consultantbydrexbd@gmail.com'}
                  </span>
                  <div className="w-5 h-5 rounded bg-[#7EA64B] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                    <Mail className="w-3 h-3" />
                  </div>
                </div>
                {settings.address && (
                  <div className="flex items-center gap-2.5 text-right">
                    <span className="text-slate-200 leading-snug">{settings.address}</span>
                    <div className="w-5 h-5 rounded bg-[#7EA64B] flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <MapPin className="w-3 h-3" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : theme === 'modern_compact' ? (
          /* Modern Clean Ink-Saver with Slim Accent Bar */
          <div>
            <div className="h-2 bg-[#0F3B2C] w-full" />
            <div className="bg-white px-8 pt-7 pb-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="flex flex-col items-start">
                  <CompanyBrandLogo variant="black" size="lg" />
                  <h1
                    className="text-4xl sm:text-5xl font-black mt-6 uppercase text-[#0F3B2C] leading-none tracking-tight select-none"
                    style={{
                      fontFamily: "'Montserrat', 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
                      fontWeight: 900,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    INVOICE
                  </h1>
                </div>

                <div className="flex flex-col items-start sm:items-end justify-center space-y-2 text-xs sm:text-sm text-slate-700 font-medium pt-1">
                  {(settings.phone || settings.whatsapp) && (
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold tracking-wide text-slate-900">
                        {settings.phone || settings.whatsapp}
                      </span>
                      <div className="w-5 h-5 rounded border border-[#0F3B2C]/30 bg-emerald-50/60 flex items-center justify-center text-[#0F3B2C] flex-shrink-0">
                        <Phone className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-600">
                      {settings.email || 'consultantbydrexbd@gmail.com'}
                    </span>
                    <div className="w-5 h-5 rounded border border-[#0F3B2C]/30 bg-emerald-50/60 flex items-center justify-center text-[#0F3B2C] flex-shrink-0">
                      <Mail className="w-3 h-3" />
                    </div>
                  </div>
                  {settings.address && (
                    <div className="flex items-center gap-2.5 text-right">
                      <span className="text-slate-600 max-w-[280px] leading-snug">{settings.address}</span>
                      <div className="w-5 h-5 rounded border border-[#0F3B2C]/30 bg-emerald-50/60 flex items-center justify-center text-[#0F3B2C] flex-shrink-0">
                        <MapPin className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Classic Minimal (Pure White Ink-Saver - 95% ink saved, luxury typography) */
          <div>
            <div className="h-1.5 bg-[#0F3B2C] w-full" />
            <div className="bg-white px-8 pt-7 pb-6 border-b-2 border-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                {/* Left: Brand Logo & INVOICE */}
                <div className="flex flex-col items-start">
                  <CompanyBrandLogo variant="black" size="lg" />
                  <h1
                    className="text-4xl sm:text-5xl font-black mt-6 uppercase text-[#0F3B2C] leading-none tracking-tight select-none"
                    style={{
                      fontFamily: "'Montserrat', 'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
                      fontWeight: 900,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    INVOICE
                  </h1>
                </div>

                {/* Right: Contact Information in crisp readable typography */}
                <div className="flex flex-col items-start sm:items-end justify-center space-y-2 text-xs sm:text-sm font-medium pt-1">
                  {(settings.phone || settings.whatsapp) && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold tracking-wide text-slate-900">
                        {settings.phone || settings.whatsapp}
                      </span>
                      <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                        <Phone className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">
                      {settings.email || 'consultantbydrexbd@gmail.com'}
                    </span>
                    <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                      <Mail className="w-3 h-3" />
                    </div>
                  </div>
                  {settings.address && (
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-slate-600 max-w-[300px] leading-snug font-medium">
                        {settings.address}
                      </span>
                      <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                        <MapPin className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= INVOICE META & CLIENT DETAILS ================= */}
        <div className="px-8 pt-7 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Left: Invoice To (Client details) */}
            <div className="sm:col-span-7 space-y-1.5 text-sm">
              <h3 className="font-bold text-base text-slate-900 mb-2">Invoice To</h3>
              <div className="grid grid-cols-[100px_1fr] items-baseline">
                <span className="text-slate-600 font-medium">Client Name:</span>
                <span className="font-bold text-slate-900">
                  {invoice.customer.name}
                  {invoice.customer.company_name && (
                    <span className="block text-xs font-normal text-slate-600">
                      {invoice.customer.company_name}
                    </span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-baseline">
                <span className="text-slate-600 font-medium">Phone:</span>
                <span className="text-slate-800 font-medium">{invoice.customer.phone || '—'}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-baseline">
                <span className="text-slate-600 font-medium">Location:</span>
                <span className="text-slate-800">{invoice.customer.address || '—'}</span>
              </div>
            </div>

            {/* Right: Date & Invoice No */}
            <div className="sm:col-span-5 sm:text-right space-y-2 text-sm flex flex-col justify-start sm:items-end">
              <div className="grid grid-cols-[90px_1fr] sm:flex sm:items-center sm:gap-3 text-left sm:text-right">
                <span className="text-slate-600 font-medium">Date:</span>
                <span className="font-semibold text-slate-900">{formatDate(invoice.invoice_date)}</span>
              </div>
              <div className="grid grid-cols-[90px_1fr] sm:flex sm:items-center sm:gap-3 text-left sm:text-right">
                <span className="text-slate-600 font-medium">Invoice No:</span>
                <span className="font-bold text-[#0F3B2C]">{invoice.invoice_number}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ITEMS TABLE ================= */}
        <div className="px-8">
          <div className="border border-slate-300 overflow-hidden">
            {/* Header */}
            {theme === 'full_banner' ? (
              <div className="bg-[#0F3B2C] text-white flex items-center font-bold text-xs sm:text-sm tracking-wide">
                <div className="w-12 sm:w-16 py-2.5 px-3 text-center border-r border-emerald-800/60">
                  SL
                </div>
                <div className="flex-1 py-2.5 px-4 border-r border-emerald-800/60">
                  Description
                </div>
                <div className="w-16 sm:w-20 py-2.5 px-3 text-center border-r border-emerald-800/60">
                  Qty
                </div>
                <div className="w-24 sm:w-28 py-2.5 px-3 text-right border-r border-emerald-800/60">
                  Fee
                </div>
                <div className="w-28 sm:w-32 py-2.5 px-4 text-right">
                  Total
                </div>
              </div>
            ) : (
              /* Ink-saving clean table header: crisp slate background or light border */
              <div className="bg-slate-100 text-slate-900 border-b border-slate-300 flex items-center font-bold text-xs sm:text-sm tracking-wider uppercase">
                <div className="w-12 sm:w-16 py-2.5 px-3 text-center border-r border-slate-300 font-extrabold text-slate-800">
                  SL
                </div>
                <div className="flex-1 py-2.5 px-4 border-r border-slate-300 font-extrabold text-slate-800">
                  Description
                </div>
                <div className="w-16 sm:w-20 py-2.5 px-3 text-center border-r border-slate-300 font-extrabold text-slate-800">
                  Qty
                </div>
                <div className="w-24 sm:w-28 py-2.5 px-3 text-right border-r border-slate-300 font-extrabold text-slate-800">
                  Fee
                </div>
                <div className="w-28 sm:w-32 py-2.5 px-4 text-right font-extrabold text-slate-800">
                  Total
                </div>
              </div>
            )}

            {/* Data Rows */}
            <div className="divide-y divide-slate-200">
              {displayItems.map((item, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={item.id || index}
                    className={`flex items-stretch text-xs sm:text-sm ${
                      isEven ? 'bg-white' : 'bg-slate-50/80'
                    }`}
                  >
                    <div className="w-12 sm:w-16 py-3 px-3 text-center font-medium text-slate-700 border-r border-slate-300 flex items-center justify-center">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 py-3 px-4 border-r border-slate-300 flex flex-col justify-center">
                      <span className="font-semibold text-slate-900">{item.item_name}</span>
                      {item.description && (
                        <span className="text-xs text-slate-500 mt-0.5 whitespace-pre-line leading-relaxed">
                          {item.description}
                        </span>
                      )}
                    </div>
                    <div className="w-16 sm:w-20 py-3 px-3 text-center text-slate-800 font-medium border-r border-slate-300 flex items-center justify-center">
                      {item.quantity}
                    </div>
                    <div className="w-24 sm:w-28 py-3 px-3 text-right font-medium text-slate-800 border-r border-slate-300 flex items-center justify-end">
                      {item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="w-28 sm:w-32 py-3 px-4 text-right font-bold text-slate-900 flex items-center justify-end">
                      {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              })}

              {/* Empty placeholder rows to preserve document height matching reference */}
              {emptyRows.map((rowIndex) => {
                const isEven = (displayItems.length + rowIndex) % 2 === 0;
                return (
                  <div
                    key={`empty-${rowIndex}`}
                    className={`flex items-stretch text-xs sm:text-sm h-10 ${
                      isEven ? 'bg-white' : 'bg-slate-50/80'
                    }`}
                  >
                    <div className="w-12 sm:w-16 border-r border-slate-300" />
                    <div className="flex-1 border-r border-slate-300" />
                    <div className="w-16 sm:w-20 border-r border-slate-300" />
                    <div className="w-24 sm:w-28 border-r border-slate-300" />
                    <div className="w-28 sm:w-32" />
                  </div>
                );
              })}
            </div>

            {/* Total Row */}
            <div className="bg-slate-100 border-t-2 border-slate-300 flex items-center text-xs sm:text-sm font-bold">
              <div className="flex-1 py-3 px-4 text-slate-800 border-r border-slate-300 flex items-center gap-2">
                <span className="text-[#0F3B2C] uppercase tracking-wider font-extrabold">IN WORD:</span>
                <span className="font-semibold text-slate-700 italic">{words}</span>
              </div>
              <div className="w-24 sm:w-28 py-3 px-3 text-right text-slate-800 border-r border-slate-300 font-extrabold uppercase">
                TOTAL
              </div>
              <div className="w-28 sm:w-32 py-3 px-4 text-right font-extrabold text-[#0F3B2C] text-base">
                {invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Manager Signature Section & Generator / Creator Info */}
      <div className="px-8 pb-8 pt-10 mt-auto">
        <div className="flex justify-end items-end mb-4">
          {/* Right: Account Manager Signature */}
          <div className="flex flex-col items-center min-w-[190px]">
            <div className="w-48 border-t-2 border-slate-900 mb-2" />
            <span className="text-sm font-bold text-slate-900 tracking-tight font-display whitespace-nowrap text-center">
              {settings.account_manager_name || 'Account Manager'}
            </span>
          </div>
        </div>

        {/* Bottom System Verified Footer Bar */}
        <div className="border-t border-slate-200 pt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F3B2C]" />
          <span>
            This invoice was generated by <strong className="text-slate-900 font-bold">{creatorName}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

