import React, { useState } from 'react';
import { Plus, Trash2, Users, Receipt, Check, Copy, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { BillSplitGroup, BillSplitExpense } from '../types';
import { shareZaloMessage } from '../utils/notificationService';

interface BillSplitViewProps {
  groups: BillSplitGroup[];
  onAddGroup: (group: Omit<BillSplitGroup, 'id' | 'createdAt' | 'isSettled'>) => void;
  onAddExpense: (groupId: string, expense: Omit<BillSplitExpense, 'id'>) => void;
  onDeleteExpense: (groupId: string, expenseId: string) => void;
  onToggleSettled: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const BillSplitView: React.FC<BillSplitViewProps> = ({
  groups,
  onAddGroup,
  onAddExpense,
  onDeleteExpense,
  onToggleSettled,
  onDeleteGroup,
}) => {
  // Create group form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');

  // Add expense form per group
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseInvolvedMembers, setExpenseInvolvedMembers] = useState<string[]>([]);
  const [showAddExpenseForGroup, setShowAddExpenseForGroup] = useState<string | null>(null);

  // Copied state
  const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null);

  const formatVND = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  const parseAmount = (raw: string): number => {
    const cleaned = raw.trim().toLowerCase().replace(/,/g, '.');
    // Handle "k" suffix
    if (/[\d.]+\s*k$/.test(cleaned)) {
      return Math.round(parseFloat(cleaned.replace(/k$/, '')) * 1000);
    }
    // Handle "tr" or "triệu"
    if (/[\d.]+\s*(tr|triệu)$/.test(cleaned)) {
      return Math.round(parseFloat(cleaned.replace(/(tr|triệu)$/, '')) * 1000000);
    }
    // Handle "củ"
    if (/[\d.]+\s*củ$/.test(cleaned)) {
      return Math.round(parseFloat(cleaned.replace(/củ$/, '')) * 1000000);
    }
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    return num < 1000 ? Math.round(num * 1000) : Math.round(num);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupMembers.trim()) return;
    const members = newGroupMembers.split(',').map(n => n.trim()).filter(n => n.length > 0);
    if (members.length < 2) return;

    onAddGroup({
      name: newGroupName.trim(),
      members,
      expenses: [],
    });

    setNewGroupName('');
    setNewGroupMembers('');
    setShowCreateForm(false);
  };

  const handleAddExpense = (groupId: string) => {
    if (!expensePaidBy.trim() || !expenseAmount.trim()) return;
    const amount = parseAmount(expenseAmount);
    if (amount <= 0) return;

    onAddExpense(groupId, {
      paidBy: expensePaidBy.trim(),
      amount,
      description: expenseDesc.trim() || 'Chi tiêu chung',
      involvedMembers: expenseInvolvedMembers,
    });

    setExpensePaidBy('');
    setExpenseAmount('');
    setExpenseDesc('');
    setExpenseInvolvedMembers([]);
    setShowAddExpenseForGroup(null);
  };

  /**
   * Calculate settlement for a group.
   * Returns a map: memberName -> balance (positive = gets back, negative = owes)
   */
  const calculateSettlement = (group: BillSplitGroup) => {
    let totalSpent = 0;
    const paidMap: Record<string, number> = {};
    const consumedMap: Record<string, number> = {};
    
    group.members.forEach(m => { 
      paidMap[m] = 0; 
      consumedMap[m] = 0;
    });

    group.expenses.forEach(e => {
      totalSpent += e.amount;
      if (paidMap[e.paidBy] !== undefined) {
        paidMap[e.paidBy] += e.amount;
      }

      const involved = e.involvedMembers && e.involvedMembers.length > 0 ? e.involvedMembers : group.members;
      if (involved.length > 0) {
        const splitAmount = e.amount / involved.length;
        involved.forEach(m => {
          if (consumedMap[m] !== undefined) {
            consumedMap[m] += splitAmount;
          }
        });
      }
    });

    const balances: Record<string, number> = {};
    group.members.forEach(m => {
      balances[m] = Math.round(paidMap[m] - consumedMap[m]);
    });

    return { totalSpent, paidMap, consumedMap, balances };
  };

  const generateZaloSummary = (group: BillSplitGroup) => {
    const { totalSpent, balances } = calculateSettlement(group);
    let msg = `📋 TỔNG KẾT: ${group.name}\n`;
    msg += `💰 Tổng thiệt hại: ${formatVND(totalSpent)}\n`;
    msg += `------------------------\n`;

    group.members.forEach(m => {
      const bal = balances[m];
      if (bal > 0) {
        msg += `🟢 ${m} nhận lại: ${formatVND(bal)}\n`;
      } else if (bal < 0) {
        msg += `🔴 ${m} cần đóng: ${formatVND(Math.abs(bal))}\n`;
      } else {
        msg += `⚪ ${m}: Đã huề cả làng\n`;
      }
    });

    msg += `------------------------\n`;
    msg += `Mọi người check lại nha! Trả sớm đỡ quên nè 💸✨`;

    return msg;
  };

  const handleShareZalo = (group: BillSplitGroup) => {
    const msg = generateZaloSummary(group);
    shareZaloMessage(msg, `Chia bill: ${group.name}`);
    setCopiedGroupId(group.id);
    setTimeout(() => setCopiedGroupId(null), 3000);
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroupId(prev => prev === groupId ? null : groupId);
  };

  return (
    <div className="space-y-4">
      {/* Create Group Button / Form */}
      {!showCreateForm ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Users className="w-4 h-4" />
          Tạo nhóm chia bill mới
        </button>
      ) : (
        <form onSubmit={handleCreateGroup} className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white p-5 rounded-2xl shadow-md space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-300" />
            Tạo nhóm mới
          </h3>

          <div>
            <label className="block text-indigo-200 text-xs font-medium mb-1">Tên nhóm</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="VD: Nhóm ở trọ Q7, Du lịch Đà Lạt"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white font-medium outline-none focus:border-amber-300 placeholder:text-indigo-300"
              required
            />
          </div>

          <div>
            <label className="block text-indigo-200 text-xs font-medium mb-1">Thành viên (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={newGroupMembers}
              onChange={(e) => setNewGroupMembers(e.target.value)}
              placeholder="Nam, Linh, Hoàng, Bạn"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white font-medium outline-none focus:border-amber-300 placeholder:text-indigo-300"
              required
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Tạo nhóm
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {groups.length === 0 && !showCreateForm && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium">Chưa có nhóm chia bill nào</p>
          <p className="text-xs text-slate-400 mt-1">Tạo nhóm để theo dõi chi tiêu chung</p>
        </div>
      )}

      {/* Group Cards */}
      {groups.map((group) => {
        const { totalSpent, paidMap, consumedMap, balances } = calculateSettlement(group);
        const isExpanded = expandedGroupId === group.id;

        return (
          <div
            key={group.id}
            className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
              group.isSettled ? 'opacity-60 border-slate-200' : 'border-slate-200 hover:border-blue-200'
            }`}
          >
            {/* Group Header */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpand(group.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 truncate">{group.name}</span>
                      {group.isSettled && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold shrink-0">
                          Đã xong
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {group.members.length} người · {group.expenses.length} khoản · Tổng: {formatVND(totalSpent)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-slate-100 px-4 pb-4 space-y-3">
                {/* Members Summary Table */}
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Bảng tổng kết</p>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/60">
                          <th className="text-left py-2 px-3 font-semibold text-slate-600">Thành viên</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-600">Đã chi</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-600">Phải chịu</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-600">Còn lại</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.members.map((member) => {
                          const paid = paidMap[member] || 0;
                          const consumed = consumedMap[member] || 0;
                          const balance = balances[member] || 0;
                          return (
                            <tr key={member} className="border-b border-slate-100 last:border-none">
                              <td className="py-2 px-3 font-medium text-slate-800">{member}</td>
                              <td className="py-2 px-3 text-right text-slate-600">{formatVND(paid)}</td>
                              <td className="py-2 px-3 text-right text-slate-400">{formatVND(Math.round(consumed))}</td>
                              <td className={`py-2 px-3 text-right font-bold ${
                                balance > 0 ? 'text-emerald-600' : balance < 0 ? 'text-rose-600' : 'text-slate-400'
                              }`}>
                                {balance > 0 ? `+${formatVND(balance)}` : balance < 0 ? `-${formatVND(Math.abs(balance))}` : '0 đ'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Expense List */}
                {group.expenses.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Chi tiết các khoản</p>
                    <div className="space-y-1.5">
                      {group.expenses.map((exp) => (
                        <div key={exp.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-slate-700">{exp.paidBy}</span>
                            <span className="text-xs text-slate-400 ml-1.5">{exp.description}</span>
                            {exp.involvedMembers && exp.involvedMembers.length > 0 && exp.involvedMembers.length < group.members.length && (
                              <p className="text-[10px] text-indigo-400 mt-0.5">Chia cho: {exp.involvedMembers.join(', ')}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-slate-800">{formatVND(exp.amount)}</span>
                            {!group.isSettled && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onDeleteExpense(group.id, exp.id); }}
                                className="text-slate-300 hover:text-rose-500 cursor-pointer p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Expense Inline Form */}
                {!group.isSettled && (
                  <>
                    {showAddExpenseForGroup === group.id ? (
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Người trả</label>
                            <select
                              value={expensePaidBy}
                              onChange={(e) => setExpensePaidBy(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 font-medium"
                            >
                              <option value="">Chọn người</option>
                              {group.members.map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Số tiền</label>
                            <input
                              type="text"
                              value={expenseAmount}
                              onChange={(e) => setExpenseAmount(e.target.value)}
                              placeholder="VD: 150k, 1.5tr"
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 font-bold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Mô tả</label>
                          <input
                            type="text"
                            value={expenseDesc}
                            onChange={(e) => setExpenseDesc(e.target.value)}
                            placeholder="Tiền phòng, tiền ăn, taxi..."
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 mb-1">Những người chia khoản này</label>
                          <div className="flex flex-wrap gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 rounded border border-slate-200">
                              <input
                                type="checkbox"
                                checked={expenseInvolvedMembers.length === group.members.length}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setExpenseInvolvedMembers([...group.members]);
                                  } else {
                                    setExpenseInvolvedMembers([]);
                                  }
                                }}
                                className="rounded text-blue-600"
                              />
                              <span className="text-[10px] font-medium">Tất cả</span>
                            </label>
                            {group.members.map((m) => (
                              <label key={m} className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 rounded border border-slate-200">
                                <input
                                  type="checkbox"
                                  checked={expenseInvolvedMembers.includes(m)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setExpenseInvolvedMembers(prev => [...prev, m]);
                                    } else {
                                      setExpenseInvolvedMembers(prev => prev.filter(x => x !== m));
                                    }
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-[10px] font-medium">{m}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddExpense(group.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition-colors"
                          >
                            Thêm khoản
                          </button>
                          <button
                            onClick={() => setShowAddExpenseForGroup(null)}
                            className="bg-slate-200 text-slate-600 font-semibold text-xs px-3 py-2 rounded-lg cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowAddExpenseForGroup(group.id);
                          setExpensePaidBy('');
                          setExpenseAmount('');
                          setExpenseDesc('');
                          setExpenseInvolvedMembers([...group.members]);
                        }}
                        className="w-full bg-slate-50 hover:bg-blue-50 border border-dashed border-slate-300 hover:border-blue-300 text-slate-500 hover:text-blue-600 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm khoản chi
                      </button>
                    )}
                  </>
                )}

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onToggleSettled(group.id)}
                    className={`font-semibold cursor-pointer px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                      group.isSettled
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{group.isSettled ? 'Mở lại' : 'Đánh dấu xong'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShareZalo(group)}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedGroupId === group.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Đã copy!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi Zalo</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteGroup(group.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
