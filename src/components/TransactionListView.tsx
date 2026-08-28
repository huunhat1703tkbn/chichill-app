import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Calendar,
  Sparkles,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  TrendingUp,
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
  X,
  Filter,
} from 'lucide-react';
import { Transaction, CategoryCode, CategoryInfo } from '../types';

type TimeframeFilter = 'ALL' | '1W' | '1M' | '3M' | '6M' | '1Y';

const TIMEFRAME_LABELS: Record<TimeframeFilter, string> = {
  ALL: 'Tất cả',
  '1W': '1 Tuần',
  '1M': '1 Tháng',
  '3M': '3 Tháng',
  '6M': '6 Tháng',
  '1Y': '1 Năm',
};

interface TransactionListViewProps {
  transactions: Transaction[];
  categories: Record<CategoryCode, CategoryInfo>;
  activeCategory?: CategoryCode | 'ALL';
  onSelectCategory?: (cat: CategoryCode | 'ALL') => void;
  activeTimeframe?: TimeframeFilter;
  onSelectTimeframe?: (tf: TimeframeFilter) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenRecurringBills?: () => void;
  onNavigateToTab?: (tab: 'chat' | 'debts' | 'budgets' | 'analytics') => void;
}

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
      return <Wallet {...iconProps} />;
    case 'Home':
    case 'Housing':
      return <Home {...iconProps} />;
    case 'Tv':
    case 'Subscriptions':
      return <Tv {...iconProps} />;
    default:
      return <Receipt {...iconProps} />;
  }
};

const formatDateGroupLabel = (dateStr: string) => {
  if (!dateStr) return 'Giao dịch khác';
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dateStr === today) return 'Hôm nay';
  if (dateStr === yesterday) return 'Hôm qua';

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    return `${day} Tháng ${month}, ${year}`;
  }
  return dateStr;
};

