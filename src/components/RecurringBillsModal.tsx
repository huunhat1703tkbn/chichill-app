import React, { useState } from 'react';
import { RecurringBill, CategoryInfo } from '../types';
import { X, Plus, Calendar, CreditCard, Trash2, Power } from 'lucide-react';
import { CATEGORIES } from '../data/initialData';

interface RecurringBillsModalProps {
  recurringBills: RecurringBill[];
  setRecurringBills: React.Dispatch<React.SetStateAction<RecurringBill[]>>;
  userCategories: CategoryInfo[];
  onClose: () => void;
}

export function RecurringBillsModal({ recurringBills, setRecurringBills, userCategories, onClose }: RecurringBillsModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(userCategories.length > 0 ? userCategories[0].code : 'food');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const allCategories = [...Object.values(CATEGORIES), ...userCategories].filter((v, i, a) => a.findIndex(t => (t.code === v.code)) === i);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !startDate) return;

    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const newBill: RecurringBill = {
      id: `rb-${Date.now()}`,
      title,
      amount: numAmount,
      category,
      frequency,
      nextDueDate: startDate,
      isActive: true,
    };

    setRecurringBills(prev => [...prev, newBill]);
    setTitle('');
    setAmount('');
  };

  const handleToggleActive = (id: string) => {
    setRecurringBills(prev => prev.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa hóa đơn định kỳ này?")) {
      setRecurringBills(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-50 w-full max-w-lg rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] border border-slate-200/80 animate-in zoom-in-95">
        
        {/* Header - Emerald FinTech gradient */}
        <div className="emerald-gradient p-5 sm:p-6 shrink-0 relative overflow-hidden text-white">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-300/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative flex items-start justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-6 h-6 text-emerald-200" />
                Hóa Đơn & Định Kỳ
              </h2>
              <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 font-medium">Tự động ghi nhận các khoản chi cố định</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-all cursor-pointer backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-5 scrollbar-none touch-scroll">
          
          {/* Add New Form */}
          <form onSubmit={handleAdd} className="fin-card p-4 sm:p-5 space-y-3.5 relative overflow-hidden">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 stroke-[3]" /> Thêm khoản định kỳ mới
            </h3>
            
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tên khoản chi</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 placeholder-slate-400"
                placeholder="VD: Tiền thuê nhà, Internet, Netflix, Spotify..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Số tiền</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={amount}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setAmount(val ? new Intl.NumberFormat('vi-VN').format(parseInt(val)) : '');
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl pl-3.5 pr-8 py-2.5 text-xs focus:border-emerald-500 outline-none transition-all font-extrabold text-emerald-700 placeholder-slate-400"
                    placeholder="100.000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₫</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Danh mục</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 cursor-pointer"
                >
                  {allCategories.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chu kỳ</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as any)}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 cursor-pointer"
                >
                  <option value="monthly">Hàng tháng</option>
                  <option value="weekly">Hàng tuần</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ngày bắt đầu</label>
                <input 
                  type="date" 
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Tạo Hóa Đơn Định Kỳ
            </button>
          </form>

          {/* List of Recurring Bills */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 flex items-center gap-2 px-1 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-600" /> 
              Danh sách ({recurringBills.length})
            </h3>
            
            {recurringBills.length === 0 ? (
              <div className="text-center py-8 fin-card">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700">Chưa có hóa đơn nào</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Thêm hóa đơn để hệ thống tự động ghi nhận khi đến hạn</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recurringBills.map(bill => {
                  const cat = allCategories.find(c => c.code === bill.category) || allCategories[0];
                  return (
                    <div
                      key={bill.id}
                      className={`fin-card p-3.5 transition-all ${
                        bill.isActive
                          ? 'border-emerald-200/80 bg-white'
                          : 'border-slate-200 opacity-60 grayscale-[0.5]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-extrabold shadow-2xs shrink-0"
                            style={{ backgroundColor: cat.bgColor || '#ECFDF5', color: cat.color || '#059669' }}
                          >
                            {cat.label.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{bill.title}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                              <span className="font-extrabold text-emerald-700">{formatVND(bill.amount)}</span>
                              <span>•</span>
                              <span className="bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-600">
                                {bill.frequency === 'monthly' ? 'Hàng tháng' : 'Hàng tuần'}
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-emerald-600" />
                              <span>Hạn tiếp theo: {bill.nextDueDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(bill.id)}
                            title={bill.isActive ? "Tạm ngưng" : "Bật lại"}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                              bill.isActive
                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(bill.id)}
                            title="Xóa"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
