import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Paths for persistent JSON database files
const DATA_DIR = path.join(process.cwd(), "src", "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products_db.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders_db.json");

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
    image: "/src/assets/images/retro_hoodie_1784140861378.jpg",
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
    image: "/src/assets/images/retro_tee_1784140871626.jpg",
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
    image: "/src/assets/images/retro_cargo_1784140882129.jpg",
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
    image: "/src/assets/images/retro_jacket_1784140892340.jpg",
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
        image: "/src/assets/images/retro_hoodie_1784140861378.jpg",
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
        image: "/src/assets/images/retro_cargo_1784140882129.jpg",
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
function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), "utf-8");
    console.log("Initialized products database file.");
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(SEED_ORDERS, null, 2), "utf-8");
    console.log("Initialized orders database file.");
  }
}

initDatabase();

// DATABASE API ROUTES
// 1. Get all products
app.get("/api/products", (req, res) => {
  try {
    const rawData = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    const products = JSON.parse(rawData);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to read products database" });
  }
});

// 2. Add new product (Admin)
app.post("/api/products", (req, res) => {
  try {
    const newProduct = req.body;
    const rawData = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    const products = JSON.parse(rawData);
    
    // Add to start of list
    products.unshift(newProduct);
    
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to save product" });
  }
});

// 3. Update product details (Admin edit price or toggle stock)
app.patch("/api/products/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { price, inStock } = req.body;
    const rawData = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    const products = JSON.parse(rawData);
    
    const index = products.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    if (price !== undefined) products[index].price = Number(price);
    if (inStock !== undefined) products[index].inStock = Boolean(inStock);
    
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// 4. Get all orders
app.get("/api/orders", (req, res) => {
  try {
    const rawData = fs.readFileSync(ORDERS_FILE, "utf-8");
    const orders = JSON.parse(rawData);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to read orders database" });
  }
});

// 5. Get single order by tracking ID
app.get("/api/orders/:id", (req, res) => {
  try {
    const { id } = req.params;
    const rawData = fs.readFileSync(ORDERS_FILE, "utf-8");
    const orders = JSON.parse(rawData);
    
    const order = orders.find((o: any) => o.id === id.trim().toUpperCase());
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to search order" });
  }
});

// 6. Place new order
app.post("/api/orders", (req, res) => {
  try {
    const newOrder = req.body;
    const rawData = fs.readFileSync(ORDERS_FILE, "utf-8");
    const orders = JSON.parse(rawData);
    
    // Add to start of list
    orders.unshift(newOrder);
    
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to place order" });
  }
});

// 7. Update order status and log timeline step (Admin)
app.patch("/api/orders/:id/status", (req, res) => {
  try {
    const { id } = req.params;
    const { status, nextStatus, newStep } = req.body; // status: exact state, newStep: complete details
    
    const rawData = fs.readFileSync(ORDERS_FILE, "utf-8");
    const orders = JSON.parse(rawData);
    
    const index = orders.findIndex((o: any) => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const order = orders[index];
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
    
    orders[index] = order;
    
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
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

startServer();
