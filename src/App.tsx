import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { AIChatView } from './components/AIChatView';
import { TransactionListView } from './components/TransactionListView';
import { BudgetView } from './components/BudgetView';
import { DebtTrackerView } from './components/DebtTrackerView';
import { AnalyticsView } from './components/AnalyticsView';
import { SlangGuideModal } from './components/SlangGuideModal';
import { QuickAddModal } from './components/QuickAddModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { BudgetAlertToast } from './components/BudgetAlertToast';
import { LoginView } from './components/LoginView';
import { clientFallbackParse } from './utils/aiParser';
import { getApiUrl } from './utils/api';

import {
  Transaction,
  CategoryBudget,
  OfficeDebt,
  ChatMessage,
  CategoryCode,
  CategoryInfo,
  UserFinancialContext,
  TransactionType,
  BudgetNotification,
  NotificationSettings,
  BillSplitGroup,
  BillSplitExpense,
} from './types';

import {
  INITIAL_BUDGETS,
  INITIAL_TRANSACTIONS,
  INITIAL_DEBTS,
  CATEGORIES,
} from './data/initialData';

import {
  DEFAULT_NOTIFICATION_SETTINGS,
  sendSystemNotification,
  playAlertChime,
  triggerZaloNotification,
  formatZaloBudgetMessage,
  requestZaloNotifPermission,
  fetchZaloProfile,
} from './utils/notificationService';

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('finmate_auth') === 'true';
  });
  const [userProfile, setUserProfile] = useState<any>(() => {
    const saved = localStorage.getItem('finmate_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Auto-sync Zalo user profile & ID on launch inside ZMP & Ping backend early
  useEffect(() => {
    fetch(getApiUrl('/api/health')).catch(() => {});
    fetchZaloProfile().then((profile) => {
      if (profile?.id) {
        setUserProfile((prev: any) => ({ ...prev, ...profile }));
        setNotificationSettings((prev) => ({
          ...prev,
          zaloUserId: profile.id,
        }));
        localStorage.setItem('finmate_user', JSON.stringify(profile));
      }
    });
  }, []);

  // Load initial state with localStorage support
  const [categories, setCategories] = useState<Record<CategoryCode, CategoryInfo>>(() => {
    try {
      const saved = localStorage.getItem('finmate_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return { ...CATEGORIES, ...parsed };
        }
      }
    } catch (e) {
      console.error('Error loading categories from localStorage:', e);
    }
    return CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finmate_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    const saved = localStorage.getItem('finmate_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [debts, setDebts] = useState<OfficeDebt[]>(() => {
    const saved = localStorage.getItem('finmate_debts');
    return saved ? JSON.parse(saved) : INITIAL_DEBTS;
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('finmate_notification_settings');
      return saved ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) } : DEFAULT_NOTIFICATION_SETTINGS;
    } catch (e) {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  });

  const [notifications, setNotifications] = useState<BudgetNotification[]>(() => {
    try {
      const saved = localStorage.getItem('finmate_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [billSplitGroups, setBillSplitGroups] = useState<BillSplitGroup[]>(() => {
    try {
      const saved = localStorage.getItem('finmate_bill_groups');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('finmate_messages');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'welcome-1',
        sender: 'ai',
        text: 'Nhập khoản chi tiêu để bắt đầu. VD: "Cơm trưa 45k, cafe 35k"',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [isSlangGuideOpen, setIsSlangGuideOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [activeAlertToast, setActiveAlertToast] = useState<BudgetNotification | null>(null);

  // Save to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('finmate_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('finmate_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finmate_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finmate_debts', JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem('finmate_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('finmate_notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem('finmate_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('finmate_bill_groups', JSON.stringify(billSplitGroups));
  }, [billSplitGroups]);

  // --- CLOUD MULTI-DEVICE SYNC ENGINE ---
  const isCloudLoadedRef = useRef(false);

  // 1. Tải dữ liệu từ Cloud khi khởi động hoặc đăng nhập
  const fetchCloudData = useCallback(async () => {
    const userId = userProfile?.id || 'default_user';
    try {
      const res = await fetch(getApiUrl(`/api/user-data/${userId}`));
      const textData = await res.text();
      if (!textData.trim().startsWith('{')) return;
      const resData = JSON.parse(textData);

      if (resData.success && resData.data) {
        const cloud = resData.data;
        console.log('☁️ Đã đồng bộ dữ liệu từ Cloud thành công!');
        if (cloud.categories) setCategories((prev) => ({ ...prev, ...cloud.categories }));
        if (cloud.transactions && Array.isArray(cloud.transactions)) {
          setTransactions(cloud.transactions);
        }
        if (cloud.budgets && Array.isArray(cloud.budgets)) {
          setBudgets(cloud.budgets);
        }
        if (cloud.debts && Array.isArray(cloud.debts)) {
          setDebts(cloud.debts);
        }
        if (cloud.messages && Array.isArray(cloud.messages)) {
          setMessages(cloud.messages);
        }
        if (cloud.notificationSettings) setNotificationSettings(cloud.notificationSettings);
        if (cloud.notifications) setNotifications(cloud.notifications);
      }
    } catch (err) {
      console.log('Cloud sync fetch error:', err);
    } finally {
      isCloudLoadedRef.current = true;
    }
  }, [userProfile?.id]);

  useEffect(() => {
    fetchCloudData();

    // Tự động kéo dữ liệu mới nhất khi người dùng quay lại tab hoặc mở lại app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCloudData();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchCloudData]);

  // 2. Tự động đẩy thay đổi lên Cloud (Sync đa thiết bị giữa Web Render & Điện thoại Zalo)
  const syncTimeoutRef = useRef<any>(null);

  const syncToCloud = useCallback((payload: any) => {
    if (!isCloudLoadedRef.current) return;
    const userId = userProfile?.id || 'default_user';
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(() => {
      fetch(getApiUrl('/api/sync-user-data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          data: payload,
        }),
      }).catch((err) => console.log('Cloud sync push error:', err));
    }, 1200);
  }, [userProfile?.id]);

  useEffect(() => {
    if (isCloudLoadedRef.current) {
      syncToCloud({
        categories,
        transactions,
        budgets,
        debts,
        messages,
        notificationSettings,
        notifications,
        billSplitGroups,
      });
    }
  }, [categories, transactions, budgets, debts, messages, notificationSettings, notifications, billSplitGroups, syncToCloud]);

  // Current active month ('YYYY-MM')
  const currentMonthStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Filter transactions for the current month
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date && t.date.startsWith(currentMonthStr));
  }, [transactions, currentMonthStr]);

  // Derived financial statistics (Current Month)
  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Cumulative bank balance across lifetime transactions
  const totalLifetimeIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalLifetimeExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalLifetimeIncome - totalLifetimeExpense;

  const totalReceivables = debts
    .filter((d) => d.type === 'receivable' && !d.isSettled)
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPayables = debts
    .filter((d) => d.type === 'payable' && !d.isSettled)
    .reduce((sum, d) => sum + d.amount, 0);

  // Category spent map strictly for the current month
  const categorySpentMap: Record<CategoryCode, number> = {};

  currentMonthTransactions.forEach((tx) => {
    if (tx.type === 'expense') {
      categorySpentMap[tx.category] = (categorySpentMap[tx.category] || 0) + tx.amount;
    }
  });

  const categoryBudgetMap: Record<CategoryCode, number> = {};
  budgets.forEach((b) => {
    categoryBudgetMap[b.category] = b.limitAmount;
  });

  // Ensure all current categories exist in full budgets list
  const fullBudgetsList: CategoryBudget[] = Object.keys(categories)
    .filter((code) => code !== 'Budget_Query' && code !== 'Income')
    .map((code) => {
      const existing = budgets.find((b) => b.category === code);
      return existing || { category: code, limitAmount: 2000000 };
    });

  const pendingDebtCount = debts.filter((d) => !d.isSettled).length;
  const warningThreshold = notificationSettings.warningThreshold || 80;

  const budgetAlertCount = fullBudgetsList.filter((b) => {
    const spent = categorySpentMap[b.category] || 0;
    return b.limitAmount > 0 && (spent / b.limitAmount) >= (warningThreshold / 100);
  }).length;

  const unreadAlertCount = notifications.filter((n) => !n.isRead).length;

  // Trigger Budget Warning Evaluation
  const evaluateAndDispatchBudgetAlert = useCallback(
    (categoryCode: CategoryCode, additionalExpense: number = 0) => {
      if (!notificationSettings.autoAlertOnSpending) return;

      const currentSpent = categorySpentMap[categoryCode] || 0;
      const newTotalSpent = currentSpent + additionalExpense;
      const limit = categoryBudgetMap[categoryCode] || 2000000;

      if (limit <= 0) return;

      const percentage = Math.round((newTotalSpent / limit) * 100);

      if (percentage >= warningThreshold) {
        const catInfo = categories[categoryCode] || { label: categoryCode };
        const catLabel = catInfo.label || categoryCode;
        const level: 'warning' | 'danger' = percentage >= 100 ? 'danger' : 'warning';
        const formattedSpent = newTotalSpent.toLocaleString('vi-VN') + ' ₫';
        const formattedLimit = limit.toLocaleString('vi-VN') + ' ₫';

        const title = level === 'danger'
          ? `🚨 Vượt hạn mức: ${catLabel} (${percentage}%)`
          : `⚠️ Cảnh báo ngân sách: ${catLabel} (${percentage}%)`;

        const message = level === 'danger'
          ? `Đã vượt hạn mức! (${formattedSpent} / ${formattedLimit})`
          : `Đã chạm ngưỡng ${percentage}% hạn mức (${formattedSpent} / ${formattedLimit})`;

        const newNotif: BudgetNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          category: categoryCode,
          categoryLabel: catLabel,
          spent: newTotalSpent,
          limit,
          percentage,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          level,
          title,
          message,
          isRead: false,
          channel: notificationSettings.enableZaloNotification && notificationSettings.enableSystemNotification
            ? 'both'
            : notificationSettings.enableZaloNotification
            ? 'zalo'
            : 'system',
        };

        // Add to notification list
        setNotifications((prev) => [newNotif, ...prev.filter(n => n.category !== categoryCode).slice(0, 49)]);

        // Display in-app floating banner
        setActiveAlertToast(newNotif);

        // Sound chime
        if (notificationSettings.soundEnabled) {
          playAlertChime(level);
        }

        // Browser Native Notification
        if (notificationSettings.enableSystemNotification) {
          sendSystemNotification(title, {
            body: message,
          });
        }

        // Zalo Mini App Push Notification (Real API)
        if (notificationSettings.enableZaloNotification && notificationSettings.zaloUserId) {
          triggerZaloNotification({
            categoryLabel: catLabel,
            spent: newTotalSpent,
            limit,
            percentage,
            level,
            zaloUserId: notificationSettings.zaloUserId,
          });
        }

        return { title, message, percentage, level };
      }

      return null;
    },
    [categorySpentMap, categoryBudgetMap, categories, notificationSettings, warningThreshold]
  );

  const userContext: UserFinancialContext = {
    currentBalance,
    monthlyIncome,
    monthlyExpense,
    categoryBudgets: categoryBudgetMap,
    categorySpent: categorySpentMap,
    totalReceivables,
    totalPayables,
    recentTransactionsSummary: transactions.slice(0, 5).map((t) => `${t.description}: ${t.amount}đ`).join('; '),
    userCategories: (Object.values(categories) as CategoryInfo[]).map((c) => ({
      code: c.code,
      label: c.label,
      description: c.description,
    })),
  };

  // Send prompt to AI backend
  const handleSendMessage = async (text: string) => {
    const userMsgId = `user-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    let data: any = null;

    try {
      // 1. Thử gọi backend API với timeout 4s (tránh treo khi Render đang cold start)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(getApiUrl('/api/parse-finance'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          context: userContext,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const textData = await response.text();
        if (textData && textData.trim().startsWith('{')) {
          data = JSON.parse(textData);
        }
      }
    } catch (netErr) {
      console.log('Backend response slow or sleeping, using instant on-device parser:', netErr);
    }

    // 2. Tự động fallback sang bộ phân tích AI tức thì trên thiết bị (< 10ms)
    if (!data) {
      data = { ...clientFallbackParse(text, userContext), engine: 'client_offline_fallback' };
    }

    console.log(`🔍 [ChiChill Engine]: Đang xử lý bằng -> ${data.engine || 'unknown'}`, data);

    try {
      const newTxList: Transaction[] = [];
      let alertInfo: any = null;

      if (data.transactions && Array.isArray(data.transactions) && data.transactions.length > 0) {
        data.transactions.forEach((tx: any, idx: number) => {
          const newTx: Transaction = {
            id: `tx-ai-${Date.now()}-${idx}`,
            type: tx.type || 'expense',
            amount: Number(tx.amount) || 0,
            category: (tx.category as CategoryCode) || 'Food',
            description: tx.description || text,
            date: new Date().toISOString().split('T')[0],
            time: timestamp,
            createdBy: 'ai',
          };

          if (newTx.amount > 0) {
            newTxList.push(newTx);

            // Trigger budget alert check if expense
            if (newTx.type === 'expense') {
              const alertResult = evaluateAndDispatchBudgetAlert(newTx.category, newTx.amount);
              if (alertResult) alertInfo = alertResult;
            }

            // If debt type (receivable or payable), also auto sync to Office Debts
            if (tx.type === 'receivable' || tx.type === 'payable') {
              const newDebt: OfficeDebt = {
                id: `debt-ai-${Date.now()}-${idx}`,
                personName: tx.description.split(' ')[0] || 'Đồng nghiệp',
                type: tx.type,
                amount: newTx.amount,
                description: tx.description,
                date: new Date().toISOString().split('T')[0],
                isSettled: false,
              };
              setDebts((prev) => [newDebt, ...prev]);
            }
          }
        });

        if (newTxList.length > 0) {
          setTransactions((prev) => [...newTxList, ...prev]);
        }
      }

      let replyText = data.reply_message || 'Tôi đã xử lý yêu cầu của bạn.';
      if (alertInfo) {
        replyText += `\n\n${alertInfo.title}\n💡 ${alertInfo.message}`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent,
        parsedTransactions: newTxList,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (processError) {
      console.error('Error processing transaction data:', processError);
      const aiErrorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Đã xảy ra lỗi khi lưu giao dịch. Vui lòng thử lại!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual Add Transaction
  const handleAddManualTransaction = (data: {
    type: TransactionType;
    amount: number;
    category: CategoryCode;
    description: string;
    personName?: string;
  }) => {
    const timestamp = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newTx: Transaction = {
      id: `tx-manual-${Date.now()}`,
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: new Date().toISOString().split('T')[0],
      time: timestamp,
      createdBy: 'manual',
      personName: data.personName,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Check budget alert for manual expense
    if (data.type === 'expense') {
      evaluateAndDispatchBudgetAlert(data.category, data.amount);
    }

    if (data.type === 'receivable' || data.type === 'payable') {
      const newDebt: OfficeDebt = {
        id: `debt-manual-${Date.now()}`,
        personName: data.personName || 'Đồng nghiệp',
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: new Date().toISOString().split('T')[0],
        isSettled: false,
      };
      setDebts((prev) => [newDebt, ...prev]);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Delete Transaction from Chat message
  const handleDeleteTransactionFromChat = (msgId: string, txId: string) => {
    handleDeleteTransaction(txId);
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.parsedTransactions) {
          return {
            ...m,
            parsedTransactions: m.parsedTransactions.filter((pt) => pt.id !== txId),
          };
        }
        return m;
      })
    );
  };

  // Category Management Handlers
  const handleAddCategory = (newCat: CategoryInfo, defaultLimit: number) => {
    setCategories((prev) => ({ ...prev, [newCat.code]: newCat }));
    setBudgets((prev) => [
      ...prev.filter((b) => b.category !== newCat.code),
      { category: newCat.code, limitAmount: defaultLimit },
    ]);
  };

  const handleUpdateCategory = (code: CategoryCode, updated: Partial<CategoryInfo>, newLimit?: number) => {
    setCategories((prev) => {
      if (!prev[code]) return prev;
      return {
        ...prev,
        [code]: { ...prev[code], ...updated },
      };
    });
    if (newLimit !== undefined) {
      handleUpdateBudget(code, newLimit);
    }
  };

  const handleDeleteCategory = (code: CategoryCode) => {
    setCategories((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
    setBudgets((prev) => prev.filter((b) => b.category !== code));
  };

  // Budget Update
  const handleUpdateBudget = (category: CategoryCode, limitAmount: number) => {
    setBudgets((prev) => {
      const exists = prev.some((b) => b.category === category);
      if (exists) {
        return prev.map((b) => (b.category === category ? { ...b, limitAmount } : b));
      }
      return [...prev, { category, limitAmount }];
    });
  };

  // Debt Handlers
  const handleAddDebt = (debtData: Omit<OfficeDebt, 'id' | 'date'>) => {
    const newDebt: OfficeDebt = {
      ...debtData,
      id: `debt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setDebts((prev) => [newDebt, ...prev]);
  };

  const handleToggleSettled = (id: string) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isSettled: !d.isSettled } : d))
    );
  };

  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  // Bill Split Group Handlers
  const handleAddBillGroup = (group: Omit<BillSplitGroup, 'id' | 'createdAt' | 'isSettled'>) => {
    const newGroup: BillSplitGroup = {
      ...group,
      id: `group-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      isSettled: false,
    };
    setBillSplitGroups((prev) => [newGroup, ...prev]);
  };

  const handleAddBillExpense = (groupId: string, expense: Omit<BillSplitExpense, 'id'>) => {
    setBillSplitGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          expenses: [...g.expenses, { ...expense, id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` }],
        };
      })
    );
  };

  const handleDeleteBillExpense = (groupId: string, expenseId: string) => {
    setBillSplitGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return { ...g, expenses: g.expenses.filter((e) => e.id !== expenseId) };
      })
    );
  };

  const handleToggleBillGroupSettled = (groupId: string) => {
    setBillSplitGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isSettled: !g.isSettled } : g))
    );
  };

  const handleUpdateBillGroup = (groupId: string, updates: Partial<BillSplitGroup>) => {
    setBillSplitGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...updates } : g))
    );
  };

  const handleDeleteBillGroup = (groupId: string) => {
    setBillSplitGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  // Notification Center Handlers
  const handleMarkNotifAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDeleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    localStorage.removeItem('finmate_auth');
    localStorage.removeItem('finmate_user');
    setNotificationSettings((prev) => ({
      ...prev,
      zaloUserId: undefined,
      zaloNotifPermission: 'unknown',
    }));
  };

  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={async (user) => {
          setIsAuthenticated(true);
          setUserProfile(user);
          localStorage.setItem('finmate_auth', 'true');
          localStorage.setItem('finmate_user', JSON.stringify(user));

          // Request Zalo push notification permission & save userId
          if (user?.id) {
            const zaloPermission = await requestZaloNotifPermission();
            setNotificationSettings((prev) => ({
              ...prev,
              zaloUserId: user.id,
              zaloNotifPermission: zaloPermission,
            }));
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-gray-800 selection:bg-blue-100">
      {/* Floating In-App Budget Alert Toast Banner */}
      <BudgetAlertToast
        notification={activeAlertToast}
        onClose={() => setActiveAlertToast(null)}
        onOpenCenter={() => {
          setActiveAlertToast(null);
          setIsNotificationCenterOpen(true);
        }}
      />

      {/* Top Zalo App Header */}
      <Header
        currentBalance={currentBalance}
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
        totalReceivables={totalReceivables}
        totalPayables={totalPayables}
        unreadAlertCount={unreadAlertCount}
        userProfile={userProfile}
        onOpenSlangGuide={() => setIsSlangGuideOpen(true)}
        onOpenAddModal={() => setIsQuickAddOpen(true)}
        onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
      />

      {/* Main Content Area Based on Active Tab */}
      <main className="pt-2">
        {activeTab === 'chat' && (
          <AIChatView
            messages={messages}
            categories={categories}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onConfirmTransaction={() => {}}
            onDeleteTransactionFromChat={handleDeleteTransactionFromChat}
            userContext={userContext}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionListView
            transactions={transactions}
            categories={categories}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenAddModal={() => setIsQuickAddOpen(true)}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetView
            budgets={fullBudgetsList}
            categories={categories}
            transactions={transactions}
            notificationSettings={notificationSettings}
            onUpdateBudget={handleUpdateBudget}
            onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
            onOpenNotificationSettings={() => setIsNotificationSettingsOpen(true)}
            onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
          />
        )}

        {activeTab === 'debts' && (
          <DebtTrackerView
            debts={debts}
            onAddDebt={handleAddDebt}
            onToggleSettled={handleToggleSettled}
            onDeleteDebt={handleDeleteDebt}
            billSplitGroups={billSplitGroups}
            onAddBillGroup={handleAddBillGroup}
            onAddBillExpense={handleAddBillExpense}
            onDeleteBillExpense={handleDeleteBillExpense}
            onToggleBillGroupSettled={handleToggleBillGroupSettled}
            onUpdateBillGroup={handleUpdateBillGroup}
            onDeleteBillGroup={handleDeleteBillGroup}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            transactions={transactions}
            categories={categories}
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
          />
        )}
      </main>

      {/* Bottom Zalo Style Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingDebtCount={pendingDebtCount}
        budgetAlertCount={budgetAlertCount}
      />

      {/* Modals */}
      <SlangGuideModal
        isOpen={isSlangGuideOpen}
        onClose={() => setIsSlangGuideOpen(false)}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        categories={categories}
        onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
        onClose={() => setIsQuickAddOpen(false)}
        onAddTransaction={handleAddManualTransaction}
      />

      <CategoryManagerModal
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        budgets={fullBudgetsList}
        categoryBudgets={categoryBudgetMap}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        categories={categories}
        settings={notificationSettings}
        onMarkAsRead={handleMarkNotifAsRead}
        onMarkAllAsRead={handleMarkAllNotifsAsRead}
        onDeleteNotification={handleDeleteNotif}
        onClearAll={handleClearAllNotifs}
        onOpenSettings={() => setIsNotificationSettingsOpen(true)}
        onNavigateToBudgets={() => setActiveTab('budgets')}
      />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
        settings={notificationSettings}
        userProfile={userProfile}
        onSaveSettings={(newSettings) => {
          setNotificationSettings(newSettings);
          localStorage.setItem('finmate_notification_settings', JSON.stringify(newSettings));
        }}
        onUpdateUserProfile={setUserProfile}
        onLogout={handleLogout}
        onTestNotification={() => {
          const testNotif: BudgetNotification = {
            id: `test-${Date.now()}`,
            category: 'Food',
            categoryLabel: 'Ăn uống',
            spent: 3825000,
            limit: 4500000,
            percentage: 85,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            level: 'warning',
            title: '⚠️ Cảnh báo ngân sách: Ăn uống (85%)',
            message: 'Đã chi 3.825.000 ₫ / 4.500.000 ₫ hạn mức tháng.',
            isRead: false,
            channel: 'both',
          };
          setActiveAlertToast(testNotif);
          setNotifications((prev) => [testNotif, ...prev.slice(0, 49)]);
        }}
      />
    </div>
  );
}
