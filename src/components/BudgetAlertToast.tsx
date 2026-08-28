import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, X, ArrowRight, Flame } from 'lucide-react';
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

  const isDanger = notification.level === 'danger' || notification.percentage >= 100;

  return (
    <div className="fixed top-16 right-4 left-4 sm:left-auto sm:w-96 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300 select-none">
      <div
        className={`rounded-2xl shadow-2xl border overflow-hidden p-4 relative backdrop-blur-xl ${
          isDanger
            ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-950/30 ring-1 ring-rose-500/20'
            : 'bg-slate-900/95 text-white border-amber-500/40 shadow-amber-950/30 ring-1 ring-amber-500/20'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isDanger
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-inner'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-inner'
            }`}
          >
            {isDanger ? <Flame className="w-5 h-5 animate-pulse text-rose-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
          </div>

          <div className="flex-1 space-y-1.5 pr-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isDanger ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                }`}
              >
                {isDanger ? 'Vượt Hạn Mức' : 'Cảnh Báo'}
              </span>
              <span className="text-xs font-black text-slate-100 tracking-tight">
                {notification.categoryLabel || notification.title}
              </span>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-medium">
              {notification.message}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCenter();
                }}
                className="text-[11px] font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <span>Xem chi tiết</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auto dismiss countdown bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div
            className={`h-full transition-all duration-75 ${
              isDanger
                ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                : 'bg-gradient-to-r from-amber-500 to-amber-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
