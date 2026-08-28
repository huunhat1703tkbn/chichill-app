import React, { useState } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Settings,
  Share2,
  ArrowUpRight,
  Sliders,
  Copy,
  Check,
  CalendarCheck,
  CheckCheck,
  Flame,
} from 'lucide-react';
import { BudgetNotification, CategoryCode, CategoryInfo, NotificationSettings } from '../types';
import { formatZaloBudgetMessage, shareZaloMessage } from '../utils/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: BudgetNotification[];
  categories: Record<CategoryCode, CategoryInfo>;
  settings: NotificationSettings;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onOpenSettings: () => void;
  onNavigateToBudgets: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  categories,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onOpenSettings,
  onNavigateToBudgets,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'warning'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const warningCount = notifications.filter((n) => n.percentage >= 80).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'warning') return n.percentage >= 80 || n.level === 'danger' || n.level === 'warning';
    return true;
  });

  const formatDisplayTime = (ts: string) => {
    if (!ts) return 'Vừa xong';
    if (ts.includes('T') || ts.includes('-') || ts.length > 10) {
      try {
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          const today = new Date();
          if (d.toDateString() === today.toDateString()) {
            return `${timeStr} · Hôm nay`;
          }
          return `${timeStr} · ${d.getDate()}/${d.getMonth() + 1}`;
        }
      } catch {}
    }
    return `${ts} · Hôm nay`;
  };

  const handleShareNotif = (n: BudgetNotification) => {
    const text = formatZaloBudgetMessage(n.categoryLabel, n.spent, n.limit, n.percentage, n.level);
    shareZaloMessage(text, `Cảnh báo chi tiêu: ${n.categoryLabel}`);
    setCopiedId(n.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Emerald Gradient */}
        <div className="emerald-gradient p-5 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-md border border-white/25 shadow-inner">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">Thông Báo Chi Tiêu</h2>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full shadow-xs">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100/90 font-medium">Cảnh báo hạn mức & lịch giao dịch định kỳ</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Cài đặt thông báo"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Segmented Control & Actions Bar */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                filter === 'warning'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cảnh báo ({warningCount})
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đọc tất cả</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                title="Xóa tất cả thông báo"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Xóa hết</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="p-3 sm:p-4 space-y-2.5 overflow-y-auto flex-1 scrollbar-none max-h-[58vh]">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-100 shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-slate-800">Không có cảnh báo mới nào</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Mọi chi tiêu đều đang trong kế hoạch kiểm soát an toàn. Thảnh thơi sống chất! ☕✨
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isOverBudget = n.percentage >= 100 || n.level === 'danger';
              const isWarning = n.percentage >= 80 && !isOverBudget;
              const isAutoBill = n.category === 'ALL' || n.limit === 0;

              // Clean display title
              const displayCategory = n.categoryLabel || 'Chi tiêu';

              return (
                <div
                  key={n.id}
                  onClick={() => onMarkAsRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition-all relative space-y-3 cursor-pointer group ${
                    !n.isRead
                      ? isOverBudget
                        ? 'bg-rose-50/40 border-rose-200/90 shadow-xs hover:border-rose-300'
                        : isWarning
                        ? 'bg-amber-50/40 border-amber-200/90 shadow-xs hover:border-amber-300'
                        : 'bg-emerald-50/30 border-emerald-200/90 shadow-xs hover:border-emerald-300'
                      : 'bg-white border-slate-200/70 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top Row: Category Icon + Clean Title + Status Badge + Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Squircle Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                          isOverBudget
                            ? 'bg-rose-100/80 border-rose-200 text-rose-600'
                            : isWarning
                            ? 'bg-amber-100/80 border-amber-200 text-amber-700'
                            : isAutoBill
                            ? 'bg-emerald-100/80 border-emerald-200 text-emerald-700'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {isOverBudget ? (
                          <Flame className="w-4.5 h-4.5 animate-pulse" />
                        ) : isWarning ? (
                          <TrendingUp className="w-4.5 h-4.5" />
                        ) : isAutoBill ? (
                          <CalendarCheck className="w-4.5 h-4.5" />
                        ) : (
                          <Bell className="w-4.5 h-4.5" />
                        )}
                      </div>

                      {/* Title & Time */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                            {displayCategory}
                          </h4>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" title="Chưa đọc" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {formatDisplayTime(n.timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Badge & Trash Action */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isOverBudget ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          Vượt {n.percentage}%
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <TrendingUp className="w-3 h-3" />
                          Chạm {n.percentage}%
                        </span>
                      ) : isAutoBill ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Tự động
                        </span>
                      ) : null}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(n.id);
                        }}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content / Progress Metrics */}
                  {n.limit > 0 ? (
                    <div className="space-y-2 pt-0.5">
                      <div className="flex items-baseline justify-between text-xs">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[11px] text-slate-500 font-medium">Đã chi:</span>
                          <span className="font-extrabold text-slate-900 font-mono text-sm">
                            {n.spent.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Hạn mức:{' '}
                          <span className="font-bold text-slate-700 font-mono">
                            {n.limit.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                      </div>

                      {/* Modern Slim Gradient Progress Bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOverBudget
                              ? 'bg-gradient-to-r from-rose-500 to-red-600'
                              : isWarning
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(n.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {n.message}
                    </p>
                  )}

                  {/* Clean Bottom Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/90 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onNavigateToBudgets();
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Điều chỉnh hạn mức</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareNotif(n);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
                      title="Chia sẻ hoặc sao chép nội dung"
                    >
                      {copiedId === n.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-extrabold">Đã sao chép!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Chia sẻ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Cài đặt ngưỡng cảnh báo</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all shadow-2xs active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
