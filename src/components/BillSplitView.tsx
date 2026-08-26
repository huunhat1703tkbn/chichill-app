import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Users,
  Receipt,
  Check,
  ChevronDown,
  ChevronUp,
  Send,
  Crown,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Edit3,
  Globe,
  Share2,
  RefreshCw,
  LogIn,
  X,
  UserCheck,
} from 'lucide-react';
import { BillSplitGroup, BillSplitExpense } from '../types';
import { shareZaloMessage } from '../utils/notificationService';
import { generateBillInviteLink } from '../utils/billSyncService';

interface BillSplitViewProps {
  groups: BillSplitGroup[];
  userProfile?: any;
  onAddGroup: (group: Omit<BillSplitGroup, 'id' | 'createdAt' | 'isSettled'>, isCollaborative?: boolean) => void;
  onAddExpense: (groupId: string, expense: Omit<BillSplitExpense, 'id'>) => void;
  onDeleteExpense: (groupId: string, expenseId: string) => void;
  onToggleSettled: (groupId: string) => void;
  onUpdateGroup?: (groupId: string, updates: Partial<BillSplitGroup>) => void;
  onDeleteGroup: (groupId: string) => void;
  onJoinGroup?: (shareCode: string) => Promise<{ success: boolean; message?: string }>;
  onEnableGroupSharing?: (groupId: string) => Promise<void>;
  onRefreshSharedGroup?: (groupId: string) => Promise<void>;
}

