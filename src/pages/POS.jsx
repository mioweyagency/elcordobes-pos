import {
  useState,
  useEffect
} from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Receipt from "../components/Receipt";

import "../styles/pos.css";

import coffeeImg from "../assets/hero.png";

import {
  getProductsDB
} from "../utils/db";

export default function POS({ goTo }) {

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const [products, setProducts] =
    useState([]);

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  useEffect(() => {

    const loadProducts =
      async () => {

      const data =
        await getProductsDB();

      setProducts(data);
    };

    loadProducts();

  }, []);

  /* =========================================================
     CART
  ========================================================= */

  const [cart, setCart] =
    useState([]);

  /* =========================================================
     CHECKOUT
  ========================================================= */

  const [showCheckout,
    setShowCheckout] =
    useState(false);

  /* =========================================================
     SUCCESS
  ========================================================= */

  const [showSuccess,
    setShowSuccess] =
    useState(false);

  const [successTotal,
    setSuccessTotal] =
    useState(0);

  const [successPayment,
    setSuccessPayment] =
    useState("");

  const [successOrderNumber,
    setSuccessOrderNumber] =
    useState("");

  const [successCustomer,
    setSuccessCustomer] =
    useState("");

  /* =========================================================
     CUSTOMER
  ========================================================= */

  const [customerName,
    setCustomerName] =
    useState("");

  const [customerPhone,
    setCustomerPhone] =
    useState("");

  const [tableNumber,
    setTableNumber] =
    useState("");

  const [paymentMethod,
    setPaymentMethod] =
    useState("Card");

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart =
    (product) => {

    const existingItem =
      cart.find(
        (item) =>
          item.id === product.id
      );

    if (existingItem) {

      const updatedCart =
        cart.map((item) => {

          if (
            item.id === product.id
          ) {

            return {

              ...item,

              quantity:
                item.quantity + 1
            };
          }

          return item;
        });

      setCart(updatedCart);

    } else {

      setCart([

        ...cart,

        {
          ...product,
          quantity: 1
        }

      ]);

    }

  };

  /* =========================================================
     REMOVE
  ========================================================= */

  const removeFromCart =
    (productId) => {

    const updatedCart =
      cart.filter(
        (item) =>
          item.id !== productId
      );

    setCart(updatedCart);

  };

  /* =========================================================
     TOTAL
  ========================================================= */

  const total = cart.reduce(
    (acc, item) => {

    const numericPrice =
      parseFloat(

        item.price
          .replace(/[^0-9.]/g, "")

      );

    return (
      acc +
      (numericPrice * item.quantity)
    );

  }, 0);

  /* =========================================================
     IVA
  ========================================================= */

  const subtotal =
    total / 1.16;

  const iva =
    total - subtotal;

  /* =========================================================
     ORDER NUMBER
  ========================================================= */

  const orderNumber =
    Math.floor(
      1000 +
      Math.random() * 9000
    );

  /* =========================================================
     DATE
  ========================================================= */

  const currentDate =
    new Date().toLocaleString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }
    );

  /* =========================================================
     COMPLETE ORDER
  ========================================================= */

  const completeOrder =
    () => {

    if (cart.length === 0) {

      alert(
        "Cart is empty"
      );

      return;
    }

    const existingSales =
      JSON.parse(

        localStorage.getItem(
          "sales"
        )

      ) || [];

    const newSale = {

      orderNumber,

      customerName:
        customerName ||
        "Guest",

      customerPhone:
        customerPhone || "",

      tableNumber:
        tableNumber || "-",

      paymentMethod,

      subtotal:
        subtotal.toFixed(2),

      iva:
        iva.toFixed(2),

      total:
        total.toFixed(2),

      date:
        currentDate,

      items: cart
    };

    existingSales.push(
      newSale
    );

    localStorage.setItem(

      "sales",

      JSON.stringify(
        existingSales
      )

    );

    /* =========================================================
       WHATSAPP RECEIPT
    ========================================================= */

    const receiptMessage =

`☕ EL CORDOBÉS POS

Order #${orderNumber}

Customer:
${customerName || "Guest"}

Table:
${tableNumber || "-"}

Payment:
${paymentMethod}

Total:
$${total.toFixed(2)} MXN

Gracias por visitar EL CORDOBÉS COFFEE ☕`;

    if (customerPhone) {

      window.location.href =

      `https://wa.me/52${customerPhone}?text=${encodeURIComponent(receiptMessage)}`;

    }

    /* =========================================================
       SUCCESS
    ========================================================= */

    setSuccessTotal(total);

    setSuccessPayment(
      paymentMethod
    );

    setSuccessOrderNumber(
      orderNumber
    );

    setSuccessCustomer(
      customerName ||
      "Guest"
    );

    setShowCheckout(false);

    setShowSuccess(true);

  };

  return (

    <div className="dashboard-layout">

      <Sidebar
        goTo={goTo}
        active="pos"
      />

      <main className="dashboard-main">

        <Topbar
          title="POS Register"
          subtitle="EL CORDOBÉS POS"
        />

        <div className="pos-layout">

          {/* =========================================================
             PRODUCTS
          ========================================================= */}

          <section className="pos-products">

            <div className="pos-header">

              <h2>
                Menu
              </h2>

              <p>
                Select products to
                add into cart.
              </p>

            </div>

            <div className="pos-products-grid">

              {products.length === 0 && (

                <div className="empty-products">

                  No products yet

                </div>

              )}

              {products.map(
                (product) => (

                <div
                  key={product.id}
                  className="pos-product-card"
                >

                  <img
                    src={
                      product.image ||
                      coffeeImg
                    }

                    alt={product.name}

                    className="pos-product-image"
                  />

                  <div className="pos-product-content">

                    <div className="pos-product-top">

                      <h3>
                        {product.name}
                      </h3>

                      <span>
                        {product.price}
                      </span>

                    </div>

                    <p>
                      {product.category}
                    </p>

                    <button
                      className="add-cart-btn"

                      onClick={() =>
                        addToCart(
                          product
                        )
                      }
                    >

                      Add To Cart

                    </button>

                  </div>

                </div>

              ))}

            </div>

          </section>

          {/* =========================================================
             CART
          ========================================================= */}

          <section className="cart-panel">

            <div className="cart-header">

              <h2>
                Order
              </h2>

              <p>
                Current customer
                ticket
              </p>

            </div>

            <div className="cart-items">

              {cart.length === 0 && (

                <p className="empty-cart">

                  No items yet

                </p>

              )}

              {cart.map(
                (item) => (

                <div
                  key={item.id}
                  className="cart-item"
                >

                  <div>

                    <h4>
                      {item.name}
                    </h4>

                    <p>
                      Qty:
                      {" "}
                      {item.quantity}
                    </p>

                  </div>

                  <div className="cart-right">

                    <span>
                      {item.price}
                    </span>

                    <button
                      className="remove-item-btn"

                      onClick={() =>
                        removeFromCart(
                          item.id
                        )
                      }
                    >

                      Remove

                    </button>

                  </div>

                </div>

              ))}

            </div>

            <div className="cart-footer">

              <div className="cart-total">

                <span>
                  Total
                </span>

                <h2>
                  ${total.toFixed(2)} MXN
                </h2>

              </div>

              <button
                className="charge-btn"

                onClick={() =>
                  setShowCheckout(
                    true
                  )
                }
              >

                Charge

              </button>

            </div>

          </section>

        </div>

        {/* =========================================================
           CHECKOUT
        ========================================================= */}

        {showCheckout && (

          <div className="checkout-overlay">

            <div className="checkout-modal">

              <div className="receipt-brand">

                <h2>
                  EL CORDOBÉS POS
                </h2>

                <p>
                  ORDER #{orderNumber}
                </p>

                <span>
                  {currentDate}
                </span>

              </div>

              <input
                type="text"

                placeholder="Customer Name"

                value={customerName}

                onChange={(e) =>
                  setCustomerName(
                    e.target.value
                  )
                }
              />

              <input
                type="text"

                placeholder="WhatsApp Number"

                value={customerPhone}

                onChange={(e) =>
                  setCustomerPhone(
                    e.target.value
                  )
                }
              />

              <input
                type="text"

                placeholder="Table Number"

                value={tableNumber}

                onChange={(e) =>
                  setTableNumber(
                    e.target.value
                  )
                }
              />

              <select
                value={paymentMethod}

                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value
                  )
                }
              >

                <option>
                  Card
                </option>

                <option>
                  Cash
                </option>

                <option>
                  Transferencia
                </option>

                <option>
                  QR
                </option>

              </select>

              <div className="checkout-summary">

                {cart.map((item) => (

                  <div
                    key={item.id}
                    className="checkout-item"
                  >

                    <span>
                      {item.name}
                      {" "}x{item.quantity}
                    </span>

                    <span>
                      {item.price}
                    </span>

                  </div>

                ))}

              </div>

              <div className="receipt-totals">

                <div className="receipt-row">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    ${subtotal.toFixed(2)}
                  </span>

                </div>

                <div className="receipt-row">

                  <span>
                    IVA 16%
                  </span>

                  <span>
                    ${iva.toFixed(2)}
                  </span>

                </div>

              </div>

              <div className="checkout-total">

                <span>
                  Total
                </span>

                <h3>
                  ${total.toFixed(2)} MXN
                </h3>

              </div>

              <div className="checkout-buttons">

                <button
                  className="cancel-checkout-btn"

                  onClick={() =>
                    setShowCheckout(
                      false
                    )
                  }
                >

                  Cancel

                </button>

                <button
                  className="complete-order-btn"

                  onClick={completeOrder}
                >

                  Complete Order

                </button>

              </div>

            </div>

          </div>

        )}

        {/* =========================================================
           SUCCESS
        ========================================================= */}

        {showSuccess && (

          <div className="success-overlay">

            <div className="success-modal">

              <Receipt
                orderNumber={successOrderNumber}
                customerName={successCustomer}
                paymentMethod={successPayment}
                tableNumber={tableNumber}
                currentDate={currentDate}
                cart={cart}
                subtotal={subtotal}
                iva={iva}
                total={successTotal}
              />

              <button
                className="success-btn"

                onClick={() =>
                  setShowSuccess(
                    false
                  )
                }
              >

                Continue

              </button>

            </div>

          </div>

        )}

      </main>

    </div>

  );

}