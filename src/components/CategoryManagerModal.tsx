import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, Sparkles, FolderPlus, Tag } from 'lucide-react';
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
  { name: 'Blue', color: '#2563EB', bgColor: '#DBEAFE' },
  { name: 'Emerald', color: '#10B981', bgColor: '#D1FAE5' },
  { name: 'Pink', color: '#EC4899', bgColor: '#FCE7F3' },
  { name: 'Purple', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { name: 'Red', color: '#EF4444', bgColor: '#FEE2E2' },
  { name: 'Cyan', color: '#06B6D4', bgColor: '#CFFAFE' },
  { name: 'Indigo', color: '#4F46E5', bgColor: '#E0E7FF' },
  { name: 'Rose', color: '#F43F5E', bgColor: '#FFE4E6' },
  { name: 'Teal', color: '#14B8A6', bgColor: '#CCFBF1' },
];

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
  const [newDesc, setNewDesc] = useState('');
  const [newLimitInput, setNewLimitInput] = useState('3000'); // default 3,000,000
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Edit Category Form State
  const [editLabel, setEditLabel] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLimitInput, setEditLimitInput] = useState('');
  const [editColorIndex, setEditColorIndex] = useState(0);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingCode(null);
    setNewLabel('');
    setNewDesc('');
    setNewLimitInput('3000');
    setSelectedColorIndex(0);
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    // Generate unique code
    const code = 'Custom_' + Date.now().toString().slice(-6);
    const colorObj = PRESET_COLORS[selectedColorIndex] || PRESET_COLORS[0];
    
    let numLimit = parseFloat(newLimitInput.replace(/,/g, '.'));
    let limitVND = isNaN(numLimit) ? 2000000 : numLimit < 1000 ? numLimit * 1000000 : numLimit * 1000;

    const newCategory: CategoryInfo = {
      code,
      label: newLabel.trim(),
      iconName: 'Tag',
      color: colorObj.color,
      bgColor: colorObj.bgColor,
      description: newDesc.trim() || 'Danh mục chi tiêu tùy chỉnh',
      isCustom: true,
    };

    onAddCategory(newCategory, limitVND);
    setIsAdding(false);
    setNewLabel('');
    setNewDesc('');
  };

  const handleStartEdit = (cat: CategoryInfo) => {
    setEditingCode(cat.code);
    setIsAdding(false);
    setEditLabel(cat.label || '');
    setEditDesc(cat.description || '');
    
    const limit = (budgetsMap && budgetsMap[cat.code]) || 2000000;
    setEditLimitInput((limit / 1000).toString());

    const matchedIndex = PRESET_COLORS.findIndex(c => c.color.toLowerCase() === (cat.color || '').toLowerCase());
    setEditColorIndex(matchedIndex >= 0 ? matchedIndex : 0);
  };

  const handleSaveEdit = (code: CategoryCode) => {
    if (!editLabel.trim()) return;

    const colorObj = PRESET_COLORS[editColorIndex] || PRESET_COLORS[0];
    let numLimit = parseFloat(editLimitInput.replace(/,/g, '.'));
    let limitVND = isNaN(numLimit) ? undefined : numLimit < 1000 ? numLimit * 1000000 : numLimit * 1000;

    onUpdateCategory(
      code,
      {
        label: editLabel.trim(),
        description: editDesc.trim(),
        color: colorObj.color,
        bgColor: colorObj.bgColor,
      },
      limitVND
    );

    setEditingCode(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Quản lý danh mục</h3>
              <p className="text-xs text-gray-500">Thêm, sửa, xóa hạn mức chi tiêu</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Button Bar */}
        {!isAdding && (
          <button
            onClick={handleStartAdd}
            className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-600" />
            <span>Thêm mới</span>
          </button>
        )}

        {/* Add New Category Form */}
        {isAdding && (
          <form onSubmit={handleSaveNew} className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-3 text-xs animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Tạo mới
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="VD: Bỉm sữa, Du lịch, Thú cưng..."
                  required
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Hạn mức tháng (kđ)</label>
                <input
                  type="number"
                  value={newLimitInput}
                  onChange={(e) => setNewLimitInput(e.target.value)}
                  placeholder="VD: 3000 (= 3,000,000đ)"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Mô tả / Từ khóa nhận diện AI</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="VD: Tiền mua tã, sữa, đồ chơi, đi khám cho em bé..."
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
              />
            </div>

            {/* Color Selector */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1.5">Chọn tông màu đại diện</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform cursor-pointer border ${
                      selectedColorIndex === idx ? 'scale-110 border-gray-900 shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: p.bgColor, color: p.color }}
                  >
                    {selectedColorIndex === idx ? <Check className="w-4 h-4 stroke-[3]" /> : '●'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl cursor-pointer"
              >
                Lưu Danh Mục
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* Categories List */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            Danh sách ({Object.keys(categories || {}).length})
          </p>

          {(Object.entries(categories || {}) as [string, CategoryInfo][]).map(([code, cat]) => {
            if (code === 'Budget_Query') return null;
            const limit = (budgetsMap && budgetsMap[code]) || 0;
            const isEditing = editingCode === code;

            if (isEditing) {
              return (
                <div key={code} className="bg-gray-50 p-4 rounded-xl border border-blue-300 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-gray-800">
                    <span>Sửa Danh Mục: {cat.label}</span>
                    <button onClick={() => setEditingCode(null)} className="text-gray-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-600 font-medium mb-1">Tên hiển thị</label>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-medium mb-1">Hạn mức (kđ)</label>
                      <input
                        type="number"
                        value={editLimitInput}
                        onChange={(e) => setEditLimitInput(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Mô tả từ khóa</label>
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 font-medium mb-1">Màu sắc</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((p, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setEditColorIndex(idx)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] cursor-pointer ${
                            editColorIndex === idx ? 'ring-2 ring-blue-600 scale-105' : ''
                          }`}
                          style={{ backgroundColor: p.bgColor, color: p.color }}
                        >
                          {editColorIndex === idx ? '✓' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(code)}
                      className="flex-1 bg-blue-600 text-white font-bold py-1.5 rounded-lg text-xs cursor-pointer"
                    >
                      Cập Nhật
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCode(null)}
                      className="bg-gray-200 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-xs cursor-pointer"
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
                className="bg-white rounded-xl p-3 border border-gray-100 hover:border-gray-200 shadow-2xs flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ backgroundColor: cat.bgColor, color: cat.color }}
                  >
                    {cat.label.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{cat.label}</span>
                      {cat.isCustom && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.2 rounded font-semibold">
                          Tự chọn
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{cat.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">Hạn mức tháng</p>
                    <p className="font-extrabold text-gray-800">
                      {limit > 0 ? (limit / 1000000).toFixed(1) + ' củ' : 'Chưa đặt'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa danh mục"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteCategory(code)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa danh mục"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-gray-100 text-right">
          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
