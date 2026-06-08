import { useState, useContext, createContext, useReducer, useCallback, useEffect } from "react";

const T = {
  black:   "#0A0A0A",
  white:   "#FFFFFF",
  offWhite:"#F7F5F2",
  sand:    "#EDE8E0",
  stone:   "#C2BAA8",
  muted:   "#7A7468",
  navy:    "#0F1F3D",
  navyL:   "#1A3260",
  navyD:   "#070F1F",
  lime:    "#C8F04A",
  limeD:   "#A8CC30",
  dark:    "#111111",
  darker:  "#080808",
  cardBg:  "#FFFFFF",
  borderL: "#E4E0D8",
  success: "#2D7A4F",
};

const FONT = {
  display: "'Bebas Neue', 'Anton', Impact, sans-serif",
  body:    "'DM Sans', system-ui, sans-serif",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
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

  .btn-navy { transition: background 0.2s, transform 0.15s; }
  .btn-navy:hover { background: ${T.navyL} !important; transform: translateY(-2px); }

  .btn-outline-w { transition: background 0.2s, color 0.2s, transform 0.15s; }
  .btn-outline-w:hover { background: white !important; color: black !important; transform: translateY(-2px); }

  .nav-link { position: relative; }
  .nav-link::after { content: ''; position: absolute; bottom: -3px; left: 0; width: 0; height: 2px; background: ${T.lime}; transition: width 0.25s ease; }
  .nav-link:hover::after, .nav-link.active::after { width: 100%; }

  .filter-pill { transition: all 0.18s; }
  .filter-pill:hover { border-color: ${T.navy}; }
  .filter-pill.active-pill { background: ${T.navy}; color: ${T.white}; border-color: ${T.navy}; }

  .size-btn { transition: all 0.15s; }
  .size-btn:hover { border-color: ${T.navy}; background: ${T.sand}; }
  .size-btn.selected-size { background: ${T.navy}; color: ${T.white}; border-color: ${T.navy}; }

  .color-swatch { transition: box-shadow 0.15s, transform 0.15s; }
  .color-swatch:hover { transform: scale(1.15); }
  .color-swatch.selected-color { box-shadow: 0 0 0 3px ${T.white}, 0 0 0 5px ${T.navy}; }

  .cart-item:hover { background: ${T.offWhite}; }
  .overlay { animation: fadeIn 0.25s ease both; }
  .qty-btn:hover { background: ${T.sand}; }
  .search-input:focus { outline: none; border-color: ${T.navy}; }
  .promo-card { animation: glowPulse 2.5s ease-in-out infinite; }
  .marquee-track { display: flex; animation: marquee 18s linear infinite; white-space: nowrap; }
  .marquee-track:hover { animation-play-state: paused; }
  .ref-card { transition: transform 0.3s ease, box-shadow 0.3s ease; overflow: hidden; }
  .ref-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.15); }

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

// ─── DATA ───
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
  // ── MACIZOS (Hombre) ──
  {
    id: "polera-h-001",
    name: "Polera Oversize",
    type: "Polera",
    linea: "Macizos",
    price: 11990,
    promoPrice: 18990,
    promoQty: 2,
    colors: ["Negro","Blanco","Gris","Café"],
    sizes: ["XS","S","M","L","XL","XXL"],
    tag: "nuevo",
    rating: 4.9,
    reviews: 0,
    description: "Diseñada para quien entrena. Corte oversize con caída perfecta — ni muy holgada ni muy ceñida. No importa si estás en tu mejor momento físico o empezando el camino: esta polera te va a quedar increíble y vas a querer ponértela todos los días. 100% algodón, suave al tacto y transpirable.",
    details: ["100% Algodón heavyweight","Corte Oversize / Boxy Fit","Transpirable y cómoda para entrenar","Costuras reforzadas","Disponible en 4 colores"],
    emoji: "👕",
  },
  {
    id: "buzo-h-001",
    name: "Buzo Baggy",
    type: "Buzo",
    linea: "Macizos",
    price: 18990,
    promoPrice: null,
    promoQty: null,
    colors: ["Negro","Gris"],
    sizes: ["XS","S","M","L","XL","XXL"],
    tag: "nuevo",
    rating: 4.9,
    reviews: 0,
    description: "El buzo que faltaba. Corte baggy recto y ancho — cómodo para entrenar, para descansar, para todo. Diseño limpio y minimalista que se ve impecable. Tela gruesa y suave que abraza sin apretar.",
    details: ["Tela pesada y suave","Corte Baggy recto","Elástico en cintura y puños","Diseño minimalista","Disponible en Negro y Gris"],
    emoji: "👖",
  },
  // ── MACIZAS (Mujer) ──
  {
    id: "polera-m-001",
    name: "Polera Oversize",
    type: "Polera",
    linea: "Macizas",
    price: 11990,
    promoPrice: 18990,
    promoQty: 2,
    colors: ["Negro","Blanco","Gris","Café"],
    sizes: ["XS","S","M","L","XL"],
    tag: "nuevo",
    rating: 4.9,
    reviews: 0,
    description: "Para las Macizas que entrenan con estilo. Mismo corte oversize que los hombres adoran, diseñado para que te quede perfecto a ti también. Cómoda, liviana, y te hace ver increíble — dentro y fuera del gym.",
    details: ["100% Algodón heavyweight","Corte Oversize femenino","Largo extendido","Costuras reforzadas","Disponible en 4 colores"],
    emoji: "👕",
  },
  {
    id: "buzo-m-001",
    name: "Buzo Baggy",
    type: "Buzo",
    linea: "Macizas",
    price: 18990,
    promoPrice: null,
    promoQty: null,
    colors: ["Negro","Gris"],
    sizes: ["XS","S","M","L","XL"],
    tag: "nuevo",
    rating: 4.9,
    reviews: 0,
    description: "El buzo baggy que todas quieren. Tiro alto, cintura elástica ajustable y corte ancho que favorece a todos los cuerpos. Cómodo para entrenar, perfecto para vivir.",
    details: ["Tela pesada y suave","Corte Baggy tiro alto","Elástico en cintura y puños","Diseño minimalista","Disponible en Negro y Gris"],
    emoji: "👖",
  },
];

