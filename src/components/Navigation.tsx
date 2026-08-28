import React from 'react';
import { MessageSquare, ReceiptText, Target, Users, BarChart3 } from 'lucide-react';

export type TabType = 'chat' | 'transactions' | 'budgets' | 'debts' | 'analytics';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingDebtCount?: number;
  budgetAlertCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingDebtCount = 0,
  budgetAlertCount = 0,
}) => {
  const tabs = [
    {
      id: 'chat' as TabType,
      label: 'AI Chat',
      icon: MessageSquare,
      badge: undefined,
    },
    {
      id: 'transactions' as TabType,
      label: 'Sổ Ví',
      icon: ReceiptText,
      badge: undefined,
    },
    {
      id: 'budgets' as TabType,
      label: 'Hạn Mức',
      icon: Target,
      badge: budgetAlertCount > 0 ? budgetAlertCount : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'debts' as TabType,
      label: 'Chia Bill',
      icon: Users,
      badge: pendingDebtCount > 0 ? pendingDebtCount : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'analytics' as TabType,
      label: 'Báo Cáo',
      icon: BarChart3,
      badge: undefined,
    },
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-4 left-0 right-0 z-30 px-3 pointer-events-none pb-safe select-none">
      <nav
        id="zalo-bottom-navigation"
        className="max-w-md mx-auto glass-dock rounded-[28px] p-1.5 pointer-events-auto flex items-center justify-between gap-1 transition-all"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-[20px] transition-all duration-200 cursor-pointer flex-1 active:scale-95 ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform ${isActive ? 'stroke-[2.5] scale-105' : 'stroke-[1.75]'}`} />
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-2 text-[8px] font-black text-white px-1 rounded-full ${
                      tab.badgeColor || 'bg-rose-500'
                    } ring-1 ring-white`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight truncate w-full text-center mt-0.5 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