export const BillSplitView: React.FC<BillSplitViewProps> = ({
  groups,
  userProfile,
  onAddGroup,
  onAddExpense,
  onDeleteExpense,
  onToggleSettled,
  onUpdateGroup,
  onDeleteGroup,
  onJoinGroup,
  onEnableGroupSharing,
  onRefreshSharedGroup,
}) => {
  // Create group form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const [newGroupLeader, setNewGroupLeader] = useState('');
  const [newGroupBankInfo, setNewGroupBankInfo] = useState('');
  const [enableCollabOnCreate, setEnableCollabOnCreate] = useState(true);

  // Join group modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inputShareCode, setInputShareCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinMsg, setJoinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add expense form per group
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseInvolvedMembers, setExpenseInvolvedMembers] = useState<string[]>([]);
  const [showAddExpenseForGroup, setShowAddExpenseForGroup] = useState<string | null>(null);

  // Edit Leader Modal / State
  const [editingLeaderGroupId, setEditingLeaderGroupId] = useState<string | null>(null);
  const [editLeaderName, setEditLeaderName] = useState('');
  const [editBankInfo, setEditBankInfo] = useState('');

  // Refreshing state per group
  const [refreshingGroupId, setRefreshingGroupId] = useState<string | null>(null);
  const [enablingShareGroupId, setEnablingShareGroupId] = useState<string | null>(null);

  const handleEnableSharing = async (groupId: string) => {
    if (!onEnableGroupSharing) return;
    setEnablingShareGroupId(groupId);
    try {
      await onEnableGroupSharing(groupId);
    } finally {
      setEnablingShareGroupId(null);
    }
  };

  // View mode tab inside group card: 'hub' (Thanh toán qua Thủ quỹ) or 'table' (Bảng chi tiết)
  const [groupViewTab, setGroupViewTab] = useState<Record<string, 'hub' | 'table'>>({});

  // Copied state
  const [copiedGroupId, setCopiedGroupId] = useState<string | null>(null);

  const formatVND = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  const parseAmount = (raw: string): number => {
    const cleaned = raw.trim().toLowerCase().replace(/,/g, '.');
    if (/[\d.]+\s*k$/.test(cleaned)) {
      return Math.round(parseFloat(cleaned.replace(/k$/, '')) * 1000);
    }
    if (/[\d.]+\s*(tr|triệu)$/.test(cleaned)) {
      return Math.round(parseFloat(cleaned.replace(/(tr|triệu)$/, '')) * 1000000);
    }
    if (/[\d.]+\s*củ$/.test(cleaned)) {
      return Math.round(parseFloat(cleaned.replace(/củ$/, '')) * 1000000);
    }
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    return num < 1000 ? Math.round(num * 1000) : Math.round(num);
  };

  const parsedNewMembers = newGroupMembers
    .split(',')
    .map((n) => n.trim())
    .filter((n) => n.length > 0);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || parsedNewMembers.length < 2) return;

    const leader = newGroupLeader.trim() || parsedNewMembers[0] || userProfile?.name || 'Bạn';

    onAddGroup(
      {
        name: newGroupName.trim(),
        members: parsedNewMembers,
        leader,
        bankInfo: newGroupBankInfo.trim() || undefined,
        expenses: [],
      },
      enableCollabOnCreate
    );

    setNewGroupName('');
    setNewGroupMembers('');
    setNewGroupLeader('');
    setNewGroupBankInfo('');
    setShowCreateForm(false);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputShareCode.trim() || !onJoinGroup) return;

    let cleanCode = inputShareCode.trim();
    // Extract code if user pasted a full link like https://zalo.me/s/.../?bill=CHILL-XXXX
    const match = cleanCode.match(/[?&]bill=([a-zA-Z0-9_-]+)/i);
    if (match) {
      cleanCode = match[1];
    }

    setIsJoining(true);
    setJoinMsg(null);

    const res = await onJoinGroup(cleanCode.toUpperCase());
    setIsJoining(false);

    if (res.success) {
      setJoinMsg({ type: 'success', text: res.message || 'Đã tham gia nhóm thành công!' });
      setTimeout(() => {
        setShowJoinModal(false);
        setInputShareCode('');
        setJoinMsg(null);
      }, 1500);
    } else {
      setJoinMsg({ type: 'error', text: res.message || 'Không tìm thấy nhóm với mã này' });
    }
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

  const handleOpenEditLeader = (group: BillSplitGroup) => {
    setEditingLeaderGroupId(group.id);
    setEditLeaderName(group.leader || group.members[0] || '');
    setEditBankInfo(group.bankInfo || '');
  };

  const handleSaveLeaderUpdates = (groupId: string) => {
    if (onUpdateGroup && editLeaderName.trim()) {
      onUpdateGroup(groupId, {
        leader: editLeaderName.trim(),
        bankInfo: editBankInfo.trim() || undefined,
      });
    }
    setEditingLeaderGroupId(null);
  };

  const handleRefresh = async (groupId: string) => {
    if (!onRefreshSharedGroup) return;
    setRefreshingGroupId(groupId);
    await onRefreshSharedGroup(groupId);
    setTimeout(() => setRefreshingGroupId(null), 600);
  };

  /**
   * Hub-and-Spoke Debt Consolidation Logic
   */
  const calculateSettlement = (group: BillSplitGroup) => {
    const totalSpent = group.expenses.reduce((sum, e) => sum + e.amount, 0);
    const leader = group.leader || group.members[0] || 'Trưởng nhóm';

    const paidMap: Record<string, number> = {};
    const consumedMap: Record<string, number> = {};
    group.members.forEach((m) => {
      paidMap[m] = 0;
      consumedMap[m] = 0;
    });

    group.expenses.forEach((exp) => {
      paidMap[exp.paidBy] = (paidMap[exp.paidBy] || 0) + exp.amount;
      const splitAmong =
        exp.involvedMembers && exp.involvedMembers.length > 0 ? exp.involvedMembers : group.members;
      const count = splitAmong.length;
      if (count > 0) {
        const perPerson = exp.amount / count;
        splitAmong.forEach((m) => {
          consumedMap[m] = (consumedMap[m] || 0) + perPerson;
        });
      }
    });

    const balances: Record<string, number> = {};
    group.members.forEach((m) => {
      balances[m] = (paidMap[m] || 0) - (consumedMap[m] || 0);
    });

    const payersToLeader: { member: string; amount: number }[] = [];
    const receiversFromLeader: { member: string; amount: number }[] = [];
    const evenMembers: string[] = [];

    group.members.forEach((m) => {
      if (m === leader) return;
      const b = balances[m] || 0;
      if (b < -1) {
        payersToLeader.push({ member: m, amount: Math.round(Math.abs(b)) });
      } else if (b > 1) {
        receiversFromLeader.push({ member: m, amount: Math.round(b) });
      } else {
        evenMembers.push(m);
      }
    });

    const leaderBalance = Math.round(balances[leader] || 0);
    const totalToCollect = payersToLeader.reduce((s, p) => s + p.amount, 0);
    const totalToRefund = receiversFromLeader.reduce((s, r) => s + r.amount, 0);

    return {
      totalSpent,
      paidMap,
      consumedMap,
      balances,
      leader,
      payersToLeader,
      receiversFromLeader,
      evenMembers,
      leaderBalance,
      totalToCollect,
      totalToRefund,
    };
  };

  /**
   * Generate clear, Hub-and-Spoke Zalo message with collaborative link.
   */
  const generateZaloSummary = (group: BillSplitGroup) => {
    const { totalSpent, leader, payersToLeader, receiversFromLeader, evenMembers, leaderBalance } =
      calculateSettlement(group);

    let msg = `📋 TỔNG KẾT CHIA BILL: ${group.name.toUpperCase()}\n`;
    msg += `💰 Tổng chi tiêu: ${formatVND(totalSpent)}\n`;
    msg += `👑 Trưởng nhóm / Thủ quỹ: ${leader}\n`;
    if (group.bankInfo && group.bankInfo.trim()) {
      msg += `🏦 Nhận tiền qua: ${group.bankInfo.trim()}\n`;
    }
    msg += `---------------------------------\n`;

    if (payersToLeader.length > 0) {
      msg += `🔴 CÁC BẠN CẦN CHUYỂN TIỀN CHO ${leader.toUpperCase()}:\n`;
      payersToLeader.forEach((p) => {
        msg += `- ${p.member}: ${formatVND(p.amount)}\n`;
      });
      msg += `\n`;
    }

    if (receiversFromLeader.length > 0) {
      msg += `🟢 ${leader.toUpperCase()} SẼ HOÀN TIỀN LẠI CHO:\n`;
      receiversFromLeader.forEach((r) => {
        msg += `- ${r.member}: ${formatVND(r.amount)}\n`;
      });
      msg += `\n`;
    }

    if (evenMembers.length > 0) {
      msg += `⚪ ĐÃ HUỀ TIỀN:\n`;
      evenMembers.forEach((m) => {
        msg += `- ${m}: 0 đ\n`;
      });
      msg += `\n`;
    }

    if (leaderBalance !== 0) {
      if (leaderBalance > 0) {
        msg += `💡 Tiền ${leader} đã ứng trước nhận lại: +${formatVND(leaderBalance)}\n`;
      } else {
        msg += `💡 Tiền ${leader} tự bù vào phần của mình: ${formatVND(Math.abs(leaderBalance))}\n`;
      }
    }

    if (group.shareCode) {
      const link = generateBillInviteLink(group.shareCode);
      msg += `---------------------------------\n`;
      msg += `🌐 Mọi người bấm link này để xem & sửa bill cùng nhau trên Zalo:\n👉 ${link}\n(Mã nhóm: ${group.shareCode})\n`;
    }

    msg += `---------------------------------\n`;
    msg += `⚡ Mọi người chuyển khoản sớm cho ${leader} để chốt sổ nha! Cảm ơn cả nhà ☕✨`;

    return msg;
  };

  const handleShareZalo = (group: BillSplitGroup) => {
    const msg = generateZaloSummary(group);
    shareZaloMessage(msg, `Chia bill: ${group.name}`);
    setCopiedGroupId(group.id);
    setTimeout(() => setCopiedGroupId(null), 3000);
  };

  const handleInviteMembers = (group: BillSplitGroup) => {
    if (!group.shareCode) return;
    const link = generateBillInviteLink(group.shareCode);
    const inviteMsg = `🍕 Mời bạn tham gia nhóm chia bill "${group.name}" trên ChiChill!\n\n👉 Bấm vào link để xem chi tiết & cập nhật khoản chi cùng nhau:\n${link}\n\nMã nhóm: ${group.shareCode}`;
    shareZaloMessage(inviteMsg, `Mời chia bill: ${group.name}`);
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar: Create Group & Join by Code */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tạo nhóm chia bill
        </button>

        <button
          onClick={() => setShowJoinModal(true)}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-3 px-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          title="Nhập mã chia sẻ để tham gia nhóm khác"
        >
          <LogIn className="w-4 h-4 text-blue-600" />
          <span className="hidden xs:inline">Nhập mã</span>
        </button>
      </div>

      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl border border-slate-100 space-y-4 text-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Globe className="w-4 h-4 text-blue-600" />
                Tham gia nhóm chia bill
              </div>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Nhập mã chia sẻ (VD: <b>CHILL-7X2K</b>) hoặc dán link Zalo được bạn bè gửi để cùng xem & cập nhật bill.
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={inputShareCode}
                  onChange={(e) => setInputShareCode(e.target.value)}
                  placeholder="CHILL-XXXX hoặc dán link..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider outline-none focus:border-blue-500 text-blue-700 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
                  autoFocus
                  required
                />
              </div>

              {joinMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-bold ${
                    joinMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {joinMsg.text}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isJoining || !inputShareCode.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isJoining ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang tham gia...</span>
                    </>
                  ) : (
                    <span>Tham gia ngay</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Group Form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreateGroup}
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-5 rounded-3xl shadow-xl space-y-4 border border-indigo-500/20 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Tạo nhóm chia bill (Có Thủ Quỹ)
            </h3>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-400/30">
              Hub-and-Spoke
            </span>
          </div>

          <div>
            <label className="block text-indigo-200 text-xs font-medium mb-1">Tên nhóm</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="VD: Cơm trưa công ty, Du lịch Đà Lạt"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-medium outline-none focus:border-amber-300 placeholder:text-indigo-300/60"
              required
            />
          </div>

          <div>
            <label className="block text-indigo-200 text-xs font-medium mb-1">
              Danh sách thành viên (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={newGroupMembers}
              onChange={(e) => {
                setNewGroupMembers(e.target.value);
                const parts = e.target.value
                  .split(',')
                  .map((n) => n.trim())
                  .filter((n) => n.length > 0);
                if (parts.length > 0 && (!newGroupLeader || !parts.includes(newGroupLeader))) {
                  setNewGroupLeader(parts[0]);
                }
              }}
              placeholder="Nam, Linh, Hoàng, Bạn"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white font-medium outline-none focus:border-amber-300 placeholder:text-indigo-300/60"
              required
            />
          </div>

          {/* Dynamic Leader Picker */}
          {parsedNewMembers.length > 0 && (
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2">
              <label className="block text-amber-300 text-xs font-bold flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Chọn Trưởng nhóm (Thủ quỹ nhận/hoàn tiền):
              </label>
              <div className="flex flex-wrap gap-2">
                {parsedNewMembers.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setNewGroupLeader(m)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      newGroupLeader === m
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                        : 'bg-white/10 hover:bg-white/20 text-indigo-200'
                    }`}
                  >
                    {newGroupLeader === m && <Crown className="w-3 h-3 text-slate-950" />}
                    <span>{m}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-indigo-200 text-[11px] font-medium mb-1 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-indigo-300" />
                  Số tài khoản / MoMo của {newGroupLeader || 'Thủ quỹ'} (Tùy chọn để gửi Zalo):
                </label>
                <input
                  type="text"
                  value={newGroupBankInfo}
                  onChange={(e) => setNewGroupBankInfo(e.target.value)}
                  placeholder="VD: 0987654321 - MBBank (Nam)"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-300 placeholder:text-indigo-300/50"
                />
              </div>
            </div>
          )}

          {/* Collaborative toggle */}
          <div className="bg-blue-900/40 p-3 rounded-2xl border border-blue-400/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-300" />
              <div>
                <span className="font-bold text-white">Bật cộng tác đa người dùng</span>
                <p className="text-[10px] text-blue-200/80">Cho phép bạn bè cùng xem & thêm chi tiêu qua link Zalo</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableCollabOnCreate}
              onChange={(e) => setEnableCollabOnCreate(e.target.checked)}
              className="w-4 h-4 text-blue-500 rounded accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={parsedNewMembers.length < 2 || !newGroupName.trim()}
              className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              Tạo nhóm chia tiền
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-3 rounded-xl cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {groups.length === 0 && !showCreateForm && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 shadow-sm space-y-2">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">Chưa có nhóm chia bill nào</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tạo nhóm và chỉ định 1 Thủ quỹ trung gian, gửi link cho bạn bè để mọi người cùng xem và chia tiền tự động!
          </p>
        </div>
      )}

      {/* Group Cards */}
      {groups.map((group) => {
        const {
          totalSpent,
          paidMap,
          consumedMap,
          balances,
          leader,
          payersToLeader,
          receiversFromLeader,
          evenMembers,
          leaderBalance,
          totalToCollect,
          totalToRefund,
        } = calculateSettlement(group);

        const isExpanded = expandedGroupId === group.id;
        const currentTab = groupViewTab[group.id] || 'hub';
        const isRefreshing = refreshingGroupId === group.id;

        return (
          <div
            key={group.id}
            className={`bg-white rounded-3xl border transition-all shadow-sm overflow-hidden ${
              group.isSettled ? 'opacity-70 border-slate-200 bg-slate-50/50' : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            {/* Group Header */}
            <div className="p-4 sm:p-5 cursor-pointer" onClick={() => toggleExpand(group.id)}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-extrabold text-slate-900 truncate">
                        {group.name}
                      </span>
                      {group.isShared ? (
                        <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                          <Globe className="w-3 h-3 text-blue-600" />
                          <span>{group.shareCode || 'Cộng tác'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium shrink-0">
                          Cục bộ
                        </span>
                      )}
                      {group.isSettled && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                          ✓ Đã tất toán
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                        <Crown className="w-3 h-3 text-amber-500" />
                        Thủ quỹ: {leader}
                      </span>
                      <span>·</span>
                      <span>{group.members.length} người</span>
                      <span>·</span>
                      <span className="font-bold text-slate-900">Tổng: {formatVND(totalSpent)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isExpanded ? (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <ChevronUp className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-slate-100 px-4 pb-5 space-y-4">
                {/* Collaborative Bar / Invite & Sync */}
                <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {group.isShared && group.shareCode ? (
                    <>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 flex items-center gap-1 truncate">
                            Mã chia sẻ: <span className="font-black text-blue-700 tracking-wider">{group.shareCode}</span>
                          </p>
                          {group.memberProfiles && group.memberProfiles.length > 0 ? (
                            <p className="text-[10px] text-slate-500">
                              {group.memberProfiles.length} tài khoản Zalo đã tham gia
                            </p>
                          ) : (
                            <p className="text-[10px] text-slate-400">Chưa có ai tham gia qua link</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleInviteMembers(group)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Share2 className="w-3 h-3" />
                          Mời bạn bè Zalo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRefresh(group.id)}
                          disabled={isRefreshing}
                          className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 p-1.5 rounded-xl text-[11px] cursor-pointer transition-colors"
                          title="Làm mới dữ liệu từ server"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 text-[11px]">Nhóm đang lưu cục bộ trên máy của bạn</span>
                      </div>
                      {onEnableGroupSharing && (
                        <button
                          type="button"
                          disabled={enablingShareGroupId === group.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnableSharing(group.id);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-xs disabled:opacity-50"
                        >
                          {enablingShareGroupId === group.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Đang bật...</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3" />
                              <span>Bật cộng tác Zalo</span>
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Leader Info & Edit Toolbar */}
                <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-amber-950 flex items-center gap-1.5">
                        Thủ quỹ trung gian: <span className="text-blue-700 font-black">{leader}</span>
                      </p>
                      {group.bankInfo ? (
                        <p className="text-[11px] text-amber-800 truncate">
                          🏦 STK/MoMo: <b>{group.bankInfo}</b>
                        </p>
                      ) : (
                        <p className="text-[11px] text-amber-700/80 italic">Chưa thêm số tài khoản nhận tiền</p>
                      )}
                    </div>
                  </div>

                  {!group.isSettled && (
                    <button
                      onClick={() => handleOpenEditLeader(group)}
                      className="bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold px-2.5 py-1 rounded-xl text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      Đổi Thủ quỹ / STK
                    </button>
                  )}
                </div>

                {/* Inline Leader Edit Form */}
                {editingLeaderGroupId === group.id && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3 text-xs animate-in fade-in duration-200">
                    <p className="font-bold text-slate-800 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      Cập nhật Trưởng nhóm & Thông tin thanh toán
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Chọn Trưởng nhóm mới:
                        </label>
                        <select
                          value={editLeaderName}
                          onChange={(e) => setEditLeaderName(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 font-medium text-xs outline-none focus:border-blue-500"
                        >
                          {group.members.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Số tài khoản / MoMo nhận tiền:
                        </label>
                        <input
                          type="text"
                          value={editBankInfo}
                          onChange={(e) => setEditBankInfo(e.target.value)}
                          placeholder="VD: 0987654321 - MBBank"
                          className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSaveLeaderUpdates(group.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Lưu thay đổi
                      </button>
                      <button
                        onClick={() => setEditingLeaderGroupId(null)}
                        className="bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-Tabs: Hub-and-Spoke vs Full Table */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setGroupViewTab((prev) => ({ ...prev, [group.id]: 'hub' }))}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentTab === 'hub'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Luồng Thủ quỹ ({leader})</span>
                    </button>
                    <button
                      onClick={() => setGroupViewTab((prev) => ({ ...prev, [group.id]: 'table' }))}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentTab === 'table'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Bảng chi tiết</span>
                    </button>
                  </div>
                </div>

                {/* 1. Hub-and-Spoke Settlement Cards */}
                {currentTab === 'hub' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Left Box: Payers to Leader */}
                      <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-rose-900 flex items-center gap-1.5 uppercase tracking-wide">
                            <ArrowUpRight className="w-4 h-4 text-rose-600" />
                            Chuyển cho {leader}
                          </span>
                          <span className="text-xs font-extrabold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                            {formatVND(totalToCollect)}
                          </span>
                        </div>

                        {payersToLeader.length === 0 ? (
                          <p className="text-xs text-rose-700/80 italic py-2">
                            Không ai cần nộp thêm tiền cho {leader}.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {payersToLeader.map((p) => (
                              <div
                                key={p.member}
                                className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-rose-100 shadow-2xs text-xs"
                              >
                                <span className="font-bold text-slate-800">{p.member}</span>
                                <span className="font-black text-rose-600">-{formatVND(p.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right Box: Leader Refunds to Receivers */}
                      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                            {leader} hoàn lại tiền
                          </span>
                          <span className="text-xs font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                            {formatVND(totalToRefund)}
                          </span>
                        </div>

                        {receiversFromLeader.length === 0 ? (
                          <p className="text-xs text-emerald-700/80 italic py-2">
                            {leader} không cần hoàn lại tiền cho ai.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {receiversFromLeader.map((r) => (
                              <div
                                key={r.member}
                                className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-emerald-100 shadow-2xs text-xs"
                              >
                                <span className="font-bold text-slate-800">{r.member}</span>
                                <span className="font-black text-emerald-600">+{formatVND(r.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {evenMembers.length > 0 && (
                      <p className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        Đã huề tiền (0đ): <b className="text-slate-700">{evenMembers.join(', ')}</b>
                      </p>
                    )}
                  </div>
                )}

                {/* 2. Detailed Member Table View */}
                {currentTab === 'table' && (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/80 font-bold text-slate-700">
                          <th className="text-left py-2.5 px-3">Thành viên</th>
                          <th className="text-right py-2.5 px-3">Đã chi</th>
                          <th className="text-right py-2.5 px-3">Phải chịu</th>
                          <th className="text-right py-2.5 px-3">Chênh lệch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.members.map((member) => {
                          const paid = paidMap[member] || 0;
                          const consumed = consumedMap[member] || 0;
                          const balance = balances[member] || 0;
                          const isLeader = member === leader;

                          return (
                            <tr key={member} className="border-b border-slate-100 last:border-none">
                              <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-1">
                                {isLeader && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                                <span>{member}</span>
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-600">{formatVND(paid)}</td>
                              <td className="py-2.5 px-3 text-right text-slate-400">
                                {formatVND(Math.round(consumed))}
                              </td>
                              <td
                                className={`py-2.5 px-3 text-right font-black ${
                                  balance > 0
                                    ? 'text-emerald-600'
                                    : balance < 0
                                    ? 'text-rose-600'
                                    : 'text-slate-400'
                                }`}
                              >
                                {balance > 0
                                  ? `+${formatVND(balance)}`
                                  : balance < 0
                                  ? `-${formatVND(Math.abs(balance))}`
                                  : '0 đ'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Expense List */}
                {group.expenses.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Chi tiết các khoản đã chi ({group.expenses.length})
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {group.expenses.map((exp) => (
                        <div
                          key={exp.id}
                          className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 text-xs"
                        >
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800">{exp.paidBy}</span>
                            <span className="text-slate-500 ml-1.5">{exp.description}</span>
                            {exp.involvedMembers &&
                              exp.involvedMembers.length > 0 &&
                              exp.involvedMembers.length < group.members.length && (
                                <p className="text-[10px] text-blue-500 mt-0.5">
                                  Chia cho: {exp.involvedMembers.join(', ')}
                                </p>
                              )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-extrabold text-slate-900">{formatVND(exp.amount)}</span>
                            {!group.isSettled && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteExpense(group.id, exp.id);
                                }}
                                className="text-slate-300 hover:text-rose-500 cursor-pointer p-0.5 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
                      <div className="bg-blue-50/80 rounded-2xl p-3.5 border border-blue-200/70 space-y-2.5 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Người đứng ra trả
                            </label>
                            <select
                              value={expensePaidBy}
                              onChange={(e) => setExpensePaidBy(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-blue-500 font-semibold"
                            >
                              <option value="">Chọn người trả</option>
                              {group.members.map((m) => (
                                <option key={m} value={m}>
                                  {m} {m === leader ? '👑 (Thủ quỹ)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Số tiền (VND)
                            </label>
                            <input
                              type="text"
                              value={expenseAmount}
                              onChange={(e) => setExpenseAmount(e.target.value)}
                              placeholder="VD: 150k, 1.5tr"
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-blue-500 font-black text-blue-700"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            Mô tả khoản chi
                          </label>
                          <input
                            type="text"
                            value={expenseDesc}
                            onChange={(e) => setExpenseDesc(e.target.value)}
                            placeholder="Tiền ăn lẩu, taxi, vé vào cổng..."
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Những ai chia khoản này?
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200">
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
                              <span className="text-[10px] font-bold text-slate-700">Tất cả ({group.members.length})</span>
                            </label>
                            {group.members.map((m) => (
                              <label
                                key={m}
                                className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 rounded-lg border border-slate-200"
                              >
                                <input
                                  type="checkbox"
                                  checked={expenseInvolvedMembers.includes(m)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setExpenseInvolvedMembers((prev) => [...prev, m]);
                                    } else {
                                      setExpenseInvolvedMembers((prev) => prev.filter((x) => x !== m));
                                    }
                                  }}
                                  className="rounded text-blue-600"
                                />
                                <span className="text-[10px] font-medium text-slate-700">{m}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleAddExpense(group.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors shadow-2xs"
                          >
                            Lưu khoản chi
                          </button>
                          <button
                            onClick={() => setShowAddExpenseForGroup(null)}
                            className="bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setShowAddExpenseForGroup(group.id);
                          setExpensePaidBy(leader || group.members[0] || '');
                          setExpenseAmount('');
                          setExpenseDesc('');
                          setExpenseInvolvedMembers([...group.members]);
                        }}
                        className="w-full bg-slate-50 hover:bg-blue-50 border border-dashed border-slate-300 hover:border-blue-300 text-slate-600 hover:text-blue-700 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm khoản chi mới
                      </button>
                    )}
                  </>
                )}

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onToggleSettled(group.id)}
                    className={`font-bold cursor-pointer px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                      group.isSettled
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{group.isSettled ? 'Mở lại nhóm' : 'Đánh dấu đã xong'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleShareZalo(group)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                    >
                      {copiedGroupId === group.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Đã gửi / copy!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Gửi Zalo cho nhóm</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Xóa nhóm "${group.name}"?`)) {
                          onDeleteGroup(group.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-xl cursor-pointer hover:bg-rose-50 transition-colors"
                      title="Xóa nhóm"
                    >
                      <Trash2 className="w-4 h-4" />
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
