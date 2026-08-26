export type TransactionType = 'expense' | 'income' | 'receivable' | 'payable';

export type CategoryCode = string;

export interface CategoryInfo {
  code: CategoryCode;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
  description: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: CategoryCode;
  description: string;
  date: string; // ISO format or YYYY-MM-DD
  time?: string;
  createdBy: 'ai' | 'manual';
  personName?: string; // e.g. Nam, Minh, Sếp
}

export interface CategoryBudget {
  category: CategoryCode;
  limitAmount: number; // e.g. 5,000,000 VND
}

export interface OfficeDebt {
  id: string;
  personName: string;
  type: 'receivable' | 'payable'; // receivable: người khác nợ mình, payable: mình nợ
  amount: number;
  description: string;
  date: string;
  isSettled: boolean;
  dueDate?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  intent?: 'log_transaction' | 'query_data' | 'general_chat';
  parsedTransactions?: Transaction[];
  replyMessage?: string;
}

export interface UserFinancialContext {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate?: number; // e.g. 35 (%)
  categoryBudgets: Record<CategoryCode, number>;
  categorySpent: Record<CategoryCode, number>;
  categoryRemaining?: Record<CategoryCode, number>;
  topExpenses?: { category: string; label: string; amount: number; percentage: number }[];
  warningCategories?: { category: string; label: string; spent: number; limit: number; percentage: number }[];
  totalReceivables: number;
  receivablesList?: { personName: string; amount: number; description: string }[];
  totalPayables: number;
  payablesList?: { personName: string; amount: number; description: string }[];
  recentTransactionsSummary: string;
  userCategories?: { code: string; label: string; description: string }[];
  dateContext?: {
    today: string;
    dayOfMonth: number;
    daysInMonth: number;
    daysRemaining: number;
    monthProgressPercentage: number;
  };
}

export interface AIResponsePayload {
  intent: 'log_transaction' | 'query_data' | 'financial_advice' | 'general_chat';
  transactions: {
    type: TransactionType;
    amount: number;
    category: CategoryCode;
    description: string;
  }[];
  reply_message: string;
}

export interface BudgetNotification {
  id: string;
  category: CategoryCode;
  categoryLabel: string;
  spent: number;
  limit: number;
  percentage: number;
  timestamp: string;
  level: 'warning' | 'danger'; // warning: >= threshold (e.g. 80%), danger: >= 100%
  title: string;
  message: string;
  isRead: boolean;
  channel: 'system' | 'zalo' | 'both';
}

export interface NotificationSettings {
  enableSystemNotification: boolean;
  enableZaloNotification: boolean;
  warningThreshold: number; // e.g. 80 (80%)
  zaloPhoneOrId: string;
  zaloUserId?: string;              // Zalo Mini App user ID (from getUserInfo)
  zaloNotifPermission?: 'granted' | 'denied' | 'unknown'; // Zalo push notification permission status
  autoAlertOnSpending: boolean;
  soundEnabled: boolean;
}

export interface BillSplitExpense {
  id: string;
  paidBy: string;       // Tên người chi (hiển thị)
  paidByUserId?: string; // Zalo userId của người chi (nếu đã kết nối)
  amount: number;
  description: string;
  involvedMembers?: string[];
  createdAt?: string;
}

export interface BillSplitMemberProfile {
  userId: string;
  name: string;
  avatar?: string;
  joinedAt?: string;
}

export interface BillSplitGroup {
  id: string;
  name: string;                   // "Nhóm ở trọ Quận 7"
  members: string[];              // ["Nam", "Linh", "Hoàng", "Bạn"]
  leader?: string;                // "Nam" - Trưởng nhóm / Thủ quỹ nhận tiền
  bankInfo?: string;              // "0987654321 - MBBank (Nam)"
  expenses: BillSplitExpense[];
  createdAt: string;
  isSettled: boolean;
  shareCode?: string;             // "CHILL-7X2K" - Mã chia sẻ cộng tác đa người dùng
  isShared?: boolean;             // true = đồng bộ cloud đa người dùng
  ownerUserId?: string;           // Zalo userId người tạo nhóm
  memberProfiles?: BillSplitMemberProfile[]; // Danh sách thành viên Zalo đã tham gia
  lastSyncedAt?: string;
}
