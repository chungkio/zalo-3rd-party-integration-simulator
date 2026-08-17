import React, { useState } from 'react';
import { Database, Package, HelpCircle, ShoppingCart, Search } from 'lucide-react';
import { mockOrders, mockProducts, mockFaqs } from '../data/mockCrmDb.js';

export default function CrmKnowledgeBase() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl glass-panel h-[740px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100">3rd-Party CRM & Knowledge Base Data</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Dữ liệu đơn hàng, kho tri thức FAQ & giải pháp sản phẩm mà Bên thứ 3 tra cứu</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'orders' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Đơn hàng CRM ({Object.keys(mockOrders).length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Sản phẩm ({mockProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'faqs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> FAQ Tri thức ({mockFaqs.length})
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        
        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {Object.values(mockOrders).map((order) => (
              <div key={order.orderId} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm font-bold text-blue-400">{order.orderId}</span>
                    <span className="text-xs text-slate-300 ml-2 font-medium">Khách hàng: {order.customerName}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                    {order.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <div><strong className="text-slate-300">Vận chuyển:</strong> {order.carrier}</div>
                  <div><strong className="text-slate-300">Mã vận đơn:</strong> {order.trackingCode}</div>
                  <div><strong className="text-slate-300">Dự kiến giao:</strong> {order.estimatedDelivery}</div>
                  <div><strong className="text-slate-300">Tổng tiền:</strong> {order.totalAmount}</div>
                  <div className="col-span-2"><strong className="text-slate-300">Sản phẩm:</strong> {order.items}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 gap-3">
            {mockProducts.map((p) => (
              <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <img src={p.thumb} alt={p.name} className="w-full h-32 object-cover rounded-lg mb-3 border border-slate-800" />
                  <h3 className="font-bold text-sm text-slate-100">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-emerald-400 font-bold">{p.price}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Mã: {p.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: FAQS */}
        {activeTab === 'faqs' && (
          <div className="space-y-3">
            {mockFaqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">Hỏi</span>
                  {faq.question}
                </div>
                <p className="text-xs text-slate-300 mt-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  💬 {faq.answer}
                </p>
                <div className="flex gap-1.5 mt-2 flex-wrap text-[10px]">
                  <span className="text-slate-500 font-medium self-center">Từ khóa nhận diện:</span>
                  {faq.keywords.map((k, kIdx) => (
                    <span key={kIdx} className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                      #{k}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
