/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { Sparkles, ShoppingBag, Eye, X, Check, Ruler, RefreshCw, Star, Instagram, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCatalogProps {
  products: Product[];
  language: 'ar' | 'en';
  onAddToCart: (product: Product, size: string, color: any, quantity: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  language,
  onAddToCart,
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
  };

  const handleAddToCartSubmit = () => {
    if (!activeProductModal || !chosenSize || !chosenColor) return;
    
    onAddToCart(activeProductModal, chosenSize, chosenColor, quantity);
    
    // Trigger localized visual confetti or check animation
    setSuccessAnimation(true);
    setTimeout(() => {
      setSuccessAnimation(false);
      setActiveProductModal(null);
    }, 1500);
  };

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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isAr ? 'براند ملابس الشارع الفاخر' : 'Premium Streetwear Brand'}
                </span>

                {/* Display Brand Heading with Ultra Tracking */}
                <h1 className="text-5xl sm:text-7xl font-black tracking-widest leading-none text-white font-sans uppercase">
                  R E T R O
                  <span className="text-zinc-500 block sm:inline sm:ml-4 font-normal text-3xl sm:text-5xl tracking-normal">
                    EG
                  </span>
                </h1>

                {/* Quote with elegant human typographic framing */}
                <div className="border-r-4 border-white pr-4 py-1 text-right">
                  <p className="text-xl sm:text-2xl font-black text-zinc-100 leading-snug">
                    {isAr ? 'أطلق العنان لأسلوبك، اكسر كل قواعد الموضة!' : 'Unleash Your Style, Break All Fashion Rules!'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1.5 uppercase tracking-widest font-mono">
                    {isAr ? 'ريترو • موضة الشارع المصرية البديلة' : 'Retro • Alternative Egyptian Streetwear'}
                  </p>
                </div>
              </div>

              {/* STATS BENTO ROW */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-900">
                {/* Stat 1: Posts */}
                <div className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-2xl flex flex-col justify-center items-center text-center group hover:border-zinc-800 transition-all duration-300">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-1">
                    {isAr ? 'المنشورات' : 'POSTS'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg font-black font-sans text-white group-hover:scale-105 transition-transform">
                      ٢٩٨
                    </span>
                    <Instagram className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                </div>

                {/* Stat 2: Followers */}
                <div className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-2xl flex flex-col justify-center items-center text-center group hover:border-zinc-800 transition-all duration-300">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-1">
                    {isAr ? 'المتابعين' : 'FOLLOWERS'}
                  </span>
                  <span className="text-base sm:text-lg font-black font-sans text-white group-hover:scale-105 transition-transform">
                    ٢,٠٧٦
                  </span>
                </div>

                {/* Stat 3: Fast Shipping */}
                <div className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-2xl flex flex-col justify-center items-center text-center group hover:border-zinc-800 transition-all duration-300 col-span-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-1">
                    {isAr ? 'الشحن' : 'SHIPPING'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-black text-emerald-400">
                      {isAr ? 'فوري بمصر' : 'Instant EG'}
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
              className="lg:col-span-5 relative min-h-[350px] lg:min-h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-zinc-900"
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
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
                
                {/* Vignette Overlay for premium editorial feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/40"></div>
              </div>

              {/* Lookbook metadata tags */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase font-mono block">
                    {isAr ? 'كتالوج ريترو المباشر' : 'RETRO LIVE LOOKBOOK'}
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

        {/* Categories Tab Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-zinc-200 pb-6 mb-10" id="category-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-5 py-2.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                selectedCategory === cat.id
                  ? 'bg-black text-white shadow-md scale-105'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 hover:text-black border border-zinc-200'
              }`}
            >
              {isAr ? cat.labelAr : cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8" id="products-grid">
          {filteredProducts.map((product) => {
            const saveAmount = product.originalPrice ? product.originalPrice - product.price : 0;
            return (
              <div
                key={product.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-zinc-100 p-3 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                id={`product-card-${product.id}`}
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100">
                  <img
                    src={product.image}
                    alt={isAr ? product.nameAr : product.name}
                    className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Save Discount Badge */}
                  {saveAmount > 0 && (
                    <span className="absolute top-3 left-3 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-sm z-10">
                      {isAr ? `وفر ${saveAmount} ج.م` : `SAVE ${saveAmount} EGP`}
                    </span>
                  )}

                  {/* Over-lay quick view button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <button
                      onClick={() => openProductDetails(product)}
                      className="rounded-full bg-white p-3 text-black hover:scale-110 transition-transform shadow-md"
                      title={isAr ? 'عرض التفاصيل والطلب' : 'Quick View & Order'}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Info and Purchase Panel */}
                <div className="mt-4 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase font-mono">
                      {isAr ? product.categoryAr : product.category}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-zinc-900 group-hover:text-black line-clamp-1">
                      {isAr ? product.nameAr : product.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {isAr ? product.descriptionAr : product.description}
                    </p>
                  </div>

                  {/* Price and Add button */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-zinc-950 font-mono">
                        {product.price} <span className="text-xs font-semibold">{isAr ? 'ج.م' : 'EGP'}</span>
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-zinc-400 line-through font-mono">
                          {product.originalPrice} {isAr ? 'ج.م' : 'EGP'}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => openProductDetails(product)}
                      className="flex items-center gap-1 bg-black hover:bg-zinc-800 text-white text-xs font-extrabold px-3 py-2 rounded-lg transition-colors"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>{isAr ? 'طلب الآن' : 'Order'}</span>
                    </button>
                  </div>
                </div>
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

      {/* Dynamic Visual Product Details Modal */}
      <AnimatePresence>
        {activeProductModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" id="product-details-modal">
            {/* Dark overlay backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setActiveProductModal(null)}></div>

            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-3xl"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveProductModal(null)}
                  className="absolute top-4 right-4 z-10 rounded-full bg-zinc-100 p-2 text-zinc-500 hover:bg-zinc-200 hover:text-black transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Grid details */}
                <div className="grid grid-cols-1 md:grid-cols-2">
                  
                  {/* Photo Display */}
                  <div className="relative bg-zinc-100 aspect-square md:h-full">
                    <img
                      src={activeProductModal.image}
                      alt={isAr ? activeProductModal.nameAr : activeProductModal.name}
                      className="h-full w-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    {activeProductModal.originalPrice && (
                      <span className="absolute top-4 left-4 rounded-md bg-red-600 px-3 py-1.5 text-xs font-black text-white tracking-widest uppercase">
                        {isAr ? 'خصم خاص' : 'DISCOUNT'}
                      </span>
                    )}
                  </div>

                  {/* Config & Checkout settings */}
                  <div className="p-6 sm:p-8 flex flex-col justify-between" id="modal-details-panel">
                    <div>
                      {/* Category */}
                      <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase font-mono">
                        {isAr ? activeProductModal.categoryAr : activeProductModal.category}
                      </span>
                      
                      {/* Name */}
                      <h2 className="mt-1 text-xl sm:text-2xl font-black text-zinc-950 uppercase">
                        {isAr ? activeProductModal.nameAr : activeProductModal.name}
                      </h2>

                      {/* Price Tag */}
                      <div className="mt-2 flex items-baseline gap-3">
                        <span className="text-2xl font-black text-black font-mono">
                          {activeProductModal.price} <span className="text-sm font-bold">{isAr ? 'ج.م' : 'EGP'}</span>
                        </span>
                        {activeProductModal.originalPrice && (
                          <span className="text-sm text-zinc-400 line-through font-mono">
                            {activeProductModal.originalPrice} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="mt-4 text-xs text-zinc-600 leading-relaxed">
                        {isAr ? activeProductModal.descriptionAr : activeProductModal.description}
                      </p>

                      {/* Fabric Material Highlight */}
                      <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 font-mono block">
                          {isAr ? 'الخامة والنسيج' : 'Material & Craft'}
                        </span>
                        <span className="text-xs font-semibold text-zinc-800 mt-1 block">
                          {isAr ? activeProductModal.materialAr : activeProductModal.material}
                        </span>
                      </div>

                      {/* Color Choice */}
                      <div className="mt-6">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                          {isAr ? 'اللون المتاح' : 'Choose Color'}
                        </span>
                        <div className="mt-2 flex items-center gap-3">
                          {activeProductModal.colors.map((color, index) => (
                            <button
                              key={index}
                              onClick={() => setChosenColor(color)}
                              className={`group relative flex h-8 items-center gap-1.5 rounded-full border px-3 py-1 transition-all ${
                                chosenColor?.name === color.name
                                  ? 'border-black bg-zinc-50'
                                  : 'border-zinc-200 hover:border-zinc-400 bg-white'
                              }`}
                              title={isAr ? color.nameAr : color.name}
                            >
                              <span className={`h-4 w-4 rounded-full border border-black/10 ${color.class}`}></span>
                              <span className="text-[11px] font-bold text-zinc-700">
                                {isAr ? color.nameAr : color.name}
                              </span>
                              {chosenColor?.name === color.name && (
                                <Check className="h-3 w-3 text-black" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sizing selection with chart helper */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                            {isAr ? 'المقاس (قصة مريحة أوفرسايز)' : 'Select Size (Oversized Fit)'}
                          </span>
                          <button
                            onClick={() => setShowSizeChart(!showSizeChart)}
                            className="text-[11px] font-bold text-zinc-500 hover:text-black flex items-center gap-1 transition-colors underline"
                          >
                            <Ruler className="h-3.5 w-3.5" />
                            {isAr ? 'جدول المقاسات' : 'Size Chart'}
                          </button>
                        </div>
                        
                        {/* Size Buttons */}
                        <div className="mt-2 flex gap-2">
                          {activeProductModal.sizes.map((sz) => (
                            <button
                              key={sz}
                              onClick={() => setChosenSize(sz)}
                              className={`h-11 w-12 rounded-xl border flex items-center justify-center font-black text-sm transition-all ${
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
                        {showSizeChart && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-[10px] text-zinc-500 font-mono space-y-1.5"
                          >
                            <div className="font-bold text-zinc-700 uppercase mb-1">
                              {isAr ? 'دليل مقاسات الملابس الأوفرسايز:' : 'Oversized Sizing Dimensions:'}
                            </div>
                            <div className="flex justify-between border-b border-zinc-200 pb-1">
                              <span>M: {isAr ? 'الوزن من ٥٥ إلى ٧٠ كجم (عرض ٦٠ سم)' : 'Weight 55-70 kg (Width 60cm)'}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-200 pb-1">
                              <span>L: {isAr ? 'الوزن من ٧٠ إلى ٨٥ كجم (عرض ٦٣ سم)' : 'Weight 70-85 kg (Width 63cm)'}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-200 pb-1">
                              <span>XL: {isAr ? 'الوزن من ٨٥ إلى ١٠٠ كجم (عرض ٦٦ سم)' : 'Weight 85-100 kg (Width 66cm)'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>XXL: {isAr ? 'الوزن من ١٠٠ إلى ١٢٠ كجم (عرض ٧٠ سم)' : 'Weight 100-120 kg (Width 70cm)'}</span>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Key features of the garment */}
                      <div className="mt-6">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                          {isAr ? 'مواصفات القطعة:' : 'Garment Specs:'}
                        </span>
                        <ul className="mt-2 text-[11px] text-zinc-500 space-y-1 pl-4 list-disc list-inside">
                          {(isAr ? activeProductModal.detailsAr : activeProductModal.details).map((detail, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Quantity & Cart trigger */}
                    <div className="mt-8 border-t border-zinc-100 pt-6">
                      <div className="flex items-center justify-between gap-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-zinc-300 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-3.5 py-2 hover:bg-zinc-100 font-extrabold text-sm transition-colors text-zinc-600"
                          >
                            -
                          </button>
                          <span className="px-4 text-sm font-black font-mono text-zinc-800">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-3.5 py-2 hover:bg-zinc-100 font-extrabold text-sm transition-colors text-zinc-600"
                          >
                            +
                          </button>
                        </div>

                        {/* Submit Button */}
                        <button
                          onClick={handleAddToCartSubmit}
                          disabled={successAnimation}
                          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                            successAnimation
                              ? 'bg-emerald-600 text-white'
                              : 'bg-black text-white hover:bg-zinc-900 active:scale-95'
                          }`}
                        >
                          {successAnimation ? (
                            <>
                              <Check className="h-4 w-4 animate-ping" />
                              <span>{isAr ? 'تمت الإضافة للحقيبة!' : 'Added to Bag!'}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-4 w-4" />
                              <span>{isAr ? 'إضافة إلى الحقيبة والطلب' : 'Add to Shopping Bag'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
