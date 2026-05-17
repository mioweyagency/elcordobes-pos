import {
  useState
} from "react";

import {
  useTranslation
} from "react-i18next";

import Sidebar
  from "../components/Sidebar";

import Topbar
  from "../components/Topbar";

import "../styles/home.css";

export default function Home({ goTo }) {

  console.log("preview deployment test");

  /* =========================================================
     TRANSLATION
  ========================================================= */

  const { t, i18n } =
    useTranslation();

  /* =========================================================
     FILTER
  ========================================================= */

  const [filter, setFilter] =
    useState("today");

  /* =========================================================
     SALES
  ========================================================= */

  const allSales =
    JSON.parse(
      localStorage.getItem(
        "sales"
      )
    ) || [];

  /* =========================================================
     FILTER SALES
  ========================================================= */

  const now =
    new Date();

  const sales =
    allSales.filter(
      (sale) => {

      const saleDate =
        new Date(
          sale.date
        );

      /* TODAY */

      if (
        filter === "today"
      ) {

        return (

          saleDate.toDateString() ===
          now.toDateString()

        );
      }

      /* WEEK */

      if (
        filter === "week"
      ) {

        const oneWeekAgo =
          new Date();

        oneWeekAgo.setDate(

          now.getDate() - 7

        );

        return (
          saleDate >=
          oneWeekAgo
        );
      }

      /* MONTH */

      if (
        filter === "month"
      ) {

        return (

          saleDate.getMonth() ===
            now.getMonth() &&

          saleDate.getFullYear() ===
            now.getFullYear()

        );
      }

      /* YEAR */

      if (
        filter === "year"
      ) {

        return (

          saleDate.getFullYear() ===
          now.getFullYear()

        );
      }

      return true;
    });

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const products =
    JSON.parse(
      localStorage.getItem(
        "products"
      )
    ) || [];

  /* =========================================================
     STORE SETTINGS
  ========================================================= */

  const storeSettings =
    JSON.parse(
      localStorage.getItem(
        "storeSettings"
      )
    ) || {};

  /* =========================================================
     ACTIVE EMPLOYEE
  ========================================================= */

  const activeEmployee =
    JSON.parse(
      localStorage.getItem(
        "activeEmployee"
      )
    ) || null;

  /* =========================================================
     EMPLOYEE HISTORY
  ========================================================= */

  const employeeHistory =
    JSON.parse(
      localStorage.getItem(
        "employeeHistory"
      )
    ) || [];

  /* =========================================================
     TOTAL REVENUE
  ========================================================= */

  const revenue =
    sales.reduce(

      (acc, sale) =>

        acc +

        parseFloat(
          sale.total || 0
        ),

      0
    );

  /* =========================================================
     TOTAL ORDERS
  ========================================================= */

  const totalOrders =
    sales.length;

  /* =========================================================
     AVG TICKET
  ========================================================= */

  const averageTicket =

    totalOrders > 0

      ? revenue /
        totalOrders

      : 0;

  /* =========================================================
     CHECK OUT
  ========================================================= */

  const checkOutEmployee =
    () => {

    if (!activeEmployee)
      return;

    const checkOutTime =
      new Date()
        .toLocaleTimeString();

    /* UPDATE HISTORY */

    const updatedHistory =
      employeeHistory.map(
        (employee) => {

        if (

          employee.id ===
            activeEmployee.id &&

          employee.checkOut ===
            null

        ) {

          return {

            ...employee,

            checkOut:
              checkOutTime,

            hoursWorked:
              "Shift Completed"
          };
        }

        return employee;
      });

    localStorage.setItem(

      "employeeHistory",

      JSON.stringify(
        updatedHistory
      )

    );

    /* REMOVE ACTIVE */

    localStorage.removeItem(
      "activeEmployee"
    );

    window.location.reload();
  };

  return (

    <div className="dashboard-layout">

      {/* =========================================================
         SIDEBAR
      ========================================================= */}

      <Sidebar
        goTo={goTo}
        active="home"
      />

      {/* =========================================================
         MAIN
      ========================================================= */}

      <main className="dashboard-main">

        {/* =========================================================
           TOPBAR
        ========================================================= */}

        <Topbar
          title={t("dashboard")}
          subtitle="EL CORDOBÉS POS"
        />

        {/* =========================================================
           HERO
        ========================================================= */}

        <section className="dashboard-hero">

          <div>

            <p className="hero-label">

              COFFEE SHOP OVERVIEW

            </p>

            <div className="hero-brand">

              {storeSettings.logo && (

                <img
                  src={storeSettings.logo}

                  alt="Logo"

                  className="hero-logo"
                />

              )}

              <div>

                <h1>

                  {storeSettings.shopName ||

                    "Welcome Back"}

                </h1>

                <p>

                  Manage your café sales,
                  products and daily
                  orders.

                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================================
           LANGUAGE SWITCHER
        ========================================================= */}

        <section
          style={{
            display:"flex",
            gap:"12px",
            marginBottom:"20px"
          }}
        >

          <button
            className="dashboard-filter"

            onClick={() => {

              i18n.changeLanguage(
                "en"
              );

              localStorage.setItem(
                "language",
                "en"
              );
            }}
          >

            English

          </button>

          <button
            className="dashboard-filter"

            onClick={() => {

              i18n.changeLanguage(
                "es"
              );

              localStorage.setItem(
                "language",
                "es"
              );
            }}
          >

             Español

          </button>

        </section>

        {/* =========================================================
           FILTERS
        ========================================================= */}

        <section className="dashboard-filters">

          <button
            className={

              filter === "today"

                ? "dashboard-filter active"

                : "dashboard-filter"
            }

            onClick={() =>
              setFilter("today")
            }
          >

            {t("today")}

          </button>

          <button
            className={

              filter === "week"

                ? "dashboard-filter active"

                : "dashboard-filter"
            }

            onClick={() =>
              setFilter("week")
            }
          >

            {t("week")}

          </button>

          <button
            className={

              filter === "month"

                ? "dashboard-filter active"

                : "dashboard-filter"
            }

            onClick={() =>
              setFilter("month")
            }
          >

            {t("month")}

          </button>

          <button
            className={

              filter === "year"

                ? "dashboard-filter active"

                : "dashboard-filter"
            }

            onClick={() =>
              setFilter("year")
            }
          >

            {t("year")}

          </button>

        </section>

        {/* =========================================================
           ACTIVE EMPLOYEE
        ========================================================= */}

        {activeEmployee && (

          <section className="active-employee-section">

            <div className="active-employee-card">

              <div className="active-employee-left">

                <img
                  src={
                    activeEmployee.photo ||

                    "/avatars/avatar1.png"
                  }

                  alt={activeEmployee.name}

                  className="active-employee-img"
                />

                <div>

                  <p className="working-label">

                    CURRENTLY WORKING

                  </p>

                  <h2>
                    {activeEmployee.name}
                  </h2>

                  <span>
                    {activeEmployee.role}
                  </span>

                  <small>
                    {activeEmployee.shift}
                  </small>

                  <div className="checkin-time">

                    Checked In:
                    {" "}

                    {activeEmployee.checkIn}

                  </div>

                </div>

              </div>

              <button
                className="checkout-btn"

                onClick={
                  checkOutEmployee
                }
              >

                {t("checkOut")}

              </button>

            </div>

          </section>

        )}

        {/* =========================================================
           STATS
        ========================================================= */}

        <section className="stats-grid">

          <div className="stat-card large">

            <span>

              Revenue
              {" "}
              {filter}

            </span>

            <h2>
              ${revenue.toFixed(2)}
            </h2>

            <p>
              Coffee shop revenue
            </p>

          </div>

          <div className="stat-card">

            <span>
              {t("orders")}
            </span>

            <h2>
              {totalOrders}
            </h2>

            <p>
              Orders completed
            </p>

          </div>

          <div className="stat-card">

            <span>
              {t("products")}
            </span>

            <h2>
              {products.length}
            </h2>

            <p>
              Active menu products
            </p>

          </div>

          <div className="stat-card">

            <span>
              Avg Ticket
            </span>

            <h2>
              ${averageTicket.toFixed(2)}
            </h2>

            <p>
              Average order value
            </p>

          </div>

        </section>

        {/* =========================================================
           TEAM TODAY
        ========================================================= */}

        <section className="recent-sales">

          <div className="section-title">

            <h2>
              {t("teamToday")}
            </h2>

          </div>

          <div className="sales-list">

            {employeeHistory.length === 0 && (

              <p className="empty-sales">

                No employee activity yet

              </p>

            )}

            {employeeHistory.map(
              (employee, index) => (

              <div
                key={index}

                className="sale-card"
              >

                <div
                  style={{
                    display:"flex",
                    alignItems:"center",
                    gap:"14px"
                  }}
                >

                  <img
                    src={
                      employee.photo ||

                      "/avatars/avatar1.png"
                    }

                    alt={employee.name}

                    className="team-avatar"
                  />

                  <div>

                    <h3>
                      {employee.name}
                    </h3>

                    <p>
                      {employee.role}
                    </p>

                  </div>

                </div>

                <div className="sale-right">

                  <span>

                    {employee.checkIn}

                    {" "}→{" "}

                    {employee.checkOut ||

                      "Working"}

                  </span>

                  <div className="payment-badge">

                    {employee.shift}

                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* =========================================================
           RECENT SALES
        ========================================================= */}

        <section className="recent-sales">

          <div className="section-title">

            <h2>
              {t("recentOrders")}
            </h2>

          </div>

          <div className="sales-list">

            {sales.length === 0 && (

              <p className="empty-sales">

                No sales yet

              </p>

            )}

            {sales.map((sale, index) => (

              <div
                key={index}

                className="sale-card"
              >

                <div>

                  <h3>

                    ORDER #
                    {sale.orderNumber}

                  </h3>

                  <p>

                    {sale.customerName ||

                      "Guest"}

                  </p>

                </div>

                <div className="sale-right">

                  <span>
                    ${sale.total}
                  </span>

                  <div className="payment-badge">

                    {sale.paymentMethod}

                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>

  );
}