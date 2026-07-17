import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined in this environment.");
}

// Paths for persistent JSON database files
const DATA_DIR = path.join(process.cwd(), "src", "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products_db.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders_db.json");

// Safe write file sync helper for read-only environments (like Vercel)
function safeWriteFileSync(filePath: string, content: string) {
  try {
    fs.writeFileSync(filePath, content, "utf-8");
  } catch (error) {
    console.warn(`[SafeWrite] Skipped writing to file ${filePath}: read-only system or permission denied.`);
  }
}

// Default initial products matching src/data/products.ts
const INITIAL_PRODUCTS = [
  {
    id: "retro-hoodie",
    name: "RETRO COSMIC OVERSIZED HOODIE",
    nameAr: "هودي ريترو كوزميك أوفرسايز",
    description: "Ultra-premium heavy-cotton oversized hoodie with retro orbit and star graphics. Crafted from 400 GSM brushed fleece to provide maximum comfort and a structured streetwear drape.",
    descriptionAr: "هودي أوفرسايز من القطن الثقيل الممتاز مع مطبوعات ريترو كوزميك الفلكية والنجوم. مصنوع من فليس ناعم 400 جرام لكل متر مربع ليوفر أقصى درجات الراحة والمظهر المنظم لملابس الشارع.",
    price: 1250,
    originalPrice: 1650,
    image: "/images/retro_hoodie_1784140861378.jpg",
    category: "Hoodies",
    categoryAr: "هوديز",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Carbon Black", nameAr: "أسود كربوني", class: "bg-zinc-900 border-zinc-700" },
      { name: "Charcoal Grey", nameAr: "رمادي فاحم", class: "bg-zinc-700 border-zinc-500" },
      { name: "Off-White", nameAr: "أوف وايت", class: "bg-zinc-100 border-zinc-300" }
    ],
    inStock: true,
    details: [
      "400 GSM Heavyweight French Terry",
      "Double-lined hood with no drawstrings for a clean look",
      "Kangaroo pocket on front",
      "Ribbed cuffs and hem with double needle stitching",
      "Made in Egypt with premium Egyptian cotton"
    ],
    detailsAr: [
      "قطن ثقيل فرينش تيري 400 جرام/متر مربع",
      "غطاء رأس مزدوج البطانة بدون أربطة لمظهر أنيق ونظيف",
      "جيب كانغارو أمامي واسع",
      "أساور وحواف مضلعة مع خياطة مزدوجة لمتانة أكبر",
      "صنع في مصر بأجود أنواع القطن المصري"
    ],
    material: "85% Egyptian Cotton, 15% Polyester for durability",
    materialAr: "85% قطن مصري، 15% بوليستر للمتانة والتحمل"
  },
  {
    id: "retro-tee",
    name: "RETRO ORBIT ACID-WASH TEE",
    nameAr: "تيشرت ريترو أوربت أسيد-واش",
    description: "Heavyweight oversized tee with dynamic vintage 90s orbit-spark printing. Featuring a vintage mineral wash finish for an authentic retro streetwear style.",
    descriptionAr: "تيشرت أوفرسايز ثقيل بمطبعة أوربت الفلكية المستوحاة من التسعينات. يتميز بغسيل أسيد معدني عتيق لمظهر ملابس الشارع الكلاسيكي الأصيل.",
    price: 650,
    originalPrice: 850,
    image: "/images/retro_tee_1784140871626.jpg",
    category: "T-Shirts",
    categoryAr: "تيشرتات",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Acid Black", nameAr: "أسود مغسول", class: "bg-zinc-800 border-zinc-600" },
      { name: "Acid Grey", nameAr: "رمادي مغسول", class: "bg-zinc-600 border-zinc-400" }
    ],
    inStock: true,
    details: [
      "260 GSM Premium Single Jersey Cotton",
      "Oversized boxy fit with dropped shoulders",
      "High-density screen print on front and back",
      "Pre-shrunk fabric to prevent shrinking after wash",
      "Vintage acid wash aesthetic"
    ],
    detailsAr: [
      "قطن سينجل جيرسي فاخر 260 جرام/متر مربع",
      "قصة بوكسي أوفرسايز مع أكتاف منسدلة",
      "طباعة شاشة حريرية عالية الكثافة من الأمام والخلف",
      "نسيج معالج مسبقاً لمنع الانكماش بعد الغسيل",
      "جمالية الغسيل الحمضي الكلاسيكية (أسيد واش)"
    ],
    material: "100% Egyptian Cotton Heavy Jersey",
    materialAr: "100% قطن مصري جيرسي ثقيل الممتاز"
  },
  {
    id: "retro-cargo",
    name: "TECH-RETRO CARGO PANTS",
    nameAr: "بنطلون كارجو تيك-ريترو",
    description: "Baggy-fit utility cargo pants featuring white contrast stitching, tactical 3D side pockets, and adjustable cuff straps to toggle between wide-leg and tapered fits.",
    descriptionAr: "بنطلون كارجو عملي بقصة واسعة ومريحة متميز بخياطة متباينة باللون الأبيض، وجيوب تكتيكية ثلاثية الأبعاد، وأربطة كاحل قابلة للتعديل للتبديل بين القصة الواسعة والضيقة.",
    price: 1100,
    originalPrice: 1450,
    image: "/images/retro_cargo_1784140882129.jpg",
    category: "Pants",
    categoryAr: "بناطيل",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Utility Black", nameAr: "أسود عملي", class: "bg-zinc-900 border-zinc-700" },
      { name: "Sage Green", nameAr: "أخضر زيتي", class: "bg-emerald-950 border-emerald-900" },
      { name: "Desert Sand", nameAr: "بيج رملي", class: "bg-amber-100 border-amber-300" }
    ],
    inStock: true,
    details: [
      "Premium durable cotton twill weave fabric",
      "Contrast white high-tensile stitching",
      "6 pocket utility configuration with Velcro closures",
      "Elastic waist with integrated metal-buckle nylon belt",
      "Adjustable toggle drawstrings at ankles"
    ],
    detailsAr: [
      "قماش قطن تويل فاخر ومتين ومقاوم للتمزق",
      "خياطة بارزة بيضاء عالية التحمل والتباين",
      "توزيع عملي بـ 6 جيوب مع إغلاق فيلكرو لاصق",
      "خصر مرن مدمج بحزام نايلون ذو إبزيم معدني متين",
      "أربطة مطاطية قابلة للتعديل عند الكاحل"
    ],
    material: "98% Heavy Cotton Twill, 2% Elastane for slight stretch",
    materialAr: "98% قطن تويل ثقيل، 2% مطاط لتوفير مرونة طفيفة"
  },
  {
    id: "retro-jacket",
    name: "VINTAGE WINDBREAKER BOMBER",
    nameAr: "جاكيت ويندبريكر بومبر كلاسيكي",
    description: "A striking retro-futurist nylon windbreaker featuring signature oversized colorblock paneling, full-zip utility collar, and water-repellent lining.",
    descriptionAr: "جاكيت ويندبريكر نايلون كلاسيكي بتصميم مستقبلي رائع يتميز بألواح ملونة أوفرسايز مميزة، وياقة عملية بسحاب كامل، وبطانة طاردة للمياه.",
    price: 1450,
    originalPrice: 1950,
    image: "/images/retro_jacket_1784140892340.jpg",
    category: "Jackets",
    categoryAr: "جاكيتات",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Eclipse Black/Grey", nameAr: "كسوف أسود/رمادي", class: "bg-zinc-800 border-zinc-600" },
      { name: "Retro Teal/Navy", nameAr: "تيل كلاسيكي/كحلي", class: "bg-cyan-950 border-cyan-900" }
    ],
    inStock: true,
    details: [
      "Premium lightweight crinkled nylon taslan",
      "Water-resistant and windproof construction",
      "Mesh lining for lightweight breathability",
      "YKK custom metal zipper and branded pull tab",
      "Concealed zippered hood in collar"
    ],
    detailsAr: [
      "نايلون تاسلان خفيف ومجعد فاخر وعالي الجودة",
      "مقاوم للماء ومضاد للرياح تماماً",
      "بطانة شبكية ناعمة تمنحك تهوية مثالية دون زيادة بالوزن",
      "سحاب YKK معدني فاخر ومقبض مخصص مريح",
      "غطاء رأس خفي مخفي داخل الياقة بسحاب"
    ],
    material: "100% Premium Taslan Nylon Shell, 100% Polyester Mesh Lining",
    materialAr: "الخارج: 100% نايلون تاسلان فاخر، الداخل: بطانة شبكية بوليستر 100%"
  }
];

