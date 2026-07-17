/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, OrderStatus, Product, TrackingStep } from '../types';
import {
  Lock, LayoutDashboard, ShoppingBag, FolderKanban, TrendingUp, DollarSign,
  PackageCheck, RefreshCw, Layers, CheckCircle, Trash2, Edit3, Eye, FileText, Check, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminPanelProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, timelineStep: TrackingStep) => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  onToggleStock: (productId: string) => void;
  language: 'ar' | 'en';
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  onUpdateOrderStatus,
  products,
  onAddProduct,
  onUpdateProductPrice,
  onToggleStock,
  language,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
}) => {
  const isAr = language === 'ar';
  
  // Login Gate State
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Tabs inside admin panel: 'dashboard' | 'orders' | 'products'
  const [adminTab, setAdminTab] = useState<'dashboard' | 'orders' | 'products'>('dashboard');

  // Order filtration
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Product Form fields
  const [newProdName, setNewProdName] = useState('');
  const [newProdNameAr, setNewProdNameAr] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdDescAr, setNewProdDescAr] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Hoodies');
  const [newProdImage, setNewProdImage] = useState('/src/assets/images/retro_hoodie_1784140861378.jpg'); // default helper
  const [formSuccess, setFormSuccess] = useState(false);

  // Price Edit State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceVal, setEditingPriceVal] = useState('');

  // Handle Passcode login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234') {
      setIsAdminLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasscode('');
    }
  };

  // Status transitions logger details maker
  const triggerStatusChange = (order: Order, nextStatus: OrderStatus) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Make customized remarks
    let remarks = `Status updated to ${nextStatus}`;
    let remarksAr = `تم تحديث حالة الشحن إلى ${nextStatus}`;

    if (nextStatus === 'processing') {
      remarks = 'Our warehouse staff is packaging your streetwear items carefully.';
      remarksAr = 'يقوم طاقم المستودع الآن بتجهيز وتعبئة ملابس الشارع الخاصة بك بعناية.';
    } else if (nextStatus === 'shipped') {
      remarks = 'Shipment handed over to Express Courier Delivery network.';
      remarksAr = 'تم تسليم الطرد لشركة الشحن السريع لبدء الشحن.';
    } else if (nextStatus === 'out_for_delivery') {
      remarks = 'Local courier Aly is on the way. Keep your mobile phone active.';
      remarksAr = 'المندوب في منطقتك اليوم وسيقوم بالاتصال بك قريباً للتسليم.';
    } else if (nextStatus === 'delivered') {
      remarks = 'Enjoy your RETRO garments. Unbound fashion rules apply!';
      remarksAr = 'تم التوصيل بنجاح! نأمل أن تستمتع بملابس ريترو.';
    } else if (nextStatus === 'cancelled') {
      remarks = 'Order cancelled due to transaction void.';
      remarksAr = 'تم إلغاء الطلب لمشكلة بالمعاملة أو بناء على رغبتك.';
    }

    const step: TrackingStep = {
      status: nextStatus,
      title: nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1).replace(/_/g, ' '),
      titleAr: nextStatus === 'processing' ? 'قيد التجهيز والتحضير' :
               nextStatus === 'shipped' ? 'تم الشحن للتوصيل' :
               nextStatus === 'out_for_delivery' ? 'خرج مع المندوب للتسليم' :
               nextStatus === 'delivered' ? 'تم التوصيل بنجاح' : 'تم الإلغاء',
      description: remarks,
      descriptionAr: remarksAr,
      timestamp: formattedDate,
      completed: true
    };

    onUpdateOrderStatus(order.id, nextStatus, step);
  };

  // Product submission
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    const newProduct: Product = {
      id: `retro-${Date.now()}`,
      name: newProdName.toUpperCase(),
      nameAr: newProdNameAr || newProdName,
      description: newProdDesc || 'Premium retro streetwear apparel.',
      descriptionAr: newProdDescAr || 'قطعة ملابس ريترو فاخرة ومميزة.',
      price: Number(newProdPrice),
      image: newProdImage,
      category: newProdCategory,
      categoryAr: newProdCategory === 'Hoodies' ? 'هوديز' :
                  newProdCategory === 'T-Shirts' ? 'تيشرتات' :
                  newProdCategory === 'Pants' ? 'بناطيل' : 'جاكيتات',
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: [{ name: 'Default Black', nameAr: 'أسود أساسي', class: 'bg-zinc-900 border-zinc-700' }],
      inStock: true,
      details: ['Oversized comfortable streetwear fit', 'High quality premium heavy cotton fabric'],
      detailsAr: ['قصة أوفرسايز مريحة وعصرية', 'قماش قطني ثقيل فاخر ممتاز عالي الجودة'],
      material: '100% Cotton',
      materialAr: '100% قطن مصري ممتاز'
    };

    onAddProduct(newProduct);
    setFormSuccess(true);
    
    // Clear inputs
    setNewProdName('');
    setNewProdNameAr('');
    setNewProdDesc('');
    setNewProdDescAr('');
    setNewProdPrice('');
    
    setTimeout(() => setFormSuccess(false), 2000);
  };

  // Price submission edit
  const savePriceEdit = (id: string) => {
    const prc = Number(editingPriceVal);
    if (!isNaN(prc) && prc > 0) {
      onUpdateProductPrice(id, prc);
    }
    setEditingPriceId(null);
  };

  // ANALYTICS CALCULATIONS
  const totalSales = orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.totalAmount, 0);
  const totalOrders = orders.length;
  const averageBasketValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const pendingShipments = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    const matchesFilter = orderFilter === 'all' ? true : o.status === orderFilter;
    const matchesSearch = o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customerPhone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  // Secure Passcode Entry Card
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-zinc-50 px-4" id="admin-login-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center text-black mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black text-black uppercase tracking-wider">
              {isAr ? 'بوابة إدارة ريترو' : 'RETRO Admin Portal'}
            </h2>
            <p className="text-xs text-zinc-500">
              {isAr ? 'أدخل رمز المرور السري للتحكم بالطلبات وتحديث حالات الشحن.' : 'Enter secret administrative code to manage operations.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                {isAr ? 'رمز المرور الإداري (التجريبي: 1234)' : 'Secret Passcode (Demo: 1234)'}
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••"
                className="w-full border border-zinc-200 rounded-xl px-4 py-3.5 text-center font-bold tracking-[1em] text-lg bg-zinc-50 focus:bg-white focus:border-black focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-shake">
                <AlertTriangle className="h-4 w-4" />
                <span>{isAr ? 'رمز المرور غير صحيح!' : 'Incorrect passcode. Try 1234.'}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black hover:bg-zinc-900 text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-md"
            >
              {isAr ? 'تسجيل الدخول الآمن' : 'Secure Login'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 min-h-screen pb-16" id="admin-operations-panel">
      
      {/* Top Banner Sub-Header */}
      <div className="bg-white border-b border-zinc-200 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-zinc-950 text-white rounded-xl">
              <FolderKanban className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-black uppercase tracking-wider">
                {isAr ? 'لوحة تحكم ريترو للعمليات والطلبات' : 'RETRO Central Logistics Console'}
              </h1>
              <p className="text-xs text-zinc-500 font-mono">
                {isAr ? 'حساب الإدارة نشط ومصرح بالكامل' : 'Admin Status: Connected & Authorized'}
              </p>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-zinc-100 p-1.5 rounded-xl border border-zinc-200">
            <button
              onClick={() => setAdminTab('dashboard')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                adminTab === 'dashboard' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{isAr ? 'الملخص' : 'Metrics'}</span>
            </button>
            <button
              onClick={() => setAdminTab('orders')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                adminTab === 'orders' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{isAr ? 'الطلبات' : 'Orders'} ({orders.length})</span>
            </button>
            <button
              onClick={() => setAdminTab('products')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                adminTab === 'products' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{isAr ? 'الملابس' : 'Clothing'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">

        {/* ================================== TAB 1: METRICS SUMMARY ================================== */}
        {adminTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn" id="admin-metrics-tab">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                    {isAr ? 'إجمالي المبيعات المؤكدة:' : 'Confirmed Net Revenue:'}
                  </span>
                  <p className="mt-1.5 text-2xl font-black text-black font-mono">{totalSales} EGP</p>
                </div>
                <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                    {isAr ? 'إجمالي عدد الطلبات الكلي:' : 'Total Volume Placed:'}
                  </span>
                  <p className="mt-1.5 text-2xl font-black text-black font-mono">{totalOrders}</p>
                </div>
                <div className="p-3.5 bg-zinc-100 text-zinc-800 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                    {isAr ? 'متوسط قيمة سلة التسوق:' : 'Average Order Basket:'}
                  </span>
                  <p className="mt-1.5 text-2xl font-black text-black font-mono">{averageBasketValue} EGP</p>
                </div>
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 font-mono">
                    {isAr ? 'الشحنات النشطة قيد المتابعة:' : 'Active Deliveries Pending:'}
                  </span>
                  <p className="mt-1.5 text-2xl font-black text-black font-mono">{pendingShipments}</p>
                </div>
                <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
                  <PackageCheck className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Graphical Analytics using raw custom SVGs for perfect responsive design */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Sales over cities SVG Bar Chart */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase">
                      {isAr ? 'التوزيع الإقليمي للمبيعات (ج.م)' : 'Regional Sales Distribution (EGP)'}
                    </h3>
                    <p className="text-xs text-zinc-400">{isAr ? 'أداء الشحن والمبيعات في المحافظات الكبرى' : 'Distribution of revenue across regions'}</p>
                  </div>
                </div>

                {/* High quality custom SVG chart */}
                <div className="h-64 flex items-end justify-between gap-2 pt-6 font-mono text-[10px]">
                  {/* Cairo */}
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <span className="font-bold text-zinc-900 mb-1">50%</span>
                    <div className="w-full bg-zinc-950 rounded-t-lg transition-all duration-1000 h-[80%] hover:bg-zinc-800"></div>
                    <span className="text-zinc-500 mt-2 font-sans text-center truncate w-full">{isAr ? 'القاهرة' : 'Cairo'}</span>
                  </div>
                  {/* Giza */}
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <span className="font-bold text-zinc-900 mb-1">25%</span>
                    <div className="w-full bg-zinc-700 rounded-t-lg transition-all duration-1000 h-[45%] hover:bg-zinc-800"></div>
                    <span className="text-zinc-500 mt-2 font-sans text-center truncate w-full">{isAr ? 'الجيزة' : 'Giza'}</span>
                  </div>
                  {/* Alex */}
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <span className="font-bold text-zinc-900 mb-1">15%</span>
                    <div className="w-full bg-zinc-500 rounded-t-lg transition-all duration-1000 h-[30%] hover:bg-zinc-800"></div>
                    <span className="text-zinc-500 mt-2 font-sans text-center truncate w-full">{isAr ? 'الإسكندرية' : 'Alex'}</span>
                  </div>
                  {/* Delta / Other */}
                  <div className="flex flex-col items-center flex-1 h-full justify-end">
                    <span className="font-bold text-zinc-900 mb-1">10%</span>
                    <div className="w-full bg-zinc-300 rounded-t-lg transition-all duration-1000 h-[20%] hover:bg-zinc-800"></div>
                    <span className="text-zinc-500 mt-2 font-sans text-center truncate w-full">{isAr ? 'الأقاليم' : 'Delta'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Split Pie layout inside dashboard */}
              <div className="bg-white p-6 rounded-3xl border border-zinc-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 uppercase">
                    {isAr ? 'تفضيلات وسائل الدفع' : 'Payment Type Metrics'}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4">{isAr ? 'معدلات المعاملات المالية بالمنصة' : 'Ratio of payment options chosen by customers'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center flex-1">
                  {/* Custom Graphic layout circles represent percentages */}
                  <div className="relative flex justify-center">
                    {/* Ring simulation */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="50" fill="transparent" stroke="#E4E4E7" strokeWidth="12" />
                      {/* COD ring: 60% */}
                      <circle cx="64" cy="64" r="50" fill="transparent" stroke="#18181B" strokeWidth="12" strokeDasharray="314" strokeDashoffset="125" />
                      {/* Vodafone Cash: 30% */}
                      <circle cx="64" cy="64" r="50" fill="transparent" stroke="#E11D48" strokeWidth="12" strokeDasharray="314" strokeDashoffset="220" transform="rotate(216, 64, 64)" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-zinc-950">
                      <span className="font-black text-lg">COD</span>
                      <span className="text-[10px] text-zinc-400">60% dominant</span>
                    </div>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-zinc-950 border border-black/10 block"></span>
                      <div>
                        <span className="font-bold text-zinc-800 block">{isAr ? 'الدفع عند الاستلام' : 'Cash On Delivery'}</span>
                        <span className="text-[10px] text-zinc-400">60% of volume</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-rose-600 border border-black/10 block"></span>
                      <div>
                        <span className="font-bold text-zinc-800 block">{isAr ? 'كاش المحافظ' : 'Mobile Wallet Cash'}</span>
                        <span className="text-[10px] text-zinc-400">30% of volume</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-zinc-300 border border-black/10 block"></span>
                      <div>
                        <span className="font-bold text-zinc-800 block">{isAr ? 'بطاقة ائتمان' : 'Card Payments'}</span>
                        <span className="text-[10px] text-zinc-400">10% of volume</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================================== TAB 2: ACTIVE ORDERS LIST ================================== */}
        {adminTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn" id="admin-orders-tab">
            
            {/* Search and Filter strip */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-2xl border border-zinc-200">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder={isAr ? 'ابحث بالاسم، الكود، أو المحمول...' : 'Search by name, ID, mobile...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-black text-zinc-900 placeholder-zinc-400 font-bold"
                />
              </div>

              {/* Status Filter buttons */}
              <div className="flex flex-wrap gap-1">
                {['all', 'placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                      orderFilter === st
                        ? 'bg-zinc-950 text-white shadow-sm'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                  >
                    {st === 'all' ? (isAr ? 'الكل' : 'All') : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Data Table list */}
            <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm" id="orders-list-table">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <PackageCheck className="h-10 w-10 text-zinc-300 mx-auto" />
                  <h3 className="text-xs font-bold text-zinc-500">
                    {isAr ? 'لا توجد طلبات مطابقة للبحث حالياً.' : 'No orders match this status or search criteria.'}
                  </h3>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                        <th className="p-4">{isAr ? 'كود الشحنة' : 'ID'}</th>
                        <th className="p-4">{isAr ? 'العميل المستلم' : 'Recipient'}</th>
                        <th className="p-4">{isAr ? 'المحافظة بالتفصيل' : 'Destination'}</th>
                        <th className="p-4">{isAr ? 'القطع المطلوبة' : 'Items'}</th>
                        <th className="p-4">{isAr ? 'وسيلة الدفع' : 'Payment'}</th>
                        <th className="p-4">{isAr ? 'الإجمالي' : 'Total'}</th>
                        <th className="p-4">{isAr ? 'الحالة الحالية' : 'Current Status'}</th>
                        <th className="p-4 text-right">{isAr ? 'التحكم بالطلب' : 'Logistics Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-sans text-zinc-700">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                          {/* Order ID */}
                          <td className="p-4 font-mono font-bold text-black">{order.id}</td>
                          
                          {/* Recipient info */}
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-zinc-950">{order.customerName}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">{order.customerPhone}</span>
                            </div>
                          </td>

                          {/* Destination */}
                          <td className="p-4">
                            <div className="flex flex-col max-w-[120px]">
                              <span className="font-bold text-zinc-900">{isAr ? order.cityAr : order.city}</span>
                              <span className="text-[10px] text-zinc-400 truncate" title={order.address}>{order.address}</span>
                            </div>
                          </td>

                          {/* Items list inline */}
                          <td className="p-4">
                            <div className="flex flex-col gap-1 max-w-[150px]">
                              {order.items.map((item, id) => (
                                <span key={id} className="truncate text-[10px] bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 block">
                                  {item.size} • {isAr ? item.colorNameAr : item.colorName} • {item.quantity}x {isAr ? item.productNameAr : item.productName}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Payment method specs */}
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className={`font-bold font-mono text-[10px] uppercase ${order.paymentMethod === 'vodafone_cash' ? 'text-rose-600' : 'text-zinc-700'}`}>
                                {order.paymentMethod === 'vodafone_cash' ? 'Wallet' : order.paymentMethod.toUpperCase()}
                              </span>
                              {order.paymentMethod === 'vodafone_cash' && order.paymentDetails?.walletNumber && (
                                <span className="text-[9px] text-zinc-400 font-mono">
                                  From: {order.paymentDetails.walletNumber}
                                  {order.paymentDetails.transactionId && ` (ID: ${order.paymentDetails.transactionId})`}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="p-4 font-mono font-bold text-black">{order.totalAmount} EGP</td>

                          {/* Current Status Indicator */}
                          <td className="p-4">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold font-mono uppercase ${
                              order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                              order.status === 'shipped' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                              order.status === 'out_for_delivery' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {order.status}
                            </span>
                          </td>

                          {/* Action drop buttons */}
                          <td className="p-4 text-right">
                            <div className="flex flex-wrap gap-1 justify-end">
                              {/* Processing Button */}
                              {order.status === 'placed' && (
                                <button
                                  onClick={() => triggerStatusChange(order, 'processing')}
                                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-bold px-2 py-1 rounded"
                                  title="Move to Processing"
                                >
                                  {isAr ? 'تجهيز' : 'Process'}
                                </button>
                              )}

                              {/* Shipped button */}
                              {order.status === 'processing' && (
                                <button
                                  onClick={() => triggerStatusChange(order, 'shipped')}
                                  className="bg-zinc-900 hover:bg-black text-white text-[10px] font-bold px-2 py-1 rounded"
                                  title="Ship Order"
                                >
                                  {isAr ? 'شحن' : 'Ship'}
                                </button>
                              )}

                              {/* Out for Delivery */}
                              {order.status === 'shipped' && (
                                <button
                                  onClick={() => triggerStatusChange(order, 'out_for_delivery')}
                                  className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-2 py-1 rounded"
                                  title="Out for Delivery"
                                >
                                  {isAr ? 'توصيل' : 'Out'}
                                </button>
                              )}

                              {/* Delivered button */}
                              {order.status === 'out_for_delivery' && (
                                <button
                                  onClick={() => triggerStatusChange(order, 'delivered')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-1 rounded"
                                  title="Complete Delivery"
                                >
                                  {isAr ? 'استلم' : 'Deliver'}
                                </button>
                              )}

                              {/* Cancel Button */}
                              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <button
                                  onClick={() => triggerStatusChange(order, 'cancelled')}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded"
                                  title="Cancel"
                                >
                                  {isAr ? 'إلغاء' : 'Cancel'}
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================== TAB 3: PRODUCTS & EXTRAS MANAGEMENT ================================== */}
        {adminTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn" id="admin-clothing-tab">
            
            {/* Adding Product panel form */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 h-fit space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase">
                  {isAr ? 'إضافة قطعة ملابس جديدة' : 'Add New Streetwear'}
                </h3>
                <p className="text-xs text-zinc-400">{isAr ? 'قم بإدخال مواصفات القطعة لرفعها على المتجر فوراً' : 'Publish new clothing designs directly'}</p>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-4">
                {formSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-bounce">
                    <Check className="h-4 w-4" />
                    <span>{isAr ? 'تمت إضافة القطعة بنجاح!' : 'Published successfully!'}</span>
                  </div>
                )}

                {/* Name EN */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
                    {isAr ? 'اسم القطعة بالإنجليزي *' : 'Apparel Name (EN) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. RETRO METEOR HOODIE"
                    className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                {/* Name AR */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
                    {isAr ? 'اسم القطعة بالعربي *' : 'Apparel Name (AR) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdNameAr}
                    onChange={(e) => setNewProdNameAr(e.target.value)}
                    placeholder="مثال: هودي ميترو الكلاسيكي"
                    className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                {/* Category choice */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
                    {isAr ? 'القسم / التصنيف *' : 'Category Category *'}
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="Hoodies">{isAr ? 'هوديز' : 'Hoodies'}</option>
                    <option value="T-Shirts">{isAr ? 'تيشرتات' : 'T-Shirts'}</option>
                    <option value="Pants">{isAr ? 'بناطيل' : 'Pants'}</option>
                    <option value="Jackets">{isAr ? 'جاكيتات' : 'Jackets'}</option>
                  </select>
                </div>

                {/* Price EGP */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
                    {isAr ? 'السعر (بالجنيه المصري) *' : 'Price in EGP *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="e.g. 850"
                    className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-black font-mono font-bold"
                  />
                </div>

                {/* Image Drop URL */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
                    {isAr ? 'صورة القطعة (أختر من الصور التجريبية المدمجة) *' : 'Select Pre-generated Product Mockup *'}
                  </label>
                  <select
                    value={newProdImage}
                    onChange={(e) => setNewProdImage(e.target.value)}
                    className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-xs bg-white focus:outline-none"
                  >
                    <option value="/src/assets/images/retro_hoodie_1784140861378.jpg">Retro Hoodie Template</option>
                    <option value="/src/assets/images/retro_tee_1784140871626.jpg">Retro Tee Template</option>
                    <option value="/src/assets/images/retro_cargo_1784140882129.jpg">Retro Cargo Template</option>
                    <option value="/src/assets/images/retro_jacket_1784140892340.jpg">Retro Jacket Template</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black hover:bg-zinc-900 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-sm"
                >
                  {isAr ? 'نشر وتثبيت في المتجر' : 'Publish Design'}
                </button>
              </form>
            </div>

            {/* Existing products listing editor */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-zinc-200 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase">
                  {isAr ? 'تحديث وتعديل أسعار الملابس المتوفرة' : 'Storefront inventory & price controller'}
                </h3>
                <p className="text-xs text-zinc-400">{isAr ? 'تحكم فوراً بأسعار المنتجات ووضع المخزون' : 'Toggle stock availability or edit active retail prices'}</p>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-4 p-4 border border-zinc-100 rounded-2xl bg-zinc-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="h-12 w-12 rounded-xl object-cover bg-zinc-200 flex-shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase font-mono">{isAr ? product.categoryAr : product.category}</span>
                        <h4 className="text-xs font-bold text-zinc-900 uppercase truncate max-w-[180px]">{isAr ? product.nameAr : product.name}</h4>
                        <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${product.inStock ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                          {product.inStock ? (isAr ? 'متوفر بالمخزن' : 'In Stock') : (isAr ? 'نفذت الكمية' : 'Out of Stock')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Price input field edit */}
                      {editingPriceId === product.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editingPriceVal}
                            onChange={(e) => setEditingPriceVal(e.target.value)}
                            className="w-16 border border-zinc-300 rounded px-2 py-1 text-xs text-center font-mono font-bold"
                          />
                          <button
                            onClick={() => savePriceEdit(product.id)}
                            className="p-1 bg-black text-white rounded hover:bg-zinc-800"
                            title="Save"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-black font-mono">
                            {product.price} EGP
                          </span>
                          <button
                            onClick={() => { setEditingPriceId(product.id); setEditingPriceVal(String(product.price)); }}
                            className="p-1 hover:bg-zinc-200 rounded text-zinc-500"
                            title="Edit Price"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {/* Stock toggle */}
                      <button
                        onClick={() => onToggleStock(product.id)}
                        className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all ${
                          product.inStock
                            ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                        }`}
                      >
                        {product.inStock ? (isAr ? 'تعطيل توفره' : 'Set Out') : (isAr ? 'توفير بالمخزن' : 'Set Stock')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