const CATEGORIES = ["Todos", "Macizos 💪", "Macizas 💅"];
const SIZES_ALL = ["XS","S","M","L","XL","XXL"];

// ─── CART CONTEXT ───
const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const key = `${action.product.id}-${action.color}-${action.size}`;
      const existing = state.items.find(i => i.key === key);
      if (existing) return { ...state, items: state.items.map(i => i.key === key ? { ...i, qty: i.qty + action.qty } : i) };
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

// ─── UTILS ───
const fmt = n => `$${n.toLocaleString("es-CL")}`;

function isLight(hex) {
  if (!hex) return true;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return (r*299 + g*587 + b*114) / 1000 > 150;
}

const PRODUCT_IMAGES = {
  "polera-h-001": { "Negro":"/images/Polera-Negro.png","Blanco":"/images/Polera-Blanco.png","Gris":"/images/Polera-Gris.png","Café":"/images/Polera-Cafe.png" },
  "buzo-h-001":   { "Negro":"/images/Buzo-Negro.png","Gris":"/images/Buzo-Gris.png" },
  "polera-m-001": { "Negro":"/images/Polera-Negro.png","Blanco":"/images/Polera-Blanco.png","Gris":"/images/Polera-Gris.png","Café":"/images/Polera-Cafe.png" },
  "buzo-m-001":   { "Negro":"/images/Buzo-Negro.png","Gris":"/images/Buzo-Gris.png" },
};

function ProductVisual({ product, color = null, size = "full" }) {
  const map = product.type === "Buzo" ? BUZO_COLORS_MAP : COLORS_MAP;
  const activeColor = color || product.colors[0];
  const bg = map[activeColor] || "#ccc";
  const imgSrc = PRODUCT_IMAGES[product.id]?.[activeColor] || null;

  if (size !== "full") return (
    <div style={{ width:64, height:64, borderRadius:8, overflow:"hidden", flexShrink:0, background:bg }}>
      {imgSrc ? <img src={imgSrc} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:26 }}>{product.emoji}</span></div>}
    </div>
  );

  return (
    <div style={{ width:"100%", paddingBottom:"115%", position:"relative", background: bg }}>
      {imgSrc
        ? <img src={imgSrc} alt={`${product.name} ${activeColor}`} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", transition:"opacity 0.3s ease" }}/>
        : <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
            <span style={{ fontSize:72 }}>{product.emoji}</span>
            <span style={{ fontFamily:FONT.display, fontSize:15, color: isLight(bg)?"rgba(0,0,0,0.3)":"rgba(255,255,255,0.3)", letterSpacing:4, textTransform:"uppercase" }}>{product.name}</span>
          </div>
      }
    </div>
  );
}

// ─── LOGO SVG MACIZOS (dark lettering) ───
function LogoMacizos({ size = 180, color = "#FFFFFF" }) {
  return (
    <img
      src="/images/logo-macizos.png"
      alt="Macizos"
      style={{ height: size, width: "auto", filter: color === "#FFFFFF" ? "brightness(100)" : "none" }}
      onError={e => { e.target.style.display = "none"; }}
    />
  );
}

