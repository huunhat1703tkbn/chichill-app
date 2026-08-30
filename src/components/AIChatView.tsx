import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, CheckCircle2, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
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
  '🍜 Cơm trưa VP 45k, cafe Highland 35k',
  '🛍️ Đang tính mua đồ 2 triệu, có nên không?',
  '💡 Gợi ý cách tiết kiệm 3 củ tháng này',
  '👥 Nam mượn 200k tiền cơm trưa chia bill',
];

export const AIChatView: React.FC<AIChatViewProps> = ({
  messages,
  categories = CATEGORIES,
  onSendMessage,
  isLoading,
  onDeleteTransactionFromChat,
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

  const recognitionRef = useRef<any>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handleToggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setInput('Cơm trưa văn phòng 45k, cafe Highland 35k và đổ xăng 50k');
      }, 1500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Vui lòng cấp quyền Micro trên trình duyệt để ghi âm.');
        } else if (event.error !== 'no-speech') {
          setSpeechError('Không nhận diện được âm thanh, vui lòng thử lại.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition start failed:', err);
      setIsListening(false);
    }
  };

  const formatVND = (val: number) => {
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-68px)] sm:h-[calc(100vh-76px)] max-w-2xl mx-auto relative select-none">
      {/* Top Suggestions Bar */}
      <div className="px-3 py-2 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none touch-scroll py-0.5">
          <span className="text-xs font-bold text-emerald-700 whitespace-nowrap flex items-center gap-1 shrink-0 px-2 py-1 bg-emerald-50 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px]">Gợi ý nhanh</span>
          </span>
          <div className="flex gap-1.5 shrink-0">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 border border-slate-200/60 hover:border-emerald-300 rounded-full text-xs font-semibold text-slate-700 hover:text-emerald-800 whitespace-nowrap cursor-pointer transition-all active:scale-95 shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 touch-scroll min-h-0">
        {messages.length === 0 && (
          <div className="text-center my-6 fin-card p-6 sm:p-8 max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl p-1 bg-gradient-to-br from-emerald-100 to-teal-50 shadow-md shadow-emerald-600/10 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="ChiChill AI"
                className="w-14 h-14 rounded-2xl object-cover"
                onError={(e) => {
                  (e.currentTarget as any).outerHTML = '<div class="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-lg">AI</div>';
                }}
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Chi có kế hoạch · Chill không âu lo ✨
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                Trợ lý tài chính thế hệ mới: Nhập câu tự nhiên bằng tiếng Việt hoặc tiếng lóng tài chính để ghi chép và nhận phân tích thông minh.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/60 font-medium">
              <div className="text-slate-700 flex items-center gap-1.5">
                <span>📊</span> <span>Đánh giá tài chính</span>
              </div>
              <div className="text-slate-700 flex items-center gap-1.5">
                <span>🛍️</span> <span>Tư vấn mua sắm</span>
              </div>
              <div className="text-slate-700 flex items-center gap-1.5">
                <span>👥</span> <span>Chia tiền & công nợ</span>
              </div>
              <div className="text-slate-700 flex items-center gap-1.5">
                <span>⚡</span> <span>Ghi nhận tức thì</span>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
          >
            {/* Sender Avatar */}
            {msg.sender === 'user' ? (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs shrink-0 order-2 shadow-xs">
                Tôi
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full p-0.5 bg-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src="/logo.png"
                  alt="AI"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as any).outerHTML = '<div class="w-full h-full bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-[10px]">AI</div>';
                  }}
                />
              </div>
            )}

            {/* Bubble Content */}
            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} max-w-[88%] sm:max-w-[82%]`}>
              <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">{msg.timestamp}</span>

              <div
                className={`rounded-[22px] p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'emerald-gradient text-white rounded-tr-sm shadow-md shadow-emerald-950/10 font-medium'
                    : 'fin-card text-slate-800 rounded-tl-sm shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Digital Receipt Action Cards if parsed */}
                {msg.sender === 'ai' && msg.parsedTransactions && msg.parsedTransactions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-500 uppercase tracking-wider text-[10px]">
                        Phiếu giao dịch tự động
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
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
                          color: '#059669',
                          bgColor: '#ECFDF5',
                          description: ''
                        };

                      const catLabel = categoryData?.label || tx.category || 'Giao dịch';
                      const isReceivable = tx.type === 'receivable';
                      const isPayable = tx.type === 'payable';
                      const isIncome = tx.type === 'income';

                      return (
                        <div
                          key={tx.id}
                          className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/70 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg truncate max-w-[140px]"
                              style={{
                                backgroundColor: categoryData?.bgColor || '#ECFDF5',
                                color: categoryData?.color || '#059669'
                              }}
                            >
                              {catLabel}
                            </span>
                            <span
                              className={`text-xs sm:text-sm font-extrabold shrink-0 ${
                                isIncome
                                  ? 'text-emerald-600'
                                  : isReceivable
                                  ? 'text-amber-600'
                                  : isPayable
                                  ? 'text-rose-600'
                                  : 'text-slate-900'
                              }`}
                            >
                              {isIncome ? '+' : isReceivable ? '👤 Cho vay ' : isPayable ? '💳 Nợ ' : '-'}
                              {formatVND(tx.amount)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 font-bold">{tx.description}</p>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                            <span className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Đã ghi vào sổ</span>
                            </span>

                            <button
                              onClick={() => onDeleteTransactionFromChat(msg.id, tx.id)}
                              className="text-rose-500 hover:text-rose-700 flex items-center gap-1 text-[11px] font-semibold cursor-pointer px-2 py-0.5 rounded-lg hover:bg-rose-50 active:bg-rose-100 transition-colors"
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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
              AI
            </div>
            <div className="fin-card rounded-2xl rounded-tl-sm p-3 text-xs text-slate-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
              <span className="font-semibold">ChiChill đang phân tích...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar Area - Anchored neatly above the bottom navigation dock */}
      <div className="shrink-0 px-3 pt-2 pb-20 sm:pb-22 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent">
        {speechError && (
          <div className="max-w-md sm:max-w-lg mx-auto mb-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
            <span>{speechError}</span>
            <button
              type="button"
              onClick={() => setSpeechError(null)}
              className="text-rose-400 hover:text-rose-600 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
        {isListening && (
          <div className="max-w-md sm:max-w-lg mx-auto mb-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-pulse shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            <span>Đang lắng nghe giọng nói... Hãy nói các khoản chi tiêu của bạn!</span>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="max-w-md sm:max-w-lg mx-auto bg-white border border-slate-200/90 rounded-[28px] p-1.5 flex items-center gap-1.5 shadow-lg shadow-slate-900/5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
        >
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all cursor-pointer shrink-0 flex items-center justify-center active:scale-95 ${
              isListening
                ? 'bg-rose-500 text-white animate-bounce shadow-md shadow-rose-500/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title={isListening ? 'Bấm để dừng ghi âm' : 'Nói giọng nói để ghi chi tiêu'}
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? 'Đang lắng nghe...' : 'Nhập: Cơm trưa 45k, cafe 30k...'}
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400 font-semibold px-2 py-1.5"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm shadow-emerald-600/30 shrink-0"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};
