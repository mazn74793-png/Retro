/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  const [adminClicks, setAdminClicks] = useState(0);

  // AI Assistant Chatbot state (Optional, beautiful addition for modern high-fashion shop)
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: language === 'ar' 
        ? 'أهلاً بك في ريترو! أنا مرشد التنسيق الخاص بك. أسألني عن المقاسات، تنسيق الألوان أو تتبع الشحنات.' 
        : 'Welcome to RETRO! I am your street-style styling advisor. Ask me anything about sizing, fabric weight, or tracking.'
    }
  ]);

  useEffect(() => {
    if (isAiOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiChat, isAiTyping, isAiOpen]);

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

  // Helper to detect if a string contains Arabic characters
  const isMessageArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  // Helper to render formatted text with paragraphs and list items beautifully
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        return (
          <li key={index} className="list-disc list-inside ml-2 mt-1 first:mt-0 leading-relaxed font-sans text-[11.5px] opacity-95">
            {trimmed.replace(/^[-•*]\s*/, '')}
          </li>
        );
      }
      if (trimmed === '') return <div key={index} className="h-1.5" />;
      return <p key={index} className="leading-relaxed mb-1 last:mb-0 text-[11.5px] font-sans opacity-95">{line}</p>;
    });
  };

  // Click handler for quick-suggestions
  const handleQuickSuggest = (question: string) => {
    if (isAiTyping) return;
    const updatedChat = [...aiChat, { role: 'user' as const, text: question }];
    setAiChat(updatedChat);
    setIsAiTyping(true);

    fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: question,
        history: aiChat
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('API server error');
        return res.json();
      })
      .then((data) => {
        setAiChat((prev) => [...prev, { role: 'assistant', text: data.text }]);
      })
      .catch((err) => {
        console.error('Error contacting Gemini styling bot:', err);
        const errorText = language === 'ar'
          ? 'عذراً، واجهت مشكلة صغيرة في الاتصال بمساعد ريترو الذكي. حاول مجدداً يا غالي!'
          : "Oops! Sourcing from the cloud is a bit slow. Let's try that again, fam!";
        setAiChat((prev) => [...prev, { role: 'assistant', text: errorText }]);
      })
      .finally(() => {
        setIsAiTyping(false);
      });
  };

  // REAL AI STYLING CHATBOT REPLIES CALLING GEMINI BACKEND
  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim() || isAiTyping) return;

    const userMsg = aiMessage.trim();
    const updatedChat = [...aiChat, { role: 'user' as const, text: userMsg }];
    setAiChat(updatedChat);
    setAiMessage('');
    setIsAiTyping(true);

    fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMsg,
        history: aiChat
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('API server error');
        return res.json();
      })
      .then((data) => {
        setAiChat((prev) => [...prev, { role: 'assistant', text: data.text }]);
      })
      .catch((err) => {
        console.error('Error contacting Gemini styling bot:', err);
        const errorText = language === 'ar'
          ? 'عذراً، واجهت مشكلة صغيرة في الاتصال بمساعد ريترو الذكي. حاول مجدداً يا غالي!'
          : "Oops! Sourcing from the cloud is a bit slow. Let's try that again, fam!";
        setAiChat((prev) => [...prev, { role: 'assistant', text: errorText }]);
      })
      .finally(() => {
        setIsAiTyping(false);
      });
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
            onPlaceOrder={handlePlaceOrder}
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
            <span 
              className="select-none cursor-default"
              onClick={() => {
                setAdminClicks(prev => {
                  const newClicks = prev + 1;
                  if (newClicks >= 5) {
                    setCurrentView('admin');
                    return 0;
                  }
                  return newClicks;
                });
              }}
            >
              {isAr ? 'صنع في مصر بكل فخر' : 'Proudly Made in Egypt'}
            </span>
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
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-white shadow-2xl hover:scale-105 active:scale-95 hover:bg-zinc-900 transition-all focus:outline-none ring-4 ring-zinc-950/10"
          title={isAr ? 'مستشار الموضة ريترو' : 'Styling Assistant'}
        >
          {isAiOpen ? (
            <span className="text-sm font-extrabold font-mono">X</span>
          ) : (
            <>
              <MessageSquare className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] font-black items-center justify-center text-white">AI</span>
              </span>
            </>
          )}
        </button>

        {isAiOpen && (
          <div className="absolute bottom-16 left-0 w-[310px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-zinc-200/80 overflow-hidden flex flex-col h-[480px] sm:h-[520px] animate-slideIn transition-all">
            {/* Header */}
            <div className="bg-zinc-950 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-zinc-400 animate-pulse" />
                <div>
                  <span className="text-xs font-black uppercase tracking-wider font-sans block">Retro Styling AI</span>
                  <span className="text-[9px] text-zinc-400 font-sans block mt-0.5">
                    {isAr ? 'مرشد ملابس الشارع • متصل' : 'Streetwear Advisor • Online'}
                  </span>
                </div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 flex flex-col scrollbar-thin">
              {aiChat.map((msg, i) => {
                const isMsgAr = isMessageArabic(msg.text);
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={i}
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-sm transition-all duration-200 ${
                      isAssistant
                        ? 'bg-white border border-zinc-200 text-zinc-900 rounded-tl-none self-start'
                        : 'bg-zinc-950 text-white rounded-tr-none self-end'
                    }`}
                    style={{ 
                      direction: isMsgAr ? 'rtl' : 'ltr',
                      textAlign: isMsgAr ? 'right' : 'left'
                    }}
                  >
                    {renderFormattedText(msg.text)}
                  </div>
                );
              })}
              
              {/* Typing Indicator */}
              {isAiTyping && (
                <div className="flex items-center gap-1.5 bg-white border border-zinc-200 text-zinc-400 rounded-2xl rounded-tl-none px-4 py-2.5 mr-auto w-16 self-start shadow-sm">
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions scrollable row */}
            <div className="px-3 py-2 border-t border-zinc-100 bg-white flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
              {isAr ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickSuggest('أنا وزني ٧٥ كجم، إيه المقاس المناسب ليا في الهودي؟')}
                    className="flex-shrink-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10.5px] font-bold px-3 py-1.5 rounded-full transition-colors"
                  >
                    👕 مقاسي لوزني
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSuggest('مصاريف الشحن للمحافظات ومدة التوصيل كام؟')}
                    className="flex-shrink-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10.5px] font-bold px-3 py-1.5 rounded-full transition-colors"
                  >
                    📦 أسعار التوصيل
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSuggest('إيه هي خامات ملابس ريترو وهل بتنكمش؟')}
                    className="flex-shrink-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10.5px] font-bold px-3 py-1.5 rounded-full transition-colors"
                  >
                    🔥 خامة القطن والجودة
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSuggest('عندكم هوديز وتيشرتات إيه تانية؟ وريني الأسعار')}
                    className="flex-shrink-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10.5px] font-bold px-3 py-1.5 rounded-full transition-colors"
                  >
                    👕 أسعار الكولكشن
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleQuickSuggest("My weight is 80kg, what size oversized hoodie should I cop?")}
                    className="flex-shrink-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10.5px] font-bold px-3 py-1.5 rounded-full transition-colors"
                  >
                    👕 Sizing help
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSuggest("How much is shipping to Alexandria and other cities?")}
                    className="flex-shrink-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10.5px] font-bold px-3 py-1.5 rounded-full transition-colors"
                  >
                    📦 Delivery cost
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSuggest("Tell me about the fabric weight and materials used.")}
                    className="flex-shrink-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10.5px] font-bold px-3 py-1.5 rounded-full transition-colors"
                  >
                    🔥 Fabric quality
                  </button>
                </>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSendAiMessage} className="p-2.5 border-t border-zinc-200 flex bg-white">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder={isAr ? 'اسأل عن خامة القماش، المقاسات...' : 'Ask about fabric weight, sizes...'}
                className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-black"
                style={{ direction: isAr ? 'rtl' : 'ltr' }}
              />
              <button
                type="submit"
                className="bg-zinc-950 text-white p-2.5 rounded-lg hover:bg-zinc-800 transition-colors ml-1.5 flex items-center justify-center"
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
