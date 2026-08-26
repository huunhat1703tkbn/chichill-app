import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, CheckCircle2, Trash2, Edit2, AlertCircle, HelpCircle } from 'lucide-react';
import { ChatMessage, Transaction, CategoryCode, CategoryInfo, UserFinancialContext } from '../types';
import { CATEGORIES } from '../data/initialData';

interface AIChatViewProps {
  messages: ChatMessage[];
  categories?: Record<CategoryCode, CategoryInfo>;
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onConfirmTransaction: (msgId: string, tx: Transaction) => void;
  onDeleteTransactionFromChat: (msgId: string, txId: string) => void;
  userContext: UserFinancialContext;
}

const SAMPLE_PROMPTS = [
  '📊 Đánh giá sức khỏe tài chính tháng này',
  '🛍️ Đang tính mua đồ 2 triệu, có nên không?',
  '💡 Gợi ý cách tiết kiệm 3 củ tháng này',
  '🍜 Tháng này còn bao nhiêu tiền ăn uống?',
  '👥 Ai đang nợ mình tiền chưa trả?',
  'Cơm trưa VP 45k, cafe Highland 35k',
  'Nam mượn 200k tiền cơm trưa chia bill',
];

export const AIChatView: React.FC<AIChatViewProps> = ({
  messages,
  categories = CATEGORIES,
  onSendMessage,
  isLoading,
  onConfirmTransaction,
  onDeleteTransactionFromChat,
  userContext,
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const textToSend = input.trim();
    setInput('');
    onSendMessage(textToSend);
  };

  const handlePromptClick = (promptText: string) => {
    if (isLoading) return;
    onSendMessage(promptText);
  };

  const handleMicSimulate = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setInput('Ăn trưa buffet 150k, taxi Grab 80k');
    }, 1500);
  };

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-125px)] sm:h-[calc(100vh-135px)] max-w-4xl mx-auto bg-slate-50 relative pb-24 sm:pb-20">
      {/* Top Suggestions Bar */}
      <div className="bg-white px-3 sm:px-4 py-2 border-b border-gray-200 shadow-2xs sticky top-0 z-10">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none touch-scroll py-0.5">
          <span className="text-xs font-bold text-blue-600 whitespace-nowrap flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden xs:inline">Gợi ý:</span>
          </span>
          <div className="flex gap-1.5 shrink-0">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                disabled={isLoading}
                className="px-2.5 sm:px-3 py-1 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-full text-[11px] sm:text-xs font-medium text-gray-700 hover:text-blue-700 whitespace-nowrap cursor-pointer transition-all shadow-2xs active:scale-95 shrink-0"
              >
                + {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 touch-scroll">
        {messages.length === 0 && (
          <div className="text-center my-4 sm:my-6 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm max-w-lg mx-auto space-y-3.5">
            <div className="w-16 h-16 mx-auto rounded-3xl p-1 bg-gradient-to-br from-emerald-100 to-teal-50 shadow-md shadow-emerald-100">
              <img src="/logo.png" alt="ChiChill AI" className="w-full h-full rounded-2xl object-cover" onError={(e) => {
                (e.currentTarget as any).outerHTML = '<div class="w-full h-full bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg">AI</div>';
              }} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                Chi có kế hoạch · Chill không âu lo ✨
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Trợ lý & Cố vấn tài chính cá nhân AI: Ghi chép thu chi siêu nhanh bằng ngôn ngữ tự nhiên hoặc tâm sự, hỏi lời khuyên chi tiêu bất kỳ lúc nào!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <div className="text-gray-700 font-medium">📊 <b>Đánh giá tài chính</b></div>
              <div className="text-gray-700 font-medium">🛍️ <b>Tư vấn mua sắm</b></div>
              <div className="text-gray-700 font-medium">💡 <b>Tiết kiệm & Phân bổ</b></div>
              <div className="text-gray-700 font-medium">⚡ <b>Ghi thu chi tiếng lóng</b></div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 sm:gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar Badge */}
            {msg.sender === 'user' ? (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-[11px] sm:text-xs shadow-2xs bg-gray-200 text-gray-700">
                Bạn
              </div>
            ) : (
              <img src="/logo.png" alt="AI" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0 object-cover shadow-2xs bg-white" onError={(e) => {
                (e.currentTarget as any).outerHTML = '<div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-[11px] sm:text-xs shadow-2xs bg-blue-100 text-blue-600">AI</div>';
              }} />
            )}

            {/* Bubble Content */}
            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[82%]`}>
              <span className="text-[10px] text-gray-400 mb-0.5 px-1">{msg.timestamp}</span>

              <div
                className={`rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 rounded-tr-none text-white shadow-md shadow-blue-100'
                    : 'bg-white rounded-tl-none text-gray-800 border border-gray-100 border-l-4 border-l-blue-500 shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Action Transaction Cards if parsed */}
                {msg.sender === 'ai' && msg.parsedTransactions && msg.parsedTransactions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Đã ghi</span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold uppercase">
                        {msg.parsedTransactions.length} khoản
                      </span>
                    </div>

                    {msg.parsedTransactions.map((tx) => {
                      const categoryData =
                        (categories && categories[tx.category]) ||
                        (CATEGORIES && CATEGORIES[tx.category]) ||
                        (CATEGORIES && CATEGORIES['Food']) || {
                          code: tx.category || 'Food',
                          label: tx.category || 'Ăn uống',
                          iconName: 'Tag',
                          color: '#2563EB',
                          bgColor: '#DBEAFE',
                          description: ''
                        };

                      const catLabel = categoryData?.label || tx.category || 'Giao dịch';
                      const catBgColor = categoryData?.bgColor || '#DBEAFE';
                      const catColor = categoryData?.color || '#2563EB';

                      const isReceivable = tx.type === 'receivable';
                      const isPayable = tx.type === 'payable';
                      const isIncome = tx.type === 'income';

                      return (
                        <div
                          key={tx.id}
                          className="bg-gray-50 rounded-xl p-2.5 sm:p-3 border border-gray-200 shadow-2xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className="text-[11px] font-bold px-2 py-0.5 rounded-md truncate max-w-[140px]"
                              style={{ backgroundColor: catBgColor, color: catColor }}
                            >
                              {catLabel}
                            </span>
                            <span
                              className={`text-xs sm:text-sm font-black shrink-0 ${
                                isIncome
                                  ? 'text-emerald-600'
                                  : isReceivable
                                  ? 'text-amber-600'
                                  : isPayable
                                  ? 'text-rose-600'
                                  : 'text-gray-900'
                              }`}
                            >
                              {isIncome ? '+' : isReceivable ? '👤 Thu ' : isPayable ? '💳 Trả ' : '-'}
                              {formatVND(tx.amount)}
                            </span>
                          </div>

                          <p className="text-xs text-gray-700 font-medium">{tx.description}</p>

                          <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                            <span className="text-emerald-600 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Đã lưu vào ví</span>
                            </span>

                            <button
                              onClick={() => onDeleteTransactionFromChat(msg.id, tx.id)}
                              className="text-rose-500 hover:text-rose-700 flex items-center gap-1 text-[11px] font-medium cursor-pointer px-1.5 py-0.5 rounded hover:bg-rose-50 active:bg-rose-100"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
              AI
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none p-3 border border-gray-100 border-l-4 border-l-blue-500 text-xs text-gray-600 flex items-center gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
              <span>Đang xử lý...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Fixed Bottom Input Form */}
      <div className="fixed bottom-[52px] sm:bottom-[58px] left-0 right-0 bg-white border-t border-gray-200 p-2 sm:p-3 z-20 shadow-md">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleMicSimulate}
            className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] p-2 rounded-xl border transition-colors cursor-pointer shrink-0 flex items-center justify-center active:scale-95 ${
              isListening
                ? 'bg-rose-500 text-white border-rose-500 animate-bounce'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200 active:bg-gray-300'
            }`}
            title="Nói giọng nói tiếng Việt"
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex-1 flex items-center bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-2.5 sm:px-3 py-1 gap-1.5 sm:gap-2 shadow-inner focus-within:border-blue-500 focus-within:bg-white transition-colors min-h-[40px] sm:min-h-[44px]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Đang lắng nghe...' : 'Nhập: Cơm trưa 40k, chia bill 5 lít...'}
              disabled={isLoading}
              className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400 font-medium py-1"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-xs shadow-blue-100 shrink-0"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
