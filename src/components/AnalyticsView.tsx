import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { Sparkles, Award, TrendingUp, DollarSign, Wallet, ChevronLeft, ChevronRight, Zap, Loader2, AlertTriangle } from 'lucide-react';
import { Transaction, CategoryCode, CategoryInfo } from '../types';
import { getApiUrl } from '../utils/api';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories?: Record<CategoryCode, CategoryInfo>;
  monthlyIncome?: number; 
  monthlyExpense?: number; 
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  categories,
}) => {
  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' đ';
  };

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach(tx => {
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

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(tx => tx.date && tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const monthlyIncomeLocal = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenseLocal = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const categorySpentMap: Record<string, number> = {};
  monthlyTransactions.forEach((tx) => {
    if (tx.type === 'expense') {
      categorySpentMap[tx.category] = (categorySpentMap[tx.category] || 0) + tx.amount;
    }
  });

  const pieData = Object.entries(categorySpentMap).map(([catCode, amount]) => {
    const cat = categories?.[catCode] || { label: catCode, color: '#3B82F6' };
    return {
      name: cat?.label || catCode,
      value: amount,
      color: cat?.color || '#3B82F6',
    };
  });

  const netSavings = monthlyIncomeLocal - monthlyExpenseLocal;
  const savingsRate = monthlyIncomeLocal > 0 ? Math.round((netSavings / monthlyIncomeLocal) * 100) : 0;

  let healthScore = 85;
  let healthGrade = 'Tốt (A)';
  let adviceMessage = 'Dòng tiền ổn định. Chi tiêu ăn uống và công việc đang đúng kế hoạch!';

  if (savingsRate < 10) {
    healthScore = 55;
    healthGrade = 'Cần Cân Đối (C)';
    adviceMessage = 'Tỷ lệ tiết kiệm dưới 10%. Nên tiết giảm chi tiêu mua sắm và cafe ngoài giờ.';
  } else if (savingsRate >= 30) {
    healthScore = 95;
    healthGrade = 'Xuất Sắc (A+)';
    adviceMessage = 'Tuyệt vời! Bạn giữ lại được hơn 30% thu nhập tháng này. Sẵn sàng tích lũy đầu tư.';
  }

  const barData = useMemo(() => {
    const data = [];
    const currentIdx = availableMonths.indexOf(selectedMonth);
    const startIdx = Math.max(0, currentIdx - 5); 
    
    for (let i = startIdx; i <= currentIdx; i++) {
      const monthStr = availableMonths[i];
      const txs = transactions.filter(t => t.date && t.date.startsWith(monthStr));
      const tIn = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const tEx = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const [y, m] = monthStr.split('-');
      data.push({
        name: `Tháng ${parseInt(m)}`,
        ThuNhap: tIn,
        ChiTieu: tEx,
        TietKiem: Math.max(0, tIn - tEx)
      });
    }
    return data;
  }, [availableMonths, selectedMonth, transactions]);

  const handlePrevMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx > 0) setSelectedMonth(availableMonths[idx - 1]);
  };

  const handleNextMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx < availableMonths.length - 1) setSelectedMonth(availableMonths[idx + 1]);
    setWrapUpResult(null); // Reset wrap-up when switching month
  };

  const [year, month] = selectedMonth.split('-');
  const displayMonth = `Tháng ${parseInt(month)}, ${year}`;

  // AI Wrap-up State
  const [isWrappingUp, setIsWrappingUp] = useState(false);
  const [wrapUpResult, setWrapUpResult] = useState<string | null>(null);

  const handleGenerateWrapUp = async () => {
    setIsWrappingUp(true);
    setWrapUpResult(null);
    try {
      const res = await fetch(getApiUrl('/api/ai-wrap-up'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: displayMonth,
          transactions: monthlyTransactions,
          categories,
          savingsRate
        })
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

  // Burn-rate Prediction (only for the current month)
  let burnRateMessage = null;
  const today = new Date();
  const todayMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  if (selectedMonth === todayMonthStr) {
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    // Only predict if we are mid-month (e.g. past day 5)
    if (dayOfMonth > 5 && monthlyIncomeLocal > 0) {
      const burnRatePerDay = monthlyExpenseLocal / dayOfMonth;
      const projectedTotal = burnRatePerDay * daysInMonth;
      
      if (projectedTotal > monthlyIncomeLocal) {
        const daysUntilEmpty = Math.floor(monthlyIncomeLocal / burnRatePerDay);
        if (daysUntilEmpty < daysInMonth && daysUntilEmpty > dayOfMonth) {
          burnRateMessage = `Tốc độ tiêu tiền báo động! 🚨 Nếu tiếp tục, bạn sẽ cạn tiền vào ngày ${daysUntilEmpty}/${parseInt(month)}. Hãy hãm phanh lại nhé!`;
        } else if (daysUntilEmpty <= dayOfMonth) {
          burnRateMessage = `Báo động đỏ! 🚨 Ngân sách của bạn đã cạn kiệt ở tốc độ hiện tại.`;
        }
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-24">
      {/* Time-travel Selector */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <button 
          onClick={handlePrevMonth}
          disabled={availableMonths.indexOf(selectedMonth) === 0}
          className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Báo Cáo</p>
          <p className="font-black text-gray-900">{displayMonth}</p>
        </div>
        <button 
          onClick={handleNextMonth}
          disabled={availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
          className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      {/* Financial Health Score Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                Sức Khỏe Tài Chính
              </p>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>{healthScore} / 100 điểm</span>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md font-bold">
                  Hạng {healthGrade}
                </span>
              </h2>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[11px] text-gray-500 font-medium">Tỷ lệ tích lũy</p>
            <p className="text-base font-black text-emerald-600">{savingsRate}%</p>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-gray-200/60 text-xs text-gray-700 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p><b>Lời khuyên tự động:</b> {adviceMessage}</p>
        </div>

        {/* Burn-rate Alert */}
        {burnRateMessage && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-3 mt-2 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm font-medium text-red-800">
              {burnRateMessage}
            </div>
          </div>
        )}

        {/* AI Wrap Up Trigger */}
        <div className="pt-2">
          {!wrapUpResult ? (
            <button
              onClick={handleGenerateWrapUp}
              disabled={isWrappingUp}
              className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl p-3 font-bold text-sm shadow-md transition-all hover:shadow-lg disabled:opacity-80 flex items-center justify-center gap-2"
            >
              {isWrappingUp ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI đang viết mớ hỗn độn của bạn...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-yellow-300" />
                  Tạo Báo Cáo AI "Roast & Toast"
                </>
              )}
            </button>
          ) : (
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-5 rounded-2xl shadow-xl border border-purple-500/30 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-16 h-16" />
              </div>
              <h3 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-pink-400 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                Spotify Wrapped... à nhầm ChiChill Wrapped!
              </h3>
              <p className="text-sm text-purple-100 leading-relaxed relative z-10 font-medium">
                {wrapUpResult}
              </p>
              <button 
                onClick={() => setWrapUpResult(null)}
                className="mt-4 text-xs font-bold text-purple-300 hover:text-white"
              >
                Đóng báo cáo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pie Chart & Bar Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            <span>Cơ Cấu Chi Tiêu</span>
          </h3>

          <div className="h-60 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatVND(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Chưa có dữ liệu chi tiêu
              </div>
            )}
          </div>

          {/* Pie Chart Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600 truncate">{item.name}:</span>
                <span className="font-bold text-gray-900">{formatVND(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Income vs Expense Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Cân Đối Thu Chi & Tích Lũy</span>
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `${v/1000000}M`} />
                <Tooltip formatter={(val: any) => formatVND(Number(val))} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="ThuNhap" fill="#10B981" name="Thu Nhập" radius={[6, 6, 0, 0]} />
                <Bar dataKey="ChiTieu" fill="#EF4444" name="Chi Tiêu" radius={[6, 6, 0, 0]} />
                <Bar dataKey="TietKiem" fill="#2563EB" name="Tích Lũy" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-gray-200/60 text-xs text-gray-700 space-y-1">
            <p>• <b>Dòng tiền ròng:</b> +{formatVND(netSavings)}</p>
            <p>• <b>Dự kiến tích lũy 1 năm:</b> ~{formatVND(netSavings * 12)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
