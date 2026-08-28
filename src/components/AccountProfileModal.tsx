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
} from 'lucide-react';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
  onSyncCloud: () => Promise<void> | void;
  onOpenNotificationSettings: () => void;
  onSwitchAccount: () => void;
  onLogout: () => void;
  onDirectLinkUserId?: (userId: string, name?: string) => void;
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
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [manualIdInput, setManualIdInput] = useState('');
  const [manualNameInput, setManualNameInput] = useState('');
  const [showManualLink, setShowManualLink] = useState(false);

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

  const handleConnectManualId = () => {
    if (!manualIdInput.trim()) return;
    if (onDirectLinkUserId) {
      onDirectLinkUserId(manualIdInput.trim(), manualNameInput.trim() || 'Người dùng Zalo');
      setShowManualLink(false);
      onClose();
    }
  };

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
                onClick={handleConnectManualId}
                disabled={!manualIdInput.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/25"
              >
                Kết nối & Kéo toàn bộ dữ liệu từ ID này
              </button>
            </div>
          )}

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
