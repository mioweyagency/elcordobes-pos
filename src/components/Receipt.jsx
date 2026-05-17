import "../styles/receipt.css";

export default function Receipt({

  orderNumber,
  customerName,
  paymentMethod,
  tableNumber,
  currentDate,
  cart,
  subtotal,
  iva,
  total

}) {

  return (

    <div className="receipt-print">

      {/* =========================================================
         HEADER
      ========================================================= */}

      <div className="receipt-header">

        <h1>
          EL CORDOBÉS POS
        </h1>

        <p>
          Premium Coffee System
        </p>

        <h2>
          ORDER #{orderNumber}
        </h2>

        <span>
          {currentDate}
        </span>

      </div>

      {/* =========================================================
         INFO
      ========================================================= */}

      <div className="receipt-info">

        <div className="receipt-line">

          <span>
            Customer
          </span>

          <strong>
            {customerName || "Guest"}
          </strong>

        </div>

        <div className="receipt-line">

          <span>
            Table
          </span>

          <strong>
            {tableNumber || "-"}
          </strong>

        </div>

        <div className="receipt-line">

          <span>
            Payment
          </span>

          <strong>
            {paymentMethod}
          </strong>

        </div>

      </div>

      {/* =========================================================
         DIVIDER
      ========================================================= */}

      <div className="receipt-divider"></div>

      {/* =========================================================
         ITEMS
      ========================================================= */}

      <div className="receipt-items">

        {cart.map((item) => (

          <div
            key={item.id}
            className="receipt-item"
          >

            <div>

              {item.name}

              {" "}x{item.quantity}

            </div>

            <div>

              ${parseFloat(
                item.price.replace(
                  /[^0-9.]/g,
                  ""
                )
              ).toFixed(2)}

            </div>

          </div>

        ))}

      </div>

      {/* =========================================================
         DIVIDER
      ========================================================= */}

      <div className="receipt-divider"></div>

      {/* =========================================================
         TOTALS
      ========================================================= */}

      <div className="receipt-totals-print">

        <div className="receipt-line">

          <span>
            Subtotal
          </span>

          <strong>
            ${subtotal.toFixed(2)}
          </strong>

        </div>

        <div className="receipt-line">

          <span>
            IVA 16%
          </span>

          <strong>
            ${iva.toFixed(2)}
          </strong>

        </div>

        <div className="receipt-line total-line">

          <span>
            TOTAL
          </span>

          <strong>
            ${total.toFixed(2)} MXN
          </strong>

        </div>

      </div>

      {/* =========================================================
         FOOTER
      ========================================================= */}

      <div className="receipt-footer">

        <p>
          Gracias por visitar
        </p>

        <h3>
          EL CORDOBÉS COFFEE
        </h3>

      </div>

    </div>

  );

}