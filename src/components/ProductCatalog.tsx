/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Order, TrackingStep, OrderStatus } from '../types';
import { 
  Sparkles, 
  ShoppingBag, 
  Eye, 
  X, 
  Check, 
  Ruler, 
  RefreshCw, 
  Star, 
  Instagram, 
  Truck, 
  ChevronLeft, 
  ChevronRight,
  Copy,
  AlertCircle,
  CheckCircle,
  MapPin,
  Phone,
  User,
  ShoppingBag as CartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCatalogProps {
  products: Product[];
  language: 'ar' | 'en';
  onAddToCart: (product: Product, size: string, color: any, quantity: number) => void;
  onPlaceOrder?: (order: Order) => void;
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

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  language,
  onAddToCart,
  onPlaceOrder,
}) => {
  const isAr = language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);

  // Modal choice states
  const [chosenSize, setChosenSize] = useState<string>('');
  const [chosenColor, setChosenColor] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Sizing chart drawer toggle
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Lookbook slides state for premium street-style Hero section
  const [lookbookIndex, setLookbookIndex] = useState(0);
  const lookbookSlides = [
    { src: '/src/assets/images/retro_hoodie_1784140861378.jpg', label: '01 / THE COSMIC HOODIE', labelAr: '٠١ / هودي ريترو كوزميك' },
    { src: '/src/assets/images/retro_tee_1784140871626.jpg', label: '02 / ACID-WASH TEE', labelAr: '٠٢ / تيشرت أسيد واش' },
    { src: '/src/assets/images/retro_cargo_1784140882129.jpg', label: '03 / UTILITY CARGO PANTS', labelAr: '٠٣ / كارجو تيك-ريترو' },
    { src: '/src/assets/images/retro_jacket_1784140892340.jpg', label: '04 / WINDBREAKER JACKET', labelAr: '٠٤ / جاكيت بومبر' },
  ];

  // Auto-sliding Lookbook Slides Timer
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setLookbookIndex((prev) => (prev + 1) % lookbookSlides.length);
    }, 5000); // Auto-slides every 5 seconds
    return () => clearInterval(slideInterval);
  }, [lookbookSlides.length]);

  // Touch Swipe Gesture State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setLookbookIndex((prev) => (prev + 1) % lookbookSlides.length);
    } else if (isRightSwipe) {
      setLookbookIndex((prev) => (prev - 1 + lookbookSlides.length) % lookbookSlides.length);
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Direct checkout states inside Modal
  const [isDirectCheckout, setIsDirectCheckout] = useState(false);
  const [directFullName, setDirectFullName] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [directCityId, setDirectCityId] = useState('cairo');
  const [directAddress, setDirectAddress] = useState('');
  const [directFormError, setDirectFormError] = useState('');
  const [directOrderSuccess, setDirectOrderSuccess] = useState<Order | null>(null);
  const [copiedDirectId, setCopiedDirectId] = useState(false);

  const selectedCity = EGYPTIAN_CITIES.find(c => c.id === directCityId) || EGYPTIAN_CITIES[0];
  const itemSubtotal = activeProductModal ? (activeProductModal.price * quantity) : 0;
  const directShippingFee = itemSubtotal > 0 ? selectedCity.fee : 0;
  const directTotalAmount = itemSubtotal + directShippingFee;

  const categories = [
    { id: 'all', label: 'All Collection', labelAr: 'كل المجموعات' },
    { id: 'Hoodies', label: 'Hoodies', labelAr: 'هوديز' },
    { id: 'T-Shirts', label: 'T-Shirts', labelAr: 'تيشرتات' },
    { id: 'Pants', label: 'Cargo & Pants', labelAr: 'بناطيل وكارجو' },
    { id: 'Jackets', label: 'Jackets', labelAr: 'جاكيتات' },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const openProductDetails = (product: Product) => {
    setActiveProductModal(product);
    setChosenSize(product.sizes[0] || 'L');
    setChosenColor(product.colors[0] || null);
    setQuantity(1);
    setSuccessAnimation(false);
    setIsDirectCheckout(false);
    setDirectFullName('');
    setDirectPhone('');
    setDirectCityId('cairo');
    setDirectAddress('');
    setDirectFormError('');
    setDirectOrderSuccess(null);
    setCopiedDirectId(false);
  };

  const handleAddToCartSubmit = () => {
    if (!activeProductModal || !chosenSize || !chosenColor) return;
    
    onAddToCart(activeProductModal, chosenSize, chosenColor, quantity);
    
    setSuccessAnimation(true);
    setTimeout(() => {
      setSuccessAnimation(false);
      setActiveProductModal(null);
    }, 1500);
  };

  const handleDirectCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDirectFormError('');

    if (!activeProductModal || !chosenSize || !chosenColor) return;

    if (!directFullName.trim() || !directPhone.trim() || !directAddress.trim()) {
      setDirectFormError(isAr ? 'برجاء ملء جميع الحقول المطلوبة للتوصيل.' : 'Please fill all required delivery fields.');
      return;
    }

    const egPhoneRegex = /^01[0125][0-9]{8}$/;
    if (!egPhoneRegex.test(directPhone.trim())) {
      setDirectFormError(isAr ? 'برجاء إدخال رقم هاتف مصري صحيح (مثال: 01012345678)' : 'Please enter a valid Egyptian mobile number (e.g. 01012345678)');
      return;
    }

    const trackingId = `RETRO-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' });

    const initialHistory: TrackingStep[] = [
      {
        status: 'placed',
        title: 'Order Placed Successfully',
        titleAr: 'تم تسجيل طلبك بنجاح',
        description: 'Your street apparel is reserved and pending admin confirmation.',
        descriptionAr: 'تم حجز القطعة وجاري مراجعة الطلب وتأكيده من قبل إدارة ريترو.',
        timestamp: timestamp,
        completed: true
      },
      {
        status: 'processing',
        title: 'Processing',
        titleAr: 'جاري التجهيز',
        description: 'We are printing/inspecting your street-style garment.',
        descriptionAr: 'نقوم الآن بفحص القطعة وتجهيزها للشحن.',
        timestamp: '',
        completed: false
      },
      {
        status: 'shipped',
        title: 'Shipped',
        titleAr: 'تم الشحن للمحافظة',
        description: 'Courier picked up and is traveling to your city.',
        descriptionAr: 'استلم المندوب الشحنة وهي الآن في طريقها إلى محافظتك.',
        timestamp: '',
        completed: false
      },
      {
        status: 'out_for_delivery',
        title: 'Out for Delivery',
        titleAr: 'طلبك مع المندوب',
        description: 'Representative will call you shortly to deliver your order today.',
        descriptionAr: 'المندوب في منطقتك وسيتصل بك هاتفياً لتسليم الشحنة اليوم.',
        timestamp: '',
        completed: false
      },
      {
        status: 'delivered',
        title: 'Delivered',
        titleAr: 'تم التوصيل والاستلام',
        description: 'Thank you for breaking fashion rules with RETRO!',
        descriptionAr: 'تم استلام القطعة بنجاح. شكراً لثقتك واختيارك براند ريترو!',
        timestamp: '',
        completed: false
      }
    ];

    const newOrder: Order = {
      id: trackingId,
      customerName: directFullName.trim(),
      customerPhone: directPhone.trim(),
      city: selectedCity.name,
      cityAr: selectedCity.nameAr,
      address: directAddress.trim(),
      items: [
        {
          productId: activeProductModal.id,
          productName: activeProductModal.name,
          productNameAr: activeProductModal.nameAr,
          size: chosenSize,
          colorName: chosenColor.name,
          colorNameAr: chosenColor.nameAr,
          price: activeProductModal.price,
          quantity: quantity,
          image: activeProductModal.image,
        }
      ],
      totalAmount: directTotalAmount,
      shippingFee: directShippingFee,
      paymentMethod: 'cod',
      status: 'placed',
      trackingHistory: initialHistory,
      createdAt: timestamp,
    };

    if (onPlaceOrder) {
      onPlaceOrder(newOrder);
      setDirectOrderSuccess(newOrder);
    } else {
      // Fallback if prop not provided
      setDirectOrderSuccess(newOrder);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedDirectId(true);
    setTimeout(() => setCopiedDirectId(false), 2000);
  };

  if (activeProductModal) {
    const saveAmount = activeProductModal.originalPrice ? activeProductModal.originalPrice - activeProductModal.price : 0;
    return (
      <section className="py-12 bg-zinc-50 min-h-screen font-sans" id="product-detail-view">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 animate-fadeIn">
          
          {/* Back Navigation Bar */}
          <div className="mb-8">
            <button
              onClick={() => setActiveProductModal(null)}
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-white border border-zinc-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-800 hover:text-black hover:border-black hover:bg-zinc-50 transition-all duration-300 shadow-sm cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-cairo font-bold">{isAr ? 'الرجوع إلى المجموعة الكاملة' : 'Back to Collection'}</span>
            </button>
          </div>

          {/* Core Detail Grid */}
          <div className="bg-white rounded-3xl border border-zinc-150 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* Left/Top Column: GORGEOUS HIGH-RESOLUTION GALLERY (7/12 cols) */}
            <div className="lg:col-span-7 bg-zinc-100 p-4 sm:p-8 flex items-center justify-center relative min-h-[400px] lg:min-h-[650px]">
              <img
                src={activeProductModal.image}
                alt={isAr ? activeProductModal.nameAr : activeProductModal.name}
                className="max-h-[600px] w-full object-contain rounded-2xl shadow-sm"
                referrerPolicy="no-referrer"
              />
              {activeProductModal.originalPrice && (
                <span className="absolute top-6 left-6 rounded-md bg-red-600 px-3.5 py-2 text-xs font-black text-white tracking-widest uppercase animate-pulse">
                  {isAr ? `وفر ${saveAmount} ج.م` : `SAVE ${saveAmount} EGP`}
                </span>
              )}
            </div>

            {/* Right/Bottom Column: CONTROLS & CHECKOUT FORM (5/12 cols) */}
            <div className={`lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white border-t lg:border-t-0 lg:border-l border-zinc-100 ${isAr ? 'text-right' : 'text-left'}`}>
              
              {directOrderSuccess ? (
                /* DIRECT ORDER SUCCESS SCREEN */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="my-auto py-8 text-center space-y-6"
                >
                  <div className="text-emerald-500 flex justify-center">
                    <CheckCircle className="h-20 w-20 animate-bounce" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-black text-zinc-900 font-cairo">
                      {isAr ? 'تم تسجيل طلبك بنجاح!' : 'Order Placed Successfully!'}
                    </h3>
                    <p className="text-sm text-zinc-400 font-cairo">
                      {isAr ? 'يسعدنا اختيارك لقطع ملابس ريترو الفريدة.' : 'Thank you for choosing RETRO Streetwear.'}
                    </p>
                  </div>

                  {/* Order Tracking Code Display */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-2.5 max-w-sm mx-auto">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block">
                      {isAr ? 'كود تتبع طلبك' : 'YOUR TRACKING CODE'}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-black text-black tracking-wider font-mono">
                        {directOrderSuccess.id}
                      </span>
                      <button
                        onClick={() => handleCopyId(directOrderSuccess.id)}
                        className="p-2 rounded-lg hover:bg-zinc-200 text-zinc-500 hover:text-black transition-colors"
                        title={isAr ? 'نسخ كود التتبع' : 'Copy tracking ID'}
                      >
                        <Copy className="h-4.5 w-4.5" />
                      </button>
                    </div>
                    {copiedDirectId && (
                      <span className="text-xs text-emerald-600 font-bold block animate-pulse font-cairo">
                        {isAr ? 'تم نسخ الرمز!' : 'Copied to clipboard!'}
                      </span>
                    )}
                  </div>

                  {/* Delivery Info Recap */}
                  <div className="text-xs text-zinc-500 font-mono space-y-2 bg-zinc-50/50 p-4 rounded-xl text-left max-w-sm mx-auto border border-zinc-100">
                    <div className="flex justify-between">
                      <span>{isAr ? 'العميل:' : 'Customer:'}</span>
                      <span className="font-sans font-bold text-black">{directOrderSuccess.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'رقم الهاتف:' : 'Phone:'}</span>
                      <span className="text-black">{directOrderSuccess.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'المقاس المختار:' : 'Selected Size:'}</span>
                      <span className="font-sans font-bold text-black">{chosenSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'المحافظة:' : 'Governorate:'}</span>
                      <span className="font-sans font-bold text-black">{isAr ? directOrderSuccess.cityAr : directOrderSuccess.city}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-200 pt-2 mt-2 text-sm font-sans font-black text-black">
                      <span>{isAr ? 'الإجمالي عند الاستلام:' : 'Total Amount:'}</span>
                      <span>{directOrderSuccess.totalAmount} EGP</span>
                    </div>
                  </div>

                  <div className="bg-zinc-100/80 p-4 rounded-xl text-xs text-zinc-500 leading-relaxed font-cairo max-w-sm mx-auto">
                    {isAr 
                      ? 'يمكنك الانتقال لصفحة "تتبع طلبك" بالأعلى وإدخال هذا الرمز لمتابعة الشحنة مع المندوب لحظة بلحظة.'
                      : 'You can use the "Track Order" page at the top navigation with this ID to track delivery status in real-time.'}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setActiveProductModal(null);
                      }}
                      className="w-full max-w-sm bg-black hover:bg-zinc-900 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-sm font-cairo cursor-pointer"
                    >
                      {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
                    </button>
                  </div>
                </motion.div>
              ) : isDirectCheckout ? (
                /* DIRECT CHECKOUT FORM INSTEAD */
                <form onSubmit={handleDirectCheckoutSubmit} className="space-y-4" id="direct-checkout-form">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-5 w-5 text-zinc-950 animate-bounce" />
                      <h3 className="text-sm sm:text-base font-black uppercase text-zinc-950 font-cairo">
                        {isAr ? 'طلب شحن فوري سريع' : 'Instant Quick Order'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDirectCheckout(false)}
                      className="text-xs font-bold text-zinc-400 hover:text-black transition-colors font-cairo cursor-pointer"
                    >
                      {isAr ? 'إلغاء والرجوع' : 'Cancel & Back'}
                    </button>
                  </div>

                  {directFormError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 font-semibold font-cairo">
                      <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
                      <span>{directFormError}</span>
                    </div>
                  )}

                  {/* Name input */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 mb-1.5 font-cairo">
                      {isAr ? 'الاسم بالكامل *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={directFullName}
                        onChange={(e) => setDirectFullName(e.target.value)}
                        placeholder={isAr ? 'الاسم الثلاثي لضمان دقة الشحن' : 'First & last name'}
                        className="w-full border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-black focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 mb-1.5 font-cairo">
                      {isAr ? 'رقم الهاتف المحمول (مصر) *' : 'Mobile Phone Number (Egypt) *'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" />
                      <input
                        type="tel"
                        required
                        value={directPhone}
                        onChange={(e) => setDirectPhone(e.target.value)}
                        placeholder="e.g. 01012345678"
                        className="w-full border border-zinc-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:border-black focus:outline-none text-left"
                      />
                    </div>
                  </div>

                  {/* Governorates dropdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 mb-1.5 font-cairo">
                        {isAr ? 'المحافظة *' : 'Governorate *'}
                      </label>
                      <select
                        value={directCityId}
                        onChange={(e) => setDirectCityId(e.target.value)}
                        className="w-full border border-zinc-200 rounded-xl px-3 py-3 text-xs sm:text-sm bg-white focus:border-black focus:outline-none font-bold font-cairo"
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
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider font-mono">
                        {isAr ? 'تكلفة الشحن' : 'Shipping'}
                      </label>
                      <div className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-xs sm:text-sm font-black text-zinc-800 font-mono flex items-center justify-center">
                        +{directShippingFee} EGP
                      </div>
                    </div>
                  </div>

                  {/* Full address */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 mb-1.5 font-cairo">
                      {isAr ? 'العنوان التفصيلي بالتحديد *' : 'Detailed Address *'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={directAddress}
                      onChange={(e) => setDirectAddress(e.target.value)}
                      placeholder={isAr ? 'اسم الشارع، رقم العمارة، رقم الشقة أو علامة مميزة' : 'Street name, building number, apartment, landmark'}
                      className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-xs focus:border-black focus:outline-none"
                    />
                  </div>

                  {/* Recap and Place Order */}
                  <div className="border-t border-zinc-100 pt-4 space-y-4">
                    <div className="space-y-1.5 text-[11px] sm:text-xs font-mono text-zinc-500">
                      <div className="flex justify-between">
                        <span>{isAr ? 'القطعة:' : 'Garment Subtotal:'}</span>
                        <span>{activeProductModal.price} EGP {quantity > 1 && `x ${quantity}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isAr ? 'مصاريف التوصيل:' : 'Delivery charge:'}</span>
                        <span>+{directShippingFee} EGP</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base font-black text-black pt-2 border-t border-zinc-100 font-sans">
                        <span>{isAr ? 'الإجمالي عند الاستلام:' : 'Total COD Amount:'}</span>
                        <span>{directTotalAmount} EGP</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsDirectCheckout(false)}
                        className="w-1/3 bg-zinc-100 hover:bg-zinc-200 text-black font-extrabold py-3.5 rounded-xl text-xs transition-colors font-cairo cursor-pointer"
                      >
                        {isAr ? 'رجوع' : 'Back'}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md flex items-center justify-center gap-1.5 font-cairo cursor-pointer"
                      >
                        <CartIcon className="h-4.5 w-4.5" />
                        <span>{isAr ? 'تأكيد وشراء الملابس' : 'Confirm Order'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* PRODUCT CONFIGURATION & INFO */
                <div className="space-y-6">
                  <div>
                    {/* Category */}
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase font-mono">
                      {isAr ? activeProductModal.categoryAr : activeProductModal.category}
                    </span>
                    
                    {/* Name */}
                    <h2 className="mt-1 text-2xl sm:text-3xl font-black text-zinc-950 uppercase font-display leading-tight">
                      {isAr ? activeProductModal.nameAr : activeProductModal.name}
                    </h2>

                    {/* Price Tag */}
                    <div className="mt-2.5 flex items-baseline gap-3">
                      <span className="text-3xl font-black text-black font-mono">
                        {activeProductModal.price} <span className="text-sm font-bold">{isAr ? 'ج.م' : 'EGP'}</span>
                      </span>
                      {activeProductModal.originalPrice && (
                        <span className="text-sm sm:text-base text-zinc-400 line-through font-mono">
                          {activeProductModal.originalPrice} {isAr ? 'ج.م' : 'EGP'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-cairo">
                    {isAr ? activeProductModal.descriptionAr : activeProductModal.description}
                  </p>

                  {/* Fabric Material Highlight */}
                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 font-mono block">
                      {isAr ? 'الخامة والنسيج' : 'Material & Craft'}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-zinc-800 mt-1 block font-cairo">
                      {isAr ? activeProductModal.materialAr : activeProductModal.material}
                    </span>
                  </div>

                  {/* Color Choice */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block font-cairo">
                      {isAr ? 'اللون المتاح' : 'Choose Color'}
                    </span>
                    <div className="mt-2 flex items-center gap-2.5 flex-wrap">
                      {activeProductModal.colors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => setChosenColor(color)}
                          className={`group relative flex h-9 items-center gap-2 rounded-full border px-4 py-1.5 transition-all cursor-pointer ${
                            chosenColor?.name === color.name
                              ? 'border-black bg-zinc-50 scale-105'
                              : 'border-zinc-200 hover:border-zinc-400 bg-white'
                          }`}
                          title={isAr ? color.nameAr : color.name}
                        >
                          <span className={`h-4.5 w-4.5 rounded-full border border-black/10 ${color.class}`}></span>
                          <span className="text-xs font-bold text-zinc-700 font-sans">
                            {isAr ? color.nameAr : color.name}
                          </span>
                          {chosenColor?.name === color.name && (
                            <Check className="h-3.5 w-3.5 text-black" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizing selection with chart helper */}
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block font-cairo">
                        {isAr ? 'المقاس (قصة مريحة أوفرسايز)' : 'Select Size (Oversized Fit)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSizeChart(!showSizeChart)}
                        className="text-[11px] font-bold text-zinc-500 hover:text-black flex items-center gap-1.5 transition-colors underline font-cairo cursor-pointer"
                      >
                        <Ruler className="h-4 w-4" />
                        {isAr ? 'جدول المقاسات' : 'Size Chart'}
                      </button>
                    </div>
                    
                    {/* Size Buttons */}
                    <div className="mt-2.5 flex gap-2.5">
                      {activeProductModal.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setChosenSize(sz)}
                          className={`h-11 w-12 rounded-xl border flex items-center justify-center font-black text-sm transition-all cursor-pointer ${
                            chosenSize === sz
                              ? 'bg-black text-white border-black shadow-md scale-105'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>

                    {/* Animated Size Chart details */}
                    <AnimatePresence>
                      {showSizeChart && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-500 font-mono space-y-2 overflow-hidden"
                        >
                          <div className="font-bold text-zinc-700 uppercase mb-1 font-cairo">
                            {isAr ? 'دليل مقاسات الملابس الأوفرسايز:' : 'Oversized Sizing Dimensions:'}
                          </div>
                          <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                            <span>M: {isAr ? 'الوزن من ٥٥ إلى ٧٠ كجم (عرض ٦٠ سم)' : 'Weight 55-70 kg (Width 60cm)'}</span>
                          </div>
                          <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                            <span>L: {isAr ? 'الوزن من ٧٠ إلى ٨٥ كجم (عرض ٦٣ سم)' : 'Weight 70-85 kg (Width 63cm)'}</span>
                          </div>
                          <div className="flex justify-between border-b border-zinc-200 pb-1.5">
                            <span>XL: {isAr ? 'الوزن من ٨٥ إلى ١٠٠ كجم (عرض ٦٦ سم)' : 'Weight 85-100 kg (Width 66cm)'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>XXL: {isAr ? 'الوزن من ١٠٠ إلى ١٢٠ كجم (عرض ٧٠ سم)' : 'Weight 100-120 kg (Width 70cm)'}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Key features of the garment */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block font-cairo">
                      {isAr ? 'مواصفات القطعة:' : 'Garment Specs:'}
                    </span>
                    <ul className={`mt-2 text-xs text-zinc-500 space-y-1.5 list-disc list-inside ${isAr ? 'pr-1' : 'pl-3'}`}>
                      {(isAr ? activeProductModal.detailsAr : activeProductModal.details).map((detail, idx) => (
                        <li key={idx} className="leading-relaxed font-sans">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quantity & Cart trigger */}
                  <div className="pt-4 border-t border-zinc-100">
                    <div className="flex items-center justify-between gap-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-zinc-300 rounded-xl overflow-hidden h-12">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-4 py-1 hover:bg-zinc-100 font-extrabold text-base transition-colors text-zinc-600 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-4 text-sm font-black font-mono text-zinc-800">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-4 py-1 hover:bg-zinc-100 font-extrabold text-base transition-colors text-zinc-600 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Add To Bag Button */}
                      <button
                        type="button"
                        onClick={handleAddToCartSubmit}
                        disabled={successAnimation}
                        className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                          successAnimation
                            ? 'bg-emerald-600 text-white'
                            : 'bg-black text-white hover:bg-zinc-900 active:scale-95 shadow-md font-cairo'
                        }`}
                      >
                        {successAnimation ? (
                          <>
                            <Check className="h-4.5 w-4.5 animate-ping" />
                            <span>{isAr ? 'تمت الإضافة للحقيبة!' : 'Added to Bag!'}</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="h-4.5 w-4.5" />
                            <span>{isAr ? 'إضافة لحقيبة المشتريات' : 'Add to Bag'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Creative High-Contrast Direct Order Section */}
                  <div className="pt-4 border-t border-zinc-100 flex flex-col gap-3">
                    <div className="text-center">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest block font-mono">
                        {isAr ? '— أو الشراء الفوري السريع —' : '— OR QUICK DIRECT CHECKOUT —'}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setIsDirectCheckout(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95 flex items-center justify-center gap-1.5 font-cairo cursor-pointer"
                    >
                      <Sparkles className="h-4.5 w-4.5 text-amber-300 animate-pulse" />
                      <span>{isAr ? 'طلب شحن فوري (الدفع عند الاستلام)' : 'Buy Now (Cash on Delivery)'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-zinc-50 min-h-screen" id="shop-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* PREMIUM STREET-STYLE EDITORIAL HERO BLOCK */}
        <div 
          className="relative mb-14 overflow-hidden rounded-[32px] bg-zinc-950 text-white shadow-2xl border border-zinc-900"
          id="hero-banner"
        >
          {/* Subtle grid lines background to evoke a professional streetwear look */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"></div>
          
          {/* Ambient color glowing backdrops */}
          <div className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-zinc-800 opacity-30 blur-3xl"></div>
          <div className="absolute bottom-12 left-10 h-64 w-64 rounded-full bg-zinc-900 opacity-20 blur-3xl"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            
            {/* LEFT COLUMN: EDITORIAL BRAND CONTEXT (7/12 cols) */}
            <motion.div 
              initial={{ opacity: 0, x: isAr ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between space-y-8"
            >
              <div className="space-y-6">
                {/* Glowing Premium Badge */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-300 font-display">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isAr ? 'براند ملابس الشارع الفاخر' : 'Premium Streetwear Brand'}
                </span>

                {/* Display Brand Heading with Ultra Tracking */}
                <h1 className="text-5xl sm:text-7xl font-black tracking-widest leading-none text-white font-display uppercase">
                  R E T R O
                  <span className="text-zinc-500 block sm:inline sm:ml-4 font-normal text-3xl sm:text-5xl tracking-normal">
                    EG
                  </span>
                </h1>

                {/* Quote with elegant human typographic framing */}
                <div className={`border-zinc-800 py-2.5 ${isAr ? 'border-r-2 pr-5 text-right' : 'border-l-2 pl-5 text-left'} space-y-2.5`}>
                  <p className="text-2xl sm:text-3xl font-black text-white leading-tight font-cairo tracking-wide">
                    {isAr ? 'مُتَمَرِّدٌ بِطَبْعِكْ • اِكْسِرْ قَوَاعِدَ الْمَوضَة' : 'RAW REBELS • BREAK THE CODE'}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-400 font-semibold font-cairo leading-relaxed">
                    {isAr 
                      ? 'تصاميم أوفرسايز جريئة مستوحاة من ثقافة الشارع البديلة بمصر. قطن مصري فاخر ١٠٠٪ مُصمّم ليتحمل حركتك اليومية.' 
                      : 'Heavyweight oversized streetwear inspired by alternative youth culture. Premium Egyptian cotton built for the concrete.'}
                  </p>
                </div>
              </div>

              {/* STATS BENTO ROW - English numbers for premium digital aesthetic */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-900">
                {/* Stat 1: Posts */}
                <div className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-2xl flex flex-col justify-center items-center text-center group hover:border-zinc-800 transition-all duration-300">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-1">
                    {isAr ? 'المنشورات' : 'POSTS'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg font-black font-display text-white group-hover:scale-105 transition-transform">
                      298
                    </span>
                    <Instagram className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                </div>

                {/* Stat 2: Followers */}
                <div className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-2xl flex flex-col justify-center items-center text-center group hover:border-zinc-800 transition-all duration-300">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-1">
                    {isAr ? 'المتابعين' : 'FOLLOWERS'}
                  </span>
                  <span className="text-base sm:text-lg font-black font-display text-white group-hover:scale-105 transition-transform">
                    2.1M
                  </span>
                </div>

                {/* Stat 3: Fast Shipping */}
                <div className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-2xl flex flex-col justify-center items-center text-center group hover:border-zinc-800 transition-all duration-300 col-span-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-1">
                    {isAr ? 'الشحن' : 'SHIPPING'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-black text-emerald-400 font-cairo">
                      {isAr ? 'شحن فوري' : 'Instant EG'}
                    </span>
                    <Truck className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>

            </motion.div>

            {/* RIGHT COLUMN: INTERACTIVE STREET LOOKBOOK SLIDESHOW (5/12 cols) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="lg:col-span-5 relative min-h-[350px] lg:min-h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-zinc-900 select-none cursor-grab active:cursor-grabbing"
            >
              {/* Image Transition Slider */}
              <div className="absolute inset-0 bg-zinc-950">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={lookbookIndex}
                    src={lookbookSlides[lookbookIndex].src}
                    alt={lookbookSlides[lookbookIndex].label}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 0.85, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="h-full w-full object-cover pointer-events-none"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
                
                {/* Vignette Overlay for premium editorial feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/40 pointer-events-none"></div>
              </div>

              {/* Lookbook metadata tags */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
                    {isAr ? 'كتالوج ريترو المباشر • اسحب للتبديل' : 'RETRO LIVE LOOKBOOK • SWIPE TO CHANGE'}
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={lookbookIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-xs sm:text-sm font-black tracking-wider uppercase font-sans text-white"
                    >
                      {isAr ? lookbookSlides[lookbookIndex].labelAr : lookbookSlides[lookbookIndex].label}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Slideshow Buttons */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setLookbookIndex(prev => (prev - 1 + lookbookSlides.length) % lookbookSlides.length)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setLookbookIndex(prev => (prev + 1) % lookbookSlides.length)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tiny Slide indicator dots */}
              <div className="absolute top-6 right-6 flex gap-1 z-10">
                {lookbookSlides.map((_, idx) => (
                  <span 
                    key={idx}
                    onClick={() => setLookbookIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === lookbookIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                  ></span>
                ))}
              </div>

            </motion.div>
          </div>
        </div>

        {/* SECTION NAVIGATION & PREMIUM FILTERBAR */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="catalog-controls">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-zinc-950 uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-zinc-900" />
              {isAr ? 'تصفح ملابس الشارع' : 'BROWSING STREET DROP'}
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              {isAr ? 'قطن مصري ثقيل ممتاز • تصميم مريح للجسم' : 'Heavyweight Premium Cotton • Unisex Loose Fit'}
            </p>
          </div>

          {/* Filtering bento box */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-200/60 rounded-xl max-w-full overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white shadow-sm scale-105'
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
              >
                {isAr ? cat.labelAr : cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCTS DYNAMIC GRID - Side-by-side on mobile! */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8" id="products-grid">
          {filteredProducts.map((product) => {
            const saveAmount = product.originalPrice ? product.originalPrice - product.price : 0;
            return (
              <div
                key={product.id}
                onClick={() => openProductDetails(product)}
                className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-150 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 cursor-pointer aspect-[3/4]"
                id={`product-card-${product.id}`}
              >
                {/* Full-width Product Image covering card corner-to-corner */}
                <img
                  src={product.image}
                  alt={isAr ? product.nameAr : product.name}
                  className="h-full w-full object-cover object-center transition-all duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />

                {/* Ambient vignette at the bottom on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white space-y-1 w-full">
                    <span className="text-[9px] font-black tracking-widest text-zinc-300 uppercase block font-mono">
                      {isAr ? product.categoryAr : product.category}
                    </span>
                    <p className="text-xs sm:text-sm font-black tracking-wide uppercase font-display line-clamp-1">
                      {isAr ? product.nameAr : product.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-mono">
                        {product.price} EGP
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-zinc-400 line-through font-mono">
                          {product.originalPrice} EGP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* High-contrast floating price tag (Always visible, clean, no text clutter) */}
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-black tracking-wider px-2.5 py-1.5 rounded-lg border border-white/10 font-mono shadow-md z-10">
                  {product.price} EGP
                </div>

                {/* Floating Discount badge if applicable */}
                {saveAmount > 0 && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-md tracking-wider animate-pulse uppercase shadow-md z-10 font-display">
                    {isAr ? 'خصم' : 'SALE'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-zinc-300 mt-6">
            <p className="text-zinc-500 font-bold">{isAr ? 'لم يتم العثور على ملابس في هذا القسم.' : 'No items found in this collection.'}</p>
          </div>
        )}
      </div>

    </section>
  );
};
