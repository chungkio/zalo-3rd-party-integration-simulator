import React, { useState, useEffect } from 'react';
import { Cpu, Database, Key, ShieldCheck, Sparkles, RefreshCw, MessageSquare, Zap } from 'lucide-react';
import ZaloPhoneSimulator from './components/ZaloPhoneSimulator';
import PipelineInspector from './components/PipelineInspector';
import CrmKnowledgeBase from './components/CrmKnowledgeBase';
import TokenAndConfigModal from './components/TokenAndConfigModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('inspector'); // 'inspector', 'crm', 'config'
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'oa',
      text: "👋 Xin chào! Tôi là Trợ lý AI tích hợp Zalo OA & 3rd-Party Backend.\n\nBạn có thể bấm các **Nút Chức Năng** bên dưới để lấy hoặc cung cấp thông tin cho API:",
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      payload: {
        message: {
          quick_replies: [
            { title: "👤 Lấy thông tin tài khoản", payload: "Lấy thông tin tài khoản" },
            { title: "✍️ Cung cấp SĐT & Địa chỉ", payload: "OPEN_FORM_MODAL" },
            { title: "📦 Tra cứu đơn #8899", payload: "#8899" },
            { title: "📍 Lấy vị trí kho", payload: "Lấy vị trí kho" },
            { title: "🎟️ Dùng voucher ZALO50K", payload: "Gửi voucher ZALO50K" }
          ]
        }
      }
    }
  ]);

  // Connect to SSE Log Stream & Fallback Polling from Express Backend
  useEffect(() => {
    const fetchLogs = () => {
      fetch('/api/logs')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.logs) {
            setLogs(data.logs);
          }
        })
        .catch(err => console.error('Failed to load log history', err));
    };

    fetchLogs();
    const intervalId = setInterval(fetchLogs, 3000);

    let eventSource;
    try {
      eventSource = new EventSource('/api/logs/stream');
      eventSource.onmessage = (event) => {
        try {
          const newLog = JSON.parse(event.data);
          setLogs(prev => [newLog, ...prev]);
        } catch (err) {
          console.error('SSE parse error', err);
        }
      };
    } catch (err) {
      console.warn('SSE not supported, falling back to polling');
    }

    return () => {
      clearInterval(intervalId);
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleSendMessage = async (text) => {
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    // Add user message to chat history immediately
    const userMsg = { sender: 'user', text, time: timeStr };
    setChatHistory(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/simulate/send-user-msg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userId: 'user_zalo_123' })
      });

      const data = await res.json();
      
      if (data.success && data.replyPayload) {
        const replyMessage = data.replyPayload.message;
        const oaMsg = {
          sender: 'oa',
          text: replyMessage.text,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          payload: data.replyPayload
        };
        setChatHistory(prev => [...prev, oaMsg]);
      }
    } catch (err) {
      console.error('Simulation error', err);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'oa',
          text: '❌ Có lỗi xảy ra khi kết nối tới 3rd-Party Backend Webhook Server. Vui lòng kiểm tra lại backend service.',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendForm = async (formData) => {
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    // Add user form submission message to chat history
    const userMsg = {
      sender: 'user',
      text: `✍️ [Cung cấp Info cho API]\n• Họ tên: ${formData.name}\n• SĐT: ${formData.phone}\n• Địa chỉ: ${formData.address}\n• Ghi chú: ${formData.notes || 'Không'}`,
      time: timeStr
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/simulate/send-user-msg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Cung cấp thông tin Zalo Form', userId: 'user_zalo_123', formData })
      });

      const data = await res.json();
      
      if (data.success && data.replyPayload) {
        const replyMessage = data.replyPayload.message;
        const oaMsg = {
          sender: 'oa',
          text: replyMessage.text,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          payload: data.replyPayload
        };
        setChatHistory(prev => [...prev, oaMsg]);
      }
    } catch (err) {
      console.error('Form simulation error', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight text-white">Zalo OA & 3rd-Party Integration</h1>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-blue-500/30">
                  Interactive API Buttons
                </span>
              </div>
              <p className="text-xs text-slate-400">Tương tác Nút Chức Năng: Lấy dữ liệu & Cung cấp thông tin cho 3rd-Party API</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'inspector'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" /> Live Inspector
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'crm'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" /> 3rd-Party CRM Data
            </button>

            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'config'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-4 h-4" /> Zalo Credentials (25h Token)
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Zalo Mobile Simulator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-400" /> Khung Tương Tác Zalo OA
            </span>
            <span className="text-[11px] text-slate-500">Bấm các nút Nhanh để gửi/lấy Info</span>
          </div>

          <ZaloPhoneSimulator
            onSendMessage={handleSendMessage}
            onSendForm={handleSendForm}
            chatHistory={chatHistory}
            isProcessing={isProcessing}
          />
        </div>

        {/* Right Column: Dynamic Panel (7 cols) */}
        <div className="lg:col-span-7">
          {activeTab === 'inspector' && (
            <PipelineInspector logs={logs} onClearLogs={handleClearLogs} />
          )}

          {activeTab === 'crm' && (
            <CrmKnowledgeBase />
          )}

          {activeTab === 'config' && (
            <TokenAndConfigModal />
          )}
        </div>

      </main>

    </div>
  );
}
