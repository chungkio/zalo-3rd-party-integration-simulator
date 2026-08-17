import React, { useState, useEffect } from 'react';
import { Key, RefreshCw, ShieldCheck, Check, Info, Server, Copy, ExternalLink, Code2, Lock, Zap, Cloud } from 'lucide-react';

export default function TokenAndConfigModal() {
  const [tokenState, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [activeGuideTab, setActiveGuideTab] = useState('model'); // 'model', 'step1', 'step2', 'step3', 'step4', 'code'

  const [formData, setFormData] = useState({
    appId: '',
    appSecret: '',
    oaId: '',
    zcaId: '',
    mode: 'mock'
  });

  const fetchTokenStatus = async () => {
    try {
      const res = await fetch('/api/token/status');
      const data = await res.json();
      if (data.success) {
        setTokenState(data.tokenState);
        setFormData({
          appId: data.tokenState.config.appId,
          appSecret: data.tokenState.config.appSecret,
          oaId: data.tokenState.config.oaId,
          zcaId: data.tokenState.config.zcaId || 'zca_cloud_account_9981',
          mode: data.tokenState.config.mode
        });
      }
    } catch (err) {
      console.error('Failed to fetch token status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenStatus();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/token/refresh', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchTokenStatus();
      }
    } catch (err) {
      console.error('Refresh token error', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        await fetchTokenStatus();
      }
    } catch (err) {
      console.error('Save config error', err);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => {
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
          })
          .catch(err => {
            console.warn('Clipboard write error', err);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
          });
      }
    } catch (e) {
      console.warn('Clipboard API not available', e);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl glass-panel h-[740px] flex flex-col overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-slate-100">Cấu Hình & Hướng Dẫn Tích Hợp Zalo OpenAPI v3.0 (Chuẩn 2026)</h2>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-mono font-bold flex items-center gap-1">
          <Zap className="w-3 h-3 text-emerald-400" /> Zalo OpenAPI v3.0 & OAuth v4 PKCE
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
          Đang tải trạng thái Token...
        </div>
      ) : (
        <div className="space-y-5 mt-4">
          
          {/* Token Expiration Status Card */}
          <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-950 border border-blue-500/30 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-blue-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  OAuth v4 Access Token (v3.0): <span className="text-emerald-300 font-bold">{tokenState?.hoursRemaining} giờ</span> (Hạn 25h)
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Lần refreshed gần nhất: {tokenState?.lastRefreshed ? new Date(tokenState.lastRefreshed).toLocaleString('vi-VN') : 'Vừa cập nhật'} ({tokenState?.refreshCount || 0} lần)
                </div>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Làm Mới OAuth v4 Token
              </button>
            </div>

            {/* Access Token String Box */}
            <div className="mt-3 pt-3 border-t border-blue-500/20 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400 font-mono text-[10px]">CURRENT ACCESS TOKEN (POST /v3.0/oa/message/cs):</span>
                <button
                  onClick={() => copyToClipboard(tokenState?.accessToken, 'accessToken')}
                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                >
                  {copiedField === 'accessToken' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedField === 'accessToken' ? 'Đã copy' : 'Copy Token'}
                </button>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-slate-300 truncate">
                {tokenState?.accessToken}
              </div>
            </div>
          </div>

          {/* Form Config Credentials */}
          <form onSubmit={handleSaveConfig} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" /> Cấu Hình Zalo Developers & Cloud Account (ZCA)
            </h3>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Zalo App ID</label>
                <input
                  type="text"
                  value={formData.appId}
                  onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="App ID từ Zalo Dev"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Zalo OA ID</label>
                <input
                  type="text"
                  value={formData.oaId}
                  onChange={(e) => setFormData({ ...formData, oaId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Official Account ID"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Zalo Cloud ID (ZCA)</label>
                <input
                  type="text"
                  value={formData.zcaId}
                  onChange={(e) => setFormData({ ...formData, zcaId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Mã Zalo Cloud Account"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Zalo App Secret Key</label>
              <input
                type="password"
                value={formData.appSecret}
                onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono text-xs"
                placeholder="Secret Key cấp từ Zalo Developers"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Chế độ vận hành (Operational Mode)</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 text-xs font-semibold"
              >
                <option value="mock">⚡ Mô Phỏng Offline (Mock Mode - Test thử không cần Zalo thật)</option>
                <option value="production">🚀 Kết Nối Thực Tế (Production Zalo OA OpenAPI v3.0)</option>
              </select>
            </div>

            <div className="pt-1 flex justify-between items-center">
              {savedSuccess ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Đã lưu cấu hình v3.0 thành công!
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">Bấm lưu để cập nhật Zalo Keys & ZCA</span>
              )}

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-2 rounded-lg font-bold transition-all shadow-md"
              >
                Lưu Cấu Hình
              </button>
            </div>
          </form>

          {/* Detailed Step-by-Step Zalo Developer Integration Guide (Latest Specs) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            
            {/* Guide Title Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" /> QUY TRÌNH CHUẨN MỚI NHẤT CHÍNH THỨC TỪ ZALO DEVELOPERS HUB
              </h3>
              <a
                href="https://developers.zalo.me"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold underline"
              >
                developers.zalo.me <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Guide Step Tabs */}
            <div className="flex gap-1 text-xs overflow-x-auto pb-1">
              <button
                onClick={() => setActiveGuideTab('model')}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  activeGuideTab === 'model' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🏗️ 1. Mô Hình 3 Thành Phần
              </button>
              <button
                onClick={() => setActiveGuideTab('step1')}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  activeGuideTab === 'step1' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🔑 2. OAuth v4 & PKCE
              </button>
              <button
                onClick={() => setActiveGuideTab('step2')}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  activeGuideTab === 'step2' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                ⚡ 3. Webhook Rules (HTTPS 2s)
              </button>
              <button
                onClick={() => setActiveGuideTab('step3')}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  activeGuideTab === 'step3' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                🚀 4. OpenAPI v3.0 & ZBS
              </button>
              <button
                onClick={() => setActiveGuideTab('code')}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                  activeGuideTab === 'code' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                💻 Code HMAC Verify
              </button>
            </div>

            {/* Guide Step Tab Contents */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs leading-relaxed space-y-2 text-slate-300">
              
              {/* MODEL 3 COMPONENTS */}
              {activeGuideTab === 'model' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-400">🏗️ MÔ HÌNH VẬN HÀNH 3 THÀNH PHẦN CHUẨN ZALO DEVELOPERS HUB</h4>
                  <p className="text-[11px] text-slate-300">Để kết nối hệ thống Bên thứ 3 với Zalo, doanh nghiệp cần khởi tạo 3 thành phần chính:</p>
                  <div className="grid grid-cols-3 gap-2 mt-1 text-[11px]">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="font-bold text-blue-400 mb-1">1. Zalo Official Account (OA)</div>
                      <div className="text-slate-400 text-[10px]">Kênh nhắn tin đại diện chính thức của doanh nghiệp tới người dùng Zalo.</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="font-bold text-purple-400 mb-1">2. Zalo App (Developer)</div>
                      <div className="text-slate-400 text-[10px]">Ứng dụng quản lý permissions, nhận Webhook và cấp Access Token API.</div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="font-bold text-amber-400 mb-1">3. Zalo Cloud Account (ZCA)</div>
                      <div className="text-slate-400 text-[10px]">Tài khoản quản lý chi phí nạp tiền & liên kết ủy quyền giữa Zalo OA và Zalo App.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: OAUTH V4 & PKCE */}
              {activeGuideTab === 'step1' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-blue-300">🔑 XÁC THỰC OAUTH V4 VỚI CƠ CHẾ PKCE (CODE CHALLENGE / VERIFIER)</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                    <li>Admin OA truy cập URL cấp quyền: <code className="text-blue-300">https://oauth.zaloapp.com/v4/oa/permission</code> với <code className="text-amber-300">code_challenge</code>.</li>
                    <li>Đăng nhập và cấp quyền $\rightarrow$ Zalo trả về <code className="text-emerald-300">authorization_code</code>.</li>
                    <li>Bên thứ 3 gọi API lấy cặp Token qua endpoint: <code className="text-blue-300">https://oauth.zaloapp.com/v4/oa/access_token</code> kèm <code className="text-amber-300">code_verifier</code>.</li>
                    <li>Thời hạn cặp Token theo chuẩn Zalo:
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 mt-1 space-y-0.5 text-[11px] font-mono">
                        <div>• <strong className="text-emerald-400">access_token:</strong> Có hiệu lực trong <strong>25 giờ</strong>.</div>
                        <div>• <strong className="text-amber-400">refresh_token:</strong> Có hiệu lực trong <strong>3 tháng</strong>. Dùng để làm mới access_token.</div>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* STEP 2: WEBHOOK RULES */}
              {activeGuideTab === 'step2' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-blue-300">⚡ CẤU HÌNH WEBHOOK (HTTPS CHUẨN & PHẢN HỒI LẬP TỨC &lt; 2 GIÂY)</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px]">
                    <li><strong>Yêu cầu HTTPS:</strong> Webhook URL của Bên thứ 3 bắt buộc dùng giao thức bảo mật <strong>HTTPS</strong>.</li>
                    <li><strong>Phản hồi HTTP 200 OK &lt; 2 giây:</strong> Zalo yêu cầu Server của bạn trả về <code className="text-emerald-300">HTTP 200 OK</code> trong vòng <strong>2 giây</strong>. Nếu quá 2 giây Zalo sẽ xem như lỗi và kích hoạt cơ chế Retry gửi lại.</li>
                    <li><strong>Cấu hình Webhook URL trong Zalo Developers Dashboard:</strong>
                      <div className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-emerald-300 my-1">
                        <span>https://your-domain.com/api/webhook/zalo</span>
                        <button
                          onClick={() => copyToClipboard('https://your-domain.com/api/webhook/zalo', 'webhookUrl')}
                          className="text-[10px] text-blue-400 hover:text-blue-300"
                        >
                          {copiedField === 'webhookUrl' ? 'Đã copy' : 'Copy'}
                        </button>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* STEP 3: OPENAPI V3.0 & ZBS */}
              {activeGuideTab === 'step3' && (
                <div className="space-y-2">
                  <h4 className="font-bold text-blue-300">🚀 SỬ DỤNG ZALO OPENAPI V3.0 & CHUẨN ZBS TEMPLATE MESSAGE</h4>
                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <p>• <strong>Endpoint chuẩn OpenAPI v3.0:</strong> <code className="text-blue-300">https://openapi.zalo.me/v3.0/oa/...</code></p>
                    <p>• <strong>Gửi tin Tư vấn (Consultation Message):</strong> POST tới <code className="text-emerald-300">https://openapi.zalo.me/v3.0/oa/message/cs</code> (miễn phí trong cửa sổ 48h tương tác).</p>
                    <p>• <strong>Chuẩn ZBS Template Message:</strong> Từ ngày 01/01/2026, Zalo ra mắt chuẩn ZBS Template Message thay thế cho toàn bộ tin UID Giao dịch cũ (POST tới <code className="text-amber-300">https://openapi.zalo.me/v3.0/oa/message/transaction</code>).</p>
                  </div>
                </div>
              )}

              {/* CODE VERIFY HMAC */}
              {activeGuideTab === 'code' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-purple-300">💻 CODE MẪU XÁC THỰC HMAC-SHA256 SIGNATURE (NODE.JS)</h4>
                    <button
                      onClick={() => copyToClipboard(`const crypto = require('crypto');

function verifyZaloSignature(req, appSecret) {
  const zaloSignature = req.headers['x-zalo-signature'];
  const timestamp = req.body.timestamp;
  const appId = req.body.app_id;
  const data = appId + JSON.stringify(req.body) + timestamp + appSecret;
  const calculatedSignature = crypto.createHash('sha256').update(data).digest('hex');
  return zaloSignature === calculatedSignature;
}`, 'codeSnippet')}
                      className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                    >
                      {copiedField === 'codeSnippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedField === 'codeSnippet' ? 'Đã copy' : 'Copy Code'}
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] font-mono text-purple-200 overflow-x-auto leading-relaxed">
{`const crypto = require('crypto');

// Middleware xác thực Webhook request đến từ Zalo
function verifyZaloSignature(req, res, next) {
  const zaloSignature = req.headers['x-zalo-signature'];
  const timestamp = req.body.timestamp;
  const appId = req.body.app_id;
  const appSecret = process.env.ZALO_APP_SECRET;

  // Công thức Hash mã hóa Zalo Security Standard
  const rawData = appId + JSON.stringify(req.body) + timestamp + appSecret;
  const calculatedSignature = crypto.createHash('sha256').update(rawData).digest('hex');

  if (zaloSignature !== calculatedSignature) {
    return res.status(401).json({ error: -1, message: "Invalid Signature" });
  }

  next(); // Signature hợp lệ -> Tiến hành xử lý Webhook
}`}
                  </pre>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
