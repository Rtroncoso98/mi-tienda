import { useState, useContext, createContext, useReducer, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const T = {
  black:   "#0A0A0A",
  white:   "#FFFFFF",
  offWhite:"#F7F5F2",
  sand:    "#EDE8E0",
  stone:   "#C2BAA8",
  muted:   "#7A7468",
  accent:  "#1A1A1A",       // negro puro como acento principal
  accentL: "#444444",
  accentD: "#000000",
  lime:    "#C8F04A",       // verde lima — acento vibrante gym
  limeD:   "#A8CC30",
  dark:    "#111111",
  darker:  "#080808",
  cardBg:  "#FFFFFF",
  borderL: "#E4E0D8",
  success: "#2D7A4F",
  tag:     "#C8F04A",
};

const FONT = {
  display: "'Bebas Neue', 'Anton', Impact, sans-serif",
  body:    "'DM Sans', system-ui, sans-serif",
  accent:  "'Playfair Display', Georgia, serif",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital@1&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: ${FONT.body}; background: ${T.offWhite}; color: ${T.black}; }
  button { cursor: pointer; border: none; background: none; font-family: inherit; }
  input, select { font-family: inherit; }
  a { text-decoration: none; color: inherit; }
  img { display: block; max-width: 100%; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${T.offWhite}; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideInRight {
    from { transform: translateX(110%); }
    to   { transform: translateX(0); }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes glowPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(200,240,74,0); }
    50%      { box-shadow: 0 0 20px 4px rgba(200,240,74,0.35); }
  }

  .fade-up  { animation: fadeUp  0.6s cubic-bezier(.16,1,.3,1) both; }
  .fade-in  { animation: fadeIn  0.4s ease both; }
  .slide-in { animation: slideInRight 0.4s cubic-bezier(.16,1,.3,1) both; }

  .product-card { transition: transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s ease; }
  .product-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.13); }
  .product-card:hover .card-img { transform: scale(1.05); }
  .card-img { transition: transform 0.5s cubic-bezier(.16,1,.3,1); }

  .btn-lime { transition: background 0.2s, transform 0.15s, box-shadow 0.2s; }
  .btn-lime:hover { background: ${T.limeD} !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,240,74,0.4); }
  .btn-lime:active { transform: translateY(0); }

  .btn-dark { transition: background 0.2s, transform 0.15s; }
  .btn-dark:hover { background: #333 !important; transform: translateY(-2px); }

  .btn-outline-w { transition: background 0.2s, color 0.2s, transform 0.15s; }
  .btn-outline-w:hover { background: white !important; color: black !important; transform: translateY(-2px); }

  .nav-link { position: relative; }
  .nav-link::after { content: ''; position: absolute; bottom: -3px; left: 0; width: 0; height: 2px; background: ${T.lime}; transition: width 0.25s ease; }
  .nav-link:hover::after, .nav-link.active::after { width: 100%; }

  .filter-pill { transition: all 0.18s; }
  .filter-pill:hover { border-color: ${T.black}; }
  .filter-pill.active-pill { background: ${T.black}; color: ${T.white}; border-color: ${T.black}; }

  .size-btn { transition: all 0.15s; }
  .size-btn:hover { border-color: ${T.black}; background: ${T.sand}; }
  .size-btn.selected-size { background: ${T.black}; color: ${T.white}; border-color: ${T.black}; }

  .color-swatch { transition: box-shadow 0.15s, transform 0.15s; }
  .color-swatch:hover { transform: scale(1.15); }
  .color-swatch.selected-color { box-shadow: 0 0 0 3px ${T.white}, 0 0 0 5px ${T.black}; }

  .cart-item:hover { background: ${T.offWhite}; }
  .overlay { animation: fadeIn 0.25s ease both; }

  .qty-btn:hover { background: ${T.sand}; }
  .search-input:focus { outline: none; border-color: ${T.black}; }
  .promo-card { animation: glowPulse 2.5s ease-in-out infinite; }

  .marquee-track { display: flex; animation: marquee 18s linear infinite; white-space: nowrap; }
  .marquee-track:hover { animation-play-state: paused; }

  @media (max-width: 768px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
    .two-col { grid-template-columns: 1fr !important; }
  }
  @media (min-width: 769px) {
    .mobile-menu-btn { display: none !important; }
    .mobile-nav { display: none !important; }
  }
`;

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const COLORS_MAP = {
  "Negro":  "#1A1A1A",
  "Blanco": "#F5F5F5",
  "Gris":   "#8A8A8A",
  "Café":   "#7B5B3A",
};

const BUZO_COLORS_MAP = {
  "Negro": "#1A1A1A",
  "Gris":  "#8A8A8A",
};

const MOCK_PRODUCTS = [
  {
    id: "polera-001",
    name: "Polera Oversize",
    type: "Polera",
    price: 11990,
    originalPrice: null,
    promoPrice: 18990,
    promoQty: 2,
    colors: ["Negro","Blanco","Gris","Café"],
    sizes: ["XS","S","M","L","XL","XXL"],
    tag: "nuevo",
    rating: 4.9,
    reviews: 0,
    description: "Diseñada para quien entrena. Corte oversize con caída perfecta — ni muy holgada ni muy ceñida. No importa si estás en tu mejor momento físico o empezando el camino: esta polera te va a quedar increíble y vas a querer ponértela todos los días. 100% algodón, suave al tacto y transpirable.",
    details: ["100% Algodón heavyweight","Corte Oversize / Boxy Fit","Transpirable y cómoda para entrenar","Costuras reforzadas","Disponible en Negro, Blanco, Gris y Café"],
    emoji: "👕",
  },
  {
    id: "buzo-001",
    name: "Buzo Baggy",
    type: "Buzo",
    price: 14990,
    originalPrice: null,
    promoPrice: null,
    promoQty: null,
    colors: ["Negro","Gris"],
    sizes: ["XS","S","M","L","XL","XXL"],
    tag: "nuevo",
    rating: 4.9,
    reviews: 0,
    description: "El buzo que faltaba. Corte baggy recto y ancho — cómodo para entrenar, para descansar, para todo. Diseño limpio y minimalista que se ve impecable. Tela gruesa y suave que abraza sin apretar.",

    details: ["Tela pesada y suave","Corte Baggy recto","Elástico en cintura y puños","Diseño minimalista sin prints","Disponible en Negro y Gris"],
    emoji: "🩳",
  },
];

const CATEGORIES = ["Todos", "Polera", "Buzo"];
const SIZES_ALL = ["XS","S","M","L","XL","XXL"];

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
    case "REMOVE": return { ...state, items: state.items.filter(i => i.key !== action.key) };
    case "UPDATE_QTY": return { ...state, items: state.items.map(i => i.key === action.key ? { ...i, qty: Math.max(1, action.qty) } : i) };
    case "CLEAR": return { ...state, items: [] };
    default: return state;
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const addToCart = useCallback((product, color, size, qty = 1) => {
    dispatch({ type: "ADD", product, color, size, qty });
    setNotification(`${product.name} agregado`);
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
// UTILS
// ─────────────────────────────────────────────
const fmt = n => `$${n.toLocaleString("es-CL")}`;

function isLight(hex) {
  if (!hex) return true;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (r*299 + g*587 + b*114) / 1000 > 150;
}

// Mapeo de imagen por producto Y color
const PRODUCT_IMAGES = {
  "polera-001": {
    "Negro":  "/images/Polera-Negro.png",
    "Blanco": "/images/Polera-Blanco.png",
    "Gris":   "/images/Polera-Gris.png",
    "Café":   "/images/Polera-Cafe.png",
  },
  "buzo-001": {
    "Negro": "/images/Buzo-Negro.png",
    "Gris":  "/images/Buzo-Gris.png",
  },
};

function ProductVisual({ product, color = null, size = "full" }) {
  const map = product.type === "Buzo" ? BUZO_COLORS_MAP : COLORS_MAP;
  const activeColor = color || product.colors[0];
  const bg = map[activeColor] || "#ccc";
  const imgSrc = PRODUCT_IMAGES[product.id]?.[activeColor] || null;

  if (size !== "full") return (
    <div style={{ width:64, height:64, borderRadius:8, overflow:"hidden", flexShrink:0, background:bg }}>
      {imgSrc
        ? <img src={imgSrc} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:26 }}>{product.emoji}</span></div>
      }
    </div>
  );

  return (
    <div style={{ width:"100%", paddingBottom:"115%", position:"relative", background: bg }}>
      {imgSrc ? (
        <img src={imgSrc} alt={`${product.name} ${activeColor}`}
          style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"opacity 0.3s ease" }}/>
      ) : (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
          <span style={{ fontSize:72 }}>{product.emoji}</span>
          <span style={{ fontFamily:FONT.display, fontSize:15, color: isLight(bg)?"rgba(0,0,0,0.3)":"rgba(255,255,255,0.3)", letterSpacing:4, textTransform:"uppercase" }}>
            {product.name}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────
function Navbar({ page, setPage }) {
  const { count, setIsOpen } = useContext(CartContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { label:"Inicio", page:"home" },
    { label:"Tienda", page:"store" },
    { label:"Nosotros", page:"about" },
    { label:"Contacto", page:"contact" },
  ];

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background: scrolled ? "rgba(8,8,8,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "none",
      transition: "all 0.35s ease",
      padding:"0 5%",
    }}>
      <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:68 }}>

        {/* Logo */}
        <button onClick={() => setPage("home")} style={{ display:"flex", alignItems:"baseline", gap:3 }}>
          <span style={{ fontFamily:FONT.display, fontSize:28, letterSpacing:3, color:T.white, lineHeight:1 }}>MACIZOS</span>
          <span style={{ fontFamily:FONT.display, fontSize:28, letterSpacing:3, color:T.lime, lineHeight:1 }}>.</span>
        </button>

        {/* Desktop links */}
        <div className="desktop-nav" style={{ display:"flex", gap:36, alignItems:"center" }}>
          {links.map(l => (
            <button key={l.page} onClick={() => setPage(l.page)}
              className={`nav-link ${page===l.page?"active":""}`}
              style={{ fontSize:13, fontWeight:600, color: page===l.page ? T.lime : "rgba(255,255,255,0.75)", letterSpacing:1.5, textTransform:"uppercase" }}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => setIsOpen(true)} style={{ position:"relative", padding:"8px 10px", borderRadius:8, border:"1px solid rgba(255,255,255,0.15)", background:"rgba(255,255,255,0.05)" }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && (
              <span style={{ position:"absolute", top:-6, right:-6, width:18, height:18, background:T.lime, color:T.black, borderRadius:"50%", fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display:"none", flexDirection:"column", gap:5, padding:8 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ display:"block", width:22, height:1.5, background:"white", transition:"0.3s",
                transform: mobileOpen ? (i===0?"rotate(45deg) translate(4.5px,4.5px)":i===2?"rotate(-45deg) translate(4.5px,-4.5px)":"scaleX(0)") : "none"
              }}/>
            ))}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-nav" style={{ background:"rgba(8,8,8,0.98)", padding:"12px 5% 24px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          {links.map(l => (
            <button key={l.page} onClick={() => { setPage(l.page); setMobileOpen(false); }}
              style={{ display:"block", width:"100%", textAlign:"left", padding:"14px 0", fontSize:22, fontFamily:FONT.display, letterSpacing:3, color: page===l.page ? T.lime : "white", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              {l.label}
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
  const [done, setDone] = useState(false);

  const handleCheckout = () => {
    setDone(true);
    clearCart();
    setTimeout(() => { setDone(false); setIsOpen(false); }, 3000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={() => setIsOpen(false)}
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200 }}/>
      <div className="slide-in" style={{ position:"fixed", top:0, right:0, bottom:0, width:"min(440px,100vw)", background:T.white, zIndex:201, display:"flex", flexDirection:"column", boxShadow:"-12px 0 48px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${T.borderL}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:T.dark }}>
          <div>
            <h2 style={{ fontFamily:FONT.display, fontSize:22, letterSpacing:3, color:T.white }}>CARRITO</h2>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2, letterSpacing:1 }}>{count} {count===1?"PRODUCTO":"PRODUCTOS"}</p>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ padding:8, borderRadius:8, background:"rgba(255,255,255,0.08)", color:"white" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 24px" }}>
          {done && (
            <div className="fade-in" style={{ textAlign:"center", padding:"50px 20px" }}>
              <div style={{ fontSize:56 }}>🎉</div>
              <h3 style={{ fontFamily:FONT.display, fontSize:24, letterSpacing:3, marginTop:16 }}>¡GRACIAS!</h3>
              <p style={{ color:T.muted, marginTop:8 }}>Pronto te contactamos para coordinar tu pedido.</p>
            </div>
          )}
          {!done && items.length === 0 && (
            <div style={{ textAlign:"center", padding:"60px 20px" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🛍️</div>
              <p style={{ fontFamily:FONT.display, fontSize:20, letterSpacing:2 }}>VACÍO</p>
              <button onClick={() => setIsOpen(false)} className="btn-dark"
                style={{ marginTop:24, padding:"11px 28px", background:T.black, color:T.white, borderRadius:8, fontSize:14, fontWeight:700, letterSpacing:1 }}>
                Ver Tienda
              </button>
            </div>
          )}
          {!done && items.map(item => (
            <div key={item.key} className="cart-item" style={{ display:"flex", gap:14, padding:"14px 6px", borderBottom:`1px solid ${T.borderL}`, borderRadius:8, transition:"background 0.2s" }}>
              <ProductVisual product={item.product} color={item.color} size="sm"/>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14 }}>{item.product.name}</p>
                <p style={{ fontSize:12, color:T.muted, marginTop:2 }}>{item.color} · Talla {item.size}</p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10 }}>
                  <div style={{ display:"flex", alignItems:"center", border:`1px solid ${T.borderL}`, borderRadius:8, overflow:"hidden" }}>
                    <button className="qty-btn" onClick={() => item.qty>1 ? updateQty(item.key, item.qty-1) : removeFromCart(item.key)}
                      style={{ width:30, height:30, fontSize:16, color:T.muted, transition:"background 0.15s" }}>−</button>
                    <span style={{ width:28, textAlign:"center", fontWeight:700, fontSize:14 }}>{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.key, item.qty+1)}
                      style={{ width:30, height:30, fontSize:16, color:T.muted, transition:"background 0.15s" }}>+</button>
                  </div>
                  <span style={{ fontWeight:800, fontSize:15 }}>{fmt(item.product.price * item.qty)}</span>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.key)} style={{ alignSelf:"flex-start", padding:4, color:T.stone }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {!done && items.length > 0 && (
          <div style={{ padding:"20px 24px", borderTop:`1px solid ${T.borderL}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, paddingTop:4 }}>
              <span style={{ fontWeight:800, fontSize:17 }}>Total</span>
              <span style={{ fontWeight:900, fontSize:20 }}>{fmt(total)}</span>
            </div>
            <button className="btn-lime" onClick={handleCheckout}
              style={{ width:"100%", padding:"15px", background:T.lime, color:T.black, borderRadius:10, fontSize:15, fontWeight:800, letterSpacing:1 }}>
              CONFIRMAR PEDIDO →
            </button>
            <p style={{ textAlign:"center", fontSize:11, color:T.muted, marginTop:10 }}>Te contactamos para coordinar pago y despacho</p>
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
  const colorMap = product.type === "Buzo" ? BUZO_COLORS_MAP : COLORS_MAP;

  return (
    <div className="product-card" onClick={() => onSelect(product)}
      style={{ background:T.white, borderRadius:16, overflow:"hidden", cursor:"pointer", border:`1px solid ${T.borderL}` }}>
      <div style={{ overflow:"hidden", position:"relative" }}>
        <div className="card-img">
          <ProductVisual product={product} color={hovColor}/>
        </div>
        {product.tag && (
          <span style={{ position:"absolute", top:12, left:12, background:T.lime, color:T.black, padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:800, letterSpacing:1, textTransform:"uppercase" }}>
            Nuevo
          </span>
        )}
        {product.promoPrice && (
          <span style={{ position:"absolute", top:12, right:12, background:T.black, color:T.lime, padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:800, letterSpacing:0.5 }}>
            2x {fmt(product.promoPrice)}
          </span>
        )}
      </div>
      <div style={{ padding:"16px 18px 20px" }}>
        <p style={{ fontSize:11, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:4, fontWeight:600 }}>{product.type}</p>
        <h3 style={{ fontFamily:FONT.display, fontSize:20, letterSpacing:2, marginBottom:12 }}>{product.name.toUpperCase()}</h3>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:18, fontWeight:800 }}>{fmt(product.price)}</span>
          <div style={{ display:"flex", gap:6 }}>
            {product.colors.map(c => (
              <div key={c} onMouseEnter={() => setHovColor(c)} onMouseLeave={() => setHovColor(null)}
                className="color-swatch"
                style={{ width:16, height:16, borderRadius:"50%", background: colorMap[c]||"#ccc", border:"1.5px solid rgba(0,0,0,0.15)", cursor:"pointer" }}
                title={c}/>
            ))}
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
  const marqueeText = "POLERAS OVERSIZE · BUZOS BAGGY · HECHO PARA ENTRENAR · VISTE MACIZO · CÓMODO · MACIZOS · ";

  return (
    <div>
      {/* HERO */}
      <section style={{ minHeight:"100vh", background:T.darker, display:"flex", alignItems:"center", padding:"100px 5% 60px", position:"relative", overflow:"hidden" }}>
        {/* BG texture */}
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(ellipse at 70% 50%, rgba(200,240,74,0.07) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(200,240,74,0.04) 0%, transparent 50%)` }}/>
        {/* Big background text */}
        <div style={{ position:"absolute", right:"-2%", top:"50%", transform:"translateY(-50%)", fontFamily:FONT.display, fontSize:"clamp(120px, 18vw, 220px)", color:"rgba(255,255,255,0.03)", letterSpacing:10, pointerEvents:"none", lineHeight:1, userSelect:"none" }}>
          MOVE
        </div>

        <div style={{ maxWidth:1280, margin:"0 auto", width:"100%", position:"relative" }}>
          <div style={{ maxWidth:680 }} className="fade-up">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(200,240,74,0.1)", border:"1px solid rgba(200,240,74,0.2)", borderRadius:20, padding:"6px 16px", marginBottom:28 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:T.lime, display:"inline-block" }}/>
              <span style={{ fontSize:12, color:T.lime, fontWeight:700, letterSpacing:2, textTransform:"uppercase" }}>Santiago, Chile · Nuevos Productos</span>
            </div>

            <h1 style={{ fontFamily:FONT.display, fontSize:"clamp(52px, 9vw, 110px)", color:T.white, lineHeight:0.95, letterSpacing:3, marginBottom:28 }}>
              VISTE<br/>
              <span style={{ color:T.lime }}>MACIZO.</span><br/>
              ENTRENA<br/>
              <span style={{ fontFamily:"'Playfair Display', serif", fontStyle:"italic", fontSize:"clamp(40px,7vw,88px)", color:"rgba(255,255,255,0.5)", letterSpacing:0, fontWeight:400 }}>bien.</span>
            </h1>

            <p style={{ fontSize:17, color:"rgba(255,255,255,0.55)", lineHeight:1.75, maxWidth:480, marginBottom:40 }}>
              Ropa para entrenar, viste bien, viste macizo 😎. Porque sentirte cómodo también es importante, pero si te puedes ver bien y macizo — este es tu lugar.
            </p>

            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              <button className="btn-lime" onClick={() => setPage("store")}
                style={{ padding:"16px 40px", background:T.lime, color:T.black, borderRadius:10, fontSize:15, fontWeight:800, letterSpacing:1 }}>
                VER COLECCIÓN →
              </button>
              <button className="btn-outline-w" onClick={() => setPage("about")}
                style={{ padding:"16px 36px", border:"1.5px solid rgba(255,255,255,0.2)", color:T.white, borderRadius:10, fontSize:15, fontWeight:600 }}>
                Nuestra Historia
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ background:T.lime, padding:"14px 0", overflow:"hidden" }}>
        <div className="marquee-track">
          {[...Array(4)].map((_,i) => (
            <span key={i} style={{ fontFamily:FONT.display, fontSize:16, letterSpacing:3, color:T.black, paddingRight:0 }}>
              {marqueeText}
            </span>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <section style={{ padding:"80px 5%", background:T.offWhite }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48, flexWrap:"wrap", gap:16 }}>
            <div>
              <p style={{ fontSize:12, color:T.muted, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Colección</p>
              <h2 style={{ fontFamily:FONT.display, fontSize:"clamp(32px,5vw,52px)", letterSpacing:3, lineHeight:1 }}>NUESTROS<br/>PRODUCTOS</h2>
            </div>
            <button className="btn-dark" onClick={() => setPage("store")}
              style={{ padding:"12px 28px", background:T.black, color:T.white, borderRadius:8, fontSize:13, fontWeight:700, letterSpacing:1.5 }}>
              VER TODO
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:24 }}>
            {MOCK_PRODUCTS.map(p => (
              <ProductCard key={p.id} product={p} onSelect={prod => { setSelectedProduct(prod); setPage("product"); }}/>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO 2x1 */}
      <section style={{ padding:"80px 5%", background:T.dark }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div className="promo-card" style={{ background:`linear-gradient(135deg, ${T.lime} 0%, #a8cc30 100%)`, borderRadius:24, padding:"48px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24 }}>
            <div>
              <p style={{ fontSize:12, fontWeight:800, letterSpacing:3, color:"rgba(0,0,0,0.5)", marginBottom:8 }}>PROMO ESPECIAL</p>
              <h2 style={{ fontFamily:FONT.display, fontSize:"clamp(36px,5vw,60px)", letterSpacing:3, color:T.black, lineHeight:1, marginBottom:12 }}>
                2 POLERAS<br/>POR $18.990
              </h2>
              <p style={{ fontSize:15, color:"rgba(0,0,0,0.6)", maxWidth:360 }}>
                Elige cualquier combinación de colores. Ahorra $4.990 llevándote el par.
              </p>
            </div>
            <button className="btn-dark" onClick={() => setPage("store")}
              style={{ padding:"18px 40px", background:T.black, color:T.lime, borderRadius:12, fontSize:16, fontWeight:800, letterSpacing:1.5, flexShrink:0 }}>
              APROVECHAR →
            </button>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section style={{ padding:"80px 5%", background:T.white }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:2 }}>
            {[
              { icon:"💪", title:"Para entrenar", desc:"Diseñadas para moverse, agacharse, levantar. Sin que se vean mal haciéndolo." },
              { icon:"🎯", title:"Para todos", desc:"No importa si llevas 1 mes o 5 años en el gym. Estas poleras te quedan bien." },
              { icon:"🖤", title:"Diseño limpio", desc:"Sin logos enormes ni gráficas raras. Minimalista, estético y atemporal." },
              { icon:"✅", title:"Calidad real", desc:"Tela heavyweight que se siente premium desde el primer uso." },
            ].map((v,i) => (
              <div key={i} style={{ padding:"36px 28px", borderLeft: i>0 ? `1px solid ${T.borderL}` : "none" }}>
                <span style={{ fontSize:36, display:"block", marginBottom:16 }}>{v.icon}</span>
                <h3 style={{ fontFamily:FONT.display, fontSize:18, letterSpacing:2, marginBottom:10 }}>{v.title.toUpperCase()}</h3>
                <p style={{ fontSize:14, color:T.muted, lineHeight:1.7 }}>{v.desc}</p>
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
  const [catFilter, setCatFilter] = useState("Todos");
  const [sizeFilter, setSizeFilter] = useState(null);

  const filtered = MOCK_PRODUCTS
    .filter(p => catFilter === "Todos" || p.type === catFilter)
    .filter(p => !sizeFilter || p.sizes.includes(sizeFilter));

  return (
    <div style={{ paddingTop:68 }}>
      <div style={{ background:T.dark, padding:"56px 5% 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:"-1%", top:"50%", transform:"translateY(-50%)", fontFamily:FONT.display, fontSize:"clamp(80px,14vw,160px)", color:"rgba(255,255,255,0.03)", letterSpacing:8, pointerEvents:"none" }}>TIENDA</div>
        <div style={{ maxWidth:1280, margin:"0 auto", position:"relative" }}>
          <p style={{ fontSize:12, color:T.lime, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Colección Actual</p>
          <h1 style={{ fontFamily:FONT.display, fontSize:"clamp(36px,6vw,72px)", color:T.white, letterSpacing:4 }}>NUESTRA TIENDA</h1>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"36px 5%" }}>
        {/* Filters */}
        <div style={{ display:"flex", gap:24, marginBottom:36, flexWrap:"wrap", alignItems:"flex-end" }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Producto</p>
            <div style={{ display:"flex", gap:8 }}>
              {CATEGORIES.map(c => (
                <button key={c} className={`filter-pill ${catFilter===c?"active-pill":""}`} onClick={() => setCatFilter(c)}
                  style={{ padding:"8px 20px", border:`1.5px solid ${catFilter===c?T.black:T.borderL}`, borderRadius:8, fontSize:13, fontWeight:600, background: catFilter===c?T.black:T.white, color: catFilter===c?T.white:T.black, letterSpacing:0.5 }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Talla</p>
            <div style={{ display:"flex", gap:6 }}>
              {SIZES_ALL.map(s => (
                <button key={s} className={`filter-pill ${sizeFilter===s?"active-pill":""}`} onClick={() => setSizeFilter(sizeFilter===s?null:s)}
                  style={{ width:44, height:40, border:`1.5px solid ${sizeFilter===s?T.black:T.borderL}`, borderRadius:8, fontSize:12, fontWeight:700, background: sizeFilter===s?T.black:T.white, color: sizeFilter===s?T.white:T.black }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Promo Banner inline */}
        <div style={{ background:T.lime, borderRadius:14, padding:"20px 28px", marginBottom:36, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontSize:28 }}>🔥</span>
            <div>
              <p style={{ fontFamily:FONT.display, fontSize:18, letterSpacing:2, color:T.black }}>PROMO: 2 POLERAS POR $18.990</p>
              <p style={{ fontSize:13, color:"rgba(0,0,0,0.55)", marginTop:2 }}>Ahorra $4.990 · cualquier color</p>
            </div>
          </div>
          <span style={{ fontSize:13, fontWeight:800, color:T.black, letterSpacing:1 }}>ACTIVO ✓</span>
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:24 }} className="fade-in">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onSelect={prod => { setSelectedProduct(prod); setPage("product"); }}/>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px", color:T.muted }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <p style={{ fontFamily:FONT.display, fontSize:22, letterSpacing:2 }}>SIN RESULTADOS</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PRODUCT DETAIL
// ─────────────────────────────────────────────
function ProductDetailPage({ product, setPage }) {
  const { addToCart } = useContext(CartContext);
  const colorMap = product.type === "Buzo" ? BUZO_COLORS_MAP : COLORS_MAP;
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
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div style={{ paddingTop:68, background:T.white, minHeight:"100vh" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 5%" }}>

        {/* Breadcrumb */}
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:36, fontSize:12, color:T.muted, letterSpacing:1, textTransform:"uppercase", fontWeight:600 }}>
          <button onClick={() => setPage("home")} style={{ color:T.muted }}>Inicio</button>
          <span>/</span>
          <button onClick={() => setPage("store")} style={{ color:T.muted }}>Tienda</button>
          <span>/</span>
          <span style={{ color:T.black }}>{product.name}</span>
        </div>

        <div className="two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64 }} >
          {/* Visual */}
          <div>
            <div style={{ borderRadius:20, overflow:"hidden", border:`1px solid ${T.borderL}` }}>
              <ProductVisual product={product} color={selColor}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:`repeat(${product.colors.length}, 1fr)`, gap:10, marginTop:12 }}>
              {product.colors.map(c => (
                <button key={c} onClick={() => setSelColor(c)}
                  style={{ borderRadius:10, overflow:"hidden", border:`2px solid ${selColor===c?T.black:T.borderL}`, aspectRatio:"1", background: colorMap[c], display:"flex", alignItems:"center", justifyContent:"center", transition:"border-color 0.2s" }}>
                  <span style={{ fontSize:22 }}>{product.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="fade-in">
            <span style={{ fontSize:11, color:T.muted, letterSpacing:3, textTransform:"uppercase", fontWeight:700 }}>{product.type}</span>
            <h1 style={{ fontFamily:FONT.display, fontSize:"clamp(32px,4vw,52px)", letterSpacing:4, marginTop:8, marginBottom:20, lineHeight:1 }}>{product.name.toUpperCase()}</h1>

            <div style={{ display:"flex", alignItems:"baseline", gap:16, marginBottom:24 }}>
              <span style={{ fontSize:34, fontWeight:900 }}>{fmt(product.price)}</span>
              {product.promoPrice && (
                <span style={{ background:T.lime, color:T.black, borderRadius:8, padding:"4px 14px", fontSize:14, fontWeight:800 }}>
                  2x {fmt(product.promoPrice)}
                </span>
              )}
            </div>

            <p style={{ fontSize:15, lineHeight:1.8, color:"#555", marginBottom:28 }}>{product.description}</p>

            {/* Color */}
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>
                Color: <span style={{ color:T.muted, fontWeight:400, textTransform:"none", letterSpacing:0 }}>{selColor}</span>
              </p>
              <div style={{ display:"flex", gap:12 }}>
                {product.colors.map(c => (
                  <button key={c} className={`color-swatch ${selColor===c?"selected-color":""}`} onClick={() => setSelColor(c)}
                    style={{ width:38, height:38, borderRadius:"50%", background: colorMap[c]||"#ccc", border:"1.5px solid rgba(0,0,0,0.12)" }}
                    title={c}/>
                ))}
              </div>
            </div>

            {/* Size */}
            <div style={{ marginBottom:28 }}>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>
                Talla {sizeError && <span style={{ color:"#c0392b", fontWeight:400, fontSize:11, textTransform:"none", letterSpacing:0 }}>— Elige una talla</span>}
              </p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {product.sizes.map(s => (
                  <button key={s} className={`size-btn ${selSize===s?"selected-size":""}`} onClick={() => { setSelSize(s); setSizeError(false); }}
                    style={{ width:52, height:46, border:`1.5px solid ${selSize===s?T.black:sizeError?T.stone:T.borderL}`, borderRadius:8, fontSize:13, fontWeight:700, background: selSize===s?T.black:T.white, color: selSize===s?T.white:T.black }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Add */}
            <div style={{ display:"flex", gap:12, marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", border:`1.5px solid ${T.borderL}`, borderRadius:10, overflow:"hidden" }}>
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1,q-1))} style={{ width:44, height:52, fontSize:18, color:T.muted, transition:"background 0.15s" }}>−</button>
                <span style={{ width:44, textAlign:"center", fontWeight:800, fontSize:16 }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => q+1)} style={{ width:44, height:52, fontSize:18, color:T.muted, transition:"background 0.15s" }}>+</button>
              </div>
              <button className="btn-lime" onClick={handleAdd}
                style={{ flex:1, padding:"0 24px", background: added ? T.success : T.lime, color: added ? T.white : T.black, borderRadius:10, fontSize:14, fontWeight:800, letterSpacing:1, transition:"background 0.3s" }}>
                {added ? "✓ AGREGADO" : "AGREGAR AL CARRITO"}
              </button>
            </div>

            {/* Trust */}
            <div style={{ display:"flex", gap:20, padding:"16px 20px", background:T.offWhite, borderRadius:12, flexWrap:"wrap" }}>
              {[["🚚","Despacho a todo Chile"],["↩️","Cambios sin problema"],["✓","Calidad garantizada"]].map(([e,t]) => (
                <div key={t} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:T.muted }}>
                  <span>{e}</span><span>{t}</span>
                </div>
              ))}
            </div>

            {/* Details */}
            <div style={{ marginTop:28 }}>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Detalles</p>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8 }}>
                {product.details.map(d => (
                  <li key={d} style={{ fontSize:14, color:"#555", display:"flex", alignItems:"flex-start", gap:10 }}>
                    <span style={{ color:T.lime, fontWeight:900, marginTop:1 }}>—</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ABOUT PAGE
// ─────────────────────────────────────────────
function AboutPage({ setPage }) {
  return (
    <div style={{ paddingTop:68 }}>
      {/* Hero */}
      <div style={{ background:T.dark, padding:"72px 5% 64px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", fontFamily:FONT.display, fontSize:"clamp(80px,14vw,180px)", color:"rgba(255,255,255,0.03)", letterSpacing:8, pointerEvents:"none" }}>NOSOTROS</div>
        <div style={{ maxWidth:1280, margin:"0 auto", position:"relative" }}>
          <p style={{ fontSize:12, color:T.lime, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Nuestra historia</p>
          <h1 style={{ fontFamily:FONT.display, fontSize:"clamp(42px,7vw,88px)", color:T.white, letterSpacing:4, lineHeight:1, marginBottom:20 }}>
            POR QUÉ<br/>
            <span style={{ color:T.lime }}>MACIZOS.</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.5)", maxWidth:580, lineHeight:1.8 }}>
            Nació en un vestuario de gym. De querer verse bien entrenando sin importar el proceso en que estés.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:860, margin:"0 auto", padding:"72px 5%" }}>
        {[
          {
            tag:"El problema",
            title:"La ropa de gym era fea o cara",
            text:"Buscábamos poleras para entrenar que fueran cómodas de verdad — oversize, con tela buena, que no se pegaran al cuerpo. Que se vieran bien tanto en el gym como en la calle. No existía eso en Chile a precio justo."
          },
          {
            tag:"La idea",
            title:"Viste bien, viste macizo 😎",
            text:"Creamos MACIZOS con una premisa simple: la ropa para entrenar tiene que hacerte sentir y verte bien desde el momento en que te la pones. No importa si llevas 2 meses en el gym o 10 años. No importa tu peso ni tu condición física. Si te ves macizo, te motivas. Y si te motivas, entrenas. Punto."
          },
          {
            tag:"El producto",
            title:"Oversize y baggy con propósito",
            text:"Elegimos corte oversize en poleras y baggy en buzos porque son los cortes que mejor le quedan a todos los cuerpos durante el entrenamiento. Dan libertad de movimiento, no marcan, y tienen una estética limpia y moderna. La tela es heavyweight — se siente premium y dura mucho más que una polera corriente."
          },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom:60, paddingBottom:60, borderBottom: i<2 ? `1px solid ${T.borderL}` : "none" }}>
            <span style={{ display:"inline-block", background:T.lime, color:T.black, padding:"3px 12px", borderRadius:4, fontSize:11, fontWeight:800, letterSpacing:2, marginBottom:14, textTransform:"uppercase" }}>{s.tag}</span>
            <h2 style={{ fontFamily:FONT.display, fontSize:"clamp(24px,4vw,38px)", letterSpacing:2, marginBottom:16, lineHeight:1.1 }}>{s.title.toUpperCase()}</h2>
            <p style={{ fontSize:16, lineHeight:1.85, color:"#555" }}>{s.text}</p>
          </div>
        ))}

        <button className="btn-lime" onClick={() => setPage("store")}
          style={{ padding:"16px 40px", background:T.lime, color:T.black, borderRadius:10, fontSize:15, fontWeight:800, letterSpacing:1.5 }}>
          VER LA COLECCIÓN →
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

  return (
    <div style={{ paddingTop:68 }}>
      <div style={{ background:T.dark, padding:"64px 5%", textAlign:"center" }}>
        <h1 style={{ fontFamily:FONT.display, fontSize:"clamp(36px,6vw,72px)", color:T.white, letterSpacing:4 }}>CONTACTO</h1>
        <p style={{ color:"rgba(255,255,255,0.4)", marginTop:10, fontSize:14, letterSpacing:1 }}>Escríbenos, respondemos rápido</p>
      </div>
      <div style={{ maxWidth:580, margin:"0 auto", padding:"60px 5%" }}>
        {sent ? (
          <div className="fade-in" style={{ textAlign:"center", padding:"40px" }}>
            <div style={{ fontSize:56 }}>✉️</div>
            <h2 style={{ fontFamily:FONT.display, fontSize:28, letterSpacing:2, margin:"20px 0 10px" }}>MENSAJE ENVIADO</h2>
            <p style={{ color:T.muted }}>Te respondemos dentro de 24 horas.</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[["Nombre","name","text","Tu nombre"],["Email","email","email","tu@email.com"]].map(([label,field,type,ph]) => (
              <div key={field}>
                <label style={{ fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>{label}</label>
                <input type={type} value={form[field]} onChange={e => setForm(f=>({...f,[field]:e.target.value}))}
                  style={{ width:"100%", padding:"13px 16px", border:`1.5px solid ${T.borderL}`, borderRadius:10, fontSize:14, background:T.white }} placeholder={ph}/>
              </div>
            ))}
            <div>
              <label style={{ fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", display:"block", marginBottom:8 }}>Mensaje</label>
              <textarea value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} rows={5}
                style={{ width:"100%", padding:"13px 16px", border:`1.5px solid ${T.borderL}`, borderRadius:10, fontSize:14, resize:"vertical" }} placeholder="¿En qué podemos ayudarte?"/>
            </div>
            <button className="btn-lime" onClick={() => { if(form.name&&form.email&&form.message) setSent(true); }}
              style={{ padding:"15px", background:T.lime, color:T.black, borderRadius:10, fontSize:14, fontWeight:800, letterSpacing:1.5, marginTop:8 }}>
              ENVIAR MENSAJE
            </button>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:12, color:T.muted, fontSize:14, paddingTop:20, borderTop:`1px solid ${T.borderL}` }}>
              <p>📱 Instagram: <strong>@macizos.cl</strong></p>
              <p>📧 hola@macizos.cl</p>
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
    <footer style={{ background:T.darker, color:"rgba(255,255,255,0.55)", padding:"56px 5% 28px" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:40, marginBottom:48 }}>
          <div>
            <button onClick={() => setPage("home")} style={{ fontFamily:FONT.display, fontSize:32, letterSpacing:4, color:T.white, marginBottom:12, display:"block" }}>
              MACIZOS<span style={{ color:T.lime }}>.</span>
            </button>
            <p style={{ fontSize:14, lineHeight:1.7, marginBottom:20 }}>Viste bien, viste macizo 😎. Ropa para entrenar con estilo. Santiago, Chile.</p>
            <div style={{ display:"flex", gap:10 }}>
              {["IG","TK"].map(s => (
                <div key={s} style={{ width:36, height:36, border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.5)", cursor:"pointer" }}>{s}</div>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:T.white, marginBottom:16 }}>Tienda</h3>
            {["Poleras Oversize","Buzos Baggy","Promo 2x1"].map(l => (
              <button key={l} onClick={() => setPage("store")} style={{ display:"block", fontSize:14, marginBottom:10, color:"rgba(255,255,255,0.45)", textAlign:"left" }}>{l}</button>
            ))}
          </div>
          <div>
            <h3 style={{ fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:T.white, marginBottom:16 }}>Info</h3>
            {["Guía de tallas","Envíos","Cambios","Nosotros"].map(l => (
              <button key={l} style={{ display:"block", fontSize:14, marginBottom:10, color:"rgba(255,255,255,0.45)", textAlign:"left" }}>{l}</button>
            ))}
          </div>
          <div>
            <h3 style={{ fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:T.white, marginBottom:16 }}>Contacto</h3>
            <p style={{ fontSize:14, marginBottom:8 }}>hola@move.cl</p>
            <p style={{ fontSize:14, marginBottom:20 }}>@move.cl</p>
            <button onClick={() => setPage("contact")} className="btn-lime"
              style={{ padding:"10px 22px", background:T.lime, color:T.black, borderRadius:8, fontSize:13, fontWeight:800, letterSpacing:1 }}>
              ESCRIBIR
            </button>
          </div>
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:24, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <p style={{ fontSize:13 }}>© 2025 MACIZOS. Todos los derechos reservados.</p>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>Hecho con 💪 en Santiago</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
function Toast() {
  const { notification } = useContext(CartContext);
  if (!notification) return null;
  return (
    <div className="slide-in" style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:T.dark, border:`1px solid ${T.lime}`, color:T.white, padding:"13px 24px", borderRadius:12, fontSize:14, fontWeight:700, zIndex:300, boxShadow:"0 8px 32px rgba(0,0,0,0.35)", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ color:T.lime, fontSize:16 }}>✓</span> {notification}
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
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const renderPage = () => {
    switch(page) {
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
        <main style={{ flex:1 }}>{renderPage()}</main>
        <Footer setPage={navigate}/>
        <CartDrawer/>
        <Toast/>
      </div>
    </CartProvider>
  );
}
