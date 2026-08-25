import React, { useState } from 'react';
import {
  X,
  Bell,
  BellRing,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Settings,
  Share2,
  ExternalLink,
  Smartphone,
  Send,
  Sliders,
  Copy,
  Check,
} from 'lucide-react';
import { BudgetNotification, CategoryCode, CategoryInfo, NotificationSettings } from '../types';
import { formatZaloBudgetMessage, playAlertChime, triggerZaloNotification, sendSystemNotification, shareZaloMessage } from '../utils/notificationService';

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
  settings,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onOpenSettings,
  onNavigateToBudgets,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'zalo'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'zalo') return n.channel === 'zalo' || n.channel === 'both';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleCopyZalo = (n: BudgetNotification) => {
    const text = formatZaloBudgetMessage(n.categoryLabel, n.spent, n.limit, n.percentage, n.level);
    shareZaloMessage(text, `Cảnh báo chi tiêu: ${n.categoryLabel}`);
    setCopiedId(n.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleResendZalo = async (n: BudgetNotification) => {
    const text = formatZaloBudgetMessage(n.categoryLabel, n.spent, n.limit, n.percentage, n.level);
    shareZaloMessage(text, `Cảnh báo chi tiêu: ${n.categoryLabel}`);

    if (settings.zaloUserId) {
      await triggerZaloNotification({
        categoryLabel: n.categoryLabel,
        spent: n.spent,
        limit: n.limit,
        percentage: n.percentage,
        level: n.level,
        zaloUserId: settings.zaloUserId,
      });
    }
    setCopiedId(n.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-gray-900">Trung Tâm Cảnh Báo Ngân Sách</h2>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Thông báo Zalo & Hệ thống cảnh báo chi tiêu</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
              title="Cài đặt thông báo"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Quick Actions */}
        <div className="px-5 py-3 border-b border-gray-100 bg-white flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full font-bold transition-colors cursor-pointer ${
                filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('zalo')}
              className={`px-3 py-1 rounded-full font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                filter === 'zalo' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Zalo</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Đọc tất cả
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-bold text-gray-400 hover:text-rose-600 cursor-pointer"
                title="Xóa tất cả thông báo"
              >
                Xóa hết
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1 scrollbar-thin max-h-[60vh]">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Không có cảnh báo nào!</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Tình trạng chi tiêu đang rất tốt!
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isDanger = n.level === 'danger';
              const catInfo = categories[n.category] || {
                color: '#2563EB',
                bgColor: '#DBEAFE',
                label: n.categoryLabel,
              };

              return (
                <div
                  key={n.id}
                  onClick={() => onMarkAsRead(n.id)}
                  className={`p-4 rounded-2xl border transition-all relative space-y-3 cursor-pointer ${
                    !n.isRead
                      ? isDanger
                        ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                        : 'bg-amber-50/70 border-amber-200 shadow-xs'
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Top Bar inside Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                        style={{ backgroundColor: catInfo.bgColor, color: catInfo.color }}
                      >
                        {isDanger ? '🚨' : '⚠️'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-gray-900">{n.title}</h4>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500">{n.timestamp}</p>
                      </div>
                    </div>

                    {/* Badge % */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                          isDanger
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {n.percentage}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(n.id);
                        }}
                        className="p-1 text-gray-300 hover:text-rose-500 rounded-md transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Message */}
                  <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>

                  {/* Spending Metric Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="w-full h-2 bg-gray-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isDanger ? 'bg-rose-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(n.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>
                        Đã chi: <b>{n.spent.toLocaleString('vi-VN')} ₫</b>
                      </span>
                      <span>
                        Hạn mức: <b>{n.limit.toLocaleString('vi-VN')} ₫</b>
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100/80 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyZalo(n);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-blue-600 px-2 py-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      title="Sao chép nội dung tin nhắn Zalo"
                    >
                      {copiedId === n.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Đã copy Zalo!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Zalo</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResendZalo(n);
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100 cursor-pointer"
                        title="Bắn tin nhắn tới Zalo"
                      >
                        <Smartphone className="w-3 h-3 text-blue-600" />
                        <span>Bắn Zalo</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onNavigateToBudgets();
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <span>Sửa hạn mức</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Cài đặt ngưỡng & Kênh nhận tin</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
