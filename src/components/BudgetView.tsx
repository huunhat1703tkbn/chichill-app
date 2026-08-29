import React, { useState, useMemo } from 'react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  BellRing,
  Smartphone,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Plus,
  BarChart3,
  Wallet,
  Utensils,
  Car,
  ShoppingBag,
  Briefcase,
  HandCoins,
  Home,
  Tv,
  Tag,
  Receipt,
  Trash2,
  X,
  Sparkles,
  Palette,
  Share2,
  Flame,
} from 'lucide-react';
import { CategoryBudget, CategoryCode, CategoryInfo, Transaction, NotificationSettings, SurvivalModeConfig } from '../types';
import { formatZaloBudgetMessage, triggerZaloNotification, shareZaloMessage } from '../utils/notificationService';

const PRESET_COLORS = [
  { name: 'Emerald', color: '#059669', bgColor: '#ECFDF5' },
  { name: 'Amber', color: '#D97706', bgColor: '#FEF3C7' },
  { name: 'Blue', color: '#2563EB', bgColor: '#DBEAFE' },
  { name: 'Purple', color: '#7C3AED', bgColor: '#EDE9FE' },
  { name: 'Pink', color: '#DB2777', bgColor: '#FCE7F3' },
  { name: 'Rose', color: '#E11D48', bgColor: '#FFE4E6' },
  { name: 'Cyan', color: '#0891B2', bgColor: '#CFFAFE' },
  { name: 'Indigo', color: '#4F46E5', bgColor: '#E0E7FF' },
  { name: 'Teal', color: '#0D9488', bgColor: '#CCFBF1' },
];

const PRESET_ICONS = [
  { name: 'Utensils', label: 'Ăn uống', icon: Utensils },
  { name: 'Car', label: 'Đi lại', icon: Car },
  { name: 'ShoppingBag', label: 'Mua sắm', icon: ShoppingBag },
  { name: 'Briefcase', label: 'Công việc', icon: Briefcase },
  { name: 'Home', label: 'Nhà ở', icon: Home },
  { name: 'Tv', label: 'Dịch vụ', icon: Tv },
  { name: 'HandCoins', label: 'Vay nợ', icon: HandCoins },
  { name: 'Wallet', label: 'Thu nhập', icon: Wallet },
  { name: 'Tag', label: 'Khác', icon: Tag },
];

const renderCategoryIcon = (iconName: string | undefined, categoryCode: string) => {
  const iconProps = { className: 'w-5 h-5 stroke-[2]' };
  switch (iconName || categoryCode) {
    case 'Utensils':
    case 'Food':
      return <Utensils {...iconProps} />;
    case 'Car':
    case 'Transport':
      return <Car {...iconProps} />;
    case 'ShoppingBag':
    case 'Shopping':
      return <ShoppingBag {...iconProps} />;
    case 'Briefcase':
    case 'Work':
      return <Briefcase {...iconProps} />;
    case 'HandCoins':
    case 'Debt':
      return <HandCoins {...iconProps} />;
    case 'Wallet':
    case 'Income':
    case 'Savings':
      return <Wallet {...iconProps} />;
    case 'Home':
    case 'Housing':
      return <Home {...iconProps} />;
    case 'Tv':
    case 'Subscriptions':
    case 'Utilities':
      return <Tv {...iconProps} />;
    default:
      return <Receipt {...iconProps} />;
  }
};