// ─── NAVBAR ───
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
    { label:"Referencias", page:"refs" },
    { label:"Nosotros", page:"about" },
    { label:"Contacto", page:"contact" },
  ];

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background: scrolled ? `rgba(7,15,31,0.97)` : T.navy,
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: `1px solid rgba(255,255,255,0.08)`,
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
        <div className="desktop-nav" style={{ display:"flex", gap:32, alignItems:"center" }}>
          {links.map(l => (
            <button key={l.page} onClick={() => setPage(l.page)}
              className={`nav-link ${page===l.page?"active":""}`}
              style={{ fontSize:13, fontWeight:600, color: page===l.page ? T.lime : T.white, letterSpacing:1.5, textTransform:"uppercase" }}>
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

      {mobileOpen && (
        <div className="mobile-nav" style={{ background:`rgba(7,15,31,0.98)`, padding:"12px 5% 24px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
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

// ─── CART DRAWER ───
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
      <div className="overlay" onClick={() => setIsOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:200 }}/>
      <div className="slide-in" style={{ position:"fixed", top:0, right:0, bottom:0, width:"min(440px,100vw)", background:T.white, zIndex:201, display:"flex", flexDirection:"column", boxShadow:"-12px 0 48px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${T.borderL}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:T.navy }}>
          <div>
            <h2 style={{ fontFamily:FONT.display, fontSize:22, letterSpacing:3, color:T.white }}>CARRITO</h2>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2, letterSpacing:1 }}>{count} {count===1?"PRODUCTO":"PRODUCTOS"}</p>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ padding:8, borderRadius:8, background:"rgba(255,255,255,0.08)", color:"white" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

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
              <button onClick={() => setIsOpen(false)} className="btn-navy"
                style={{ marginTop:24, padding:"11px 28px", background:T.navy, color:T.white, borderRadius:8, fontSize:14, fontWeight:700, letterSpacing:1 }}>
                Ver Tienda
              </button>
            </div>
          )}
          {!done && items.map(item => (
            <div key={item.key} className="cart-item" style={{ display:"flex", gap:14, padding:"14px 6px", borderBottom:`1px solid ${T.borderL}`, borderRadius:8, transition:"background 0.2s" }}>
              <ProductVisual product={item.product} color={item.color} size="sm"/>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14 }}>{item.product.name}</p>
                <p style={{ fontSize:11, color:T.lime, fontWeight:700, marginBottom:2 }}>{item.product.linea}</p>
                <p style={{ fontSize:12, color:T.muted }}>{item.color} · Talla {item.size}</p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10 }}>
                  <div style={{ display:"flex", alignItems:"center", border:`1px solid ${T.borderL}`, borderRadius:8, overflow:"hidden" }}>
                    <button className="qty-btn" onClick={() => item.qty>1 ? updateQty(item.key, item.qty-1) : removeFromCart(item.key)} style={{ width:30, height:30, fontSize:16, color:T.muted, transition:"background 0.15s" }}>−</button>
                    <span style={{ width:28, textAlign:"center", fontWeight:700, fontSize:14 }}>{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.key, item.qty+1)} style={{ width:30, height:30, fontSize:16, color:T.muted, transition:"background 0.15s" }}>+</button>
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

        {!done && items.length > 0 && (
          <div style={{ padding:"20px 24px", borderTop:`1px solid ${T.borderL}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
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

// ─── PRODUCT CARD ───
function ProductCard({ product, onSelect }) {
  const [hovColor, setHovColor] = useState(null);
  const colorMap = product.type === "Buzo" ? BUZO_COLORS_MAP : COLORS_MAP;

  return (
    <div className="product-card" onClick={() => onSelect(product)}
      style={{ background:T.white, borderRadius:16, overflow:"hidden", cursor:"pointer", border:`1px solid ${T.borderL}` }}>
      <div style={{ overflow:"hidden", position:"relative" }}>
        <div className="card-img"><ProductVisual product={product} color={hovColor}/></div>
        {product.tag && (
          <span style={{ position:"absolute", top:12, left:12, background:T.lime, color:T.black, padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:800, letterSpacing:1, textTransform:"uppercase" }}>Nuevo</span>
        )}
        <span style={{ position:"absolute", top:12, right:12, background:T.navy, color:T.white, padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:800 }}>{product.linea}</span>
        {product.promoPrice && (
          <span style={{ position:"absolute", bottom:12, left:12, background:T.black, color:T.lime, padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:800 }}>
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
                style={{ width:16, height:16, borderRadius:"50%", background: colorMap[c]||"#ccc", border:"1.5px solid rgba(0,0,0,0.15)", cursor:"pointer" }} title={c}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HOME PAGE ───
function HomePage({ setPage, setSelectedProduct }) {
  const marqueeText = "POLERAS OVERSIZE · BUZOS BAGGY · MACIZOS · MACIZAS · VISTE MACIZO · ENTRENA MACIZO · SANTIAGO CHILE · ";

  return (
    <div>
      {/* HERO */}
      <section style={{ minHeight:"100vh", background:`linear-gradient(150deg, ${T.navyD} 0%, ${T.navy} 60%, ${T.navyL} 100%)`, display:"flex", alignItems:"center", padding:"100px 5% 60px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(ellipse at 70% 50%, rgba(200,240,74,0.08) 0%, transparent 60%)` }}/>
        <div style={{ position:"absolute", right:"-2%", top:"50%", transform:"translateY(-50%)", fontFamily:FONT.display, fontSize:"clamp(120px, 18vw, 220px)", color:"rgba(255,255,255,0.03)", letterSpacing:10, pointerEvents:"none", lineHeight:1, userSelect:"none" }}>MACIZOS</div>

        <div style={{ maxWidth:1280, margin:"0 auto", width:"100%", position:"relative", display:"flex", alignItems:"center", gap:60, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:300 }} className="fade-up">
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(200,240,74,0.1)", border:"1px solid rgba(200,240,74,0.2)", borderRadius:20, padding:"6px 16px", marginBottom:28 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:T.lime, display:"inline-block" }}/>
              <span style={{ fontSize:12, color:T.lime, fontWeight:700, letterSpacing:2, textTransform:"uppercase" }}>Santiago, Chile · Nueva Colección</span>
            </div>

            {/* LOGO IMAGE */}
            <div style={{ marginBottom:20 }}>
              <img src="/images/logo-macizos.png" alt="Macizos" style={{ height:100, width:"auto", filter:"brightness(0) invert(1)", opacity:0.95 }}
                onError={e => e.target.style.display="none"}/>
            </div>

            <h1 style={{ fontFamily:FONT.display, fontSize:"clamp(48px, 8vw, 96px)", color:T.white, lineHeight:0.95, letterSpacing:3, marginBottom:28 }}>
              VISTE MACIZO.<br/>
              <span style={{ color:T.lime }}>ENTRENA MACIZO 😎</span>
            </h1>

            <p style={{ fontSize:17, color:"rgba(255,255,255,0.6)", lineHeight:1.8, maxWidth:500, marginBottom:40 }}>
              Ropa para entrenar, viste bien, viste macizo. Porque sentirte cómodo también es importante. ¿Te quieres sentir bien y macizo? 👉 este es tu lugar.
            </p>

            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              <button className="btn-lime" onClick={() => setPage("store")}
                style={{ padding:"16px 40px", background:T.lime, color:T.black, borderRadius:10, fontSize:15, fontWeight:800, letterSpacing:1 }}>
                VER COLECCIÓN →
              </button>
              <button className="btn-outline-w" onClick={() => setPage("about")}
                style={{ padding:"16px 36px", border:"1.5px solid rgba(255,255,255,0.25)", color:T.white, borderRadius:10, fontSize:15, fontWeight:600 }}>
                Nuestra Historia
              </button>
            </div>

            <div style={{ marginTop:48, display:"flex", gap:36, flexWrap:"wrap" }}>
              {[["💪","Macizos"],["💅","Macizas"],["🔥","100% Cómodo"]].map(([e,l]) => (
                <div key={l} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:28 }}>{e}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:4, letterSpacing:1 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ background:T.lime, padding:"14px 0", overflow:"hidden" }}>
        <div className="marquee-track">
          {[...Array(4)].map((_,i) => (
            <span key={i} style={{ fontFamily:FONT.display, fontSize:16, letterSpacing:3, color:T.black, paddingRight:0 }}>{marqueeText}</span>
          ))}
        </div>
      </div>

      {/* LÍNEAS */}
      <section style={{ padding:"80px 5%", background:T.white }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <p style={{ fontSize:12, color:T.muted, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Nuestras líneas</p>
            <h2 style={{ fontFamily:FONT.display, fontSize:"clamp(32px,5vw,52px)", letterSpacing:3 }}>PARA TODOS LOS MACIZOS</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:24 }}>
            {[
              { icon:"💪", title:"MACIZOS", sub:"Línea Hombre", desc:"Poleras oversize y buzos baggy para los que entrenan con actitud. Sin excusas, solo resultados (y buena ropa).", color:T.navy },
              { icon:"💅", title:"MACIZAS", sub:"Línea Mujer", desc:"Para las que van al gym a entrenar, no a hacer amigos... aunque igual hacen amigos. Oversize y baggy para todas.", color:"#8B1A6B" },
            ].map(l => (
              <button key={l.title} onClick={() => setPage("store")}
                style={{ background:l.color, border:"none", borderRadius:20, padding:"40px 32px", textAlign:"left", cursor:"pointer", transition:"transform 0.25s, box-shadow 0.25s" }}
                className="product-card">
                <span style={{ fontSize:48, display:"block", marginBottom:16 }}>{l.icon}</span>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", letterSpacing:2, marginBottom:4, fontWeight:700 }}>{l.sub}</p>
                <h3 style={{ fontFamily:FONT.display, fontSize:36, letterSpacing:3, color:T.white, marginBottom:10 }}>{l.title}</h3>
                <p style={{ fontSize:14, color:"rgba(255,255,255,0.65)", marginBottom:20, lineHeight:1.6 }}>{l.desc}</p>
                <span style={{ fontSize:13, fontWeight:700, color:T.lime, letterSpacing:0.5 }}>Ver colección →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section style={{ padding:"80px 5%", background:T.offWhite }}>
        <div style={{ maxWidth:1280, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:48, flexWrap:"wrap", gap:16 }}>
            <div>
              <p style={{ fontSize:12, color:T.muted, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Colección</p>
              <h2 style={{ fontFamily:FONT.display, fontSize:"clamp(32px,5vw,52px)", letterSpacing:3 }}>NUEVOS PRODUCTOS</h2>
            </div>
            <button className="btn-navy" onClick={() => setPage("store")}
              style={{ padding:"12px 28px", background:T.navy, color:T.white, borderRadius:8, fontSize:13, fontWeight:700, letterSpacing:1.5 }}>
              VER TODO
            </button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:24 }}>
            {MOCK_PRODUCTS.map(p => (
              <ProductCard key={p.id} product={p} onSelect={prod => { setSelectedProduct(prod); setPage("product"); }}/>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO 2x1 */}
      <section style={{ padding:"80px 5%", background:T.navy }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div className="promo-card" style={{ background:`linear-gradient(135deg, ${T.lime} 0%, #a8cc30 100%)`, borderRadius:24, padding:"48px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:24 }}>
            <div>
              <p style={{ fontSize:12, fontWeight:800, letterSpacing:3, color:"rgba(0,0,0,0.5)", marginBottom:8 }}>PROMO ESPECIAL</p>
              <h2 style={{ fontFamily:FONT.display, fontSize:"clamp(36px,5vw,60px)", letterSpacing:3, color:T.black, lineHeight:1, marginBottom:12 }}>
                2 POLERAS<br/>POR $18.990
              </h2>
              <p style={{ fontSize:15, color:"rgba(0,0,0,0.6)", maxWidth:360 }}>Cualquier combinación de colores y líneas. Ahorra $4.990 llevándote el par. 👊</p>
            </div>
            <button className="btn-navy" onClick={() => setPage("store")}
              style={{ padding:"18px 40px", background:T.navy, color:T.lime, borderRadius:12, fontSize:16, fontWeight:800, letterSpacing:1.5, flexShrink:0 }}>
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
              { icon:"🎯", title:"Para todos", desc:"No importa si llevas 1 mes o 5 años en el gym. Estas prendas te quedan bien." },
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

// ─── STORE PAGE ───
function StorePage({ setPage, setSelectedProduct }) {
  const [lineaFilter, setLineaFilter] = useState("Todos");
  const [sizeFilter, setSizeFilter] = useState(null);

  const filtered = MOCK_PRODUCTS
    .filter(p => lineaFilter === "Todos" || p.linea === lineaFilter.replace(" 💪","").replace(" 💅",""))
    .filter(p => !sizeFilter || p.sizes.includes(sizeFilter));

  return (
    <div style={{ paddingTop:68 }}>
      <div style={{ background:T.navy, padding:"56px 5% 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:"-1%", top:"50%", transform:"translateY(-50%)", fontFamily:FONT.display, fontSize:"clamp(80px,14vw,160px)", color:"rgba(255,255,255,0.03)", letterSpacing:8, pointerEvents:"none" }}>TIENDA</div>
        <div style={{ maxWidth:1280, margin:"0 auto", position:"relative" }}>
          <p style={{ fontSize:12, color:T.lime, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Colección Actual</p>
          <h1 style={{ fontFamily:FONT.display, fontSize:"clamp(36px,6vw,72px)", color:T.white, letterSpacing:4 }}>NUESTRA TIENDA</h1>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"36px 5%" }}>
        {/* Promo Banner */}
        <div style={{ background:T.lime, borderRadius:14, padding:"20px 28px", marginBottom:36, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontSize:28 }}>🔥</span>
            <div>
              <p style={{ fontFamily:FONT.display, fontSize:18, letterSpacing:2, color:T.black }}>PROMO: 2 POLERAS POR $18.990</p>
              <p style={{ fontSize:13, color:"rgba(0,0,0,0.55)", marginTop:2 }}>Ahorra $4.990 · cualquier color · Macizos y Macizas</p>
            </div>
          </div>
          <span style={{ fontSize:13, fontWeight:800, color:T.black, letterSpacing:1 }}>ACTIVO ✓</span>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:24, marginBottom:36, flexWrap:"wrap", alignItems:"flex-end" }}>
          <div>
            <p style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>Línea</p>
            <div style={{ display:"flex", gap:8 }}>
              {CATEGORIES.map(c => (
                <button key={c} className={`filter-pill ${lineaFilter===c?"active-pill":""}`} onClick={() => setLineaFilter(c)}
                  style={{ padding:"8px 20px", border:`1.5px solid ${lineaFilter===c?T.navy:T.borderL}`, borderRadius:8, fontSize:13, fontWeight:600, background: lineaFilter===c?T.navy:T.white, color: lineaFilter===c?T.white:T.black, letterSpacing:0.5 }}>
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
                  style={{ width:44, height:40, border:`1.5px solid ${sizeFilter===s?T.navy:T.borderL}`, borderRadius:8, fontSize:12, fontWeight:700, background: sizeFilter===s?T.navy:T.white, color: sizeFilter===s?T.white:T.black }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:24 }} className="fade-in">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onSelect={prod => { setSelectedProduct(prod); setPage("product"); }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT DETAIL ───
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
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:36, fontSize:12, color:T.muted, letterSpacing:1, textTransform:"uppercase", fontWeight:600 }}>
          <button onClick={() => setPage("home")} style={{ color:T.muted }}>Inicio</button>
          <span>/</span>
          <button onClick={() => setPage("store")} style={{ color:T.muted }}>Tienda</button>
          <span>/</span>
          <span style={{ color:T.navy }}>{product.linea} — {product.name}</span>
        </div>

        <div className="two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64 }}>
          <div>
            <div style={{ borderRadius:20, overflow:"hidden", border:`1px solid ${T.borderL}` }}>
              <ProductVisual product={product} color={selColor}/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:`repeat(${product.colors.length}, 1fr)`, gap:10, marginTop:12 }}>
              {product.colors.map(c => (
                <button key={c} onClick={() => setSelColor(c)}
                  style={{ borderRadius:10, overflow:"hidden", border:`2px solid ${selColor===c?T.navy:T.borderL}`, aspectRatio:"1", background: colorMap[c], display:"flex", alignItems:"center", justifyContent:"center", transition:"border-color 0.2s" }}>
                  <span style={{ fontSize:22 }}>{product.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="fade-in">
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              <span style={{ background:T.navy, color:T.white, padding:"3px 12px", borderRadius:20, fontSize:11, fontWeight:800 }}>{product.linea}</span>
              <span style={{ background:T.lime, color:T.black, padding:"3px 12px", borderRadius:20, fontSize:11, fontWeight:800 }}>{product.type}</span>
            </div>
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

            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>
                Color: <span style={{ color:T.muted, fontWeight:400, textTransform:"none" }}>{selColor}</span>
              </p>
              <div style={{ display:"flex", gap:12 }}>
                {product.colors.map(c => (
                  <button key={c} className={`color-swatch ${selColor===c?"selected-color":""}`} onClick={() => setSelColor(c)}
                    style={{ width:38, height:38, borderRadius:"50%", background: colorMap[c]||"#ccc", border:"1.5px solid rgba(0,0,0,0.12)" }} title={c}/>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:28 }}>
              <p style={{ fontSize:12, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:12 }}>
                Talla {sizeError && <span style={{ color:"#c0392b", fontWeight:400, fontSize:11 }}>— Elige una talla</span>}
              </p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {product.sizes.map(s => (
                  <button key={s} className={`size-btn ${selSize===s?"selected-size":""}`} onClick={() => { setSelSize(s); setSizeError(false); }}
                    style={{ width:52, height:46, border:`1.5px solid ${selSize===s?T.navy:sizeError?T.stone:T.borderL}`, borderRadius:8, fontSize:13, fontWeight:700, background: selSize===s?T.navy:T.white, color: selSize===s?T.white:T.black }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

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

            <div style={{ display:"flex", gap:20, padding:"16px 20px", background:T.offWhite, borderRadius:12, flexWrap:"wrap" }}>
              {[["🚚","Despacho a todo Chile"],["↩️","Cambios sin problema"],["✓","Calidad garantizada"]].map(([e,t]) => (
                <div key={t} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:T.muted }}>
                  <span>{e}</span><span>{t}</span>
                </div>
              ))}
            </div>

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

// ─── REFERENCIAS PAGE ───
function RefsPage() {
  const [tab, setTab] = useState("macizos");

  const mockMacizos = [
    { id:1, bg:"#1A1A1A", emoji:"💪", label:"Negro L" },
    { id:2, bg:"#F5F5F5", emoji:"🤍", label:"Blanco M" },
    { id:3, bg:"#8A8A8A", emoji:"🩶", label:"Gris XL" },
    { id:4, bg:"#7B5B3A", emoji:"🤎", label:"Café M" },
    { id:5, bg:"#1A1A1A", emoji:"🖤", label:"Buzo Negro" },
    { id:6, bg:"#8A8A8A", emoji:"🩶", label:"Buzo Gris" },
  ];

  const mockMacizas = [
    { id:7, bg:"#F5F5F5", emoji:"🤍", label:"Blanco S" },
    { id:8, bg:"#1A1A1A", emoji:"🖤", label:"Negro XS" },
    { id:9, bg:"#7B5B3A", emoji:"🤎", label:"Café S" },
    { id:10, bg:"#8A8A8A", emoji:"🩶", label:"Gris M" },
    { id:11, bg:"#8A8A8A", emoji:"🩶", label:"Buzo Gris" },
    { id:12, bg:"#1A1A1A", emoji:"🖤", label:"Buzo Negro" },
  ];

  const items = tab === "macizos" ? mockMacizos : mockMacizas;

  return (
    <div style={{ paddingTop:68 }}>
      {/* Header */}
      <div style={{ background:T.navy, padding:"56px 5% 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:"-1%", top:"50%", transform:"translateY(-50%)", fontFamily:FONT.display, fontSize:"clamp(60px,12vw,140px)", color:"rgba(255,255,255,0.03)", letterSpacing:6, pointerEvents:"none" }}>REFS</div>
        <div style={{ maxWidth:1280, margin:"0 auto", position:"relative" }}>
          <p style={{ fontSize:12, color:T.lime, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Así se ven</p>
          <h1 style={{ fontFamily:FONT.display, fontSize:"clamp(36px,6vw,72px)", color:T.white, letterSpacing:4, marginBottom:8 }}>REFERENCIAS</h1>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:14 }}>Así quedan nuestras prendas en personas reales. Sin filtros raros, sin photoshop exagerado. 💪</p>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"40px 5%" }}>
        {/* Tabs */}
        <div style={{ display:"flex", gap:12, marginBottom:40 }}>
          <button onClick={() => setTab("macizos")}
            style={{ padding:"12px 32px", background: tab==="macizos" ? T.navy : T.white, color: tab==="macizos" ? T.white : T.black, border:`1.5px solid ${tab==="macizos" ? T.navy : T.borderL}`, borderRadius:10, fontSize:15, fontWeight:700, letterSpacing:1 }}>
            💪 Nuestros Macizos
          </button>
          <button onClick={() => setTab("macizas")}
            style={{ padding:"12px 32px", background: tab==="macizas" ? "#8B1A6B" : T.white, color: tab==="macizas" ? T.white : T.black, border:`1.5px solid ${tab==="macizas" ? "#8B1A6B" : T.borderL}`, borderRadius:10, fontSize:15, fontWeight:700, letterSpacing:1 }}>
            💅 Nuestras Macizas
          </button>
        </div>

        {/* Texto motivacional */}
        <div style={{ background: tab==="macizos" ? T.navy : "#8B1A6B", borderRadius:16, padding:"28px 32px", marginBottom:40, display:"flex", alignItems:"center", gap:20 }}>
          <span style={{ fontSize:48 }}>{tab==="macizos" ? "💪" : "💅"}</span>
          <div>
            <h2 style={{ fontFamily:FONT.display, fontSize:28, letterSpacing:3, color:T.white, marginBottom:6 }}>
              {tab==="macizos" ? "NUESTROS MACIZOS" : "NUESTRAS MACIZAS"}
            </h2>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:14, lineHeight:1.6 }}>
              {tab==="macizos"
                ? "Aquí van las fotos de nuestros modelos luciendo las prendas. Personas reales, resultados reales. Próximamente subimos las fotos — por ahora imagínate lo bien que te va a quedar. 😏"
                : "Aquí van las fotos de nuestras modelos. Porque las Macizas también merecen su espacio. Próximamente subimos las fotos — spoiler: se ven increíbles. 💅"
              }
            </p>
          </div>
        </div>

        {/* Grid de referencias — placeholder hasta tener fotos reales */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:16 }}>
          {items.map(item => (
            <div key={item.id} className="ref-card" style={{ borderRadius:16, overflow:"hidden", border:`1px solid ${T.borderL}`, background:T.white }}>
              <div style={{ background:item.bg, paddingBottom:"130%", position:"relative" }}>
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <span style={{ fontSize:48 }}>{item.emoji}</span>
                  <span style={{ fontFamily:FONT.display, fontSize:13, color: item.bg==="#F5F5F5"?"rgba(0,0,0,0.3)":"rgba(255,255,255,0.3)", letterSpacing:2 }}>FOTO PRÓXIMAMENTE</span>
                </div>
              </div>
              <div style={{ padding:"12px 16px" }}>
                <p style={{ fontSize:13, fontWeight:600, color:T.black }}>{item.label}</p>
                <p style={{ fontSize:11, color:T.muted, marginTop:2 }}>{tab==="macizos" ? "Macizos" : "Macizas"} · {tab==="macizos" ? "Línea hombre" : "Línea mujer"}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center", marginTop:48, padding:"32px", background:T.offWhite, borderRadius:16 }}>
          <p style={{ fontSize:32 }}>📸</p>
          <p style={{ fontFamily:FONT.display, fontSize:22, letterSpacing:2, marginTop:12, marginBottom:8 }}>¿QUIERES SER MODELO MACIZOS?</p>
          <p style={{ color:T.muted, fontSize:14, maxWidth:400, margin:"0 auto 20px" }}>Escríbenos por Instagram y te contactamos. Sale gratis la ropa si quedas 😎</p>
          <a href="https://instagram.com/macizos.cl" target="_blank" rel="noreferrer"
            style={{ display:"inline-block", padding:"12px 32px", background:T.navy, color:T.white, borderRadius:10, fontSize:14, fontWeight:700, letterSpacing:1 }}>
            @macizos.cl →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ───
function AboutPage({ setPage }) {
  return (
    <div style={{ paddingTop:68 }}>
      <div style={{ background:T.navy, padding:"72px 5% 64px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", fontFamily:FONT.display, fontSize:"clamp(80px,14vw,180px)", color:"rgba(255,255,255,0.03)", letterSpacing:8, pointerEvents:"none" }}>NOSOTROS</div>
        <div style={{ maxWidth:1280, margin:"0 auto", position:"relative" }}>
          <p style={{ fontSize:12, color:T.lime, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>Nuestra historia</p>
          <h1 style={{ fontFamily:FONT.display, fontSize:"clamp(42px,7vw,88px)", color:T.white, letterSpacing:4, lineHeight:1, marginBottom:20 }}>
            POR QUÉ<br/><span style={{ color:T.lime }}>MACIZOS.</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.5)", maxWidth:600, lineHeight:1.8 }}>
            Macizos nace de la idea como bien dice el nombre, sentirnos Macizos. De querer verse bien entrenando sin importar cuánto llevas entrenando. Somos fieles creyentes de que una buena prenda lo es todo.
          </p>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"72px 5%" }}>
        {[
          {
            tag:"El problema",
            title:"LA ROPA DE GYM ERA FEA O CARA",
            text:"Buscábamos poleras para entrenar que fueran cómodas de verdad — oversize, con tela buena, que no se pegaran al cuerpo. Que se vieran bien tanto en el gym como en la calle. No existía eso en Chile a precio justo."
          },
          {
            tag:"La idea",
            title:"VISTE BIEN, VISTE MACIZO 😎",
            text:"Creamos MACIZOS con una premisa simple: la ropa para entrenar tiene que hacerte sentir cómodo y verte bien desde el momento en que te la pones. No importa si llevas 2 meses en el gym o 10 años. No importa tu peso ni tu condición física. Si te ves macizo, te motivas. Y si te motivas, entrenas. Punto."
          },
          {
            tag:"El producto",
            title:"NUESTRAS OVERSIZE Y BUZOS BAGGY CON PROPÓSITO",
            text:"Elegimos nuestros productos oversize en poleras y baggy en buzos porque son los cortes que mejor le quedan a todos los cuerpos durante el entrenamiento. Dan libertad de movimiento, no marcan, y tienen una estética limpia y moderna. La tela es heavyweight — se siente premium y dura mucho más que una polera corriente. Vestirse Macizo es sentirte cómodo y darle su corte 😎 desde que te pones la prenda."
          },
        ].map((s, i) => (
          <div key={i} style={{ marginBottom:60, paddingBottom:60, borderBottom: i<2 ? `1px solid ${T.borderL}` : "none" }}>
            <span style={{ display:"inline-block", background:T.lime, color:T.black, padding:"3px 12px", borderRadius:4, fontSize:11, fontWeight:800, letterSpacing:2, marginBottom:14, textTransform:"uppercase" }}>{s.tag}</span>
            <h2 style={{ fontFamily:FONT.display, fontSize:"clamp(20px,3vw,32px)", letterSpacing:2, marginBottom:16, lineHeight:1.1 }}>{s.title}</h2>
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

// ─── CONTACT PAGE ───
function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name:"", email:"", message:"" });

  return (
    <div style={{ paddingTop:68 }}>
      <div style={{ background:T.navy, padding:"64px 5%", textAlign:"center" }}>
        <h1 style={{ fontFamily:FONT.display, fontSize:"clamp(36px,6vw,72px)", color:T.white, letterSpacing:4 }}>CONTACTO</h1>
        <p style={{ color:"rgba(255,255,255,0.4)", marginTop:10, fontSize:14, letterSpacing:1 }}>Escríbenos, respondemos rápido 💪</p>
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
                  style={{ width:"100%", padding:"13px 16px", border:`1.5px solid ${T.borderL}`, borderRadius:10, fontSize:14 }} placeholder={ph}/>
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

// ─── FOOTER ───
function Footer({ setPage }) {
  return (
    <footer style={{ background:T.navyD, color:"rgba(255,255,255,0.55)", padding:"56px 5% 28px" }}>
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
            {["Macizos 💪","Macizas 💅","Promo 2x1","Novedades"].map(l => (
              <button key={l} onClick={() => setPage("store")} style={{ display:"block", fontSize:14, marginBottom:10, color:"rgba(255,255,255,0.45)", textAlign:"left" }}>{l}</button>
            ))}
          </div>
          <div>
            <h3 style={{ fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:T.white, marginBottom:16 }}>Info</h3>
            {["Referencias","Guía de tallas","Envíos","Nosotros"].map(l => (
              <button key={l} onClick={() => setPage(l==="Referencias"?"refs":"about")} style={{ display:"block", fontSize:14, marginBottom:10, color:"rgba(255,255,255,0.45)", textAlign:"left" }}>{l}</button>
            ))}
          </div>
          <div>
            <h3 style={{ fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:T.white, marginBottom:16 }}>Contacto</h3>
            <p style={{ fontSize:14, marginBottom:8 }}>hola@macizos.cl</p>
            <p style={{ fontSize:14, marginBottom:20 }}>@macizos.cl</p>
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

// ─── TOAST ───
function Toast() {
  const { notification } = useContext(CartContext);
  if (!notification) return null;
  return (
    <div className="slide-in" style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:T.navy, border:`1px solid ${T.lime}`, color:T.white, padding:"13px 24px", borderRadius:12, fontSize:14, fontWeight:700, zIndex:300, boxShadow:"0 8px 32px rgba(0,0,0,0.35)", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ color:T.lime, fontSize:16 }}>✓</span> {notification}
    </div>
  );
}

// ─── APP ROOT ───
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
      case "refs":    return <RefsPage/>;
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
