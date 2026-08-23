import React, { useState } from 'react';
import { X, Plus, Settings2 } from 'lucide-react';
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-scaleIn">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800">Thêm Giao Dịch Nhập Tay</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Type Picker */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Loại giao dịch:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 rounded-xl border text-center font-bold cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Khoản Chi Tiêu (-)
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 rounded-xl border text-center font-bold cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Khoản Thu Nhập (+)
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Số tiền (VNĐ):</label>
            <input
              type="text"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="e.g. 45k hoặc 45000, 1.2 củ hoặc 1200000"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-bold"
            />
          </div>

          {/* Category */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-slate-600 font-medium">Danh mục:</label>
              {onOpenCategoryManager && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCategoryManager();
                  }}
                  className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Settings2 className="w-3 h-3" />
                  + Thêm / Tùy chỉnh
                </button>
              )}
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryCode)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-medium"
            >
              {(Object.entries(categories || {}) as [string, CategoryInfo][]).map(([code, info]) => {
                if (code === 'Budget_Query') return null;
                return (
                  <option key={code} value={code}>
                    {info?.label || code} {info?.description ? `(${info.description})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Mô tả giao dịch:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cơm trưa, Grab, Quẹt thẻ Ads, Bỉm sữa..."
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-medium"
            />
          </div>

          {/* Person Name optional */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">Tên liên quan (Nếu có):</label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Tên đồng nghiệp, Sếp, Khách hàng (Không bắt buộc)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer"
            >
              Lưu Giao Dịch
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
