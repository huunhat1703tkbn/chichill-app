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
      badge: 'BƯỚC 1/4 • NHẬP NHANH',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      title: 'Trợ Lý AI Ghi Chép Bằng Giọng Nói & Chat',
      shortDesc: 'Không cần gõ biểu mẫu phức tạp! Chỉ cần gõ hoặc nói tự nhiên.',
      icon: MessageSquare,
      iconColor: 'bg-emerald-500 text-white',
      accentGradient: 'from-emerald-500/10 via-teal-500/5 to-emerald-500/20',
      features: [
        {
          icon: Mic,
          title: 'Nhập bằng giọng nói siêu tốc',
          desc: 'Bấm micro và nói: "Ăn trưa bún bò 45k, cà phê muối 35k".',
        },
        {
          icon: Sparkles,
          title: 'Hiểu tiếng lóng & từ viết tắt',
          desc: 'Hiểu chuẩn xác "2 lốp", "3 củ", "45k", "trà sữa 1 ly".',
        },
        {
          icon: CheckCircle2,
          title: 'Tự động phân loại danh mục',
          desc: 'Tự gán vào Ăn uống, Mua sắm, Di chuyển... chỉ trong 0.5s.',
        },
      ],
      quickActionText: 'Thử Chat với AI ngay',
    },
    {
      id: 'budgets',
      tab: 'budgets' as TabType,
      badge: 'BƯỚC 2/4 • KIỂM SOÁT',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      title: 'Hạn Mức Ngân Sách - Không Lo "Cháy Túi"',
      shortDesc: 'Đặt giới hạn chi tiêu từng danh mục để luôn chủ động tài chính.',
      icon: Target,
      iconColor: 'bg-blue-600 text-white',
      accentGradient: 'from-blue-500/10 via-indigo-500/5 to-blue-500/20',
      features: [
        {
          icon: TrendingDown,
          title: 'Theo dõi hạn mức trực quan',
          desc: 'Biết ngay bạn đã tiêu bao nhiêu % của Ăn uống, Mua sắm tháng này.',
        },
        {
          icon: BellRing,
          title: 'Chuông cảnh báo khi tiêu quá 80%',
          desc: 'Nhận thông báo và chuông cảnh báo trước khi vượt ngân sách.',
        },
        {
          icon: CheckCircle2,
          title: 'Chỉnh sửa trực tiếp trên từng thẻ',
          desc: 'Chạm vào bất kỳ danh mục nào để sửa nhanh số tiền hạn mức.',
        },
      ],
      quickActionText: 'Xem Tab Hạn Mức',
    },
    {
      id: 'debts',
      tab: 'debts' as TabType,
      badge: 'BƯỚC 3/4 • ĐỒNG ĐỘI',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      title: 'Chia Bill Nhóm & Quét Mã VietQR Tự Động',
      shortDesc: 'Đi ăn trưa, trà sữa văn phòng? Gom đơn và chia tiền trong 3 giây!',
      icon: Users,
      iconColor: 'bg-amber-500 text-white',
      accentGradient: 'from-amber-500/10 via-orange-500/5 to-amber-500/20',
      features: [
        {
          icon: Layers,
          title: 'Chia theo từng món & Ship/Voucher',
          desc: 'Ai ăn gì trả nấy, tự động chia đều tiền ship và trừ mã giảm giá.',
        },
        {
          icon: QrCode,
          title: 'Tự động tạo mã VietQR động',
          desc: 'Mã QR tự điền đúng số tiền nợ & nội dung, mở app ngân hàng là quét xong.',
        },
        {
          icon: CheckCircle2,
          title: 'Gửi kết quả chia bill vào Zalo',
          desc: 'Tạo sẵn tin nhắn tổng kết rõ ràng để gửi thẳng vào nhóm chat Zalo.',
        },
      ],
      quickActionText: 'Xem Tab Chia Bill & Sổ Nợ',
    },
    {
      id: 'analytics',
      tab: 'analytics' as TabType,
      badge: 'BƯỚC 4/4 • MINH BẠCH',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      title: 'Báo Cáo Biểu Đồ & Sổ Giao Dịch Chi Tiết',
      shortDesc: 'Nắm bắt dòng tiền và xem chi tiết từng đồng tiền đi đâu.',
      icon: PieChart,
      iconColor: 'bg-purple-600 text-white',
      accentGradient: 'from-purple-500/10 via-pink-500/5 to-purple-500/20',
      features: [
        {
          icon: PieChart,
          title: 'Biểu đồ chi tiêu tương tác',
          desc: 'Chạm vào mục "Ăn uống" trên biểu đồ để xem ngay danh sách hóa đơn tương ứng.',
        },
        {
          icon: CheckCircle2,
          title: 'Lọc theo thời gian linh hoạt',
          desc: 'Xem báo cáo theo Tuần này, Tháng này, 3 tháng hoặc Toàn bộ thời gian.',
        },
        {
          icon: Sparkles,
          title: 'Phân tích & Lời khuyên tài chính',
          desc: 'AI đánh giá thói quen tiêu dùng và gợi ý cách tiết kiệm hợp lý.',
        },
      ],
      quickActionText: 'Xem Tab Báo Cáo',
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
      <div className="bg-white rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border ${currentTour.badgeColor}`}
            >
              {currentTour.badge}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 p-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold px-3"
            title="Đóng hướng dẫn"
          >
            <span>Bỏ qua</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body - Slide Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Visual Header */}
          <div
            className={`p-4 rounded-2xl bg-gradient-to-br ${currentTour.accentGradient} border border-slate-200/60 flex items-start gap-3.5 shadow-2xs`}
          >
            <div
              className={`w-12 h-12 rounded-2xl ${currentTour.iconColor} flex items-center justify-center shrink-0 shadow-md shadow-slate-900/10`}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                {currentTour.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                {currentTour.shortDesc}
              </p>
            </div>
          </div>

          {/* Key Feature Bullets */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tính năng nổi bật:
            </p>
            {currentTour.features.map((feat, idx) => {
              const FeatIcon = feat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <FeatIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{feat.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Jump to this Tab */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleJumpToTab(currentTour.tab)}
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
            >
              <span>{currentTour.quickActionText}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
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
                className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>
                {currentStep === tourSteps.length - 1
                  ? '🚀 Khám phá ngay'
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
