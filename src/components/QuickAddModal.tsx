import React, { useState } from 'react';
import { X, Settings2, ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';
import { CategoryCode, CategoryInfo, TransactionType } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Record<CategoryCode, CategoryInfo>;
  onOpenCategoryManager?: () => void;
  onAddTransaction: (data: {
    type: TransactionType;
    amount: number;
    category: CategoryCode;
    description: string;
    personName?: string;
  }) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  categories,
  onOpenCategoryManager,
  onAddTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<CategoryCode>('Food');
  const [amountInput, setAmountInput] = useState('');
  const [description, setDescription] = useState('');
  const [personName, setPersonName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput.trim() || !description.trim()) return;

    let num = parseFloat(amountInput.replace(/,/g, '.'));
    let amountVND = num < 1000 ? Math.round(num * 1000) : Math.round(num);

    onAddTransaction({
      type,
      category,
      amount: amountVND,
      description: description.trim(),
      personName: personName.trim() || undefined,
    });

    setAmountInput('');
    setDescription('');
    setPersonName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 transition-all">
      <div className="bg-white rounded-t-[32px] sm:rounded-[28px] max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200/80 animate-in slide-in-from-bottom-5 duration-200 select-none">
        {/* Grab Handle for Mobile */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto sm:hidden" />

        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Ghi chép thu chi mới</h3>
            <p className="text-xs text-slate-500 font-medium">Nhập số tiền và phân loại vào ví</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Type Picker Segmented Control */}
          <div className="p-1 bg-slate-100 rounded-2xl flex gap-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Khoản Chi (-)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Khoản Thu (+)</span>
            </button>
          </div>

          {/* Large Hero Amount Input */}
          <div className="space-y-1">
            <label className="block text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              Số tiền (VNĐ):
            </label>
            <div className="relative">
              <input
                type="text"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="VD: 50k, 250000, 1.5 củ"
                required
                autoFocus
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-3 text-lg font-extrabold text-slate-900 outline-none transition-all placeholder:text-slate-300"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                VNĐ
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              Mô tả chi tiêu:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Cơm trưa gà nướng, cafe Highlands..."
              required
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Picker */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                Danh mục:
              </label>
              {onOpenCategoryManager && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCategoryManager();
                  }}
                  className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Settings2 className="w-3 h-3" />
                  <span>Quản lý danh mục</span>
                </button>
              )}
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryCode)}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2.5 outline-none font-bold text-slate-800 cursor-pointer"
            >
              {(Object.entries(categories || {}) as [string, CategoryInfo][]).map(([code, info]) => {
                if (code === 'Budget_Query') return null;
                return (
                  <option key={code} value={code}>
                    {info?.label || code} {info?.description ? `— (${info.description})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Person Name (Optional) */}
          <div className="space-y-1">
            <label className="block text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              Người liên quan (nếu có):
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="VD: Nam, Linh, Trưởng phòng..."
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2 font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold py-3 rounded-2xl cursor-pointer transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold py-3 rounded-2xl shadow-md shadow-emerald-600/30 cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Lưu Vào Sổ Ví</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
