import "../styles/receipt.css";

import {
  formatMoney,
  priceCents,
} from "../utils/posUtils";

export default function Receipt({
  orderNumber,
  customerName,
  paymentMethod,
  tableNumber,
  currentDate,
  cart = [],
  subtotal = 0,
  iva = 0,
  total = 0,

  // CORI DISCOUNTS
  discountAmount = 0,
  discountLabel = "",
  originalTotal = null,

  // CORI LOYALTY
  loyaltyPointsEarned = 0,
  loyaltyPointsBalance = null,
  loyaltyRewardAvailable = false,
}) {
  const paymentLabels = {
    Card: "Tarjeta",
    Cash: "Efectivo",
    Transferencia: "Transferencia",
    QR: "QR",
  };

  const discount = Number(discountAmount) || 0;

  const hasDiscount = discount > 0;

  const hasLoyalty =
    Number(loyaltyPointsEarned) > 0 ||
    loyaltyPointsBalance !== null;

  return (
    <div className="receipt-print">

      {/* BRAND */}

      <header className="receipt-header">

        <div className="receipt-brand-symbol">
          ✦
        </div>

        <h1>EL CORDOBÉS</h1>

        <p className="receipt-brand-subtitle">
          COFFEE & BAKERY
        </p>

        <div className="receipt-brand-divider">
          <span>✦</span>
        </div>

        <div className="receipt-order-badge">
          RECIBO DE VENTA
        </div>

        <h2>ORDEN #{orderNumber}</h2>

        <span className="receipt-date">
          {currentDate}
        </span>

      </header>

      {/* CUSTOMER */}

      <section className="receipt-info">

        <div className="receipt-line">
          <span>Cliente</span>
          <strong>
            {customerName || "Cliente"}
          </strong>
        </div>

        <div className="receipt-line">
          <span>Mesa</span>
          <strong>
            {tableNumber || "-"}
          </strong>
        </div>

        <div className="receipt-line">
          <span>Método de pago</span>
          <strong>
            {paymentLabels[paymentMethod] ||
              paymentMethod ||
              "-"}
          </strong>
        </div>

      </section>

      <div className="receipt-divider" />

      {/* PRODUCTS */}

      <section className="receipt-products">

        <div className="receipt-section-title">
          DETALLE DE TU PEDIDO
        </div>

        <div className="receipt-items">

          {cart.length === 0 && (
            <p>Sin artículos</p>
          )}

          {cart.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="receipt-item"
            >

              <div className="receipt-item-left">

                <strong>
                  {item.name}
                </strong>

                <small>
                  {item.quantity} ×{" "}
                  {formatMoney(item.price)}
                </small>

              </div>

              <div className="receipt-item-right">

                {formatMoney(
                  (
                    priceCents(item.price) *
                    item.quantity
                  ) / 100
                )}

              </div>

            </div>
          ))}

        </div>

      </section>

      <div className="receipt-divider" />

      {/* TOTALS */}

      <section className="receipt-totals-print">

        {hasDiscount && originalTotal !== null && (
          <div className="receipt-line">
            <span>Importe original</span>
            <strong>
              {formatMoney(originalTotal)}
            </strong>
          </div>
        )}

        <div className="receipt-line">
          <span>Subtotal</span>
          <strong>
            {formatMoney(subtotal)}
          </strong>
        </div>

        <div className="receipt-line">
          <span>IVA incluido · 16%</span>
          <strong>
            {formatMoney(iva)}
          </strong>
        </div>

        {hasDiscount && (
          <div className="receipt-line receipt-discount-line">

            <span>
              {discountLabel || "Descuento"}
            </span>

            <strong>
              -{formatMoney(discount)}
            </strong>

          </div>
        )}

        <div className="receipt-total-box">

          <span>TOTAL PAGADO</span>

          <strong>
            {formatMoney(total)}
          </strong>

          <small>MXN</small>

        </div>

      </section>

      {/* LOYALTY */}

      {hasLoyalty && (
        <section className="receipt-loyalty">

          <div className="receipt-loyalty-title">
            ✦ CORI LOYALTY
          </div>

          <p>
            ¡Gracias por ser parte de nuestra comunidad!
          </p>

          <div className="receipt-line">

            <span>Puntos ganados</span>

            <strong>
              +{loyaltyPointsEarned}
            </strong>

          </div>

          {loyaltyPointsBalance !== null && (
            <div className="receipt-line">

              <span>Puntos acumulados</span>

              <strong>
                {loyaltyPointsBalance}
              </strong>

            </div>
          )}

          {loyaltyRewardAvailable && (
            <p className="receipt-reward">
              ★ ¡Has alcanzado tu meta de puntos!
            </p>
          )}

        </section>
      )}

      {/* FOOTER */}

      <footer className="receipt-footer">

        <div className="receipt-footer-symbol">
          ✦
        </div>

        <h3>GRACIAS POR TU VISITA</h3>

        <p>
          Buen café. Mejores historias.
        </p>

        <div className="receipt-footer-divider" />

        <small>
          EL CORDOBÉS · COFFEE TECH STUDIO
        </small>

        <small>
          Recibo de venta · No es factura fiscal.
        </small>

        <small>
          Powered by Cori POS
        </small>

      </footer>

    </div>
  );
}