/**
 * POLERA STORE — Modern T-Shirt E-Commerce
 * ==========================================
 * Stack: React (hooks), Tailwind (CDN), CSS-in-JS via inline styles
 * Architecture: Context API for cart state, modular component structure
 * Ready for: Stripe integration, REST/GraphQL API, Auth, CMS
 *
 * Components:
 *  - App (router state)
 *  - CartContext (global state)
 *  - Navbar
 *  - HomePage (banner + featured + categories)
 *  - StorePage (grid + filters)
 *  - ProductDetailPage
 *  - CartDrawer
 *  - Footer
 *
 * Mock data lives in /data/products.js (inline here for portability)
 * To connect a real backend, replace `MOCK_PRODUCTS` with an API fetch.
 */

import { useState, useContext, createContext, useReducer, useCallback, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const T = {
  black:   "#0A0A0A",
  white:   "#FAFAFA",
  offWhite:"#F4F1EC",
  sand:    "#E8E2D7",
  stone:   "#C2BAA8",
  muted:   "#8A8275",
  accent:  "#C8461A",   // terracotta — brand accent
  accentL: "#E8825E",
  accentD: "#8C2E0C",
  dark:    "#1A1714",
  cardBg:  "#FFFFFF",
  borderL: "#E8E2D7",
  success: "#2D7A4F",
};

const FONT = {
  display: "'Playfair Display', Georgia, serif",
  body:    "'DM Sans', system-ui, sans-serif",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: ${FONT.body}; background: ${T.offWhite}; color: ${T.black}; }
  button { cursor: pointer; border: none; background: none; font-family: inherit; }
  input, select { font-family: inherit; }
  a { text-decoration: none; color: inherit; }
  img { display: block; max-width: 100%; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${T.offWhite}; }
  ::-webkit-scrollbar-thumb { background: ${T.stone}; border-radius: 3px; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  @keyframes pulse {
    0%,100% { transform: scale(1); }
    50%      { transform: scale(1.08); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }

  .fade-up   { animation: fadeUp   0.55s ease both; }
  .fade-in   { animation: fadeIn   0.4s  ease both; }
  .slide-in  { animation: slideInRight 0.38s cubic-bezier(.22,.68,0,1.2) both; }

  /* Product card hover */
  .product-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
  .product-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }
  .product-card:hover .card-img { transform: scale(1.04); }
  .card-img { transition: transform 0.4s ease; }

  /* Btn hover */
  .btn-primary { transition: background 0.2s, transform 0.15s; }
  .btn-primary:hover { background: ${T.accentD} !important; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-outline { transition: background 0.2s, color 0.2s, transform 0.15s; }
  .btn-outline:hover { background: ${T.black} !important; color: ${T.white} !important; transform: translateY(-1px); }

  /* Nav link underline */
  .nav-link { position: relative; }
  .nav-link::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 1.5px; background: ${T.accent}; transition: width 0.25s ease; }
  .nav-link:hover::after, .nav-link.active::after { width: 100%; }

  /* Filter pill */
  .filter-pill { transition: background 0.18s, color 0.18s, border-color 0.18s; }
  .filter-pill:hover { border-color: ${T.accent}; color: ${T.accent}; }
  .filter-pill.active-pill { background: ${T.accent}; color: ${T.white}; border-color: ${T.accent}; }

  /* Size btn */
  .size-btn { transition: background 0.15s, color 0.15s, border-color 0.15s; }
  .size-btn:hover { border-color: ${T.black}; }
  .size-btn.selected-size { background: ${T.black}; color: ${T.white}; border-color: ${T.black}; }

  /* Color swatch */
  .color-swatch { transition: box-shadow 0.15s; }
  .color-swatch.selected-color { box-shadow: 0 0 0 3px ${T.white}, 0 0 0 5px ${T.black}; }

  /* Cart item */
  .cart-item { transition: background 0.2s; }
  .cart-item:hover { background: ${T.offWhite}; }

  /* overlay */
  .overlay { animation: fadeIn 0.25s ease both; }

  /* tag badge */
  .badge-new { background: ${T.accent}; color: ${T.white}; }
  .badge-sale { background: ${T.black}; color: ${T.white}; }

  /* Qty control */
  .qty-btn { transition: background 0.15s; }
  .qty-btn:hover { background: ${T.sand}; }

  /* Search input */
  .search-input:focus { outline: none; border-color: ${T.accent}; }

  /* Mobile hamburger */
  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
  }
  @media (min-width: 769px) {
    .mobile-menu-btn { display: none !important; }
    .mobile-nav { display: none !important; }
  }
`;

// ─────────────────────────────────────────────
// MOCK DATA — Replace with API fetch
// ─────────────────────────────────────────────
const COLORS_MAP = {
  "Blanco":    "#F5F5F5",
  "Negro":     "#1A1A1A",
  "Arena":     "#D4C5A9",
  "Terracota": "#C8461A",
  "Verde":     "#4A7C59",
  "Marino":    "#2C3E6B",
  "Gris":      "#8A8A8A",
  "Celeste":   "#7EB8D4",
};

const MOCK_PRODUCTS = [
  {
    id: "p001",
    name: "Esencial Clásica",
    category: "Básicas",
    price: 24990,
    originalPrice: null,
    colors: ["Blanco","Negro","Arena","Gris"],
    sizes: ["XS","S","M","L","XL","XXL"],
    tag: "nuevo",
    rating: 4.8,
    reviews: 124,
    description: "La base perfecta de cualquier guardarropa. Confeccionada en 100% algodón pima peruano de 200gsm, con corte unisex ligeramente oversized y costuras reforzadas. Suave, duradera y que mejora con cada lavado.",
    details: ["100% Algodón Pima Peruano","200 GSM","Corte Unisex Oversized","Costura Triple Reforzada","Libre de sustancias nocivas (OEKO-TEX)"],
    image: null,
    emoji: "🤍",
  },
  {
    id: "p002",
    name: "Vintage Washed",
    category: "Premium",
    price: 34990,
    originalPrice: 39990,
    colors: ["Terracota","Arena","Verde","Marino"],
    sizes: ["XS","S","M","L","XL"],
    tag: "sale",
    rating: 4.9,
    reviews: 89,
    description: "Teñida a mano con técnica acid-wash artesanal. Cada polera es única — pequeñas variaciones de color son parte del proceso. Tela heavyweight 320gsm para ese look desgastado premium.",
    details: ["100% Algodón Heavyweight 320gsm","Acid-Wash Artesanal","Cada pieza es única","Corte Boxy"],
    image: null,
    emoji: "🧡",
  },
  {
    id: "p003",
    name: "Minimal Graphic",
    category: "Gráficas",
    price: 29990,
    originalPrice: null,
    colors: ["Negro","Blanco","Marino"],
    sizes: ["S","M","L","XL","XXL"],
    tag: "nuevo",
    rating: 4.7,
    reviews: 56,
    description: "Gráfica minimalista impresa con tintas al agua libres de plástico. El diseño está inspirado en la topografía de los Andes. Impresión DTF premium que no craquea ni se desprende.",
    details: ["Tela 220gsm Ringspun","Impresión DTF Premium","Tintas al agua","Gráfica Andes Topográfico"],
    image: null,
    emoji: "⛰️",
  },
  {
    id: "p004",
    name: "Essential Pocket",
    category: "Básicas",
    price: 21990,
    originalPrice: null,
    colors: ["Blanco","Celeste","Verde","Gris"],
    sizes: ["XS","S","M","L","XL"],
    tag: null,
    rating: 4.6,
    reviews: 203,
    description: "El clásico con bolsillo. Un detalle funcional que cambia todo. Corte regular fit, perfecta para el día a día. El bolsillo es ligeramente más oscuro que la tela para un look diferenciado.",
    details: ["100% Algodón 180gsm","Bolsillo Frontal","Corte Regular Fit","Cuello redondo reforzado"],
    image: null,
    emoji: "💙",
  },
  {
    id: "p005",
    name: "Oversized Statement",
    category: "Premium",
    price: 39990,
    originalPrice: null,
    colors: ["Negro","Arena","Terracota"],
    sizes: ["S","M","L","XL","XXL"],
    tag: "nuevo",
    rating: 5.0,
    reviews: 34,
    description: "El oversized que realmente funciona. Patrón desarrollado especialmente para no perder estructura al ser grande. Mangas caídas con el largo justo, largo al muslo, y una sutil textura slub que le da profundidad.",
    details: ["Algodón Slub 260gsm","Corte Oversized Estructurado","Largo Extended al muslo","Costura visible decorativa"],
    image: null,
    emoji: "🖤",
  },
  {
    id: "p006",
    name: "Longline Zen",
    category: "Gráficas",
    price: 32990,
    originalPrice: 38990,
    colors: ["Negro","Blanco","Marino"],
    sizes: ["XS","S","M","L","XL"],
    tag: "sale",
    rating: 4.8,
    reviews: 71,
    description: "Corte longline con abertura lateral. Impresión de caligrafía japonesa en la espalda. Una pieza que funciona sola o en capas. Tela ultra-suave con caída natural.",
    details: ["Mezcla Algodón-Modal 50/50","Caída Natural Fluida","Impresión Caligrafía Reversa","Corte Longline con Split Lateral"],
    image: null,
    emoji: "🎋",
  },
  {
    id: "p007",
    name: "Surf Culture",
    category: "Gráficas",
    price: 27990,
    originalPrice: null,
    colors: ["Celeste","Arena","Blanco"],
    sizes: ["S","M","L","XL"],
    tag: null,
    rating: 4.7,
    reviews: 48,
    description: "Inspirada en la cultura costera sudamericana. Gráfica de ola minimalista en el pecho izquierdo. Tela ligera, perfecta para el calor y la playa.",
    details: ["Algodón Ligero 160gsm","Gráfica Serigráfica","Corte Regular","Tejido Transpirable"],
    image: null,
    emoji: "🌊",
  },
  {
    id: "p008",
    name: "Ribbed Crop",
    category: "Premium",
    price: 28990,
    originalPrice: null,
    colors: ["Blanco","Gris","Terracota","Negro"],
    sizes: ["XS","S","M","L"],
    tag: "nuevo",
    rating: 4.9,
    reviews: 92,
    description: "Polera crop en tejido acanalado (ribbed). La textura añade dimensión y el corte ligeramente ceñido realza la silueta. Perfecta para usar sola o con un overshirt abierto.",
    details: ["Algodón Acanalado Ribbed","Corte Crop Ligeramente Ceñido","Cuello redondo elástico","Colores neutros permanentes"],
    image: null,
    emoji: "✨",
  },
];

const CATEGORIES = ["Todas", "Básicas", "Premium", "Gráficas"];
const SIZES_ALL  = ["XS","S","M","L","XL","XXL"];
const PRICE_RANGES = [
  { label: "Todos", min: 0, max: Infinity },
  { label: "Hasta $25.000", min: 0, max: 25000 },
  { label: "$25.000–$35.000", min: 25000, max: 35000 },
  { label: "$35.000+", min: 35000, max: Infinity },
];

// ─────────────────────────────────────────────
// CART CONTEXT
// ─────────────────────────────────────────────
const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const key = `${action.product.id}-${action.color}-${action.size}`;
      const existing = state.items.find(i => i.key === key);
      if (existing) {
        return { ...state, items: state.items.map(i => i.key === key ? { ...i, qty: i.qty + action.qty } : i) };
      }
      return { ...state, items: [...state.items, { key, product: action.product, color: action.color, size: action.size, qty: action.qty }] };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter(i => i.key !== action.key) };
    case "UPDATE_QTY":
      return { ...state, items: state.items.map(i => i.key === action.key ? { ...i, qty: Math.max(1, action.qty) } : i) };
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const addToCart = useCallback((product, color, size, qty = 1) => {
    dispatch({ type: "ADD", product, color, size, qty });
    setNotification(`${product.name} agregado al carrito`);
    setTimeout(() => setNotification(null), 2500);
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((key) => dispatch({ type: "REMOVE", key }), []);
  const updateQty = useCallback((key, qty) => dispatch({ type: "UPDATE_QTY", key, qty }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const total = state.items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const count = state.items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items: state.items, addToCart, removeFromCart, updateQty, clearCart, total, count, isOpen, setIsOpen, notification }}>
      {children}
    </CartContext.Provider>
  );
}

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────
function formatPrice(n) {
  return `$${n.toLocaleString("es-CL")}`;
}

function StarRating({ rating, reviews }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
      <div style={{ display:"flex", gap:1 }}>
        {[1,2,3,4,5].map(s => (
          <span key={s} style={{ fontSize:12, color: s <= Math.round(rating) ? "#E8A020" : T.stone }}>★</span>
        ))}
      </div>
      <span style={{ fontSize:12, color:T.muted }}>({reviews})</span>
    </div>
  );
}

// Product color placeholder (since we don't have real images)
function ProductVisual({ product, color = null, size = "full" }) {
  const bg = color ? COLORS_MAP[color] : COLORS_MAP[product.colors[0]];
  const dim = size === "full" ? { width:"100%", paddingBottom:"120%" } : { width:64, height:64, paddingBottom:0 };
  return (
    <div style={{ ...dim, background: bg || "#E8E2D7", display:"flex", alignItems:"center", justifyContent:"center", position: size==="full" ? "relative" : "static", borderRadius: size==="full" ? 0 : 8, flexShrink:0 }}>
      {size === "full" && (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{ fontSize:64 }}>{product.emoji}</span>
          <span style={{ fontFamily:FONT.display, fontSize:13, color: isLight(bg) ? "#333" : "#eee", letterSpacing:2, textTransform:"uppercase", opacity:0.6 }}>{product.name}</span>
        </div>
      )}
      {size !== "full" && <span style={{ fontSize:28 }}>{product.emoji}</span>}
    </div>
  );
}

function isLight(hex) {
  if (!hex) return true;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (r*299 + g*587 + b*114) / 1000 > 150;
}

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────
function Navbar({ page, setPage }) {
  const { count, setIsOpen } = useContext(CartContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const nav = [
    { label: "Inicio",   page: "home"  },
    { label: "Tienda",   page: "store" },
    { label: "Nosotros", page: "about" },
    { label: "Contacto", page: "contact"},
  ];

  const bgStyle = {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    background: scrolled ? "rgba(250,249,247,0.96)" : "transparent",
    backdropFilter: scrolled ? "blur(10px)" : "none",
    borderBottom: scrolled ? `1px solid ${T.borderL}` : "none",
    transition: "background 0.3s, border 0.3s, backdrop-filter 0.3s",
    padding: "0 5%",
  };

  return (
    <nav style={bgStyle}>
      <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:70 }}>
        {/* Logo */}
        <button onClick={() => setPage("home")} style={{ fontFamily:FONT.display, fontSize:22, fontWeight:700, color:T.black, letterSpacing:-0.5 }}>
          VESTE<span style={{ color:T.accent }}>.</span>
        </button>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display:"flex", gap:32, alignItems:"center" }}>
          {nav.map(n => (
            <button key={n.page} onClick={() => setPage(n.page)}
              className={`nav-link ${page===n.page?"active":""}`}
              style={{ fontSize:14, fontWeight:500, color: page===n.page ? T.accent : T.black, background:"none", letterSpacing:0.3 }}>
              {n.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <button onClick={() => setIsOpen(true)} style={{ position:"relative", padding:8, borderRadius:8, background:"none" }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={T.black} strokeWidth={1.8}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && (
              <span style={{ position:"absolute", top:2, right:2, width:17, height:17, background:T.accent, color:T.white, borderRadius:"50%", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display:"none", flexDirection:"column", gap:5, padding:8 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ display:"block", width:22, height:1.5, background:T.black, transition:"0.3s",
                transform: mobileOpen ? (i===0?"rotate(45deg) translate(4.5px,4.5px)":i===2?"rotate(-45deg) translate(4.5px,-4.5px)":"scaleX(0)") : "none"
              }}/>
            ))}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-nav" style={{ background:"rgba(250,249,247,0.98)", padding:"16px 5% 24px", borderTop:`1px solid ${T.borderL}` }}>
          {nav.map(n => (
            <button key={n.page} onClick={() => { setPage(n.page); setMobileOpen(false); }}
              style={{ display:"block", width:"100%", textAlign:"left", padding:"12px 0", fontSize:18, fontWeight:500, fontFamily:FONT.display, color: page===n.page ? T.accent : T.black, borderBottom:`1px solid ${T.borderL}` }}>
              {n.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─────────────────────────────────────────────
// CART DRAWER
// ─────────────────────────────────────────────
function CartDrawer() {
  const { items, removeFromCart, updateQty, total, count, isOpen, setIsOpen, clearCart } = useContext(CartContext);
  const [checkoutDone, setCheckoutDone] = useState(false);

  const handleCheckout = () => {
    // TODO: integrate Stripe / payment gateway here
    setCheckoutDone(true);
    clearCart();
    setTimeout(() => { setCheckoutDone(false); setIsOpen(false); }, 2800);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={() => setIsOpen(false)}
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:200 }}/>
      <div className="slide-in" style={{ position:"fixed", top:0, right:0, bottom:0, width:"min(440px, 100vw)", background:T.white, zIndex:201, display:"flex", flexDirection:"column", boxShadow:"-8px 0 32px rgba(0,0,0,0.12)" }}>

        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${T.borderL}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2 style={{ fontFamily:FONT.display, fontSize:20, fontWeight:700 }}>Tu Carrito</h2>
            <p style={{ fontSize:13, color:T.muted, marginTop:2 }}>{count} {count===1?"producto":"productos"}</p>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ padding:8, borderRadius:8, background:T.offWhite }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={T.black} strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 24px" }}>
          {checkoutDone && (
            <div className="fade-in" style={{ textAlign:"center", padding:"40px 20px" }}>
              <div style={{ fontSize:56 }}>🎉</div>
              <h3 style={{ fontFamily:FONT.display, fontSize:22, marginTop:16 }}>¡Gracias por tu compra!</h3>
              <p style={{ color:T.muted, marginTop:8, fontSize:14 }}>Recibirás un email de confirmación pronto.</p>
            </div>
          )}
          {!checkoutDone && items.length === 0 && (
            <div style={{ textAlign:"center", padding:"60px 20px", color:T.muted }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🛍️</div>
              <p style={{ fontSize:16, fontFamily:FONT.display }}>Tu carrito está vacío</p>
              <button onClick={() => setIsOpen(false)}
                style={{ marginTop:20, padding:"10px 24px", background:T.accent, color:T.white, borderRadius:8, fontSize:14, fontWeight:600 }}>
                Explorar Tienda
              </button>
            </div>
          )}
          {!checkoutDone && items.map(item => (
            <div key={item.key} className="cart-item" style={{ display:"flex", gap:14, padding:"14px 8px", borderBottom:`1px solid ${T.borderL}`, borderRadius:8 }}>
              <ProductVisual product={item.product} color={item.color} size="sm"/>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:600, fontSize:14 }}>{item.product.name}</p>
                <p style={{ fontSize:12, color:T.muted, marginTop:2 }}>{item.color} · Talla {item.size}</p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10 }}>
                  {/* Qty controls */}
                  <div style={{ display:"flex", alignItems:"center", gap:0, border:`1px solid ${T.borderL}`, borderRadius:8, overflow:"hidden" }}>
                    <button className="qty-btn" onClick={() => item.qty>1 ? updateQty(item.key, item.qty-1) : removeFromCart(item.key)}
                      style={{ width:30, height:30, fontSize:16, color:T.muted }}>−</button>
                    <span style={{ width:28, textAlign:"center", fontSize:14, fontWeight:600 }}>{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.key, item.qty+1)}
                      style={{ width:30, height:30, fontSize:16, color:T.muted }}>+</button>
                  </div>
                  <span style={{ fontWeight:700, fontSize:15 }}>{formatPrice(item.product.price * item.qty)}</span>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.key)} style={{ alignSelf:"flex-start", padding:4, color:T.stone, borderRadius:6 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {!checkoutDone && items.length > 0 && (
          <div style={{ padding:"20px 24px", borderTop:`1px solid ${T.borderL}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ color:T.muted, fontSize:14 }}>Subtotal</span>
              <span style={{ fontWeight:600 }}>{formatPrice(total)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ color:T.muted, fontSize:14 }}>Envío</span>
              <span style={{ color:T.success, fontSize:14, fontWeight:600 }}>{total >= 39990 ? "GRATIS" : formatPrice(3990)}</span>
            </div>
            {total < 39990 && (
              <p style={{ fontSize:12, color:T.muted, marginBottom:8 }}>Agrega {formatPrice(39990 - total)} más para envío gratis</p>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20, paddingTop:12, borderTop:`1px solid ${T.borderL}` }}>
              <span style={{ fontWeight:700, fontSize:16 }}>Total</span>
              <span style={{ fontWeight:800, fontSize:18, color:T.accent }}>{formatPrice(total + (total >= 39990 ? 0 : 3990))}</span>
            </div>
            <button className="btn-primary" onClick={handleCheckout}
              style={{ width:"100%", padding:"15px", background:T.accent, color:T.white, borderRadius:10, fontSize:15, fontWeight:700, letterSpacing:0.5 }}>
              Ir al Checkout →
            </button>
            <p style={{ textAlign:"center", fontSize:11, color:T.muted, marginTop:10 }}>🔒 Pago seguro · Devolución 30 días</p>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// PRODUCT CARD
