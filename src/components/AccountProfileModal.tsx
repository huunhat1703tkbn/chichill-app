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
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900">Tài Khoản Zalo & Đồng Bộ</h2>
              <p className="text-[11px] text-gray-500">Quản lý hồ sơ & đồng bộ dữ liệu đa thiết bị</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* User Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-blue-50 border border-emerald-100/80 flex items-center gap-3.5 shadow-2xs">
            {userProfile?.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
              />
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'Z'}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 truncate">
                  {userProfile?.name || 'Người dùng Zalo'}
                </h3>
                <span className="bg-[#0068FF] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0">
                  Zalo
                </span>
              </div>

              {userProfile?.id ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-gray-500 font-mono">
                    ID: {String(userProfile.id).slice(0, 10)}...
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 text-gray-400 hover:text-emerald-700 rounded transition-colors"
                    title="Sao chép Zalo User ID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              ) : (
                <div className="mt-1">
                  <p className="text-[11px] text-amber-600 font-medium">
                    Đang dùng tài khoản khách cục bộ (default_user)
                  </p>
                  <button
                    onClick={() => setShowManualLink(!showManualLink)}
                    className="text-[11px] text-blue-600 font-bold hover:underline mt-0.5 cursor-pointer inline-block"
                  >
                    {showManualLink ? 'Ẩn nhập ID' : '👉 Nhập ID Zalo điện thoại để kéo dữ liệu'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Manual ID Input Section (for syncing Web without OAuth) */}
          {showManualLink && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5 animate-in fade-in">
              <p className="text-xs font-bold text-blue-900">
                Nhập Zalo User ID từ điện thoại:
              </p>
              <input
                type="text"
                placeholder="Ví dụ: 8631716577946675571"
                value={manualIdInput}
                onChange={(e) => setManualIdInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Tên hiển thị (Tùy chọn)"
                value={manualNameInput}
                onChange={(e) => setManualNameInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleConnectManualId}
                disabled={!manualIdInput.trim()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Kết nối & Kéo toàn bộ nhóm từ ID này
              </button>
            </div>
          )}

          {/* Cloud Sync Status Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-gray-800">Đồng bộ Cloud Đa Thiết Bị</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Tự động
              </span>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Dữ liệu thu chi, hạn mức ngân sách, sổ nợ và các nhóm chia bill được đồng bộ liên tục giữa Điện thoại Zalo Mini App và Web Render.
            </p>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="w-full py-2 px-3 bg-white hover:bg-blue-50 active:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
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
              className="w-full p-3 bg-white hover:bg-slate-50 border border-gray-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Cài đặt cảnh báo chi tiêu</p>
                  <p className="text-[10px] text-gray-500">Tùy chỉnh thông báo Zalo & chuông báo động</p>
                </div>
              </div>
              <span className="text-gray-400 text-xs">›</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onSwitchAccount();
              }}
              className="w-full p-3 bg-white hover:bg-slate-50 border border-gray-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Đổi tài khoản Zalo khác</p>
                  <p className="text-[10px] text-gray-500">Đăng nhập bằng tài khoản Zalo mới</p>
                </div>
              </div>
              <span className="text-gray-400 text-xs">›</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full p-3 bg-white hover:bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 group-hover:scale-105 transition-transform">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-700">Đăng xuất</p>
                  <p className="text-[10px] text-rose-400">Xóa phiên đăng nhập trên thiết bị này</p>
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
