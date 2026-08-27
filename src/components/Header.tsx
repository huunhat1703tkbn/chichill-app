import React from 'react';
import { Sparkles, Wallet, HelpCircle, ArrowUpRight, ArrowDownLeft, Receipt, Zap, Bell, BellRing, Plus } from 'lucide-react';

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
  currentBalance,
  monthlyIncome,
  monthlyExpense,
  totalReceivables,
  totalPayables,
  unreadAlertCount = 0,
  userProfile,
  onOpenSlangGuide,
  onOpenAddModal,
  onOpenNotificationCenter,
  onOpenAccountProfile,
  onOpenLogin,
}) => {
  const formatMoney = (val: number) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <header id="zalo-app-header" className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs select-none">
      {/* Sleek Interface Top Header Bar */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img src="/logo.png" alt="ChiChill Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-md shadow-emerald-200 shrink-0 object-cover bg-white" onError={(e) => {
            (e.currentTarget as any).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOCAzYTMgMyAwIDAgMCAwIDYgMyAzIDAgMCAwIDAtNm0tMyAzYy0yLjUgMC00LjUgMi00LjUgNSAwIDMuNSAzIDUgNiA1czItMS41IDItMiI+PC9wYXRoPjwvc3ZnPg=='; // fallback coffee icon
          }} />
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight">
                ChiChill <span className="text-emerald-600 italic">AI</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-bold truncate">
              Chi có kế hoạch · Chill không âu lo ☕
            </p>
          </div>
        </div>

        {/* Right Side Header Metrics & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden md:block text-right border-r border-gray-200 pr-3">
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Số dư ví</p>
            <p className="text-sm font-black text-gray-900">{formatMoney(currentBalance)}</p>
          </div>

          {/* Notification Bell with Badge */}
          <button
            id="btn-notification-center"
            onClick={onOpenNotificationCenter}
            className="relative min-w-[36px] min-h-[36px] p-2 text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 border border-gray-200 rounded-full transition-colors flex items-center justify-center cursor-pointer"
            title="Trung tâm thông báo & Cảnh báo chi tiêu"
          >
            {unreadAlertCount > 0 ? (
              <BellRing className="w-4 h-4 text-amber-600 animate-pulse" />
            ) : (
              <Bell className="w-4 h-4" />
            )}

            {unreadAlertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
              </span>
            )}
          </button>

          {/* Slang Guide Button */}
          <button
            id="btn-slang-guide"
            onClick={onOpenSlangGuide}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 min-h-[36px] bg-gray-100 hover:bg-gray-200 active:bg-gray-300 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
            title="Từ điển tiếng lóng tài chính cá nhân"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="hidden xs:inline text-[11px] sm:text-xs">Hướng dẫn</span>
          </button>

          {/* User Profile Avatar or Zalo Login Button */}
          {userProfile?.id ? (
            <button
              onClick={onOpenAccountProfile}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition-all cursor-pointer shadow-2xs"
              title={`Hồ sơ tài khoản: ${userProfile.name || 'Zalo User'} (Bấm để xem hồ sơ & đồng bộ Cloud)`}
            >
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="User Avatar" className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 shadow-xs border border-emerald-300 shrink-0 object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'Z'}
                </div>
              )}
              <span className="inline text-[11px] sm:text-xs font-bold text-emerald-800 max-w-[140px] sm:max-w-[220px] md:max-w-none truncate">
                {userProfile?.name || 'Zalo User'}
              </span>
            </button>
          ) : (
            <button
              id="btn-header-zalo-login"
              onClick={onOpenLogin}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-[#0068FF] hover:bg-[#005AE0] active:scale-95 text-white font-bold text-xs rounded-full shadow-sm shadow-blue-500/20 transition-all cursor-pointer shrink-0"
              title="Đăng nhập bằng Zalo để đồng bộ dữ liệu đa thiết bị"
            >
              <span className="font-extrabold text-[11px] tracking-tight">Zalo</span>
              <span className="text-[11px] font-semibold">Đăng nhập</span>
            </button>
          )}
        </div>
      </div>

      {/* Sleek Secondary Financial Metrics Bar */}
      <div className="bg-slate-50 border-t border-slate-100 px-3 sm:px-4 py-1.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs gap-2 overflow-x-auto scrollbar-none touch-scroll">
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-[11px]">Ví:</span>
              <span className="font-extrabold text-blue-700 text-xs">{formatMoney(currentBalance)}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-gray-500 font-normal text-[11px]">Thu:</span>
              <span className="text-xs">{formatMoney(monthlyIncome)}</span>
            </div>
            <div className="flex items-center gap-1 text-rose-600 font-semibold">
              <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="text-gray-500 font-normal text-[11px]">Chi:</span>
              <span className="text-xs">{formatMoney(monthlyExpense)}</span>
            </div>
          </div>

          {(totalReceivables > 0 || totalPayables > 0) && (
            <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-gray-200 text-[10px] sm:text-[11px] shrink-0">
              <span className="text-amber-600 font-semibold">Thu: +{formatMoney(totalReceivables)}</span>
              <span className="text-gray-300">|</span>
              <span className="text-rose-600 font-semibold">Trả: -{formatMoney(totalPayables)}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

