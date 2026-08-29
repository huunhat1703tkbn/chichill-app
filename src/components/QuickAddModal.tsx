import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Settings2,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Calendar,
  ChevronDown,
  Utensils,
  Car,
  ShoppingBag,
  Briefcase,
  HandCoins,
  Wallet,
  Home,
  Tv,
  Tag,
  Receipt,
} from 'lucide-react';
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
    date?: string;
  }) => void;
}

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
      return <Tag {...iconProps} />;
  }
};

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatVND = (val: number) => {
  return val.toLocaleString('vi-VN') + ' ₫';
};

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
  const [date, setDate] = useState(getTodayString);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  // Ensure default category is valid when a category is deleted
  useEffect(() => {
    const validKeys = Object.keys(categories || {});
    if (validKeys.length > 0 && !categories[category]) {
      setCategory(validKeys[0] as CategoryCode);
    }
  }, [categories, category]);

  if (!isOpen) return null;

  const todayStr = getTodayString();
  const yesterdayStr = getYesterdayString();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountInput(e.target.value);
  };

  const parsedInputAmount = useMemo(() => {
    if (!amountInput.trim()) return 0;
    let raw = amountInput.trim().toLowerCase();
    if (raw.endsWith('k')) return parseFloat(raw.replace('k', '').replace(/,/g, '.')) * 1000;
    if (raw.endsWith('tr') || raw.endsWith('m') || raw.includes('triệu')) return parseFloat(raw.replace(/(tr|m|triệu)/g, '').replace(/,/g, '.')) * 1000000;
    if (raw.endsWith('củ')) return parseFloat(raw.replace('củ', '').replace(/,/g, '.')) * 1000000;
    const clean = parseFloat(raw.replace(/,/g, '.'));
    return clean < 1000 ? Math.round(clean * 1000) : Math.round(clean);
  }, [amountInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput.trim() || !description.trim()) return;

    let num = parsedInputAmount;
    if (isNaN(num) || num <= 0) return;

    onAddTransaction({
      type,
      category,
      amount: Math.round(num),
      description: description.trim(),
      personName: personName.trim() || undefined,
      date: date || todayStr,
    });

    setAmountInput('');
    setDescription('');
    setPersonName('');
    setDate(getTodayString());
    setIsCategorySheetOpen(false);
    onClose();
  };

  const activeCategoryInfo = categories?.[category] || {
    label: category,
    color: '#059669',
    bgColor: '#ECFDF5',
    iconName: 'Tag',
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 z-50 transition-all select-none">
      <div className="bg-white rounded-[28px] max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Ghi chép thu chi</h3>
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

          {/* Large Hero Amount Input with Font-Money */}
          <div className="space-y-1">
            <label className="block text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              Số tiền (VNĐ):
            </label>
            <div className="relative">
              <input
                type="text"
                value={amountInput}
                onChange={handleAmountChange}
                placeholder="VD: 50k, 250.000, 1.5tr..."
                required
                autoFocus
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl px-4 py-3 text-lg font-extrabold text-slate-900 outline-none transition-all placeholder:text-slate-300 font-money"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">
                VNĐ
              </span>
            </div>
          </div>

          {/* Date Picker Row (Hôm nay / Hôm qua / Chọn ngày) */}
          <div className="space-y-1">
            <label className="block text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              Ngày ghi nhận:
            </label>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none transition-all cursor-pointer font-money"
                />
              </div>

              {/* Quick Date Chips */}
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  date === todayStr
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                Hôm nay
              </button>

              <button
                type="button"
                onClick={() => setDate(yesterdayStr)}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  date === yesterdayStr
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                Hôm qua
              </button>
            </div>
          </div>

          {/* Category Picker (Minimalist Custom Filter Button) */}
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

            {/* Custom Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCategorySheetOpen(true)}
              className="w-full bg-slate-50 hover:bg-slate-100/80 active:scale-[0.99] border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: activeCategoryInfo.bgColor || '#ECFDF5',
                    color: activeCategoryInfo.color || '#059669',
                  }}
                >
                  {renderCategoryIcon(activeCategoryInfo.iconName, category)}
                </div>
                <span className="font-extrabold text-xs text-slate-800 truncate">
                  {activeCategoryInfo.label || category}
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <span className="text-[11px] text-slate-400 font-medium">Thay đổi</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </button>
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
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold py-3 rounded-2xl cursor-pointer transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold py-3 rounded-2xl shadow-md shadow-emerald-600/25 cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Lưu Vào Sổ Ví</span>
            </button>
          </div>
        </form>
      </div>

      {/* Category Picker Sub-Modal Sheet */}
      {isCategorySheetOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in select-none">
          <div className="bg-white rounded-[28px] w-full max-w-sm p-5 shadow-2xl border border-slate-100 space-y-3.5 animate-in zoom-in-95 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-extrabold text-sm text-slate-900">Chọn danh mục</span>
                <p className="text-[11px] text-slate-400">Phân loại khoản {type === 'expense' ? 'chi tiêu' : 'thu nhập'}</p>
              </div>
              <button
                onClick={() => setIsCategorySheetOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-1.5 pr-1 max-h-[55vh] touch-scroll">
              {(Object.entries(categories || {}) as [string, CategoryInfo][]).map(([code, info]) => {
                if (code === 'Budget_Query') return null;
                const isSelected = category === code;

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setCategory(code as CategoryCode);
                      setIsCategorySheetOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: info?.bgColor || '#ECFDF5',
                          color: info?.color || '#059669',
                        }}
                      >
                        {renderCategoryIcon(info?.iconName, code)}
                      </div>
                      <span className="truncate text-xs font-bold">{info?.label || code}</span>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

