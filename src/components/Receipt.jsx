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

      {/* HEADER */}

      <div className="receipt-header">

        <h1>
          EL CORDOBÉS POS
        </h1>

        <p>
          Premium Coffee System
        </p>

      </div>

      {/* INFO */}

      <div className="receipt-info">

        <div className="receipt-line">

          <span>
            Order
          </span>

          <strong>
            #{orderNumber}
          </strong>

        </div>

        <div className="receipt-line">

          <span>
            Date
          </span>

          <strong>
            {currentDate}
          </strong>

        </div>

        <div className="receipt-line">

          <span>
            Customer
          </span>

          <strong>
            {customerName}
          </strong>

        </div>

        <div className="receipt-line">

          <span>
            Table
          </span>

          <strong>
            {tableNumber}
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

      {/* DIVIDER */}

      <div className="receipt-divider"></div>

      {/* ITEMS */}

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

              {item.price}

            </div>

          </div>

        ))}

      </div>

      {/* DIVIDER */}

      <div className="receipt-divider"></div>

      {/* TOTALS */}

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
            Total
          </span>

          <strong>
            ${total.toFixed(2)} MXN
          </strong>

        </div>

      </div>

      {/* FOOTER */}

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