
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import CoriBrand from "../components/CoriBrand";

import "../styles/home.css";


/* SVG icons — identical to Nueva Venta */
function HomeNavIcon({ name }) {
  const shapes = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-8h6v8" /></>,
    pos: <><circle cx="12" cy="12" r="9" /><path d="M12 7v10M7 12h10" /></>,
    products: <><path d="M4 5h12v8a6 6 0 0 1-12 0V5Z" /><path d="M16 6h2a3 3 0 0 1 0 6h-2M3 21h15" /></>,
    inventory: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16M10 4v16" /></>,
    sales: <><path d="M5 21V12M12 21V4M19 21V9" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      {shapes[name]}
    </svg>
  );
}

/* =====================================================
   CORI POS — HOME DASHBOARD
   Coffee Tech Studio / iPad First
===================================================== */

/*
  Cuando tengas el nuevo tutorial, coloca el video en:

  public/videos/cori-dashboard.mp4

  Si aún no existe, el tutorial mostrará instrucciones.
*/

const TUTORIAL_VIDEO = `${
  import.meta.env.BASE_URL
}videos/cori_greeting_and_guiding_57072_Seedance_25.mp4`;
/* =====================================================
   STORAGE
===================================================== */

function read(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));

    if (Array.isArray(fallback)) {
      return Array.isArray(value) ? value : fallback;
    }

    return value &&
      typeof value === "object" &&
      !Array.isArray(value)
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}

function amount(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
}

