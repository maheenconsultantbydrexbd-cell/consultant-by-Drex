import React from 'react';
import { CompanySettings, PassportReceipt } from '../types';
import { formatDate } from '../utils/formatters';
import { ConsultantByDrexLogo } from './BrandLogo';

interface PassportReceiptSheetProps {
  receipt: PassportReceipt;
  settings: CompanySettings;
  scale?: number;
  printMode?: boolean;
}

export const PassportReceiptSheet: React.FC<PassportReceiptSheetProps> = ({
  receipt,
  settings,
  scale = 1,
  printMode = false,
}) => {
  return (
    <div
      id="passport-receipt-print-area"
      className={`passport-receipt-a4-sheet bg-white text-black mx-auto relative flex flex-col justify-between select-text antialiased ${
        printMode
          ? 'w-[794px] min-h-[1123px] shadow-none p-10 box-border'
          : 'w-full max-w-[760px] min-h-[960px] shadow-lg border border-black p-8 sm:p-12 box-border'
      }`}
      style={{
        width: printMode ? '794px' : undefined,
        minHeight: printMode ? '1123px' : undefined,
        boxSizing: 'border-box',
        transform: !printMode && scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
      }}
    >
      <div>
        {/* ===================================================================== */}
        {/* TOP HEADER: Consultant by D'Rex Logo & Contact */}
        {/* ===================================================================== */}
        <div className="flex flex-row items-start justify-between pb-4 border-b-2 border-black">
          {/* Company Brand Logo (Exact match to uploaded design, pure black) */}
          <div className="flex flex-col items-start">
            <ConsultantByDrexLogo color="black" size="md" />
            {settings.branch && (
              <p className="text-[11px] font-semibold text-black uppercase tracking-wider mt-1.5">
                {settings.branch}
              </p>
            )}
          </div>

          {/* Contact Details (Clean & Minimal) */}
          <div className="text-right text-xs text-black space-y-0.5">
            {(settings.phone || settings.whatsapp) && (
              <p className="font-semibold">Tel: {settings.phone || settings.whatsapp}</p>
            )}
            <p>{settings.email || 'consultantbydrexbd@gmail.com'}</p>
            {settings.address && (
              <p className="max-w-[260px] leading-tight">{settings.address}</p>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* HEADING: PASSPORT RECEIPT (Clean, single line, no broken line cuts) */}
        {/* ===================================================================== */}
        <div className="text-center my-6 select-none">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black whitespace-nowrap block text-center leading-normal">
            PASSPORT RECEIPT
          </h1>
          <p className="text-xs font-medium text-black mt-0.5 whitespace-nowrap text-center">
            (পাসপোর্ট জমা রসিদ)
          </p>
        </div>

        {/* Meta Line: Receipt No & Date (Guaranteed single line, no wrapping) */}
        <div className="flex items-center justify-between text-xs font-bold border border-black px-4 py-2.5 mb-6 whitespace-nowrap leading-none">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="uppercase text-black whitespace-nowrap">RECEIPT NO:</span>
            <span className="font-mono text-sm tracking-wider font-bold whitespace-nowrap text-black">
              {receipt.receipt_number}
            </span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="uppercase text-black whitespace-nowrap">DATE:</span>
            <span className="text-sm font-semibold whitespace-nowrap text-black">
              {formatDate(receipt.date)}
            </span>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SIMPLE BLACK & WHITE INFORMATION TABLE */}
        {/* ===================================================================== */}
        <table className="w-full border-collapse border border-black text-xs sm:text-sm">
          <tbody>
            {/* Row 1: Client Name */}
            <tr className="border-b border-black">
              <td className="w-1/3 p-3 font-bold uppercase border-r border-black">
                Client Name
              </td>
              <td className="w-2/3 p-3 font-semibold text-black">
                {receipt.client_name}
              </td>
            </tr>

            {/* Row 2: Mobile Number */}
            <tr className="border-b border-black">
              <td className="p-3 font-bold uppercase border-r border-black">
                Mobile Number
              </td>
              <td className="p-3 font-mono font-semibold text-black">
                {receipt.mobile_number || '—'}
              </td>
            </tr>

            {/* Row 3: Passport Number */}
            <tr className="border-b border-black">
              <td className="p-3 font-bold uppercase border-r border-black">
                Passport Number
              </td>
              <td className="p-3 font-mono font-bold text-base tracking-wider text-black">
                {receipt.passport_number}
              </td>
            </tr>

            {/* Row 4: Service / Purpose */}
            <tr className="border-b border-black">
              <td className="p-3 font-bold uppercase border-r border-black">
                Service / Purpose
              </td>
              <td className="p-3 font-medium text-black">
                {receipt.service_purpose}
              </td>
            </tr>

            {/* Row 5: Passport Received Date */}
            <tr className="border-b border-black">
              <td className="p-3 font-bold uppercase border-r border-black">
                Passport Received Date
              </td>
              <td className="p-3 font-medium text-black">
                {formatDate(receipt.passport_received_date)}
              </td>
            </tr>

            {/* Row 6: Passport Status */}
            <tr className="border-b border-black">
              <td className="p-3 font-bold uppercase border-r border-black">
                Passport Status
              </td>
              <td className="p-3 font-bold uppercase text-black">
                {receipt.passport_status === 'With Office'
                  ? 'With Office (অফিসে সংরক্ষিত)'
                  : receipt.passport_status === 'Returned'
                  ? 'Returned to Client (ফেরত প্রদান সম্পন্ন)'
                  : 'Received (গৃহীত)'}
              </td>
            </tr>

            {/* Row 7: Received By */}
            <tr>
              <td className="p-3 font-bold uppercase border-r border-black">
                Received By
              </td>
              <td className="p-3 font-semibold text-black">
                {receipt.received_by || 'Authorized Officer'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ===================================================================== */}
        {/* SIMPLE OFFICIAL ACKNOWLEDGEMENT NOTE (No decorative icons/colors) */}
        {/* ===================================================================== */}
        <div className="mt-6 border border-black p-3.5 text-xs text-black leading-relaxed">
          <p className="font-bold">
            Acknowledgement:
          </p>
          <p className="mt-1">
            Client's original passport has been received and held by our office for official processing. Please preserve this receipt and present it during passport collection.
          </p>
          <p className="mt-0.5 italic">
            (অফিসিয়াল কাজের জন্য ক্লায়েন্টের মূল পাসপোর্ট গ্রহণ করা হয়েছে। পাসপোর্ট গ্রহণের সময় এই রসিদ প্রদর্শন করতে হবে।)
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SIGNATURES AREA & MINIMAL FOOTER */}
      {/* ===================================================================== */}
      <div className="pt-16 pb-4 mt-auto">
        <div className="grid grid-cols-2 gap-12 text-center text-xs text-black">
          {/* Client Signature */}
          <div>
            <div className="border-t border-black w-44 mx-auto mb-2" />
            <p className="font-bold uppercase tracking-wider">Client Signature</p>
            <p className="text-[11px] text-black">(গ্রাহকের স্বাক্ষর)</p>
          </div>

          {/* Office Signature & Seal */}
          <div>
            <div className="border-t border-black w-44 mx-auto mb-2" />
            <p className="font-bold uppercase tracking-wider">Authorized Signature & Seal</p>
            <p className="text-[11px] text-black">(অনুমোদিত কর্মকর্তার স্বাক্ষর ও সিল)</p>
          </div>
        </div>

        {/* 1-Line Footer */}
        <div className="mt-10 pt-3 border-t border-black text-center text-[10px] uppercase tracking-widest text-black">
          {settings.company_name} • Office Copy & Client Receipt • System Verified Document
        </div>
      </div>
    </div>
  );
};
