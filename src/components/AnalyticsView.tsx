import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { Sparkles, Award, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { Transaction, CategoryCode, CategoryInfo } from '../types';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories?: Record<CategoryCode, CategoryInfo>;
  monthlyIncome: number;
  monthlyExpense: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  categories,
  monthlyIncome,
  monthlyExpense,
}) => {
  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' đ';
  };

  // Calculate expense by category
  const categorySpentMap: Record<string, number> = {};
  transactions.forEach((tx) => {
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

  // Calculate financial health score
  const netSavings = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0;

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

  // Work-related reimbursable expense total
  const workReimbursableTotal = transactions
    .filter((tx) => tx.category === 'Work' && tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const barData = [
    { name: 'Tháng 8', ThuNhap: monthlyIncome, ChiTieu: monthlyExpense, TietKiem: Math.max(0, netSavings) },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-24">
      {/* Financial Health Score Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider">
                Sức Khỏe Tài Chính Văn Phòng
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
          <p><b>Lời khuyên AI:</b> {adviceMessage}</p>
        </div>
      </div>

      {/* Reimbursable Work Expense Card */}
      {workReimbursableTotal > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              💼 Chi quẹt thẻ giùm công ty (Work):
            </span>
            <p className="text-base font-black text-amber-900">{formatVND(workReimbursableTotal)}</p>
            <p className="text-[11px] text-amber-800">Tiền chạy Ads, mua đạo cụ. Nhớ hoàn ứng trước cuối tháng!</p>
          </div>
          <span className="text-xs bg-white text-amber-800 border border-amber-300 font-bold px-3 py-1.5 rounded-xl shadow-2xs">
            Cần hoàn ứng
          </span>
        </div>
      )}

      {/* Pie Chart & Bar Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            <span>Cơ Cấu Chi Tiêu Dân Văn Phòng</span>
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
