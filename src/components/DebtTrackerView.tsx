import React, { useState } from 'react';
import { Users, Send, Copy, CheckCircle2, PlusCircle, ArrowUpRight, ArrowDownLeft, Calculator, Sparkles, Check, Users2, Plus, ArrowRightLeft, UserCheck, QrCode } from 'lucide-react';
import { OfficeDebt, BillSplitGroup, BillSplitExpense } from '../types';
import { shareZaloMessage } from '../utils/notificationService';
import { BillSplitView } from './BillSplitView';
import { PaymentQRModal } from './PaymentQRModal';

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

  // QR Modal State
  const [selectedDebtQR, setSelectedDebtQR] = useState<{
    isOpen: boolean;
    receiverName: string;
    amount: number;
    memo: string;
    bankAccount?: any;
  } | null>(null);

  // New debt modal form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [personName, setPersonName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [debtType, setDebtType] = useState<'receivable' | 'payable'>('receivable');
  const [description, setDescription] = useState('');

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const handleCopyZaloMessage = (debt: OfficeDebt) => {
    let msg = '';
    const bankNote = userProfile?.accountNo
      ? `\n🏦 Chuyển khoản qua: ${userProfile.accountNo} - ${userProfile.bankName || 'Ngân hàng'} (${userProfile.accountName || userProfile.name || ''})\n`
      : '';

    if (debt.type === 'receivable') {
      msg = `Gửi ${debt.personName} 👋\n\nBạn còn khoản [${debt.description}] cần thanh toán cho mình nhé.\n💰 Số tiền: ${formatVND(debt.amount)}${bankNote}\nChuyển khoản sớm giúp mình nha! Cảm ơn nhiều ☕✨`;
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

  const netDebtBalance = totalReceivables - totalPayables;

  const filteredDebts = debts.filter((d) => {
    if (activeTab === 'receivables') return d.type === 'receivable';
    if (activeTab === 'payables') return d.type === 'payable';
    return false;
  });

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-4 pb-28 sm:pb-24 select-none">
      {/* Revolut-Style Emerald Hero Debt Card */}
      <div className="emerald-gradient text-white p-5 sm:p-6 rounded-[28px] shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-teal-300/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header Tag & Country Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-semibold tracking-wide">
              <Users2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>Chia Bill & Sổ Nợ</span>
            </div>

            <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold">
              <span>{billSplitGroups.length} Nhóm chia bill</span>
            </div>
          </div>

          {/* Big Hero Amount: Net Debt Balance */}
          <div className="py-1">
            <p className="text-xs text-emerald-100/80 font-semibold uppercase tracking-wider">
              {netDebtBalance >= 0 ? 'Tổng chênh lệch cần thu hồi' : 'Tổng chênh lệch cần thanh toán'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-0.5">
              {netDebtBalance >= 0 ? `+${formatVND(netDebtBalance)}` : formatVND(netDebtBalance)}
            </h1>
            <p className="text-xs text-emerald-100/80 font-medium mt-1">
              Đồng bộ tài chính & chia bill văn phòng minh bạch
            </p>
          </div>

          {/* Bento Sub-Cards: Receivables vs Payables */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-400/30 text-amber-200 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-100/70 font-semibold uppercase tracking-wider">Cần Thu Lại</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">{formatVND(totalReceivables)}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-rose-400/30 text-rose-200 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-emerald-100/70 font-semibold uppercase tracking-wider">Mình Cần Trả</p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">{formatVND(totalPayables)}</p>
              </div>
            </div>
          </div>

          {/* 4 Signature Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/15">
            <button
              onClick={() => setActiveTab('split_tool')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 active:scale-95 transition-all ${
                activeTab === 'split_tool' ? 'bg-white text-emerald-800 font-extrabold ring-2 ring-white/60' : 'bg-white/20 text-white backdrop-blur-md border border-white/20'
              }`}>
                <Calculator className="w-5 h-5 stroke-[2.5]" />
                {billSplitGroups.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full ring-2 ring-emerald-800">
                    {billSplitGroups.length}
                  </span>
                )}
              </div>
              <span className={`text-[11px] tracking-tight font-bold ${activeTab === 'split_tool' ? 'text-white underline underline-offset-4 font-black' : 'text-emerald-100/90'}`}>
                Chia Bill
              </span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-105 active:scale-95 transition-all">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-emerald-100/90 tracking-tight">Ghi Nợ</span>
            </button>

            <button
              onClick={() => setActiveTab('receivables')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 active:scale-95 transition-all ${
                activeTab === 'receivables' ? 'bg-white text-emerald-800 font-extrabold ring-2 ring-white/60' : 'bg-white/20 text-white backdrop-blur-md border border-white/20'
              }`}>
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                {debts.filter(d => d.type === 'receivable' && !d.isSettled).length > 0 && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full ring-2 ring-emerald-800">
                    {debts.filter(d => d.type === 'receivable' && !d.isSettled).length}
                  </span>
                )}
              </div>
              <span className={`text-[11px] tracking-tight font-bold ${activeTab === 'receivables' ? 'text-white underline underline-offset-4 font-black' : 'text-emerald-100/90'}`}>
                Phải Thu
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payables')}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-105 active:scale-95 transition-all ${
                activeTab === 'payables' ? 'bg-white text-emerald-800 font-extrabold ring-2 ring-white/60' : 'bg-white/20 text-white backdrop-blur-md border border-white/20'
              }`}>
                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                {debts.filter(d => d.type === 'payable' && !d.isSettled).length > 0 && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-black bg-rose-400 text-slate-950 px-1.5 py-0.2 rounded-full ring-2 ring-emerald-800">
                    {debts.filter(d => d.type === 'payable' && !d.isSettled).length}
                  </span>
                )}
              </div>
              <span className={`text-[11px] tracking-tight font-bold ${activeTab === 'payables' ? 'text-white underline underline-offset-4 font-black' : 'text-emerald-100/90'}`}>
                Cần Trả
              </span>
            </button>
          </div>
        </div>
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
            <div className="fin-card p-8 text-center text-slate-500">
              <p className="text-sm font-bold text-slate-700">Chưa có khoản nợ nào trong danh mục này.</p>
              <p className="text-xs text-slate-400 mt-1">Bấm "Ghi Nợ" để theo dõi các khoản mượn/cho vay nhé!</p>
            </div>
          ) : (
            filteredDebts.map((d) => {
              const isReceivable = d.type === 'receivable';

              return (
                <div
                  key={d.id}
                  className={`fin-card p-4 transition-all space-y-3 ${
                    d.isSettled ? 'opacity-60 bg-slate-50' : 'hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-xs shadow-2xs ${
                          isReceivable ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isReceivable ? 'THU' : 'TRẢ'}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-900">{d.personName}</span>
                          {d.isSettled ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                              Đã xong
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                              {isReceivable ? 'Chưa trả' : 'Cần trả'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{d.description}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm sm:text-base font-extrabold ${
                          isReceivable ? 'text-amber-600' : 'text-rose-600'
                        }`}
                      >
                        {formatVND(d.amount)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">{d.date}</p>
                    </div>
                  </div>

                  {/* Bottom Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onToggleSettled(d.id)}
                      className={`font-bold cursor-pointer px-3 py-1.5 rounded-xl transition-all active:scale-95 flex items-center space-x-1 ${
                        d.isSettled
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{d.isSettled ? 'Mở lại' : 'Đã thanh toán'}</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      {!d.isSettled && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDebtQR({
                              isOpen: true,
                              receiverName: d.type === 'receivable' ? (userProfile?.name || 'Bạn') : d.personName,
                              amount: d.amount,
                              memo: `${d.description || 'Thanh toan no'} - ChiChill`,
                              bankAccount: d.type === 'receivable' && userProfile?.accountNo
                                ? {
                                    bankCode: userProfile.bankCode || 'MB',
                                    bankName: userProfile.bankName || 'Ngân hàng',
                                    accountNo: userProfile.accountNo,
                                    accountName: userProfile.accountName || userProfile.name || '',
                                    customQrImage: userProfile.customQrImage,
                                  }
                                : undefined,
                            });
                          }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1 shadow-2xs"
                          title="Hiển thị mã QR thanh toán"
                        >
                          <QrCode className="w-3.5 h-3.5 text-amber-700" />
                          <span>Mã QR</span>
                        </button>
                      )}

                      {!d.isSettled && (
                        <button
                          onClick={() => handleCopyZaloMessage(d)}
                          className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
                          title="Tạo tin nhắn nhắc nợ khéo léo"
                        >
                          {copiedId === d.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Nhắc nợ</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteDebt(d.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg cursor-pointer transition-colors"
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 select-none">
          <div className="bg-white rounded-t-[32px] sm:rounded-[28px] max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom-5">
            <h3 className="text-base font-extrabold text-slate-900">Tạo ghi nợ mới</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tên người liên quan:</label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="VD: Nam Design, Linh Marketing, Sếp Tuấn"
                  required
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Loại ghi nợ:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDebtType('receivable')}
                    className={`p-2.5 rounded-xl font-bold cursor-pointer transition-all ${
                      debtType === 'receivable'
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Cho vay (Cần thu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDebtType('payable')}
                    className={`p-2.5 rounded-xl font-bold cursor-pointer transition-all ${
                      debtType === 'payable'
                        ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Mượn nợ (Cần trả)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Số tiền (VNĐ):</label>
                <input
                  type="text"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="VD: 250k hoặc 250000"
                  required
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 font-extrabold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mô tả lý do:</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mượn tiền cơm trưa, cà bao trà sữa, ứng tiền..."
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-emerald-500 font-medium text-slate-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl cursor-pointer hover:bg-slate-200 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold py-3 rounded-2xl shadow-md shadow-emerald-600/30 cursor-pointer transition-all"
                >
                  Lưu Khoản Nợ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment QR Modal for Debts */}
      {selectedDebtQR && selectedDebtQR.isOpen && (
        <PaymentQRModal
          isOpen={selectedDebtQR.isOpen}
          onClose={() => setSelectedDebtQR(null)}
          receiverName={selectedDebtQR.receiverName}
          amount={selectedDebtQR.amount}
          memo={selectedDebtQR.memo}
          bankAccount={selectedDebtQR.bankAccount}
        />
      )}
    </div>
  );
};
