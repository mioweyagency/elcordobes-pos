
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import SalesReportCard from "../components/SalesReportCard";

import "../styles/home.css";
import "../styles/sales.css";

const currency = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value) || 0);

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getSaleDate(sale) {
  const raw = sale.createdAt ?? sale.date ?? sale.timestamp;

  if (typeof raw === "number") {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (!raw) return null;

  if (typeof raw === "string") {
    const match = raw.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(.+))?$/
    );

    if (match) {
      // Interpreta DD/MM/YYYY cuando el dato no es ISO.
      const [, day, month, year, time] = match;
      const parsed = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      );

      if (time) {
        const withTime = new Date(
          `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${time}`
        );

        if (!Number.isNaN(withTime.getTime())) {
          return withTime;
        }
      }

      return parsed;
    }
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getPaymentType(method) {
  const value = String(method || "").toLowerCase();

  if (
    value.includes("card") ||
    value.includes("tarjeta") ||
    value.includes("credit") ||
    value.includes("debit")
  ) {
    return "card";
  }

  if (value.includes("cash") || value.includes("efectivo")) {
    return "cash";
  }

  return "other";
}

function SalesIcon({ name, size = 21 }) {
  const paths = {
    revenue: (
      <>
        <path d="M3 17 9 11l4 4 8-9" />
        <path d="M15 6h6v6" />
      </>
    ),
    orders: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    average: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    card: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M2 10h20M6 15h4" />
      </>
    ),
    cash: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M5 9h.01M19 15h.01" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="12" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
    share: (
      <>
        <path d="M12 16V3M7 8l5-5 5 5" />
        <path d="M4 14v6h16v-6" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function Sales({ goTo }) {
  const { i18n } = useTranslation();

  const es = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "es"
  ).startsWith("es");

  const t = (spanish, english) =>
    es ? spanish : english;

  const reportRef = useRef(null);

  const [sales, setSales] = useState(() =>
    readJSON("sales", [])
  );

  const [storeSettings, setStoreSettings] = useState(() =>
    readJSON("storeSettings", {})
  );

  const [activeBranch, setActiveBranch] = useState(
    () => localStorage.getItem("activeBranch") || "Main Branch"
  );

  const [period, setPeriod] = useState("all");
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [feedback, setFeedback] = useState("");
  const [exporting, setExporting] = useState(false);

  function refreshSales() {
    const savedSales = readJSON("sales", []);

    setSales(Array.isArray(savedSales) ? savedSales : []);
    setStoreSettings(readJSON("storeSettings", {}));
    setActiveBranch(
      localStorage.getItem("activeBranch") || "Main Branch"
    );
  }

  useEffect(() => {
    window.addEventListener("focus", refreshSales);
    window.addEventListener("storage", refreshSales);

    return () => {
      window.removeEventListener("focus", refreshSales);
      window.removeEventListener("storage", refreshSales);
    };
  }, []);

  const periodLabels = {
    today: t("Hoy", "Today"),
    week: t("Últimos 7 días", "Last 7 days"),
    month: t("Últimos 30 días", "Last 30 days"),
    all: t("Todo el historial", "All time"),
  };

  const periodSales = useMemo(() => {
    if (!Array.isArray(sales)) return [];

    if (period === "all") return sales;

    const now = new Date();
    const start = new Date(now);

    if (period === "today") {
      start.setHours(0, 0, 0, 0);
    } else {
      const days = period === "week" ? 7 : 30;
      start.setDate(start.getDate() - (days - 1));
      start.setHours(0, 0, 0, 0);
    }

    return sales.filter((sale) => {
      const date = getSaleDate(sale);
      return date && date >= start && date <= now;
    });
  }, [sales, period]);

  const analytics = useMemo(() => {
    const revenue = periodSales.reduce(
      (sum, sale) => sum + (Number(sale.total) || 0),
      0
    );

    const orders = periodSales.length;
    const averageTicket = orders ? revenue / orders : 0;

    let cardPayments = 0;
    let cashPayments = 0;
    let otherPayments = 0;

    const productCount = {};

    periodSales.forEach((sale) => {
      const type = getPaymentType(sale.paymentMethod);

      if (type === "card") cardPayments += 1;
      else if (type === "cash") cashPayments += 1;
      else otherPayments += 1;

      const items = Array.isArray(sale.items) ? sale.items : [];

      items.forEach((item) => {
        const name = String(item.name || "").trim();
        if (!name) return;

        productCount[name] =
          (productCount[name] || 0) +
          (Number(item.quantity) || 1);
      });
    });

    const rankedProducts = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1]);

    const topProduct =
      rankedProducts[0]?.[0] ||
      t("Sin productos", "No products");

    return {
      revenue,
      orders,
      averageTicket,
      cardPayments,
      cashPayments,
      otherPayments,
      topProduct,
      rankedProducts,
    };
  }, [periodSales, es]);

  const history = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...periodSales]
      .filter((sale) => {
        const matchesPayment =
          paymentFilter === "all" ||
          getPaymentType(sale.paymentMethod) === paymentFilter;

        const searchable = [
          sale.orderNumber,
          sale.customerName,
          sale.date,
          ...(Array.isArray(sale.items)
            ? sale.items.map((item) => item.name)
            : []),
        ]
          .join(" ")
          .toLowerCase();

        return matchesPayment && searchable.includes(term);
      })
      .sort((a, b) => {
        const dateA = getSaleDate(a)?.getTime() || 0;
        const dateB = getSaleDate(b)?.getTime() || 0;
        return dateB - dateA;
      });
  }, [periodSales, search, paymentFilter]);

  const chartData = useMemo(() => {
    const now = new Date();
    const days = period === "month" ? 30 : 7;

    const buckets = [];

    for (let i = days - 1; i >= 0; i -= 1) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);

      buckets.push({
        key: `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`,
        label: day.toLocaleDateString(es ? "es-MX" : "en-US", {
          weekday: days === 7 ? "short" : undefined,
          day: days === 30 ? "numeric" : undefined,
        }),
        value: 0,
      });
    }

    periodSales.forEach((sale) => {
      const date = getSaleDate(sale);
      if (!date) return;

      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const bucket = buckets.find((entry) => entry.key === key);

      if (bucket) {
        bucket.value += Number(sale.total) || 0;
      }
    });

    return buckets;
  }, [periodSales, period, es]);

  const maxChartValue = Math.max(
    1,
    ...chartData.map((day) => day.value)
  );

  const reportText = [
    "CORI POS BY EL CORDOBÉS",
    t("REPORTE DE VENTAS", "SALES REPORT"),
    "",
    `${t("Período", "Period")}: ${periodLabels[period]}`,
    `${t("Cafetería", "Coffee shop")}: ${
      storeSettings.shopName || "Coffee Shop"
    }`,
    `${t("Sucursal", "Branch")}: ${activeBranch}`,
    "",
    `${t("Ingresos", "Revenue")}: ${currency(analytics.revenue)}`,
    `${t("Órdenes", "Orders")}: ${analytics.orders}`,
    `${t("Ticket promedio", "Average ticket")}: ${currency(
      analytics.averageTicket
    )}`,
    `${t("Pagos con tarjeta", "Card payments")}: ${
      analytics.cardPayments
    }`,
    `${t("Pagos en efectivo", "Cash payments")}: ${
      analytics.cashPayments
    }`,
    `${t("Otros pagos", "Other payments")}: ${
      analytics.otherPayments
    }`,
    `${t("Producto más vendido", "Top product")}: ${
      analytics.topProduct
    }`,
    "",
    "Generated by CORI POS",
  ].join("\n");

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(reportText);

      setFeedback(
        t("Reporte copiado.", "Report copied.")
      );
    } catch {
      setFeedback(
        t(
          "No se pudo copiar el reporte.",
          "Could not copy the report."
        )
      );
    }
  }

  async function exportReportImage() {
    if (!reportRef.current || exporting) return;

    setExporting(true);
    setFeedback("");

    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#1b281e",
        scale: Math.min(window.devicePixelRatio || 1, 2),
        useCORS: true,
      });

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) {
        throw new Error("Could not create report image");
      }

      const file = new File([blob], "cori-sales-report.png", {
        type: "image/png",
      });

      if (
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: t("Reporte de ventas", "Sales report"),
            text: reportText,
            files: [file],
          });
          return;
        } catch (err) {
          if (err.name === "AbortError") return;
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "cori-sales-report.png";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setFeedback(
        t("Reporte descargado.", "Report downloaded.")
      );
    } catch (err) {
      console.error("Sales report export error:", err);
      setFeedback(
        t(
          "No se pudo exportar el reporte.",
          "Could not export the report."
        )
      );
    } finally {
      setExporting(false);
    }
  }

  const stats = [
    {
      icon: "revenue",
      label: t("Ingresos", "Revenue"),
      value: currency(analytics.revenue),
      caption: t("Ventas registradas", "Recorded sales"),
    },
    {
      icon: "orders",
      label: t("Órdenes", "Orders"),
      value: analytics.orders,
      caption: t("Tickets completados", "Completed tickets"),
    },
    {
      icon: "average",
      label: t("Ticket promedio", "Average ticket"),
      value: currency(analytics.averageTicket),
      caption: t("Por orden", "Per order"),
    },
    {
      icon: "card",
      label: t("Tarjeta", "Card"),
      value: analytics.cardPayments,
      caption: t("Pagos registrados", "Recorded payments"),
    },
    {
      icon: "cash",
      label: t("Efectivo", "Cash"),
      value: analytics.cashPayments,
      caption: t("Pagos registrados", "Recorded payments"),
    },
  ];

  return (
    <div className="cori-home cori-sales-page">
  <Sidebar goTo={goTo} active="sales" />

  <main className="ch-main cori-sales-main">
        <Topbar
          title={t("Ventas", "Sales")}
          subtitle="CORI POS / SALES ANALYTICS"
        />

        <div className="sales-page-content">
          <header className="sales-page-header">
            <div>
              <p className="sales-eyebrow">
                CORI POS / BUSINESS INTELLIGENCE
              </p>

              <h1>{t("Tus ventas", "Your sales")}</h1>

              <p className="sales-page-description">
                {t(
                  "Cada venta cuenta. Descubre cómo está creciendo tu cafetería.",
                  "Every sale matters. See how your coffee shop is growing."
                )}
              </p>
            </div>

            <button
              type="button"
              className="sales-refresh-btn"
              onClick={refreshSales}
            >
              ↻ {t("Actualizar", "Refresh")}
            </button>
          </header>

          <section className="sales-hero">
            <div>
              <p className="sales-eyebrow">
                {t("RESUMEN FINANCIERO", "FINANCIAL OVERVIEW")}
              </p>

              <h2>
                {t(
                  "El ritmo de tu cafetería.",
                  "The rhythm of your coffee shop."
                )}
              </h2>

              <p>
                {t(
                  "Consulta tus resultados, revisa tus órdenes y comparte reportes con tu equipo.",
                  "Review your results, track orders and share reports with your team."
                )}
              </p>
            </div>

            <div className="sales-hero-mark" aria-hidden="true">
              ✦
            </div>
          </section>

          <div className="sales-period-row">
            <div className="sales-period-buttons">
              {[
                ["today", t("Hoy", "Today")],
                ["week", t("7 días", "7 days")],
                ["month", t("30 días", "30 days")],
                ["all", t("Todo", "All")],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={
                    period === key
                      ? "sales-period-btn active"
                      : "sales-period-btn"
                  }
                  aria-pressed={period === key}
                  onClick={() => setPeriod(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <span className="sales-period-label">
              {periodLabels[period]}
            </span>
          </div>

          <section className="sales-stats-grid">
            {stats.map((stat) => (
              <article className="sales-stat-card" key={stat.icon}>
                <div className="sales-stat-icon">
                  <SalesIcon name={stat.icon} />
                </div>

                <span>{stat.label}</span>
                <h2>{stat.value}</h2>
                <small>{stat.caption}</small>
              </article>
            ))}
          </section>

          <section className="sales-analytics-grid">
            <article className="sales-chart-panel">
              <div className="sales-panel-heading">
                <div>
                  <p className="sales-eyebrow">
                    {t("RENDIMIENTO", "PERFORMANCE")}
                  </p>
                  <h2>
                    {t(
                      "Tendencia de ingresos",
                      "Revenue trend"
                    )}
                  </h2>
                </div>

                <strong>{currency(analytics.revenue)}</strong>
              </div>

              <div className="sales-chart" role="img" aria-label={t(
                "Gráfico de ventas recientes",
                "Recent sales chart"
              )}>
                {chartData.map((day) => (
                  <div className="sales-chart-column" key={day.key}>
                    <div className="sales-chart-track">
                      <div
                        className="sales-chart-bar"
                        style={{
                          height: `${
                            day.value > 0
                              ? Math.max(
                                  4,
                                  (day.value / maxChartValue) * 100
                                )
                              : 0
                          }%`,
                        }}
                        title={`${day.label}: ${currency(
                          day.value
                        )}`}
                      />
                    </div>

                    <span>{day.label}</span>
                  </div>
                ))}
              </div>

              <p className="sales-chart-note">
                {t(
                  "Gráfico de los últimos días con ventas registradas en tu sistema.",
                  "Recent daily performance based on recorded sales."
                )}
              </p>
            </article>

            <article className="sales-top-products">
              <div className="sales-panel-heading">
                <div>
                  <p className="sales-eyebrow">
                    {t("PREFERENCIAS", "CUSTOMER FAVORITES")}
                  </p>

                  <h2>
                    {t(
                      "Más vendidos",
                      "Top products"
                    )}
                  </h2>
                </div>
              </div>

              {analytics.rankedProducts.length === 0 ? (
                <p className="sales-no-products">
                  {t(
                    "Aún no hay productos vendidos en este período.",
                    "No products sold in this period yet."
                  )}
                </p>
              ) : (
                <div className="sales-top-list">
                  {analytics.rankedProducts
                    .slice(0, 5)
                    .map(([name, quantity], index) => (
                      <div
                        className="sales-top-item"
                        key={name}
                      >
                        <span className="sales-top-rank">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="sales-top-name">
                          {name}
                        </span>

                        <strong>
                          {quantity}{" "}
                          <small>
                            {t("uds.", "units")}
                          </small>
                        </strong>
                      </div>
                    ))}
                </div>
              )}
            </article>
          </section>

          <section className="sales-report-section">
            <div className="sales-section-heading">
              <div>
                <p className="sales-eyebrow">
                  {t("REPORTES", "REPORTS")}
                </p>

                <h2>
                  {t(
                    "Reporte de ventas",
                    "Sales report"
                  )}
                </h2>
              </div>

              <span>
                {periodLabels[period]}
              </span>
            </div>

            <div ref={reportRef}>
              <SalesReportCard
                revenue={analytics.revenue}
                orders={analytics.orders}
                averageTicket={analytics.averageTicket}
                cardPayments={analytics.cardPayments}
                cashPayments={analytics.cashPayments}
                topProduct={analytics.topProduct}
                storeSettings={storeSettings}
                activeBranch={activeBranch}
                periodLabel={periodLabels[period]}
                otherPayments={analytics.otherPayments}
                es={es}
              />
            </div>

            <div className="report-actions">
              <button
                type="button"
                className="report-btn secondary"
                onClick={copyReport}
              >
                <SalesIcon name="copy" size={17} />
                {t("Copiar reporte", "Copy report")}
              </button>

              <button
                type="button"
                className="report-btn"
                onClick={exportReportImage}
                disabled={exporting}
              >
                <SalesIcon name="share" size={17} />
                {exporting
                  ? t("Preparando...", "Preparing...")
                  : t(
                      "Compartir reporte",
                      "Share report"
                    )}
              </button>
            </div>

            {feedback && (
              <p className="sales-feedback" role="status">
                {feedback}
              </p>
            )}
          </section>

          <section className="sales-history">
            <div className="sales-history-header">
              <div>
                <p className="sales-eyebrow">
                  {t("ACTIVIDAD", "ACTIVITY")}
                </p>

                <h2>
                  {t(
                    "Historial de ventas",
                    "Sales history"
                  )}
                </h2>
              </div>

              <span>
                {history.length}{" "}
                {t("resultados", "results")}
              </span>
            </div>

            <div className="sales-history-toolbar">
              <div className="sales-history-search">
                <SalesIcon name="search" size={18} />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder={t(
                    "Buscar orden, cliente o producto...",
                    "Search order, customer or product..."
                  )}
                />
              </div>

              <select
                className="sales-payment-filter"
                value={paymentFilter}
                onChange={(event) =>
                  setPaymentFilter(event.target.value)
                }
                aria-label={t(
                  "Filtrar por método de pago",
                  "Filter by payment method"
                )}
              >
                <option value="all">
                  {t("Todos los pagos", "All payments")}
                </option>
                <option value="card">
                  {t("Tarjeta", "Card")}
                </option>
                <option value="cash">
                  {t("Efectivo", "Cash")}
                </option>
                <option value="other">
                  {t("Otros", "Other")}
                </option>
              </select>
            </div>

            <div className="sales-history-list">
              {history.length === 0 ? (
                <div className="sales-empty">
                  <span aria-hidden="true">☕</span>
                  <h3>
                    {t(
                      "No encontramos ventas",
                      "No sales found"
                    )}
                  </h3>
                  <p>
                    {t(
                      "Prueba otro período o filtro.",
                      "Try another period or filter."
                    )}
                  </p>
                </div>
              ) : (
                history.map((sale, index) => (
                  <article
                    className="history-card"
                    key={
                      sale.id ??
                      `${sale.orderNumber ?? "order"}-${index}`
                    }
                  >
                    <div className="history-left">
                      <h3>
                        {t("ORDEN", "ORDER")} #
                        {sale.orderNumber ?? "—"}
                      </h3>

                      <p>
                        {sale.customerName ||
                          t("Invitado", "Guest")}
                      </p>

                      <span>
                        {sale.date ||
                          getSaleDate(sale)?.toLocaleString(
                            es ? "es-MX" : "en-US"
                          ) ||
                          "—"}
                      </span>
                    </div>

                    <div className="history-center">
                      {(Array.isArray(sale.items)
                        ? sale.items
                        : []
                      ).map((item, itemIndex) => (
                        <span
                          className="history-item"
                          key={itemIndex}
                        >
                          {Number(item.quantity) || 1}×{" "}
                          {item.name}
                        </span>
                      ))}
                    </div>

                    <div className="history-right">
                      <h2>{currency(sale.total)}</h2>

                      <span className="payment-badge">
                        {getPaymentType(
                          sale.paymentMethod
                        ) === "card"
                          ? t("Tarjeta", "Card")
                          : getPaymentType(
                              sale.paymentMethod
                            ) === "cash"
                          ? t("Efectivo", "Cash")
                          : sale.paymentMethod ||
                            t("Otro", "Other")}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="sales-insights">
            <div className="sales-insights-symbol">✦</div>

            <div>
              <p className="sales-eyebrow">CORI INSIGHTS</p>

              <h3>
                {analytics.orders > 0
                  ? t(
                      "Conoce lo que impulsa tus ventas.",
                      "Know what drives your sales."
                    )
                  : t(
                      "Tu historia de ventas comienza aquí.",
                      "Your sales story starts here."
                    )}
              </h3>

              <p>
                {analytics.orders > 0
                  ? t(
                      `Tu ticket promedio es ${currency(
                        analytics.averageTicket
                      )} y tu producto más vendido es ${analytics.topProduct}.`,
                      `Your average ticket is ${currency(
                        analytics.averageTicket
                      )}, and your top product is ${analytics.topProduct}.`
                    )
                  : t(
                      "Cuando registres ventas, Cori mostrará información útil sobre tus resultados.",
                      "Once you record sales, Cori will show useful insights about your performance."
                    )}
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
