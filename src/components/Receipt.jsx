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
}) {
  const paymentLabels = {
    Card: "Tarjeta",
    Cash: "Efectivo",
    Transferencia: "Transferencia",
    QR: "QR",
  };

  return (
    <div className="receipt-print">
      <div className="receipt-header">
        <h1>EL CORDOBÉS</h1>
        <p>Café y panadería</p>

        <h2>ORDEN #{orderNumber}</h2>
        <span>{currentDate}</span>
      </div>

      <div className="receipt-info">
        <div className="receipt-line">
          <span>Cliente</span>
          <strong>{customerName || "Cliente"}</strong>
        </div>

        <div className="receipt-line">
          <span>Mesa</span>
          <strong>{tableNumber || "-"}</strong>
        </div>

        <div className="receipt-line">
          <span>Pago registrado</span>
          <strong>
            {paymentLabels[paymentMethod] || paymentMethod}
          </strong>
        </div>
      </div>

      <div className="receipt-divider" />

      <div className="receipt-items">
        {cart.length === 0 && <p>Sin artículos</p>}

        {cart.map((item) => (
          <div key={item.id} className="receipt-item">
            <div className="receipt-item-left">
              {item.name} × {item.quantity}
            </div>

            <div className="receipt-item-right">
              {formatMoney(
                priceCents(item.price) *
                item.quantity /
                100
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="receipt-divider" />

      <div className="receipt-totals-print">
        <div className="receipt-line">
          <span>Subtotal</span>
          <strong>{formatMoney(subtotal)}</strong>
        </div>

        <div className="receipt-line">
          <span>IVA incluido · 16%</span>
          <strong>{formatMoney(iva)}</strong>
        </div>

        <div className="receipt-line total-line">
          <span>TOTAL</span>
          <strong>{formatMoney(total)} MXN</strong>
        </div>
      </div>

      <div className="receipt-footer">
        <p>Gracias por tu visita.</p>
        <p>Buen café. Mejores historias.</p>
        <small>Recibo de venta · No es factura fiscal.</small>
      </div>
    </div>
  );
}