// Initial seed orders matching App.tsx initial setup
const SEED_ORDERS = [
  {
    id: "RETRO-102543",
    customerName: "كريم عبد العزيز",
    customerPhone: "01098765432",
    city: "Cairo",
    cityAr: "القاهرة",
    address: "١٥ شارع التسعين الشمالي، التجمع الخامس، شقة ٤",
    items: [
      {
        productId: "retro-hoodie",
        productName: "RETRO COSMIC OVERSIZED HOODIE",
        productNameAr: "هودي ريترو كوزميك أوفرسايز",
        size: "XL",
        colorName: "Carbon Black",
        colorNameAr: "أسود كربوني",
        price: 1250,
        quantity: 1,
        image: "/images/retro_hoodie_1784140861378.jpg",
      }
    ],
    totalAmount: 1300,
    shippingFee: 50,
    paymentMethod: "vodafone_cash",
    paymentDetails: {
      walletNumber: "01098765432",
      transactionId: "TRX-58291048"
    },
    status: "processing",
    createdAt: "الأربعاء، ١٥ يوليو ٢٠٢٦، ١١:١٢ ص",
    trackingHistory: [
      {
        status: "placed",
        title: "Order Placed",
        titleAr: "تم تقديم الطلب",
        description: "Thank you! Your order has been placed successfully.",
        descriptionAr: "شكراً لك! تم استلام طلبك بنجاح وجاري إرساله للمراجعة.",
        timestamp: "الأربعاء، ١٥ يوليو ٢٠٢٦، ١١:١٢ ص",
        completed: true,
      },
      {
        status: "processing",
        title: "Processing",
        titleAr: "قيد التجهيز والتحضير",
        description: "Our warehouse staff is compiling your streetwear garments carefully.",
        descriptionAr: "يقوم طاقم المستودع الآن بتجهيز وتعبئة ملابس الشارع الخاصة بك بعناية.",
        timestamp: "الأربعاء، ١٥ يوليو ٢٠٢٦، ١١:٣٠ ص",
        completed: true,
      },
      {
        status: "shipped",
        title: "Shipped",
        titleAr: "تم الشحن للتوصيل",
        description: "The shipping courier has picked up your package.",
        descriptionAr: "تم تسليم الطرد لشركة الشحن السريع لبدء الشحن.",
        timestamp: "انتظار...",
        completed: false,
      }
    ]
  },
  {
    id: "RETRO-854129",
    customerName: "سارة أحمد",
    customerPhone: "01223456789",
    city: "Alexandria",
    cityAr: "الإسكندرية",
    address: "٤٥ طريق الجيش، جليم، أمام قهوة فاروق، الدور السادس",
    items: [
      {
        productId: "retro-cargo",
        productName: "TECH-RETRO CARGO PANTS",
        productNameAr: "بنطلون كارجو تيك-ريترو",
        size: "M",
        colorName: "Sage Green",
        colorNameAr: "أخضر زيتي",
        price: 1100,
        quantity: 1,
        image: "/images/retro_cargo_1784140882129.jpg",
      }
    ],
    totalAmount: 1175,
    shippingFee: 75,
    paymentMethod: "cod",
    status: "shipped",
    createdAt: "الثلاثاء، ١٤ يوليو ٢٠٢٦، ٠٣:٤٥ م",
    trackingHistory: [
      {
        status: "placed",
        title: "Order Placed",
        titleAr: "تم تقديم الطلب",
        description: "Thank you! Your order has been placed successfully.",
        descriptionAr: "شكراً لك! تم استلام طلبك بنجاح وجاري إرساله للمراجعة.",
        timestamp: "الثلاثاء، ١٤ يوليو ٢٠٢٦، ٠٣:٤٥ م",
        completed: true,
      },
      {
        status: "processing",
        title: "Processing",
        titleAr: "قيد التجهيز والتحضير",
        description: "Our warehouse staff is compiling your streetwear garments carefully.",
        descriptionAr: "يقوم طاقم المستودع الآن بتجهيز وتعبئة ملابس الشارع الخاصة بك بعناية.",
        timestamp: "الثلاثاء، ١٤ يوليو ٢٠٢٦، ٠٥:١٠ م",
        completed: true,
      },
      {
        status: "shipped",
        title: "Shipped",
        titleAr: "تم الشحن للتوصيل",
        description: "The shipping courier has picked up your package.",
        descriptionAr: "تم تسليم الطرد لشركة الشحن السريع لبدء الشحن.",
        timestamp: "الأربعاء، ١٥ يوليو ٢٠٢٦، ٠٩:٠٠ ص",
        completed: true,
      }
    ]
  }
];

