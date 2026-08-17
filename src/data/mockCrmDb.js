/**
 * Mock CRM & Business Database for 3rd-Party Backend & Frontend Simulator
 * Contains order data, customer profiles, product catalog, FAQ, and Form submissions.
 */

export const mockCustomerProfile = {
  userId: "user_zalo_123",
  name: "Nguyễn Văn Anh",
  phone: "0908 123 456",
  email: "nguyenvananh@example.com",
  memberTier: "Hội Viên VIP Gold",
  rewardPoints: 1250,
  address: "123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
  totalOrdersCount: 8,
  totalSpent: "35.400.000đ"
};

export const mockVouchers = {
  "ZALO50K": { code: "ZALO50K", discount: "50.000đ", minOrder: "200.000đ", status: "Khả dụng", expireDate: "31/12/2026" },
  "VIP2026": { code: "VIP2026", discount: "200.000đ", minOrder: "1.000.000đ", status: "Khả dụng", expireDate: "31/12/2026" }
};

export const mockOrders = {
  "#8899": {
    orderId: "#8899",
    customerName: "Nguyễn Văn Anh",
    status: "Đang giao hàng",
    carrier: "Giao Hàng Nhanh (GHN)",
    trackingCode: "GHN-9988231",
    estimatedDelivery: "Hôm nay, trước 18:00",
    items: "1x Điện thoại iPhone 15 Pro, 1x Ốp lưng MagSafe",
    totalAmount: "28.990.000đ",
    updatedAt: "15 phút trước"
  },
  "#12345": {
    orderId: "#12345",
    customerName: "Trần Thị B",
    status: "Đã hoàn thành",
    carrier: "Viettel Post",
    trackingCode: "VTP-0019284",
    estimatedDelivery: "Đã giao thành công lúc 10:30 sáng nay",
    items: "2x Áo sơ mi nam Oxford Premium",
    totalAmount: "790.000đ",
    updatedAt: "Hôm nay"
  },
  "#9922": {
    orderId: "#9922",
    customerName: "Lê Hoàng C",
    status: "Đang đóng gói tại kho",
    carrier: "Ninja Van",
    trackingCode: "NJV-7711204",
    estimatedDelivery: "Dự kiến giao ngày mai 16/08",
    items: "1x Tai nghe Bluetooth Noise Cancelling",
    totalAmount: "1.450.000đ",
    updatedAt: "1 giờ trước"
  }
};

export const mockProducts = [
  {
    id: "P01",
    name: "Gói Dịch Vụ CRM Automation Standard",
    price: "2.500.000đ / tháng",
    desc: "Tích hợp Zalo OA, tự động hóa nhắn tin CSKH, phân luồng lead tự động.",
    thumb: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=300&h=200&fit=crop"
  },
  {
    id: "P02",
    name: "Gói Dịch Vụ AI Chatbot CSKH Enterprise",
    price: "5.900.000đ / tháng",
    desc: "Tích hợp AI LLM, RAG đọc tài liệu doanh nghiệp, tra cứu kho dữ liệu realtime.",
    thumb: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&h=200&fit=crop"
  }
];

export const mockFaqs = [
  {
    keywords: ["địa chỉ", "văn phòng", "ở đâu", "location", "kho"],
    question: "Địa chỉ văn phòng công ty ở đâu?",
    answer: "Văn phòng chúng tôi tại Tòa nhà Innovation, 123 Đường Lê Duẩn, Quận 1, TP. Hồ Chí Minh. Thời gian làm việc: 8:00 - 17:30 (Thứ 2 đến Thứ 6)."
  },
  {
    keywords: ["đổi trả", "bảo hành", "hoàn tiền", "policy"],
    question: "Chính sách bảo hành và đổi trả như thế nào?",
    answer: "Chúng tôi áp dụng chính sách 1 đổi 1 trong vòng 30 ngày nếu phát hiện lỗi từ nhà sản xuất, và bảo hành chính hãng 12 tháng toàn quốc."
  },
  {
    keywords: ["bảng giá", "chi phí", "giá dịch vụ", "báo giá"],
    question: "Bảng giá dịch vụ tích hợp Zalo với bên thứ 3?",
    answer: "Chi phí phụ thuộc vào quy mô tin nhắn và tính năng AI/CRM tích hợp. Các gói bắt đầu từ 2.500.000đ/tháng. Bạn có thể bấm nút bên dưới để chọn gói xem chi tiết!"
  }
];
