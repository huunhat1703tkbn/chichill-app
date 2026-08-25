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
  categoryBudgets: Record<CategoryCode, number>;
  categorySpent: Record<CategoryCode, number>;
  totalReceivables: number;
  totalPayables: number;
  recentTransactionsSummary: string;
  userCategories?: { code: string; label: string; description: string }[];
}

export interface AIResponsePayload {
  intent: 'log_transaction' | 'query_data' | 'general_chat';
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
  zaloWebhookUrl?: string;
  autoAlertOnSpending: boolean;
  soundEnabled: boolean;
}

export interface BillSplitExpense {
  id: string;
  paidBy: string;       // Tên người chi
  amount: number;
  description: string;
  involvedMembers?: string[];
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
}