interface BudgetViewProps {
  budgets: CategoryBudget[];
  categories: Record<CategoryCode, CategoryInfo>;
  transactions: Transaction[];
  notificationSettings?: NotificationSettings;
  survivalConfig?: SurvivalModeConfig;
  onUpdateSurvivalConfig?: (config: Partial<SurvivalModeConfig>) => void;
  onUpdateBudget: (category: CategoryCode, limitAmount: number) => void;
  onUpdateCategory?: (code: CategoryCode, updatedCategory: Partial<CategoryInfo>, newLimit?: number) => void;
  onDeleteCategory?: (code: CategoryCode) => void;
  onAddCategory?: (newCategory: CategoryInfo, defaultLimit: number) => void;
  onOpenCategoryManager?: () => void;
  onOpenNotificationSettings?: () => void;
  onOpenNotificationCenter?: () => void;
  onOpenAddModal?: () => void;
  onNavigateToTab?: (tab: 'chat' | 'transactions' | 'debts' | 'analytics') => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  categories,
  transactions,
  notificationSettings,
  survivalConfig,
  onUpdateSurvivalConfig,
  onUpdateBudget,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory,
  onOpenCategoryManager,
  onOpenNotificationSettings,
  onOpenNotificationCenter,
  onOpenAddModal,
  onNavigateToTab,
}) => {
  // Inline editing state for existing card
  const [editingCategory, setEditingCategory] = useState<CategoryCode | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLimit, setEditLimit] = useState<number>(0);
  const [editColor, setEditColor] = useState('');
  const [editBgColor, setEditBgColor] = useState('');
  const [editIconName, setEditIconName] = useState('Tag');

  // Inline creating state for new category
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLimit, setNewLimit] = useState<number>(2000000);
  const [newColor, setNewColor] = useState(PRESET_COLORS[0].color);
  const [newBgColor, setNewBgColor] = useState(PRESET_COLORS[0].bgColor);
  const [newIconName, setNewIconName] = useState('Tag');

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const threshold = notificationSettings?.warningThreshold || 80;

  // Available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((tx) => {
      if (tx.date) months.add(tx.date.substring(0, 7)); // 'YYYY-MM'
    });
    const sorted = Array.from(months).sort();
    if (sorted.length === 0) {
      const today = new Date();
      sorted.push(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
    }
    return sorted;
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[availableMonths.length - 1]);

  const handlePrevMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx > 0) setSelectedMonth(availableMonths[idx - 1]);
  };

  const handleNextMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx < availableMonths.length - 1) setSelectedMonth(availableMonths[idx + 1]);
  };

  const [year, month] = selectedMonth.split('-');
  const displayMonth = `Tháng ${parseInt(month, 10)}, ${year}`;

  // Filter transactions for the selected month only
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date && tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Calculate spent amount per category dynamically for selected month
  const categorySpentMap: Record<CategoryCode, number> = {};
  monthlyTransactions.forEach((tx) => {
    if (tx.type === 'expense') {
      categorySpentMap[tx.category] = (categorySpentMap[tx.category] || 0) + tx.amount;
    }
  });

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + (b.limitAmount || 0), 0);
  const totalSpent = Object.values(categorySpentMap).reduce((acc, val) => acc + val, 0);
  const remainingBudget = Math.max(0, totalBudgetLimit - totalSpent);
  const totalSpentPercentage = totalBudgetLimit > 0 ? Math.round((totalSpent / totalBudgetLimit) * 100) : 0;

  // Survival Mode Calculations
  const paydayDay = survivalConfig?.paydayDay || 1;
  const calculateDaysUntilPayday = (payday: number) => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let targetDate = new Date(currentYear, currentMonth, payday);
    if (currentDay >= payday) {
      targetDate = new Date(currentYear, currentMonth + 1, payday);
    }
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const daysUntilPayday = calculateDaysUntilPayday(paydayDay);
  const targetBuffer = survivalConfig?.targetBuffer || 500000;
  const spendableBudget = Math.max(0, remainingBudget - targetBuffer);
  const safeToSpendDaily = survivalConfig?.customDailyLimit || Math.max(20000, Math.floor(spendableBudget / daysUntilPayday));

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySpent = transactions
    .filter(t => t.type === 'expense' && t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  const todayRemaining = Math.max(0, safeToSpendDaily - todaySpent);
  const todaySpentPercent = Math.min(100, Math.round((todaySpent / (safeToSpendDaily || 1)) * 100));

  const handleStartEdit = (category: CategoryCode, currentLimit: number) => {
    const catInfo = categories[category] || {
      code: category,
      label: category,
      description: '',
      color: '#059669',
      bgColor: '#ECFDF5',
      iconName: 'Tag',
    };

    setEditingCategory(category);
    setIsCreatingNew(false);
    setEditLabel(catInfo.label || category);
    setEditDesc(catInfo.description || '');
    setEditLimit(currentLimit);
    setEditColor(catInfo.color || '#059669');
    setEditBgColor(catInfo.bgColor || '#ECFDF5');
    setEditIconName(catInfo.iconName || 'Tag');
  };

  const handleSaveEdit = (category: CategoryCode) => {
    if (!editLabel.trim()) return;

    if (onUpdateCategory) {
      onUpdateCategory(
        category,
        {
          label: editLabel.trim(),
          description: editDesc.trim(),
          color: editColor,
          bgColor: editBgColor,
          iconName: editIconName,
        },
        editLimit
      );
    } else {
      onUpdateBudget(category, editLimit);
    }

    setEditingCategory(null);
  };

  const handleDeleteClick = (category: CategoryCode, label: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${label}" và hạn mức liên quan? (Các giao dịch cũ vẫn được giữ nguyên)`)) {
      if (onDeleteCategory) {
        onDeleteCategory(category);
      }
      setEditingCategory(null);
    }
  };

  const handleSaveNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const code = ('Custom_' + Date.now().toString().slice(-6)) as CategoryCode;
    const newCat: CategoryInfo = {
      code,
      label: newLabel.trim(),
      description: newDesc.trim() || 'Danh mục tự tạo',
      color: newColor,
      bgColor: newBgColor,
      iconName: newIconName,
      isCustom: true,
    };

    if (onAddCategory) {
      onAddCategory(newCat, newLimit || 2000000);
    } else {
      onUpdateBudget(code, newLimit || 2000000);
    }

    setIsCreatingNew(false);
    setNewLabel('');
    setNewDesc('');
    setNewLimit(2000000);
  };

  const handleShareCategoryAlert = (catLabel: string, spent: number, limit: number, code: string) => {
    const percentage = Math.round((spent / (limit || 1)) * 100);
    const level = percentage >= 100 ? 'danger' : 'warning';
    const text = formatZaloBudgetMessage(catLabel, spent, limit, percentage, level);
    shareZaloMessage(text, `Cảnh báo ngân sách: ${catLabel}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const overBudgetCategories = budgets.filter((b) => {
    const spent = categorySpentMap[b.category] || 0;
    return b.limitAmount > 0 && spent / b.limitAmount >= threshold / 100;
  });

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4 pb-28 sm:pb-24 select-none">
      {/* Revolut-Style Emerald Hero Budget Card */}
      <div className="emerald-gradient text-white p-5 sm:p-6 rounded-[28px] shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-teal-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header Tag & Month Switcher on Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-semibold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>Kiểm soát hạn mức</span>
            </div>

            {/* Month Switcher in Hero Card */}
            <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold">
              <button
                onClick={handlePrevMonth}
                disabled={availableMonths.indexOf(selectedMonth) === 0}
                className="hover:text-emerald-200 disabled:opacity-30 cursor-pointer p-0.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1">{displayMonth}</span>
              <button
                onClick={handleNextMonth}
                disabled={availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
                className="hover:text-emerald-200 disabled:opacity-30 cursor-pointer p-0.5"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Big Hero Amount: Remaining Budget */}
          <div className="py-1">
            <p className="text-xs text-emerald-100/80 font-semibold uppercase tracking-wider">
              Ngân sách còn khả dụng
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-0.5 font-money">
              {formatVND(remainingBudget)}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white whitespace-nowrap">
                Đã dùng {totalSpentPercentage}% hạn mức
              </span>
              {overBudgetCategories.length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/40 text-amber-200 text-[11px] font-bold whitespace-nowrap">
                  ⚠️ {overBudgetCategories.length} mục cần lưu ý
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 text-[11px] font-bold whitespace-nowrap">
                  ✅ An toàn
                </span>
              )}
            </div>
          </div>

          {/* Bento Sub-Cards: Total Spent vs Total Limit */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-400/30 text-amber-200 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-100/70 font-semibold uppercase tracking-wider">Đã Chi</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate font-money">{formatVND(totalSpent)}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-400/30 text-emerald-200 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-100/70 font-semibold uppercase tracking-wider">Tổng Hạn Mức</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate font-money">{formatVND(totalBudgetLimit)}</p>
              </div>
            </div>
          </div>

          {/* 4 Signature Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/15">
            <button
              onClick={() => {
                setIsCreatingNew(true);
                setEditingCategory(null);
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-emerald-800 flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 active:scale-95 transition-all">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">+ Thêm Mục</span>
            </button>

            {onOpenNotificationSettings && (
              <button
                onClick={onOpenNotificationSettings}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-105 active:scale-95 transition-all">
                  <BellRing className="w-5 h-5 text-amber-300" />
                </div>
                <span className="text-[11px] font-bold text-white tracking-tight">Cảnh Báo</span>
              </button>
            )}

            <button
              onClick={() => (onNavigateToTab ? onNavigateToTab('analytics') : null)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-105 active:scale-95 transition-all">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">Thống Kê</span>
            </button>

            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-105 active:scale-95 transition-all">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-white tracking-tight">Ghi Tiền</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= CHẾ ĐỘ SINH TỒN CUỐI THÁNG (SURVIVAL MODE) ================= */}
      <div className={`p-4 sm:p-5 rounded-[24px] border transition-all shadow-xs ${
        survivalConfig?.enabled
          ? 'bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border-amber-300/80 shadow-amber-500/5'
          : 'bg-white border-slate-200/80'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shadow-2xs ${
              survivalConfig?.enabled ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500'
            }`}>
              <Flame className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">Chế Độ Sinh Tồn Cuối Tháng</h3>
                {survivalConfig?.enabled && (
                  <span className="text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                    ĐANG BẬT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">Định mức Safe-to-Spend mỗi ngày trước kỳ lương</p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => {
              if (onUpdateSurvivalConfig) {
                onUpdateSurvivalConfig({ enabled: !survivalConfig?.enabled });
              }
            }}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              survivalConfig?.enabled ? 'bg-amber-500 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
          </button>
        </div>

        {survivalConfig?.enabled && (
          <div className="mt-4 pt-3 border-t border-amber-200/60 space-y-3 animate-in fade-in">
            {/* Payday Selector */}
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="font-bold text-slate-700">Kỳ nhận lương tiếp theo:</span>
              <div className="flex items-center gap-1">
                {[1, 5, 10, 15, 25].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onUpdateSurvivalConfig && onUpdateSurvivalConfig({ paydayDay: d })}
                    className={`px-2 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      (survivalConfig?.paydayDay || 1) === d
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Ngày {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Countdown Badge & Daily Quota */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/80 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hạn Mức An Toàn / Ngày</p>
                <p className="text-base sm:text-lg font-extrabold text-amber-900 font-money">
                  {formatVND(safeToSpendDaily)}
                </p>
                <p className="text-[10px] text-amber-700 font-medium">
                  Còn <b>{daysUntilPayday} ngày</b> đến kỳ lương
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/80 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hôm Nay Còn Được Tiêu</p>
                <p className={`text-base sm:text-lg font-extrabold font-money ${
                  todayRemaining > 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {formatVND(todayRemaining)}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Đã tiêu hôm nay: <span className="font-money">{formatVND(todaySpent)}</span>
                </p>
              </div>
            </div>

            {/* Daily Quota Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-600">Tiến độ tiêu dùng hôm nay</span>
                <span className={todaySpentPercent > 100 ? 'text-rose-600 font-money' : todaySpentPercent > 80 ? 'text-amber-600 font-money' : 'text-emerald-600 font-money'}>
                  {todaySpentPercent}% ({formatVND(todaySpent)} / {formatVND(safeToSpendDaily)})
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    todaySpentPercent > 100 ? 'bg-rose-500' : todaySpentPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, todaySpentPercent)}%` }}
                />
              </div>
            </div>

            {/* Survival Tips Box */}
            <div className="p-3 bg-white/60 border border-amber-200/80 rounded-2xl text-[11px] text-slate-700 space-y-1">
              <p className="font-extrabold text-amber-900 flex items-center gap-1">
                <span>💡 Gợi ý sinh tồn hôm nay:</span>
              </p>
              <p className="leading-relaxed">
                • <b>Bữa trưa</b>: Cơm bình dân / Bún bò vỉa hè (≤ 35.000 ₫).<br />
                • <b>Đồ uống</b>: Uống nước lọc & trà đá văn phòng thay vì order cafe/trà sữa (tiết kiệm ~50.000 ₫/ngày).<br />
                • <b>Mua sắm</b>: Tạm hoãn các đơn hàng online cho đến ngày nhận lương.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Inline Create New Category Card Form */}
      {isCreatingNew && (
        <div className="fin-card p-5 border-2 border-emerald-500/40 bg-emerald-50/20 rounded-3xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">Thêm Danh Mục & Hạn Mức Mới</h3>
            </div>
            <button
              onClick={() => setIsCreatingNew(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSaveNewCategory} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Gym & Thể thao, Thú cưng, Học phí..."
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mô tả / Ghi chú</label>
                <input
                  type="text"
                  placeholder="VD: Vé tập, protein, thức ăn cho mèo..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Hạn mức chi tiêu hàng tháng (VNĐ) *</label>
                <span className="text-xs font-extrabold text-emerald-700 font-mono">{formatVND(newLimit)}</span>
              </div>
              <input
                type="number"
                step={50000}
                min={0}
                value={newLimit || ''}
                onChange={(e) => setNewLimit(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold font-mono text-slate-900 outline-none focus:border-emerald-500"
              />

              {/* Quick Limit Amount Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {[500000, 1000000, 2000000, 3000000, 5000000, 10000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setNewLimit(amt)}
                    className="px-2 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-[10px] font-bold text-slate-700 transition-colors"
                  >
                    {formatVND(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Color & Icon Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Màu sắc đại diện</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setNewColor(c.color);
                        setNewBgColor(c.bgColor);
                      }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newColor === c.color ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Biểu tượng</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ICONS.map((ic) => {
                    const IconComp = ic.icon;
                    const isSelected = newIconName === ic.name;
                    return (
                      <button
                        key={ic.name}
                        type="button"
                        onClick={() => setNewIconName(ic.name)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                        title={ic.label}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-100">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/25 cursor-pointer active:scale-95 transition-all"
              >
                ✓ Tạo Danh Mục Mới
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {budgets.map((b) => {
          const catInfo = (categories && categories[b.category]) || {
            code: b.category,
            label: b.category || 'Danh mục',
            iconName: 'Tag',
            color: '#059669',
            bgColor: '#ECFDF5',
            description: 'Danh mục chi tiêu',
          };

          const catLabel = catInfo?.label || b.category || 'Danh mục';
          const catBgColor = catInfo?.bgColor || '#ECFDF5';
          const catColor = catInfo?.color || '#059669';

          const spent = categorySpentMap[b.category] || 0;
          const limit = b.limitAmount || 1;
          const remaining = Math.max(0, limit - spent);
          const isOver = spent > limit;
          const percentage = Math.min(Math.round((spent / limit) * 100), 100);
          const rawPercentage = Math.round((spent / limit) * 100);
          const isWarning = rawPercentage >= threshold;
          const isDanger = rawPercentage >= 100;

          let progressGradient = 'bg-gradient-to-r from-emerald-500 to-teal-500';
          if (isWarning) progressGradient = 'bg-gradient-to-r from-amber-500 to-orange-500';
          if (isDanger) progressGradient = 'bg-gradient-to-r from-rose-500 to-red-600';

          const isEditing = editingCategory === b.category;

          return (
            <div
              key={b.category}
              className={`fin-card p-4 sm:p-5 space-y-3.5 relative transition-all fin-card-hover ${
                isDanger
                  ? 'ring-2 ring-rose-400/80 border-rose-300 shadow-sm shadow-rose-500/5'
                  : isWarning
                  ? 'ring-2 ring-amber-400/80 border-amber-300 shadow-sm shadow-amber-500/5'
                  : ''
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs transition-transform active:scale-95"
                    style={{ backgroundColor: catBgColor, color: catColor }}
                  >
                    {renderCategoryIcon(catInfo.iconName, b.category)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-extrabold text-slate-900 truncate">
                        {catLabel}
                      </h3>
                      {catInfo.isCustom && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-bold">
                          Tùy chỉnh
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Percentage Badge & Edit Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-lg font-extrabold font-money ${
                      isDanger
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isWarning
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {rawPercentage}%
                  </span>

                  <button
                    onClick={() => (isEditing ? setEditingCategory(null) : handleStartEdit(b.category, b.limitAmount))}
                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                      isEditing
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
                    }`}
                    title={isEditing ? 'Đóng chỉnh sửa' : 'Sửa tên, hạn mức, xóa mục'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Direct In-Card Full Edit Form */}
              {isEditing ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-slate-800">Chỉnh sửa danh mục & hạn mức</span>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 1. Edit Name */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Tên hiển thị:</label>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                      placeholder="VD: Ăn uống, Tiền nhà..."
                    />
                  </div>

                  {/* 2. Edit Monthly Limit Amount */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-slate-600">Hạn mức tháng (VNĐ):</label>
                      <span className="text-xs font-extrabold text-emerald-700 font-money">{formatVND(editLimit)}</span>
                    </div>
                    <input
                      type="number"
                      value={editLimit}
                      onChange={(e) => setEditLimit(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 font-money"
                    />
                  </div>

                  {/* 3. Color Selection */}
                  <div className="pt-1 border-t border-slate-200/80 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 block">Màu sắc:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setEditColor(c.color);
                            setEditBgColor(c.bgColor);
                          }}
                          className={`w-5 h-5 rounded-full transition-transform ${
                            editColor === c.color ? 'ring-2 ring-offset-1 ring-emerald-500 scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: Delete on Left, Save on Right */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(b.category, catLabel)}
                      className="px-3 py-1.5 text-rose-600 hover:bg-rose-100/80 border border-rose-200 bg-rose-50 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                      title="Xóa danh mục này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa mục</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(b.category)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm shadow-emerald-600/20 cursor-pointer active:scale-95"
                      >
                        ✓ Lưu Thay Đổi
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal FinTech Budget Progress & Stats */
                <div className="space-y-2.5 pt-0.5">
                  {/* Hero Stat within Card: Available vs Remaining */}
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                      {isOver ? 'Đã vượt ngân sách' : 'Còn khả dụng'}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-extrabold tracking-tight font-money ${
                        isOver ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {isOver ? `+${formatVND(spent - limit)}` : formatVND(remaining)}
                    </span>
                  </div>

                  {/* Modern Rounded Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressGradient}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Spent vs Limit Sub-Footer */}
                  <div className="flex justify-between items-center text-[11px] pt-0.5 text-slate-500 font-medium">
                    <span>
                      Đã chi: <b className="text-slate-800 font-extrabold font-money">{formatVND(spent)}</b>
                    </span>
                    <span>
                      Hạn mức: <b className="text-slate-800 font-extrabold font-money">{formatVND(b.limitAmount)}</b>
                    </span>
                  </div>

                  {/* Warning Bar when threshold reached */}
                  {isWarning && (
                    <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100/90">
                      <span className="text-amber-900 font-bold text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Chạm ngưỡng {threshold}%</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleShareCategoryAlert(catLabel, spent, b.limitAmount, b.category)}
                        className="flex items-center gap-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-extrabold px-2.5 py-1 rounded-xl transition-all cursor-pointer text-[11px]"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Chia sẻ</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Dashed Add New Category Card */}
        {!isCreatingNew && (
          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="p-5 border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30 rounded-[24px] flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-emerald-700 transition-all cursor-pointer min-h-[160px] group active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-2xl bg-slate-100 group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-xs text-slate-700 group-hover:text-emerald-800">
              + Thêm Danh Mục & Hạn Mức Mới
            </span>
            <p className="text-[10px] text-slate-400">Tùy biến tên, màu sắc, icon và hạn mức</p>
          </button>
        )}
      </div>
    </div>
  );
};
