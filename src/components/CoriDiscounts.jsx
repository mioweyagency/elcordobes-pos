import { useState } from "react";
import "../styles/coriDiscounts.css";

/*
  CORI DISCOUNTS
  El Cordobés Coffee Tech Studio

  Descuentos:
  - Empleados: 10%, 25%, 40%, 50%
  - Cupones promocionales
  - Solo un descuento por compra

  IMPORTANTE:
  Los cupones son de prueba.
  Para producción, los permisos y cupones
  deben validarse en el servidor.
*/

const EMPLOYEE_DISCOUNTS = [10, 25, 40, 50];

const DEMO_COUPONS = {
  CORI10: 10,
  CAFE25: 25,
};

function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value) || 0);
}

export function calculateCoriDiscount(total, discount) {
  const originalCents = Math.max(
    0,
    Math.round((Number(total) || 0) * 100)
  );

  const percentage = Math.min(
    100,
    Math.max(0, Number(discount?.percentage) || 0)
  );

  const discountCents = Math.round(
    (originalCents * percentage) / 100
  );

  return {
    originalTotal: originalCents / 100,
    discountPercentage: percentage,
    discountAmount: discountCents / 100,
    finalTotal: (originalCents - discountCents) / 100,
  };
}

export default function CoriDiscounts({
  total = 0,
  value = null,
  onChange,
  disabled = false,
}) {
  const [couponInput, setCouponInput] = useState("");
  const [message, setMessage] = useState("");

  const activeDiscount = value || {
    type: "none",
    percentage: 0,
    code: "",
  };

  const calculations = calculateCoriDiscount(
    total,
    activeDiscount
  );

  function applyDiscount(discount) {
    if (disabled) return;

    onChange?.(discount);
    setMessage("");
  }

  function selectEmployeeDiscount(percentage) {
    applyDiscount({
      type: "employee",
      percentage,
      code: "",
      label: `Empleado ${percentage}%`,
    });

    setCouponInput("");
  }

  function applyCoupon() {
    if (disabled) return;

    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setMessage("Introduce un código de cupón.");
      return;
    }

    const percentage = DEMO_COUPONS[code];

    if (!percentage) {
      setMessage("El cupón no existe o no es válido.");
      return;
    }

    applyDiscount({
      type: "coupon",
      percentage,
      code,
      label: `Cupón ${code}`,
    });

    setMessage("Cupón aplicado correctamente.");
  }

  function clearDiscount() {
    applyDiscount({
      type: "none",
      percentage: 0,
      code: "",
      label: "",
    });

    setCouponInput("");
  }

  return (
    <section className="cori-discounts">
      <div className="cori-discounts-header">
        <div>
          <span className="cori-discounts-eyebrow">
            ✦ CORI DISCOUNTS
          </span>

          <h3>Descuentos y cupones</h3>

          <p>
            Beneficios especiales para empleados
            y promociones.
          </p>
        </div>

        <span className="cori-discounts-icon">
          %
        </span>
      </div>

      <div className="cori-discounts-section">
        <div className="cori-discounts-section-title">
          <span>Descuento para empleados</span>
          <small>Selecciona uno</small>
        </div>

        <div className="cori-discounts-grid">
          {EMPLOYEE_DISCOUNTS.map((percentage) => {
            const selected =
              activeDiscount.type === "employee" &&
              activeDiscount.percentage === percentage;

            return (
              <button
                key={percentage}
                type="button"
                disabled={disabled}
                className={`cori-discount-option ${
                  selected ? "selected" : ""
                }`}
                onClick={() =>
                  selectEmployeeDiscount(percentage)
                }
                aria-pressed={selected}
              >
                <strong>{percentage}%</strong>
                <span>Empleado</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="cori-discounts-divider">
        <span>O UTILIZA UN CUPÓN</span>
      </div>

      <div className="cori-discounts-section">
        <label htmlFor="cori-discount-coupon">
          Código promocional
        </label>

        <div className="cori-discounts-coupon">
          <input
            id="cori-discount-coupon"
            type="text"
            placeholder="INTRODUCIR CÓDIGO"
            value={couponInput}
            disabled={disabled}
            maxLength={30}
            autoComplete="off"
            onChange={(event) => {
              setCouponInput(
                event.target.value.toUpperCase()
              );
              setMessage("");
            }}
          />

          <button
            type="button"
            disabled={disabled}
            onClick={applyCoupon}
          >
            Aplicar
          </button>
        </div>

        {message && (
          <p
            className="cori-discounts-message"
            role="status"
          >
            {message}
          </p>
        )}
      </div>

      <div className="cori-discounts-summary">
        <div className="cori-discounts-row">
          <span>Precio original</span>
          <strong>
            {money(calculations.originalTotal)}
          </strong>
        </div>

        <div className="cori-discounts-row saving">
          <span>
            Descuento
            {calculations.discountPercentage > 0
              ? ` (${calculations.discountPercentage}%)`
              : ""}
          </span>

          <strong>
            -{money(calculations.discountAmount)}
          </strong>
        </div>

        <div className="cori-discounts-final">
          <div>
            <small>TOTAL A PAGAR</small>
            <strong>
              {money(calculations.finalTotal)}
            </strong>
          </div>

          {calculations.discountPercentage > 0 && (
            <span className="cori-discounts-badge">
              AHORRAS{" "}
              {money(calculations.discountAmount)}
            </span>
          )}
        </div>

        {calculations.discountPercentage > 0 && (
          <button
            type="button"
            className="cori-discounts-remove"
            disabled={disabled}
            onClick={clearDiscount}
          >
            × Quitar descuento
          </button>
        )}
      </div>

      <p className="cori-discounts-footnote">
        Solo se permite un descuento por compra.
      </p>
    </section>
  );
}