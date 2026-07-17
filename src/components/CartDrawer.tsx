/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CartItem, Order, OrderStatus, TrackingStep } from '../types';
import { X, Trash2, ShieldCheck, MapPin, CreditCard, Landmark, Truck, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, size: string, colorName: string, q: number) => void;
  onRemoveItem: (productId: string, size: string, colorName: string) => void;
  onPlaceOrder: (order: Order) => void;
  language: 'ar' | 'en';
}

const EGYPTIAN_CITIES = [
  { id: 'cairo', name: 'Cairo', nameAr: 'القاهرة', fee: 50 },
  { id: 'giza', name: 'Giza', nameAr: 'الجيزة', fee: 50 },
  { id: 'alex', name: 'Alexandria', nameAr: 'الإسكندرية', fee: 75 },
  { id: 'qalyubia', name: 'Qalyubia', nameAr: 'القليوبية', fee: 65 },
  { id: 'sharkia', name: 'Sharkia', nameAr: 'الشرقية', fee: 75 },
  { id: 'gharbia', name: 'Gharbia', nameAr: 'الغربية', fee: 75 },
  { id: 'dakahlia', name: 'Dakahlia', nameAr: 'الدقهلية', fee: 75 },
  { id: 'beheira', name: 'Beheira', nameAr: 'البحيرة', fee: 80 },
  { id: 'fayoum', name: 'Fayoum', nameAr: 'الفيوم', fee: 80 },
  { id: 'minya', name: 'Minya', nameAr: 'المنيا', fee: 95 },
  { id: 'asyut', name: 'Asyut', nameAr: 'أسيوط', fee: 105 },
  { id: 'sohag', name: 'Sohag', nameAr: 'سوهاج', fee: 110 },
  { id: 'qena', name: 'Qena', nameAr: 'قنا', fee: 120 },
  { id: 'luxor', name: 'Luxor', nameAr: 'الأقصر', fee: 130 },
  { id: 'aswan', name: 'Aswan', nameAr: 'أسوان', fee: 140 },
  { id: 'other', name: 'Other Governorate', nameAr: 'محافظة أخرى', fee: 90 },
];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  language,
}) => {
  const isAr = language === 'ar';
  
  // Checkout flow state
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('cairo');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vodafone_cash' | 'card'>('cod');
  
  // Payment Details
  const [walletNumber, setWalletNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // Form validation errors
  const [formError, setFormError] = useState('');

  const selectedCity = EGYPTIAN_CITIES.find(c => c.id === selectedCityId) || EGYPTIAN_CITIES[0];
  const itemsSubtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingFee = itemsSubtotal > 0 ? selectedCity.fee : 0;
  const totalAmount = itemsSubtotal + shippingFee;

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Check blank fields
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setFormError(isAr ? 'برجاء ملء جميع الحقول المطلوبة للتوصيل.' : 'Please fill all required delivery fields.');
      return;
    }

    // Phone number verification (Egyptian formats: 010, 011, 012, 015)
    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(phone.trim())) {
      setFormError(isAr ? 'برجاء إدخال رقم هاتف مصري صحيح (مثال: 01012345678)' : 'Please enter a valid Egyptian mobile number (e.g. 01012345678)');
      return;
    }

    // Payment method validations
    if (paymentMethod === 'vodafone_cash') {
      if (!walletNumber.trim()) {
        setFormError(isAr ? 'برجاء إدخال رقم المحفظة التي قمت بالتحويل منها.' : 'Please enter the sender wallet phone number.');
        return;
      }
    } else if (paymentMethod === 'card') {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        setFormError(isAr ? 'برجاء ملء بيانات بطاقة الدفع بالكامل.' : 'Please enter complete card payment details.');
        return;
      }
    }

    // Create tracking timeline steps
    const now = new Date();
    const formattedDate = now.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const trackingSteps: TrackingStep[] = [
      {
        status: 'placed',
        title: 'Order Placed',
        titleAr: 'تم تقديم الطلب',
        description: 'Thank you! Your order has been placed successfully.',
        descriptionAr: 'شكراً لك! تم استلام طلبك بنجاح وجاري إرساله للمراجعة.',
        timestamp: formattedDate,
        completed: true,
      },
      {
        status: 'processing',
        title: 'Processing',
        titleAr: 'قيد التجهيز والتحضير',
        description: 'Our warehouse is compiling your streetwear garments.',
        descriptionAr: 'يقوم موظفو المستودع لدينا بتجهيز وتعبئة ملابسك بعناية.',
        timestamp: isAr ? 'انتظار...' : 'Pending...',
        completed: false,
      },
      {
        status: 'shipped',
        title: 'Shipped',
        titleAr: 'تم الشحن للتوصيل',
        description: 'The shipping courier has picked up your package.',
        descriptionAr: 'تم تسليم الطرد لشركة الشحن السريع لبدء الشحن.',
        timestamp: isAr ? 'انتظار...' : 'Pending...',
        completed: false,
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        titleAr: 'خرج مع المندوب للتسليم',
        description: 'Your local courier is arriving today.',
        descriptionAr: 'المندوب في منطقتك اليوم وسيقوم بالاتصال بك قريباً للتسليم.',
        timestamp: isAr ? 'انتظار...' : 'Pending...',
        completed: false,
      },
      {
        status: 'delivered',
        title: 'Delivered',
        titleAr: 'تم التوصيل بنجاح',
        description: 'Order successfully delivered. Wear it with pride!',
        descriptionAr: 'تم استلام الطلب وتوصيله بنجاح. ارتدِه بكل ثقة وفخر!',
        timestamp: isAr ? 'انتظار...' : 'Pending...',
        completed: false,
      }
    ];

    // Build the final order model
    const newOrderId = `RETRO-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: newOrderId,
      customerName: fullName.trim(),
      customerPhone: phone.trim(),
      city: selectedCity.name,
      cityAr: selectedCity.nameAr,
      address: address.trim(),
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productNameAr: item.product.nameAr,
        size: item.selectedSize,
        colorName: item.selectedColor.name,
        colorNameAr: item.selectedColor.nameAr,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      })),
      totalAmount,
      shippingFee,
      paymentMethod,
      paymentDetails: {
        walletNumber: walletNumber || undefined,
        transactionId: transactionId || undefined,
        cardNumber: cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : undefined,
      },
      status: 'placed',
      trackingHistory: trackingSteps,
      createdAt: formattedDate,
    };

    onPlaceOrder(newOrder);
    setOrderSuccess(newOrder);

    // Clear state
    setFullName('');
    setPhone('');
    setAddress('');
    setWalletNumber('');
    setTransactionId('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardHolder('');
    setIsCheckoutMode(false);
  };

  const handleCloseAll = () => {
    setOrderSuccess(null);
    setIsCheckoutMode(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-container">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={handleCloseAll}></div>

          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35 }}
              className="w-screen max-w-md transform bg-white shadow-2xl flex flex-col h-full"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <h2 className="text-lg font-black text-black uppercase tracking-wider">
                  {orderSuccess
                    ? (isAr ? 'تم تأكيد طلبك' : 'Order Confirmed')
                    : isCheckoutMode
                      ? (isAr ? 'بيانات الشحن والدفع' : 'Shipping & Payment')
                      : (isAr ? 'حقيبة المشتريات' : 'Shopping Bag')
                  }
                </h2>
                <button
                  onClick={handleCloseAll}
                  className="rounded-full bg-zinc-100 p-2 text-zinc-500 hover:bg-zinc-200 hover:text-black transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* SUCCESS PANEL */}
              {orderSuccess ? (
                <div className="flex-1 overflow-y-auto p-6 text-center flex flex-col justify-between" id="order-success-view">
                  <div className="my-auto space-y-6">
                    <div className="flex justify-center">
                      <CheckCircle className="h-16 w-16 text-emerald-600 animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-zinc-950 uppercase">
                        {isAr ? 'تم تسجيل طلبك بنجاح!' : 'Order Placed Successfully!'}
                      </h3>
                      <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
                        {isAr
                          ? 'شكراً لاختيارك ريترو. لقد تم حفظ طلبك وإرسال إشعار التتبع للمندوب.'
                          : 'Thanks for choosing RETRO. Your order has been registered in our central delivery line.'
                        }
                      </p>
                    </div>

                    {/* Order ID Tag */}
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {isAr ? 'رقم التتبع الخاص بك:' : 'Your Order Tracking ID:'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-black font-mono">
                          {orderSuccess.id}
                        </span>
                        <button
                          onClick={() => handleCopyId(orderSuccess.id)}
                          className="p-1 rounded hover:bg-zinc-200 text-zinc-500 transition-colors"
                          title="Copy ID"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      {copiedId && (
                        <span className="text-[10px] text-emerald-600 font-bold animate-pulse">
                          {isAr ? 'تم نسخ الرمز!' : 'Copied to clipboard!'}
                        </span>
                      )}
                    </div>

                    {/* Quick Guide */}
                    <div className="text-left bg-zinc-50 border border-zinc-100 p-4 rounded-xl text-xs space-y-2">
                      <div className="font-bold text-zinc-700 flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        <span>{isAr ? 'ماذا سيحدث بعد ذلك؟' : 'What happens next?'}</span>
                      </div>
                      <p className="text-zinc-500 leading-relaxed">
                        {isAr
                          ? '١. سيقوم مسؤول لوحة الإدارة بتأكيد الدفع وتجهيز الشحنة.'
                          : '1. The admin team will verify the payment and prepare the shipment.'
                        }
                      </p>
                      <p className="text-zinc-500 leading-relaxed">
                        {isAr
                          ? '٢. يمكنك نسخ كود التتبع والذهاب لصفحة "تتبع طلبك" في أي وقت لمتابعة حركة المندوب وتحديثات الشحن اللحظية.'
                          : '2. Copy the tracking ID and paste it in the "Track Order" page to watch real-time updates.'
                        }
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCloseAll}
                    className="w-full bg-black hover:bg-zinc-900 text-white font-extrabold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors mt-6"
                  >
                    {isAr ? 'العودة للتسوق' : 'Continue Shopping'}
                  </button>
                </div>
              ) : isCheckoutMode ? (
                /* CHECKOUT SUB-FORM */
                <form onSubmit={handleCheckoutSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col justify-between" id="checkout-form-panel">
                  <div className="space-y-6">
                    {formError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 font-semibold">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Delivery Section */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-zinc-500" />
                        {isAr ? 'بيانات التوصيل والشحن' : 'Delivery details'}
                      </h3>
                      
                      {/* Name input */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-600 mb-1">
                          {isAr ? 'الاسم بالكامل *' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={isAr ? 'الاسم الثلاثي لضمان دقة الشحن' : 'First & last name'}
                          className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-black focus:outline-none"
                        />
                      </div>

                      {/* Phone Input */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-600 mb-1">
                          {isAr ? 'رقم الهاتف المحمول (مصر) *' : 'Mobile Phone Number (Egypt) *'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 01012345678"
                          className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-black focus:outline-none text-left"
                        />
                      </div>

                      {/* Governorates dropdown */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-600 mb-1">
                            {isAr ? 'المحافظة *' : 'Governorate *'}
                          </label>
                          <select
                            value={selectedCityId}
                            onChange={(e) => setSelectedCityId(e.target.value)}
                            className="w-full border border-zinc-200 rounded-xl px-3 py-3 text-sm bg-white focus:border-black focus:outline-none"
                          >
                            {EGYPTIAN_CITIES.map(city => (
                              <option key={city.id} value={city.id}>
                                {isAr ? city.nameAr : city.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Shipping Display fee */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider font-mono">
                            {isAr ? 'تكلفة الشحن' : 'Shipping'}
                          </label>
                          <div className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-bold text-zinc-800 font-mono flex items-center justify-center">
                            +{shippingFee} EGP
                          </div>
                        </div>
                      </div>

                      {/* Full address */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-600 mb-1">
                          {isAr ? 'العنوان التفصيلي *' : 'Detailed Address *'}
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder={isAr ? 'اسم الشارع، رقم العمارة، رقم الشقة أو علامة مميزة' : 'Street name, building number, apartment, landmark'}
                          className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Payment choice */}
                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
                        <CreditCard className="h-4 w-4 text-zinc-500" />
                        {isAr ? 'طريقة الدفع المناسبة' : 'Payment Method'}
                      </h3>

                      <div className="grid grid-cols-1 gap-2">
                        {/* Cash on Delivery */}
                        <label className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-black bg-zinc-50 shadow-sm' : 'border-zinc-200'}`}>
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'cod'}
                            onChange={() => setPaymentMethod('cod')}
                            className="text-black focus:ring-black accent-black"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-black text-zinc-900 block">
                              {isAr ? 'الدفع نقدًا عند الاستلام (COD)' : 'Cash on Delivery'}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {isAr ? 'الدفع نقداً للمندوب عند استلام قطعة الشارع الخاصة بك' : 'Pay in cash to the courier upon delivery'}
                            </span>
                          </div>
                        </label>

                        {/* Vodafone Cash */}
                        <label className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-all ${paymentMethod === 'vodafone_cash' ? 'border-black bg-zinc-50 shadow-sm' : 'border-zinc-200'}`}>
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'vodafone_cash'}
                            onChange={() => setPaymentMethod('vodafone_cash')}
                            className="text-black focus:ring-black accent-black"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-black text-zinc-900 block flex items-center gap-1.5">
                              <Landmark className="h-4 w-4 text-rose-600" />
                              {isAr ? 'كاش محفظة إلكترونية (فودافون / انستاباي)' : 'Mobile Wallet (Vodafone / InstaPay)'}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {isAr ? 'تحويل فوري كاش على الرقم 01023456789 مع كتابة بيانات التحويل بالأسفل' : 'Instantly transfer with your local mobile wallet'}
                            </span>
                          </div>
                        </label>

                        {/* Credit Card */}
                        <label className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-black bg-zinc-50 shadow-sm' : 'border-zinc-200'}`}>
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            className="text-black focus:ring-black accent-black"
                          />
                          <div className="flex-1">
                            <span className="text-xs font-black text-zinc-900 block">
                              {isAr ? 'الدفع بالبطاقة الائتمانية' : 'Credit / Debit Card'}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {isAr ? 'ادفع فورًا ببطاقة فيزا أو ماستركارد بأمان تكنولوجي كامل' : 'Pay instantly with credit or debit card'}
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Extra payment fields depending on choice */}
                      {paymentMethod === 'vodafone_cash' && (
                        <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3 animate-fadeIn">
                          <p className="text-[10px] text-rose-700 leading-relaxed font-semibold">
                            {isAr
                              ? 'يرجى تحويل مبلغ الإجمالي كاملًا إلى الرقم 01023456789 (فودافون كاش) أو كود انستاباي retro@instapay وثم تزويدنا بالتفاصيل بالأسفل لتأكيد المعاملة في لوحة الإدارة:'
                              : 'Please transfer the exact total to 01023456789 (Vodafone Cash) or instaPay: retro@instapay. Input details below to expedite admin approval:'
                            }
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                                {isAr ? 'رقم الهاتف المحول منه *' : 'Sender Wallet Number *'}
                              </label>
                              <input
                                type="text"
                                value={walletNumber}
                                onChange={(e) => setWalletNumber(e.target.value)}
                                placeholder="010XXXXXXXX"
                                className="w-full border border-zinc-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-rose-600"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                                {isAr ? 'رقم عملية التحويل (اختياري)' : 'Transaction ID (Opt)'}
                              </label>
                              <input
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="e.g. 58291048"
                                className="w-full border border-zinc-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-rose-600"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'card' && (
                        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 animate-fadeIn">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                              {isAr ? 'الاسم المكتوب على البطاقة' : 'Cardholder Name'}
                            </label>
                            <input
                              type="text"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              placeholder="e.g. Aly Ahmed"
                              className="w-full border border-zinc-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                              {isAr ? 'رقم البطاقة الائتمانية' : 'Card Number'}
                            </label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4000 1234 5678 9010"
                              className="w-full border border-zinc-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                                {isAr ? 'تاريخ الانتهاء' : 'Expiry Date'}
                              </label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="MM/YY"
                                className="w-full border border-zinc-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                                CVV
                              </label>
                              <input
                                type="password"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                placeholder="***"
                                maxLength={3}
                                className="w-full border border-zinc-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary & Place Order */}
                  <div className="border-t border-zinc-200 pt-6 mt-6 bg-white sticky bottom-0">
                    <div className="space-y-1.5 text-xs font-mono mb-4 text-zinc-500">
                      <div className="flex justify-between">
                        <span>{isAr ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                        <span>{itemsSubtotal} EGP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isAr ? 'مصاريف الشحن للموقع:' : 'Shipping fee:'}</span>
                        <span>+{shippingFee} EGP</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-black pt-1.5 border-t border-zinc-100 font-sans">
                        <span>{isAr ? 'الإجمالي الكلي:' : 'Order Total:'}</span>
                        <span>{totalAmount} EGP</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCheckoutMode(false)}
                        className="w-1/3 bg-zinc-100 hover:bg-zinc-200 text-black font-extrabold py-3.5 rounded-xl text-xs uppercase transition-colors"
                      >
                        {isAr ? 'رجوع للحقيبة' : 'Back'}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-black hover:bg-zinc-900 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-lg"
                      >
                        {isAr ? 'تأكيد وشراء الملابس' : 'Confirm & Complete'}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* SHOPPING BAG DISPLAY */
                <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between" id="bag-items-panel">
                  {cartItems.length === 0 ? (
                    <div className="my-auto text-center py-12 space-y-4">
                      <div className="text-zinc-300 flex justify-center">
                        <X className="h-12 w-12 border-2 border-zinc-300 rounded-full p-2" />
                      </div>
                      <h3 className="text-sm font-bold text-zinc-700">
                        {isAr ? 'حقيبة المشتريات فارغة تماماً.' : 'Your bag is empty.'}
                      </h3>
                      <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                        {isAr
                          ? 'استكشف ملابس الشارع الرائعة وأضف قطعك المميزة لنبدأ مغامرة كسر القواعد.'
                          : 'Explore our latest drops and pick your select pieces to build your personal street style.'
                        }
                      </p>
                      <button
                        onClick={onClose}
                        className="bg-black text-white px-4 py-2.5 text-xs font-bold rounded-lg uppercase"
                      >
                        {isAr ? 'استعراض الملابس' : 'Browse Clothes'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1">
                      {cartItems.map((item, idx) => (
                        <div
                          key={`${item.product.id}-${item.selectedSize}-${item.selectedColor.name}`}
                          className="flex items-center gap-4 p-3 border border-zinc-100 rounded-xl bg-zinc-50/50"
                          id={`cart-item-${idx}`}
                        >
                          <img
                            src={item.product.image}
                            alt={isAr ? item.product.nameAr : item.product.name}
                            className="h-16 w-16 rounded-lg object-cover bg-zinc-100 flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-zinc-900 uppercase truncate">
                              {isAr ? item.product.nameAr : item.product.name}
                            </h4>
                            <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-zinc-500 font-mono">
                              <span>{isAr ? 'المقاس:' : 'Size:'} <strong className="text-black font-sans">{item.selectedSize}</strong></span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {isAr ? 'اللون:' : 'Color:'}
                                <span className={`h-2 w-2 rounded-full border border-black/10 ${item.selectedColor.class}`}></span>
                                <strong className="text-black font-sans">{isAr ? item.selectedColor.nameAr : item.selectedColor.name}</strong>
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              {/* Quantity selectors */}
                              <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-white text-[10px]">
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor.name, item.quantity - 1)}
                                  className="px-2.5 py-1 hover:bg-zinc-50 font-bold"
                                >
                                  -
                                </button>
                                <span className="px-2.5 font-bold font-mono">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor.name, item.quantity + 1)}
                                  className="px-2.5 py-1 hover:bg-zinc-50 font-bold"
                                >
                                  +
                                </button>
                              </div>

                              <span className="text-xs font-black text-black font-mono">
                                {item.product.price * item.quantity} EGP
                              </span>
                            </div>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor.name)}
                            className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {cartItems.length > 0 && (
                    <div className="border-t border-zinc-200 pt-6 mt-6 sticky bottom-0 bg-white">
                      <div className="space-y-1 text-xs font-mono mb-4 text-zinc-500">
                        <div className="flex justify-between text-zinc-400">
                          <span>{isAr ? 'مجموع القطع:' : 'Subtotal:'}</span>
                          <span>{itemsSubtotal} EGP</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>{isAr ? 'الشحن (تحديد المحافظة بالخطوة التالية):' : 'Shipping (Selected next step):'}</span>
                          <span>{isAr ? 'محسوب لاحقاً' : 'Calculated next'}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-black pt-1.5 border-t border-zinc-100 font-sans">
                          <span>{isAr ? 'الإجمالي الفرعي الكلي:' : 'Cart Total:'}</span>
                          <span>{itemsSubtotal} EGP</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsCheckoutMode(true)}
                        className="w-full bg-black hover:bg-zinc-900 text-white font-extrabold py-4 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-1.5"
                      >
                        <span>{isAr ? 'الانتقال لبيانات التوصيل والشحن' : 'Proceed to Checkout'}</span>
                        <ShieldCheck className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
