import React from 'react';
import { HelpCircle, Bell, BellRing, User, ShieldCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalReceivables: number;
  totalPayables: number;
  unreadAlertCount?: number;
  userProfile?: any;
  onOpenSlangGuide: () => void;
  onOpenAddModal: () => void;
  onOpenNotificationCenter: () => void;
  onOpenAccountProfile?: () => void;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unreadAlertCount = 0,
  userProfile,
  onOpenSlangGuide,
  onOpenNotificationCenter,
  onOpenAccountProfile,
  onOpenLogin,
}) => {
  return (
    <header id="zalo-app-header" className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 select-none transition-all">
      <div className="max-w-4xl mx-auto px-4 h-15 flex items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src="/logo.png"
              alt="ChiChill"
              className="w-9 h-9 rounded-2xl shadow-sm shadow-emerald-900/10 object-cover bg-white ring-1 ring-slate-100"
              onError={(e) => {
                (e.currentTarget as any).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwNTk2NjkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTggM2EzIDMgMCAwIDAgMCA2IDMgMyAwIDAgMCAwLTZtLTMgM2MtMi41IDAtNC41IDItNC41IDUgMCAzLjUgMyA1IDYgNXMyLTEuNSAyLTIiPjwvcGF0aD48L3N2Zz4=';
              }}
            />
            {/* Live Indicator Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </div>

          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                ChiChill
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wide">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
              <span>Trợ lý tài chính thế hệ mới</span>
            </p>
          </div>
        </div>

        {/* Right Side Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Slang & AI Guide Pill */}
          <button
            id="btn-slang-guide"
            onClick={onOpenSlangGuide}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 active:scale-95 border border-slate-200/60 rounded-full text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            title="Từ điển & Hướng dẫn lệnh AI"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden xs:inline text-[11px]">Hướng dẫn</span>
          </button>

          {/* Notification Bell */}
          <button
            id="btn-notification-center"
            onClick={onOpenNotificationCenter}
            className="relative w-9 h-9 flex items-center justify-center text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200/80 active:scale-95 border border-slate-200/60 rounded-full transition-all cursor-pointer"
            title="Thông báo & Cảnh báo chi tiêu"
          >
            {unreadAlertCount > 0 ? (
              <BellRing className="w-4 h-4 text-emerald-600 animate-pulse" />
            ) : (
              <Bell className="w-4 h-4" />
            )}

            {unreadAlertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
              </span>
            )}
          </button>

          {/* User Profile Pill or Login */}
          {userProfile?.id ? (
            <button
              onClick={onOpenAccountProfile}
              className="flex items-center gap-1.5 p-1 pr-2.5 sm:pr-3 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-full transition-all cursor-pointer active:scale-95"
              title={`Hồ sơ: ${userProfile.name || 'Người dùng'}`}
            >
              {userProfile?.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt="Avatar"
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-400 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
              )}
              <span className="text-xs font-bold text-emerald-900 max-w-[100px] sm:max-w-[140px] truncate">
                {userProfile?.name || 'Tôi'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 hidden sm:inline" />
            </button>
          ) : (
            <button
              id="btn-header-link-account"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-full shadow-sm shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-100" />
              <span className="text-[11px] font-semibold">Liên kết tài khoản</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

