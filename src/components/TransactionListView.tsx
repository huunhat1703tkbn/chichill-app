import React, { useState } from 'react';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownLeft, Calendar, PlusCircle, HandCoins } from 'lucide-react';
import { Transaction, CategoryCode, CategoryInfo } from '../types';

interface TransactionListViewProps {
  transactions: Transaction[];
  categories: Record<CategoryCode, CategoryInfo>;
  onDeleteTransaction: (id: string) => void;
  onOpenAddModal: () => void;
}

export const TransactionListView: React.FC<TransactionListViewProps> = ({
  transactions,
  categories,
  onDeleteTransaction,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryCode | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'expense' | 'income' | 'receivable' | 'payable'>('ALL');

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' đ';
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.personName && tx.personName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || tx.category === selectedCategory;
    const matchesType = selectedType === 'ALL' || tx.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-24">
      {/* Header Stat Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Tổng Thu Nhập</p>
            <p className="text-sm font-black text-emerald-600">{formatVND(totalIncome)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0 font-bold">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Tổng Chi Tiêu</p>
            <p className="text-sm font-black text-rose-600">{formatVND(totalExpense)}</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-blue-600 text-white p-4 rounded-2xl shadow-md shadow-blue-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-blue-100 font-medium uppercase tracking-wider">Dòng Tiền Ròng</p>
            <p className="text-sm font-black">{formatVND(totalIncome - totalExpense)}</p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="bg-white text-blue-700 font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm giao dịch (cơm trưa, ads, Nam, trà sữa...)"
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả loại giao dịch</option>
            <option value="expense">Khoản chi tiêu</option>
            <option value="income">Khoản thu nhập</option>
            <option value="receivable">Cho vay / Ứng trước</option>
            <option value="payable">Khoản mượn nợ</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Tất cả ({transactions.length})
          </button>

          {(Object.entries(categories || {}) as [string, CategoryInfo][]).map(([code, info]) => {
            if (code === 'Budget_Query') return null;
            const count = transactions.filter((t) => t.category === code).length;
            const isSelected = selectedCategory === code;

            return (
              <button
                key={code}
                onClick={() => setSelectedCategory(code as CategoryCode)}
                className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{info?.label || code}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction List Cards */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-500 shadow-2xs">
            <p className="text-sm font-medium">Không tìm thấy giao dịch nào phù hợp.</p>
            <p className="text-xs mt-1 text-gray-400">Hãy thử đổi từ khóa hoặc dùng AI Chat để ghi nhận khoản mới!</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const catLabel = (categories && categories[tx.category]?.label) || tx.category || 'Giao dịch';
            const isReceivable = tx.type === 'receivable';
            const isPayable = tx.type === 'payable';
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-3.5 border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                    {catLabel.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-gray-900">{tx.description}</p>
                      {tx.personName && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                          {tx.personName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{tx.date} {tx.time || ''}</span>
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-gray-600">
                        {catLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        isIncome
                          ? 'text-green-500'
                          : isReceivable
                          ? 'text-amber-600'
                          : isPayable
                          ? 'text-red-500'
                          : 'text-red-500'
                      }`}
                    >
                      {isIncome ? '+' : isReceivable ? '👤 Vay ' : isPayable ? '💳 Nợ ' : '-'}
                      {formatVND(tx.amount)}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="p-1 text-gray-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="Xóa giao dịch"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
