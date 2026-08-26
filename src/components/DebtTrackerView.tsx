import React, { useState } from 'react';
import { Users, Send, Copy, CheckCircle2, PlusCircle, ArrowUpRight, ArrowDownLeft, Calculator, Sparkles, Check } from 'lucide-react';
import { OfficeDebt, BillSplitGroup, BillSplitExpense } from '../types';
import { shareZaloMessage } from '../utils/notificationService';
import { BillSplitView } from './BillSplitView';

interface DebtTrackerViewProps {
  debts: OfficeDebt[];
  onAddDebt: (debt: Omit<OfficeDebt, 'id' | 'date'>) => void;
  onToggleSettled: (id: string) => void;
  onDeleteDebt: (id: string) => void;
  billSplitGroups: BillSplitGroup[];
  userProfile?: any;
  onAddBillGroup: (group: Omit<BillSplitGroup, 'id' | 'createdAt' | 'isSettled'>, isCollaborative?: boolean) => void;
  onAddBillExpense: (groupId: string, expense: Omit<BillSplitExpense, 'id'>) => void;
  onDeleteBillExpense: (groupId: string, expenseId: string) => void;
  onToggleBillGroupSettled: (groupId: string) => void;
  onUpdateBillGroup?: (groupId: string, updates: Partial<BillSplitGroup>) => void;
  onDeleteBillGroup: (groupId: string) => void;
  onJoinBillGroup?: (shareCode: string) => Promise<{ success: boolean; message?: string }>;
  onEnableGroupSharing?: (groupId: string) => Promise<void>;
  onRefreshSharedGroup?: (groupId: string) => Promise<void>;
}

