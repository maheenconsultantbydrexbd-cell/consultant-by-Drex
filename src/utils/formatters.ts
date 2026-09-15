/**
 * Formats a number as currency
 */
export function formatCurrency(amount: number, symbol: string = '৳'): string {
  const num = isNaN(amount) ? 0 : amount;
  return `${symbol} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Converts a number to English Words (e.g. 25000 -> "Twenty-Five Thousand Taka Only")
 */
export function numberToWords(amount: number, currencyName: string = 'Taka'): string {
  if (isNaN(amount) || amount === 0) return `Zero ${currencyName} Only`;
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertGroup(n: number): string {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + ones[n % 10] : '') + ' ';
    } else if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  const integerPart = Math.floor(Math.abs(amount));
  const decimalPart = Math.round((Math.abs(amount) - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return `Zero ${currencyName} Only`;
  }

  let words = '';

  // Handle Crores (for South Asian numbering) or Billions/Millions
  // 1 Crore = 10,000,000; 1 Lakh = 100,000; 1 Thousand = 1,000
  let num = integerPart;

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const remaining = num;

  if (crore > 0) {
    words += convertGroup(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertGroup(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertGroup(thousand) + ' Thousand ';
  }
  if (remaining > 0) {
    words += convertGroup(remaining) + ' ';
  }

  words = words.trim() + ` ${currencyName}`;

  if (decimalPart > 0) {
    words += ` and ${convertGroup(decimalPart)} Paisa`;
  }

  return `${words} Only`.replace(/\s+/g, ' ').trim();
}

/**
 * Sanitizes a filename for cross-platform file saving
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').trim();
}

/**
 * Formats a date string to display format (e.g. DD/MM/YYYY)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD for HTML date inputs
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates sequential invoice number
 */
export function generateNextInvoiceNumber(prefix: string, nextNumber: number): string {
  const padded = String(nextNumber).padStart(4, '0');
  return `${prefix}${padded}`;
}