// ─────────────────────────────────────────────
function ProductCard({ product, onSelect }) {
  const [hovColor, setHovColor] = useState(null);
  return (
    <div className="product-card" style={{ background:T.white, borderRadius:16, overflow:"hidden", cursor:"pointer", border:`1px solid ${T.borderL}` }}
      onClick={() => onSelect(product)}>
      <div style={{ overflow:"hidden", position:"relative" }}>
        <div className="card-img">
          <ProductVisual product={product} color={hovColor} />
        </div>
        {product.tag && (
          <span className={product.tag==="nuevo" ? "badge-new" : "badge-sale"}
            style={{ position:"absolute", top:12, left:12, padding:"4px 10px", borderRadius:20, fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase" }}>
            {product.tag === "nuevo" ? "Nuevo" : "Sale"}
          </span>
        )}
      </div>
      <div style={{ padding:"14px 16px 18px" }}>
        <p style={{ fontSize:11, color:T.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>{product.category}</p>
        <h3 style={{ fontFamily:FONT.display, fontSize:17, fontWeight:700, marginBottom:6 }}>{product.name}</h3>
        <StarRating rating={product.rating} reviews={product.reviews}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
            <span style={{ fontSize:17, fontWeight:800 }}>{formatPrice(product.price)}</span>
            {product.originalPrice && <span style={{ fontSize:13, color:T.muted, textDecoration:"line-through" }}>{formatPrice(product.originalPrice)}</span>}
          </div>
          {/* Color swatches mini */}
          <div style={{ display:"flex", gap:5 }}>
            {product.colors.slice(0,4).map(c => (
              <div key={c} className={`color-swatch`}
                onMouseEnter={() => setHovColor(c)} onMouseLeave={() => setHovColor(null)}
                style={{ width:14, height:14, borderRadius:"50%", background: COLORS_MAP[c]||"#ccc", border:`1px solid rgba(0,0,0,0.12)`, cursor:"pointer" }}
                title={c}/>
            ))}
            {product.colors.length > 4 && <span style={{ fontSize:10, color:T.muted, alignSelf:"center" }}>+{product.colors.length-4}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────
function HomePage({ setPage, setSelectedProduct }) {
  const categories = [
    { name:"Básicas", emoji:"🤍", desc:"El esencial perfecto" },
    { name:"Premium", emoji:"✨", desc:"Calidad sin concesiones" },
    { name:"Gráficas", emoji:"🎨", desc:"Diseño que habla" },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ minHeight:"100vh", background:`linear-gradient(160deg, ${T.dark} 0%, #2C1810 100%)`, display:"flex", alignItems:"center", justifyContent:"center", padding:"100px 5% 60px", position:"relative", overflow:"hidden" }}>
        {/* Background texture */}
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 20% 80%, ${T.accent}22 0%, transparent 50%), radial-gradient(circle at 80% 20%, #C8A46A22 0%, transparent 50%)` }}/>

        <div style={{ maxWidth:720, textAlign:"center", position:"relative" }} className="fade-up">
          <span style={{ fontSize:13, letterSpacing:4, textTransform:"uppercase", color:T.accentL, fontWeight:600, display:"block", marginBottom:24 }}>
            Poleras de Autor · Santiago, Chile
          </span>
          <h1 style={{ fontFamily:FONT.display, fontSize:"clamp(44px, 7vw, 82px)", fontWeight:700, color:T.white, lineHeight:1.05, marginBottom:28 }}>
            Viste con<br/><em style={{ color:T.accentL, fontStyle:"italic" }}>propósito.</em>
          </h1>
          <p style={{ fontSize:18, color:"rgba(255,255,255,0.65)", lineHeight:1.7, maxWidth:520, margin:"0 auto 40px" }}>
            Poleras de calidad premium, confeccionadas en Chile. Diseños que duran, materiales que se sienten. Desde $21.990.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="btn-primary" onClick={() => setPage("store")}
              style={{ padding:"15px 36px", background:T.accent, color:T.white, borderRadius:10, fontSize:15, fontWeight:700, letterSpacing:0.5 }}>
              Ver Colección →
            </button>
            <button className="btn-outline" onClick={() => setPage("about")}
              style={{ padding:"15px 36px", border:`1.5px solid rgba(255,255,255,0.3)`, color:T.white, borderRadius:10, fontSize:15, fontWeight:500 }}>
              Nuestra Historia
            </button>
          </div>
          <div style={{ marginTop:48, display:"flex", justifyContent:"center", gap:32, flexWrap:"wrap" }}>
            {[["500+","Clientes felices"],["100%","Algodón natural"],["30 días","Devolución gratis"]].map(([n,l]) => (
              <div key={n} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:FONT.display, fontSize:26, fontWeight:700, color:T.white }}>{n}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding:"80px 5%", background:T.offWhite }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <h2 style={{ fontFamily:FONT.display, fontSize:36, fontWeight:700, marginBottom:8, textAlign:"center" }}>Nuestras Líneas</h2>
          <p style={{ color:T.muted, textAlign:"center", marginBottom:48, fontSize:15 }}>Tres categorías, un mismo estándar de calidad.</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:24 }}>
            {categories.map((c, i) => (
              <button key={c.name} onClick={() => setPage("store")}
                style={{ background:i===1?T.dark:T.white, border:`1px solid ${T.borderL}`, borderRadius:20, padding:"40px 32px", textAlign:"left", cursor:"pointer", transition:"transform 0.25s, box-shadow 0.25s", animationDelay:`${i*0.1}s` }}
                className="product-card fade-up">
                <span style={{ fontSize:44, display:"block", marginBottom:16 }}>{c.emoji}</span>
                <h3 style={{ fontFamily:FONT.display, fontSize:24, fontWeight:700, color:i===1?T.white:T.black, marginBottom:6 }}>{c.name}</h3>
                <p style={{ fontSize:14, color:i===1?"rgba(255,255,255,0.55)":T.muted, marginBottom:20 }}>{c.desc}</p>
                <span style={{ fontSize:13, fontWeight:700, color:i===1?T.accentL:T.accent, letterSpacing:0.5 }}>Explorar →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section style={{ padding:"80px 5%", background:T.white }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:40, flexWrap:"wrap", gap:16 }}>
            <div>
              <h2 style={{ fontFamily:FONT.display, fontSize:36, fontWeight:700 }}>Destacados</h2>
              <p style={{ color:T.muted, marginTop:6 }}>Lo más nuevo y lo más amado.</p>
            </div>
            <button className="btn-outline" onClick={() => setPage("store")}
              style={{ padding:"11px 24px", border:`1.5px solid ${T.black}`, borderRadius:8, fontSize:14, fontWeight:600 }}>
              Ver todo
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:24 }}>
            {MOCK_PRODUCTS.filter(p => p.tag === "nuevo").slice(0,4).map(p => (
              <ProductCard key={p.id} product={p} onSelect={prod => { setSelectedProduct(prod); setPage("product"); }}/>
            ))}
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <section style={{ padding:"80px 5%", background:`linear-gradient(135deg, ${T.accent}, ${T.accentD})` }}>
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontFamily:FONT.display, fontSize:38, fontWeight:700, color:T.white, marginBottom:16 }}>Envío gratis sobre $39.990</h2>
          <p style={{ color:"rgba(255,255,255,0.8)", fontSize:16, marginBottom:32 }}>A todo Chile. Despacho en 2–4 días hábiles. Devolución gratuita en 30 días.</p>
          <button className="btn-outline" onClick={() => setPage("store")}
            style={{ padding:"15px 40px", border:`2px solid white`, color:T.white, borderRadius:10, fontSize:16, fontWeight:700, letterSpacing:0.5 }}>
            Comprar Ahora
          </button>
        </div>
      </section>

      {/* Social proof */}
      <section style={{ padding:"80px 5%", background:T.offWhite }}>
        <div style={{ maxWidth:1280, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontFamily:FONT.display, fontSize:32, fontWeight:700, marginBottom:48 }}>Lo que dicen nuestros clientes</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:24 }}>
            {[
              { name:"Catalina M.", loc:"Santiago", text:"La calidad es increíble. La lavé 20 veces y sigue igual. No vuelvo a comprar poleras en otro lugar.", rating:5, prod:"Esencial Clásica" },
              { name:"Rodrigo S.", loc:"Valparaíso", text:"El oversized es perfecto. No es esa típica talla grande disfrazada de oversized, es realmente bien cortada.", rating:5, prod:"Oversized Statement" },
              { name:"Valentina K.", loc:"Concepción", text:"Llegó en 3 días, el empaque es hermoso. Regale una y mi amiga ya quiere pedirse otras.", rating:5, prod:"Vintage Washed" },
            ].map((r,i) => (
              <div key={i} style={{ background:T.white, border:`1px solid ${T.borderL}`, borderRadius:16, padding:"28px 24px", textAlign:"left" }}>
                <div style={{ display:"flex", marginBottom:12 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color:"#E8A020", fontSize:14 }}>★</span>)}
                </div>
                <p style={{ fontSize:15, lineHeight:1.65, color:T.dark, marginBottom:16 }}>"{r.text}"</p>
                <div>
                  <p style={{ fontWeight:700, fontSize:14 }}>{r.name}</p>
                  <p style={{ fontSize:12, color:T.muted }}>{r.loc} · compró {r.prod}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// STORE PAGE
// ─────────────────────────────────────────────
function StorePage({ setPage, setSelectedProduct }) {
  const [catFilter, setCatFilter] = useState("Todas");
  const [sizeFilter, setSizeFilter] = useState(null);
  const [priceFilter, setPriceFilter] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");

  const filtered = MOCK_PRODUCTS
    .filter(p => catFilter === "Todas" || p.category === catFilter)
    .filter(p => !sizeFilter || p.sizes.includes(sizeFilter))
    .filter(p => p.price >= PRICE_RANGES[priceFilter].min && p.price <= PRICE_RANGES[priceFilter].max)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div style={{ paddingTop:80 }}>
      {/* Header */}
      <div style={{ background:T.dark, padding:"48px 5% 40px", textAlign:"center" }}>
        <h1 style={{ fontFamily:FONT.display, fontSize:42, fontWeight:700, color:T.white, marginBottom:8 }}>Nuestra Tienda</h1>
        <p style={{ color:"rgba(255,255,255,0.55)", fontSize:15 }}>{MOCK_PRODUCTS.length} productos · Envío gratis sobre $39.990</p>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"32px 5%" }}>
        {/* Search + Sort */}
        <div style={{ display:"flex", gap:12, marginBottom:28, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:240, position:"relative" }}>
            <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.stone} strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input className="search-input" placeholder="Buscar poleras..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width:"100%", padding:"11px 12px 11px 38px", border:`1.5px solid ${T.borderL}`, borderRadius:10, fontSize:14, background:T.white, color:T.black }}/>
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding:"11px 16px", border:`1.5px solid ${T.borderL}`, borderRadius:10, fontSize:14, background:T.white, color:T.black, cursor:"pointer" }}>
            <option value="featured">Destacados</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="rating">Mejor valorados</option>
          </select>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:20, marginBottom:32, flexWrap:"wrap" }}>
          {/* Category */}
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:T.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Categoría</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {CATEGORIES.map(c => (
                <button key={c} className={`filter-pill ${catFilter===c?"active-pill":""}`} onClick={() => setCatFilter(c)}
                  style={{ padding:"7px 16px", border:`1.5px solid ${catFilter===c?T.accent:T.borderL}`, borderRadius:20, fontSize:13, fontWeight:500, background: catFilter===c?T.accent:T.white, color: catFilter===c?T.white:T.black }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:T.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Talla</p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {SIZES_ALL.map(s => (
                <button key={s} className={`filter-pill ${sizeFilter===s?"active-pill":""}`} onClick={() => setSizeFilter(sizeFilter===s?null:s)}
                  style={{ width:42, height:38, border:`1.5px solid ${sizeFilter===s?T.accent:T.borderL}`, borderRadius:8, fontSize:12, fontWeight:600, background: sizeFilter===s?T.accent:T.white, color: sizeFilter===s?T.white:T.black }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <p style={{ fontSize:12, fontWeight:600, color:T.muted, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Precio</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {PRICE_RANGES.map((r,i) => (
                <button key={r.label} className={`filter-pill ${priceFilter===i?"active-pill":""}`} onClick={() => setPriceFilter(i)}
                  style={{ padding:"7px 14px", border:`1.5px solid ${priceFilter===i?T.accent:T.borderL}`, borderRadius:20, fontSize:12, fontWeight:500, background: priceFilter===i?T.accent:T.white, color: priceFilter===i?T.white:T.black }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p style={{ color:T.muted, fontSize:14, marginBottom:24 }}>
          {filtered.length} {filtered.length===1?"producto":"productos"} encontrados
          {(catFilter!=="Todas"||sizeFilter||priceFilter>0||search) && (
            <button onClick={() => { setCatFilter("Todas"); setSizeFilter(null); setPriceFilter(0); setSearch(""); }}
              style={{ marginLeft:12, color:T.accent, fontWeight:600, fontSize:14 }}>
              × Limpiar filtros
            </button>
          )}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:T.muted }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <p style={{ fontFamily:FONT.display, fontSize:20 }}>No encontramos resultados</p>
            <p style={{ fontSize:14, marginTop:8 }}>Intenta ajustando los filtros</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:24 }} className="fade-in">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onSelect={prod => { setSelectedProduct(prod); setPage("product"); }}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PRODUCT DETAIL PAGE
// ─────────────────────────────────────────────
function ProductDetailPage({ product, setPage }) {
  const { addToCart } = useContext(CartContext);
  const [selColor, setSelColor] = useState(product.colors[0]);
  const [selSize, setSelSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!selSize) { setSizeError(true); return; }
    setSizeError(false);
    addToCart(product, selColor, selSize, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product.originalPrice ? Math.round((1 - product.price/product.originalPrice)*100) : null;

  return (
    <div style={{ paddingTop:80, background:T.white, minHeight:"100vh" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 5%" }}>
        {/* Breadcrumb */}
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:32, fontSize:13, color:T.muted }}>
          <button onClick={() => setPage("home")} style={{ color:T.muted }}>Inicio</button>
          <span>/</span>
          <button onClick={() => setPage("store")} style={{ color:T.muted }}>Tienda</button>
          <span>/</span>
          <span style={{ color:T.black, fontWeight:600 }}>{product.name}</span>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60 }} className="fade-in">
          {/* Left: Images */}
          <div>
            <div style={{ borderRadius:20, overflow:"hidden", border:`1px solid ${T.borderL}` }}>
              <ProductVisual product={product} color={selColor}/>
            </div>
            {/* Thumb colors */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10, marginTop:12 }}>
              {product.colors.map(c => (
                <button key={c} onClick={() => setSelColor(c)}
                  style={{ borderRadius:10, overflow:"hidden", border:`2px solid ${selColor===c?T.accent:T.borderL}`, aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", background: COLORS_MAP[c]||"#eee", transition:"border-color 0.2s" }}>
                  <span style={{ fontSize:20 }}>{product.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div>
            <span style={{ fontSize:12, color:T.muted, letterSpacing:1.5, textTransform:"uppercase", fontWeight:600 }}>{product.category}</span>
            <h1 style={{ fontFamily:FONT.display, fontSize:36, fontWeight:700, marginTop:8, marginBottom:10, lineHeight:1.1 }}>{product.name}</h1>
            <StarRating rating={product.rating} reviews={product.reviews}/>

            <div style={{ display:"flex", alignItems:"baseline", gap:12, marginTop:20, marginBottom:24 }}>
              <span style={{ fontFamily:FONT.display, fontSize:32, fontWeight:800 }}>{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span style={{ fontSize:18, color:T.muted, textDecoration:"line-through" }}>{formatPrice(product.originalPrice)}</span>
                  <span style={{ background:T.accent, color:T.white, borderRadius:6, padding:"3px 10px", fontSize:13, fontWeight:700 }}>−{discount}%</span>
                </>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize:15, lineHeight:1.75, color:"#444", marginBottom:28 }}>{product.description}</p>

            {/* Color selector */}
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:13, fontWeight:700, marginBottom:10, letterSpacing:0.5 }}>
                COLOR: <span style={{ color:T.accent }}>{selColor}</span>
              </p>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {product.colors.map(c => (
                  <button key={c} className={`color-swatch ${selColor===c?"selected-color":""}`} onClick={() => setSelColor(c)}
                    style={{ width:36, height:36, borderRadius:"50%", background: COLORS_MAP[c]||"#ccc", border:`1.5px solid rgba(0,0,0,0.12)`, cursor:"pointer" }}
                    title={c}/>
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div style={{ marginBottom:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <p style={{ fontSize:13, fontWeight:700, letterSpacing:0.5 }}>TALLA {sizeError && <span style={{ color:"#c0392b", fontSize:12, fontWeight:400 }}>— Por favor elige una talla</span>}</p>
                <button style={{ fontSize:12, color:T.muted, textDecoration:"underline" }}>Guía de tallas</button>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {product.sizes.map(s => (
                  <button key={s} className={`size-btn ${selSize===s?"selected-size":""}`} onClick={() => { setSelSize(s); setSizeError(false); }}
                    style={{ width:52, height:44, border:`1.5px solid ${selSize===s?T.black:sizeError?T.accent:T.borderL}`, borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", background: selSize===s?T.black:T.white, color: selSize===s?T.white:T.black }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Add */}
            <div style={{ display:"flex", gap:12, marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", border:`1.5px solid ${T.borderL}`, borderRadius:10, overflow:"hidden" }}>
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1,q-1))} style={{ width:44, height:52, fontSize:18, color:T.muted }}>−</button>
                <span style={{ width:44, textAlign:"center", fontWeight:700, fontSize:16 }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => q+1)} style={{ width:44, height:52, fontSize:18, color:T.muted }}>+</button>
              </div>
              <button className="btn-primary" onClick={handleAdd}
                style={{ flex:1, padding:"0 24px", background: added?T.success:T.accent, color:T.white, borderRadius:10, fontSize:15, fontWeight:700, letterSpacing:0.3, transition:"background 0.3s" }}>
                {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display:"flex", gap:16, padding:"16px", background:T.offWhite, borderRadius:12, flexWrap:"wrap" }}>
              {[["🚚","Envío gratis +$39.990"],["↩️","Cambios 30 días"],["✓","Calidad garantizada"]].map(([e,t]) => (
                <div key={t} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:T.muted }}>
                  <span>{e}</span><span>{t}</span>
                </div>
              ))}
            </div>

            {/* Details */}
            <div style={{ marginTop:28 }}>
              <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12, letterSpacing:0.5, textTransform:"uppercase" }}>Detalles del Producto</h3>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:6 }}>
                {product.details.map(d => (
                  <li key={d} style={{ fontSize:14, color:"#555", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ color:T.accent, fontWeight:700 }}>—</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Related products */}
        <div style={{ marginTop:72 }}>
          <h2 style={{ fontFamily:FONT.display, fontSize:28, fontWeight:700, marginBottom:32 }}>También te puede gustar</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:20 }}>
            {MOCK_PRODUCTS.filter(p => p.id !== product.id && p.category === product.category).slice(0,4).map(p => (
              <ProductCard key={p.id} product={p} onSelect={prod => { setPage("product"); window.scrollTo(0,0); }}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ABOUT PAGE (simple)
// ─────────────────────────────────────────────
function AboutPage({ setPage }) {
  return (
    <div style={{ paddingTop:80 }}>
      <div style={{ background:T.dark, padding:"60px 5%", textAlign:"center" }}>
        <h1 style={{ fontFamily:FONT.display, fontSize:48, color:T.white, marginBottom:12 }}>Nuestra <em style={{ color:T.accentL, fontStyle:"italic" }}>Historia</em></h1>
        <p style={{ color:"rgba(255,255,255,0.55)", maxWidth:600, margin:"0 auto", fontSize:15, lineHeight:1.7 }}>
          VESTE nació en Santiago con una idea simple: las poleras básicas no tenían por qué ser aburridas.
        </p>
      </div>
      <div style={{ maxWidth:780, margin:"0 auto", padding:"60px 5%" }}>
        {[
          { title:"El origen", text:"Empezamos en 2022 frustrados con la calidad de las poleras chilenas. O eran caras y mal diseñadas, o baratas y se destruían al tercer lavado. Decidimos hacer las cosas diferente." },
          { title:"El proceso", text:"Trabajamos directamente con productores de algodón pima en Perú y proveedores de telas en Chile. Sin intermediarios. Eso nos permite ofrecer calidad premium a precios honestos." },
          { title:"El equipo", text:"Somos un equipo pequeño de diseñadores, textileros y emprendedores. Revisamos cada lote personalmente. Cada polera que llega a tus manos pasó por las nuestras." },
        ].map(s => (
          <div key={s.title} style={{ marginBottom:48 }}>
            <h2 style={{ fontFamily:FONT.display, fontSize:28, fontWeight:700, marginBottom:12, color:T.accent }}>{s.title}</h2>
            <p style={{ fontSize:16, lineHeight:1.8, color:"#444" }}>{s.text}</p>
          </div>
        ))}
        <button className="btn-primary" onClick={() => setPage("store")}
          style={{ padding:"14px 36px", background:T.accent, color:T.white, borderRadius:10, fontSize:15, fontWeight:700 }}>
          Ver Colección →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CONTACT PAGE
// ─────────────────────────────────────────────
function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", message:"" });

  const handleSubmit = () => {
    // TODO: connect to email API / form backend
    if (form.name && form.email && form.message) { setSent(true); }
  };

  return (
    <div style={{ paddingTop:80 }}>
      <div style={{ background:T.dark, padding:"60px 5%", textAlign:"center" }}>
        <h1 style={{ fontFamily:FONT.display, fontSize:48, color:T.white }}>Contacto</h1>
      </div>
      <div style={{ maxWidth:600, margin:"0 auto", padding:"60px 5%" }}>
        {sent ? (
          <div className="fade-in" style={{ textAlign:"center", padding:"40px" }}>
            <div style={{ fontSize:56 }}>✉️</div>
            <h2 style={{ fontFamily:FONT.display, fontSize:28, margin:"20px 0 10px" }}>Mensaje recibido</h2>
            <p style={{ color:T.muted }}>Te responderemos dentro de 24 horas hábiles.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Nombre</label>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                style={{ width:"100%", padding:"12px 16px", border:`1.5px solid ${T.borderL}`, borderRadius:10, fontSize:14 }} placeholder="Tu nombre"/>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}
                style={{ width:"100%", padding:"12px 16px", border:`1.5px solid ${T.borderL}`, borderRadius:10, fontSize:14 }} placeholder="tu@email.com"/>
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:6 }}>Mensaje</label>
              <textarea value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} rows={5}
                style={{ width:"100%", padding:"12px 16px", border:`1.5px solid ${T.borderL}`, borderRadius:10, fontSize:14, resize:"vertical" }} placeholder="¿En qué podemos ayudarte?"/>
            </div>
            <button className="btn-primary" onClick={handleSubmit}
              style={{ padding:"14px", background:T.accent, color:T.white, borderRadius:10, fontSize:15, fontWeight:700 }}>
              Enviar Mensaje
            </button>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:16, color:T.muted, fontSize:14 }}>
              <p>📧 hola@veste.cl</p>
              <p>📱 Instagram: @veste.cl</p>
              <p>📍 Santiago, Chile</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ background:T.dark, color:"rgba(255,255,255,0.7)", padding:"60px 5% 30px" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:40, marginBottom:48 }}>
          <div>
            <button onClick={() => setPage("home")} style={{ fontFamily:FONT.display, fontSize:24, fontWeight:700, color:T.white, marginBottom:12, display:"block" }}>
              VESTE<span style={{ color:T.accent }}>.</span>
            </button>
            <p style={{ fontSize:14, lineHeight:1.7 }}>Poleras de calidad premium, hechas para durar. Santiago, Chile.</p>
            <div style={{ display:"flex", gap:14, marginTop:20 }}>
              {["IG","TK","FB"].map(s => (
                <div key={s} style={{ width:36, height:36, border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.6)", cursor:"pointer" }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize:13, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:T.white, marginBottom:16 }}>Tienda</h3>
            {["Básicas","Premium","Gráficas","Novedades","Sale"].map(l => (
              <button key={l} onClick={() => setPage("store")} style={{ display:"block", fontSize:14, marginBottom:8, color:"rgba(255,255,255,0.6)", textAlign:"left" }}>{l}</button>
            ))}
          </div>
          <div>
            <h3 style={{ fontSize:13, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:T.white, marginBottom:16 }}>Ayuda</h3>
            {["Guía de tallas","Envíos","Cambios y devoluciones","Cuidado de la prenda","FAQ"].map(l => (
              <button key={l} style={{ display:"block", fontSize:14, marginBottom:8, color:"rgba(255,255,255,0.6)", textAlign:"left" }}>{l}</button>
            ))}
          </div>
          <div>
            <h3 style={{ fontSize:13, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:T.white, marginBottom:16 }}>Contacto</h3>
            <p style={{ fontSize:14, marginBottom:8 }}>hola@veste.cl</p>
            <p style={{ fontSize:14, marginBottom:8 }}>@veste.cl</p>
            <p style={{ fontSize:14 }}>Lunes–Viernes 9:00–18:00</p>
            <button onClick={() => setPage("contact")}
              style={{ marginTop:20, padding:"10px 20px", border:"1px solid rgba(255,255,255,0.3)", borderRadius:8, fontSize:13, color:"rgba(255,255,255,0.8)" }}>
              Enviar mensaje
            </button>
          </div>
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <p style={{ fontSize:13 }}>© 2025 VESTE. Todos los derechos reservados.</p>
          <div style={{ display:"flex", gap:20 }}>
            {["Privacidad","Términos","Cookies"].map(l => (
              <button key={l} style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// NOTIFICATION TOAST
// ─────────────────────────────────────────────
function Toast() {
  const { notification } = useContext(CartContext);
  if (!notification) return null;
  return (
    <div className="slide-in" style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:T.dark, color:T.white, padding:"14px 24px", borderRadius:12, fontSize:14, fontWeight:600, zIndex:300, boxShadow:"0 8px 32px rgba(0,0,0,0.25)", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ color:T.success }}>✓</span> {notification}
    </div>
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (page) {
      case "home":    return <HomePage setPage={navigate} setSelectedProduct={setSelectedProduct}/>;
      case "store":   return <StorePage setPage={navigate} setSelectedProduct={setSelectedProduct}/>;
      case "product": return selectedProduct ? <ProductDetailPage product={selectedProduct} setPage={navigate}/> : <StorePage setPage={navigate} setSelectedProduct={setSelectedProduct}/>;
      case "about":   return <AboutPage setPage={navigate}/>;
      case "contact": return <ContactPage/>;
      default:        return <HomePage setPage={navigate} setSelectedProduct={setSelectedProduct}/>;
    }
  };

  return (
    <CartProvider>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <Navbar page={page} setPage={navigate}/>
        <main style={{ flex:1 }}>
          {renderPage()}
        </main>
        <Footer setPage={navigate}/>
        <CartDrawer/>
        <Toast/>
      </div>
    </CartProvider>
  );
}