function saleDate(sale) {
  const date = new Date(sale?.date);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getSaleItems(sale) {
  const items =
    sale?.items ||
    sale?.cart ||
    sale?.products ||
    [];

  return Array.isArray(items) ? items : [];
}

function Avatar({ employee }) {
  const [failed, setFailed] = useState(false);
  const photo = employee?.photo;

  useEffect(() => {
    setFailed(false);
  }, [photo]);

  if (photo && !failed) {
    return (
      <img
        className="ch-avatar"
        src={photo}
        alt=""
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className="ch-avatar ch-initial"
      aria-hidden="true"
    >
      {String(employee?.name || "C")
        .trim()
        .charAt(0)
        .toUpperCase()}
    </span>
  );
}

/* =====================================================
   CORI ASSISTANT VISUAL
   Uses existing greeting video as a visual preview.
===================================================== */

function CoriPreview({ onClick, label }) {
  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <button
      type="button"
      className="ch-cori-avatar-button"
      onClick={onClick}
      aria-label={label}
    >
      <div className="ch-cori-orbit" />

      {!videoFailed ? (
        <video
          ref={videoRef}
          className="ch-cori-preview-video"
          src={`${
            import.meta.env.BASE_URL
          }videos/cori_greeting_and_guiding_57072_Seedance_25.mp4`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
        />
      ) : (
        <div className="ch-cori-fallback">
          <span>☕</span>
          <strong>CORI</strong>
        </div>
      )}

      <span className="ch-cori-play">
        ▶
      </span>
    </button>
  );
}

/* =====================================================
   HOME
===================================================== */

export default function Home({ goTo }) {
  const { i18n } = useTranslation();

  const es = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "es"
  ).startsWith("es");

  const text = (spanish, english) =>
    es ? spanish : english;

  const [filter, setFilter] = useState("today");
  const [, refresh] = useState(0);
  const [error, setError] = useState("");
  const [tutorialVideoFailed, setTutorialVideoFailed] =
    useState(false);

  const tutorialRef = useRef(null);
  const checkoutRef = useRef(null);
  const tutorialPlayerRef = useRef(null);

  /* =====================================================
     REFRESH STORAGE
  ===================================================== */

  useEffect(() => {
    const update = () => refresh((n) => n + 1);

    window.addEventListener("storage", update);
    window.addEventListener("focus", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
    };
  }, []);

  /* =====================================================
     DATA
  ===================================================== */

  const allSales = read("sales", []);
  const products = read("products", []);
  const storeSettings = read("storeSettings", {});
  const activeEmployee = read("activeEmployee", null);
  const employeeHistory = read("employeeHistory", []);

  const activeBranch =
    localStorage.getItem("activeBranch") ||
    storeSettings.shopName ||
    "El Cordobés";

  const now = new Date();

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  /* =====================================================
     SALES FILTER
  ===================================================== */

  const sales = allSales.filter((sale) => {
    const date = saleDate(sale);

    if (!date || date > now) return false;

    if (filter === "today") {
      return date.toDateString() === now.toDateString();
    }

    if (filter === "week") {
      return date >= weekStart;
    }

    if (filter === "month") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    return date.getFullYear() === now.getFullYear();
  });

  const revenue = sales.reduce(
    (total, sale) => total + amount(sale.total),
    0
  );

  const average = sales.length
    ? revenue / sales.length
    : 0;

  const money = (value) =>
    new Intl.NumberFormat(
      es ? "es-MX" : "en-US",
      {
        style: "currency",
        currency: "MXN",
      }
    ).format(amount(value));

  const filters = [
    ["today", text("Hoy", "Today")],
    ["week", text("7 días", "7 days")],
    ["month", text("Este mes", "This month")],
    ["year", text("Este año", "This year")],
  ];

  /* =====================================================
     PRODUCT STATISTICS
  ===================================================== */

  const productStats = useMemo(() => {
    const map = new Map();

    sales.forEach((sale) => {
      getSaleItems(sale).forEach((item) => {
        const name = String(
          item.name ||
          item.productName ||
          item.title ||
          item.product?.name ||
          ""
        ).trim();

        if (!name) return;

        const quantity = amount(
          item.quantity ?? item.qty ?? 1
        );

        if (quantity <= 0) return;

        const key = name.toLowerCase();
        const current = map.get(key) || {
          name,
          quantity: 0,
        };

        current.quantity += quantity;
        map.set(key, current);
      });
    });

    return [...map.values()].sort(
      (a, b) => b.quantity - a.quantity
    );
  }, [sales]);

  const productsSold = productStats.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  /* =====================================================
     HOURLY SALES
  ===================================================== */

  const hourlySales = useMemo(() => {
    const totals = Array.from(
      { length: 24 },
      (_, hour) => ({
        hour,
        total: 0,
      })
    );

    sales.forEach((sale) => {
      const date = saleDate(sale);

      if (!date) return;

      totals[date.getHours()].total += amount(
        sale.total
      );
    });

    return totals.filter(
      (item) => item.hour >= 6 && item.hour <= 22
    );
  }, [sales]);

  const maxHourlySales = Math.max(
    1,
    ...hourlySales.map((item) => item.total)
  );

  const bestHour = hourlySales.reduce(
    (best, item) =>
      item.total > best.total ? item : best,
    { hour: 0, total: 0 }
  );

  /* =====================================================
     NAVIGATION
  ===================================================== */

  
const nav = [
  ["home", "home", text("Inicio", "Home")],
  ["pos", "pos", text("Nueva venta", "New sale")],
  ["products", "products", text("Productos", "Products")],
  ["inventory", "inventory", text("Inventario", "Inventory")],
  ["sales", "sales", text("Ventas", "Sales")],
  ["profile", "profile", text("Perfil", "Profile")],
];


  /* =====================================================
     LANGUAGE
  ===================================================== */

  async function changeLanguage(language) {
    try {
      await i18n.changeLanguage(language);
      localStorage.setItem("language", language);
      setError("");
    } catch {
      setError(
        text(
          "No se pudo guardar el idioma.",
          "Could not save the language."
        )
      );
    }
  }

  /* =====================================================
     TUTORIAL
  ===================================================== */

  function openTutorial() {
  setTutorialVideoFailed(false);

  tutorialRef.current?.showModal();

  requestAnimationFrame(() => {
    const video = tutorialPlayerRef.current;

    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {
        // iPad Safari puede requerir pulsar Play.
      });
    }
  });
}

  function closeTutorial() {
    tutorialPlayerRef.current?.pause();
    tutorialRef.current?.close();
  }

  /* =====================================================
     CHECK OUT
  ===================================================== */

  function checkOutEmployee() {
    const employee = read("activeEmployee", null);

    if (!employee) {
      checkoutRef.current?.close();
      goTo("employeeSelect");
      return;
    }

    const history = read("employeeHistory", []);

    let index = -1;

    for (let i = history.length - 1; i >= 0; i--) {
      if (
        history[i]?.id === employee.id &&
        !history[i]?.checkOut
      ) {
        index = i;
        break;
      }
    }

    const time = new Date();

    const updated = history.map((entry, i) =>
      i === index
        ? {
            ...entry,
            checkOut: time.toLocaleTimeString(),
            checkOutAt: time.toISOString(),
            hoursWorked: "Shift Completed",
          }
        : entry
    );

    try {
      localStorage.setItem(
        "employeeHistory",
        JSON.stringify(updated)
      );

      localStorage.removeItem("activeEmployee");

      checkoutRef.current?.close();
      goTo("employeeSelect");
    } catch {
      setError(
        text(
          "No se pudo guardar el cierre.",
          "Could not save checkout."
        )
      );

      checkoutRef.current?.close();
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="cori-home">
      {/* SHARED SIDEBAR */}

      <aside className="ch-sidebar">
        <div className="ch-brand">
          <CoriBrand />
        </div>

        <nav
          aria-label={text(
            "Navegación principal",
            "Main navigation"
          )}
        >
          {nav.map(([route, icon, label]) => (
            <button
              key={route}
              type="button"
              className={
                route === "home" ? "is-active" : ""
              }
              aria-current={
                route === "home" ? "page" : undefined
              }
              aria-label={label}
              onClick={() => goTo(route)}
            >
              <span className="ch-nav-icon" aria-hidden="true">
                <HomeNavIcon name={icon} />
              </span>
              <span className="ch-nav-label">
                {label}
              </span>
            </button>
          ))}
        </nav>

        <div className="ch-sidebar-bottom">
          <button
            type="button"
            className="ch-team-link"
            onClick={() => goTo("employeeSelect")}
          >
            {text(
              "Seleccionar empleado",
              "Select employee"
            )}
            <span>→</span>
          </button>

          {/* LANGUAGE — SIDEBAR */}

          <div
            className="ch-language"
            role="group"
            aria-label={text("Idioma", "Language")}
          >
            <button
              type="button"
              aria-pressed={es}
              onClick={() => changeLanguage("es")}
            >
              Español
            </button>

            <button
              type="button"
              aria-pressed={!es}
              onClick={() => changeLanguage("en")}
            >
              English
            </button>
          </div>

          <p className="ch-sidebar-note">
            BUEN CAFÉ
            <br />
            MEJORES HISTORIAS
          </p>
        </div>
      </aside>

      {/* MAIN */}

      <main className="ch-main">
        {/* HEADER */}

        <header className="ch-header">
          <div>
            <p className="ch-overline">
              CORI POS / DASHBOARD
            </p>

            <h1>
              {text("¡Buen día", "Hello")}
              {activeEmployee?.name
                ? `, ${activeEmployee.name}`
                : ""}
              !
            </h1>

            <p>
              {text(
                "Todo listo para un gran café.",
                "Ready for a great coffee."
              )}
            </p>
          </div>

          <div className="ch-header-right">
            <span className="ch-store">
              {storeSettings.logo && (
                <img
                  src={storeSettings.logo}
                  alt=""
                />
              )}

              {activeBranch}
            </span>
          </div>
        </header>

        {error && (
          <p className="ch-error" role="alert">
            {error}
          </p>
        )}

        {/* EMPLOYEE SHIFT */}

        <section className="ch-shift">
          <div className="ch-employee">
            <Avatar employee={activeEmployee} />

            <div>
              <strong>
                {activeEmployee?.name ||
                  text(
                    "Selecciona tu perfil",
                    "Select your profile"
                  )}
              </strong>

              <small>
                {activeEmployee?.role ||
                  text(
                    "Equipo de cafetería",
                    "Café team"
                  )}

                {activeEmployee?.shift
                  ? ` · ${activeEmployee.shift}`
                  : ""}
              </small>
            </div>
          </div>

          <span
            className={`ch-status ${
              activeEmployee ? "working" : ""
            }`}
          >
            {activeEmployee
              ? text(
                  "● Turno activo",
                  "● Active shift"
                )
              : text(
                  "Sin turno activo",
                  "No active shift"
                )}
          </span>

          {activeEmployee?.checkIn && (
            <span className="ch-checkin">
              {text("Entrada", "Check-in")}{" "}
              {activeEmployee.checkIn}
            </span>
          )}

          <button
            type="button"
            className="ch-button ch-outline"
            onClick={() =>
              activeEmployee
                ? checkoutRef.current?.showModal()
                : goTo("employeeSelect")
            }
          >
            {activeEmployee
              ? text(
                  "Terminar turno →",
                  "Check out →"
                )
              : text(
                  "Seleccionar empleado →",
                  "Select employee →"
                )}
          </button>
        </section>

        {/* HERO */}

        <section className="ch-hero-grid">
          {/* NEW SALE */}

          <article className="ch-sale-hero">
            <div className="ch-sale-copy">
              <p className="ch-eyebrow">
                {text(
                  "CADA CAFÉ CUENTA",
                  "EVERY COFFEE COUNTS"
                )}
              </p>

              <h2>
                {text(
                  "¿Qué vamos a preparar?",
                  "What shall we prepare?"
                )}
              </h2>

              <button
                type="button"
                className="ch-button ch-cream"
                onClick={() => goTo("pos")}
              >
                + {text("Nueva venta", "New sale")}
                <span>→</span>
              </button>
            </div>

            <span
              className="ch-hero-cup"
              aria-hidden="true"
            >
              ☕
            </span>
          </article>

          {/* CORI ACADEMY */}

          <article className="ch-cori-card">
            <div className="ch-cori-copy">
              <p className="ch-eyebrow">
                CORI ACADEMY
              </p>

              <h2>
                {text(
                  "Hola, soy Cori.",
                  "Hi, I'm Cori."
                )}
              </h2>

              <p className="ch-cori-description">
                {text(
                  "Te enseño a utilizar tu dashboard, paso a paso.",
                  "I'll guide you through your dashboard, step by step."
                )}
              </p>

              <button
                type="button"
                className="ch-button ch-primary"
                onClick={openTutorial}
              >
                {text(
                  "Ver tutorial",
                  "Watch tutorial"
                )}
                <span>→</span>
              </button>
            </div>

            <CoriPreview
              onClick={openTutorial}
              label={text(
                "Abrir tutorial de Cori",
                "Open Cori tutorial"
              )}
            />
          </article>
        </section>

        {/* SALES FILTERS */}

        <div className="ch-filter-row">
          <div>
            <p className="ch-overline">
              BUSINESS INTELLIGENCE
            </p>

            <h2>
              {text(
                "Resumen de ventas",
                "Sales overview"
              )}
            </h2>
          </div>

          <div className="ch-filter-buttons">
            {filters.map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* STATS */}

        <section className="ch-stats">
          <article>
            <span>
              {text("Ventas", "Revenue")}
            </span>

            <strong>{money(revenue)}</strong>

            <small>
              MXN ·{" "}
              {filters.find(
                (item) => item[0] === filter
              )?.[1]}
            </small>
          </article>

          <article>
            <span>
              {text(
                "Órdenes registradas",
                "Recorded orders"
              )}
            </span>

            <strong>{sales.length}</strong>

            <small>
              {text(
                "En el periodo seleccionado",
                "In selected period"
              )}
            </small>
          </article>

          <article>
            <span>
              {text(
                "Productos en catálogo",
                "Catalog products"
              )}
            </span>

            <strong>{products.length}</strong>

            <button
              type="button"
              onClick={() => goTo("products")}
            >
              {text(
                "Ver catálogo →",
                "View catalog →"
              )}
            </button>
          </article>

          <article>
            <span>
              {text(
                "Ticket promedio",
                "Average ticket"
              )}
            </span>

            <strong>{money(average)}</strong>

            <small>
              {text(
                "Por orden registrada",
                "Per recorded order"
              )}
            </small>
          </article>
        </section>

        {/* ANALYTICS */}

        <section className="ch-analytics-grid">
          {/* HOURLY SALES */}

          <article className="ch-panel ch-chart-panel">
            <div className="ch-section-title">
              <div>
                <p className="ch-overline">
                  ANALYTICS
                </p>

                <h2>
                  {text(
                    "Ventas por hora",
                    "Hourly sales"
                  )}
                </h2>
              </div>

              <span className="ch-panel-tag">
                MXN
              </span>
            </div>

            <div className="ch-chart">
              {hourlySales.map((item) => (
                <div
                  key={item.hour}
                  className="ch-chart-column"
                  title={`${item.hour}:00 — ${money(
                    item.total
                  )}`}
                >
                  <div className="ch-chart-track">
                    <div
                      className="ch-chart-bar"
                      style={{
                        height: `${
                          item.total > 0
                            ? Math.max(
                                4,
                                (item.total /
                                  maxHourlySales) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <small>
                    {item.hour}
                  </small>
                </div>
              ))}
            </div>

            <p className="ch-chart-footnote">
              {bestHour.total > 0
                ? text(
                    `Hora de mayor venta: ${bestHour.hour}:00 · ${money(bestHour.total)}`,
                    `Best sales hour: ${bestHour.hour}:00 · ${money(bestHour.total)}`
                  )
                : text(
                    "Aún no hay ventas en este periodo.",
                    "No sales in this period yet."
                  )}
            </p>
          </article>

          {/* TOP PRODUCTS */}

          <article className="ch-panel ch-top-products">
            <div className="ch-section-title">
              <div>
                <p className="ch-overline">
                  PRODUCT PERFORMANCE
                </p>

                <h2>
                  {text(
                    "Más vendidos",
                    "Best sellers"
                  )}
                </h2>
              </div>

              <span className="ch-panel-tag">
                TOP 5
              </span>
            </div>

            {productStats.length === 0 ? (
              <p className="ch-empty">
                {text(
                  "Los productos más vendidos aparecerán cuando tus órdenes incluyan el detalle de productos.",
                  "Best-selling products will appear when orders include item details."
                )}
              </p>
            ) : (
              productStats
                .slice(0, 5)
                .map((product, index) => (
                  <div
                    className="ch-product-row"
                    key={product.name}
                  >
                    <span className="ch-product-rank">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <div className="ch-product-detail">
                      <strong>
                        {product.name}
                      </strong>

                      <div className="ch-product-progress">
                        <span
                          style={{
                            width: `${
                              (product.quantity /
                                productStats[0]
                                  .quantity) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <span className="ch-product-qty">
                      {product.quantity}
                    </span>
                  </div>
                ))
            )}

            <div className="ch-products-total">
              <span>
                {text(
                  "Unidades registradas",
                  "Recorded units"
                )}
              </span>

              <strong>{productsSold}</strong>
            </div>
          </article>
        </section>

        {/* CORI INSIGHTS */}

        <section className="ch-insights">
          <div className="ch-insights-icon">
            ✦
          </div>

          <div className="ch-insights-content">
            <p className="ch-overline">
              CORI INSIGHTS
            </p>

            <h2>
              {text(
                "Tu cafetería, más inteligente.",
                "A smarter coffee shop."
              )}
            </h2>

            <p>
              {sales.length === 0
                ? text(
                    "Registra tus primeras ventas para comenzar a descubrir el comportamiento de tu cafetería.",
                    "Record your first sales to start discovering your café's performance."
                  )
                : bestHour.total > 0
                ? text(
                    `Llevas ${sales.length} órdenes y ${money(revenue)} en ventas durante el periodo seleccionado. Tu hora de mayor facturación registrada es ${bestHour.hour}:00.`,
                    `You have ${sales.length} orders and ${money(revenue)} in sales for the selected period. Your highest recorded sales hour is ${bestHour.hour}:00.`
                  )
                : text(
                    "Tus estadísticas se actualizarán conforme registres ventas.",
                    "Your statistics will update as you record sales."
                  )}
            </p>
          </div>

          <button
            type="button"
            className="ch-button ch-outline"
            onClick={openTutorial}
          >
            {text(
              "Aprender con Cori →",
              "Learn with Cori →"
            )}
          </button>
        </section>

        {/* RECENT ORDERS / TEAM HISTORY */}

        <section className="ch-lower-grid">
          <article className="ch-panel">
            <div className="ch-section-title">
              <h2>
                {text(
                  "Órdenes recientes",
                  "Recent orders"
                )}
              </h2>

              <button
                type="button"
                onClick={() => goTo("sales")}
              >
                {text(
                  "Ver todas →",
                  "View all →"
                )}
              </button>
            </div>

            {sales.length === 0 && (
              <p className="ch-empty">
                {text(
                  "Tus ventas aparecerán aquí cuando registres la primera orden.",
                  "Your sales will appear after your first order."
                )}
              </p>
            )}

            {[...sales]
              .sort(
                (a, b) =>
                  new Date(b.date) -
                  new Date(a.date)
              )
              .slice(0, 6)
              .map((sale, index) => (
                <article
                  className="ch-list-row"
                  key={
                    sale.id ||
                    `${sale.orderNumber}-${index}`
                  }
                >
                  <div>
                    <h3>
                      {text("Orden", "Order")} #
                      {sale.orderNumber ?? "—"}
                    </h3>

                    <p>
                      {sale.customerName ||
                        text("Cliente", "Guest")}
                    </p>
                  </div>

                  <div className="ch-row-right">
                    <strong>
                      {money(sale.total)}
                    </strong>

                    {sale.paymentMethod && (
                      <small>
                        {sale.paymentMethod}
                      </small>
                    )}
                  </div>
                </article>
              ))}
          </article>

          <article className="ch-panel">
            <div className="ch-section-title">
              <h2>
                {text(
                  "Historial del equipo",
                  "Team history"
                )}
              </h2>
            </div>

            {employeeHistory.length === 0 && (
              <p className="ch-empty">
                {text(
                  "Aún no hay actividad del equipo.",
                  "No team activity yet."
                )}
              </p>
            )}

            {[...employeeHistory]
              .reverse()
              .slice(0, 6)
              .map((employee, index) => (
                <article
                  className="ch-list-row"
                  key={`${employee.id}-${index}`}
                >
                  <div className="ch-team-person">
                    <Avatar employee={employee} />

                    <div>
                      <h3>
                        {employee.name}
                      </h3>

                      <p>
                        {employee.role}
                      </p>
                    </div>
                  </div>

                  <div className="ch-row-right">
                    <small>
                      {employee.checkIn || "—"}
                      {" → "}
                      {employee.checkOut ||
                        text(
                          "En turno",
                          "Working"
                        )}
                    </small>

                    {employee.shift && (
                      <small>
                        {employee.shift}
                      </small>
                    )}
                  </div>
                </article>
              ))}
          </article>
        </section>
      </main>

      {/* TUTORIAL DIALOG */}

      <dialog
        ref={tutorialRef}
        className="ch-dialog ch-tutorial-dialog"
        aria-labelledby="ch-help-title"
        onClose={() =>
          tutorialPlayerRef.current?.pause()
        }
      >
        <div className="ch-dialog-top">
          <p className="ch-eyebrow">
            CORI ACADEMY
          </p>

          <button
            type="button"
            className="ch-dialog-close"
            onClick={closeTutorial}
            aria-label={text("Cerrar", "Close")}
          >
            ×
          </button>
        </div>

        <h2 id="ch-help-title">
          {text(
            "Conoce tu dashboard",
            "Meet your dashboard"
          )}
        </h2>

        {!tutorialVideoFailed ? (
          <video
            ref={tutorialPlayerRef}
            className="ch-tutorial-video"
            src={TUTORIAL_VIDEO}
            controls
            playsInline
            preload="metadata"
            onError={() =>
              setTutorialVideoFailed(true)
            }
          />
        ) : (
          <div className="ch-video-placeholder">
            <span>▶</span>

            <strong>
              {text(
                "Próximamente: Tutorial de Cori",
                "Coming soon: Cori tutorial"
              )}
            </strong>

            <small>
              {text(
                "Aquí aparecerá tu nuevo video del dashboard.",
                "Your new dashboard video will appear here."
              )}
            </small>
          </div>
        )}

        <ol>
          <li>
            {text(
              "Selecciona tu perfil de empleado.",
              "Select your employee profile."
            )}
          </li>

          <li>
            {text(
              "Pulsa Nueva venta para abrir el POS.",
              "Tap New sale to open the POS."
            )}
          </li>

          <li>
            {text(
              "Consulta tus ventas, órdenes y productos.",
              "Review sales, orders, and products."
            )}
          </li>

          <li>
            {text(
              "Termina tu turno cuando finalices tu jornada.",
              "Check out at the end of your shift."
            )}
          </li>
        </ol>

        <button
          type="button"
          className="ch-button ch-primary"
          onClick={closeTutorial}
        >
          {text("Entendido", "Got it")} →
        </button>
      </dialog>

      {/* CHECKOUT DIALOG */}

      <dialog
        ref={checkoutRef}
        className="ch-dialog"
        aria-labelledby="ch-checkout-title"
      >
        <h2 id="ch-checkout-title">
          {text(
            "¿Terminar tu turno?",
            "End your shift?"
          )}
        </h2>

        <p>
          {text(
            "Se guardará tu hora de salida y volverás a la selección de empleados.",
            "Your checkout time will be saved and you will return to employee selection."
          )}
        </p>

        <div className="ch-dialog-actions">
          <button
            type="button"
            className="ch-button ch-outline"
            onClick={() =>
              checkoutRef.current?.close()
            }
          >
            {text(
              "Continuar turno",
              "Keep working"
            )}
          </button>

          <button
            type="button"
            className="ch-button ch-primary"
            onClick={checkOutEmployee}
          >
            {text(
              "Terminar turno",
              "Check out"
            )}
          </button>
        </div>
      </dialog>
    </div>
  );
}
