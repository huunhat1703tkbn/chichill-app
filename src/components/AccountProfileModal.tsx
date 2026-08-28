import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  RefreshCw,
  LogOut,
  BellRing,
  Cloud,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Building2,
  Upload,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { VIETNAM_BANKS, generateVietQRUrl } from '../utils/vietqr';
import { BankAccountInfo } from '../types';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
  onSyncCloud: () => Promise<void> | void;
  onOpenNotificationSettings: () => void;
  onSwitchAccount: () => void;
  onLogout: () => void;
  onDirectLinkUserId?: (userId: string, name?: string) => void;
  onUpdateUserProfile?: (profile: any) => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSyncCloud,
  onOpenNotificationSettings,
  onSwitchAccount,
  onLogout,
  onDirectLinkUserId,
  onUpdateUserProfile,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [manualIdInput, setManualIdInput] = useState('');
  const [manualNameInput, setManualNameInput] = useState('');
  const [showManualLink, setShowManualLink] = useState(false);

  // Bank & QR states
  const [bankCode, setBankCode] = useState(userProfile?.bankCode || 'MB');
  const [accountNo, setAccountNo] = useState(userProfile?.accountNo || '');
  const [accountName, setAccountName] = useState(userProfile?.accountName || userProfile?.name || '');
  const [customQrImage, setCustomQrImage] = useState<string | undefined>(userProfile?.customQrImage);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [bankSavedSuccess, setBankSavedSuccess] = useState(false);
  const [showBankSettings, setShowBankSettings] = useState(false);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await onSyncCloud();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyId = () => {
    if (userProfile?.id) {
      navigator.clipboard.writeText(String(userProfile.id));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleUploadQrImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, JPEG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomQrImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomQr = () => {
    setCustomQrImage(undefined);
  };

  const handleSaveBankAccount = () => {
    setIsSavingBank(true);
    const selectedBank = VIETNAM_BANKS.find((b) => b.code === bankCode);
    const updatedProfile = {
      ...(userProfile || {}),
      bankCode,
      bankName: selectedBank?.shortName || bankCode,
      accountNo: accountNo.trim(),
      accountName: accountName.trim().toUpperCase(),
      customQrImage,
    };

    if (onUpdateUserProfile) {
      onUpdateUserProfile(updatedProfile);
    }
    try {
      localStorage.setItem('chichill_user_profile', JSON.stringify(updatedProfile));
    } catch (e) {
      console.error('Save profile to localstorage error:', e);
    }

    setIsSavingBank(false);
    setBankSavedSuccess(true);
    setTimeout(() => setBankSavedSuccess(false), 3000);
  };

  const selectedBankObj = VIETNAM_BANKS.find((b) => b.code === bankCode);
  const previewQrUrl =
    customQrImage ||
    (bankCode && accountNo.trim()
      ? generateVietQRUrl({
          bankId: bankCode,
          accountNo: accountNo.trim(),
          accountName: accountName.trim().toUpperCase(),
          amount: 50000,
          memo: 'ChiChill Test QR',
        })
      : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="emerald-gradient p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/20">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white">Hồ Sơ & Đồng Bộ Dữ Liệu</h2>
              <p className="text-[11px] text-emerald-100/80 font-medium">Quản lý hồ sơ & đồng bộ dữ liệu đa thiết bị</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* User Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-emerald-50 border border-emerald-100/80 flex items-center gap-3.5 shadow-2xs">
            {userProfile?.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
              />
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                  {userProfile?.name || 'Người dùng'}
                </h3>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0">
                  Đã liên kết
                </span>
              </div>

              {userProfile?.id ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    ID: {String(userProfile.id).slice(0, 10)}...
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                    title="Sao chép User ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ) : (
                <div className="mt-1">
                  <p className="text-[11px] text-amber-600 font-medium">
                    Đang dùng tài khoản khách cục bộ
                  </p>
                  <button
                    onClick={() => setShowManualLink(!showManualLink)}
                    className="text-[11px] text-emerald-700 font-bold hover:underline mt-0.5 cursor-pointer inline-block"
                  >
                    {showManualLink ? 'Ẩn nhập ID' : '👉 Nhập ID để đồng bộ dữ liệu'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Manual ID Input Section (for syncing Web without OAuth) */}
          {showManualLink && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5 animate-in fade-in">
              <p className="text-xs font-bold text-emerald-900">
                Nhập User ID từ thiết bị khác:
              </p>
              <input
                type="text"
                placeholder="Ví dụ: 8631716577946675571"
                value={manualIdInput}
                onChange={(e) => setManualIdInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Tên hiển thị (Tùy chọn)"
                value={manualNameInput}
                onChange={(e) => setManualNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleConnectManualId}
                disabled={!manualIdInput.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/25"
              >
                Kết nối & Kéo toàn bộ dữ liệu từ ID này
              </button>
            </div>
          )}

          {/* Bank Account & VietQR / Custom QR Settings Section */}
          <div className="p-3.5 bg-gradient-to-br from-slate-50 to-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">Tài Khoản Ngân Hàng & VietQR</span>
                  <span className="text-[10px] text-slate-500 block">Dùng để tạo QR chuyển khoản tự động</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBankSettings(!showBankSettings)}
                className="text-xs font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl cursor-pointer transition-colors"
              >
                {showBankSettings ? 'Thu gọn' : 'Chỉnh sửa'}
              </button>
            </div>

            {/* Collapsed view summary */}
            {!showBankSettings && accountNo && (
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{selectedBankObj?.shortName || bankCode}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-emerald-700">{accountNo}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">
                    {accountName || 'Chưa đặt tên chủ TK'}
                  </p>
                </div>
                {previewQrUrl && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <QrCode className="w-3 h-3" />
                    <span>Có QR</span>
                  </span>
                )}
              </div>
            )}

            {/* Expanded Editor */}
            {showBankSettings && (
              <div className="space-y-3 pt-1 animate-in fade-in">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">
                    Chọn Ngân Hàng (Việt Nam):
                  </label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                  >
                    {VIETNAM_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.shortName} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Số tài khoản:
                    </label>
                    <input
                      type="text"
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value)}
                      placeholder="VD: 0987654321"
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      Tên chủ tài khoản:
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                      placeholder="VD: NGUYEN VAN A"
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold uppercase text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Custom QR Image Upload Option */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ảnh mã QR cá nhân (Tùy chọn):</span>
                    </label>
                    {customQrImage && (
                      <button
                        type="button"
                        onClick={handleRemoveCustomQr}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Xóa ảnh</span>
                      </button>
                    )}
                  </div>

                  {customQrImage ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={customQrImage}
                        alt="QR cá nhân"
                        className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-slate-50"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Đang dùng ảnh QR cá nhân đã tải lên
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="flex items-center justify-center gap-1.5 w-full bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl py-2 px-3 text-[11px] font-semibold text-slate-600 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-slate-400" />
                        <span>Tải ảnh QR (MoMo / VietQR / ViettelMoney)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadQrImage}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[9px] text-slate-400 mt-1">
                        *Nếu không tải ảnh, hệ thống sẽ tự sinh mã VietQR Napas chuẩn theo STK & Ngân hàng ở trên.
                      </p>
                    </div>
                  )}
                </div>

                {/* QR Preview Box */}
                {previewQrUrl && (
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Xem trước mã QR:
                    </span>
                    <img
                      src={previewQrUrl}
                      alt="VietQR Preview"
                      className="w-36 h-36 object-contain rounded-lg shadow-2xs border border-slate-100"
                    />
                  </div>
                )}

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSaveBankAccount}
                  disabled={isSavingBank}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {bankSavedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>✅ Đã lưu thông tin tài khoản & QR!</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Lưu thông tin tài khoản & QR</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Cloud Sync Status Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-extrabold text-slate-800">Đồng bộ Cloud Đa Thiết Bị</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Tự động
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Dữ liệu thu chi, hạn mức ngân sách, sổ nợ và các nhóm chia bill được đồng bộ liên tục trên mọi thiết bị của bạn.
            </p>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="w-full py-2.5 px-3 bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isSyncing ? 'Đang đồng bộ dữ liệu...' : syncSuccess ? '✅ Đã đồng bộ mới nhất!' : 'Đồng bộ lại dữ liệu ngay'}</span>
            </button>
          </div>

          {/* Action List */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenNotificationSettings();
              }}
              className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Cài đặt cảnh báo chi tiêu</p>
                  <p className="text-[10px] text-slate-500">Tùy chỉnh thông báo & chuông báo động</p>
                </div>
              </div>
              <span className="text-slate-400 text-xs">›</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onSwitchAccount();
              }}
              className="w-full p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Đổi tài khoản khác</p>
                  <p className="text-[10px] text-slate-500">Liên kết với tài khoản mới</p>
                </div>
              </div>
              <span className="text-slate-400 text-xs">›</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn đăng xuất và xóa phiên đăng nhập trên thiết bị này?')) {
                  onClose();
                  onLogout();
                }
              }}
              className="w-full p-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 group-hover:scale-105 transition-transform">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-600">Đăng xuất tài khoản</p>
                  <p className="text-[10px] text-rose-400">Xóa thông tin lưu trên máy này</p>
                </div>
              </div>
              <span className="text-rose-400 text-xs">›</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400">
            ChiChill AI · Trợ lý Quản lý Chi tiêu Văn phòng Thông minh ☕
          </p>
        </div>
      </div>
    </div>
  );
};
