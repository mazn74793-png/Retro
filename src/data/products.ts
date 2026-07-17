/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'retro-hoodie',
    name: 'RETRO COSMIC OVERSIZED HOODIE',
    nameAr: 'هودي ريترو كوزميك أوفرسايز',
    description: 'Ultra-premium heavy-cotton oversized hoodie with retro orbit and star graphics. Crafted from 400 GSM brushed fleece to provide maximum comfort and a structured streetwear drape.',
    descriptionAr: 'هودي أوفرسايز من القطن الثقيل الممتاز مع مطبوعات ريترو كوزميك الفلكية والنجوم. مصنوع من فليس ناعم 400 جرام لكل متر مربع ليوفر أقصى درجات الراحة والمظهر المنظم لملابس الشارع.',
    price: 1250,
    originalPrice: 1650,
    image: '/images/retro_hoodie_1784140861378.jpg',
    category: 'Hoodies',
    categoryAr: 'هوديز',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Carbon Black', nameAr: 'أسود كربوني', class: 'bg-zinc-900 border-zinc-700' },
      { name: 'Charcoal Grey', nameAr: 'رمادي فاحم', class: 'bg-zinc-700 border-zinc-500' },
      { name: 'Off-White', nameAr: 'أوف وايت', class: 'bg-zinc-100 border-zinc-300' }
    ],
    inStock: true,
    details: [
      '400 GSM Heavyweight French Terry',
      'Double-lined hood with no drawstrings for a clean look',
      'Kangaroo pocket on front',
      'Ribbed cuffs and hem with double needle stitching',
      'Made in Egypt with premium Egyptian cotton'
    ],
    detailsAr: [
      'قطن ثقيل فرينش تيري 400 جرام/متر مربع',
      'غطاء رأس مزدوج البطانة بدون أربطة لمظهر أنيق ونظيف',
      'جيب كانغارو أمامي واسع',
      'أساور وحواف مضلعة مع خياطة مزدوجة لمتانة أكبر',
      'صنع في مصر بأجود أنواع القطن المصري'
    ],
    material: '85% Egyptian Cotton, 15% Polyester for durability',
    materialAr: '85% قطن مصري، 15% بوليستر للمتانة والتحمل'
  },
  {
    id: 'retro-tee',
    name: 'RETRO ORBIT ACID-WASH TEE',
    nameAr: 'تيشرت ريترو أوربت أسيد-واش',
    description: 'Heavyweight oversized tee with dynamic vintage 90s orbit-spark printing. Featuring a vintage mineral wash finish for an authentic retro streetwear style.',
    descriptionAr: 'تيشرت أوفرسايز ثقيل بمطبعة أوربت الفلكية المستوحاة من التسعينات. يتميز بغسيل أسيد معدني عتيق لمظهر ملابس الشارع الكلاسيكي الأصيل.',
    price: 650,
    originalPrice: 850,
    image: '/images/retro_tee_1784140871626.jpg',
    category: 'T-Shirts',
    categoryAr: 'تيشرتات',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Acid Black', nameAr: 'أسود مغسول', class: 'bg-zinc-800 border-zinc-600' },
      { name: 'Acid Grey', nameAr: 'رمادي مغسول', class: 'bg-zinc-600 border-zinc-400' }
    ],
    inStock: true,
    details: [
      '260 GSM Premium Single Jersey Cotton',
      'Oversized boxy fit with dropped shoulders',
      'High-density screen print on front and back',
      'Pre-shrunk fabric to prevent shrinking after wash',
      'Vintage acid wash aesthetic'
    ],
    detailsAr: [
      'قطن سينجل جيرسي فاخر 260 جرام/متر مربع',
      'قصة بوكسي أوفرسايز مع أكتاف منسدلة',
      'طباعة شاشة حريرية عالية الكثافة من الأمام والخلف',
      'نسيج معالج مسبقاً لمنع الانكماش بعد الغسيل',
      'جمالية الغسيل الحمضي الكلاسيكية (أسيد واش)'
    ],
    material: '100% Egyptian Cotton Heavy Jersey',
    materialAr: '100% قطن مصري جيرسي ثقيل الممتاز'
  },
  {
    id: 'retro-cargo',
    name: 'TECH-RETRO CARGO PANTS',
    nameAr: 'بنطلون كارجو تيك-ريترو',
    description: 'Baggy-fit utility cargo pants featuring white contrast stitching, tactical 3D side pockets, and adjustable cuff straps to toggle between wide-leg and tapered fits.',
    descriptionAr: 'بنطلون كارجو عملي بقصة واسعة ومريحة متميز بخياطة متباينة باللون الأبيض، وجيوب تكتيكية ثلاثية الأبعاد، وأربطة كاحل قابلة للتعديل للتبديل بين القصة الواسعة والضيقة.',
    price: 1100,
    originalPrice: 1450,
    image: '/images/retro_cargo_1784140882129.jpg',
    category: 'Pants',
    categoryAr: 'بناطيل',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Utility Black', nameAr: 'أسود عملي', class: 'bg-zinc-900 border-zinc-700' },
      { name: 'Sage Green', nameAr: 'أخضر زيتي', class: 'bg-emerald-950 border-emerald-900' },
      { name: 'Desert Sand', nameAr: 'بيج رملي', class: 'bg-amber-100 border-amber-300' }
    ],
    inStock: true,
    details: [
      'Premium durable cotton twill weave fabric',
      'Contrast white high-tensile stitching',
      '6 pocket utility configuration with Velcro closures',
      'Elastic waist with integrated metal-buckle nylon belt',
      'Adjustable toggle drawstrings at ankles'
    ],
    detailsAr: [
      'قماش قطن تويل فاخر ومتين ومقاوم للتمزق',
      'خياطة بارزة بيضاء عالية التحمل والتباين',
      'توزيع عملي بـ 6 جيوب مع إغلاق فيلكرو لاصق',
      'خصر مرن مدمج بحزام نايلون ذو إبزيم معدني متين',
      'أربطة مطاطية قابلة للتعديل عند الكاحل'
    ],
    material: '98% Heavy Cotton Twill, 2% Elastane for slight stretch',
    materialAr: '98% قطن تويل ثقيل، 2% مطاط لتوفير مرونة طفيفة'
  },
  {
    id: 'retro-jacket',
    name: 'VINTAGE WINDBREAKER BOMBER',
    nameAr: 'جاكيت ويندبريكر بومبر كلاسيكي',
    description: 'A striking retro-futurist nylon windbreaker featuring signature oversized colorblock paneling, full-zip utility collar, and water-repellent lining.',
    descriptionAr: 'جاكيت ويندبريكر نايلون كلاسيكي بتصميم مستقبلي رائع يتميز بألواح ملونة أوفرسايز مميزة، وياقة عملية بسحاب كامل، وبطانة طاردة للمياه.',
    price: 1450,
    originalPrice: 1950,
    image: '/images/retro_jacket_1784140892340.jpg',
    category: 'Jackets',
    categoryAr: 'جاكيتات',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Eclipse Black/Grey', nameAr: 'كسوف أسود/رمادي', class: 'bg-zinc-800 border-zinc-600' },
      { name: 'Retro Teal/Navy', nameAr: 'تيل كلاسيكي/كحلي', class: 'bg-cyan-950 border-cyan-900' }
    ],
    inStock: true,
    details: [
      'Premium lightweight crinkled nylon taslan',
      'Water-resistant and windproof construction',
      'Mesh lining for lightweight breathability',
      'YKK custom metal zipper and branded pull tab',
      'Concealed zippered hood in collar'
    ],
    detailsAr: [
      'نايلون تاسلان خفيف ومجعد فاخر وعالي الجودة',
      'مقاوم للماء ومضاد للرياح تماماً',
      'بطانة شبكية ناعمة تمنحك تهوية مثالية دون زيادة بالوزن',
      'سحاب YKK معدني فاخر ومقبض مخصص مريح',
      'غطاء رأس خفي مخفي داخل الياقة بسحاب'
    ],
    material: '100% Premium Taslan Nylon Shell, 100% Polyester Mesh Lining',
    materialAr: 'الخارج: 100% نايلون تاسلان فاخر، الداخل: بطانة شبكية بوليستر 100%'
  }
];