// Helper to check and bootstrap JSON databases
// In-memory runtime backups to handle read-only/serverless environments gracefully
let memoryProducts = [...INITIAL_PRODUCTS];
let memoryOrders = [...SEED_ORDERS];

function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (_) {}
    }

    if (fs.existsSync(PRODUCTS_FILE)) {
      const rawData = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      const products = JSON.parse(rawData);
      if (Array.isArray(products) && products.length > 0) {
        memoryProducts = products;
      }
    } else {
      safeWriteFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2));
      console.log("Initialized products database file.");
    }

    if (fs.existsSync(ORDERS_FILE)) {
      const rawData = fs.readFileSync(ORDERS_FILE, "utf-8");
      const orders = JSON.parse(rawData);
      if (Array.isArray(orders)) {
        memoryOrders = orders;
      }
    } else {
      safeWriteFileSync(ORDERS_FILE, JSON.stringify(SEED_ORDERS, null, 2));
      console.log("Initialized orders database file.");
    }
  } catch (error) {
    console.warn("Database initialization warning (likely read-only on Vercel):", error);
  }
}

initDatabase();

// DATABASE API ROUTES
// Support dual paths (/api/something and /something) for Vercel prefix stripping
// 1. Get all products
app.get(["/api/products", "/products"], (req, res) => {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const rawData = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      const products = JSON.parse(rawData);
      if (Array.isArray(products) && products.length > 0) {
        memoryProducts = products;
      }
    }
    return res.json(memoryProducts);
  } catch (error) {
    console.warn("Using memoryProducts fallback due to read error:", error);
    return res.json(memoryProducts);
  }
});

