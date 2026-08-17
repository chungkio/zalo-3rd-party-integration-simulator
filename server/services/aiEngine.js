/**
 * AI & Business Logic Engine (3rd-Party Backend)
 * Analyzes incoming Zalo messages & Interactive Button events,
 * extracts intents/entities, fetches CRM data, and formats Zalo OA OpenAPI response payloads.
 */

import { mockOrders, mockProducts, mockFaqs, mockCustomerProfile, mockVouchers } from '../../src/data/mockCrmDb.js';

class AIEngine {
  async processIncomingMessage(userMessage, userId = 'user_zalo_123', formData = null) {
    const text = (typeof userMessage === 'string' ? userMessage : (userMessage.text || '')).trim();
    const lowerText = text.toLowerCase();

    const analysisResult = {
      timestamp: new Date().toISOString(),
      originalText: text,
      userId: userId,
      intent: 'UNKNOWN',
      confidence: 0,
      entities: {},
      sentiment: 'NEUTRAL',
      actionTaken: '',
      zaloPayload: null
    };

    // 0. Handle Zalo Form Submission Payload (Cung cấp info cho API)
    if (formData || lowerText.includes('submit_form') || userMessage.isFormSubmit) {
      const data = formData || userMessage.formData || {
        name: "Nguyễn Văn A",
        phone: "0908 123 456",
        address: "123 Lê Duẩn, Q1, TP.HCM",
        notes: "Giao giờ hành chính"
      };

      analysisResult.intent = 'SUBMIT_FORM_DATA_API';
      analysisResult.confidence = 1.0;
      analysisResult.entities = data;
      analysisResult.actionTaken = `Tiếp nhận dữ liệu từ Zalo Form: SĐT ${data.phone}, Tên: ${data.name}. Đã lưu vào CRM Database!`;

      const ticketId = 'TCK-' + Math.floor(100000 + Math.random() * 900000);

      analysisResult.zaloPayload = {
        recipient: { user_id: userId },
        message: {
          text: `✅ **ĐÃ XÁC NHẬN CUNG CẤP THÔNG TIN TỚI API!**\n\n📌 **Mã yêu cầu (Ticket ID):** #${ticketId}\n• **Họ & Tên:** ${data.name}\n• **Số điện thoại:** ${data.phone}\n• **Địa chỉ giao:** ${data.address}\n• **Ghi chú:** ${data.notes || 'Không'}\n\nHệ thống CRM đã ghi nhận thông tin của bạn. Nhân viên CSKH sẽ liên hệ xác nhận trong 15 phút!`,
          attachment: {
            type: "template",
            payload: {
              template_type: "buttons",
              elements: [
                {
                  title: `Ticket #${ticketId} - Đã khởi tạo`,
                  subtitle: `Liên hệ: ${data.phone}`,
                  buttons: [
                    {
                      title: "Xem thông tin tài khoản",
                      type: "oa.query.show",
                      payload: "Lấy thông tin tài khoản"
                    },
                    {
                      title: "Tra cứu đơn hàng",
                      type: "oa.query.show",
                      payload: "Tra cứu đơn #8899"
                    }
                  ]
                }
              ]
            }
          },
          quick_replies: [
            { title: "Lấy thông tin tài khoản", payload: "Lấy thông tin tài khoản" },
            { title: "Gửi mã Voucher ZALO50K", payload: "Gửi voucher ZALO50K" }
          ]
        }
      };

      return analysisResult;
    }

    // 1. Handle "Lấy thông tin tài khoản" (Retrieve User Info API)
    if (lowerText.includes('thông tin tài khoản') || lowerText.includes('profile') || lowerText.includes('xem tài khoản')) {
      analysisResult.intent = 'GET_USER_PROFILE_API';
      analysisResult.confidence = 0.98;
      analysisResult.actionTaken = `API tra cứu hồ sơ khách hàng ${userId} từ CRM thành công`;

      const p = mockCustomerProfile;

      analysisResult.zaloPayload = {
        recipient: { user_id: userId },
        message: {
          text: `👤 **THÔNG TIN TÀI KHOẢN KHÁCH HÀNG (CRM API):**\n\n• **Họ tên:** ${p.name}\n• **Cấp độ:** 🌟 ${p.memberTier}\n• **Điểm tích lũy:** ${p.rewardPoints} điểm\n• **Số điện thoại:** ${p.phone}\n• **Email:** ${p.email}\n• **Địa chỉ mặc định:** ${p.address}\n• **Tổng số đơn hàng:** ${p.totalOrdersCount} đơn (${p.totalSpent})`,
          attachment: {
            type: "template",
            payload: {
              template_type: "buttons",
              elements: [
                {
                  title: `Thẻ Hội Viên: ${p.memberTier}`,
                  subtitle: `Điểm tích lũy: ${p.rewardPoints} PTS`,
                  buttons: [
                    {
                      title: "Cung cấp SĐT & Địa chỉ mới",
                      type: "oa.query.show",
                      payload: "OPEN_FORM_MODAL"
                    },
                    {
                      title: "Đổi điểm quà tặng",
                      type: "oa.open.url",
                      url: "https://zalo.me"
                    }
                  ]
                }
              ]
            }
          },
          quick_replies: [
            { title: "Cập nhật SĐT & Địa chỉ", payload: "OPEN_FORM_MODAL" },
            { title: "Tra cứu đơn hàng #8899", payload: "#8899" }
          ]
        }
      };

      return analysisResult;
    }

    // 2. Handle Voucher Verification (Gửi mã ưu đãi)
    const voucherMatch = text.match(/ZALO50K|VIP2026/i) || (lowerText.includes('voucher') ? ['ZALO50K'] : null);
    if (voucherMatch || lowerText.includes('mã ưu đãi')) {
      const code = voucherMatch ? voucherMatch[0].toUpperCase() : 'ZALO50K';
      analysisResult.intent = 'VERIFY_VOUCHER_API';
      analysisResult.confidence = 0.95;
      
      const v = mockVouchers[code];
      if (v) {
        analysisResult.actionTaken = `API xác thực mã Voucher ${code} thành công: Giảm ${v.discount}`;
        analysisResult.zaloPayload = {
          recipient: { user_id: userId },
          message: {
            text: `🎟️ **MÃ ƯU ĐÃI ĐÃ ĐƯỢC XÁC THỰC!**\n\n• **Mã:** ${v.code}\n• **Giá trị giảm:** ${v.discount}\n• **Đơn tối thiểu:** ${v.minOrder}\n• **Hạn sử dụng:** ${v.expireDate}\n\nBạn có thể áp dụng mã này khi đăng ký gói dịch vụ hoặc đặt hàng!`,
            quick_replies: [
              { title: "Xem bảng giá dịch vụ", payload: "Xem bảng giá dịch vụ" },
              { title: "Điền thông tin đặt hàng", payload: "OPEN_FORM_MODAL" }
            ]
          }
        };
      } else {
        analysisResult.actionTaken = `Không tìm thấy mã Voucher ${code}`;
        analysisResult.zaloPayload = {
          recipient: { user_id: userId },
          message: {
            text: `⚠️ Mã Voucher "${code}" không hợp lệ hoặc đã hết hạn. Thử nhập mã: **ZALO50K** hoặc **VIP2026** nhé!`,
            quick_replies: [
              { title: "Thử mã ZALO50K", payload: "Gửi voucher ZALO50K" },
              { title: "Thử mã VIP2026", payload: "Gửi voucher VIP2026" }
            ]
          }
        };
      }
      return analysisResult;
    }

    // 3. Handle Location & Store Info API
    if (lowerText.includes('vị trí') || lowerText.includes('kho') || lowerText.includes('văn phòng')) {
      analysisResult.intent = 'GET_LOCATION_INFO_API';
      analysisResult.confidence = 0.95;
      analysisResult.actionTaken = 'API truy xuất tọa độ & địa chỉ văn phòng/kho hàng thành công';

      analysisResult.zaloPayload = {
        recipient: { user_id: userId },
        message: {
          text: `📍 **THÔNG TIN VỊ TRÍ KHO & VĂN PHÒNG DOANH NGHIỆP:**\n\n• **Văn phòng chính:** Tòa nhà Innovation, 123 Lê Duẩn, Q.1, TP.HCM\n• **Kho tổng:** 456 Quốc lộ 1A, Bình Tân, TP.HCM\n• **Giờ mở cửa:** 08:00 - 17:30 (Thứ 2 - Thứ 6)\n• **Hotline:** 1900 6868`,
          attachment: {
            type: "template",
            payload: {
              template_type: "buttons",
              elements: [
                {
                  title: "Văn phòng & Kho Tổng TP.HCM",
                  subtitle: "123 Đường Lê Duẩn, Quận 1",
                  buttons: [
                    {
                      title: "Mở Google Maps chỉ đường",
                      type: "oa.open.url",
                      url: "https://maps.google.com"
                    },
                    {
                      title: "Gọi Hotline 1900 6868",
                      type: "oa.open.phone",
                      payload: "19006868"
                    }
                  ]
                }
              ]
            }
          },
          quick_replies: [
            { title: "Lấy thông tin tài khoản", payload: "Lấy thông tin tài khoản" },
            { title: "Điền thông tin liên hệ", payload: "OPEN_FORM_MODAL" }
          ]
        }
      };
      return analysisResult;
    }

    // 4. Detect Sentiment (Negative)
    const angryWords = ['hỏng', 'tệ', 'tồi', 'bực', 'lừa đảo', 'kém', 'chán', 'lỗi', 'khiếu nại'];
    if (angryWords.some(w => lowerText.includes(w))) {
      analysisResult.sentiment = 'NEGATIVE';
      analysisResult.intent = 'HUMAN_HANDOVER_REQUIRED';
      analysisResult.confidence = 0.92;
      analysisResult.actionTaken = 'Kích hoạt kịch bản Chuyển giao Chăm sóc viên (Human Handover) do phát hiện phản hồi tiêu cực.';
      
      analysisResult.zaloPayload = {
        recipient: { user_id: userId },
        message: {
          text: `🔴 Chúng tôi thành thật xin lỗi vì sự bất tiện mà bạn gặp phải!\n\nHệ thống AI đã tự động chuyển phiên hội thoại này tới Chăm sóc viên trực tuyến. Nhân viên hỗ trợ sẽ nhắn lại cho bạn trong ít phút.`,
          quick_replies: [
            { title: "Cung cấp SĐT liên hệ gấp", payload: "OPEN_FORM_MODAL" },
            { title: "Xem chính sách bảo hành", payload: "Chính sách bảo hành" }
          ]
        }
      };
      return analysisResult;
    }

    // 5. Check for Order ID Entity (e.g. #8899, #12345, #9922)
    const orderMatch = text.match(/#\d+/);
    if (orderMatch || lowerText.includes('đơn hàng') || lowerText.includes('tra cứu')) {
      analysisResult.intent = 'ORDER_INQUIRY';
      analysisResult.confidence = 0.95;
      
      const orderId = orderMatch ? orderMatch[0] : '#8899';
      analysisResult.entities.orderId = orderId;

      const orderData = mockOrders[orderId];

      if (orderData) {
        analysisResult.actionTaken = `Tra cứu thành công đơn hàng ${orderId} từ CRM Database`;
        analysisResult.zaloPayload = {
          recipient: { user_id: userId },
          message: {
            text: `📦 Thông tin đơn hàng ${orderData.orderId}:\n• Trạng thái: ${orderData.status}\n• Đơn vị vận chuyển: ${orderData.carrier}\n• Mã vận đơn: ${orderData.trackingCode}\n• Thời gian giao dự kiến: ${orderData.estimatedDelivery}\n• Sản phẩm: ${orderData.items}\n• Tổng tiền: ${orderData.totalAmount}`,
            attachment: {
              type: "template",
              payload: {
                template_type: "buttons",
                elements: [
                  {
                    title: `Đơn hàng ${orderData.orderId}`,
                    subtitle: `Trạng thái: ${orderData.status}`,
                    buttons: [
                      {
                        title: "Xem hành trình chi tiết",
                        type: "oa.open.url",
                        url: `https://ghn.vn/tracking?code=${orderData.trackingCode}`
                      },
                      {
                        title: "Lấy thông tin tài khoản",
                        type: "oa.query.show",
                        payload: "Lấy thông tin tài khoản"
                      }
                    ]
                  }
                ]
              }
            },
            quick_replies: [
              { title: "Lấy thông tin tài khoản", payload: "Lấy thông tin tài khoản" },
              { title: "Cung cấp địa chỉ giao mới", payload: "OPEN_FORM_MODAL" }
            ]
          }
        };
      } else {
        analysisResult.actionTaken = `Không tìm thấy mã đơn ${orderId} trong hệ thống`;
        analysisResult.zaloPayload = {
          recipient: { user_id: userId },
          message: {
            text: `⚠️ Rất tiếc, hệ thống chưa tìm thấy thông tin cho mã đơn hàng "${orderId}". Bạn vui lòng kiểm tra lại mã đơn (Ví dụ: #8899, #12345, #9922) hoặc nhấn nút bên dưới để gặp nhân viên hỗ trợ.`,
            quick_replies: [
              { title: "Thử lại đơn #8899", payload: "#8899" },
              { title: "Cung cấp SĐT liên hệ", payload: "OPEN_FORM_MODAL" }
            ]
          }
        };
      }

      return analysisResult;
    }

    // 6. Product / Pricing Consultation
    if (lowerText.includes('giá') || lowerText.includes('sản phẩm') || lowerText.includes('tư vấn') || lowerText.includes('gói')) {
      analysisResult.intent = 'PRODUCT_CONSULTATION';
      analysisResult.confidence = 0.90;
      analysisResult.actionTaken = 'Lấy danh mục giải pháp & bảng giá từ CRM để gửi dạng List Card';

      analysisResult.zaloPayload = {
        recipient: { user_id: userId },
        message: {
          text: `💡 Xin chào! Dưới đây là các giải pháp Tích hợp Zalo OA & 3rd-Party nổi bật của chúng tôi:`,
          attachment: {
            type: "template",
            payload: {
              template_type: "list",
              elements: mockProducts.map(p => ({
                title: p.name,
                subtitle: `${p.price} — ${p.desc}`,
                image_url: p.thumb,
                default_action: {
                  type: "oa.open.url",
                  url: "https://zalo.me"
                }
              }))
            }
          },
          quick_replies: [
            { title: "Điền form đăng ký tư vấn", payload: "OPEN_FORM_MODAL" },
            { title: "Gửi mã Voucher ZALO50K", payload: "Gửi voucher ZALO50K" }
          ]
        }
      };
      return analysisResult;
    }

    // 7. FAQ Knowledge Base Matching
    for (const faq of mockFaqs) {
      if (faq.keywords.some(k => lowerText.includes(k))) {
        analysisResult.intent = 'FAQ_KNOWLEDGE_MATCH';
        analysisResult.confidence = 0.88;
        analysisResult.actionTaken = `Khớp từ khóa trong Knowledge Base: "${faq.question}"`;

        analysisResult.zaloPayload = {
          recipient: { user_id: userId },
          message: {
            text: `🤖 **Hỏi:** ${faq.question}\n\n💬 **Trả lời:** ${faq.answer}`,
            quick_replies: [
              { title: "Lấy thông tin tài khoản", payload: "Lấy thông tin tài khoản" },
              { title: "Cung cấp SĐT tư vấn", payload: "OPEN_FORM_MODAL" }
            ]
          }
        };
        return analysisResult;
      }
    }

    // 8. Default Fallback Intent
    analysisResult.intent = 'GENERAL_GREETING_FALLBACK';
    analysisResult.confidence = 0.60;
    analysisResult.actionTaken = 'Trả lời mặc định kèm Menu lựa chọn nút chức năng (Action Buttons & Quick Replies)';

    analysisResult.zaloPayload = {
      recipient: { user_id: userId },
      message: {
        text: `👋 Xin chào! Tôi là Trợ lý AI tích hợp Zalo OA & 3rd-Party Backend.\n\nBạn có thể bấm các **Nút Chức Năng** bên dưới để lấy hoặc cung cấp thông tin cho API:`,
        quick_replies: [
          { title: "👤 Lấy thông tin tài khoản", payload: "Lấy thông tin tài khoản" },
          { title: "✍️ Cung cấp SĐT & Địa chỉ", payload: "OPEN_FORM_MODAL" },
          { title: "📦 Tra cứu đơn #8899", payload: "#8899" },
          { title: "📍 Lấy vị trí kho", payload: "Lấy vị trí kho" },
          { title: "🎟️ Dùng voucher ZALO50K", payload: "Gửi voucher ZALO50K" }
        ]
      }
    };

    return analysisResult;
  }
}

export const aiEngine = new AIEngine();
