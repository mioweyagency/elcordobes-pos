
const formatMoney = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value) || 0);

export default function SalesReportCard({
  revenue = 0,
  orders = 0,
  averageTicket = 0,
  cardPayments = 0,
  cashPayments = 0,
  otherPayments = 0,
  topProduct = "",
  storeSettings = {},
  activeBranch = "Main Branch",
  periodLabel = "All time",
  es = true,
}) {
  const t = (spanish, english) =>
    es ? spanish : english;

  return (
    <article className="sales-report-card">
      <header className="report-header">
        <div>
          <p className="report-label">
            CORI POS / EL CORDOBÉS
          </p>

          <h2>
            {t("Resumen de ventas", "Sales summary")}
          </h2>

          <p className="report-period">
            {periodLabel}
          </p>
        </div>

        {storeSettings?.logo ? (
          <img
            src={storeSettings.logo}
            alt={t("Logo de la cafetería", "Coffee shop logo")}
            className="report-logo"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="report-brand-symbol" aria-hidden="true">
            ✦
          </div>
        )}
      </header>

      <div className="report-shop-info">
        <div>
          <span>{t("CAFETERÍA", "COFFEE SHOP")}</span>
          <h3>{storeSettings?.shopName || "Coffee Shop"}</h3>
        </div>

        <div>
          <span>{t("SUCURSAL", "BRANCH")}</span>
          <h3>{activeBranch || "Main Branch"}</h3>
        </div>
      </div>

      <div className="report-stats-grid">
        <div className="report-stat featured">
          <span>{t("INGRESOS", "REVENUE")}</span>
          <h2>{formatMoney(revenue)}</h2>
          <small>MXN</small>
        </div>

        <div className="report-stat">
          <span>{t("ÓRDENES", "ORDERS")}</span>
          <h2>{orders}</h2>
          <small>
            {t("Ventas registradas", "Recorded sales")}
          </small>
        </div>

        <div className="report-stat">
          <span>
            {t("TICKET PROMEDIO", "AVERAGE TICKET")}
          </span>
          <h2>{formatMoney(averageTicket)}</h2>
          <small>
            {t("Por orden", "Per order")}
          </small>
        </div>

        <div className="report-stat">
          <span>
            {t("PRODUCTO MÁS VENDIDO", "TOP PRODUCT")}
          </span>
          <h2 className="report-top-product">
            {topProduct ||
              t("Sin productos", "No products")}
          </h2>
          <small>
            {t("Por unidades", "By units sold")}
          </small>
        </div>
      </div>

      <div className="report-payments">
        <div className="payment-card">
          <span>
            {t("PAGOS CON TARJETA", "CARD PAYMENTS")}
          </span>
          <h2>{cardPayments}</h2>
        </div>

        <div className="payment-card">
          <span>
            {t("PAGOS EN EFECTIVO", "CASH PAYMENTS")}
          </span>
          <h2>{cashPayments}</h2>
        </div>

        <div className="payment-card">
          <span>
            {t("OTROS PAGOS", "OTHER PAYMENTS")}
          </span>
          <h2>{otherPayments}</h2>
        </div>
      </div>

      <footer className="report-footer">
        <span>✦ CORI POS</span>
        <span>
          {t(
            "Tecnología para tu cafetería",
            "Technology for your coffee shop"
          )}
        </span>
      </footer>
    </article>
  );
}
