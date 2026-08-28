import { BankAccountInfo } from '../types';

export interface BankItem {
  code: string;
  shortName: string;
  name: string;
  bin: string;
  logo?: string;
}

export const VIETNAM_BANKS: BankItem[] = [
  { code: 'MB', shortName: 'MBBank', name: 'Ngân hàng Quân Đội (MBBank)', bin: '970422' },
  { code: 'VCB', shortName: 'Vietcombank', name: 'Ngân hàng Ngoại Thương (Vietcombank)', bin: '970436' },
  { code: 'TCB', shortName: 'Techcombank', name: 'Ngân hàng Kỹ Thương (Techcombank)', bin: '970407' },
  { code: 'ACB', shortName: 'ACB', name: 'Ngân hàng Á Châu (ACB)', bin: '970416' },
  { code: 'VPB', shortName: 'VPBank', name: 'Ngân hàng Việt Nam Thịnh Vượng (VPBank)', bin: '970432' },
  { code: 'TPB', shortName: 'TPBank', name: 'Ngân hàng Tiên Phong (TPBank)', bin: '970458' },
  { code: 'VIB', shortName: 'VIB', name: 'Ngân hàng Quốc Tế (VIB)', bin: '970441' },
  { code: 'BIDV', shortName: 'BIDV', name: 'Ngân hàng Đầu tư và Phát triển (BIDV)', bin: '970418' },
  { code: 'CTG', shortName: 'VietinBank', name: 'Ngân hàng Công Thương (VietinBank)', bin: '970415' },
  { code: 'STB', shortName: 'Sacombank', name: 'Ngân hàng Sài Gòn Thương Tín (Sacombank)', bin: '970403' },
  { code: 'OCB', shortName: 'OCB', name: 'Ngân hàng Phương Đông (OCB)', bin: '970448' },
  { code: 'MSB', shortName: 'MSB', name: 'Ngân hàng Hàng Hải (MSB)', bin: '970426' },
  { code: 'SHB', shortName: 'SHB', name: 'Ngân hàng Sài Gòn - Hà Nội (SHB)', bin: '970443' },
  { code: 'HDB', shortName: 'HDBank', name: 'Ngân hàng Phát triển TP.HCM (HDBank)', bin: '970437' },
  { code: 'TIMO', shortName: 'Timo', name: 'Ngân hàng số Timo (BVBank)', bin: '963388' },
  { code: 'CAKE', shortName: 'Cake by VPBank', name: 'Ngân hàng số Cake (VPBank)', bin: '546034' },
  { code: 'LPB', shortName: 'LPBank', name: 'Ngân hàng Lộc Phát Việt Nam (LPBank)', bin: '970449' },
  { code: 'VIETTELPAY', shortName: 'Viettel Money', name: 'Viettel Money (MBBank)', bin: '971005' },
];

export interface VietQROptions {
  bankId: string;       // e.g. "MB", "VCB", "970422"
  accountNo: string;    // e.g. "0987654321"
  accountName?: string; // e.g. "NGUYEN VAN A"
  amount?: number;      // e.g. 45000
  memo?: string;        // e.g. "Linh chuyen tien tra sua"
  template?: 'compact2' | 'compact' | 'qr_only' | 'print';
}

/**
 * Generate standard VietQR Image URL
 */
export function generateVietQRUrl(options: VietQROptions): string {
  const { bankId, accountNo, accountName, amount, memo, template = 'compact2' } = options;
  if (!bankId || !accountNo) return '';

  const cleanAccountNo = accountNo.trim().replace(/\s+/g, '');
  const cleanBankId = bankId.trim();

  let url = `https://img.vietqr.io/image/${cleanBankId}-${cleanAccountNo}-${template}.png`;
  const params: string[] = [];

  if (amount && amount > 0) {
    params.push(`amount=${Math.round(amount)}`);
  }
  if (memo && memo.trim()) {
    params.push(`addInfo=${encodeURIComponent(memo.trim())}`);
  }
  if (accountName && accountName.trim()) {
    params.push(`accountName=${encodeURIComponent(accountName.trim())}`);
  }

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return url;
}

/**
 * Smartly parse free-form bank info text like "0987654321 - MBBank (Nam)" or "VCB 0123456789"
 */
export function parseBankInfoText(text: string): Partial<BankAccountInfo> {
  if (!text || !text.trim()) return {};

  const clean = text.trim();
  let bankCode = '';
  let bankName = '';
  let accountNo = '';
  let accountName = '';

  // Match Bank from list
  for (const b of VIETNAM_BANKS) {
    const codeRegex = new RegExp(`\\b${b.code}\\b`, 'i');
    const shortNameRegex = new RegExp(`\\b${b.shortName}\\b`, 'i');
    if (codeRegex.test(clean) || shortNameRegex.test(clean)) {
      bankCode = b.code;
      bankName = b.shortName;
      break;
    }
  }

  // Match Account Number (sequence of 6 to 18 digits)
  const accMatch = clean.match(/\b\d{6,18}\b/);
  if (accMatch) {
    accountNo = accMatch[0];
  }

  // Match Account Name inside parentheses like "(Nam)" or after bank
  const nameMatch = clean.match(/\(([^)]+)\)/);
  if (nameMatch) {
    accountName = nameMatch[1].trim();
  }

  return {
    bankCode: bankCode || undefined,
    bankName: bankName || undefined,
    accountNo: accountNo || undefined,
    accountName: accountName || undefined,
  };
}
