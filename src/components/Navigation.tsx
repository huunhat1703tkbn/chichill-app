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
      label: 'AI Trợ Lý',
      icon: MessageSquare,
      badge: undefined,
    },
    {
      id: 'transactions' as TabType,
      label: 'Sổ Thu Chi',
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
      label: 'Sổ Nợ VP',
      icon: Users,
      badge: pendingDebtCount > 0 ? pendingDebtCount : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'analytics' as TabType,
      label: 'Thống Kê',
      icon: BarChart3,
      badge: undefined,
    },
  ];

  return (
    <nav
      id="zalo-bottom-navigation"
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-30 pb-safe select-none"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-around px-1 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 sm:px-4 rounded-xl transition-all duration-150 cursor-pointer min-h-[48px] flex-1 max-w-[80px] sm:max-w-none active:scale-95 ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-gray-500 hover:text-gray-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-2 text-[9px] font-black text-white px-1.5 py-0.2 rounded-full ${
                      tab.badgeColor || 'bg-blue-600'
                    } animate-pulse shadow-xs border border-white`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight truncate w-full text-center">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

