/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Search, Globe, Truck, ShieldAlert, LogOut } from 'lucide-react';
import { RetroLogo } from './RetroLogo';

interface NavbarProps {
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  currentView: 'shop' | 'tracker' | 'admin';
  setCurrentView: (view: 'shop' | 'tracker' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
  currentView,
  setCurrentView,
  cartCount,
  onOpenCart,
  isAdminLoggedIn,
  onLogoutAdmin,
}) => {
  const isAr = language === 'ar';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/90 backdrop-blur-md" id="app-header">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Tabs (Left/Right depending on language) */}
        <nav className={`hidden md:flex items-center space-x-1 ${isAr ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`} id="desktop-nav">
          <button
            id="nav-btn-shop"
            onClick={() => setCurrentView('shop')}
            className={`px-4 py-2 text-sm font-semibold tracking-wider transition-colors uppercase ${
              currentView === 'shop'
                ? 'text-black border-b-2 border-black'
                : 'text-zinc-500 hover:text-black'
            }`}
          >
            {isAr ? 'المتجر الرئيسي' : 'Shop'}
          </button>
          
          <button
            id="nav-btn-tracker"
            onClick={() => setCurrentView('tracker')}
            className={`px-4 py-2 text-sm font-semibold tracking-wider transition-colors uppercase ${
              currentView === 'tracker'
                ? 'text-black border-b-2 border-black'
                : 'text-zinc-500 hover:text-black'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4" />
              {isAr ? 'تتبع طلبك' : 'Track Order'}
            </span>
          </button>

          <button
            id="nav-btn-admin"
            onClick={() => setCurrentView('admin')}
            className={`px-4 py-2 text-sm font-semibold tracking-wider transition-colors uppercase ${
              currentView === 'admin'
                ? 'text-rose-600 border-b-2 border-rose-600 font-bold'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              {isAr ? 'لوحة التحكم' : 'Admin'}
            </span>
          </button>
        </nav>

        {/* Center Brand Logo */}
        <div 
          className="cursor-pointer py-1 flex items-center justify-center select-none" 
          onClick={() => setCurrentView('shop')}
          id="logo-container"
        >
          <div className="flex items-center">
            <RetroLogo className="h-14 w-auto sm:h-16" />
          </div>
        </div>

        {/* Right Controls (Cart, Lang, Admin Status) */}
        <div className={`flex items-center gap-3 sm:gap-4 ${isAr ? 'flex-row-reverse' : 'flex-row'}`} id="header-controls">
          {/* Mobile Menu Icon Fallback (simple responsive toggler) */}
          <div className="flex md:hidden gap-1" id="mobile-nav-inline">
            <button
              onClick={() => setCurrentView('shop')}
              className={`p-2 text-xs font-bold uppercase border rounded ${currentView === 'shop' ? 'bg-black text-white' : 'bg-transparent text-black'}`}
            >
              {isAr ? 'متجر' : 'Shop'}
            </button>
            <button
              onClick={() => setCurrentView('tracker')}
              className={`p-2 text-xs font-bold uppercase border rounded ${currentView === 'tracker' ? 'bg-black text-white' : 'bg-transparent text-black'}`}
            >
              {isAr ? 'تتبع' : 'Track'}
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`p-2 text-xs font-bold uppercase border rounded ${currentView === 'admin' ? 'bg-rose-600 text-white border-rose-600' : 'bg-transparent text-zinc-600'}`}
            >
              {isAr ? 'إدارة' : 'Admin'}
            </button>
          </div>

          {/* Language Switcher */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-bold tracking-wider hover:bg-zinc-50 transition-all uppercase"
            title={isAr ? 'Switch to English' : 'تغيير للغة العربية'}
          >
            <Globe className="h-3.5 w-3.5 text-zinc-500" />
            <span>{isAr ? 'EN' : 'العربية'}</span>
          </button>

          {/* Shopping Cart Trigger */}
          <button
            id="cart-trigger-btn"
            onClick={onOpenCart}
            className="relative rounded-full border border-zinc-200 p-2.5 text-zinc-800 hover:bg-zinc-50 hover:scale-105 transition-all"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span 
                id="cart-count-badge"
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-extrabold text-white animate-bounce"
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Admin Sign Out Indicator */}
          {isAdminLoggedIn && currentView === 'admin' && (
            <button
              id="admin-logout-btn"
              onClick={onLogoutAdmin}
              className="flex items-center gap-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 text-xs font-extrabold transition-all"
              title={isAr ? 'تسجيل الخروج من الإدارة' : 'Logout Admin'}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isAr ? 'خروج' : 'Logout'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
