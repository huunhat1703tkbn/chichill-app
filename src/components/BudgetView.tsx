import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle2, Edit3, Settings2, PlusCircle, BellRing, Smartphone, Copy, Check } from 'lucide-react';
import { CategoryBudget, CategoryCode, CategoryInfo, Transaction, NotificationSettings } from '../types';
import { formatZaloBudgetMessage, triggerZaloNotification, shareZaloMessage } from '../utils/notificationService';

interface BudgetViewProps {
  budgets: CategoryBudget[];
  categories: Record<CategoryCode, CategoryInfo>;
  transactions: Transaction[];
  notificationSettings?: NotificationSettings;
  onUpdateBudget: (category: CategoryCode, limitAmount: number) => void;
  onOpenCategoryManager: () => void;
  onOpenNotificationSettings?: () => void;
  onOpenNotificationCenter?: () => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  categories,
  transactions,
  notificationSettings,
  onUpdateBudget,
  onOpenCategoryManager,
  onOpenNotificationSettings,
  onOpenNotificationCenter,
}) => {
  const [editingCategory, setEditingCategory] = useState<CategoryCode | null>(null);
  const [newLimitInput, setNewLimitInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sendingZaloCode, setSendingZaloCode] = useState<string | null>(null);

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' đ';
  };

  const threshold = notificationSettings?.warningThreshold || 80;

  // Calculate spent amount per category dynamically
  const categorySpentMap: Record<CategoryCode, number> = {};

  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      categorySpentMap[tx.category] = (categorySpentMap[tx.category] || 0) + tx.amount;
    }
  });

  const handleEditClick = (category: CategoryCode, currentLimit: number) => {
    setEditingCategory(category);
    setNewLimitInput((currentLimit / 1000).toString()); // in 'k' for convenience
  };

  const handleSaveBudget = (category: CategoryCode) => {
    const num = parseFloat(newLimitInput.replace(/,/g, '.'));
    if (!isNaN(num) && num >= 0) {
      const limitVND = num < 1000 ? Math.round(num * 1000000) : Math.round(num * 1000);
      onUpdateBudget(category, limitVND);
    }
    setEditingCategory(null);
  };

  const handleCopyZaloForCategory = (catLabel: string, spent: number, limit: number, code: string) => {
    const percentage = Math.round((spent / (limit || 1)) * 100);
    const level = percentage >= 100 ? 'danger' : 'warning';
    const text = formatZaloBudgetMessage(catLabel, spent, limit, percentage, level);
    shareZaloMessage(text, `Cảnh báo ngân sách: ${catLabel}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleSendZaloForCategory = async (catLabel: string, spent: number, limit: number, code: string) => {
    setSendingZaloCode(code);
    const percentage = Math.round((spent / (limit || 1)) * 100);
    const level = percentage >= 100 ? 'danger' : 'warning';
    const text = formatZaloBudgetMessage(catLabel, spent, limit, percentage, level);

    // Kích hoạt chia sẻ Zalo trực tiếp hoặc sao chép tin nhắn
    shareZaloMessage(text, `Cảnh báo ngân sách: ${catLabel}`);

    await triggerZaloNotification({
      categoryLabel: catLabel,
      spent,
      limit,
      percentage,
      level,
      zaloPhoneOrId: notificationSettings?.zaloPhoneOrId || '0901234567',
      zaloWebhookUrl: notificationSettings?.zaloWebhookUrl,
    });

    setSendingZaloCode(null);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // Check alerts based on configured threshold
  const overBudgetCategories = budgets.filter((b) => {
    const spent = categorySpentMap[b.category] || 0;
    return b.limitAmount > 0 && (spent / b.limitAmount) >= (threshold / 100);
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-24">
      {/* AI Budget Overview Banner & Category Customizer Action */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Trạng Thái & Hạn Mức Ngân Sách</h2>
              <p className="text-xs text-gray-500">Tự động nhắc nhở Zalo & Hệ thống khi chi tiêu vượt {threshold}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNotificationSettings && (
              <button
                type="button"
                onClick={onOpenNotificationSettings}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                title="Cài đặt thông báo & Zalo Bot"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
                <span>🔔 Nhắc Nhở Zalo</span>
              </button>
            )}

            <button
              onClick={onOpenCategoryManager}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
            >
              <Settings2 className="w-4 h-4" />
              <span>⚙️ Quản Lý Danh Mục</span>
            </button>
          </div>
        </div>

        {overBudgetCategories.length > 0 ? (
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-2 text-xs text-amber-900">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <b>Cảnh báo ngân sách ({threshold}%):</b> Bạn đã chi chạm hoặc vượt ngưỡng ở {overBudgetCategories.length} danh mục ({overBudgetCategories.map(c => (categories && categories[c.category]?.label) || c.category).join(', ')}).
                </p>
              </div>

              {onOpenNotificationCenter && (
                <button
                  type="button"
                  onClick={onOpenNotificationCenter}
                  className="shrink-0 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px]"
                >
                  Xem chi tiết
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 p-3 rounded-xl flex items-center justify-between gap-2 text-xs text-green-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <p>Tình hình tài chính tốt! Tất cả danh mục đều nằm trong ngưỡng an toàn (&lt;{threshold}%).</p>
            </div>
            <span className="text-[10px] font-bold text-green-700 bg-white/80 px-2 py-0.5 rounded-md border border-green-200">
              Auto Alert: Bật
            </span>
          </div>
        )}
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const catInfo = (categories && categories[b.category]) || {
            code: b.category,
            label: b.category || 'Danh mục',
            iconName: 'Tag',
            color: '#3B82F6',
            bgColor: '#DBEAFE',
            description: 'Danh mục tùy chỉnh'
          };

          const catLabel = catInfo?.label || b.category || 'Danh mục';
          const catBgColor = catInfo?.bgColor || '#DBEAFE';
          const catColor = catInfo?.color || '#3B82F6';

          const spent = categorySpentMap[b.category] || 0;
          const limit = b.limitAmount || 1;
          const percentage = Math.min(Math.round((spent / limit) * 100), 100);
          const rawPercentage = Math.round((spent / limit) * 100);
          const isWarning = rawPercentage >= threshold;
          const isDanger = rawPercentage >= 100;

          let progressColor = 'bg-blue-500';
          if (b.category === 'Food') progressColor = 'bg-amber-500';
          if (b.category === 'Shopping') progressColor = 'bg-pink-500';
          if (isWarning) progressColor = 'bg-amber-500';
          if (isDanger) progressColor = 'bg-rose-500 animate-pulse';

          return (
            <div
              key={b.category}
              className={`bg-white rounded-2xl p-5 border shadow-sm space-y-3 relative transition-all ${
                isDanger
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isWarning
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-gray-100'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ backgroundColor: catBgColor, color: catColor }}
                  >
                    {catLabel.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-gray-900">{catLabel}</h3>
                      {catInfo.isCustom && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-1 rounded font-semibold">
                          Tùy chỉnh
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{catInfo.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCopyZaloForCategory(catLabel, spent, b.limitAmount, b.category)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Sao chép tin nhắn cảnh báo Zalo"
                  >
                    {copiedCode === b.category ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleEditClick(b.category, b.limitAmount)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Sửa hạn mức"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Edit Modal Inline */}
              {editingCategory === b.category ? (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    Sửa Hạn Mức {catInfo.label} (VNĐ):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newLimitInput}
                      onChange={(e) => setNewLimitInput(e.target.value)}
                      placeholder="Ví dụ: 3000 (= 3,000,000đ)"
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => handleSaveBudget(b.category)}
                      className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="bg-gray-200 text-gray-700 text-xs px-2.5 py-1.5 rounded-lg hover:bg-gray-300 cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                /* Budget Stats & Sleek Progress Bar */
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500 font-medium">{catInfo.label}</span>
                      {isDanger ? (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                          🚨 Vượt hạn mức
                        </span>
                      ) : isWarning ? (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                          ⚠️ Gần chạm hạn mức
                        </span>
                      ) : null}
                    </div>
                    <span className={`font-bold ${isDanger ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-gray-900'}`}>
                      {rawPercentage}%
                    </span>
                  </div>

                  {/* Sleek Theme Progress Bar */}
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-gray-500">
                      Đã dùng: <b>{formatVND(spent)}</b>
                    </span>
                    <span className="text-gray-500">
                      Hạn mức: <b>{formatVND(b.limitAmount)}</b>
                    </span>
                  </div>

                  {/* Quick Zalo trigger when threshold reached */}
                  {isWarning && (
                    <div className="pt-2 flex items-center justify-between text-[11px] border-t border-gray-100">
                      <span className="text-amber-800 font-medium">Cần nhắc nhở qua Zalo?</span>
                      <button
                        type="button"
                        onClick={() => handleSendZaloForCategory(catLabel, spent, b.limitAmount, b.category)}
                        disabled={sendingZaloCode === b.category}
                        className="flex items-center gap-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 font-bold px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Smartphone className="w-3 h-3 text-blue-600" />
                        <span>{sendingZaloCode === b.category ? 'Đang gửi...' : 'Gửi Zalo'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
