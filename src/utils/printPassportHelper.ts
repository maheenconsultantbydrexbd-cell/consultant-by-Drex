import { CompanySettings, PassportReceipt } from '../types';
import { formatDate } from './formatters';

/**
 * Minimalist, pure black & white A4 passport receipt printing utility.
 * Optimized for standard black & white office printers with zero gray wash or colored backgrounds.
 */
export function printPassportReceiptDocument(
  receipt: PassportReceipt,
  settings: CompanySettings
): void {
  if (!receipt) return;

  // Cleanup any leftover host
  const oldHost = document.getElementById('global-passport-print-host');
  if (oldHost && oldHost.parentNode) {
    oldHost.parentNode.removeChild(oldHost);
  }

  const printDocumentHtml = `
    <style>
      @media print {
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        body {
          margin: 0;
          padding: 0;
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        #global-passport-print-host {
          display: block !important;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          margin: 0;
          padding: 0;
          background: #ffffff;
          z-index: 9999999;
        }
        body > *:not(#global-passport-print-host) {
          display: none !important;
        }
      }
    </style>

    <div style="
      width: 190mm;
      min-height: 270mm;
      margin: 0 auto;
      padding: 0;
      background: #ffffff;
      color: #000000;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
    ">
      <div>
        <!-- Top Header: Company Brand Logo & Contact -->
        <div style="
          border-bottom: 2px solid #000000;
          padding-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        ">
          <div>
            <div style="display: inline-flex; flex-direction: column; align-items: center; text-align: center; user-select: none;">
              <div style="font-family: 'Outfit', 'Plus Jakarta Sans', Arial, sans-serif; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; line-height: 1; color: #000000; white-space: nowrap; text-align: center; width: 100%;">
                Consultant
              </div>
              <div style="font-family: 'Outfit', 'Plus Jakarta Sans', Arial, sans-serif; font-size: 10.5px; font-weight: 600; letter-spacing: 0.38em; text-indent: 0.38em; color: #000000; margin-top: 4px; white-space: nowrap; text-align: center; width: 100%;">
                by D'Rex
              </div>
            </div>
            ${settings.branch ? `<div style="font-size: 11px; font-weight: 600; color: #000000; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">${settings.branch}</div>` : ''}
          </div>

          <div style="text-align: right; font-size: 11px; color: #000000; line-height: 1.4;">
            ${(settings.phone || settings.whatsapp) ? `<div><strong>Tel:</strong> ${settings.phone || settings.whatsapp}</div>` : ''}
            <div>${settings.email || 'consultantbydrexbd@gmail.com'}</div>
            ${settings.address ? `<div style="max-width: 260px;">${settings.address}</div>` : ''}
          </div>
        </div>

        <!-- Receipt Title (Clean single line, no broken text cuts) -->
        <div style="text-align: center; margin: 20px 0 16px 0;">
          <div style="font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #000000; white-space: nowrap; line-height: 1.2;">
            PASSPORT RECEIPT
          </div>
          <div style="font-size: 11px; color: #000000; margin-top: 3px; white-space: nowrap;">
            (পাসপোর্ট জমা রসিদ)
          </div>
        </div>

        <!-- Meta Line: Receipt Number & Date (Guaranteed single line) -->
        <div style="
          border: 1px solid #000000;
          padding: 8px 14px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          font-weight: bold;
          color: #000000;
          white-space: nowrap;
        ">
          <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
            <span style="text-transform: uppercase;">RECEIPT NO:</span>
            <span style="font-family: monospace; font-size: 13.5px; font-weight: bold; letter-spacing: 0.5px; white-space: nowrap;">${receipt.receipt_number}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap;">
            <span style="text-transform: uppercase;">DATE:</span>
            <span style="white-space: nowrap;">${formatDate(receipt.date)}</span>
          </div>
        </div>

        <!-- Simple Clean Information Table -->
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #000000; font-size: 12.5px; color: #000000;">
          <tbody>
            <tr style="border-bottom: 1px solid #000000;">
              <td style="width: 32%; padding: 10px 12px; font-weight: bold; text-transform: uppercase; border-right: 1px solid #000000;">
                Client Name
              </td>
              <td style="width: 68%; padding: 10px 12px; font-weight: bold;">
                ${receipt.client_name}
              </td>
            </tr>

            <tr style="border-bottom: 1px solid #000000;">
              <td style="padding: 10px 12px; font-weight: bold; text-transform: uppercase; border-right: 1px solid #000000;">
                Mobile Number
              </td>
              <td style="padding: 10px 12px; font-family: monospace;">
                ${receipt.mobile_number || '—'}
              </td>
            </tr>

            <tr style="border-bottom: 1px solid #000000;">
              <td style="padding: 10px 12px; font-weight: bold; text-transform: uppercase; border-right: 1px solid #000000;">
                Passport Number
              </td>
              <td style="padding: 10px 12px; font-family: monospace; font-size: 14px; font-weight: bold; letter-spacing: 0.5px;">
                ${receipt.passport_number}
              </td>
            </tr>

            <tr style="border-bottom: 1px solid #000000;">
              <td style="padding: 10px 12px; font-weight: bold; text-transform: uppercase; border-right: 1px solid #000000;">
                Service / Purpose
              </td>
              <td style="padding: 10px 12px;">
                ${receipt.service_purpose}
              </td>
            </tr>

            <tr style="border-bottom: 1px solid #000000;">
              <td style="padding: 10px 12px; font-weight: bold; text-transform: uppercase; border-right: 1px solid #000000;">
                Passport Received Date
              </td>
              <td style="padding: 10px 12px;">
                ${formatDate(receipt.passport_received_date)}
              </td>
            </tr>

            <tr style="border-bottom: 1px solid #000000;">
              <td style="padding: 10px 12px; font-weight: bold; text-transform: uppercase; border-right: 1px solid #000000;">
                Passport Status
              </td>
              <td style="padding: 10px 12px; font-weight: bold;">
                ${receipt.passport_status === 'With Office'
                  ? 'With Office (অফিসে সংরক্ষিত)'
                  : receipt.passport_status === 'Returned'
                  ? 'Returned to Client (ফেরত প্রদান সম্পন্ন)'
                  : 'Received (গৃহীত)'}
              </td>
            </tr>

            <tr>
              <td style="padding: 10px 12px; font-weight: bold; text-transform: uppercase; border-right: 1px solid #000000;">
                Received By
              </td>
              <td style="padding: 10px 12px; font-weight: bold;">
                ${receipt.received_by || 'Authorized Officer'}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Simple Clean Note -->
        <div style="
          margin-top: 20px;
          border: 1px solid #000000;
          padding: 10px 12px;
          font-size: 11.5px;
          line-height: 1.45;
          color: #000000;
        ">
          <div style="font-weight: bold; margin-bottom: 3px;">Acknowledgement:</div>
          <div>Client's original passport has been received and held by our office for official processing. Please preserve this receipt and present it during passport collection.</div>
          <div style="font-style: italic; margin-top: 2px;">(অফিসিয়াল কাজের জন্য ক্লায়েন্টের মূল পাসপোর্ট গ্রহণ করা হয়েছে। পাসপোর্ট গ্রহণের সময় এই রসিদ প্রদর্শন করতে হবে।)</div>
        </div>
      </div>

      <!-- Signatures Area & Footer -->
      <div style="padding-top: 60px; margin-top: auto;">
        <div style="display: flex; justify-content: space-between; text-align: center; font-size: 11.5px; color: #000000;">
          <!-- Client Signature -->
          <div style="width: 200px;">
            <div style="border-top: 1px solid #000000; margin-bottom: 6px;"></div>
            <div style="font-weight: bold; text-transform: uppercase;">Client Signature</div>
            <div style="font-size: 10px;">(গ্রাহকের স্বাক্ষর)</div>
          </div>

          <!-- Authorized Signature -->
          <div style="width: 200px;">
            <div style="border-top: 1px solid #000000; margin-bottom: 6px;"></div>
            <div style="font-weight: bold; text-transform: uppercase;">Authorized Signature & Seal</div>
            <div style="font-size: 10px;">(অনুমোদিত কর্মকর্তার স্বাক্ষর ও সিল)</div>
          </div>
        </div>

        <div style="
          margin-top: 30px;
          padding-top: 8px;
          border-top: 1px solid #000000;
          text-align: center;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #000000;
        ">
          ${settings.company_name} • Office Copy & Client Receipt • System Generated Document
        </div>
      </div>
    </div>
  `;

  // Create clean host attached to body
  const printHost = document.createElement('div');
  printHost.id = 'global-passport-print-host';
  printHost.innerHTML = printDocumentHtml;
  document.body.appendChild(printHost);

  // Trigger print after brief rendering pause
  setTimeout(() => {
    try {
      window.print();
    } catch (e) {
      console.warn('Direct print invocation error:', e);
    }
  }, 100);

  // Cleanup host afterwards
  const cleanup = () => {
    if (document.body.contains(printHost)) {
      document.body.removeChild(printHost);
    }
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  setTimeout(cleanup, 10000);
}
