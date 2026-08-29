import React, { useState } from 'react';
import {
  X,
  Sparkles,
  MessageSquare,
  Target,
  Users,
  PieChart,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mic,
  QrCode,
  Layers,
  TrendingDown,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import { TabType } from '../types';

interface AppOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
}

export const AppOnboardingTour: React.FC<AppOnboardingTourProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      id: 'chat',
      tab: 'chat' as TabType,
      stepNum: '1 / 4',
      title: 'Chat & Nhập Giọng Nói AI',
      highlight: 'Chỉ cần gõ hoặc bấm mic nói "Cơm 45k, cafe 35k", ChiChill tự động phân loại và lưu sổ trong 1 giây.',
      icon: MessageSquare,
      iconColor: 'bg-emerald-600 text-white',
      accentGradient: 'from-emerald-500/10 to-teal-500/10',
      tags: ['🎙️ Nhập giọng nói siêu tốc', '⚡ Hiểu tiếng lóng ("2 lốp", "3 củ")', '📂 Tự gán danh mục'],
      quickActionText: 'Thử Chat ngay ›',
    },
    {
      id: 'budgets',
      tab: 'budgets' as TabType,
      stepNum: '2 / 4',
      title: 'Hạn Mức Chi Tiêu',
      highlight: 'Đặt giới hạn ngân sách tháng cho từng mục. Chạm trực tiếp vào thẻ để chỉnh sửa và nhận chuông cảnh báo trước khi vượt ngưỡng.',
      icon: Target,
      iconColor: 'bg-blue-600 text-white',
      accentGradient: 'from-blue-500/10 to-indigo-500/10',
      tags: ['🎯 Sửa trực tiếp trên thẻ', '🔔 Cảnh báo khi tiêu quá 80%', '🛡️ Kiểm soát tài chính'],
      quickActionText: 'Xem Tab Hạn Mức ›',
    },
    {
      id: 'debts',
      tab: 'debts' as TabType,
      stepNum: '3 / 4',
      title: 'Chia Bill Nhóm & VietQR',
      highlight: 'Đi ăn trưa, trà sữa chung? Chia đều hoặc chia theo món (tự chia tiền ship & voucher), tạo mã VietQR tự điền số tiền để bạn bè quét trả nợ.',
      icon: Users,
      iconColor: 'bg-amber-500 text-white',
      accentGradient: 'from-amber-500/10 to-orange-500/10',
      tags: ['📋 Chia theo từng món & Ship', '📱 Sinh mã VietQR tự điền tiền', '💬 Gửi tổng kết vào Zalo'],
      quickActionText: 'Xem Tab Chia Bill ›',
    },
    {
      id: 'analytics',
      tab: 'analytics' as TabType,
      stepNum: '4 / 4',
      title: 'Báo Cáo & Sổ Giao Dịch',
      highlight: 'Biểu đồ chi tiêu trực quan. Chạm vào bất kỳ danh mục nào trên biểu đồ để xem ngay danh sách hóa đơn chi tiết.',
      icon: PieChart,
      iconColor: 'bg-purple-600 text-white',
      accentGradient: 'from-purple-500/10 to-pink-500/10',
      tags: ['📊 Biểu đồ tương tác', '🔍 Lọc theo tuần / tháng', '📒 Quản lý nợ văn phòng'],
      quickActionText: 'Xem Tab Báo Cáo ›',
    },
  ];

  const currentTour = tourSteps[currentStep];
  const IconComponent = currentTour.icon;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJumpToTab = (tab: TabType) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] max-w-md w-full overflow-hidden shadow-2xl flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            Hướng dẫn • {currentTour.stepNum}
          </span>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 p-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold px-3"
            title="Đóng hướng dẫn"
          >
            <span>Bỏ qua</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body - Minimalist Slide Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Main Visual Header */}
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl ${currentTour.iconColor} flex items-center justify-center shrink-0 shadow-md shadow-slate-900/10`}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {currentTour.title}
              </h3>
            </div>
          </div>

          {/* Highlight description */}
          <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {currentTour.highlight}
          </p>

          {/* Clean feature tags */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {currentTour.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Quick Jump to this Tab */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleJumpToTab(currentTour.tab)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
            >
              <span>{currentTour.quickActionText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          {/* Step Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {tourSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStep
                    ? 'w-6 bg-emerald-600'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Đến bước ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>
                {currentStep === tourSteps.length - 1
                  ? 'Khám phá ngay'
                  : 'Tiếp theo'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
