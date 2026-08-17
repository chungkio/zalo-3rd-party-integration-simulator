import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { zaloTokenManager } from './services/zaloTokenManager.js';
import { aiEngine } from './services/aiEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory Log Store & SSE Clients
const logs = [];
const sseClients = [];

function addLog(type, title, details) {
  const logItem = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
    isoTime: new Date().toISOString(),
    type, // 'WEBHOOK_RECEIVED', 'QUEUE_ENQUEUED', 'AI_ANALYSIS', 'CRM_LOOKUP', 'ZALO_SEND_API', 'TOKEN_REFRESH'
    title,
    details
  };

  logs.unshift(logItem);
  if (logs.length > 100) logs.pop();

  // Stream to SSE clients
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${JSON.stringify(logItem)}\n\n`);
    } catch (e) {
      // client disconnected
    }
  });

  return logItem;
}

// -------------------------------------------------------------
// 1. Server-Sent Events (SSE) for Realtime Visual Inspector
// -------------------------------------------------------------
app.get('/api/logs/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (res.flushHeaders) res.flushHeaders();

  const clientId = Date.now();
  sseClients.push({ id: clientId, res });

  req.on('close', () => {
    const idx = sseClients.findIndex(c => c.id === clientId);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

app.get('/api/logs', (req, res) => {
  res.json({ success: true, logs });
});

// -------------------------------------------------------------
// 2. Zalo OAuth Token Management API
// -------------------------------------------------------------
app.get('/api/token/status', (req, res) => {
  res.json({ success: true, tokenState: zaloTokenManager.getTokenState() });
});

app.post('/api/token/refresh', async (req, res) => {
  const result = await zaloTokenManager.refreshToken();
  addLog('TOKEN_REFRESH', 'Zalo OAuth Token Refresh', result);
  res.json(result);
});

// -------------------------------------------------------------
// 3. Webhook Receiver (Zalo OA sends user message events here)
// -------------------------------------------------------------
app.post('/api/webhook/zalo', async (req, res) => {
  const payload = req.body;

  // Log 1: Webhook HTTP Request Received
  addLog('WEBHOOK_RECEIVED', 'Zalo Webhook Received (POST 200 OK)', {
    event_name: payload.event_name || 'user_send_text',
    app_id: payload.app_id || zaloTokenManager.config.appId,
    sender: payload.sender || { id: 'user_zalo_123' },
    message: payload.message || { text: 'N/A' },
    timestamp: payload.timestamp || Date.now(),
    headers: req.headers
  });

  // MUST respond 200 OK immediately to Zalo (< 2-3 seconds)
  res.status(200).json({ error: 0, message: "Success" });

  // Log 2: Async Queueing
  addLog('QUEUE_ENQUEUED', 'Async Message Queue Enqueued', {
    queueName: 'zalo_message_processor_queue',
    status: 'ENQUEUED',
    retryPolicy: '3 retries, exponential backoff',
    payload
  });

  // Simulate Async Processing Pipeline
  setTimeout(async () => {
    const userMsg = payload.message || { text: '' };
    const userId = (payload.sender && payload.sender.id) || 'user_zalo_123';

    // Log 3: AI & CRM Engine Processing
    const analysis = await aiEngine.processIncomingMessage(userMsg, userId);
    addLog('AI_ANALYSIS', `AI Intent: [${analysis.intent}] (${(analysis.confidence * 100).toFixed(0)}%)`, {
      originalMessage: userMsg.text,
      intent: analysis.intent,
      sentiment: analysis.sentiment,
      confidence: analysis.confidence,
      entitiesExtracted: analysis.entities,
      actionTaken: analysis.actionTaken
    });

    // Log 4: Outbound Zalo Send API Call (OpenAPI v3.0 Spec)
    addLog('ZALO_SEND_API', 'Calling Zalo OpenAPI v3.0 (/v3.0/oa/message/cs)', {
      endpoint: 'https://openapi.zalo.me/v3.0/oa/message/cs',
      apiVersion: 'v3.0',
      accessToken: zaloTokenManager.tokenState.accessToken.substring(0, 20) + '...',
      payload: analysis.zaloPayload
    });

  }, 400); // 400ms delay to simulate async worker queue processing
});

// -------------------------------------------------------------
// 4. Simulator Endpoint: User sends message / submits form from Phone Simulator
// -------------------------------------------------------------
app.post('/api/simulate/send-user-msg', async (req, res) => {
  const { text, userId = 'user_zalo_123', formData = null } = req.body;

  const mockWebhookPayload = {
    event_name: formData ? 'user_submit_form' : 'user_send_text',
    app_id: zaloTokenManager.config.appId,
    sender: { id: userId },
    recipient: { id: zaloTokenManager.config.oaId },
    message: {
      msg_id: 'msg_' + Date.now(),
      text: text || (formData ? `Submit Form: ${formData.name} - ${formData.phone}` : '')
    },
    formData: formData || null,
    timestamp: Date.now()
  };

  // Run through pipeline directly for simulator response return
  const userMsg = { text: text || '', formData };
  const analysis = await aiEngine.processIncomingMessage(userMsg, userId, formData);

  // Trigger logs
  addLog('WEBHOOK_RECEIVED', formData ? 'Zalo Form Submission Received (POST 200 OK)' : 'Zalo Webhook Received (POST 200 OK)', mockWebhookPayload);
  addLog('QUEUE_ENQUEUED', 'Async Message Queue Enqueued', { queue: 'zalo_message_processor_queue', status: 'ENQUEUED' });
  addLog('AI_ANALYSIS', `AI Intent: [${analysis.intent}] (${(analysis.confidence * 100).toFixed(0)}%)`, analysis);
  addLog('ZALO_SEND_API', 'Outbound Zalo OpenAPI Response Payload', analysis.zaloPayload);

  res.json({
    success: true,
    webhookReceived: true,
    analysis,
    replyPayload: analysis.zaloPayload
  });
});

// -------------------------------------------------------------
// 5. Config Endpoint
// -------------------------------------------------------------
app.get('/api/config', (req, res) => {
  res.json({ success: true, config: zaloTokenManager.config });
});

app.post('/api/config', (req, res) => {
  const updated = zaloTokenManager.updateConfig(req.body);
  addLog('CONFIG_UPDATED', 'Cấu hình Zalo OA App & Mode đã được cập nhật', updated);
  res.json({ success: true, config: updated });
});

// -------------------------------------------------------------
// 6. Serve Production Frontend Build from dist/ folder
// -------------------------------------------------------------
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
