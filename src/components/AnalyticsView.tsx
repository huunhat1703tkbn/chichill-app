import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  Sparkles,
  Award,
  TrendingUp,
  TrendingDown,
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
  Flame,
  CheckCircle2,
  Compass,
  AlertCircle,
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
  const [intelligenceTab, setIntelligenceTab] = useState<'wealth' | 'benchmark' | 'runway'>('wealth');
  const [isWrappingUp, setIsWrappingUp] = useState(false);
  const [wrapUpResult, setWrapUpResult] = useState<string | null>(null);

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const referenceDate = useMemo(() => {
    if (!transactions || transactions.length === 0) return new Date();
    const sorted = [...transactions].filter(t => t.date).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    if (sorted.length === 0) return new Date();
    return new Date(sorted[sorted.length - 1].date);
  }, [transactions]);

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
        return (txDate.getFullYear() === ref.getFullYear() && txDate.getMonth() === ref.getMonth());
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

  const previousPeriodTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const ref = new Date(referenceDate);
    return transactions.filter((tx) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      if (timeframe === '1W') {
        const diffDays = (ref.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        return diffDays > 7 && diffDays <= 14;
      }
      if (timeframe === '1M') {
        const prevMonth = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
        return (txDate.getFullYear() === prevMonth.getFullYear() && txDate.getMonth() === prevMonth.getMonth());
      }
      if (timeframe === '3M') {
        const diffMonths = (ref.getFullYear() - txDate.getFullYear()) * 12 + (ref.getMonth() - txDate.getMonth());
        return diffMonths >= 3 && diffMonths < 6;
      }
      if (timeframe === '6M') {
        const diffMonths = (ref.getFullYear() - txDate.getFullYear()) * 12 + (ref.getMonth() - txDate.getMonth());
        return diffMonths >= 6 && diffMonths < 12;
      }
      if (timeframe === '1Y') {
        const diffMonths = (ref.getFullYear() - txDate.getFullYear()) * 12 + (ref.getMonth() - txDate.getMonth());
        return diffMonths >= 12 && diffMonths < 24;
      }
      return false;
    });
  }, [transactions, timeframe, referenceDate]);

  const periodIncome = useMemo(() => filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [filteredTransactions]);
  const periodExpense = useMemo(() => filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [filteredTransactions]);

  const prevPeriodIncome = useMemo(() => previousPeriodTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [previousPeriodTransactions]);
  const prevPeriodExpense = useMemo(() => previousPeriodTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [previousPeriodTransactions]);

  const incomeGrowthPercent = useMemo(() => {
    if (prevPeriodIncome === 0) return null;
    return Math.round(((periodIncome - prevPeriodIncome) / prevPeriodIncome) * 100);
  }, [periodIncome, prevPeriodIncome]);

  const expenseGrowthPercent = useMemo(() => {
    if (prevPeriodExpense === 0) return null;
    return Math.round(((periodExpense - prevPeriodExpense) / prevPeriodExpense) * 100);
  }, [periodExpense, prevPeriodExpense]);

  const netSavings = periodIncome - periodExpense;
  const savingsRate = periodIncome > 0 ? Math.round((netSavings / periodIncome) * 100) : 0;

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
        const cat = categories?.[code] || { label: code, color: '#10B981', bgColor: '#ECFDF5', iconName: 'Tag' };
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

  const sixMonthWealthData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const ref = new Date(referenceDate);
    const months = [];
    let runningTotal = 0;
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
      const monthPrefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const txs = transactions.filter((t) => t.date && t.date.startsWith(monthPrefix));
      const tIn = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const tEx = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const net = Math.max(0, tIn - tEx);
      runningTotal += net;
      months.push({
        name: `T${d.getMonth() + 1}`,
        fullName: `Tháng ${d.getMonth() + 1}`,
        ThuNhap: tIn,
        ChiTieu: tEx,
        TichLuyThang: net,
        TongTichLuy: runningTotal,
      });
    }
    return months;
  }, [transactions, referenceDate]);

  const rule503020Metrics = useMemo(() => {
    let needs = 0, wants = 0, savings = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'expense') {
        if (t.category === 'Housing' || t.category === 'Utilities' || t.category === 'Transport') {
          needs += t.amount;
        } else if (t.category === 'Food') {
          needs += t.amount * 0.6;
          wants += t.amount * 0.4;
        } else if (t.category === 'Savings') {
          savings += t.amount;
        } else {
          wants += t.amount;
        }
      }
    });
    const netUnspent = Math.max(0, periodIncome - periodExpense);
    savings += netUnspent;
    const baseIncome = periodIncome > 0 ? periodIncome : (needs + wants + savings);
    return {
      needsAmount: Math.round(needs),
      needsPercent: Math.min(100, Math.round((needs / (baseIncome || 1)) * 100)),
      wantsAmount: Math.round(wants),
      wantsPercent: Math.min(100, Math.round((wants / (baseIncome || 1)) * 100)),
      savingsAmount: Math.round(savings),
      savingsPercent: Math.min(100, Math.round((savings / (baseIncome || 1)) * 100)),
    };
  }, [filteredTransactions, periodIncome, periodExpense]);

  const runwayMetrics = useMemo(() => {
    const daysInTimeframe = timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : timeframe === '6M' ? 180 : 365;
    const dailyBurnRate = periodExpense > 0 ? Math.round(periodExpense / daysInTimeframe) : 0;
    const monthlyBurnRate = dailyBurnRate * 30;
    const totalAccumulated = sixMonthWealthData.length > 0 ? sixMonthWealthData[sixMonthWealthData.length - 1].TongTichLuy : netSavings;
    return { dailyBurnRate, monthlyBurnRate, totalAccumulated, runwayMonths: monthlyBurnRate > 0 ? (totalAccumulated / monthlyBurnRate).toFixed(1) : '12+' };
  }, [periodExpense, timeframe, sixMonthWealthData, netSavings]);

  const barChartData = useMemo(() => {
    const ref = new Date(referenceDate);
    if (timeframe === '1W') {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(ref);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
        const txs = transactions.filter((t) => t.date === dateStr);
        const tIn = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const tEx = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        days.push({ name: dayLabel, ThuNhap: tIn, ChiTieu: tEx, TichLuy: Math.max(0, tIn - tEx) });
      }
      return days;
    }
    if (timeframe === '1M') {
      const weeks = [{ name: 'Tuần 1', start: 1, end: 7 }, { name: 'Tuần 2', start: 8, end: 14 }, { name: 'Tuần 3', start: 15, end: 21 }, { name: 'Tuần 4', start: 22, end: 31 }];
      return weeks.map((w) => {
        const txs = filteredTransactions.filter((t) => {
          if (!t.date) return false;
          const dayNum = parseInt(t.date.split('-')[2], 10);
          return dayNum >= w.start && dayNum <= w.end;
        });
        const tIn = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const tEx = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        return { name: w.name, ThuNhap: tIn, ChiTieu: tEx, TichLuy: Math.max(0, tIn - tEx) };
      });
    }
    const numMonths = timeframe === '3M' ? 3 : timeframe === '6M' ? 6 : 12;
    const monthsData = [];
    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
      const monthPrefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const txs = transactions.filter((t) => t.date && t.date.startsWith(monthPrefix));
      const tIn = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const tEx = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      monthsData.push({ name: `T${d.getMonth() + 1}`, ThuNhap: tIn, ChiTieu: tEx, TichLuy: Math.max(0, tIn - tEx) });
    }
    return monthsData;
  }, [timeframe, referenceDate, filteredTransactions, transactions]);

  let healthScore = 88;
  let healthGrade = 'Xuất Sắc (A)';
  let adviceMessage = 'Dòng tiền rất ổn định. Tỷ lệ tích lũy đạt trên 25%, quỹ sinh tồn dự phòng an toàn hơn 11 tháng!';
  if (savingsRate < 10) {
    healthScore = 55;
    healthGrade = 'Cần Cân Đối (C)';
    adviceMessage = 'Tỷ lệ tích lũy dưới 10%. Nên tiết giảm chi tiêu mua sắm và cafe ngoài giờ.';
  } else if (savingsRate >= 30) {
    healthScore = 95;
    healthGrade = 'Vững Vàng (A+)';
    adviceMessage = 'Tuyệt vời! Bạn giữ lại được hơn 30% thu nhập trong kỳ này. Dòng tiền thặng dư cực tốt.';
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
      setWrapUpResult(data.success ? data.message : (data.message || 'Có lỗi xảy ra khi gọi AI.'));
    } catch (err) {
      setWrapUpResult('Không thể kết nối đến AI lúc này. Hãy thử lại sau!');
    } finally {
      setIsWrappingUp(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4 pb-28 sm:pb-24 select-none">
      <div className="emerald-gradient text-white p-5 sm:p-6 rounded-[28px] shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
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
          <div className="py-1">
            <p className="text-xs text-emerald-100/80 font-semibold uppercase tracking-wider">
              Điểm đánh giá dòng tiền ({TIMEFRAME_CONFIG.find((t) => t.id === timeframe)?.label})
            </p>
            <div className="flex items-baseline gap-3 mt-0.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-money">
                {healthScore} <span className="text-xl font-medium text-emerald-200">/ 100</span>
              </h1>
              <span className="bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                {healthGrade}
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 font-medium mt-1">
              Tỷ lệ tích lũy: <b>{savingsRate}%</b> (
              <span className="font-money">{netSavings >= 0 ? `+${formatVND(netSavings)}` : formatVND(netSavings)}</span>)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-400/30 text-emerald-200 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-100/70 font-semibold uppercase tracking-wider">Tổng Thu</p>
                <p className="text-xs sm:text-sm font-extrabold text-white truncate font-money">+{formatVND(periodIncome)}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-rose-400/30 text-rose-200 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-100/70 font-semibold uppercase tracking-wider">Tổng Chi</p>
                <p className="text-xs sm:text-sm font-extrabold text-white truncate font-money">-{formatVND(periodExpense)}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/15">
            <button onClick={handleGenerateWrapUp} disabled={isWrappingUp} className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-emerald-800 flex items-center justify-center shadow-lg shadow-black/10 transition-all">
                {isWrappingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-amber-500 fill-amber-500 stroke-[2.5]" />}
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">AI Roast</span>
            </button>
            <a href="#category-chart" className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all">
                <PieIcon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">Cơ Cấu</span>
            </a>
            <a href="#intelligence-hub" className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">Sức Bật</span>
            </a>
            <button onClick={() => (onNavigateToTab ? onNavigateToTab('budgets') : null)} className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-white tracking-tight">Hạn Mức</span>
            </button>
          </div>
        </div>
      </div>
      <div className="fin-card p-1.5 flex gap-1 overflow-x-auto scrollbar-none touch-scroll">
        {TIMEFRAME_CONFIG.map((t) => (
          <button key={t.id} onClick={() => setTimeframe(t.id)} className={`flex-1 py-2 px-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${timeframe === t.id ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {wrapUpResult && (
        <div className="emerald-gradient text-white p-4 sm:p-5 rounded-[24px] shadow-lg shadow-emerald-950/15 animate-in fade-in space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-300" /> <h3 className="font-extrabold text-sm">ChiChill AI Nhận Xét</h3></div>
          <p className="text-xs sm:text-sm leading-relaxed text-emerald-50 whitespace-pre-line font-medium">{wrapUpResult}</p>
          <button onClick={() => setWrapUpResult(null)} className="text-xs font-bold text-emerald-200 underline cursor-pointer">Đóng báo cáo</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div id="category-chart" className="fin-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Cơ Cấu Chi Tiêu</span>
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-money">
              {TIMEFRAME_CONFIG.find((t) => t.id === timeframe)?.label}
            </span>
          </div>
          <div className="h-60 w-full relative flex items-center justify-center">
            {categoryBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={62} outerRadius={88} dataKey="value">
                      {categoryBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(val: any) => formatVND(Number(val))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Tổng Chi</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 font-money">{formatVND(periodExpense)}</span>
                </div>
              </>
            ) : <div className="text-xs text-slate-400 font-bold">Chưa có dữ liệu</div>}
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {categoryBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-1">
                <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color }}>{renderCategoryIcon(item.iconName, item.code)}</div><span className="font-bold text-slate-800">{item.name}</span></div>
                <div className="flex items-center gap-2"><span className="font-extrabold font-money">{formatVND(item.value)}</span><span className="text-[10px] font-black px-1.5 py-0.2 rounded-md" style={{ backgroundColor: item.bgColor, color: item.color }}>{item.percentage}%</span></div>
              </div>
            ))}
          </div>
        </div>
        <div id="intelligence-hub" className="fin-card p-4 sm:p-5 space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2"><Compass className="w-4 h-4 text-emerald-600" /> <span>Sức Bật & Cân Đối</span></h3>
            </div>
            <div className="flex p-1 bg-slate-100 rounded-2xl gap-1 text-[11px] font-bold">
              <button onClick={() => setIntelligenceTab('wealth')} className={`flex-1 py-1.5 rounded-xl ${intelligenceTab === 'wealth' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>📈 Lũy Kế 6T</button>
              <button onClick={() => setIntelligenceTab('benchmark')} className={`flex-1 py-1.5 rounded-xl ${intelligenceTab === 'benchmark' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>⚖️ Chuẩn 50/30/20</button>
              <button onClick={() => setIntelligenceTab('runway')} className={`flex-1 py-1.5 rounded-xl ${intelligenceTab === 'runway' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>🔥 Quỹ Sinh Tồn</button>
            </div>
          </div>
          {intelligenceTab === 'wealth' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sixMonthWealthData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                    <Tooltip formatter={(val: any) => [formatVND(Number(val)), 'Lũy kế']} />
                    <Area type="monotone" dataKey="TongTichLuy" stroke="#059669" fill="#059669" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 text-xs space-y-2">
                <div className="flex items-center justify-between"><span className="text-slate-500">Tổng 6 tháng:</span><span className="font-extrabold text-emerald-800 font-money text-sm">{formatVND(runwayMetrics.totalAccumulated)}</span></div>
                <div className="flex items-start gap-1.5 text-emerald-900"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5" /> <p className="text-[11px]">Tăng trưởng đều đặn qua 6 tháng!</p></div>
              </div>
            </div>
          )}
          {intelligenceTab === 'benchmark' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-xs space-y-3">
                <div className="space-y-1"><div className="flex justify-between font-bold text-slate-700"><span>🏠 Thiết Yếu</span><span>{rule503020Metrics.needsPercent}%</span></div><div className="w-full h-2 bg-slate-200 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rule503020Metrics.needsPercent}%` }} /></div></div>
                <div className="space-y-1"><div className="flex justify-between font-bold text-slate-700"><span>🛍️ Linh Hoạt</span><span>{rule503020Metrics.wantsPercent}%</span></div><div className="w-full h-2 bg-slate-200 rounded-full"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${rule503020Metrics.wantsPercent}%` }} /></div></div>
                <div className="space-y-1"><div className="flex justify-between font-bold text-slate-700"><span>💰 Tích Lũy</span><span>{rule503020Metrics.savingsPercent}%</span></div><div className="w-full h-2 bg-slate-200 rounded-full"><div className="h-full bg-teal-500 rounded-full" style={{ width: `${rule503020Metrics.savingsPercent}%` }} /></div></div>
              </div>
            </div>
          )}
          {intelligenceTab === 'runway' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60"><div className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Flame className="w-3.5 h-3.5 text-amber-500" /> <span>Burn Rate</span></div><p className="font-extrabold text-slate-900 font-money mt-1">{formatVND(runwayMetrics.dailyBurnRate)}/d</p></div>
                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200"><div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> <span>Quỹ sinh tồn</span></div><p className="font-extrabold text-emerald-800 font-money mt-1">{runwayMetrics.runwayMonths} tháng</p></div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 text-xs text-slate-800 flex gap-2"><AlertCircle className="w-4 h-4 text-emerald-600" /> <p>Bạn đủ khả năng sống trong {runwayMetrics.runwayMonths} tháng tới nếu nghỉ việc.</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