// 2. Add new product (Admin)
app.post(["/api/products", "/products"], (req, res) => {
  try {
    const newProduct = req.body;
    if (fs.existsSync(PRODUCTS_FILE)) {
      try {
        const rawData = fs.readFileSync(PRODUCTS_FILE, "utf-8");
        const products = JSON.parse(rawData);
        if (Array.isArray(products)) {
          memoryProducts = products;
        }
      } catch (_) {}
    }
    
    // Add to start of list
    memoryProducts.unshift(newProduct);
    
    safeWriteFileSync(PRODUCTS_FILE, JSON.stringify(memoryProducts, null, 2));
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to save product" });
  }
});

// 3. Update product details (Admin edit price or toggle stock)
app.patch(["/api/products/:id", "/products/:id"], (req, res) => {
  try {
    const { id } = req.params;
    const { price, inStock } = req.body;
    
    if (fs.existsSync(PRODUCTS_FILE)) {
      try {
        const rawData = fs.readFileSync(PRODUCTS_FILE, "utf-8");
        const products = JSON.parse(rawData);
        if (Array.isArray(products)) {
          memoryProducts = products;
        }
      } catch (_) {}
    }
    
    const index = memoryProducts.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    if (price !== undefined) memoryProducts[index].price = Number(price);
    if (inStock !== undefined) memoryProducts[index].inStock = Boolean(inStock);
    
    safeWriteFileSync(PRODUCTS_FILE, JSON.stringify(memoryProducts, null, 2));
    res.json(memoryProducts[index]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 4. Get all orders
app.get(["/api/orders", "/orders"], (req, res) => {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const rawData = fs.readFileSync(ORDERS_FILE, "utf-8");
      const orders = JSON.parse(rawData);
      if (Array.isArray(orders)) {
        memoryOrders = orders;
      }
    }
    return res.json(memoryOrders);
  } catch (error) {
    console.warn("Using memoryOrders fallback due to read error:", error);
    return res.json(memoryOrders);
  }
});

// 5. Get single order by tracking ID
app.get(["/api/orders/:id", "/orders/:id"], (req, res) => {
  try {
    const { id } = req.params;
    
    if (fs.existsSync(ORDERS_FILE)) {
      try {
        const rawData = fs.readFileSync(ORDERS_FILE, "utf-8");
        const orders = JSON.parse(rawData);
        if (Array.isArray(orders)) {
          memoryOrders = orders;
        }
      } catch (_) {}
    }
    
    const order = memoryOrders.find((o: any) => o.id === id.trim().toUpperCase());
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to search order" });
  }
});

// 6. Place new order
app.post(["/api/orders", "/orders"], (req, res) => {
  try {
    const newOrder = req.body;
    
    if (fs.existsSync(ORDERS_FILE)) {
      try {
        const rawData = fs.readFileSync(ORDERS_FILE, "utf-8");
        const orders = JSON.parse(rawData);
        if (Array.isArray(orders)) {
          memoryOrders = orders;
        }
      } catch (_) {}
    }
    
    // Add to start of list
    memoryOrders.unshift(newOrder);
    
    safeWriteFileSync(ORDERS_FILE, JSON.stringify(memoryOrders, null, 2));
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to place order" });
  }
});

// 7. Update order status and log timeline step (Admin)
app.patch(["/api/orders/:id/status", "/orders/:id/status"], (req, res) => {
  try {
    const { id } = req.params;
    const { status, nextStatus, newStep } = req.body; // status: exact state, newStep: complete details
    
    if (fs.existsSync(ORDERS_FILE)) {
      try {
        const rawData = fs.readFileSync(ORDERS_FILE, "utf-8");
        const orders = JSON.parse(rawData);
        if (Array.isArray(orders)) {
          memoryOrders = orders;
        }
      } catch (_) {}
    }
    
    const index = memoryOrders.findIndex((o: any) => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const order = memoryOrders[index];
    const updatedHistory = [...order.trackingHistory];
    
    // Status transitions
    const statusOrder = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentMaxIdx = statusOrder.indexOf(nextStatus);
    
    const remadeHistory = updatedHistory.map((h: any) => {
      const hIdx = statusOrder.indexOf(h.status);
      if (h.status === nextStatus) {
        return { ...newStep, completed: true };
      }
      if (hIdx < currentMaxIdx) {
        return { ...h, completed: true };
      }
      return h;
    });
    
    order.status = nextStatus;
    order.trackingHistory = remadeHistory;
    
    memoryOrders[index] = order;
    
    safeWriteFileSync(ORDERS_FILE, JSON.stringify(memoryOrders, null, 2));
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Real-time AI Styling & Logistics Assistant Route
app.post(["/api/ai/chat", "/ai/chat"], async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!aiClient) {
      // Fallback response generator if API key is not yet configured
      const isArabic = /[\u0600-\u06FF]/.test(message);
      let fallbackText = "";
      if (isArabic) {
        if (message.includes("مقاس") || message.includes("حجم") || message.includes("سعر")) {
          fallbackText = "المقاسات عندنا مريحة وأوفرسايز (Oversized) لتمنحك الراحة الكاملة والمظهر العصري لملابس الشارع. للوزن من ٥٥-٧٠ كجم نوصي بـ M، ولـ ٧٠-٨٥ كجم بـ L، ولـ ٨٥-١٠٠ كجم بـ XL، وأكثر من ١٠٠ كجم بـ XXL. الأسعار معروضة بكل قطعة وتبدأ من ٦٥٠ جنيه مصري يا غالي!";
        } else if (message.includes("توصيل") || message.includes("شحن") || message.includes("دليفري")) {
          fallbackText = "الشحن بيوصلك خلال ٢-٣ أيام عمل للقاهرة والجيزة (تكلفة الشحن ٥٠ ج.م فقط)، و٣-٤ أيام عمل للإسكندرية والمحافظات الأخرى. تقدر تتابع خط سير شحنتك لحظة بلحظة من صفحة التتبع بالرقم الخاص بك!";
        } else if (message.includes("خامة") || message.includes("قطن") || message.includes("قماش")) {
          fallbackText = "إحنا بنستخدم أفضل خامات القطن المصري الفاخر ذو الوزن الثقيل (Heavyweight). الهوديز معمولة من قطن فرينش تيري ٤٠٠ جرام مبطن بفليس فائق النعومة، والتيشرتات من قطن سينجل جيرسي ٢٦٠ جرام لضمان المتانة والشياكة! وجميع القطع معالجة مسبقاً ضد الانكماش.";
        } else {
          fallbackText = "يا هلا بيك في ريترو إيجيبت! 🚀 ملابسنا مصممة خصيصاً لتكسر جميع قواعد الموضة التقليدية وتناسب ذوقك الفريد. هل تحب أساعدك في اختيار مقاس قطعة معينة، أو عندك استفسار عن طرق الدفع والشحن؟";
        }
      } else {
        if (message.toLowerCase().includes("size") || message.toLowerCase().includes("fit") || message.toLowerCase().includes("price")) {
          fallbackText = "Our fits are Oversized & Boxy for that perfect streetwear silhouette! M fits 55-70kg, L fits 70-85kg, XL fits 85-100kg, XXL fits 100-120kg. Retail prices start from 650 EGP!";
        } else if (message.toLowerCase().includes("delivery") || message.toLowerCase().includes("shipping") || message.toLowerCase().includes("ship")) {
          fallbackText = "Fast delivery takes just 2-3 business days for Cairo & Giza (50 EGP) and 3-4 days to Alexandria and other Governorates. Track your parcel anytime on the Order Tracker screen!";
        } else if (message.toLowerCase().includes("material") || message.toLowerCase().includes("fabric") || message.toLowerCase().includes("cotton")) {
          fallbackText = "We use ultra-premium heavyweight Egyptian cotton (400 GSM brushed fleece for hoodies and 260 GSM single jersey for tees). Pre-shrunk and built to last.";
        } else {
          fallbackText = "Welcome to RETRO! 🚀 We design premium oversized streetwear to break boundaries. How can I assist you today? Sizing, tracking, or fabric choices?";
        }
      }
      return res.json({ text: fallbackText });
    }

    // Map history to standard Gemini chat role objects
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      });
    }

    // Append user's current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const systemInstruction = `
You are the official RETRO EG Streetwear styling & logistics virtual assistant.
RETRO EG is a high-fashion, premium, ultra-modern oversized streetwear brand based in Egypt.
All of our garments are proudly made in Egypt using the finest heavy Egyptian cotton.

Here is your detailed product and operational knowledge:
1. PRODUCTS IN STOCK:
   - "RETRO COSMIC OVERSIZED HOODIE" (هودي ريترو كوزميك أوفرسايز): Price is 1250 EGP (original 1650 EGP). Heavyweight 400 GSM French Terry brushed fleece with retro orbit and star graphics. Colors: Carbon Black, Charcoal Grey, Off-White.
   - "RETRO ORBIT ACID-WASH TEE" (تيشرت ريترو أوربت أسيد-واش): Price is 650 EGP (original 850 EGP). Heavyweight 260 GSM single jersey cotton with 90s orbit-spark print and vintage acid wash finish. Colors: Acid Black, Acid Grey.
   - "TECH-RETRO CARGO PANTS" (بنطلون كارجو تيك-ريترو): Price is 1100 EGP (original 1450 EGP). Heavy premium cotton twill with contrast white stitching, 6 utility pockets, and adjustable ankle toggles. Colors: Utility Black, Sage Green, Desert Sand.
   - "VINTAGE WINDBREAKER BOMBER" (جاكيت ويندبريكر بومبر كلاسيكي): Price is 1450 EGP (original 1950 EGP). Premium lightweight crinkled nylon taslan, water-resistant, windproof, with comfortable mesh lining. Colors: Eclipse Black/Grey, Retro Teal/Navy.

2. SIZING GUIDELINES (All garments are designed with a relaxed, modern boxy, Oversized streetwear fit):
   - M: fits 55 to 70 kg (width 60cm)
   - L: fits 70 to 85 kg (width 63cm)
   - XL: fits 85 to 100 kg (width 66cm)
   - XXL: fits 100 to 120 kg (width 70cm)
   Recommend sizes confidently based on the customer's weight!

3. SHIPPING & LOGISTICS (Cash on Delivery / الدفع عند الاستلام is our standard):
   - Cairo & Giza (القاهرة والجيزة): 50 EGP shipping fee, delivery in 2-3 business days.
   - Alexandria (الإسكندرية): 75 EGP shipping fee, delivery in 3-4 business days.
   - Other Governorates (المحافظات الأخرى): Delta, Canal, Qalyubia (65-80 EGP), Upper Egypt (95-140 EGP).
   - Customers can track their orders in the "Order Logistics / تتبع طلبك" tab of the navbar using their custom order ID (e.g. RETRO-102543) which they get upon checkout.

4. BEHAVIOR AND LANGUAGE RULE (CRITICAL):
   - Always respond in the EXACT same language as the user's latest query!
   - If the user writes in ARABIC, reply in super stylish, modern, warm, and highly engaging Egyptian Arabic (use Egyptian streetwear slang like "يا باشا", "يا غالي", "صاحبي", "منور", "كولكشن" where appropriate but maintain premium high-end styling authority).
   - If the user writes in ENGLISH, reply in stylish, modern, enthusiastic street-culture English (using terms like "fam", "drip", "fire silhouette", "heavy weight drape", "oversized streetwear aesthetics").
   - NEVER start the response in English if the user asked in Arabic, or vice-versa!
   - Make your answers concise, visual, highly structured, beautifully styled, exciting, and extremely polite.
   - Give direct styling tips, support color matching (e.g. combining Acid Black Tee with Sage Green Cargo, or Off-White Hoodie with Utility Black Cargo), and encourage them to cop their favorite piece before it sells out!
`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
      }
    });

    const replyText = response.text || "I'm here to help with your street style questions!";
    res.json({ text: replyText });

  } catch (error: any) {
    console.error("Gemini API Error in backend:", error);
    res.status(500).json({ error: "Failed to generate response from Gemini" });
  }
});


// Vite middleware / Static Asset Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RETRO Full-stack server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

export default app;
