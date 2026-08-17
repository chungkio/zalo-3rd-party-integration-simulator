import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCheck, Sparkles, User, FileText, MapPin, Ticket, ShieldCheck, X, Check, Phone, PlusCircle } from 'lucide-react';

export default function ZaloPhoneSimulator({ onSendMessage, onSendForm, chatHistory, isProcessing }) {
  const [inputText, setInputText] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Nguyễn Văn Anh',
    phone: '0908 123 456',
    address: '123 Đường Lê Duẩn, Quận 1, TP. Hồ Chí Minh',
    notes: 'Giao giờ hành chính'
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isProcessing]);

  const handleSend = (textToSend = inputText) => {
    if (!textToSend) return;
    
    // Intercept Form Trigger Button
    if (textToSend === 'OPEN_FORM_MODAL' || textToSend.includes('Cung cấp SĐT') || textToSend.includes('Cập nhật SĐT')) {
      setShowFormModal(true);
      return;
    }

    if (!textToSend.trim() || isProcessing) return;
    onSendMessage(textToSend.trim());
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    
    setShowFormModal(false);
    onSendForm(formData);
  };

  const actionButtons = [
    { label: "👤 Lấy info tài khoản", payload: "Lấy thông tin tài khoản", icon: User },
    { label: "✍️ Cung cấp SĐT & Địa chỉ", payload: "OPEN_FORM_MODAL", icon: FileText },
    { label: "📍 Lấy vị trí kho", payload: "Lấy vị trí kho", icon: MapPin },
    { label: "🎟️ Gửi voucher ZALO50K", payload: "Gửi voucher ZALO50K", icon: Ticket }
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Phone Shell */}
      <div className="w-[380px] h-[740px] bg-slate-900 border-[6px] border-slate-700 rounded-[44px] shadow-2xl flex flex-col overflow-hidden relative glass-panel">
        
        {/* Phone Notch & Status Bar */}
        <div className="bg-slate-950 px-6 pt-3 pb-2 flex justify-between items-center text-[11px] text-slate-400 font-medium select-none z-10">
          <span>09:41</span>
          <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto -mt-1 flex items-center justify-center">
            <div className="w-3 h-3 bg-slate-950 rounded-full"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex">
              <div className="bg-slate-300 h-full w-3/4 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Zalo OA Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-3 flex items-center justify-between text-white shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden font-bold text-lg">
                <span className="text-white">Z</span>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-400 absolute -bottom-0.5 -right-0.5 bg-blue-800 rounded-full fill-blue-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm leading-tight">Doanh Nghiệp Official</h3>
                <span className="bg-blue-800/80 text-[10px] px-1.5 py-0.5 rounded text-blue-200 font-medium border border-blue-400/30">Tích Hợp OA</span>
              </div>
              <p className="text-[11px] text-blue-100/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                Bên Thứ 3 Trả Lời Tự Động (AI)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFormModal(true)}
            className="bg-white/20 hover:bg-white/30 text-white text-[11px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 border border-white/30 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Gửi Info
          </button>
        </div>

        {/* Interactive Action Menu Bar (Top Bar inside Chat) */}
        <div className="bg-slate-900/90 border-b border-slate-800/80 px-2 py-2 overflow-x-auto whitespace-nowrap flex gap-1.5 z-10 no-scrollbar">
          {actionButtons.map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(btn.payload)}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-blue-900/50 text-blue-200 border border-blue-500/30 text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all active:scale-95 shadow-sm"
              >
                <Icon className="w-3 h-3 text-blue-400" />
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Chat Message Window */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/80">
          
          {/* Welcome Info Badge */}
          <div className="text-center my-1">
            <span className="inline-block bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[10px] px-3 py-1 rounded-full">
              🔒 Tương tác với Nút Chức Năng để truyền dữ liệu cho API
            </span>
          </div>

          {chatHistory.map((msg, index) => {
            const isUser = msg.sender === 'user';
            
            return (
              <div key={index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-slide-up`}>
                
                {/* Text Bubble */}
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs font-normal leading-relaxed whitespace-pre-wrap ${
                  isUser 
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                    : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}

                  {/* Render Zalo Template Card Buttons if exists */}
                  {msg.payload?.message?.attachment?.payload?.elements && (
                    <div className="mt-3 space-y-2 border-t border-slate-700/60 pt-2.5">
                      {msg.payload.message.attachment.payload.elements.map((el, idx) => (
                        <div key={idx} className="bg-slate-900/90 rounded-lg p-2 border border-slate-700/60 text-left">
                          {el.image_url && (
                            <img src={el.image_url} alt={el.title} className="w-full h-24 object-cover rounded-md mb-2" />
                          )}
                          <div className="font-semibold text-blue-300 text-[12px]">{el.title}</div>
                          {el.subtitle && <div className="text-[11px] text-slate-400 mt-0.5">{el.subtitle}</div>}
                          
                          {el.buttons && (
                            <div className="mt-2 space-y-1">
                              {el.buttons.map((btn, bIdx) => (
                                <button
                                  key={bIdx}
                                  onClick={() => handleSend(btn.payload || btn.title)}
                                  className="w-full text-center text-[11px] bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 py-1.5 rounded font-medium border border-blue-500/30 transition-colors flex items-center justify-center gap-1"
                                >
                                  ⚡ {btn.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp & Status */}
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 px-1">
                  <span>{msg.time}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-blue-400" />}
                </div>

                {/* Quick Replies Buttons */}
                {!isUser && msg.payload?.message?.quick_replies && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {msg.payload.message.quick_replies.map((qr, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => handleSend(qr.payload || qr.title)}
                        className="bg-slate-800 hover:bg-blue-900/40 text-blue-300 border border-blue-500/40 text-[11px] px-2.5 py-1 rounded-full font-medium transition-all shadow-sm active:scale-95 flex items-center gap-1"
                      >
                        ⚡ {qr.title}
                      </button>
                    ))}
                  </div>
                )}

              </div>
            );
          })}

          {/* Typing Indicator when AI is analyzing */}
          {isProcessing && (
            <div className="flex items-start gap-2 animate-slide-up">
              <div className="bg-slate-800 border border-slate-700/80 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>Bên thứ 3 đang gọi API & xử lý dữ liệu...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Box */}
        <div className="bg-slate-950 p-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Gõ hoặc bấm nút tương tác..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isProcessing}
            className="w-8 h-8 rounded-full zalo-btn-primary flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zalo Interactive Form Submission Modal (Popup inside phone) */}
        {showFormModal && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 p-4 flex flex-col justify-center animate-slide-up">
            <div className="bg-slate-900 border border-blue-500/40 rounded-2xl p-4 shadow-2xl relative">
              
              <button
                onClick={() => setShowFormModal(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-xs text-slate-100">Zalo Form: Cung Cấp Info Cho API</h3>
              </div>

              <p className="text-[10px] text-slate-400 mb-3">Điền các thông tin cần thiết để gửi trực tiếp tới 3rd-Party Backend API:</p>

              <form onSubmit={handleFormSubmit} className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-300 text-[10px] mb-0.5">Họ và Tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-[10px] mb-0.5">Số điện thoại (API cần thiết)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-[10px] mb-0.5">Địa chỉ giao hàng</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-[10px] mb-0.5">Ghi chú yêu cầu</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 zalo-btn-primary py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" /> Gửi Tới API
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
