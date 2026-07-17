/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCatalog } from './components/ProductCatalog';
import { CartDrawer } from './components/CartDrawer';
import { OrderTracker } from './components/OrderTracker';
import { AdminPanel } from './components/AdminPanel';
import { INITIAL_PRODUCTS } from './data/products';
import { CartItem, Order, OrderStatus, Product, TrackingStep } from './types';
import { Sparkles, MessageSquare, ShieldCheck, ShoppingBag, Send } from 'lucide-react';

export default function App() {
  // Locale translation and view control
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [currentView, setCurrentView] = useState<'shop' | 'tracker' | 'admin'>('shop');
  
  // App-wide state
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // AI Assistant Chatbot state (Optional, beautiful addition for modern high-fashion shop)
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: language === 'ar' 
        ? 'أهلاً بك في ريترو! أنا مرشد التنسيق الخاص بك. أسألني عن المقاسات، تنسيق الألوان أو تتبع الشحنات.' 
        : 'Welcome to RETRO! I am your street-style styling advisor. Ask me anything about sizing, fabric weight, or tracking.'
    }
  ]);

  // Load state from backend database API on init
  useEffect(() => {
    // 1. Load products from backend REST API
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Error fetching products:', err));

    // 2. Load Cart from client local storage
    const storedCart = localStorage.getItem('retro_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    // 3. Load orders from backend REST API
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error('Error fetching orders:', err));
  }, []);

  // Update Cart localStorage helper (cart stays local, which is correct for visitors)
  const saveCartToStorage = (newCart: CartItem[]) => {
    localStorage.setItem('retro_cart', JSON.stringify(newCart));
    setCartItems(newCart);
  };

  // CART LOGIC CALLBACKS
  const handleAddToCart = (product: Product, size: string, color: any, quantity: number) => {
    const existingIndex = cartItems.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedSize === size &&
        item.selectedColor.name === color.name
    );

    if (existingIndex > -1) {
      const updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += quantity;
      saveCartToStorage(updatedCart);
    } else {
      const newCartItem: CartItem = {
        product,
        selectedSize: size,
        selectedColor: color,
        quantity,
      };
      saveCartToStorage([...cartItems, newCartItem]);
    }
  };

  const handleUpdateQuantity = (productId: string, size: string, colorName: string, q: number) => {
    if (q <= 0) {
      handleRemoveItem(productId, size, colorName);
      return;
    }
    const updated = cartItems.map((item) => {
      if (
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor.name === colorName
      ) {
        return { ...item, quantity: q };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  const handleRemoveItem = (productId: string, size: string, colorName: string) => {
    const filtered = cartItems.filter(
      (item) =>
        !(
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor.name === colorName
        )
    );
    saveCartToStorage(filtered);
  };

  const handlePlaceOrder = (newOrder: Order) => {
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    })
      .then((res) => res.json())
      .then((savedOrder) => {
        setOrders((prev) => [savedOrder, ...prev]);
        saveCartToStorage([]);
      })
      .catch((err) => console.error('Error placing order:', err));
  };

  // ADMIN OPERATIONS CALLBACKS
  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus, newStep: TrackingStep) => {
    fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nextStatus, newStep }),
    })
      .then((res) => res.json())
      .then((updatedOrder) => {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      })
      .catch((err) => console.error('Error updating status:', err));
  };

  const handleAddProduct = (newProduct: Product) => {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })
      .then((res) => res.json())
      .then((savedProduct) => {
        setProducts((prev) => [savedProduct, ...prev]);
      })
      .catch((err) => console.error('Error adding product:', err));
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: newPrice }),
    })
      .then((res) => res.json())
      .then((updatedProduct) => {
        setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)));
      })
      .catch((err) => console.error('Error updating price:', err));
  };

  const handleToggleStock = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inStock: !p.inStock }),
    })
      .then((res) => res.json())
      .then((updatedProduct) => {
        setProducts((prev) => prev.map((prod) => (prod.id === productId ? updatedProduct : prod)));
      })
      .catch((err) => console.error('Error toggling stock:', err));
  };

  const handleLogoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setCurrentView('shop');
  };

  // MOCK AI STYLING CHATBOT REPLIES
  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;

    const userMsg = aiMessage.trim();
    const updatedChat = [...aiChat, { role: 'user' as const, text: userMsg }];
    setAiChat(updatedChat);
    setAiMessage('');

    // Formulate a beautiful streetwear styled reply matching Retro EG brand
    setTimeout(() => {
      let response = '';
      const lowercaseMsg = userMsg.toLowerCase();

      if (lowercaseMsg.includes('مقاس') || lowercaseMsg.includes('size') || lowercaseMsg.includes('سعر')) {
        response = language === 'ar'
          ? 'المقاسات لدينا أوفرسايز (Oversized) لتمنحك الراحة والمظهر العصري. للوزن من ٥٥-٧٠ كجم نوصي بـ M، ولـ ٧٠-٨٥ كجم بـ L، ولـ ٨٥-١٠٠ كجم بـ XL، وأكثر من ١٠٠ كجم بـ XXL. الأسعار معروضة بكل قطعة وتبدأ من ٦٥٠ جنيه مصري!'
          : 'Our clothing fits are Oversized boxy for a premium drape. M fits 55-70kg, L fits 70-85kg, XL fits 85-100kg, XXL fits 100-120kg. Retail prices start from 650 EGP!';
      } else if (lowercaseMsg.includes('توصيل') || lowercaseMsg.includes('شحن') || lowercaseMsg.includes('delivery')) {
        response = language === 'ar'
          ? 'الشحن يستغرق ٢-٣ أيام عمل للقاهرة والجيزة (تكلفة ٥٠ ج.م)، و٣-٤ أيام عمل للإسكندرية والمحافظات الأخرى. يمكنك متابعة خط سير المندوب في صفحة التتبع بالرقم الخاص بك!'
          : 'Delivery takes 2-3 business days in Cairo/Giza (50 EGP), and 3-4 days to Alexandria and Delta region. Paste your tracking code on our Order Logistics screen for live updates.';
      } else if (lowercaseMsg.includes('خامة') || lowercaseMsg.includes('قطن') || lowercaseMsg.includes('fabric') || lowercaseMsg.includes('cotton')) {
        response = language === 'ar'
          ? 'نحن نستخدم أجود أنواع القطن المصري الممتاز ذو الوزن الثقيل (Heavyweight) مثل الفرينش تيري ٤٠٠ جرام للهوديز والسينجل جيرسي ٢٦٠ جرام للتيشرتات. جميع القطع معالجة ضد الانكماش.'
          : 'We utilize ultra-premium Egyptian cotton (400 GSM brushed fleece for hoodies and 260 GSM single jersey for tees). Pre-shrunk and built to last.';
      } else {
        response = language === 'ar'
          ? 'رائع! ملابس ريترو صممت خصيصاً لتكسر جميع قواعد الموضة التقليدية. هل تود أن أساعدك في اختيار مقاس قطعة معينة أو إتمام الدفع؟'
          : 'Awesome choice! Retro garments are designed to break traditional fashion boundaries. Need help selecting sizes or understanding our Vodafone Cash checkout process?';
      }

      setAiChat((prev) => [...prev, { role: 'assistant', text: response }]);
    }, 1000);
  };

  const isAr = language === 'ar';
  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`min-h-screen bg-zinc-50 flex flex-col font-sans ${isAr ? 'rtl' : 'ltr'}`} dir={isAr ? 'rtl' : 'ltr'} id="app-root-container">
      
      {/* Primary Brand Navbar Header */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        currentView={currentView}
        setCurrentView={setCurrentView}
        cartCount={cartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Core Content Views */}
      <main className="flex-grow">
        {currentView === 'shop' && (
          <ProductCatalog
            products={products}
            language={language}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentView === 'tracker' && (
          <OrderTracker
            orders={orders}
            language={language}
          />
        )}

        {currentView === 'admin' && (
          <AdminPanel
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProductPrice={handleUpdateProductPrice}
            onToggleStock={handleToggleStock}
            language={language}
            isAdminLoggedIn={isAdminLoggedIn}
            setIsAdminLoggedIn={setIsAdminLoggedIn}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-zinc-200 py-10" id="app-footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center">
            <span className="font-black text-sm tracking-widest font-sans uppercase">
              R E T R O &nbsp; E G
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium">
            © {new Date().getFullYear()} RETRO STREETWEAR EG. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <div className="flex justify-center gap-4 text-[11px] text-zinc-400 font-mono">
            <a href="https://instagram.com/retro__eg1" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">@retro__eg1</a>
            <span>•</span>
            <span>{isAr ? 'صنع في مصر بكل فخر' : 'Proudly Made in Egypt'}</span>
          </div>
        </div>
      </footer>

      {/* Cart Slider Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onPlaceOrder={handlePlaceOrder}
        language={language}
      />

      {/* RETRO AI CUSTOMER BOT BUTTON (floating) */}
      <div className="fixed bottom-6 left-6 z-30" id="ai-chat-bubble">
        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
          title={isAr ? 'مستشار الموضة ريترو' : 'Styling Assistant'}
        >
          {isAiOpen ? (
            <span className="text-sm font-extrabold font-mono">X</span>
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
        </button>

        {isAiOpen && (
          <div className="absolute bottom-16 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col h-96 animate-slideIn">
            {/* Header */}
            <div className="bg-zinc-950 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-zinc-400 animate-spin" />
                <span className="text-xs font-black uppercase tracking-wider font-sans">Retro Styling Bot</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50 text-xs">
              {aiChat.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] rounded-2xl px-3 py-2 leading-relaxed ${
                    msg.role === 'assistant'
                      ? 'bg-zinc-200 text-zinc-950 rounded-tl-none mr-auto text-left'
                      : 'bg-black text-white rounded-tr-none ml-auto text-right'
                  }`}
                  style={{ direction: msg.role === 'assistant' ? 'ltr' : 'rtl' }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSendAiMessage} className="p-2 border-t border-zinc-200 flex bg-white">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder={isAr ? 'اسأل عن خامة القماش، المقاسات...' : 'Ask about fabric weight, sizes...'}
                className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                className="bg-zinc-950 text-white p-2.5 rounded-lg hover:bg-zinc-800 transition-colors ml-1.5"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
