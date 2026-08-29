import React from 'react';
import { X, Sparkles, BookOpen } from 'lucide-react';
import { SLANG_SAMPLES } from '../data/initialData';

interface SlangGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlangGuideModal: React.FC<SlangGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 z-50 select-none">
      <div className="bg-white rounded-[28px] max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Từ Điển Tiếng Lóng Chi Tiêu</h3>
              <p className="text-xs text-slate-500">ChiChill AI nhận diện 100% tiếng lóng thu chi hằng ngày</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Slang Glossary */}
        <div className="space-y-3 text-xs">
          <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1.5">
            <p className="font-extrabold flex items-center space-x-1 text-emerald-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Quy đổi đơn vị tiền tệ tự nhiên:</span>
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 font-medium">
              <li><b>1 Củ / 1 Tr / 1 Triệu</b> = 1.000.000 VNĐ (ví dụ: 1.5 củ = 1.500.000đ)</li>
              <li><b>1 Lít / 1 Xị</b> = 100.000 VNĐ (ví dụ: 5 lít = 500.000đ)</li>
              <li><b>10k / 45k</b> = 10.000 VNĐ / 45.000 VNĐ</li>
            </ul>
          </div>

          <h4 className="font-extrabold text-slate-800 pt-1">Ví Dụ Mẫu Để Bạn Gõ Trực Tiếp Cho AI:</h4>

          <div className="space-y-2">
            {SLANG_SAMPLES.map((s, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 flex flex-col space-y-1">
                <span className="font-extrabold text-emerald-800 text-xs">"{s.slang}"</span>
                <span className="text-[11px] text-slate-500 font-medium">➡️ {s.standard}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-amber-950 text-xs">
            💡 <b>Mẹo dùng nhanh:</b> Bạn có thể gõ gộp nhiều khoản cùng 1 lúc! Ví dụ: <i>"Sáng ăn phở 45k, cafe 35k, Nam mượn 200k tiền cơm trưa"</i>.
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold py-3 rounded-2xl cursor-pointer text-xs shadow-md shadow-emerald-600/25 transition-all"
        >
          Đã Hiểu & Bắt Đầu Sử Dụng
        </button>
      </div>
    </div>
  );
};
