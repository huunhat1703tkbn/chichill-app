import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import {
  Sparkles,
  Award,
  TrendingUp,
  Wallet,
  Zap,
  Loader2,
  AlertTriangle,
  PieChart as PieIcon,
  BarChart3,
  ShieldCheck,
  Calendar,
  Utensils,
  Car,
  ShoppingBag,
  Briefcase,
  HandCoins,
  Home,
  Tv,
  Tag,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
} from 'lucide-react';
import { Transaction, CategoryCode, CategoryInfo } from '../types';
import { getApiUrl } from '../utils/api';

type TimeframeOption = '1W' | '1M' | '3M' | '6M' | '1Y';

const TIMEFRAME_CONFIG: { id: TimeframeOption; label: string; description: string }[] = [
  { id: '1W', label: '1 Tuần', description: '7 ngày qua' },
  { id: '1M', label: '1 Tháng', description: 'Tháng hiện tại' },
  { id: '3M', label: '3 Tháng', description: 'Quý gần nhất' },
  { id: '6M', label: '6 Tháng', description: 'Nửa năm' },
  { id: '1Y', label: '1 Năm', description: '12 tháng qua' },
];

const renderCategoryIcon = (iconName: string | undefined, categoryCode: string) => {
  const iconProps = { className: 'w-4 h-4 stroke-[2]' };
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

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories?: Record<CategoryCode, CategoryInfo>;
  monthlyIncome?: number; 
  monthlyExpense?: number; 
  onNavigateToTab?: (tab: 'chat' | 'transactions' | 'budgets' | 'debts') => void;
  onDrillDownToTransactions?: (categoryCode: CategoryCode, timeframe: TimeframeOption) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  categories,
  onNavigateToTab,
  onDrillDownToTransactions,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('1M');
  const [isWrappingUp, setIsWrappingUp] = useState(false);
  const [wrapUpResult, setWrapUpResult] = useState<string | null>(null);

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  // Find latest transaction date as reference point
  const referenceDate = useMemo(() => {
    if (!transactions || transactions.length === 0) return new Date();
    const sorted = [...transactions].filter(t => t.date).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    if (sorted.length === 0) return new Date();
    return new Date(sorted[sorted.length - 1].date);
  }, [transactions]);

  // Filter transactions according to selected timeframe
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const ref = new Date(referenceDate);

    return transactions.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);

      if (timeframe === '1W') {
        const diffDays = (ref.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }

      if (timeframe === '1M') {
        return (
          txDate.getFullYear() === ref.getFullYear() &&
          txDate.getMonth() === ref.getMonth()
        );
      }

      if (timeframe === '3M') {
        const diffMonths = (ref.getFullYear() - txDate.getFullYear()) * 12 + (ref.getMonth() - txDate.getMonth());
        return diffMonths >= 0 && diffMonths < 3;
      }

      if (timeframe === '6M') {
        const diffMonths = (ref.getFullYear() - txDate.getFullYear()) * 12 + (ref.getMonth() - txDate.getMonth());
        return diffMonths >= 0 && diffMonths < 6;
      }

      if (timeframe === '1Y') {
        const diffMonths = (ref.getFullYear() - txDate.getFullYear()) * 12 + (ref.getMonth() - txDate.getMonth());
        return diffMonths >= 0 && diffMonths < 12;
      }

      return true;
    });
  }, [transactions, timeframe, referenceDate]);

  const periodIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const periodExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const netSavings = periodIncome - periodExpense;
  const savingsRate = periodIncome > 0 ? Math.round((netSavings / periodIncome) * 100) : 0;

  // Category Expense Breakdown with Percentage calculation
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.forEach((tx) => {
      if (tx.type === 'expense') {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      }
    });

    const total = Object.values(map).reduce((sum, v) => sum + v, 0);

    return Object.entries(map)
      .map(([code, amount]) => {
        const cat = categories?.[code] || {
          label: code,
          color: '#10B981',
          bgColor: '#ECFDF5',
          iconName: 'Tag',
        };
        const percentage = total > 0 ? (amount / total) * 100 : 0;
        return {
          code,
          name: cat?.label || code,
          value: amount,
          percentage: Number(percentage.toFixed(1)),
          color: cat?.color || '#10B981',
          bgColor: cat?.bgColor || '#ECFDF5',
          iconName: cat?.iconName || 'Tag',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, categories]);

  // Bar Chart Data customized for the active timeframe
  const barChartData = useMemo(() => {
    const ref = new Date(referenceDate);

    if (timeframe === '1W') {
      // 7 Days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(ref);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
        const txs = transactions.filter((t) => t.date === dateStr);
        const tIn = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const tEx = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        days.push({
          name: dayLabel,
          ThuNhap: tIn,
          ChiTieu: tEx,
          TichLuy: Math.max(0, tIn - tEx),
        });
      }
      return days;
    }

    if (timeframe === '1M') {
      // 4 Weeks of the Month
      const weeks = [
        { name: 'Tuần 1 (1-7)', start: 1, end: 7 },
        { name: 'Tuần 2 (8-14)', start: 8, end: 14 },
        { name: 'Tuần 3 (15-21)', start: 15, end: 21 },
        { name: 'Tuần 4 (22+)', start: 22, end: 31 },
      ];

      return weeks.map((w) => {
        const txs = filteredTransactions.filter((t) => {
          if (!t.date) return false;
          const dayNum = parseInt(t.date.split('-')[2], 10);
          return dayNum >= w.start && dayNum <= w.end;
        });
        const tIn = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const tEx = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return {
          name: w.name,
          ThuNhap: tIn,
          ChiTieu: tEx,
          TichLuy: Math.max(0, tIn - tEx),
        };
      });
    }

    // Multi-month views (3M, 6M, 1Y)
    const numMonths = timeframe === '3M' ? 3 : timeframe === '6M' ? 6 : 12;
    const monthsData = [];

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
      const monthPrefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const txs = transactions.filter((t) => t.date && t.date.startsWith(monthPrefix));
      const tIn = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const tEx = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      monthsData.push({
        name: `T${d.getMonth() + 1}`,
        ThuNhap: tIn,
        ChiTieu: tEx,
        TichLuy: Math.max(0, tIn - tEx),
      });
    }

    return monthsData;
  }, [timeframe, referenceDate, filteredTransactions, transactions]);

  // Health Score & Advice
  let healthScore = 85;
  let healthGrade = 'Tốt (A)';
  let adviceMessage = 'Dòng tiền ổn định. Chi tiêu ăn uống và công việc đang đúng kế hoạch!';

  if (savingsRate < 10) {
    healthScore = 55;
    healthGrade = 'Cần Cân Đối (C)';
    adviceMessage = 'Tỷ lệ tích lũy dưới 10%. Nên tiết giảm chi tiêu mua sắm và cafe ngoài giờ.';
  } else if (savingsRate >= 30) {
    healthScore = 95;
    healthGrade = 'Xuất Sắc (A+)';
    adviceMessage = 'Tuyệt vời! Bạn giữ lại được hơn 30% thu nhập trong kỳ này. Sẵn sàng tích lũy & đầu tư.';
  }

  const handleGenerateWrapUp = async () => {
    setIsWrappingUp(true);
    setWrapUpResult(null);
    try {
      const res = await fetch(getApiUrl('/api/ai-wrap-up'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: `Kỳ ${TIMEFRAME_CONFIG.find((t) => t.id === timeframe)?.label || timeframe}`,
          transactions: filteredTransactions,
          categories,
          savingsRate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWrapUpResult(data.message);
      } else {
        setWrapUpResult(data.message || 'Có lỗi xảy ra khi gọi AI.');
      }
    } catch (err) {
      setWrapUpResult('Không thể kết nối đến AI lúc này. Hãy thử lại sau!');
    } finally {
      setIsWrappingUp(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4 pb-28 sm:pb-24 select-none">
      {/* Revolut-Style Emerald Hero Analytics Card */}
      <div className="emerald-gradient text-white p-5 sm:p-6 rounded-[28px] shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-teal-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header Tag & Timeframe Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-semibold tracking-wide">
              <Award className="w-3.5 h-3.5 text-emerald-200" />
              <span>Sức Khỏe Tài Chính</span>
            </div>

            <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold">
              <Calendar className="w-3.5 h-3.5 text-emerald-200" />
              <span>{TIMEFRAME_CONFIG.find((t) => t.id === timeframe)?.description || 'Kỳ này'}</span>
            </div>
          </div>

          {/* Big Hero Amount: Health Score & Net Flow */}
          <div className="py-1">
            <p className="text-xs text-emerald-100/80 font-semibold uppercase tracking-wider">
              Điểm đánh giá dòng tiền ({TIMEFRAME_CONFIG.find((t) => t.id === timeframe)?.label})
            </p>
            <div className="flex items-baseline gap-3 mt-0.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {healthScore} <span className="text-xl font-medium text-emerald-200">/ 100</span>
              </h1>
              <span className="bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                {healthGrade}
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 font-medium mt-1">
              Tỷ lệ tích lũy: <b>{savingsRate}%</b> (
              {netSavings >= 0 ? `+${formatVND(netSavings)}` : formatVND(netSavings)})
            </p>
          </div>

          {/* Bento Sub-Cards: Total Income vs Total Expense */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-400/30 text-emerald-200 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-100/70 font-semibold uppercase tracking-wider">Tổng Thu</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">+{formatVND(periodIncome)}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-rose-400/30 text-rose-200 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-100/70 font-semibold uppercase tracking-wider">Tổng Chi</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">-{formatVND(periodExpense)}</p>
              </div>
            </div>
          </div>

          {/* 4 Signature Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/15">
            <button
              onClick={handleGenerateWrapUp}
              disabled={isWrappingUp}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-emerald-800 flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 active:scale-95 transition-all">
                {isWrappingUp ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500 stroke-[2.5]" />
                )}
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">AI Roast</span>
            </button>

            <a
              href="#category-chart"
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-105 active:scale-95 transition-all">
                <PieIcon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">Cơ Cấu</span>
            </a>

            <a
              href="#trend-chart"
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-105 active:scale-95 transition-all">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">Cân Đối</span>
            </a>

            <button
              onClick={() => (onNavigateToTab ? onNavigateToTab('budgets') : null)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-105 active:scale-95 transition-all">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">Hạn Mức</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timeframe Filter Bar (1W, 1M, 3M, 6M, 1Y) */}
      <div className="fin-card p-1.5 flex items-center justify-between gap-1 shadow-xs">
        {TIMEFRAME_CONFIG.map((item) => {
          const isActive = timeframe === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setTimeframe(item.id);
                setWrapUpResult(null);
              }}
              className={`flex-1 py-2 px-1 rounded-2xl text-xs font-extrabold transition-all cursor-pointer text-center active:scale-95 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Advice Pill Card */}
      <div className="fin-card p-4 space-y-2">
        <div className="flex items-start gap-2.5 text-xs text-slate-700">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-slate-900">Lời khuyên dòng tiền:</p>
            <p className="text-slate-600 font-medium mt-0.5">{adviceMessage}</p>
          </div>
        </div>
      </div>

      {/* AI Wrapped Report Box if generated */}
      {wrapUpResult && (
        <div className="emerald-gradient p-5 rounded-[24px] shadow-xl text-white relative overflow-hidden animate-in fade-in">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="w-20 h-20" />
          </div>
          <h3 className="text-base font-black text-amber-200 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Bản tin tài chính AI "Roast & Toast" ({TIMEFRAME_CONFIG.find((t) => t.id === timeframe)?.label})
          </h3>
          <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-medium whitespace-pre-line">
            {wrapUpResult}
          </p>
          <button
            onClick={() => setWrapUpResult(null)}
            className="mt-3 text-xs font-bold text-emerald-200 hover:text-white underline cursor-pointer"
          >
            Đóng báo cáo
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Expense Breakdown (Cơ Cấu Chi Tiêu với %) */}
        <div id="category-chart" className="fin-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Cơ Cấu Chi Tiêu</span>
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {TIMEFRAME_CONFIG.find((t) => t.id === timeframe)?.label}
            </span>
          </div>

          {/* Donut Chart with Centered Total */}
          <div className="h-60 w-full relative flex items-center justify-center">
            {categoryBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      cursor="pointer"
                      onClick={(entry: any) => {
                        if (entry?.code && onDrillDownToTransactions) {
                          onDrillDownToTransactions(entry.code as CategoryCode, timeframe);
                        }
                      }}
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, props: any) => [
                        `${formatVND(Number(val))} (${props?.payload?.percentage}%) - Bấm để xem`,
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center of Donut Info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tổng Chi</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5">
                    {formatVND(periodExpense)}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                Chưa có dữ liệu chi tiêu trong kỳ này
              </div>
            )}
          </div>

          {/* Hint subtitle */}
          <p className="text-[11px] text-slate-400 font-medium text-center flex items-center justify-center gap-1">
            <span>💡 Chạm vào danh mục bất kỳ để lọc & xem chi tiết trong Sổ Ví</span>
          </p>

          {/* FinTech Detailed Breakdown List with % and Progress Bars */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {categoryBreakdown.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (onDrillDownToTransactions) {
                    onDrillDownToTransactions(item.code as CategoryCode, timeframe);
                  }
                }}
                className="space-y-1 p-2 -mx-2 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer group select-none active:scale-[0.98]"
                title={`Bấm để xem các giao dịch ${item.name} trong kỳ ${TIMEFRAME_CONFIG.find(t => t.id === timeframe)?.label}`}
              >
                <div className="flex items-center justify-between text-xs">
                  {/* Left: Squircle Icon & Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-white shadow-2xs group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: item.color }}
                    >
                      {renderCategoryIcon(item.iconName, item.code)}
                    </div>
                    <span className="font-bold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
                      {item.name}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                  </div>

                  {/* Right: Amount & % Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-slate-900 group-hover:text-emerald-900 transition-colors font-mono">{formatVND(item.value)}</span>
                    <span
                      className="text-[10px] font-black px-1.5 py-0.2 rounded-md transition-all group-hover:scale-105"
                      style={{
                        backgroundColor: item.bgColor || '#ECFDF5',
                        color: item.color || '#059669',
                      }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Visual Ratio Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income vs Expense Bar Chart (Cân Đối Thu Chi & Tích Lũy) */}
        <div id="trend-chart" className="fin-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Cân Đối Thu Chi & Tích Lũy</span>
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {TIMEFRAME_CONFIG.find((t) => t.id === timeframe)?.label}
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : `${v / 1000}k`)}
                />
                <Tooltip
                  formatter={(val: any) => formatVND(Number(val))}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />
                <Bar dataKey="ThuNhap" fill="#059669" name="Thu Nhập" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ChiTieu" fill="#F43F5E" name="Chi Tiêu" radius={[4, 4, 0, 0]} />
                <Bar dataKey="TichLuy" fill="#10B981" name="Tích Lũy" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Period Financial Balance Summary Card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-xs text-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Dòng tiền ròng ({TIMEFRAME_CONFIG.find((t) => t.id === timeframe)?.label}):</span>
              <span
                className={`font-extrabold ${
                  netSavings >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {netSavings >= 0 ? `+${formatVND(netSavings)}` : formatVND(netSavings)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Tỷ lệ tích lũy / tiết kiệm:</span>
              <span className="font-extrabold text-slate-900">{savingsRate}%</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">Dự kiến tích lũy 1 năm:</span>
              <span className="font-extrabold text-emerald-800">
                ~{formatVND(Math.max(0, netSavings * (timeframe === '1W' ? 52 : timeframe === '1M' ? 12 : timeframe === '3M' ? 4 : timeframe === '6M' ? 2 : 1)))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
