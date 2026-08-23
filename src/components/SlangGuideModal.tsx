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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200 animate-scaleIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Từ Điển Tiếng Lóng Tài Chính Dân Văn Phòng</h3>
              <p className="text-xs text-slate-500">ChiChill AI hiểu 100% tiếng lóng thu chi hằng ngày</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slang Glossary */}
        <div className="space-y-3 text-xs">
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-900 space-y-1">
            <p className="font-bold flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Quy đổi đơn vị tiền tệ tự nhiên:</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
              <li><b>1 Củ / 1 Tr / 1 Triệu</b> = 1,000,000 VNĐ (ví dụ: 1.5 củ = 1,500,000đ)</li>
              <li><b>1 Lít / 1 Xị</b> = 100,000 VNĐ (ví dụ: 5 lít = 500,000đ)</li>
              <li><b>10k / 45k</b> = 10,000 VNĐ / 45,000 VNĐ</li>
            </ul>
          </div>

          <h4 className="font-bold text-slate-800 pt-1">Ví Dụ Mẫu Để Bạn Gõ Trực Tiếp Cho AI:</h4>

          <div className="space-y-2">
            {SLANG_SAMPLES.map((s, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col space-y-1">
                <span className="font-bold text-blue-700 text-xs">"{s.slang}"</span>
                <span className="text-[11px] text-slate-500">➡️ {s.standard}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-xs">
            💡 <b>Mẹo dùng nhanh:</b> Bạn có thể gõ gộp nhiều khoản cùng 1 lúc! Ví dụ: <i>"Sáng ăn phở 45k, cafe 35k, Nam mượn 200k tiền cơm trưa"</i>.
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer text-xs"
        >
          Đã Hiểu & Bắt Đầu Sử Dụng
        </button>
      </div>
    </div>
  );
};
