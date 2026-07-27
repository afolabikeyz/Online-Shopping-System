import { useState, useMemo, useRef } from "react";
import {
  Search, ShoppingCart, Heart, User, Star, Plus, Minus,
  Trash2, Package, TrendingUp, Users, Bell,
  ArrowLeft, Check, Truck, CreditCard, MapPin, ChevronDown, ChevronRight,
  Eye, Edit, Store, Sun, Moon, ArrowRight, Clock, CheckCircle, XCircle,
  Download, Shield, AlertCircle, ShoppingBag, LayoutGrid, List,
  Tag, Zap, Award, Globe, Lock, RefreshCw, LogOut, Mail,
  BarChart2, Sparkles, UserCheck, Building2, Play,
  Smartphone, X,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const DISPLAY = "'DM Serif Display', Georgia, serif";
const BODY    = "'Plus Jakarta Sans', system-ui, sans-serif";
const MONO    = "'JetBrains Mono', monospace";

const fmt = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Types ──────────────────────────────────────────────────────────────────────
type Page =
  | "landing" | "auth"
  | "customer-home" | "products" | "detail" | "cart" | "checkout" | "confirmed" | "customer-dash"
  | "vendor-dash" | "admin-dash";
type Role = "customer" | "vendor" | "admin";
type AuthMode = "email" | "login" | "register";
type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface AppUser {
  id: string; name: string; email: string; role: Role;
  initials: string; status: "active" | "pending"; joined: string; orders: number;
}
interface Product {
  id: string; name: string; price: number; originalPrice?: number;
  image: string; category: string; brand: string; rating: number; reviews: number;
  inStock: boolean; description: string; specs?: Record<string, string>;
  variants?: { colors?: string[]; sizes?: string[] }; tags: string[];
}
interface CartItem { product: Product; qty: number; color?: string; size?: string; }
interface Order {
  id: string; date: string; status: OrderStatus;
  items: { name: string; qty: number; price: number }[];
  total: number; tracking?: string;
}

// ── Products ───────────────────────────────────────────────────────────────────
const INITIAL_PRODUCTS: Product[] = [
  { id:"p1", name:"Pro Noise-Cancelling Headphones", price:420000, originalPrice:524000, image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"SoundPro", rating:4.8, reviews:2847, inStock:true, description:"Studio-quality audio with adaptive noise cancellation and 40-hour battery life.", specs:{Battery:"40h",Connectivity:"Bluetooth 5.3",Weight:"250g"}, variants:{colors:["Midnight Black","Pearl White","Ocean Blue"]}, tags:["wireless","audio","premium"] },
  { id:"p2", name:"Precision Sport Watch", price:284000, originalPrice:374000, image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"ChronoX", rating:4.6, reviews:1203, inStock:true, description:"GPS-enabled smartwatch with 7-day battery, heart rate, sleep, SpO2 monitoring.", specs:{Battery:"7 days",Display:"1.4\" AMOLED","Water Resistance":"5ATM"}, variants:{colors:["Carbon Black","Silver","Rose Gold"]}, tags:["smartwatch","fitness","GPS"] },
  { id:"p3", name:"UltraSlim Pro Laptop 14\"", price:1950000, originalPrice:2250000, image:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"NovaTech", rating:4.9, reviews:856, inStock:true, description:"Next-gen ultrabook with M3 chip, 18-hour battery, stunning 2K display. 1.2kg.", specs:{Processor:"M3 Pro",RAM:"16GB",Storage:"512GB NVMe SSD",Display:"14\" 2K 120Hz"}, variants:{colors:["Space Gray","Silver"]}, tags:["laptop","ultrabook","professional"] },
  { id:"p4", name:"True Wireless Earbuds Pro", price:134000, originalPrice:194000, image:"https://images.unsplash.com/photo-1590658006821-04a631b4d88f?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"SoundPro", rating:4.5, reviews:3621, inStock:true, description:"Crystal-clear audio with hybrid ANC, 28 hours total battery, IPX5.", specs:{Battery:"7h + 21h case",Connectivity:"Bluetooth 5.2"}, variants:{colors:["Matte Black","Glacier White","Sage Green"]}, tags:["earbuds","wireless","audio"] },
  { id:"p5", name:"Mirrorless Camera Kit", price:1350000, originalPrice:1650000, image:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"PixelPro", rating:4.8, reviews:634, inStock:false, description:"24MP BSI-CMOS, 5-axis IBIS, 4K/30fps video, 10fps burst.", specs:{Sensor:"24MP APS-C",Video:"4K 30fps"}, variants:{colors:["Matte Black"]}, tags:["camera","photography","professional"] },
  { id:"p6", name:"iPad Pro 12.9\" M4", price:1650000, originalPrice:1890000, image:"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"Apple", rating:4.9, reviews:1482, inStock:true, description:"Liquid Retina XDR, M4 chip, 10-hour battery, 5.1mm ultra-thin design.", specs:{Chip:"M4",Display:"12.9\" Liquid Retina XDR",Storage:"256GB"}, variants:{colors:["Silver","Space Gray"]}, tags:["tablet","apple","professional"] },
  { id:"p7", name:"Gaming Mechanical Keyboard", price:185000, originalPrice:245000, image:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"KeyForge", rating:4.7, reviews:921, inStock:true, description:"Full RGB per-key mechanical keyboard, Cherry MX switches, detachable USB-C.", specs:{Switch:"Cherry MX Red",Layout:"TKL 87-key",Backlight:"RGB per-key"}, variants:{colors:["Black","White"]}, tags:["keyboard","gaming","mechanical"] },
  { id:"p8", name:"4K Gaming Monitor 27\"", price:480000, originalPrice:590000, image:"https://images.unsplash.com/photo-1593640408182-31c228dfd7b8?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"VisionTech", rating:4.6, reviews:742, inStock:true, description:"27-inch 4K IPS, 144Hz, 1ms response, FreeSync Premium Pro, HDR400.", specs:{Resolution:"3840×2160",Refresh:"144Hz",Panel:"IPS"}, variants:{colors:["Matte Black"]}, tags:["monitor","gaming","4K"] },
  { id:"p9", name:"Wireless Gaming Mouse", price:89000, originalPrice:125000, image:"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"SwiftClick", rating:4.5, reviews:1834, inStock:true, description:"Ultra-lightweight 68g, 25,600 DPI, 70-hour battery, 2.4GHz lag-free.", specs:{DPI:"100-25,600",Battery:"70 hours",Weight:"68g"}, variants:{colors:["Matte Black","White"]}, tags:["mouse","gaming","wireless"] },
  { id:"p10", name:"Portable Bluetooth Speaker", price:95000, originalPrice:130000, image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"BoomBox", rating:4.4, reviews:2156, inStock:true, description:"360° surround, 24-hour battery, IP67 waterproof, built-in power bank.", specs:{Battery:"24 hours","Water Rating":"IP67",Power:"40W"}, variants:{colors:["Midnight Blue","Forest Green","Graphite"]}, tags:["speaker","bluetooth","portable"] },
  { id:"p11", name:"iPhone 16 Pro Max 256GB", price:2850000, originalPrice:3200000, image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"Apple", rating:4.9, reviews:15234, inStock:true, description:"A18 Pro chip, 48MP Fusion camera, Titanium design, USB 3 speeds.", specs:{Chip:"A18 Pro",Camera:"48MP Triple",Display:"6.9\" Super Retina XDR",Storage:"256GB"}, variants:{colors:["Black Titanium","Natural Titanium","White Titanium"]}, tags:["smartphone","apple","premium"] },
  { id:"p12", name:"Samsung Galaxy S24 Ultra", price:2350000, originalPrice:2750000, image:"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"Samsung", rating:4.8, reviews:11432, inStock:true, description:"200MP camera, built-in S Pen, titanium frame, Snapdragon 8 Gen 3.", specs:{Processor:"Snapdragon 8 Gen 3",Camera:"200MP+50MP+12MP+10MP",RAM:"12GB"}, variants:{colors:["Titanium Black","Titanium Gray","Titanium Violet"]}, tags:["smartphone","samsung","android"] },
  { id:"p13", name:"Tecno Camon 30 Pro", price:380000, originalPrice:450000, image:"https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"Tecno", rating:4.4, reviews:6543, inStock:true, description:"50MP OIS, 120Hz AMOLED, 5000mAh, 45W fast charge. Made for Nigeria.", specs:{Processor:"Dimensity 8200",Camera:"50MP OIS",Battery:"5000mAh 45W"}, variants:{colors:["Midnight Shadow","Luna White"]}, tags:["smartphone","tecno","camera"] },
  // Fashion
  { id:"p14", name:"Air Runner Sneakers", price:224000, originalPrice:284000, image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&auto=format", category:"Fashion", brand:"StrideFit", rating:4.7, reviews:4102, inStock:true, description:"Engineered mesh, responsive foam midsole, carbon fiber plate.", specs:{Material:"Engineered Mesh",Sole:"Carbon Foam",Drop:"8mm",Weight:"265g"}, variants:{colors:["Black/White","White/Blue","Red/Black"],sizes:["39","40","41","42","43","44","45"]}, tags:["sneakers","running","sports"] },
  { id:"p15", name:"Polarized Aviator Sunglasses", price:119000, image:"https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop&auto=format", category:"Fashion", brand:"VisionElite", rating:4.4, reviews:782, inStock:true, description:"UV400 polarized titanium frame, premium hard case included.", specs:{Frame:"Titanium",Lens:"Polarized UV400",Weight:"18g"}, variants:{colors:["Gold/Amber","Silver/Blue","Gunmetal/Gray"]}, tags:["sunglasses","fashion","UV protection"] },
  { id:"p16", name:"Full-Grain Leather Backpack", price:299000, originalPrice:389000, image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&auto=format", category:"Fashion", brand:"CargoLux", rating:4.6, reviews:1456, inStock:true, description:"Premium full-grain leather, 20L, padded laptop sleeve to 15\", YKK zippers.", specs:{Material:"Full-grain Leather",Capacity:"20L","Laptop Sleeve":"Up to 15\""}, variants:{colors:["Cognac Tan","Jet Black","Espresso"]}, tags:["backpack","leather","travel"] },
  { id:"p17", name:"Premium Agbada Set", price:185000, originalPrice:230000, image:"https://images.unsplash.com/photo-1594938298603-c8148c4b4ae0?w=600&h=600&fit=crop&auto=format", category:"Fashion", brand:"KadiCloth", rating:4.8, reviews:654, inStock:true, description:"Hand-embroidered 100% Aso-oke, 3-piece set for special occasions.", specs:{Fabric:"100% Aso-oke",Embroidery:"Hand-stitched",Pieces:"3-piece"}, variants:{colors:["Royal Blue","Burgundy","Ivory","Forest Green"],sizes:["S","M","L","XL","2XL","3XL"]}, tags:["agbada","traditional","nigerian"] },
  { id:"p18", name:"Slim Fit Chino Trousers", price:42000, originalPrice:60000, image:"https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=600&fit=crop&auto=format", category:"Fashion", brand:"UrbanCraft", rating:4.3, reviews:2341, inStock:true, description:"Stretch cotton, slim modern fit, wrinkle-resistant, machine washable.", specs:{Material:"98% Cotton 2% Elastane",Fit:"Slim"}, variants:{colors:["Khaki","Navy","Olive","Grey","Black"],sizes:["28","30","32","34","36","38","40"]}, tags:["trousers","chinos","office"] },
  { id:"p19", name:"Ankara Print Midi Dress", price:38000, originalPrice:55000, image:"https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=600&fit=crop&auto=format", category:"Fashion", brand:"AfroChic", rating:4.6, reviews:1876, inStock:true, description:"Bold Ankara wax print wrap dress, 100% cotton, vibrant colors.", specs:{Fabric:"100% Wax Cotton",Print:"Ankara wax",Length:"Midi"}, variants:{colors:["Blue Kente","Red/Gold","Green/Yellow","Purple Adire"],sizes:["XS","S","M","L","XL","2XL"]}, tags:["dress","ankara","african"] },
  { id:"p20", name:"Leather Dress Oxford Shoes", price:145000, originalPrice:195000, image:"https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=600&h=600&fit=crop&auto=format", category:"Fashion", brand:"EliteStep", rating:4.5, reviews:893, inStock:true, description:"Genuine calfskin, leather sole, Goodyear welt construction, handcrafted.", specs:{Upper:"Genuine calfskin",Sole:"Leather",Construction:"Goodyear welt"}, variants:{colors:["Dark Brown","Oxblood","Black"],sizes:["39","40","41","42","43","44","45"]}, tags:["shoes","formal","leather"] },
  { id:"p21", name:"Packable Trail Jacket", price:179000, originalPrice:239000, image:"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop&auto=format", category:"Fashion", brand:"TrailMax", rating:4.5, reviews:1089, inStock:true, description:"Ultralight waterproof, 100% recycled polyester, packs into chest pocket.", specs:{Material:"Recycled Polyester","Water Rating":"10,000mm HH",Weight:"180g"}, variants:{colors:["Forest Green","Navy Blue","Stealth Black"],sizes:["XS","S","M","L","XL","2XL"]}, tags:["jacket","running","waterproof"] },
  // Home & Living
  { id:"p22", name:"Minimal Arc Desk Lamp", price:104000, image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&auto=format", category:"Home & Living", brand:"LumaBright", rating:4.3, reviews:891, inStock:true, description:"LED desk lamp, stepless dimming, 3 colour temps, USB-C charging port.", specs:{Bulb:"LED 10W","Colour Temp":"2700K-6500K",Charging:"USB-C 18W"}, variants:{colors:["Matte White","Matte Black","Brushed Brass"]}, tags:["lamp","desk","home office"] },
  { id:"p23", name:"Precision Pour Coffee Maker", price:194000, originalPrice:254000, image:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop&auto=format", category:"Home & Living", brand:"BrewMaster", rating:4.7, reviews:2134, inStock:true, description:"SCAA-certified, bloom pre-soak, programmable temp, thermal carafe.", specs:{Capacity:"1L (8 cups)","Temp Control":"80-96°C",Carafe:"Thermal stainless"}, variants:{colors:["Matte Black","Brushed Steel"]}, tags:["coffee","kitchen","appliance"] },
  { id:"p24", name:"Bamboo Modular Plant Stand", price:89000, image:"https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop&auto=format", category:"Home & Living", brand:"GreenSpace", rating:4.2, reviews:445, inStock:true, description:"Sustainable bamboo and steel, holds pots up to 30cm, adjustable 60-90cm.", specs:{Material:"Bamboo/Steel","Max Pot":"30cm",Height:"60-90cm"}, variants:{colors:["Natural Bamboo","Matte Black"]}, tags:["plants","home decor","sustainable"] },
  { id:"p25", name:"Egyptian Cotton Bedsheet Set", price:95000, originalPrice:135000, image:"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=600&fit=crop&auto=format", category:"Home & Living", brand:"LuxLinens", rating:4.8, reviews:3241, inStock:true, description:"1000 thread count, 100% Egyptian cotton, 6-piece set, fade-resistant.", specs:{Material:"100% Egyptian Cotton","Thread Count":"1000",Pieces:"6-piece"}, variants:{colors:["Crisp White","Pearl Grey","Sage Green","Champagne"]}, tags:["bedding","cotton","luxury"] },
  { id:"p26", name:"Smart Air Purifier", price:285000, originalPrice:350000, image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&auto=format", category:"Home & Living", brand:"PureAir", rating:4.6, reviews:1123, inStock:true, description:"True HEPA H13, covers 65m², real-time air quality, app control.", specs:{Filter:"HEPA H13",Coverage:"65m²",Noise:"22dB"}, variants:{colors:["White","Black"]}, tags:["air purifier","smart home","health"] },
  { id:"p27", name:"Cast Iron Cookware 5-piece", price:210000, originalPrice:280000, image:"https://images.unsplash.com/photo-1584990347449-a4d176da1b7b?w=600&h=600&fit=crop&auto=format", category:"Home & Living", brand:"IronChef", rating:4.7, reviews:1876, inStock:true, description:"Pre-seasoned 5-piece set: 10\" skillet, 12\" skillet, Dutch oven, griddle, lid.", specs:{Material:"Cast Iron",Pieces:"5-piece","Oven Safe":"260°C"}, variants:{colors:["Classic Black"]}, tags:["cookware","kitchen","cast iron"] },
  { id:"p28", name:"Ergonomic Office Chair", price:375000, originalPrice:480000, image:"https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=600&fit=crop&auto=format", category:"Home & Living", brand:"ErgoPlus", rating:4.8, reviews:2567, inStock:true, description:"4D armrests, breathable mesh, adjustable headrest, 150kg capacity.", specs:{Back:"Mesh","Lumbar Support":"4-way adjustable",Capacity:"150kg"}, variants:{colors:["Black/Grey","Black/Blue","All Black"]}, tags:["chair","office","ergonomic"] },
  // Sports
  { id:"p29", name:"Adjustable Dumbbell Set 5-50kg", price:320000, originalPrice:420000, image:"https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop&auto=format", category:"Sports", brand:"IronCore", rating:4.8, reviews:2341, inStock:true, description:"Single dumbbell 5-50kg in 2.5kg increments. Replaces 19 sets.", specs:{Range:"5–50kg",Increments:"2.5kg",System:"Dial select"}, variants:{colors:["Black/Silver"]}, tags:["dumbbell","weights","home gym"] },
  { id:"p30", name:"Premium Yoga Mat 6mm", price:55000, originalPrice:80000, image:"https://images.unsplash.com/photo-1601925228966-32c5a59ef2e0?w=600&h=600&fit=crop&auto=format", category:"Sports", brand:"ZenFlow", rating:4.5, reviews:3412, inStock:true, description:"Non-slip TPE, alignment lines, sweat-resistant, includes carry bag.", specs:{Material:"TPE eco-friendly",Thickness:"6mm",Dimensions:"183×61cm"}, variants:{colors:["Midnight Purple","Teal","Coral","Slate Grey"]}, tags:["yoga","fitness","mat"] },
  { id:"p31", name:"Mountain Bike Helmet MIPS", price:78000, originalPrice:110000, image:"https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=600&fit=crop&auto=format", category:"Sports", brand:"RideShield", rating:4.7, reviews:876, inStock:true, description:"MIPS-certified, 22 vents, fit dial, removable visor, EN1078 certified.", specs:{Certification:"MIPS EN1078 CPSC",Vents:"22",Weight:"285g"}, variants:{colors:["Matte Black","Neon Yellow","Trail Grey"],sizes:["S (52-56cm)","M (56-60cm)","L (60-64cm)"]}, tags:["helmet","cycling","MTB"] },
  { id:"p32", name:"Speed Jump Rope Cable", price:28000, originalPrice:45000, image:"https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=600&h=600&fit=crop&auto=format", category:"Sports", brand:"CrossFit Pro", rating:4.4, reviews:4521, inStock:true, description:"Steel ball-bearing handles, 3mm PVC-coated cable, adjustable length.", specs:{Handles:"Aluminium + ball bearing",Cable:"3mm PVC-coated steel",Length:"Adjustable to 3m"}, variants:{colors:["Black/Red","Black/Blue","All Black"]}, tags:["jump rope","cardio","crossfit"] },
  // Gaming
  { id:"p33", name:"PS5 DualSense Controller", price:95000, originalPrice:130000, image:"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop&auto=format", category:"Gaming", brand:"Sony", rating:4.9, reviews:8921, inStock:true, description:"Haptic feedback, adaptive triggers, built-in mic, USB-C charging.", specs:{Haptics:"Advanced haptic",Triggers:"Adaptive",Battery:"12 hours",Charging:"USB-C"}, variants:{colors:["White","Midnight Black","Cosmic Red","Galactic Purple"]}, tags:["gaming","PS5","controller"] },
  { id:"p34", name:"Gaming Headset 7.1 Surround", price:145000, originalPrice:190000, image:"https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&auto=format", category:"Gaming", brand:"SoundPro", rating:4.6, reviews:2134, inStock:true, description:"Virtual 7.1 surround, NC retractable mic, memory foam. PC/PS5/Xbox.", specs:{Audio:"7.1 Virtual Surround",Mic:"Retractable NC",Drivers:"50mm"}, variants:{colors:["Black/Red","Black/Blue"]}, tags:["headset","gaming","surround"] },
  // Books
  { id:"p35", name:"Nigerian Stock Market Mastery", price:18500, originalPrice:25000, image:"https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&h=600&fit=crop&auto=format", category:"Books", brand:"FinEdge Press", rating:4.6, reviews:1245, inStock:true, description:"Comprehensive NGX guide: fundamental analysis, sector rotation, dividends.", specs:{Pages:"380",Author:"Adebayo Oluwole",Edition:"3rd (2024)"}, variants:{colors:["Paperback"]}, tags:["finance","investing","Nigeria"] },
  { id:"p36", name:"Kindle Scribe E-Reader", price:285000, originalPrice:340000, image:"https://images.unsplash.com/photo-1621609764547-6b8a0f22d22e?w=600&h=600&fit=crop&auto=format", category:"Books", brand:"Amazon", rating:4.7, reviews:3876, inStock:true, description:"10.2-inch 300ppi, write directly on books, months of battery.", specs:{Display:"10.2\" 300ppi",Storage:"16GB",Pen:"Included"}, variants:{colors:["Premium Black"]}, tags:["ereader","kindle","books"] },
  // Groceries
  { id:"p37", name:"Organic Raw Honey 1kg", price:12500, originalPrice:18000, image:"https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&h=600&fit=crop&auto=format", category:"Groceries", brand:"NaijaFarm", rating:4.7, reviews:8932, inStock:true, description:"100% raw unfiltered honey from Nigerian bee farms. No additives.", specs:{Weight:"1kg",Type:"Raw unfiltered",Origin:"Nigerian bee farms"}, variants:{colors:["Standard Pack"]}, tags:["honey","organic","natural"] },
  { id:"p38", name:"Premium Zobo Drink 12-pack", price:18000, originalPrice:24000, image:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop&auto=format", category:"Groceries", brand:"ZoboKing", rating:4.5, reviews:3421, inStock:true, description:"All-natural zobo with cloves, ginger, pineapple. No preservatives. 330ml×12.", specs:{Volume:"330ml × 12",Preservatives:"None"}, variants:{colors:["Classic","Extra Spicy"]}, tags:["zobo","hibiscus","drink"] },
  { id:"p39", name:"Ofada Rice Premium 5kg", price:22000, originalPrice:30000, image:"https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop&auto=format", category:"Groceries", brand:"NaijaFarm", rating:4.6, reviews:5621, inStock:true, description:"Authentic Ofada rice from Ogun State, low GI, naturally fragrant.", specs:{Weight:"5kg",Origin:"Ogun State, Nigeria",Type:"Brown short-grain"}, variants:{colors:["5kg Bag"]}, tags:["rice","ofada","organic","nigerian"] },
  { id:"p40", name:"Smart Home Security Camera 2K", price:68000, originalPrice:95000, image:"https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&h=600&fit=crop&auto=format", category:"Electronics", brand:"SafeView", rating:4.3, reviews:987, inStock:true, description:"4MP 2K, AI motion, color night vision, two-way audio. Alexa & Google.", specs:{Resolution:"2K 4MP","Night Vision":"Full color",Audio:"Two-way"}, variants:{colors:["White","Black"]}, tags:["security","smart home"] },
];

const STOCK_LEVELS: Record<string, number> = {
  p1:23,p2:45,p3:8,p4:67,p5:0,p6:14,p7:31,p8:12,p9:55,p10:28,
  p11:5,p12:18,p13:34,p14:22,p15:41,p16:7,p17:56,p18:13,p19:29,p20:44,
};

const STATIC_USERS: AppUser[] = [
  { id:"u1", name:"Amaka Okonkwo",  email:"amaka@example.com",  role:"customer", status:"active",  joined:"Mar 12, 2024", orders:14, initials:"AO" },
  { id:"u2", name:"Emeka Johnson",  email:"vendor@nexmart.com", role:"vendor",   status:"active",  joined:"Jan 8, 2024",  orders:0,  initials:"EJ" },
  { id:"u3", name:"Chisom Eze",     email:"chisom@example.com", role:"customer", status:"active",  joined:"Jun 22, 2024", orders:7,  initials:"CE" },
  { id:"u4", name:"David Adeyemi",  email:"david@example.com",  role:"customer", status:"active",  joined:"Feb 14, 2024", orders:2,  initials:"DA" },
  { id:"u5", name:"Fatima Sule",    email:"fatima@example.com", role:"vendor",   status:"pending", joined:"Dec 1, 2024",  orders:0,  initials:"FS" },
  { id:"u6", name:"Tunde Balogun",  email:"admin@nexmart.com",  role:"admin",    status:"active",  joined:"Nov 30, 2023", orders:0,  initials:"TB" },
];

const MOCK_ORDERS: Order[] = [
  { id:"ORD-2024-8821", date:"Dec 15, 2024", status:"delivered",  items:[{name:"Pro Noise-Cancelling Headphones",qty:1,price:420000},{name:"True Wireless Earbuds Pro",qty:1,price:134000}], total:554000,   tracking:"TRK-7829431" },
  { id:"ORD-2024-8764", date:"Dec 20, 2024", status:"shipped",    items:[{name:"UltraSlim Pro Laptop 14\"",qty:1,price:1950000}], total:1950000, tracking:"TRK-6619284" },
  { id:"ORD-2024-8701", date:"Dec 22, 2024", status:"processing", items:[{name:"Precision Sport Watch",qty:1,price:284000},{name:"Air Runner Sneakers",qty:1,price:224000}], total:508000 },
  { id:"ORD-2024-8650", date:"Dec 18, 2024", status:"cancelled",  items:[{name:"Mirrorless Camera Kit",qty:1,price:1350000}], total:1350000 },
  { id:"ORD-2024-8590", date:"Dec 10, 2024", status:"delivered",  items:[{name:"Full-Grain Leather Backpack",qty:1,price:299000}], total:299000, tracking:"TRK-5574312" },
];

const REVENUE_DATA = [
  { month:"Jul", revenue:28400000, orders:183 },
  { month:"Aug", revenue:32100000, orders:207 },
  { month:"Sep", revenue:29800000, orders:191 },
  { month:"Oct", revenue:38600000, orders:248 },
  { month:"Nov", revenue:52400000, orders:337 },
  { month:"Dec", revenue:61200000, orders:394 },
];

const CATEGORY_DATA = [
  { name:"Electronics", value:38, color:"#3b82f6" },
  { name:"Fashion",     value:24, color:"#a78bfa" },
  { name:"Home",        value:16, color:"#34d399" },
  { name:"Sports",      value:10, color:"#fbbf24" },
  { name:"Gaming",      value:7,  color:"#f87171" },
  { name:"Other",       value:5,  color:"#94a3b8" },
];

const CATEGORIES = ["All","Electronics","Fashion","Home & Living","Sports","Gaming","Books","Groceries"];

const statusConfig: Record<OrderStatus,{label:string;bg:string;fg:string;icon:React.ComponentType<{className?:string}>}> = {
  pending:    { label:"Pending",    bg:"bg-yellow-50", fg:"text-yellow-700", icon:Clock },
  processing: { label:"Processing", bg:"bg-blue-50",   fg:"text-blue-700",   icon:Package },
  shipped:    { label:"Shipped",    bg:"bg-purple-50", fg:"text-purple-700", icon:Truck },
  delivered:  { label:"Delivered",  bg:"bg-green-50",  fg:"text-green-700",  icon:CheckCircle },
  cancelled:  { label:"Cancelled",  bg:"bg-red-50",    fg:"text-red-600",    icon:XCircle },
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function StarRating({ rating, size="sm" }:{ rating:number; size?:"sm"|"md" }) {
  const sz = size==="sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return <div className="flex items-center gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} className={`${sz} ${i<=Math.floor(rating)?"fill-amber-400 text-amber-400":"fill-gray-200 text-gray-200"}`}/>)}</div>;
}
function StatusBadge({ status }:{ status:OrderStatus }) {
  const { label,bg,fg,icon:Icon } = statusConfig[status];
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${fg}`}><Icon className="w-3 h-3"/>{label}</span>;
}
function ProductCard({ product,onNavigate,onAddToCart,isWishlisted,onToggleWishlist }:{
  product:Product; onNavigate:()=>void; onAddToCart:()=>void; isWishlisted:boolean; onToggleWishlist:()=>void;
}) {
  const discount = product.originalPrice ? Math.round((1-product.price/product.originalPrice)*100) : 0;
  return (
    <div className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative aspect-square bg-muted overflow-hidden cursor-pointer" onClick={onNavigate}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        {discount>0 && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-{discount}%</span>}
        {!product.inStock && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="bg-white text-gray-900 text-sm font-semibold px-3 py-1.5 rounded-full">Out of Stock</span></div>}
        <button onClick={e=>{e.stopPropagation();onToggleWishlist();}} className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${isWishlisted?"bg-red-500 text-white":"bg-white/80 text-gray-600 hover:bg-white"}`}><Heart className={`w-4 h-4 ${isWishlisted?"fill-current":""}`}/></button>
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1 font-medium">{product.brand}</p>
        <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 cursor-pointer hover:text-green-600 transition-colors" onClick={onNavigate}>{product.name}</h3>
        <div className="flex items-center gap-2 mb-3"><StarRating rating={product.rating}/><span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span></div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm" style={{fontFamily:MONO}}>{fmt(product.price)}</span>
            {product.originalPrice && <span className="text-xs text-muted-foreground line-through" style={{fontFamily:MONO}}>{fmt(product.originalPrice)}</span>}
          </div>
          <button onClick={e=>{e.stopPropagation();if(product.inStock)onAddToCart();}} disabled={!product.inStock} className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-40 text-white" style={{backgroundColor:"#16a34a"}}>{product.inStock?"Add":"N/A"}</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  // User registry – includes newly registered users so admin can see them
  const [userRegistry, setUserRegistry] = useState<AppUser[]>(STATIC_USERS);
  // Product registry – vendor can add products
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Auth
  const [currentUser, setCurrentUser] = useState<AppUser|null>(null);
  const [page, setPage]               = useState<Page>("landing");
  const [authMode, setAuthMode]       = useState<AuthMode>("email");
  const [authEmail, setAuthEmail]     = useState("");
  const [authName, setAuthName]       = useState("");
  const [authPass, setAuthPass]       = useState("");
  const [authConfirm, setAuthConfirm] = useState("");
  const [authRole, setAuthRole]       = useState<"customer"|"vendor">("customer");
  const [authError, setAuthError]     = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Landing scroll refs
  const featuresRef = useRef<HTMLDivElement>(null);
  const vendorsRef  = useRef<HTMLDivElement>(null);
  const pricingRef  = useRef<HTMLDivElement>(null);
  const aboutRef    = useRef<HTMLDivElement>(null);

  // UI
  const [darkMode, setDarkMode]   = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Shop
  const [selectedProduct, setSelectedProduct] = useState<Product|null>(null);
  const [cart, setCart]         = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [couponCode, setCouponCode]       = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError]     = useState("");
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange]   = useState(3000000);
  const [sortBy, setSortBy]           = useState("featured");
  const [viewMode, setViewMode]       = useState<"grid"|"list">("grid");
  const [minRating, setMinRating]     = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize]   = useState("");
  const [detailQty, setDetailQty]         = useState(1);
  const [detailTab, setDetailTab] = useState<"description"|"specs"|"reviews">("description");

  // Checkout
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({ firstName:"", lastName:"", email:"", phone:"", address:"", city:"", state:"", zip:"", paymentMethod:"paystack", cardNumber:"", cardExpiry:"", cardCvv:"", delivery:"standard" });
  const [confirmedOrder, setConfirmedOrder] = useState("");

  // Dashboard
  const [dashTab, setDashTab] = useState("overview");

  // Add Product modal (vendor)
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name:"", price:"", category:"Electronics", description:"", brand:"", inStock:true, image:"" });
  const [addProductError, setAddProductError] = useState("");

  // ── Helpers ────────────────────────────────────────────────────────────────
  const navigate = (p: Page, product?: Product) => {
    if (product) setSelectedProduct(product);
    if (p==="detail") { setSelectedColor(product?.variants?.colors?.[0]??""); setSelectedSize(product?.variants?.sizes?.[0]??""); setDetailQty(1); setDetailTab("description"); }
    if (p==="checkout") setCheckoutStep(1);
    if (["vendor-dash","admin-dash","customer-dash"].includes(p)) setDashTab("overview");
    setPage(p); setMobileMenuOpen(false); window.scrollTo({top:0});
  };

  const scrollToRef = (ref: React.RefObject<HTMLDivElement|null>) =>
    ref.current?.scrollIntoView({ behavior:"smooth", block:"start" });

  const handleLandingNav = (section: "features"|"vendors"|"pricing"|"about") => {
    if (page !== "landing") { navigate("landing"); setTimeout(()=>{ const refs={features:featuresRef,vendors:vendorsRef,pricing:pricingRef,about:aboutRef}; scrollToRef(refs[section]); },300); return; }
    const refs = { features:featuresRef, vendors:vendorsRef, pricing:pricingRef, about:aboutRef };
    scrollToRef(refs[section]);
  };

  const addToCart = (product: Product, color?: string, size?: string, qty=1) => {
    setCart(prev=>{
      const key=`${product.id}-${color}-${size}`;
      const existing = prev.find(i=>`${i.product.id}-${i.color}-${i.size}`===key);
      if (existing) return prev.map(i=>`${i.product.id}-${i.color}-${i.size}`===key?{...i,qty:i.qty+qty}:i);
      return [...prev,{product,qty,color,size}];
    });
  };
  const removeFromCart = (idx: number) => setCart(prev=>prev.filter((_,i)=>i!==idx));
  const updateCartQty  = (idx: number, qty: number) => { if(qty===0){removeFromCart(idx);return;} setCart(prev=>prev.map((item,i)=>i===idx?{...item,qty}:item)); };
  const toggleWishlist = (id: string) => setWishlist(prev=>prev.includes(id)?prev.filter(i=>i!==id):[...prev,id]);

  const cartCount    = cart.reduce((s,i)=>s+i.qty,0);
  const cartSubtotal = cart.reduce((s,i)=>s+i.product.price*i.qty,0);
  const cartDiscount = couponApplied ? cartSubtotal*0.1 : 0;
  const deliveryFee  = cartSubtotal>=150000 ? 0 : 15000;
  const cartTotal    = cartSubtotal-cartDiscount+deliveryFee;

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase()==="SAVE10") { setCouponApplied(true); setCouponError(""); }
    else { setCouponError("Invalid code. Try SAVE10"); setCouponApplied(false); }
  };
  const placeOrder = () => {
    const id="ORD-"+Date.now().toString().slice(-6);
    setConfirmedOrder(id); setCart([]); setCouponApplied(false); setCouponCode(""); navigate("confirmed");
  };

  // ── Auth ───────────────────────────────────────────────────────────────────
  const handleEmailContinue = () => {
    if (!authEmail.includes("@")) { setAuthError("Please enter a valid email address"); return; }
    setAuthError("");
    const existing = userRegistry.find(u=>u.email===authEmail);
    if (existing) setAuthMode("login"); else setAuthMode("register");
  };

  const handleAuth = () => {
    if (authMode==="register") {
      if (!authName.trim()) { setAuthError("Please enter your full name"); return; }
      if (authPass.length<6) { setAuthError("Password must be at least 6 characters"); return; }
      if (authPass!==authConfirm) { setAuthError("Passwords do not match"); return; }
    }
    if (authMode==="login" && !authPass) { setAuthError("Please enter your password"); return; }
    setAuthError(""); setAuthLoading(true);

    setTimeout(()=>{
      setAuthLoading(false);
      const existing = userRegistry.find(u=>u.email===authEmail);
      if (existing) {
        setCurrentUser(existing);
        if (existing.role==="admin")       navigate("admin-dash");
        else if (existing.role==="vendor") navigate("vendor-dash");
        else                               navigate("customer-home");
      } else {
        const name = authName.trim();
        const initials = name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
        const joined = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
        const newUser: AppUser = { id:"u"+Date.now(), name, email:authEmail, role:authRole, initials, status:"active", joined, orders:0 };
        setUserRegistry(prev=>[...prev,newUser]);
        setCurrentUser(newUser);
        if (authRole==="vendor") navigate("vendor-dash"); else navigate("customer-home");
      }
    },900);
  };

  const handleLogout = () => {
    setCurrentUser(null); setCart([]); setWishlist([]);
    setAuthEmail(""); setAuthName(""); setAuthPass(""); setAuthConfirm("");
    setAuthMode("email"); setAuthError("");
    navigate("landing");
  };

  // Add product (vendor)
  const handleAddProduct = () => {
    if (!newProduct.name.trim()) { setAddProductError("Product name is required"); return; }
    if (!newProduct.price || isNaN(Number(newProduct.price)) || Number(newProduct.price)<=0) { setAddProductError("Enter a valid price"); return; }
    if (!newProduct.brand.trim()) { setAddProductError("Brand is required"); return; }
    if (!newProduct.description.trim()) { setAddProductError("Description is required"); return; }
    const p: Product = {
      id: "p"+Date.now(),
      name: newProduct.name.trim(),
      price: Number(newProduct.price),
      image: newProduct.image.trim() || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&auto=format",
      category: newProduct.category,
      brand: newProduct.brand.trim(),
      rating: 0, reviews: 0,
      inStock: newProduct.inStock,
      description: newProduct.description.trim(),
      tags: [newProduct.category.toLowerCase()],
    };
    setProducts(prev=>[p,...prev]);
    setShowAddProduct(false);
    setNewProduct({name:"",price:"",category:"Electronics",description:"",brand:"",inStock:true,image:""});
    setAddProductError("");
    setDashTab("products");
  };

  // ── Filtered products ──────────────────────────────────────────────────────
  const filteredProducts = useMemo(()=>{
    let r = products;
    if (selectedCategory!=="All") r=r.filter(p=>p.category===selectedCategory);
    if (searchQuery) { const q=searchQuery.toLowerCase(); r=r.filter(p=>p.name.toLowerCase().includes(q)||p.brand.toLowerCase().includes(q)||p.category.toLowerCase().includes(q)); }
    r=r.filter(p=>p.price<=priceRange&&p.rating>=minRating);
    switch(sortBy) {
      case "price-asc":  return [...r].sort((a,b)=>a.price-b.price);
      case "price-desc": return [...r].sort((a,b)=>b.price-a.price);
      case "rating":     return [...r].sort((a,b)=>b.rating-a.rating);
      case "newest":     return [...r].reverse();
      default: return r;
    }
  },[products,selectedCategory,searchQuery,priceRange,sortBy,minRating]);

  // ══════════════════════════════════════════════════════════════════════════
  //  LANDING PAGE
  // ══════════════════════════════════════════════════════════════════════════
  const renderLanding = () => (
    <div style={{fontFamily:BODY}}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050508]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center h-16 gap-4">
          <button onClick={()=>navigate("landing")} className="flex items-center gap-2.5 mr-auto">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#16a34a,#22c55e)"}}><ShoppingBag className="w-4 h-4 text-white"/></div>
            <span className="font-bold text-white text-lg tracking-tight">Nexmart</span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {(["Features","Vendors","Pricing","About"] as const).map(l=>(
              <button key={l} onClick={()=>handleLandingNav(l.toLowerCase() as any)} className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]">{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>{setAuthMode("email");navigate("auth");}} className="hidden sm:flex px-4 py-2 text-sm text-white/70 hover:text-white transition-colors font-medium">Sign in</button>
            <button onClick={()=>{setAuthMode("email");navigate("auth");}} className="px-5 py-2 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90" style={{background:"linear-gradient(135deg,#16a34a,#22c55e)"}}>Get started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-16" style={{background:"#050508"}}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full opacity-20" style={{background:"radial-gradient(ellipse,#16a34a 0%,transparent 70%)"}}/>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050508] to-transparent"/>
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:"linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)",backgroundSize:"64px 64px"}}/>
        <div className="relative z-10 text-center max-w-5xl mx-auto px-5 sm:px-8 py-16">
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.12] rounded-full px-4 py-2 mb-10 text-sm text-white/70">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/> Nigeria's #1 multi-vendor marketplace · 40+ product categories
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-[1.05]" style={{fontFamily:DISPLAY}}>
            Commerce built for<br/>
            <em className="not-italic" style={{background:"linear-gradient(90deg,#4ade80,#16a34a)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>the modern web.</em>
          </h1>
          <p className="text-lg sm:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">Nexmart powers thousands of Nigerian stores. Buy, sell, and manage everything — built for customers, vendors, and teams at any scale.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <button onClick={()=>{setAuthMode("email");navigate("auth");}} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 font-bold text-white rounded-2xl text-base transition-all hover:opacity-90" style={{background:"linear-gradient(135deg,#16a34a,#22c55e)"}}>Create free account <ArrowRight className="w-4 h-4"/></button>
            <button onClick={()=>handleLandingNav("features")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 border border-white/15 text-white/80 hover:text-white hover:border-white/30 font-semibold rounded-2xl text-base transition-all"><Play className="w-4 h-4"/> See features</button>
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&auto=format","https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&auto=format","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&auto=format"].map((src,i)=>(
              <div key={i} className={`aspect-square rounded-2xl overflow-hidden bg-white/[0.05] border border-white/[0.08] ${i===1?"-mt-4":""}`}><img src={src} alt="" className="w-full h-full object-cover opacity-90"/></div>
            ))}
          </div>
        </div>
        <div className="relative z-10 w-full border-t border-white/[0.06] bg-white/[0.02]">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{value:"50K+",label:"Products listed"},{value:"2.4K",label:"Active vendors"},{value:"180K",label:"Happy customers"},{value:"1.2M",label:"Orders shipped"}].map(({value,label})=>(
              <div key={label} className="text-center"><p className="text-2xl font-bold text-white" style={{fontFamily:MONO}}>{value}</p><p className="text-xs text-white/40 mt-0.5">{label}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} className="py-24 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{fontFamily:DISPLAY}}>Everything in one place.</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">From discovery to delivery — Nexmart handles the entire commerce lifecycle.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon:Store,       title:"Multi-Vendor Marketplace", desc:"Onboard unlimited vendors, manage storefronts, auto-collect commissions. Each vendor gets their own analytics dashboard." },
              { icon:ShoppingCart,title:"Smart Shopping Cart",       desc:"Real-time inventory sync, coupon engine, saved wishlists, and a frictionless checkout that converts." },
              { icon:CreditCard,  title:"Multi-Gateway Payments",    desc:"Paystack, Flutterwave, bank transfer, and Cash on Delivery. PCI-compliant, instant settlement to vendors." },
              { icon:BarChart2,   title:"Advanced Analytics",        desc:"Real-time dashboards for revenue, inventory, ROAS, customer LTV, and full conversion funnel visibility." },
              { icon:Sparkles,    title:"AI Recommendations",        desc:"Personalised discovery powered by browsing history, purchase patterns, and collaborative filtering." },
              { icon:Shield,      title:"Enterprise Security",       desc:"Role-based access control, JWT auth, HTTPS everywhere, XSS/CSRF protection, rate limiting, and audit logs." },
              { icon:Truck,       title:"Logistics Integration",     desc:"Real-time tracking, dispatch management, and integration with GIG, DHL, and local couriers." },
              { icon:Smartphone,  title:"Mobile-First Design",       desc:"Blazing-fast on any device. Progressive Web App with offline browsing and push notifications." },
              { icon:Globe,       title:"Multi-Currency & Language", desc:"Sell in Naira, Cedis, Dollars, or Euros. Auto-conversion rates updated every hour." },
            ].map(({icon:Icon,title,desc})=>(
              <div key={title} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group">
                <div className="w-11 h-11 bg-gray-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Icon className="w-5 h-5 text-white"/></div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 grid sm:grid-cols-3 gap-6 bg-gray-950 rounded-3xl p-8">
            {[{number:"99.9%",label:"Uptime SLA",sub:"On all paid plans"},{number:"<200ms",label:"Page load time",sub:"Global CDN delivery"},{number:"256-bit",label:"SSL Encryption",sub:"On all transactions"}].map(({number,label,sub})=>(
              <div key={label} className="text-center"><p className="text-4xl font-bold text-white mb-1" style={{fontFamily:MONO}}>{number}</p><p className="font-semibold text-white/70">{label}</p><p className="text-sm text-white/30">{sub}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Vendors */}
      <section ref={vendorsRef} className="py-24 bg-gray-950 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-green-400 uppercase tracking-widest mb-3">For Vendors</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" style={{fontFamily:DISPLAY}}>Your store, your rules.</h2>
            <p className="text-lg text-white/40 max-w-2xl mx-auto">Join 2,400+ Nigerian vendors already selling on Nexmart. Set up in minutes, start earning the same day.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <div className="space-y-5">
              {[
                {step:"01",title:"Create your vendor account",desc:"Register with your email, verify your BVN or CAC, and get approved within 24 hours."},
                {step:"02",title:"List your products",desc:"Upload products with images, set Naira prices, add variants. Bulk CSV import supported."},
                {step:"03",title:"Receive orders & get paid",desc:"Fulfill orders your way. Payments settle directly to your bank within 24-48 hours."},
                {step:"04",title:"Grow with data",desc:"Track revenue, top products, customer behavior, and ad performance in your dashboard."},
              ].map(({step,title,desc})=>(
                <div key={step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white text-sm font-bold shrink-0" style={{fontFamily:MONO}}>{step}</div>
                  <div><p className="font-bold text-white mb-1">{title}</p><p className="text-sm text-white/50 leading-relaxed">{desc}</p></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{icon:TrendingUp,value:"₦2.4B+",label:"Paid to vendors",color:"#16a34a"},{icon:Package,value:"1.2M+",label:"Orders fulfilled",color:"#3b82f6"},{icon:Users,value:"2,418",label:"Active vendors",color:"#a78bfa"},{icon:Star,value:"4.8/5",label:"Vendor satisfaction",color:"#f59e0b"}].map(({icon:Icon,value,label,color})=>(
                <div key={label} className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-5"><Icon className="w-6 h-6 mb-3" style={{color}}/><p className="text-2xl font-bold text-white" style={{fontFamily:MONO}}>{value}</p><p className="text-xs text-white/40 mt-1">{label}</p></div>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {icon:UserCheck,title:"Customers",color:"#3b82f6",badge:"Shop",features:["Browse 50K+ products","One-tap reorder","Real-time order tracking","AI-powered suggestions","Wishlist & reviews"],cta:"Start shopping",featured:false},
              {icon:Building2,title:"Vendors",color:"#16a34a",badge:"Sell",features:["Multi-product storefront","Inventory management","Revenue analytics","Order processing","24-48hr bank settlement"],cta:"Open your store",featured:true},
              {icon:Users,title:"Admins",color:"#a78bfa",badge:"Manage",features:["Full platform control","User & vendor management","Coupon & promo engine","Platform analytics","Security & audit logs"],cta:"Access admin",featured:false},
            ].map(({icon:Icon,title,color,badge,features,cta,featured})=>(
              <div key={title} className={`relative rounded-2xl p-6 border ${featured?"border-white/20 bg-white/[0.06]":"border-white/[0.08] bg-white/[0.03]"}`}>
                {featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full" style={{background:"#16a34a"}}>Most Popular</span>}
                <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor:color+"22"}}><Icon className="w-5 h-5" style={{color}}/></div><div><span className="text-xs font-bold uppercase tracking-widest" style={{color}}>{badge}</span><h3 className="font-bold text-white text-lg leading-none">{title}</h3></div></div>
                <ul className="space-y-2.5 mb-6">{features.map(f=><li key={f} className="flex items-center gap-2.5 text-sm text-white/60"><Check className="w-4 h-4 shrink-0" style={{color}}/>{f}</li>)}</ul>
                <button onClick={()=>{setAuthMode("email");navigate("auth");}} className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2" style={featured?{backgroundColor:color,color:"#fff"}:{backgroundColor:"rgba(255,255,255,0.08)",color:"#fff"}}>{cta} <ArrowRight className="w-3.5 h-3.5"/></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingRef} className="py-24 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4" style={{fontFamily:DISPLAY}}>Simple, transparent pricing.</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">No hidden fees. Customers shop free. Vendors pay only a small commission when they sell.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {name:"Starter",price:"Free",sub:"For new vendors getting started",color:"#6b7280",featured:false,features:["Up to 20 product listings","Basic analytics dashboard","Paystack & bank transfer","Email support","5% platform commission"],cta:"Start free"},
              {name:"Growth",price:"₦25,000",sub:"per month — for scaling vendors",color:"#16a34a",featured:true,features:["Unlimited product listings","Advanced analytics & reports","All payment gateways","Priority 24/7 support","3% platform commission","Featured store badge","Bulk CSV import/export"],cta:"Start 14-day trial"},
              {name:"Enterprise",price:"Custom",sub:"For large businesses & brands",color:"#a78bfa",featured:false,features:["Everything in Growth","Dedicated account manager","Custom integrations & API","White-label option","1.5% commission","SLA 99.9% uptime","Custom onboarding"],cta:"Contact sales"},
            ].map(({name,price,sub,color,featured,features,cta})=>(
              <div key={name} className={`relative rounded-2xl p-7 border-2 transition-all ${featured?"border-green-500 shadow-xl shadow-green-100":"border-gray-200"}`}>
                {featured && <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-4 py-1.5 rounded-full" style={{background:"#16a34a"}}>Most Popular</span>}
                <p className="text-sm font-bold uppercase tracking-widest mb-2" style={{color}}>{name}</p>
                <div className="flex items-baseline gap-1 mb-1"><span className="text-4xl font-bold text-gray-900" style={{fontFamily:MONO}}>{price}</span></div>
                <p className="text-sm text-gray-400 mb-6">{sub}</p>
                <ul className="space-y-3 mb-8">{features.map(f=><li key={f} className="flex items-start gap-2.5 text-sm text-gray-600"><CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{color}}/>{f}</li>)}</ul>
                <button onClick={()=>{setAuthMode("email");navigate("auth");}} className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90" style={featured?{backgroundColor:"#16a34a",color:"#fff"}:{backgroundColor:"#f3f4f6",color:"#111827"}}>{cta}</button>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
            <p className="font-bold text-gray-900 mb-2">Customers always shop for free.</p>
            <p className="text-gray-500 text-sm">No subscription, no fees. Create an account and start shopping thousands of products across Nigeria.</p>
            <button onClick={()=>{setAuthMode("email");navigate("auth");}} className="mt-5 inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl text-sm hover:opacity-90" style={{backgroundColor:"#16a34a"}}>Create customer account — free <ArrowRight className="w-4 h-4"/></button>
          </div>
        </div>
      </section>

      {/* About */}
      <section ref={aboutRef} className="py-24 bg-gray-950 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <p className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4">About Nexmart</p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight" style={{fontFamily:DISPLAY}}>Built in Nigeria,<br/>for the world.</h2>
              <p className="text-white/50 leading-relaxed mb-5">Nexmart was founded in 2020 with a single mission: make it as easy to buy and sell online in Nigeria as anywhere else. We saw local businesses struggling with payments, logistics, and visibility — and built the infrastructure to fix it.</p>
              <p className="text-white/50 leading-relaxed mb-8">Today, Nexmart powers 2,400+ vendors across Lagos, Abuja, Port Harcourt, Kano, and 32 other Nigerian cities. We process billions of naira monthly and have helped thousands of entrepreneurs grow their business online.</p>
              <div className="flex flex-wrap gap-4">
                {[{v:"2020",l:"Founded"},{v:"Lagos",l:"HQ"},{v:"150+",l:"Team"},{v:"36",l:"States"}].map(({v,l})=>(
                  <div key={l} className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-5 py-4 text-center"><p className="text-2xl font-bold text-white" style={{fontFamily:MONO}}>{v}</p><p className="text-xs text-white/40">{l}</p></div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&auto=format","https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop&auto=format","https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&auto=format","https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop&auto=format"].map((src,i)=>(
                <div key={i} className={`rounded-2xl overflow-hidden ${i===1?"mt-6":i===3?"-mt-6":""}`}><img src={src} alt="Nexmart team" className="w-full h-40 object-cover"/></div>
              ))}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white text-center mb-10" style={{fontFamily:DISPLAY}}>Leadership Team</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              {name:"Adaeze Obi",role:"CEO & Co-Founder",img:"https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&auto=format"},
              {name:"Chukwuemeka Nwosu",role:"CTO & Co-Founder",img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format"},
              {name:"Fatima Al-Hassan",role:"Head of Vendors",img:"https://images.unsplash.com/photo-1546961342-ea5f60b193e4?w=200&h=200&fit=crop&auto=format"},
              {name:"Oluwaseun Adeleke",role:"Head of Operations",img:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format"},
            ].map(({name,role,img})=>(
              <div key={name} className="text-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-3 border-2 border-white/[0.1]"><img src={img} alt={name} className="w-full h-full object-cover"/></div>
                <p className="font-bold text-white text-sm">{name}</p>
                <p className="text-xs text-white/40 mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14"><h2 className="text-4xl font-bold text-gray-900" style={{fontFamily:DISPLAY}}>Loved by thousands.</h2></div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {name:"Amaka O.",role:"Frequent Shopper, Lagos",text:"The checkout experience is the smoothest I have ever used. Orders arrive faster than expected and tracking is always clear.",rating:5,avatar:"AO"},
              {name:"Emeka J.",role:"Vendor — Electronics",text:"I launched my store in a weekend. Sales analytics help me understand what works. Revenue is up 40% since switching.",rating:5,avatar:"EJ"},
              {name:"Fatima S.",role:"Fashion Vendor, Abuja",text:"Inventory management used to take hours. Now it takes minutes. The low-stock alerts alone have saved me thousands.",rating:5,avatar:"FS"},
            ].map(({name,role,text,rating,avatar})=>(
              <div key={name} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="flex items-center gap-1 mb-4">{Array.from({length:rating}).map((_,i)=><Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400"/>)}</div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center">{avatar}</div><div><p className="text-sm font-bold text-gray-900">{name}</p><p className="text-xs text-gray-400">{role}</p></div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden" style={{background:"#050508"}}>
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-15" style={{background:"radial-gradient(ellipse,#16a34a 0%,transparent 70%)"}}/></div>
        <div className="relative z-10 text-center max-w-3xl mx-auto px-5 sm:px-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl text-white mb-5" style={{fontFamily:DISPLAY}}>Ready to start<br/><em>selling or shopping?</em></h2>
          <p className="text-lg text-white/40 mb-10">Join 180,000+ customers and 2,400+ vendors already on Nexmart.</p>
          <button onClick={()=>{setAuthMode("email");navigate("auth");}} className="inline-flex items-center gap-2 px-10 py-4 font-bold text-white text-lg rounded-2xl transition-all hover:opacity-90" style={{background:"linear-gradient(135deg,#16a34a,#22c55e)"}}>Create your free account <ArrowRight className="w-5 h-5"/></button>
          <p className="text-sm text-white/25 mt-5">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#050508]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <div className="grid sm:grid-cols-5 gap-8 mb-10">
            <div className="sm:col-span-2"><div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"linear-gradient(135deg,#16a34a,#22c55e)"}}><ShoppingBag className="w-3.5 h-3.5 text-white"/></div><span className="font-bold text-white">Nexmart</span></div><p className="text-sm text-white/30 leading-relaxed max-w-xs">Commerce infrastructure for the modern Nigerian internet. Built in Lagos, serving all 36 states.</p></div>
            {[
              {title:"Product",links:["Features","Pricing","API Docs","Changelog"]},
              {title:"Vendors",links:["How it works","Commission rates","Vendor portal","Apply now"]},
              {title:"Company",links:["About","Blog","Careers","Press"]},
              {title:"Legal",links:["Privacy","Terms","Cookie Policy","NDPR"]},
            ].map(col=>(
              <div key={col.title}>
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{col.title}</h4>
                <ul className="space-y-2.5">{col.links.map(l=><li key={l}><button onClick={()=>{if(l==="Features")handleLandingNav("features");else if(l==="Pricing")handleLandingNav("pricing");else if(col.title==="Vendors")handleLandingNav("vendors");else if(l==="About")handleLandingNav("about");}} className="text-sm text-white/40 hover:text-white/80 transition-colors">{l}</button></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/25">
            <p>© 2024 Nexmart Technologies Ltd. RC: 1234567. All rights reserved.</p>
            <p>Built in Nigeria 🇳🇬 · Designed for everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  AUTH PAGE
  // ══════════════════════════════════════════════════════════════════════════
  const renderAuth = () => (
    <div className="min-h-screen flex" style={{fontFamily:BODY}}>
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12" style={{background:"#050508"}}>
        <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full opacity-20" style={{background:"radial-gradient(ellipse,#16a34a 0%,transparent 70%)"}}/></div>
        <div className="relative"><button onClick={()=>navigate("landing")} className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#16a34a,#22c55e)"}}><ShoppingBag className="w-4 h-4 text-white"/></div><span className="font-bold text-white text-lg">Nexmart</span></button></div>
        <div className="relative"><p className="text-4xl text-white font-bold mb-4 leading-snug" style={{fontFamily:DISPLAY}}>"Nexmart doubled our<br/>revenue in 6 months."</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">EJ</div><div><p className="text-white text-sm font-semibold">Emeka Johnson</p><p className="text-white/40 text-xs">Electronics Vendor, Lagos</p></div></div></div>
        <div className="relative grid grid-cols-2 gap-3">{[{v:"180K+",l:"Customers"},{v:"2.4K",l:"Vendors"},{v:"₦2.4B",l:"Revenue processed"},{v:"4.9★",l:"Avg. rating"}].map(({v,l})=><div key={l} className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-4"><p className="text-xl font-bold text-white" style={{fontFamily:MONO}}>{v}</p><p className="text-xs text-white/40 mt-0.5">{l}</p></div>)}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        <button onClick={()=>navigate("landing")} className="lg:hidden flex items-center gap-2 mb-10"><div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#16a34a,#22c55e)"}}><ShoppingBag className="w-4 h-4 text-white"/></div><span className="font-bold text-gray-900 text-lg">Nexmart</span></button>
        <div className="w-full max-w-sm">
          {authMode==="email" && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{fontFamily:DISPLAY}}>Welcome.</h1>
              <p className="text-gray-400 mb-8 text-sm">Enter your email to sign in or create an account.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email address</label>
                  <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input type="email" placeholder="you@example.com" value={authEmail} onChange={e=>{setAuthEmail(e.target.value);setAuthError("");}} onKeyDown={e=>e.key==="Enter"&&handleEmailContinue()} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-all"/>
                  </div>
                  {authError && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{authError}</p>}
                </div>
                <button onClick={handleEmailContinue} className="w-full py-3 font-bold text-white rounded-xl transition-all hover:opacity-90" style={{background:"linear-gradient(135deg,#16a34a,#22c55e)"}}>Continue with email</button>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100"><p className="text-xs text-center text-gray-400">Demo: <span className="font-mono text-gray-600">admin@nexmart.com</span> · <span className="font-mono text-gray-600">vendor@nexmart.com</span></p></div>
            </div>
          )}

          {authMode==="login" && (
            <div>
              <button onClick={()=>{setAuthMode("email");setAuthError("");}} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"><ArrowLeft className="w-4 h-4"/> Back</button>
              <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{fontFamily:DISPLAY}}>Welcome back.</h1>
              <p className="text-gray-400 mb-8 text-sm">Signing in as <span className="text-gray-700 font-medium">{authEmail}</span></p>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5"><label className="text-sm font-semibold text-gray-700">Password</label><button className="text-xs text-green-600 font-medium">Forgot?</button></div>
                  <input type="password" placeholder="Enter your password" value={authPass} onChange={e=>{setAuthPass(e.target.value);setAuthError("");}} onKeyDown={e=>e.key==="Enter"&&handleAuth()} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-all"/>
                  {authError && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{authError}</p>}
                </div>
                <button onClick={handleAuth} disabled={authLoading} className="w-full py-3 font-bold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2" style={{background:"linear-gradient(135deg,#16a34a,#22c55e)"}}>
                  {authLoading?<RefreshCw className="w-4 h-4 animate-spin"/>:null}{authLoading?"Signing in…":"Sign in"}
                </button>
              </div>
              <p className="text-xs text-center text-gray-400 mt-6">Any password works in this demo.</p>
            </div>
          )}

          {authMode==="register" && (
            <div>
              <button onClick={()=>{setAuthMode("email");setAuthError("");}} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"><ArrowLeft className="w-4 h-4"/> Back</button>
              <h1 className="text-3xl font-bold text-gray-900 mb-1" style={{fontFamily:DISPLAY}}>Create account.</h1>
              <p className="text-gray-400 mb-7 text-sm">Registering as <span className="text-gray-700 font-medium">{authEmail}</span></p>
              <div className="space-y-4">
                <div><label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full name</label><input type="text" placeholder="Your full name" value={authName} onChange={e=>{setAuthName(e.target.value);setAuthError("");}} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-all"/></div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">I want to</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {([["customer","Shop",UserCheck,"#3b82f6"],["vendor","Sell",Building2,"#16a34a"]] as const).map(([r,label,Icon,color])=>(
                      <button key={r} onClick={()=>setAuthRole(r as "customer"|"vendor")} className="flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all text-sm font-semibold"
                        style={authRole===r?{borderColor:color,backgroundColor:color+"10",color}:{borderColor:"#E5E7EB",color:"#6B7280"}}>
                        <Icon className="w-5 h-5"/>{label}
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label><input type="password" placeholder="At least 6 characters" value={authPass} onChange={e=>{setAuthPass(e.target.value);setAuthError("");}} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-all"/></div>
                <div><label className="text-sm font-semibold text-gray-700 mb-1.5 block">Confirm password</label><input type="password" placeholder="Repeat your password" value={authConfirm} onChange={e=>{setAuthConfirm(e.target.value);setAuthError("");}} onKeyDown={e=>e.key==="Enter"&&handleAuth()} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 focus:bg-white transition-all"/></div>
                {authError && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0"/>{authError}</p>}
                <button onClick={handleAuth} disabled={authLoading} className="w-full py-3 font-bold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2" style={{background:"linear-gradient(135deg,#16a34a,#22c55e)"}}>
                  {authLoading?<RefreshCw className="w-4 h-4 animate-spin"/>:null}{authLoading?"Creating account…":"Create account"}
                </button>
              </div>
              <p className="text-xs text-center text-gray-400 mt-5 leading-relaxed">By continuing you agree to our <button className="text-green-600 underline">Terms</button> and <button className="text-green-600 underline">Privacy Policy</button>.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  PORTAL NAV
  // ══════════════════════════════════════════════════════════════════════════
  const renderPortalNav = () => {
    if (!currentUser) return null;
    const isCustomer = currentUser.role==="customer";
    const isVendor   = currentUser.role==="vendor";
    return (
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border" style={{fontFamily:BODY}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-15 gap-3 py-3">
          <button onClick={()=>isCustomer?navigate("customer-home"):isVendor?navigate("vendor-dash"):navigate("admin-dash")} className="flex items-center gap-2 shrink-0 mr-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#16a34a,#22c55e)"}}><ShoppingBag className="w-4 h-4 text-white"/></div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">Nexmart</span>
          </button>
          {isCustomer && (<>
            <div className="flex-1 max-w-sm hidden md:block"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><input type="text" placeholder="Search products..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&navigate("products")} className="w-full pl-9 pr-4 py-2 bg-muted text-sm rounded-xl border border-transparent focus:outline-none focus:border-accent/50 transition-colors"/></div></div>
            <div className="hidden lg:flex items-center gap-0.5 ml-2"><button onClick={()=>navigate("customer-home")} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors font-medium">Home</button><button onClick={()=>navigate("products")} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-colors font-medium">Products</button></div>
          </>)}
          {isVendor && <div className="hidden lg:flex items-center gap-0.5 ml-2">{[["overview","Overview"],["products","Products"],["orders","Orders"],["inventory","Inventory"]].map(([tab,label])=><button key={tab} onClick={()=>{navigate("vendor-dash");setDashTab(tab);}} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted font-medium transition-colors">{label}</button>)}</div>}
          {currentUser.role==="admin" && <div className="hidden lg:flex items-center gap-0.5 ml-2 overflow-x-auto">{[["overview","Overview"],["users","Users"],["products","Products"],["orders","Orders"],["analytics","Analytics"]].map(([tab,label])=><button key={tab} onClick={()=>{navigate("admin-dash");setDashTab(tab);}} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted font-medium transition-colors whitespace-nowrap">{label}</button>)}</div>}
          <div className="ml-auto flex items-center gap-1.5">
            {isCustomer && (<>
              <button onClick={()=>setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-muted transition-colors hidden sm:flex">{darkMode?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}</button>
              <button onClick={()=>navigate("cart")} className="relative p-2 rounded-xl hover:bg-muted transition-colors"><ShoppingCart className="w-5 h-5"/>{cartCount>0&&<span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-white text-[10px] font-bold rounded-full flex items-center justify-center" style={{backgroundColor:"#16a34a"}}>{cartCount}</span>}</button>
              <button onClick={()=>navigate("customer-dash")} className="p-2 rounded-xl hover:bg-muted transition-colors"><User className="w-5 h-5"/></button>
            </>)}
            <div className="relative"><button onClick={()=>setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl hover:bg-muted transition-colors"><Bell className="w-4 h-4"/><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/></button>
              {notifOpen && <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"><div className="flex items-center justify-between px-4 py-3 border-b border-border"><p className="font-bold text-sm">Notifications</p><button onClick={()=>setNotifOpen(false)}><XCircle className="w-4 h-4 text-muted-foreground"/></button></div>{[{text:"New order received — ORD-2024-8901",time:"2m ago",unread:true},{text:"Product review posted",time:"1h ago",unread:true},{text:"Monthly report ready",time:"3h ago",unread:false}].map((n,i)=><div key={i} className={`px-4 py-3 hover:bg-muted/50 cursor-pointer ${n.unread?"bg-muted/30":""}`}><p className="text-sm">{n.text}</p><p className="text-xs text-muted-foreground mt-0.5">{n.time}</p></div>)}</div>}
            </div>
            <div className="relative group"><button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"><div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">{currentUser.initials}</div><ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block"/></button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1.5 overflow-hidden"><div className="px-4 py-2.5 border-b border-border"><p className="text-sm font-semibold truncate">{currentUser.name}</p><p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p></div>{isCustomer&&<button onClick={()=>navigate("customer-dash")} className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"><User className="w-3.5 h-3.5 text-muted-foreground"/> My Account</button>}<button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted text-red-500 transition-colors flex items-center gap-2"><LogOut className="w-3.5 h-3.5"/> Sign out</button></div>
            </div>
          </div>
        </div>
      </nav>
    );
  };

  // ── Customer Home ──────────────────────────────────────────────────────────
  const renderCustomerHome = () => (
    <div style={{fontFamily:BODY}}>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-10 pointer-events-none"><div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-white blur-3xl"/><div className="absolute bottom-0 right-1/4 w-52 h-52 rounded-full bg-white blur-3xl"/></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6"><Zap className="w-3.5 h-3.5"/> Free shipping over ₦150,000 · Use <span className="font-mono font-bold ml-1">SAVE10</span></div>
            <h1 className="text-5xl sm:text-6xl font-bold leading-[1.05] mb-5" style={{fontFamily:DISPLAY}}>Shop smarter,<br/><em>live better.</em></h1>
            <p className="text-lg opacity-60 mb-8 leading-relaxed">Thousands of products from verified Nigerian vendors. Quality guaranteed, fast delivery.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={()=>navigate("products")} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-primary rounded-xl font-bold hover:bg-white/90 transition-all">Shop Now <ArrowRight className="w-4 h-4"/></button>
              <button onClick={()=>navigate("customer-dash")} className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/25 rounded-xl font-medium hover:bg-white/10 transition-all">My Orders</button>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Browse Categories</h2><button onClick={()=>navigate("products")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">All <ChevronRight className="w-4 h-4"/></button></div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {[{name:"Electronics",emoji:"⚡",cat:"Electronics"},{name:"Fashion",emoji:"👗",cat:"Fashion"},{name:"Home",emoji:"🏠",cat:"Home & Living"},{name:"Sports",emoji:"🏃",cat:"Sports"},{name:"Gaming",emoji:"🎮",cat:"Gaming"},{name:"Books",emoji:"📚",cat:"Books"},{name:"Groceries",emoji:"🛒",cat:"Groceries"},{name:"All",emoji:"🛍️",cat:"All"}].map(({name,emoji,cat})=>(
            <button key={name} onClick={()=>{setSelectedCategory(cat);navigate("products");}} className="bg-card border border-border rounded-2xl p-4 text-center hover:shadow-md transition-all group"><span className="text-2xl block mb-1.5 group-hover:scale-110 transition-transform">{emoji}</span><span className="text-xs font-semibold">{name}</span></button>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Featured Products</h2><button onClick={()=>navigate("products")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">View all <ChevronRight className="w-4 h-4"/></button></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{products.slice(0,4).map(p=><ProductCard key={p.id} product={p} onNavigate={()=>navigate("detail",p)} onAddToCart={()=>addToCart(p)} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={()=>toggleWishlist(p.id)}/>)}</div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="relative overflow-hidden rounded-3xl" style={{background:"linear-gradient(135deg,#052e16,#16a34a)"}}>
          <div className="relative flex flex-col md:flex-row items-center justify-between px-8 py-10 gap-6">
            <div className="text-white text-center md:text-left"><div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 text-sm mb-4"><Tag className="w-3.5 h-3.5"/> Limited Offer</div><h3 className="text-3xl font-bold mb-2" style={{fontFamily:DISPLAY}}>10% Off Your First Order</h3><p className="opacity-80">Use code <span className="font-bold bg-white/20 px-2 py-0.5 rounded" style={{fontFamily:MONO}}>SAVE10</span> at checkout</p></div>
            <button onClick={()=>navigate("products")} className="shrink-0 bg-white text-green-700 font-bold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all">Shop Now</button>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">New Arrivals</h2><button onClick={()=>navigate("products")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">View all <ChevronRight className="w-4 h-4"/></button></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{products.slice(-4).map(p=><ProductCard key={p.id} product={p} onNavigate={()=>navigate("detail",p)} onAddToCart={()=>addToCart(p)} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={()=>toggleWishlist(p.id)}/>)}</div>
      </section>
      <section className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10"><div className="grid sm:grid-cols-4 gap-6">{[{icon:Truck,title:"Free Shipping",desc:"On orders over ₦150,000"},{icon:Shield,title:"Secure Payment",desc:"Paystack & Flutterwave"},{icon:RefreshCw,title:"Easy Returns",desc:"30-day hassle-free"},{icon:Award,title:"Quality Assured",desc:"100% authentic products"}].map(({icon:Icon,title,desc})=><div key={title} className="flex items-center gap-3"><div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-muted-foreground"/></div><div><h4 className="font-semibold text-sm">{title}</h4><p className="text-xs text-muted-foreground">{desc}</p></div></div>)}</div></div>
      </section>
    </div>
  );

  // ── Products Page ──────────────────────────────────────────────────────────
  const renderProducts = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{fontFamily:BODY}}>
      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 space-y-7">
            <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Category</p>{CATEGORIES.map(cat=><button key={cat} onClick={()=>setSelectedCategory(cat)} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors mb-0.5" style={selectedCategory===cat?{backgroundColor:"#09090D",color:"#F9F9FB"}:{color:"#6B7280"}}>{cat}</button>)}</div>
            <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Max Price</p><input type="range" min={0} max={3000000} value={priceRange} onChange={e=>setPriceRange(Number(e.target.value))} className="w-full" style={{accentColor:"#16a34a"}}/><div className="flex justify-between text-xs text-muted-foreground mt-1"><span>₦0</span><span style={{fontFamily:MONO}}>₦{(priceRange/1000).toFixed(0)}K</span></div></div>
            <div><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Min Rating</p>{[0,4,4.5,4.8].map(r=><button key={r} onClick={()=>setMinRating(r)} className="w-full text-left px-3 py-2 rounded-xl text-sm flex items-center gap-2 mb-0.5 transition-colors" style={minRating===r?{backgroundColor:"#09090D",color:"#F9F9FB"}:{color:"#6B7280"}}>{r===0?"All ratings":<><StarRating rating={r}/><span>& up</span></>}</button>)}</div>
            <button onClick={()=>{setSelectedCategory("All");setPriceRange(3000000);setMinRating(0);setSortBy("featured");setSearchQuery("");}} className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"><RefreshCw className="w-3.5 h-3.5"/> Reset filters</button>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div><h1 className="text-xl font-bold">{selectedCategory==="All"?"All Products":selectedCategory}</h1><p className="text-sm text-muted-foreground">{filteredProducts.length} results</p></div>
            <div className="flex items-center gap-2">
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="text-sm bg-muted rounded-xl px-3 py-2 border-0 focus:outline-none"><option value="featured">Featured</option><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="rating">Top Rated</option></select>
              <div className="flex border border-border rounded-xl overflow-hidden"><button onClick={()=>setViewMode("grid")} className="p-2 transition-colors" style={viewMode==="grid"?{backgroundColor:"#09090D",color:"#F9F9FB"}:{}}><LayoutGrid className="w-4 h-4"/></button><button onClick={()=>setViewMode("list")} className="p-2 transition-colors" style={viewMode==="list"?{backgroundColor:"#09090D",color:"#F9F9FB"}:{}}><List className="w-4 h-4"/></button></div>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden mb-4">{CATEGORIES.map(cat=><button key={cat} onClick={()=>setSelectedCategory(cat)} className="whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors" style={selectedCategory===cat?{backgroundColor:"#09090D",color:"#F9F9FB"}:{backgroundColor:"#F3F4F6",color:"#6B7280"}}>{cat}</button>)}</div>
          {filteredProducts.length===0?(
            <div className="flex flex-col items-center py-24 text-center"><Search className="w-12 h-12 text-muted-foreground/30 mb-4"/><h3 className="font-semibold mb-2">No products found</h3><p className="text-sm text-muted-foreground">Try adjusting filters</p></div>
          ):viewMode==="grid"?(
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{filteredProducts.map(p=><ProductCard key={p.id} product={p} onNavigate={()=>navigate("detail",p)} onAddToCart={()=>addToCart(p)} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={()=>toggleWishlist(p.id)}/>)}</div>
          ):(
            <div className="space-y-3">{filteredProducts.map(p=>(
              <div key={p.id} className="flex gap-4 bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all">
                <div className="w-24 h-24 bg-muted rounded-xl overflow-hidden shrink-0 cursor-pointer" onClick={()=>navigate("detail",p)}><img src={p.image} alt={p.name} className="w-full h-full object-cover"/></div>
                <div className="flex-1 min-w-0"><p className="text-xs text-muted-foreground">{p.brand} · {p.category}</p><h3 className="font-semibold text-sm mt-1 cursor-pointer hover:text-green-600 line-clamp-2" onClick={()=>navigate("detail",p)}>{p.name}</h3><div className="flex items-center gap-2 mt-2"><StarRating rating={p.rating}/><span className="text-xs text-muted-foreground">({p.reviews.toLocaleString()})</span></div></div>
                <div className="flex flex-col items-end justify-between shrink-0"><span className="font-bold text-sm" style={{fontFamily:MONO}}>{fmt(p.price)}</span><button onClick={()=>{if(p.inStock)addToCart(p);}} disabled={!p.inStock} className="text-xs px-4 py-2 rounded-xl font-bold text-white transition-all disabled:opacity-40" style={{backgroundColor:p.inStock?"#16a34a":"#9ca3af"}}>{p.inStock?"Add to Cart":"Out of Stock"}</button></div>
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Product Detail ─────────────────────────────────────────────────────────
  const renderDetail = () => {
    if (!selectedProduct) return null;
    const p = selectedProduct;
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{fontFamily:BODY}}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <button onClick={()=>navigate("customer-home")} className="hover:text-foreground">Home</button><ChevronRight className="w-3.5 h-3.5"/>
          <button onClick={()=>navigate("products")} className="hover:text-foreground">{p.category}</button><ChevronRight className="w-3.5 h-3.5"/>
          <span className="text-foreground truncate">{p.name}</span>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-square bg-muted rounded-3xl overflow-hidden mb-4"><img src={p.image} alt={p.name} className="w-full h-full object-cover"/></div>
            <div className="flex gap-3">{[0,1,2].map(i=><div key={i} className="w-20 h-20 rounded-xl overflow-hidden bg-muted cursor-pointer border-2" style={{borderColor:i===0?"#16a34a":"transparent"}}><img src={p.image} alt="" className="w-full h-full object-cover"/></div>)}</div>
          </div>
          <div>
            <div className="flex items-start justify-between mb-2">
              <div><p className="text-sm text-muted-foreground font-medium">{p.brand}</p><h1 className="text-2xl sm:text-3xl font-bold mt-1 leading-tight">{p.name}</h1></div>
              <button onClick={()=>toggleWishlist(p.id)} className="p-2.5 rounded-xl border transition-all ml-4 shrink-0" style={wishlist.includes(p.id)?{borderColor:"#fca5a5",backgroundColor:"#fef2f2",color:"#ef4444"}:{borderColor:"var(--border)"}}><Heart className={`w-5 h-5 ${wishlist.includes(p.id)?"fill-current":""}`}/></button>
            </div>
            <div className="flex items-center gap-3 mb-4"><StarRating rating={p.rating} size="md"/><span className="text-sm text-muted-foreground">{p.rating} ({p.reviews.toLocaleString()} reviews)</span></div>
            <div className="flex items-baseline gap-3 mb-4"><span className="text-3xl font-bold" style={{fontFamily:MONO}}>{fmt(p.price)}</span>{p.originalPrice&&<><span className="text-lg text-muted-foreground line-through" style={{fontFamily:MONO}}>{fmt(p.originalPrice)}</span><span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Save {fmt(p.originalPrice-p.price)}</span></>}</div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full mb-6" style={p.inStock?{backgroundColor:"#dcfce7",color:"#16a34a"}:{backgroundColor:"#fee2e2",color:"#dc2626"}}>{p.inStock?<CheckCircle className="w-4 h-4"/>:<XCircle className="w-4 h-4"/>}{p.inStock?"In Stock":"Out of Stock"}</span>
            {p.variants?.colors&&<div className="mb-5"><label className="text-sm font-semibold mb-2 block">Colour: <span className="font-normal text-muted-foreground">{selectedColor}</span></label><div className="flex flex-wrap gap-2">{p.variants.colors.map(c=><button key={c} onClick={()=>setSelectedColor(c)} className="px-4 py-2 rounded-xl text-sm border-2 font-medium transition-all" style={selectedColor===c?{borderColor:"#09090D",backgroundColor:"#09090D",color:"#F9F9FB"}:{borderColor:"#E5E7EB"}}>{c}</button>)}</div></div>}
            {p.variants?.sizes&&<div className="mb-5"><label className="text-sm font-semibold mb-2 block">Size: <span className="font-normal text-muted-foreground">{selectedSize}</span></label><div className="flex flex-wrap gap-2">{p.variants.sizes.map(s=><button key={s} onClick={()=>setSelectedSize(s)} className="min-w-[48px] h-10 px-3 rounded-xl text-sm border-2 font-bold transition-all" style={selectedSize===s?{borderColor:"#09090D",backgroundColor:"#09090D",color:"#F9F9FB"}:{borderColor:"#E5E7EB"}}>{s}</button>)}</div></div>}
            <div className="mb-6"><label className="text-sm font-semibold mb-2 block">Quantity</label><div className="inline-flex items-center border border-border rounded-xl overflow-hidden"><button onClick={()=>setDetailQty(Math.max(1,detailQty-1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"><Minus className="w-4 h-4"/></button><span className="w-12 text-center font-bold" style={{fontFamily:MONO}}>{detailQty}</span><button onClick={()=>setDetailQty(detailQty+1)} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"><Plus className="w-4 h-4"/></button></div></div>
            <div className="flex gap-3 mb-8">
              <button onClick={()=>{if(p.inStock)addToCart(p,selectedColor,selectedSize,detailQty);}} disabled={!p.inStock} className="flex-1 py-3.5 text-white font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2" style={{backgroundColor:"#16a34a"}}><ShoppingCart className="w-4 h-4"/> Add to Cart</button>
              <button onClick={()=>{if(p.inStock){addToCart(p,selectedColor,selectedSize,detailQty);navigate("checkout");}}} disabled={!p.inStock} className="flex-1 py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-all">Buy Now</button>
            </div>
            <div className="border border-border rounded-2xl p-4 space-y-3">{[{icon:Truck,title:"Free Delivery",desc:"Orders over ₦150,000 ship free."},{icon:RefreshCw,title:"30-Day Returns",desc:"Return or exchange within 30 days."},{icon:Shield,title:"Secure Payment",desc:"Paystack & Flutterwave encrypted."}].map(({icon:Icon,title,desc})=><div key={title} className="flex items-center gap-3 text-sm"><Icon className="w-4 h-4 text-muted-foreground shrink-0"/><div><p className="font-semibold">{title}</p><p className="text-xs text-muted-foreground">{desc}</p></div></div>)}</div>
          </div>
        </div>
        <div className="mt-14">
          <div className="border-b border-border mb-8"><div className="flex">{(["description","specs","reviews"] as const).map(tab=><button key={tab} onClick={()=>setDetailTab(tab)} className="px-6 py-3 text-sm font-bold capitalize border-b-2 transition-colors" style={detailTab===tab?{borderColor:"#09090D"}:{borderColor:"transparent",color:"#6B7280"}}>{tab==="reviews"?`Reviews (${p.reviews.toLocaleString()})`:tab.charAt(0).toUpperCase()+tab.slice(1)}</button>)}</div></div>
          {detailTab==="description"&&<div className="max-w-2xl"><p className="text-muted-foreground leading-relaxed">{p.description}</p><div className="mt-4 flex flex-wrap gap-2">{p.tags.map(t=><span key={t} className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">#{t}</span>)}</div></div>}
          {detailTab==="specs"&&p.specs&&<div className="max-w-lg"><table className="w-full">{Object.entries(p.specs).map(([k,v])=><tr key={k} className="border-b border-border last:border-0"><td className="py-3 pr-8 text-sm font-medium text-muted-foreground w-44">{k}</td><td className="py-3 text-sm">{v}</td></tr>)}</table></div>}
          {detailTab==="reviews"&&<div className="space-y-6 max-w-2xl">{[{name:"Chidi A.",rating:5,date:"Dec 12, 2024",text:"Absolutely love this product! Quality is outstanding and delivery was fast."},{name:"Ngozi M.",rating:4,date:"Nov 28, 2024",text:"Great value for money. Exactly as described. Highly recommended."},{name:"Kola B.",rating:5,date:"Nov 15, 2024",text:"Best purchase this year. Build quality is premium and works perfectly."}].map((r,i)=><div key={i} className="border-b border-border pb-6 last:border-0"><div className="flex items-start justify-between mb-2"><div><p className="font-semibold text-sm">{r.name}</p><StarRating rating={r.rating}/></div><span className="text-xs text-muted-foreground">{r.date}</span></div><p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.text}</p></div>)}</div>}
        </div>
        <div className="mt-14"><h2 className="text-xl font-bold mb-6">You May Also Like</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{products.filter(p2=>p2.id!==p.id&&p2.category===p.category).slice(0,4).map(prod=><ProductCard key={prod.id} product={prod} onNavigate={()=>navigate("detail",prod)} onAddToCart={()=>addToCart(prod)} isWishlisted={wishlist.includes(prod.id)} onToggleWishlist={()=>toggleWishlist(prod.id)}/>)}</div></div>
      </div>
    );
  };

  // ── Cart ───────────────────────────────────────────────────────────────────
  const renderCart = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{fontFamily:BODY}}>
      <div className="flex items-center gap-3 mb-8"><button onClick={()=>navigate("products")} className="p-2 hover:bg-muted rounded-xl"><ArrowLeft className="w-5 h-5"/></button><h1 className="text-2xl font-bold">Shopping Cart</h1>{cartCount>0&&<span className="bg-muted text-muted-foreground text-sm px-2.5 py-0.5 rounded-full">{cartCount} items</span>}</div>
      {cart.length===0?(
        <div className="flex flex-col items-center py-24 text-center"><ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4"/><h2 className="text-xl font-semibold mb-2">Your cart is empty</h2><button onClick={()=>navigate("products")} className="mt-4 bg-primary text-primary-foreground px-7 py-3 rounded-xl font-bold hover:opacity-90">Browse Products</button></div>
      ):(
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item,idx)=>(
              <div key={idx} className="flex gap-4 bg-card border border-border rounded-2xl p-4">
                <div className="w-24 h-24 bg-muted rounded-xl overflow-hidden shrink-0 cursor-pointer" onClick={()=>navigate("detail",item.product)}><img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover"/></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-snug cursor-pointer hover:text-green-600" onClick={()=>navigate("detail",item.product)}>{item.product.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.product.brand}</p>
                  {(item.color||item.size)&&<p className="text-xs text-muted-foreground mt-1">{[item.color&&`Colour: ${item.color}`,item.size&&`Size: ${item.size}`].filter(Boolean).join(" · ")}</p>}
                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <div className="flex items-center border border-border rounded-xl overflow-hidden"><button onClick={()=>updateCartQty(idx,item.qty-1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted"><Minus className="w-3.5 h-3.5"/></button><span className="w-8 text-center text-sm font-bold" style={{fontFamily:MONO}}>{item.qty}</span><button onClick={()=>updateCartQty(idx,item.qty+1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted"><Plus className="w-3.5 h-3.5"/></button></div>
                    <div className="flex items-center gap-3"><span className="font-bold text-sm" style={{fontFamily:MONO}}>{fmt(item.product.price*item.qty)}</span><button onClick={()=>removeFromCart(idx)} className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button></div>
                  </div>
                </div>
              </div>
            ))}
            <div className="border border-border rounded-2xl p-5">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Tag className="w-4 h-4"/> Have a coupon?</h3>
              <div className="flex gap-2"><input type="text" placeholder="SAVE10" value={couponCode} onChange={e=>{setCouponCode(e.target.value);setCouponError("");}} className="flex-1 px-3 py-2.5 bg-muted rounded-xl text-sm focus:outline-none"/><button onClick={applyCoupon} disabled={couponApplied} className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl disabled:opacity-50">Apply</button></div>
              {couponApplied&&<p className="flex items-center gap-2 mt-2 text-sm text-green-600"><CheckCircle className="w-4 h-4"/> 10% discount applied!</p>}
              {couponError&&<p className="flex items-center gap-2 mt-2 text-red-500 text-sm"><AlertCircle className="w-4 h-4"/> {couponError}</p>}
            </div>
          </div>
          <div>
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({cartCount} items)</span><span style={{fontFamily:MONO}}>{fmt(cartSubtotal)}</span></div>
                {couponApplied&&<div className="flex justify-between text-green-600"><span>Discount (SAVE10)</span><span style={{fontFamily:MONO}}>-{fmt(cartDiscount)}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span style={{fontFamily:MONO}}>{deliveryFee===0?"Free":fmt(deliveryFee)}</span></div>
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg"><span>Total</span><span style={{fontFamily:MONO}}>{fmt(cartTotal)}</span></div>
              <button onClick={()=>navigate("checkout")} className="w-full mt-5 py-3.5 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2" style={{backgroundColor:"#16a34a"}}>Checkout <ArrowRight className="w-4 h-4"/></button>
              <button onClick={()=>navigate("products")} className="w-full mt-2 py-3 text-sm text-muted-foreground hover:text-foreground">Continue Shopping</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Checkout ───────────────────────────────────────────────────────────────
  const renderCheckout = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" style={{fontFamily:BODY}}>
      <div className="flex items-center gap-3 mb-8"><button onClick={()=>navigate("cart")} className="p-2 hover:bg-muted rounded-xl"><ArrowLeft className="w-5 h-5"/></button><h1 className="text-2xl font-bold">Checkout</h1></div>
      <div className="flex items-center mb-8">{["Delivery","Payment"].map((step,i)=><div key={step} className="flex items-center"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={checkoutStep>i+1?{backgroundColor:"#16a34a",color:"#fff"}:checkoutStep===i+1?{backgroundColor:"#09090D",color:"#F9F9FB"}:{backgroundColor:"#F3F4F6",color:"#9CA3AF"}}>{checkoutStep>i+1?<Check className="w-4 h-4"/>:i+1}</div><span className="text-sm font-bold" style={checkoutStep!==i+1?{color:"#9CA3AF"}:{}}>{step}</span></div>{i<1&&<div className="w-16 h-0.5 mx-4" style={{backgroundColor:checkoutStep>1?"#16a34a":"var(--border)"}}/>}</div>)}</div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {checkoutStep===1&&(
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2"><MapPin className="w-5 h-5"/> Delivery Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[{label:"First Name",field:"firstName",placeholder:"Chidi",full:false},{label:"Last Name",field:"lastName",placeholder:"Okonkwo",full:false},{label:"Email",field:"email",placeholder:"chidi@example.com",full:true},{label:"Phone",field:"phone",placeholder:"+234 801 234 5678",full:false},{label:"Street Address",field:"address",placeholder:"12 Broad Street, Victoria Island",full:true},{label:"City",field:"city",placeholder:"Lagos",full:false},{label:"State",field:"state",placeholder:"Lagos State",full:false},{label:"ZIP Code",field:"zip",placeholder:"100001",full:true}].map(({label,field,placeholder,full})=>(
                  <div key={field} className={full?"sm:col-span-2":""}><label className="text-sm font-semibold mb-1.5 block">{label}</label><input type="text" placeholder={placeholder} value={(checkoutData as Record<string,string>)[field]} onChange={e=>setCheckoutData(prev=>({...prev,[field]:e.target.value}))} className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm focus:outline-none border border-transparent focus:border-green-400"/></div>
                ))}
              </div>
              <div className="mt-6"><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Delivery Method</p>
                <div className="space-y-3">{[{id:"standard",label:"Standard Delivery",desc:"5-7 business days",price:cartSubtotal>=150000?"Free":fmt(15000)},{id:"express",label:"Express Delivery",desc:"2-3 business days",price:fmt(30000)},{id:"same-day",label:"Same-Day (Lagos)",desc:"Delivered today",price:fmt(50000)}].map(opt=>(
                  <label key={opt.id} className="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer" style={checkoutData.delivery===opt.id?{borderColor:"#09090D"}:{borderColor:"#E5E7EB"}}>
                    <div className="flex items-center gap-3"><input type="radio" name="delivery" value={opt.id} checked={checkoutData.delivery===opt.id} onChange={()=>setCheckoutData(prev=>({...prev,delivery:opt.id}))} style={{accentColor:"#16a34a"}}/><div><p className="text-sm font-semibold">{opt.label}</p><p className="text-xs text-muted-foreground">{opt.desc}</p></div></div>
                    <span className="font-bold text-sm" style={{fontFamily:MONO}}>{opt.price}</span>
                  </label>
                ))}</div>
              </div>
              <button onClick={()=>setCheckoutStep(2)} className="w-full mt-6 py-3.5 text-white font-bold rounded-xl hover:opacity-90" style={{backgroundColor:"#16a34a"}}>Continue to Payment</button>
            </div>
          )}
          {checkoutStep===2&&(
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-5 flex items-center gap-2"><CreditCard className="w-5 h-5"/> Payment Method</h2>
              <div className="space-y-3 mb-6">{[{id:"paystack",label:"Paystack",icon:Shield,desc:"Debit card, bank transfer, USSD"},{id:"flutterwave",label:"Flutterwave",icon:Zap,desc:"Pay with Flutterwave"},{id:"card",label:"Credit / Debit Card",icon:CreditCard,desc:"Visa, Mastercard, Verve"},{id:"bank",label:"Bank Transfer",icon:Globe,desc:"Direct bank transfer"},{id:"cod",label:"Cash on Delivery",icon:Truck,desc:"Pay when delivered"}].map(({id,label,icon:Icon,desc})=>(
                <label key={id} className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer" style={checkoutData.paymentMethod===id?{borderColor:"#09090D"}:{borderColor:"#E5E7EB"}}>
                  <input type="radio" name="payment" value={id} checked={checkoutData.paymentMethod===id} onChange={()=>setCheckoutData(prev=>({...prev,paymentMethod:id}))} style={{accentColor:"#16a34a"}}/>
                  <Icon className="w-5 h-5 text-muted-foreground shrink-0"/><div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                </label>
              ))}</div>
              {checkoutData.paymentMethod==="card"&&(
                <div className="border border-border rounded-xl p-4 space-y-4 mb-6">
                  <div><label className="text-sm font-semibold mb-1.5 block">Card Number</label><input type="text" placeholder="5399 8300 0000 0000" value={checkoutData.cardNumber} onChange={e=>setCheckoutData(prev=>({...prev,cardNumber:e.target.value}))} className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm focus:outline-none" style={{fontFamily:MONO}}/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-semibold mb-1.5 block">Expiry</label><input type="text" placeholder="MM / YY" value={checkoutData.cardExpiry} onChange={e=>setCheckoutData(prev=>({...prev,cardExpiry:e.target.value}))} className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm focus:outline-none" style={{fontFamily:MONO}}/></div>
                    <div><label className="text-sm font-semibold mb-1.5 block">CVV</label><input type="text" placeholder="•••" value={checkoutData.cardCvv} onChange={e=>setCheckoutData(prev=>({...prev,cardCvv:e.target.value}))} className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm focus:outline-none" style={{fontFamily:MONO}}/></div>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={()=>setCheckoutStep(1)} className="px-6 py-3.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Back</button>
                <button onClick={placeOrder} className="flex-1 py-3.5 text-white font-bold rounded-xl hover:opacity-90 flex items-center justify-center gap-2" style={{backgroundColor:"#16a34a"}}><Lock className="w-4 h-4"/> Place Order — {fmt(cartTotal)}</button>
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="bg-card border border-border rounded-2xl p-5 sticky top-24">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">{cart.map((item,i)=><div key={i} className="flex items-start gap-3"><div className="w-12 h-12 bg-muted rounded-xl overflow-hidden shrink-0"><img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><p className="text-sm font-medium line-clamp-1">{item.product.name}</p><p className="text-xs text-muted-foreground">Qty: {item.qty}</p></div><span className="text-sm font-bold shrink-0" style={{fontFamily:MONO}}>{fmt(item.product.price*item.qty)}</span></div>)}</div>
            <div className="border-t border-border pt-3 space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span style={{fontFamily:MONO}}>{fmt(cartSubtotal)}</span></div>{couponApplied&&<div className="flex justify-between text-green-600"><span>Discount</span><span style={{fontFamily:MONO}}>-{fmt(cartDiscount)}</span></div>}<div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span style={{fontFamily:MONO}}>{deliveryFee===0?"Free":fmt(deliveryFee)}</span></div></div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold text-base"><span>Total</span><span style={{fontFamily:MONO}}>{fmt(cartTotal)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Confirmed ──────────────────────────────────────────────────────────────
  const renderConfirmed = () => (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center" style={{fontFamily:BODY}}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{backgroundColor:"#dcfce7"}}><CheckCircle className="w-10 h-10" style={{color:"#16a34a"}}/></div>
      <h1 className="text-3xl font-bold mb-3" style={{fontFamily:DISPLAY}}>Order Confirmed!</h1>
      <p className="text-muted-foreground mb-8">We are processing your order and will send a confirmation shortly.</p>
      <div className="bg-card border border-border rounded-2xl p-6 text-left mb-8">
        <div className="flex items-center justify-between mb-5"><div><p className="text-xs text-muted-foreground mb-1">Order ID</p><p className="font-bold text-lg" style={{fontFamily:MONO}}>{confirmedOrder}</p></div><button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-2 rounded-xl"><Download className="w-4 h-4"/> Invoice</button></div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border"><div><p className="text-xs text-muted-foreground mb-1">Status</p><StatusBadge status="pending"/></div><div><p className="text-xs text-muted-foreground mb-1">Est. Delivery</p><p className="text-sm font-semibold">3-7 business days</p></div><div><p className="text-xs text-muted-foreground mb-1">Payment</p><p className="text-sm font-semibold capitalize">{checkoutData.paymentMethod==="cod"?"Cash on Delivery":checkoutData.paymentMethod}</p></div></div>
      </div>
      <div className="flex gap-3 justify-center"><button onClick={()=>navigate("customer-dash")} className="px-6 py-3 border border-border rounded-xl text-sm font-semibold hover:bg-muted">Track Order</button><button onClick={()=>navigate("customer-home")} className="px-6 py-3 text-white rounded-xl text-sm font-bold hover:opacity-90" style={{backgroundColor:"#16a34a"}}>Continue Shopping</button></div>
    </div>
  );

  // ── Customer Dashboard ─────────────────────────────────────────────────────
  const renderCustomerDash = () => {
    const wishlistProducts = products.filter(p=>wishlist.includes(p.id));
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" style={{fontFamily:BODY}}>
        <div className="flex items-center gap-3 mb-8"><div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">{currentUser?.initials}</div><div><h1 className="text-xl font-bold">{currentUser?.name}</h1><p className="text-sm text-muted-foreground">Customer Account</p></div></div>
        <div className="border-b border-border mb-8"><div className="flex gap-0">{["overview","orders","wishlist","profile"].map(tab=><button key={tab} onClick={()=>setDashTab(tab)} className="px-5 py-3 text-sm font-bold capitalize border-b-2 transition-colors" style={dashTab===tab?{borderColor:"#09090D"}:{borderColor:"transparent",color:"#6B7280"}}>{tab}</button>)}</div></div>
        {dashTab==="overview"&&<div><div className="grid sm:grid-cols-3 gap-4 mb-8">{[{label:"Total Orders",value:"5",icon:Package,bg:"bg-blue-50",ic:"text-blue-600"},{label:"Wishlist Items",value:String(wishlist.length),icon:Heart,bg:"bg-red-50",ic:"text-red-500"},{label:"Total Spent",value:"₦4.6M",icon:CreditCard,bg:"bg-green-50",ic:"text-green-600"}].map(({label,value,icon:Icon,bg,ic})=><div key={label} className="bg-card border border-border rounded-2xl p-5"><div className="flex items-center justify-between mb-3"><p className="text-sm text-muted-foreground">{label}</p><div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}><Icon className={`w-4 h-4 ${ic}`}/></div></div><p className="text-2xl font-bold" style={{fontFamily:MONO}}>{value}</p></div>)}</div><h2 className="font-bold mb-4">Recent Orders</h2><div className="space-y-3">{MOCK_ORDERS.slice(0,3).map(order=><div key={order.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 flex-wrap"><div className="min-w-0 flex-1"><p className="font-bold text-sm" style={{fontFamily:MONO}}>{order.id}</p><p className="text-xs text-muted-foreground mt-0.5">{order.date} · {order.items.length} item{order.items.length>1?"s":""}</p></div><StatusBadge status={order.status}/><span className="font-bold text-sm" style={{fontFamily:MONO}}>{fmt(order.total)}</span></div>)}</div></div>}
        {dashTab==="orders"&&<div><h2 className="font-bold text-lg mb-5">My Orders</h2><div className="space-y-4">{MOCK_ORDERS.map(order=><div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden"><div className="flex items-center justify-between p-4 bg-muted/40 flex-wrap gap-2"><div><p className="font-bold text-sm" style={{fontFamily:MONO}}>{order.id}</p><p className="text-xs text-muted-foreground">{order.date}</p></div><div className="flex items-center gap-3"><StatusBadge status={order.status}/><span className="font-bold text-sm" style={{fontFamily:MONO}}>{fmt(order.total)}</span></div></div><div className="p-4 space-y-1.5">{order.items.map((item,i)=><div key={i} className="flex justify-between text-sm"><span className="text-muted-foreground">{item.name} x{item.qty}</span><span style={{fontFamily:MONO}}>{fmt(item.price*item.qty)}</span></div>)}</div>{order.tracking&&<div className="px-4 pb-3 flex items-center gap-2 text-xs text-muted-foreground"><Truck className="w-3.5 h-3.5"/>Tracking: <span style={{fontFamily:MONO}}>{order.tracking}</span></div>}</div>)}</div></div>}
        {dashTab==="wishlist"&&<div><h2 className="font-bold text-lg mb-5">My Wishlist ({wishlistProducts.length})</h2>{wishlistProducts.length===0?<div className="flex flex-col items-center py-16 text-center"><Heart className="w-12 h-12 text-muted-foreground/30 mb-4"/><h3 className="font-semibold mb-2">Wishlist is empty</h3><button onClick={()=>navigate("products")} className="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90">Browse Products</button></div>:<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{wishlistProducts.map(p=><ProductCard key={p.id} product={p} onNavigate={()=>navigate("detail",p)} onAddToCart={()=>addToCart(p)} isWishlisted onToggleWishlist={()=>toggleWishlist(p.id)}/>)}</div>}</div>}
        {dashTab==="profile"&&<div className="max-w-lg"><h2 className="font-bold text-lg mb-6">Profile Settings</h2><div className="bg-card border border-border rounded-2xl p-6 space-y-5"><div className="flex items-center gap-4 mb-2"><div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">{currentUser?.initials}</div><div><p className="font-bold">{currentUser?.name}</p><p className="text-sm text-muted-foreground capitalize">{currentUser?.role} · Joined {currentUser?.joined}</p></div></div>{[{label:"Full Name",val:currentUser?.name},{label:"Email Address",val:currentUser?.email},{label:"Phone Number",val:"+234 801 234 5678"}].map(f=><div key={f.label}><label className="text-sm font-semibold mb-1.5 block">{f.label}</label><input type="text" defaultValue={f.val} className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm focus:outline-none"/></div>)}<div className="flex gap-3"><button className="px-6 py-2.5 text-white rounded-xl text-sm font-bold hover:opacity-90" style={{backgroundColor:"#16a34a"}}>Save Changes</button><button className="px-6 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted">Cancel</button></div></div></div>}
      </div>
    );
  };

  // ── Vendor Dashboard ───────────────────────────────────────────────────────
  const renderVendorDash = () => {
    const vendorProducts = products.filter(p => p.id.startsWith("p") || true); // all products visible to vendor
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{fontFamily:BODY}}>
        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor:"rgba(0,0,0,0.5)"}}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100"><h2 className="font-bold text-lg">Add New Product</h2><button onClick={()=>{setShowAddProduct(false);setAddProductError("");}} className="p-2 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5"/></button></div>
              <div className="p-6 space-y-4">
                <div><label className="text-sm font-semibold mb-1.5 block">Product Name *</label><input type="text" placeholder="e.g. Premium Leather Wallet" value={newProduct.name} onChange={e=>setNewProduct(p=>({...p,name:e.target.value}))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-semibold mb-1.5 block">Price (₦) *</label><input type="number" placeholder="e.g. 50000" value={newProduct.price} onChange={e=>setNewProduct(p=>({...p,price:e.target.value}))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"/></div>
                  <div><label className="text-sm font-semibold mb-1.5 block">Category *</label><select value={newProduct.category} onChange={e=>setNewProduct(p=>({...p,category:e.target.value}))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none">{CATEGORIES.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}</select></div>
                </div>
                <div><label className="text-sm font-semibold mb-1.5 block">Brand *</label><input type="text" placeholder="e.g. My Brand" value={newProduct.brand} onChange={e=>setNewProduct(p=>({...p,brand:e.target.value}))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"/></div>
                <div><label className="text-sm font-semibold mb-1.5 block">Description *</label><textarea placeholder="Describe your product..." value={newProduct.description} onChange={e=>setNewProduct(p=>({...p,description:e.target.value}))} rows={3} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none"/></div>
                <div><label className="text-sm font-semibold mb-1.5 block">Image URL (optional)</label><input type="text" placeholder="https://images.unsplash.com/..." value={newProduct.image} onChange={e=>setNewProduct(p=>({...p,image:e.target.value}))} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400"/></div>
                <div className="flex items-center gap-3"><label className="text-sm font-semibold">In Stock</label><button onClick={()=>setNewProduct(p=>({...p,inStock:!p.inStock}))} className="relative w-12 h-6 rounded-full transition-colors" style={{backgroundColor:newProduct.inStock?"#16a34a":"#d1d5db"}}><span className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow" style={{left:newProduct.inStock?"26px":"2px"}}/></button></div>
                {addProductError && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{addProductError}</p>}
                <div className="flex gap-3 pt-2"><button onClick={()=>{setShowAddProduct(false);setAddProductError("");}} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button><button onClick={handleAddProduct} className="flex-1 py-3 text-white font-bold rounded-xl hover:opacity-90" style={{backgroundColor:"#16a34a"}}>Add Product</button></div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3"><div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">{currentUser?.initials}</div><div><h1 className="text-xl font-bold">{currentUser?.name}</h1><p className="text-sm text-muted-foreground">Vendor Portal</p></div></div>
          <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-semibold text-sm">Store Active</span>
        </div>
        <div className="border-b border-border mb-8"><div className="flex gap-0">{["overview","products","orders","inventory"].map(tab=><button key={tab} onClick={()=>setDashTab(tab)} className="px-5 py-3 text-sm font-bold capitalize border-b-2 transition-colors" style={dashTab===tab?{borderColor:"#09090D"}:{borderColor:"transparent",color:"#6B7280"}}>{tab}</button>)}</div></div>

        {dashTab==="overview"&&<div>
          <div className="grid sm:grid-cols-4 gap-4 mb-8">{[{label:"Revenue (Dec)",value:"₦61.2M",sub:"+18.4%",icon:TrendingUp},{label:"Orders",value:"394",sub:"+16.9%",icon:Package},{label:"Products",value:String(products.length),sub:"listed",icon:LayoutGrid},{label:"Avg. Rating",value:"4.7★",sub:"+0.1",icon:Star}].map(({label,value,sub,icon:Icon})=><div key={label} className="bg-card border border-border rounded-2xl p-5"><div className="flex items-start justify-between mb-3"><p className="text-sm text-muted-foreground">{label}</p><Icon className="w-4 h-4 text-muted-foreground"/></div><p className="text-2xl font-bold" style={{fontFamily:MONO}}>{value}</p><p className="text-xs mt-1 text-green-600">{sub}</p></div>)}</div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5"><h3 className="font-bold mb-4">Revenue (6 months)</h3><ResponsiveContainer width="100%" height={220}><AreaChart data={REVENUE_DATA}><defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.25}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="month" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} tickFormatter={v=>`₦${(v/1000000).toFixed(0)}M`}/><Tooltip formatter={(v:number)=>[`₦${(v/1000000).toFixed(1)}M`,"Revenue"]}/><Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#rg)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
            <div className="bg-card border border-border rounded-2xl p-5"><h3 className="font-bold mb-4">Sales by Category</h3><div className="flex items-center gap-4"><ResponsiveContainer width="55%" height={200}><PieChart><Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>{CATEGORY_DATA.map((e)=><Cell key={e.name} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer><div className="flex-1 space-y-2">{CATEGORY_DATA.map(c=><div key={c.name} className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor:c.color}}/><span className="text-muted-foreground flex-1">{c.name}</span><span className="font-bold">{c.value}%</span></div>)}</div></div></div>
          </div>
        </div>}

        {dashTab==="products"&&<div>
          <div className="flex items-center justify-between mb-6"><div><h2 className="font-bold text-lg">My Products</h2><p className="text-sm text-muted-foreground">{products.length} products listed</p></div><button onClick={()=>setShowAddProduct(true)} className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90" style={{backgroundColor:"#16a34a"}}><Plus className="w-4 h-4"/> Add Product</button></div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden"><table className="w-full"><thead><tr className="border-b border-border bg-muted/40">{["Product","Category","Price","Rating","Status",""].map(h=><th key={h} className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>{products.slice(0,15).map(p=><tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-muted rounded-xl overflow-hidden shrink-0"><img src={p.image} alt={p.name} className="w-full h-full object-cover"/></div><span className="text-sm font-semibold line-clamp-1">{p.name}</span></div></td><td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{p.category}</td><td className="px-4 py-3"><span className="text-sm font-bold" style={{fontFamily:MONO}}>{fmt(p.price)}</span></td><td className="px-4 py-3 hidden md:table-cell"><div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400"/><span className="text-sm">{p.rating||"New"}</span></div></td><td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={p.inStock?{backgroundColor:"#dcfce7",color:"#16a34a"}:{backgroundColor:"#fee2e2",color:"#dc2626"}}>{p.inStock?"In Stock":"Out of Stock"}</span></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button className="p-1.5 hover:bg-muted rounded-lg"><Eye className="w-4 h-4 text-muted-foreground"/></button><button className="p-1.5 hover:bg-muted rounded-lg"><Edit className="w-4 h-4 text-muted-foreground"/></button><button className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500"/></button></div></td></tr>)}</tbody>
          </table></div>
        </div>}

        {dashTab==="orders"&&<div>
          <h2 className="font-bold text-lg mb-5">Orders to Fulfill</h2>
          <div className="space-y-4">{MOCK_ORDERS.filter(o=>o.status!=="cancelled"&&o.status!=="delivered").map(order=><div key={order.id} className="bg-card border border-border rounded-2xl p-4"><div className="flex items-center justify-between mb-3 flex-wrap gap-2"><div><p className="font-bold" style={{fontFamily:MONO}}>{order.id}</p><p className="text-xs text-muted-foreground">{order.date}</p></div><StatusBadge status={order.status}/></div><div className="space-y-1 mb-4">{order.items.map((item,i)=><p key={i} className="text-sm text-muted-foreground">{item.qty}x {item.name}</p>)}</div><div className="flex items-center justify-between flex-wrap gap-2"><span className="font-bold" style={{fontFamily:MONO}}>{fmt(order.total)}</span><div className="flex gap-2">{order.status==="pending"&&<button className="text-xs px-3 py-1.5 text-white rounded-xl font-bold" style={{backgroundColor:"#16a34a"}}>Accept</button>}{order.status==="processing"&&<button className="text-xs px-3 py-1.5 text-white rounded-xl font-bold" style={{backgroundColor:"#16a34a"}}>Mark Shipped</button>}<button className="text-xs px-3 py-1.5 border border-border rounded-xl hover:bg-muted">Details</button></div></div></div>)}</div>
        </div>}

        {dashTab==="inventory"&&<div>
          <h2 className="font-bold text-lg mb-5">Inventory Management</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6"><table className="w-full"><thead><tr className="border-b border-border bg-muted/40">{["Product","Stock","Status",""].map(h=><th key={h} className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>{products.slice(0,12).map(p=>{const stock=STOCK_LEVELS[p.id]??50;const isOut=stock===0;const isLow=stock>0&&stock<10;return(<tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-muted rounded-xl overflow-hidden shrink-0"><img src={p.image} alt={p.name} className="w-full h-full object-cover"/></div><span className="text-sm font-semibold line-clamp-1">{p.name}</span></div></td><td className="px-4 py-3"><span className="font-bold text-sm" style={{fontFamily:MONO}}>{stock}</span></td><td className="px-4 py-3"><span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={isOut?{backgroundColor:"#fee2e2",color:"#dc2626"}:isLow?{backgroundColor:"#fef9c3",color:"#a16207"}:{backgroundColor:"#dcfce7",color:"#16a34a"}}>{isOut?"Out of Stock":isLow?"Low Stock":"In Stock"}</span></td><td className="px-4 py-3 text-right"><button className="text-xs px-3 py-1.5 border border-border rounded-xl hover:bg-muted">Restock</button></td></tr>);})}</tbody>
          </table></div>
        </div>}
      </div>
    );
  };

  // ── Admin Dashboard ────────────────────────────────────────────────────────
  const renderAdminDash = () => {
    const newRegistrations = userRegistry.filter(u => !STATIC_USERS.find(s=>s.id===u.id));
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" style={{fontFamily:BODY}}>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3"><div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">{currentUser?.initials}</div><div><h1 className="text-xl font-bold">{currentUser?.name}</h1><p className="text-sm text-muted-foreground">Platform Administrator</p></div></div>
          <button className="flex items-center gap-2 border border-border px-3 py-2 rounded-xl text-sm hover:bg-muted"><Download className="w-4 h-4"/> Export Report</button>
        </div>
        <div className="border-b border-border mb-8"><div className="flex gap-0 overflow-x-auto">{["overview","users","products","orders","analytics"].map(tab=><button key={tab} onClick={()=>setDashTab(tab)} className="px-5 py-3 text-sm font-bold capitalize border-b-2 whitespace-nowrap transition-colors" style={dashTab===tab?{borderColor:"#09090D"}:{borderColor:"transparent",color:"#6B7280"}}>{tab}{tab==="users"&&newRegistrations.length>0?<span className="ml-1.5 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">{newRegistrations.length}</span>:null}</button>)}</div></div>

        {dashTab==="overview"&&<div>
          <div className="grid sm:grid-cols-4 gap-4 mb-8">{[{label:"Platform Revenue",value:"₦2.4B",sub:"+22% this month",icon:TrendingUp},{label:"Total Users",value:userRegistry.length.toLocaleString(),sub:`+${newRegistrations.length} new`,icon:Users},{label:"Active Vendors",value:userRegistry.filter(u=>u.role==="vendor").length.toString(),sub:"registered",icon:Store},{label:"Orders Today",value:"1,284",sub:"+8.4% vs yesterday",icon:Package}].map(({label,value,sub,icon:Icon})=><div key={label} className="bg-card border border-border rounded-2xl p-5"><div className="flex items-start justify-between mb-3"><p className="text-sm text-muted-foreground">{label}</p><Icon className="w-4 h-4 text-muted-foreground"/></div><p className="text-2xl font-bold" style={{fontFamily:MONO}}>{value}</p><p className="text-xs mt-1 text-green-600">{sub}</p></div>)}</div>
          <div className="bg-card border border-border rounded-2xl p-5"><h3 className="font-bold mb-4">Revenue & Orders (6 months)</h3><ResponsiveContainer width="100%" height={260}><BarChart data={REVENUE_DATA}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="month" tick={{fontSize:11}}/><YAxis yAxisId="left" orientation="left" tick={{fontSize:11}} tickFormatter={v=>`₦${(v/1000000).toFixed(0)}M`}/><YAxis yAxisId="right" orientation="right" tick={{fontSize:11}}/><Tooltip formatter={(v:number,name:string)=>[name==="revenue"?`₦${(v/1000000).toFixed(1)}M`:v,name==="revenue"?"Revenue":"Orders"]}/><Bar yAxisId="left" dataKey="revenue" fill="#16a34a" radius={[4,4,0,0]} name="revenue"/><Bar yAxisId="right" dataKey="orders" fill="#3b82f6" radius={[4,4,0,0]} name="orders"/></BarChart></ResponsiveContainer></div>
        </div>}

        {dashTab==="users"&&<div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div><h2 className="font-bold text-lg">User Management</h2><p className="text-sm text-muted-foreground">{userRegistry.length} total · {newRegistrations.length} new registration{newRegistrations.length!==1?"s":""} today</p></div>
            {newRegistrations.length>0&&<span className="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-semibold animate-pulse">🟢 {newRegistrations.length} new account{newRegistrations.length>1?"s":""} pending review</span>}
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full"><thead><tr className="border-b border-border bg-muted/40">{["User","Role","Joined","Status",""].map(h=><th key={h} className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wide">{h}</th>)}</tr></thead>
              <tbody>{userRegistry.map(user=>{const isNew=!STATIC_USERS.find(s=>s.id===user.id);return(<tr key={user.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${isNew?"bg-green-50/50":""}`}><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">{user.initials}</div><div><div className="flex items-center gap-2"><p className="text-sm font-semibold">{user.name}</p>{isNew&&<span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded">NEW</span>}</div><p className="text-xs text-muted-foreground">{user.email}</p></div></div></td><td className="px-4 py-3 hidden sm:table-cell"><span className="text-xs capitalize px-2.5 py-1 bg-muted rounded-full text-muted-foreground font-medium">{user.role}</span></td><td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{user.joined}</td><td className="px-4 py-3"><span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={user.status==="active"?{backgroundColor:"#dcfce7",color:"#16a34a"}:{backgroundColor:"#fef9c3",color:"#a16207"}}>{user.status}</span></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button className="p-1.5 hover:bg-muted rounded-lg"><Eye className="w-3.5 h-3.5 text-muted-foreground"/></button><button className="p-1.5 hover:bg-muted rounded-lg"><Edit className="w-3.5 h-3.5 text-muted-foreground"/></button><button className="p-1.5 hover:bg-red-50 rounded-lg"><XCircle className="w-3.5 h-3.5 text-red-500"/></button></div></td></tr>)})}</tbody>
            </table>
          </div>
        </div>}

        {dashTab==="products"&&<div>
          <div className="flex items-center justify-between mb-6"><h2 className="font-bold text-lg">All Products ({products.length})</h2><button className="flex items-center gap-2 border border-border px-4 py-2 rounded-xl text-sm hover:bg-muted"><Download className="w-4 h-4"/> Export</button></div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden"><table className="w-full"><thead><tr className="border-b border-border bg-muted/40">{["Product","Brand","Category","Price","Status",""].map(h=><th key={h} className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>{products.map(p=><tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-muted rounded-xl overflow-hidden shrink-0"><img src={p.image} alt={p.name} className="w-full h-full object-cover"/></div><div><p className="text-sm font-semibold line-clamp-1">{p.name}</p>{p.reviews>0&&<p className="text-xs text-muted-foreground">⭐ {p.rating} ({p.reviews.toLocaleString()})</p>}</div></div></td><td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{p.brand}</td><td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{p.category}</td><td className="px-4 py-3"><span className="font-bold text-sm" style={{fontFamily:MONO}}>{fmt(p.price)}</span></td><td className="px-4 py-3"><span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={p.inStock?{backgroundColor:"#dcfce7",color:"#16a34a"}:{backgroundColor:"#fee2e2",color:"#dc2626"}}>{p.inStock?"Active":"Inactive"}</span></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button className="p-1.5 hover:bg-muted rounded-lg"><Eye className="w-3.5 h-3.5 text-muted-foreground"/></button><button className="p-1.5 hover:bg-muted rounded-lg"><Edit className="w-3.5 h-3.5 text-muted-foreground"/></button><button className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500"/></button></div></td></tr>)}</tbody>
          </table></div>
        </div>}

        {dashTab==="orders"&&<div>
          <div className="flex items-center justify-between mb-6"><h2 className="font-bold text-lg">All Orders</h2><button className="flex items-center gap-2 border border-border px-4 py-2 rounded-xl text-sm hover:bg-muted"><Download className="w-4 h-4"/> Export CSV</button></div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden"><table className="w-full"><thead><tr className="border-b border-border bg-muted/40">{["Order ID","Date","Items","Total","Status",""].map(h=><th key={h} className="text-left text-xs font-bold text-muted-foreground px-4 py-3 uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>{MOCK_ORDERS.map(order=><tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/20"><td className="px-4 py-3"><span className="font-bold text-sm" style={{fontFamily:MONO}}>{order.id}</span></td><td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{order.date}</td><td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{order.items.length} item{order.items.length>1?"s":""}</td><td className="px-4 py-3"><span className="font-bold text-sm" style={{fontFamily:MONO}}>{fmt(order.total)}</span></td><td className="px-4 py-3"><StatusBadge status={order.status}/></td><td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><button className="p-1.5 hover:bg-muted rounded-lg"><Eye className="w-3.5 h-3.5 text-muted-foreground"/></button><button className="p-1.5 hover:bg-muted rounded-lg"><Edit className="w-3.5 h-3.5 text-muted-foreground"/></button></div></td></tr>)}</tbody>
          </table></div>
        </div>}

        {dashTab==="analytics"&&<div className="space-y-6">
          <h2 className="font-bold text-lg">Platform Analytics</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-5"><h3 className="font-bold mb-4">Revenue Trend</h3><ResponsiveContainer width="100%" height={220}><AreaChart data={REVENUE_DATA}><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="month" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} tickFormatter={v=>`₦${(v/1000000).toFixed(0)}M`}/><Tooltip formatter={(v:number)=>[`₦${(v/1000000).toFixed(1)}M`,"Revenue"]}/><Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#ag)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>
            <div className="bg-card border border-border rounded-2xl p-5"><h3 className="font-bold mb-4">Monthly Orders</h3><ResponsiveContainer width="100%" height={220}><BarChart data={REVENUE_DATA}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/><XAxis dataKey="month" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip/><Bar dataKey="orders" fill="#a78bfa" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
            <div className="bg-card border border-border rounded-2xl p-5"><h3 className="font-bold mb-4">Category Breakdown</h3><div className="flex items-center gap-4"><ResponsiveContainer width="55%" height={200}><PieChart><Pie data={CATEGORY_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>{CATEGORY_DATA.map((e)=><Cell key={e.name} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer><div className="flex-1 space-y-2">{CATEGORY_DATA.map(c=><div key={c.name} className="flex items-center gap-2 text-xs"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor:c.color}}/><span className="text-muted-foreground flex-1">{c.name}</span><span className="font-bold">{c.value}%</span></div>)}</div></div></div>
            <div className="bg-card border border-border rounded-2xl p-5"><h3 className="font-bold mb-5">Key Metrics</h3><div className="space-y-4">{[{label:"Conversion Rate",value:"3.24%",sub:"↑ from 2.89%"},{label:"Avg. Order Value",value:"₦234K",sub:"↑ 4.1%"},{label:"Customer Retention",value:"68.4%",sub:"↑ 4.2%"},{label:"Refund Rate",value:"1.8%",sub:"↓ 0.3%"}].map(({label,value,sub})=><div key={label} className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-muted-foreground">{sub}</p></div><span className="font-bold text-lg shrink-0" style={{fontFamily:MONO}}>{value}</span></div>)}</div></div>
          </div>
        </div>}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  ROOT
  // ══════════════════════════════════════════════════════════════════════════
  if (page==="landing") return renderLanding();
  if (page==="auth")    return renderAuth();

  return (
    <div className={darkMode?"dark":""}>
      <div className="min-h-screen bg-background text-foreground" style={{fontFamily:BODY}}>
        {renderPortalNav()}
        <main>
          {page==="customer-home" && renderCustomerHome()}
          {page==="products"      && renderProducts()}
          {page==="detail"        && renderDetail()}
          {page==="cart"          && renderCart()}
          {page==="checkout"      && renderCheckout()}
          {page==="confirmed"     && renderConfirmed()}
          {page==="customer-dash" && renderCustomerDash()}
          {page==="vendor-dash"   && renderVendorDash()}
          {page==="admin-dash"    && renderAdminDash()}
        </main>
      </div>
    </div>
  );
}
