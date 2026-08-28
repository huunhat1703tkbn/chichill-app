import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Download,
  CreditCard,
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { BankAccountInfo } from '../types';
import { generateVietQRUrl, VIETNAM_BANKS } from '../utils/vietqr';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverName: string;
  amount: number;
  memo?: string;
  bankAccount?: BankAccountInfo;
  rawBankInfo?: string;
}

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  isOpen,
  onClose,
  receiverName,
  amount,
  memo = '',
  bankAccount,
  rawBankInfo = '',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatVND = (val: number) => val.toLocaleString('vi-VN') + ' ₫';

  // Determine Bank Details from structured bankAccount or fallback parsing
  const bankCode = bankAccount?.bankCode || '';
  const accountNo = bankAccount?.accountNo || '';
  const accountName = bankAccount?.accountName || receiverName || 'Chủ tài khoản';
  const customQrImage = bankAccount?.customQrImage;

  // Match Bank Info
  const matchedBank = VIETNAM_BANKS.find((b) => b.code.toLowerCase() === bankCode.toLowerCase());
  const displayBankName = matchedBank?.name || bankAccount?.bankName || 'Ngân hàng';

  // Generate VietQR URL
  const qrUrl =
    customQrImage ||
    (bankCode && accountNo
      ? generateVietQRUrl({
          bankId: bankCode,
          accountNo,
          accountName,
          amount,
          memo,
          template: 'compact2',
        })
      : null);

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `VietQR-${accountNo}-${amount || 0}.png`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="emerald-gradient p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center backdrop-blur-md">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Quét Mã Chuyển Tiền</h2>
              <p className="text-[10px] text-emerald-100/80 font-medium">VietQR Napas 24/7 tự động điền số tiền</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl border border-slate-200/80 shadow-inner space-y-2">
            {qrUrl ? (
              <div className="relative group">
                <img
                  src={qrUrl}
                  alt="Mã QR Chuyển Khoản"
                  className="w-56 h-auto max-h-64 object-contain rounded-xl shadow-md border border-white bg-white"
                />
              </div>
            ) : (
              <div className="w-52 h-52 bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center text-slate-400 space-y-1.5">
                <QrCode className="w-8 h-8 text-slate-300" />
                <p className="font-bold text-slate-600 text-xs">Chưa cấu hình mã QR</p>
                <p className="text-[10px] text-slate-400">
                  {rawBankInfo ? `Thông tin: ${rawBankInfo}` : 'Thủ quỹ chưa cập nhật STK & ngân hàng'}
                </p>
              </div>
            )}

            <p className="text-[10px] text-slate-400 font-semibold text-center flex items-center gap-1">
              <span>💡 Mở App ngân hàng / MoMo bất kỳ để quét mã</span>
            </p>
          </div>

          {/* Amount Badge Highlight */}
          {amount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Số tiền cần chuyển:</span>
                <p className="text-base font-extrabold text-emerald-800 font-mono mt-0.5">{formatVND(amount)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(Math.round(amount).toString(), 'amount')}
                className="bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold px-2.5 py-1 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          )}

          {/* Transfer Details Card */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 space-y-2.5">
            {/* Bank Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0 pr-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Ngân hàng:</span>
                  <span className="font-bold text-slate-800 truncate block">{displayBankName}</span>
                </div>
              </div>
              {bankCode && (
                <button
                  type="button"
                  onClick={() => handleCopy(displayBankName, 'bank')}
                  className="text-slate-400 hover:text-emerald-700 p-1"
                  title="Sao chép tên ngân hàng"
                >
                  {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Account Number */}
            {accountNo && (
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">Số tài khoản:</span>
                    <span className="font-extrabold text-slate-900 font-mono tracking-wider">{accountNo}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(accountNo, 'accountNo')}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  {copiedField === 'accountNo' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'accountNo' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
            )}

            {/* Account Owner Name */}
            {accountName && (
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">Chủ tài khoản:</span>
                    <span className="font-bold text-slate-800 uppercase">{accountName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Memo / Description */}
            {memo && (
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-slate-400 block font-medium">Nội dung chuyển khoản:</span>
                  <span className="font-semibold text-slate-800 break-all">{memo}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(memo, 'memo')}
                  className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                >
                  {copiedField === 'memo' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'memo' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            {qrUrl && (
              <button
                type="button"
                onClick={handleDownloadQr}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Lưu mã QR</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-2xl cursor-pointer transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              ✓ Đã hiểu / Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
