import React, { useState } from 'react';
import { Cpu, ArrowRight, CheckCircle2, Clock, Terminal, Copy, ChevronDown, ChevronRight, Zap, Database, MessageSquare } from 'lucide-react';

export default function PipelineInspector({ logs = [], onClearLogs }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const safeLogs = Array.isArray(logs) ? logs : [];

  const filteredLogs = safeLogs.filter(log => {
    if (!log) return false;
    if (filterType === 'ALL') return true;
    return log.type === filterType;
  });

  const getLogBadge = (type) => {
    switch (type) {
      case 'WEBHOOK_RECEIVED':
        return { label: '1. Webhook Inbound', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'QUEUE_ENQUEUED':
        return { label: '2. Async Queue', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'AI_ANALYSIS':
        return { label: '3. AI Engine & CRM', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'ZALO_SEND_API':
        return { label: '4. Zalo OpenAPI Out', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'TOKEN_REFRESH':
        return { label: 'OAuth Token Refresh', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      default:
        return { label: type || 'LOG', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[740px] glass-panel">
      
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100">Live Pipeline Inspector (3rd-Party Backend)</h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Realtime SSE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Soi luồng nhận Webhook $\rightarrow$ Hàng đợi Async $\rightarrow$ AI / CRM Engine $\rightarrow$ Trả lời Zalo API</p>
        </div>

        <button
          onClick={onClearLogs}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
        >
          Xóa lịch sử log
        </button>
      </div>

      {/* Pipeline Flow Diagram Bar */}
      <div className="grid grid-cols-4 gap-2 my-4">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-indigo-500/30 text-center">
          <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Bước 1</div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">Zalo Webhook</div>
          <div className="text-[10px] text-slate-400">Receive & HTTP 200</div>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-amber-500/30 text-center">
          <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Bước 2</div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">Task Queue</div>
          <div className="text-[10px] text-slate-400">Enqueue Async Task</div>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-purple-500/30 text-center">
          <div className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">Bước 3</div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">AI & CRM Engine</div>
          <div className="text-[10px] text-slate-400">Intent & Data Lookup</div>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30 text-center">
          <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Bước 4</div>
          <div className="text-xs font-bold text-slate-200 mt-0.5">Zalo Send API</div>
          <div className="text-[10px] text-slate-400">POST /v2.0/oa/message</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
        {['ALL', 'WEBHOOK_RECEIVED', 'QUEUE_ENQUEUED', 'AI_ANALYSIS', 'ZALO_SEND_API'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1 rounded-lg border transition-all ${
              filterType === tab
                ? 'bg-blue-600/30 border-blue-500 text-blue-200 font-semibold'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {tab === 'ALL' ? 'Tất cả Logs' : getLogBadge(tab).label}
          </button>
        ))}
      </div>

      {/* Logs Scroll List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <Terminal className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
            <p>Chưa có dữ liệu sự kiện. Hãy gửi tin nhắn từ Phone Simulator bên trái!</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const badge = getLogBadge(log.type);
            const isExpanded = expandedId === log.id;

            return (
              <div
                key={log.id}
                className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden transition-colors hover:border-slate-700"
              >
                {/* Log Item Bar */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-3 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{log.title}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="font-mono text-[11px] text-slate-500">{log.timestamp}</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details JSON */}
                {isExpanded && (
                  <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-xs font-mono">
                    <div className="flex justify-between items-center mb-2 text-slate-400 text-[11px]">
                      <span>EVENT PAYLOAD DETAILS (JSON):</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(JSON.stringify(log.details, null, 2));
                        }}
                        className="flex items-center gap-1 hover:text-blue-400 transition-colors"
                      >
                        <Copy className="w-3 h-3" /> Copy JSON
                      </button>
                    </div>
                    <pre className="bg-slate-900/90 text-slate-300 p-3 rounded-lg overflow-x-auto text-[11px] leading-relaxed border border-slate-800/60 max-h-60">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
