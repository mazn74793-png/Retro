/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { Search, Package, Clock, ShieldCheck, MapPin, CheckCircle2, ChevronRight, AlertCircle, Copy } from 'lucide-react';
import { motion } from 'motion/react';

interface OrderTrackerProps {
  orders: Order[];
  language: 'ar' | 'en';
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orders, language }) => {
  const isAr = language === 'ar';
  const [searchId, setSearchId] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const idToSearch = searchId.trim().toUpperCase();
    if (!idToSearch) return;

    setSearchAttempted(true);
    fetch(`/api/orders/${idToSearch}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => setFoundOrder(data))
      .catch(() => setFoundOrder(null));
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const selectSuggestedOrder = (id: string) => {
    setSearchId(id);
    setSearchAttempted(true);
    fetch(`/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => setFoundOrder(data))
      .catch(() => setFoundOrder(null));
  };

  // Status mapping for visual indicators
  const statusSteps: { status: OrderStatus; label: string; labelAr: string }[] = [
    { status: 'placed', label: 'Placed', labelAr: 'مستلم' },
    { status: 'processing', label: 'Processing', labelAr: 'تجهيز' },
    { status: 'shipped', label: 'Shipped', labelAr: 'مشحون' },
    { status: 'out_for_delivery', label: 'Out for Delivery', labelAr: 'مع المندوب' },
    { status: 'delivered', label: 'Delivered', labelAr: 'تم التسليم' }
  ];

  const getStepIndex = (status: OrderStatus): number => {
    const idx = statusSteps.findIndex(s => s.status === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStepIndex = foundOrder ? getStepIndex(foundOrder.status) : 0;

  return (
    <section className="py-12 bg-zinc-50 min-h-[85vh]" id="order-tracker-section">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Title Block */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-wider">
            {isAr ? 'نظام تتبع شحنات ريترو اللحظي' : 'RETRO Order Logistics Tracker'}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            {isAr 
              ? 'أدخل رقم الطلب المكون من ٦ أرقام لمراقبة حالة المندوب ومسار الشحنة خطوة بخطوة.'
              : 'Enter your 6-digit order ID to view instant milestones and courier updates.'
            }
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8" id="tracker-search-form">
          <div className="relative rounded-2xl shadow-sm overflow-hidden border border-zinc-200">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder={isAr ? 'مثال: RETRO-102549' : 'e.g. RETRO-100245'}
              className="w-full bg-white px-5 py-4 text-sm font-bold font-mono focus:outline-none uppercase text-zinc-900 placeholder-zinc-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-black hover:bg-zinc-900 text-white font-extrabold px-5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Search className="h-4 w-4" />
              <span>{isAr ? 'تتبع الآن' : 'Track'}</span>
            </button>
          </div>
        </form>

        {/* Display Suggested active Orders for convenient review */}
        {!foundOrder && orders.length > 0 && (
          <div className="mb-8 p-5 bg-white rounded-2xl border border-zinc-200 space-y-3" id="suggestions-box">
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
              {isAr ? 'الطلبات النشطة للتجربة السريعة (اضغط للتجربة والتتبع اللحظي):' : 'Active Orders Available (Click to instantly track):'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {orders.slice(0, 4).map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between border border-zinc-100 p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-all text-xs cursor-pointer"
                  onClick={() => selectSuggestedOrder(order.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-black">{order.id}</span>
                    <span className="text-[10px] text-zinc-400 truncate max-w-[150px]">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      order.status === 'shipped' ? 'bg-sky-50 text-sky-600 border border-sky-200' :
                      order.status === 'out_for_delivery' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                      'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {isAr ? order.trackingHistory[getStepIndex(order.status)].titleAr : order.status}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCopy(order.id); }}
                      className="p-1 hover:bg-zinc-200 rounded text-zinc-500"
                      title="Copy"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS PANEL */}
        {foundOrder ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm"
            id="tracker-results-panel"
          >
            {/* Top overview card */}
            <div className="p-6 sm:p-8 border-b border-zinc-100 bg-zinc-950 text-white flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-mono">
                  {isAr ? 'رمز الطلب المرجعي:' : 'Tracking Order Reference:'}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-xl font-black font-mono tracking-wider">{foundOrder.id}</h3>
                  <button
                    onClick={() => handleCopy(foundOrder.id)}
                    className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                  >
                    <Copy className="h-4.5 w-4.5" />
                  </button>
                  {copiedId === foundOrder.id && (
                    <span className="text-[10px] text-emerald-400 font-bold">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase font-mono">
                  {isAr ? 'الحالة اللحظية:' : 'Live Courier Status:'}
                </span>
                <span className={`mt-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  foundOrder.status === 'delivered' ? 'bg-emerald-600 text-white' :
                  foundOrder.status === 'cancelled' ? 'bg-red-600 text-white' :
                  'bg-black text-white'
                }`}>
                  {isAr ? foundOrder.trackingHistory[currentStepIndex].titleAr : foundOrder.trackingHistory[currentStepIndex].title}
                </span>
              </div>
            </div>

            {/* Stepper graphical line */}
            <div className="px-6 py-10 sm:px-8 border-b border-zinc-100">
              {foundOrder.status === 'cancelled' ? (
                <div className="flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-bold">
                  <AlertCircle className="h-5 w-5" />
                  <span>{isAr ? 'تم إلغاء هذا الطلب من قبل الإدارة.' : 'This order has been cancelled by administration.'}</span>
                </div>
              ) : (
                <div className="relative">
                  {/* Stepper Progress Bar Background */}
                  <div className="absolute top-[18px] left-[15px] right-[15px] h-1 bg-zinc-100 -z-0"></div>
                  
                  {/* Active Stepper Progress Bar Fill */}
                  <div 
                    className="absolute top-[18px] left-[15px] h-1 bg-black -z-0 transition-all duration-1000"
                    style={{
                      width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                    }}
                  ></div>

                  {/* Interactive Nodes */}
                  <div className="relative z-10 flex justify-between items-center text-center">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex;
                      const isActive = index === currentStepIndex;

                      return (
                        <div key={step.status} className="flex flex-col items-center flex-1">
                          {/* Circle indicator node */}
                          <div
                            className={`h-9 w-9 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                              isActive
                                ? 'bg-black border-zinc-200 ring-4 ring-zinc-100 scale-110'
                                : isCompleted
                                  ? 'bg-zinc-900 border-zinc-900'
                                  : 'bg-white border-zinc-200'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className={`h-4.5 w-4.5 ${isActive ? 'text-zinc-100 animate-pulse' : 'text-zinc-100'}`} />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-zinc-300"></div>
                            )}
                          </div>

                          {/* Labels */}
                          <span className={`mt-2.5 text-[10px] font-bold block ${isActive ? 'text-black font-extrabold' : isCompleted ? 'text-zinc-700' : 'text-zinc-400'}`}>
                            {isAr ? step.labelAr : step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Shipment Summary Details */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50/50">
              {/* Delivery destination card */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                  {isAr ? 'بيانات الشحن للمندوب:' : 'Recipient Delivery Address:'}
                </h4>
                <div className="text-xs space-y-1 text-zinc-700">
                  <p><strong>{isAr ? 'العميل المستلم:' : 'Recipient:'}</strong> {foundOrder.customerName}</p>
                  <p><strong>{isAr ? 'رقم الهاتف:' : 'Mobile Phone:'}</strong> {foundOrder.customerPhone}</p>
                  <p><strong>{isAr ? 'المحافظة:' : 'Governorate:'}</strong> {isAr ? foundOrder.cityAr : foundOrder.city}</p>
                  <p><strong>{isAr ? 'العنوان بالتفصيل:' : 'Street Address:'}</strong> {foundOrder.address}</p>
                </div>
              </div>

              {/* Items Summary list */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1">
                  <Package className="h-4 w-4 text-zinc-500" />
                  {isAr ? 'القطع والملابس بالطلب:' : 'Purchased Streetwear items:'}
                </h4>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                  {foundOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 border border-zinc-100 p-2 rounded-xl bg-white text-[11px]">
                      <img src={item.image} alt={item.productName} className="h-8 w-8 rounded object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 truncate uppercase">{isAr ? item.productNameAr : item.productName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {item.size} • {isAr ? item.colorNameAr : item.colorName} • {isAr ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                        </p>
                      </div>
                      <span className="font-bold font-mono text-black">{item.price * item.quantity} EGP</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-700">{isAr ? 'الإجمالي الكلي (شاملاً الشحن):' : 'Total Amount (inc. delivery):'}</span>
                  <span className="font-black text-black font-mono text-sm">{foundOrder.totalAmount} EGP</span>
                </div>
              </div>
            </div>

            {/* Tracking Log Logs timeline */}
            <div className="p-6 sm:p-8 space-y-4 border-t border-zinc-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1">
                <Clock className="h-4 w-4 text-zinc-500" />
                {isAr ? 'سجل تتبع الشحنة المباشر:' : 'Live Shipment Logistics Log:'}
              </h4>
              
              <div className="space-y-4 border-l-2 border-zinc-100 pl-4 ml-2 text-xs">
                {foundOrder.trackingHistory
                  .filter(step => step.completed)
                  .map((step, idx) => (
                    <div key={idx} className="relative space-y-1">
                      {/* Circle bullet overlay */}
                      <span className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-zinc-950 ring-4 ring-white"></span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-zinc-900">
                          {isAr ? step.titleAr : step.title}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {step.timestamp}
                        </span>
                      </div>
                      <p className="text-zinc-500 leading-relaxed text-[11px]">
                        {isAr ? step.descriptionAr : step.description}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

          </motion.div>
        ) : (
          searchAttempted && (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-red-200 space-y-3" id="tracker-not-found">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-900">
                {isAr ? 'عذراً، لم يتم العثور على هذا الكود!' : 'Order Tracking Code Not Found!'}
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                {isAr
                  ? 'يرجى التحقق من الكود المكتوب للتأكد من أنه يطابق تماماً الكود الذي تم إعطاؤه لك (مثال: RETRO-102549).'
                  : 'Please check the spelling of your code. If you just placed the order, wait a few minutes and try again.'
                }
              </p>
            </div>
          )
        )}

      </div>
    </section>
  );
};
