export default function SalesReportCard({

  revenue,

  orders,

  averageTicket,

  cardPayments,

  cashPayments,

  topProduct,

  storeSettings,

  activeBranch

}) {

  return (

    <div className="sales-report-card">

      {/* HEADER */}

      <div className="report-header">

        <div>

          <p className="report-label">
            EL CORDOBÉS POS
          </p>

          <h2>
            Daily Sales Summary
          </h2>

        </div>

        {storeSettings?.logo && (

          <img
            src={storeSettings.logo}

            alt="Logo"

            className="report-logo"
          />

        )}

      </div>

      {/* STORE INFO */}

      <div className="report-shop-info">

        <div>

          <span>
            Brand
          </span>

          <h3>

            {storeSettings?.shopName ||

              "Coffee Shop"}

          </h3>

        </div>

        <div>

          <span>
            Branch
          </span>

          <h3>

            {activeBranch ||

              "Main Branch"}

          </h3>

        </div>

      </div>

      {/* STATS */}

      <div className="report-stats-grid">

        <div className="report-stat">

          <span>
            Revenue
          </span>

          <h2>
            ${revenue.toFixed(2)}
          </h2>

        </div>

        <div className="report-stat">

          <span>
            Orders
          </span>

          <h2>
            {orders}
          </h2>

        </div>

        <div className="report-stat">

          <span>
            Avg Ticket
          </span>

          <h2>
            ${averageTicket.toFixed(2)}
          </h2>

        </div>

        <div className="report-stat">

          <span>
            Top Product
          </span>

          <h2>
            {topProduct}
          </h2>

        </div>

      </div>

      {/* PAYMENTS */}

      <div className="report-payments">

        <div className="payment-card">

          <span>
            Card Payments
          </span>

          <h2>
            {cardPayments}
          </h2>

        </div>

        <div className="payment-card">

          <span>
            Cash Payments
          </span>

          <h2>
            {cashPayments}
          </h2>

        </div>

      </div>

    </div>

  );
}