export const TransactionListView: React.FC<TransactionListViewProps> = ({
  transactions,
  categories,
  activeCategory,
  onSelectCategory,
  activeTimeframe,
  onSelectTimeframe,
  onDeleteTransaction,
  onOpenAddModal,
  onOpenRecurringBills,
  onNavigateToTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [internalCategory, setInternalCategory] = useState<CategoryCode | 'ALL'>('ALL');
  const [internalTimeframe, setInternalTimeframe] = useState<TimeframeFilter>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'expense' | 'income' | 'receivable' | 'payable'>('ALL');

  const selectedCategory = activeCategory !== undefined ? activeCategory : internalCategory;
  const setSelectedCategory = onSelectCategory || setInternalCategory;

  const selectedTimeframe = activeTimeframe !== undefined ? activeTimeframe : internalTimeframe;
  const setSelectedTimeframe = onSelectTimeframe || setInternalTimeframe;

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  // Find latest transaction date as reference point
  const referenceDate = useMemo(() => {
    if (!transactions || transactions.length === 0) return new Date();
    const sorted = [...transactions].filter((t) => t.date).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    if (sorted.length === 0) return new Date();
    return new Date(sorted[sorted.length - 1].date);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.personName && tx.personName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || tx.category === selectedCategory;
      const matchesType = selectedType === 'ALL' || tx.type === selectedType;

      let matchesTimeframe = true;
      if (selectedTimeframe !== 'ALL' && tx.date) {
        const txDate = new Date(tx.date);
        const ref = new Date(referenceDate);

        if (selectedTimeframe === '1W') {
          const diffDays = (ref.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
          matchesTimeframe = diffDays >= 0 && diffDays <= 7;
        } else if (selectedTimeframe === '1M') {
          matchesTimeframe = txDate.getFullYear() === ref.getFullYear() && txDate.getMonth() === ref.getMonth();
        } else if (selectedTimeframe === '3M') {
          const diffMonths = (ref.getFullYear() - txDate.getFullYear()) * 12 + (ref.getMonth() - txDate.getMonth());
          matchesTimeframe = diffMonths >= 0 && diffMonths < 3;
        } else if (selectedTimeframe === '6M') {
          const diffMonths = (ref.getFullYear() - txDate.getFullYear()) * 12 + (ref.getMonth() - txDate.getMonth());
          matchesTimeframe = diffMonths >= 0 && diffMonths < 6;
        } else if (selectedTimeframe === '1Y') {
          const diffMonths = (ref.getFullYear() - txDate.getFullYear()) * 12 + (ref.getMonth() - txDate.getMonth());
          matchesTimeframe = diffMonths >= 0 && diffMonths < 12;
        }
      }

      return matchesSearch && matchesCategory && matchesType && matchesTimeframe;
    });
  }, [transactions, searchQuery, selectedCategory, selectedType, selectedTimeframe, referenceDate]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; label: string; items: Transaction[]; totalDay: number }[] = [];
    const dateMap = new Map<string, Transaction[]>();

    filteredTransactions.forEach((tx) => {
      const d = tx.date || 'unknown';
      if (!dateMap.has(d)) {
        dateMap.set(d, []);
      }
      dateMap.get(d)!.push(tx);
    });

    // Sort dates descending
    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a));

    sortedDates.forEach((date) => {
      const items = dateMap.get(date)!;
      const totalDay = items.reduce((acc, curr) => {
        if (curr.type === 'income') return acc + curr.amount;
        if (curr.type === 'expense') return acc - curr.amount;
        return acc;
      }, 0);

      groups.push({
        date,
        label: formatDateGroupLabel(date),
        items,
        totalDay,
      });
    });

    return groups;
  }, [filteredTransactions]);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const netCashFlow = totalIncome - totalExpense;

  const TYPE_OPTIONS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'expense', label: 'Chi tiêu', count: transactions.filter(t => t.type === 'expense').length },
    { id: 'income', label: 'Thu nhập', count: transactions.filter(t => t.type === 'income').length },
    { id: 'receivable', label: 'Cho vay', count: transactions.filter(t => t.type === 'receivable').length },
    { id: 'payable', label: 'Mượn nợ', count: transactions.filter(t => t.type === 'payable').length },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4 pb-28 sm:pb-24 select-none">
      {/* Revolut-Inspired Hero Balance Card */}
      <div className="emerald-gradient text-white p-5 sm:p-6 rounded-[28px] shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        {/* Subtle background ambient mesh */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-teal-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header Tag & Currency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-semibold tracking-wide">
              <Wallet className="w-3.5 h-3.5 text-emerald-200" />
              <span>Dòng tiền ròng khả dụng</span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 border border-white/10">
              VND 🇻🇳
            </span>
          </div>

          {/* Big Hero Amount */}
          <div className="py-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {formatVND(netCashFlow)}
            </h1>
            <p className="text-xs text-emerald-100/80 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              <span>Cập nhật tự động theo thời gian thực</span>
            </p>
          </div>

          {/* Bento Sub-Cards: Total In vs Out */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-400/30 text-emerald-200 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-100/70 font-semibold uppercase tracking-wider">Tổng Thu</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">{formatVND(totalIncome)}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-rose-400/30 text-rose-200 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-100/70 font-semibold uppercase tracking-wider">Tổng Chi</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">{formatVND(totalExpense)}</p>
              </div>
            </div>
          </div>

          {/* 4 Signature Revolut-style Circular Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/15">
            <button
              onClick={onOpenAddModal}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-emerald-800 flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 active:scale-95 transition-all">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">Thêm tiền</span>
            </button>

            <button
              onClick={() => onNavigateToTab ? onNavigateToTab('chat') : onOpenAddModal()}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-105 active:scale-95 transition-all">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">Ghi bằng AI</span>
            </button>

            {onOpenRecurringBills && (
              <button
                onClick={onOpenRecurringBills}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-105 active:scale-95 transition-all">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-white tracking-tight">Định kỳ</span>
              </button>
            )}

            <button
              onClick={() => onNavigateToTab ? onNavigateToTab('debts') : onOpenAddModal()}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-105 active:scale-95 transition-all">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">Sổ nợ</span>
            </button>
          </div>
        </div>
      </div>

      {/* FinTech Search & Filter Toolbar */}
      <div className="fin-card p-3.5 sm:p-4 space-y-3">
        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm: Cơm trưa, Grab, Netflix, Lương, Nam..."
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Transaction Type Segmented Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none touch-scroll py-0.5">
          {TYPE_OPTIONS.map((opt) => {
            const isSelected = selectedType === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedType(opt.id as any)}
                className={`text-xs px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <span>{opt.label}</span>
                {'count' in opt && opt.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-100 touch-scroll">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all active:scale-95 shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả danh mục ({transactions.length})
          </button>

          {(Object.entries(categories || {}) as [string, CategoryInfo][]).map(([code, info]) => {
            if (code === 'Budget_Query') return null;
            const count = transactions.filter((t) => t.category === code).length;
            const isSelected = selectedCategory === code;

            return (
              <button
                key={code}
                onClick={() => setSelectedCategory(code as CategoryCode)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: info?.color || '#059669' }}
                />
                <span>{info?.label || code}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Timeframe Horizontal Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-100 touch-scroll">
          <span className="text-[11px] font-bold text-slate-400 flex items-center pr-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> Kỳ:
          </span>
          {(['ALL', '1W', '1M', '3M', '6M', '1Y'] as TimeframeFilter[]).map((tf) => {
            const isSelected = selectedTimeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`text-xs px-2.5 py-1 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {TIMEFRAME_LABELS[tf]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Drill-Down Filter Banner */}
      {(selectedCategory !== 'ALL' || selectedTimeframe !== 'ALL') && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 border border-emerald-200/90 rounded-2xl animate-in fade-in shadow-2xs">
          <div className="flex items-center gap-2 text-xs flex-wrap min-w-0">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <span className="text-slate-600 font-medium">Đang lọc:</span>
            {selectedCategory !== 'ALL' && (
              <span
                className="px-2.5 py-0.5 rounded-lg text-white font-extrabold text-[11px] flex items-center gap-1 shadow-2xs"
                style={{ backgroundColor: categories[selectedCategory]?.color || '#059669' }}
              >
                {renderCategoryIcon(categories[selectedCategory]?.iconName, selectedCategory)}
                <span>{categories[selectedCategory]?.label || selectedCategory}</span>
              </span>
            )}
            {selectedTimeframe !== 'ALL' && (
              <span className="px-2.5 py-0.5 bg-white text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] shadow-2xs">
                📅 {TIMEFRAME_LABELS[selectedTimeframe]}
              </span>
            )}
            <span className="text-slate-500 font-medium text-[11px]">
              ({filteredTransactions.length} giao dịch · Tổng chi:{' '}
              <b className="text-slate-900 font-mono">
                {formatVND(
                  filteredTransactions
                    .filter((t) => t.type === 'expense')
                    .reduce((s, t) => s + t.amount, 0)
                )}
              </b>
              )
            </span>
          </div>

          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedTimeframe('ALL');
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl cursor-pointer transition-colors shrink-0 shadow-2xs active:scale-95"
          >
            ✕ Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Activity Feed Grouped By Date */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="fin-card p-8 text-center text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-extrabold text-slate-700">Không tìm thấy giao dịch nào</p>
            <p className="text-xs text-slate-400">Hãy thử tìm từ khóa khác hoặc dùng AI Chat để ghi chép tức thì!</p>
          </div>
        ) : (
          groupedTransactions.map((group) => (
            <div key={group.date} className="space-y-1.5">
              {/* Date Header with Net Cashflow of the Day */}
              <div className="flex items-center justify-between px-2 text-xs">
                <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[11px]">
                  {group.label}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {group.items.length} giao dịch
                </span>
              </div>

              {/* Group Container with Dividers */}
              <div className="fin-card overflow-hidden divide-y divide-slate-100/90 shadow-sm">
                {group.items.map((tx) => {
                  const catInfo = (categories && categories[tx.category]) || {
                    label: tx.category || 'Khác',
                    iconName: 'Tag',
                    color: '#059669',
                    bgColor: '#ECFDF5',
                  };
                  const catLabel = catInfo.label || tx.category;
                  const isReceivable = tx.type === 'receivable';
                  const isPayable = tx.type === 'payable';
                  const isIncome = tx.type === 'income';

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Left: Category Icon Squircle & Details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs transition-transform active:scale-95"
                          style={{
                            backgroundColor: catInfo.bgColor || '#ECFDF5',
                            color: catInfo.color || '#059669',
                          }}
                        >
                          {renderCategoryIcon(catInfo.iconName, tx.category)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                              {tx.description}
                            </p>
                            {tx.personName && (
                              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.2 rounded-md font-bold">
                                {tx.personName}
                              </span>
                            )}
                            {tx.createdBy === 'recurring' && (
                              <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded-md font-bold">
                                Định kỳ
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            {tx.time && <span>{tx.time}</span>}
                            {tx.time && <span>•</span>}
                            <span className="font-semibold text-slate-600 truncate">{catLabel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Action */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-right">
                          <p
                            className={`text-xs sm:text-sm font-extrabold tracking-tight ${
                              isIncome
                                ? 'text-emerald-600'
                                : isReceivable
                                ? 'text-amber-600'
                                : isPayable
                                ? 'text-rose-600'
                                : 'text-slate-900'
                            }`}
                          >
                            {isIncome ? '+' : isReceivable ? '👤 Cho vay ' : isPayable ? '💳 Nợ ' : '-'}
                            {formatVND(tx.amount)}
                          </p>
                        </div>

                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa giao dịch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