export const DebtTrackerView: React.FC<DebtTrackerViewProps> = ({
  debts,
  onAddDebt,
  onToggleSettled,
  onDeleteDebt,
  billSplitGroups,
  userProfile,
  onAddBillGroup,
  onAddBillExpense,
  onDeleteBillExpense,
  onToggleBillGroupSettled,
  onUpdateBillGroup,
  onDeleteBillGroup,
  onJoinBillGroup,
  onEnableGroupSharing,
  onRefreshSharedGroup,
}) => {
  const [activeTab, setActiveTab] = useState<'split_tool' | 'receivables' | 'payables'>('split_tool');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New debt modal form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [personName, setPersonName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [debtType, setDebtType] = useState<'receivable' | 'payable'>('receivable');
  const [description, setDescription] = useState('');

  // Split bill tool state (old simple split - removed, using BillSplitView now)

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' đ';
  };

  const handleCopyZaloMessage = (debt: OfficeDebt) => {
    let msg = '';
    if (debt.type === 'receivable') {
      msg = `Gửi ${debt.personName} 👋\n\nBạn còn khoản [${debt.description}] cần thanh toán cho mình nhé.\n💰 Số tiền: ${formatVND(debt.amount)}\n\nChuyển khoản sớm giúp mình nha! Cảm ơn nhiều ☕✨`;
    } else {
      msg = `Gửi ${debt.personName} 👋\n\nMình gửi lại khoản [${debt.description}] nha.\n💰 Số tiền: ${formatVND(debt.amount)}\n\nBạn check tài khoản giúp mình nhé! Cảm ơn nhiều ☕✨`;
    }

    shareZaloMessage(msg, `Nhắc nợ: ${debt.personName}`);
    setCopiedId(debt.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !amountInput.trim()) return;

    let num = parseFloat(amountInput.replace(/,/g, '.'));
    let amountVND = num < 1000 ? Math.round(num * 1000) : Math.round(num);

    onAddDebt({
      personName: personName.trim(),
      amount: amountVND,
      type: debtType,
      description: description.trim() || 'Khoản nợ',
      isSettled: false,
    });

    setPersonName('');
    setAmountInput('');
    setDescription('');
    setShowAddModal(false);
  };

  const totalReceivables = debts
    .filter((d) => d.type === 'receivable' && !d.isSettled)
    .reduce((acc, d) => acc + d.amount, 0);

  const totalPayables = debts
    .filter((d) => d.type === 'payable' && !d.isSettled)
    .reduce((acc, d) => acc + d.amount, 0);

  const filteredDebts = debts.filter((d) => {
    if (activeTab === 'receivables') return d.type === 'receivable';
    if (activeTab === 'payables') return d.type === 'payable';
    return false;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-24">
      {/* Header Stat Cards */}
      {activeTab !== 'split_tool' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Khoản phải thu</p>
              <p className="text-sm font-black text-amber-600">{formatVND(totalReceivables)}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Khoản mình nợ</p>
              <p className="text-sm font-black text-rose-600">{formatVND(totalPayables)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('split_tool')}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'split_tool' ? 'bg-blue-600 text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Chia Bill</span>
          </button>
          <button
            onClick={() => setActiveTab('receivables')}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
              activeTab === 'receivables' ? 'bg-blue-600 text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Khoản phải thu
          </button>
          <button
            onClick={() => setActiveTab('payables')}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
              activeTab === 'payables' ? 'bg-blue-600 text-white shadow-2xs' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Khoản mình nợ
          </button>
        </div>

        {activeTab !== 'split_tool' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 ml-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo ghi nợ</span>
          </button>
        )}
      </div>

      {/* Split Bill Calculator Sub-View */}
      {activeTab === 'split_tool' && (
        <BillSplitView
          groups={billSplitGroups}
          userProfile={userProfile}
          onAddGroup={onAddBillGroup}
          onAddExpense={onAddBillExpense}
          onDeleteExpense={onDeleteBillExpense}
          onToggleSettled={onToggleBillGroupSettled}
          onUpdateGroup={onUpdateBillGroup}
          onDeleteGroup={onDeleteBillGroup}
          onJoinGroup={onJoinBillGroup}
          onEnableGroupSharing={onEnableGroupSharing}
          onRefreshSharedGroup={onRefreshSharedGroup}
        />
      )}

      {/* Debt Cards Feed */}
      {activeTab !== 'split_tool' && (
        <div className="space-y-2.5">
          {filteredDebts.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
            <p className="text-sm font-medium">Chưa có khoản nợ nào trong danh mục này.</p>
          </div>
        ) : (
          filteredDebts.map((d) => {
            const isReceivable = d.type === 'receivable';

            return (
              <div
                key={d.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs space-y-3 ${
                  d.isSettled ? 'opacity-60 border-slate-200 bg-slate-50' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isReceivable ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isReceivable ? 'VAY' : 'NỢ'}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-800">{d.personName}</span>
                        {d.isSettled ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {isReceivable ? 'Chưa trả tiền' : 'Cần trả'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{d.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-base font-extrabold ${
                        isReceivable ? 'text-amber-600' : 'text-rose-600'
                      }`}
                    >
                      {formatVND(d.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400">{d.date}</p>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onToggleSettled(d.id)}
                    className={`font-semibold cursor-pointer px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1 ${
                      d.isSettled
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{d.isSettled ? 'Mở lại khoản nợ' : 'Đánh dấu đã trả'}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {!d.isSettled && (
                      <button
                        onClick={() => handleCopyZaloMessage(d)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
                        title="Tạo tin nhắn nhắc Zalo cực lịch sự"
                      >
                        {copiedId === d.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Đã copy Zalo!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Tạo Tin Nhắn Zalo</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteDebt(d.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
      )}

      {/* Manual Add Debt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl animate-scaleIn">
            <h3 className="text-base font-bold text-slate-800">Tạo ghi nợ mới</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Tên đồng nghiệp / Sếp:</label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Nam Design, Linh Marketing, Sếp Tuấn"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Loại ghi nợ:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDebtType('receivable')}
                    className={`p-2 rounded-xl border text-center font-bold cursor-pointer ${
                      debtType === 'receivable'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Cho vay / Người khác nợ
                  </button>
                  <button
                    type="button"
                    onClick={() => setDebtType('payable')}
                    className={`p-2 rounded-xl border text-center font-bold cursor-pointer ${
                      debtType === 'payable'
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Mình mượn nợ người khác
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Số tiền (VNĐ):</label>
                <input
                  type="text"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="e.g. 250k hoặc 250000"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Mô tả lý do:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mượn tiền cơm trưa, cà bao trà sữa, ứng tiền đạo cụ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer"
                >
                  Lưu Khoản Nợ
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
