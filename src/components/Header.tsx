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
  onOpenAppTour?: () => void;
  onOpenAddModal: () => void;
  onOpenNotificationCenter: () => void;
  onOpenAccountProfile?: () => void;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unreadAlertCount = 0,
  userProfile,
  onOpenSlangGuide,
  onOpenAppTour,
  onOpenNotificationCenter,
  onOpenAccountProfile,
  onOpenLogin,
}) => {
  return (
    <header id="zalo-app-header" className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-30 select-none transition-all">
      <div className="max-w-4xl mx-auto px-3.5 h-15 flex items-center justify-between gap-2">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2 min-w-max shrink-0">
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

          <div>
            <div className="flex items-center gap-1">
              <span className="text-base font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                ChiChill
              </span>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wide">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">
              Trợ lý tài chính
            </p>
          </div>
        </div>

        {/* Right Side Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* App Tour Guide Button */}
          {onOpenAppTour && (
            <button
              id="btn-app-tour"
              onClick={onOpenAppTour}
              className="w-9 h-9 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100/80 active:scale-95 border border-emerald-200/80 rounded-full text-emerald-800 transition-all cursor-pointer shadow-2xs shrink-0"
              title="Xem tour giới thiệu các chức năng của App"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
            </button>
          )}

          {/* Slang & AI Guide Pill */}
          <button
            id="btn-slang-guide"
            onClick={onOpenSlangGuide}
            className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200/80 active:scale-95 border border-slate-200/60 rounded-full text-slate-700 transition-all cursor-pointer shrink-0"
            title="Từ điển & Hướng dẫn lệnh AI"
          >
            <span className="text-sm">📖</span>
          </button>

          {/* Notification Bell */}
          <button
            id="btn-notification-center"
            onClick={onOpenNotificationCenter}
            className="relative w-9 h-9 flex items-center justify-center text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200/80 active:scale-95 border border-slate-200/60 rounded-full transition-all cursor-pointer shrink-0"
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

          {/* User Profile Avatar / Login Button */}
          {userProfile?.id ? (
            <button
              onClick={onOpenAccountProfile}
              className="relative p-0.5 rounded-full hover:ring-2 ring-emerald-400 transition-all cursor-pointer active:scale-95 shrink-0"
              title={`Hồ sơ: ${userProfile.name || 'Người dùng'}`}
            >
              {userProfile?.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/60 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </button>
          ) : (
            <button
              id="btn-header-link-account"
              onClick={onOpenLogin}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-full shadow-sm shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
              title="Liên kết tài khoản"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-100" />
              <span className="hidden sm:inline text-[11px] font-semibold">Tài khoản</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

