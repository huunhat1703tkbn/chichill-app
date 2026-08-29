import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit3,
  Trash2,
  Check,
  Sparkles,
  Tag,
  Utensils,
  Car,
  ShoppingBag,
  Briefcase,
  HandCoins,
  Wallet,
  Home,
  Tv,
  Receipt,
} from 'lucide-react';
import { CategoryCode, CategoryInfo, CategoryBudget } from '../types';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: Record<CategoryCode, CategoryInfo>;
  categoryBudgets?: Record<CategoryCode, number>;
  budgets?: CategoryBudget[];
  onAddCategory: (newCategory: CategoryInfo, defaultLimit: number) => void;
  onUpdateCategory: (code: CategoryCode, updatedCategory: Partial<CategoryInfo>, newLimit?: number) => void;
  onDeleteCategory: (code: CategoryCode) => void;
}

const PRESET_COLORS = [
  { name: 'Amber', color: '#F59E0B', bgColor: '#FEF3C7' },
  { name: 'Orange', color: '#EA580C', bgColor: '#FFEDD5' },
  { name: 'Blue', color: '#2563EB', bgColor: '#DBEAFE' },
  { name: 'Emerald', color: '#10B981', bgColor: '#D1FAE5' },
  { name: 'Teal', color: '#0D9488', bgColor: '#CCFBF1' },
  { name: 'Pink', color: '#EC4899', bgColor: '#FCE7F3' },
  { name: 'Purple', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { name: 'Red', color: '#EF4444', bgColor: '#FEE2E2' },
  { name: 'Cyan', color: '#06B6D4', bgColor: '#CFFAFE' },
  { name: 'Rose', color: '#F43F5E', bgColor: '#FFE4E6' },
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
      return <Tag {...iconProps} />;
  }
};

