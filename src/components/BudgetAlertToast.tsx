import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, X, Bell, Smartphone, ArrowRight } from 'lucide-react';
import { BudgetNotification } from '../types';

interface BudgetAlertToastProps {
  notification: BudgetNotification | null;
  onClose: () => void;
  onOpenCenter: () => void;
}

export const BudgetAlertToast: React.FC<BudgetAlertToastProps> = ({
  notification,
  onClose,
  onOpenCenter,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!notification) return;

    setProgress(100);
    const interval = 50;
    const totalTime = 6000;
    const step = (interval / totalTime) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const isDanger = notification.level === 'danger';

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        className={`rounded-2xl shadow-xl border overflow-hidden p-4 relative backdrop-blur-md ${
          isDanger
            ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-900/20'
            : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-900/20'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
            }`}
          >
            {isDanger ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div className="flex-1 space-y-1 pr-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                Zalo Alert
              </span>
              <span className="text-xs font-black tracking-tight">{notification.title}</span>
            </div>
            <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed">
              {notification.message}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCenter();
                }}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auto dismiss countdown bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className={`h-full transition-all duration-75 ${
              isDanger ? 'bg-rose-400' : 'bg-amber-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