const formatVND = (val: number) => {
  return val.toLocaleString('vi-VN') + ' ₫';
};

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories = {},
  categoryBudgets = {},
  budgets = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCode, setEditingCode] = useState<CategoryCode | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ code: CategoryCode; label: string } | null>(null);

  // Computed budget map from either prop with complete safe fallbacks
  const budgetsMap: Record<string, number> = { ...(categoryBudgets || {}) };
  if (budgets && Array.isArray(budgets)) {
    budgets.forEach((b) => {
      if (b && b.category) {
        budgetsMap[b.category] = b.limitAmount;
      }
    });
  }

  // New Category Form State
  const [newLabel, setNewLabel] = useState('');
  const [newLimitInput, setNewLimitInput] = useState('3000000');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Edit Category Form State
  const [editLabel, setEditLabel] = useState('');
  const [editLimitInput, setEditLimitInput] = useState('');
  const [editColorIndex, setEditColorIndex] = useState(0);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingCode(null);
    setNewLabel('');
    setNewLimitInput('3000000');
    setSelectedColorIndex(0);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    // Generate unique code
    const code = 'Custom_' + Date.now().toString().slice(-6);
    const colorObj = PRESET_COLORS[selectedColorIndex] || PRESET_COLORS[0];
    
    let numLimit = parseFloat(newLimitInput.replace(/,/g, '.'));
    let limitVND = isNaN(numLimit) ? 2000000 : numLimit < 1000 ? numLimit * 1000000 : numLimit;

    const newCategory: CategoryInfo = {
      code,
      label: newLabel.trim(),
      iconName: 'Tag',
      color: colorObj.color,
      bgColor: colorObj.bgColor,
      description: '',
      isCustom: true,
    };

    onAddCategory(newCategory, Math.round(limitVND));
    setIsAdding(false);
    setNewLabel('');
    setNewLimitInput('3000000');
  };

  const handleStartEdit = (cat: CategoryInfo) => {
    setEditingCode(cat.code);
    setIsAdding(false);
    setEditLabel(cat.label || '');
    
    const limit = (budgetsMap && budgetsMap[cat.code]) || 2000000;
    setEditLimitInput(limit.toString());

    const matchedIndex = PRESET_COLORS.findIndex(c => c.color.toLowerCase() === (cat.color || '').toLowerCase());
    setEditColorIndex(matchedIndex >= 0 ? matchedIndex : 0);
  };

  const handleSaveEdit = (code: CategoryCode) => {
    if (!editLabel.trim()) return;

    const colorObj = PRESET_COLORS[editColorIndex] || PRESET_COLORS[0];
    let numLimit = parseFloat(editLimitInput.replace(/,/g, '.'));
    let limitVND = isNaN(numLimit) ? undefined : numLimit < 1000 ? numLimit * 1000000 : numLimit;

    onUpdateCategory(
      code,
      {
        label: editLabel.trim(),
        color: colorObj.color,
        bgColor: colorObj.bgColor,
      },
      limitVND ? Math.round(limitVND) : undefined
    );

    setEditingCode(null);
  };

  const categoryList = (Object.entries(categories || {}) as [string, CategoryInfo][]).filter(
    ([code]) => code !== 'Budget_Query'
  );

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 z-50 select-none">
      <div className="bg-white rounded-[28px] max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-bold shadow-2xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Quản lý danh mục</h3>
              <p className="text-xs text-slate-500 font-medium">Thêm, sửa, xóa hạn mức chi tiêu</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Button */}
        {!isAdding && (
          <button
            onClick={handleStartAdd}
            className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100/80 active:scale-[0.99] border border-emerald-200 text-emerald-800 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
            <span>Thêm danh mục mới</span>
          </button>
        )}

        {/* Add Form (Minimalist) */}
        {isAdding && (
          <form onSubmit={handleSaveNew} className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-950 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Thêm danh mục mới
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px]">Tên danh mục *</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="VD: Nuôi mèo, Tập Gym..."
                  required
                  autoFocus
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px]">Hạn mức tháng (VNĐ)</label>
                <input
                  type="number"
                  value={newLimitInput}
                  onChange={(e) => setNewLimitInput(e.target.value)}
                  placeholder="VD: 3000000"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 font-money"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 text-[11px]">Màu sắc</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                      selectedColorIndex === idx ? 'scale-110 ring-2 ring-emerald-600 ring-offset-1 shadow-sm' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: p.color }}
                  >
                    {selectedColorIndex === idx && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold py-2.5 rounded-xl cursor-pointer transition-all shadow-sm shadow-emerald-600/25"
              >
                ✓ Lưu Danh Mục
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl cursor-pointer hover:bg-slate-300"
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* Category List */}
        <div className="space-y-2 flex-1 overflow-y-auto pr-1 touch-scroll">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Danh sách ({categoryList.length})
          </p>

          {categoryList.map(([code, cat]) => {
            const limit = (budgetsMap && budgetsMap[code]) || 0;
            const isEditing = editingCode === code;

            if (isEditing) {
              return (
                <div key={code} className="bg-slate-50 p-3.5 rounded-2xl border border-emerald-300 space-y-3 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Sửa danh mục: {cat.label}</span>
                    <button onClick={() => setEditingCode(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1 text-[11px]">Tên hiển thị</label>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-emerald-500 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1 text-[11px]">Hạn mức tháng (VNĐ)</label>
                      <input
                        type="number"
                        value={editLimitInput}
                        onChange={(e) => setEditLimitInput(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-emerald-500 text-slate-900 font-money"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1.5 text-[11px]">Màu sắc</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((p, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setEditColorIndex(idx)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                            editColorIndex === idx ? 'scale-110 ring-2 ring-emerald-600 ring-offset-1 shadow-sm' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: p.color }}
                        >
                          {editColorIndex === idx && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(code)}
                      className="flex-1 bg-emerald-600 text-white font-extrabold py-2 rounded-xl text-xs cursor-pointer hover:bg-emerald-700 active:scale-95 shadow-sm shadow-emerald-600/25"
                    >
                      ✓ Cập Nhật
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCode(null)}
                      className="bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer hover:bg-slate-300"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={code}
                className="bg-white rounded-2xl p-3 border border-slate-100 hover:border-slate-200 shadow-2xs flex items-center justify-between text-xs transition-all"
              >
                {/* Left: Icon Squircle + Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: cat.bgColor || '#ECFDF5',
                      color: cat.color || '#059669',
                    }}
                  >
                    {renderCategoryIcon(cat.iconName, code)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">{cat.label}</span>
                      {cat.isCustom && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-bold shrink-0">
                          Tùy chỉnh
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Limit Amount + Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hạn mức</p>
                    <p className="font-extrabold text-slate-800 font-money text-xs sm:text-sm whitespace-nowrap">
                      {limit > 0 ? formatVND(limit) : 'Chưa đặt'}
                    </p>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Chỉnh sửa danh mục"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setCategoryToDelete({ code, label: cat.label })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Xóa danh mục"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Close */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Sleek In-App Delete Category Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 select-none">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <Trash2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Xóa danh mục?</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Bạn có chắc muốn xóa danh mục <b className="text-slate-800 font-extrabold">"{categoryToDelete.label}"</b> và hạn mức liên quan? Các giao dịch cũ vẫn được giữ nguyên an toàn.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (categoryToDelete) {
                    onDeleteCategory(categoryToDelete.code);
                    setCategoryToDelete(null);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

