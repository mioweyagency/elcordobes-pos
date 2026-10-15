
import { useEffect, useRef, useState } from "react";

import Sidebar from "../components/Sidebar";
import Receipt from "../components/Receipt";

import "../styles/pos.css";

import { getProductsDB } from "../utils/db";

import CoriAcademy from "../components/CoriAcademy";

import {
  formatMoney,
  normalizeCart,
  priceCents,
  readArray,
} from "../utils/posUtils";

/* =========================================================
   HELPERS
========================================================= */

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

function ProductPhoto({ src }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className="cpos-photo cpos-photo-empty"
        aria-hidden="true"
      >
        ☕
      </span>
    );
  }

  return (
    <img
      className="cpos-photo"
      src={src}
      alt=""
      onError={() => setFailed(true)}
    />
  );
}

/* =========================================================
   CORI POS — NUEVA VENTA
========================================================= */

export default function POS({ goTo }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");

  const [orderNumber, setOrderNumber] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [saving, setSaving] = useState(false);

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState("");
  const [pdfMessage, setPdfMessage] = useState("");
  const [sharingPdf, setSharingPdf] = useState(false);

  const savingRef = useRef(false);
  const receiptRef = useRef(null);
  const nameRef = useRef(null);
  const continueRef = useRef(null);

  /* LOAD PRODUCTS AND CART */

  useEffect(() => {
    let active = true;

    getProductsDB()
      .then((data) => {
        if (active) {
          setProducts(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (active) {
          setError("No se pudo cargar el catálogo.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    try {
      setCart(normalizeCart(readArray("cart")));
    } catch {
      setError("No se pudo leer el carrito guardado.");
    }

    return () => {
      active = false;
    };
  }, []);

  /* RECEIPT DIALOG */

  useEffect(() => {
    const dialog = receiptRef.current;
    if (!dialog) return;

    if (receipt && !dialog.open) {
      dialog.showModal();
    }

    if (!receipt && dialog.open) {
      dialog.close();
    }
  }, [receipt]);

  useEffect(() => {
    if (reviewing) {
      nameRef.current?.focus();
    }
  }, [reviewing]);

  /* PREPARE PDF */

  useEffect(() => {
    let active = true;

    setPdfFile(null);
    setPdfError("");
    setPdfMessage("");

    if (!receipt) {
      return () => {
        active = false;
      };
    }

    async function preparePdf() {
      try {
        let settings = {};

        try {
          settings = JSON.parse(
            localStorage.getItem("storeSettings") || "{}"
          );
        } catch {
          // Default branding
        }

        const { createReceiptPdf } = await import(
          "../utils/receiptPdf"
        );

        const file = await createReceiptPdf(
          receipt,
          settings || {}
        );

        if (active) {
          setPdfFile(file);
        }
      } catch {
        if (active) {
          setPdfError(
            "No se pudo generar el PDF. Revisa la instalación de pdf-lib."
          );
        }
      }
    }

    preparePdf();

    return () => {
      active = false;
    };
  }, [receipt]);

  /* DOWNLOAD PDF */

  function downloadPdf() {
    if (!pdfFile) return;

    const url = URL.createObjectURL(pdfFile);
    const link = document.createElement("a");

    link.href = url;
    link.download = pdfFile.name;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  }

  /* SHARE PDF */

  async function sharePdf() {
    if (!pdfFile || sharingPdf) return;

    setPdfMessage("");

    try {
      const canShareFile =
        window.isSecureContext &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({
          files: [pdfFile],
        });

      if (!canShareFile) {
        downloadPdf();

        setPdfMessage(
          "Este navegador no permite compartir archivos. El PDF se descargó para adjuntarlo en WhatsApp."
        );

        return;
      }

      setSharingPdf(true);

      await navigator.share({
        files: [pdfFile],
        title: `Recibo ${receipt.orderNumber}`,
      });

      setPdfMessage(
        "Se abrió el menú para compartir el PDF. El envío se completa en la aplicación que elijas."
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        setPdfMessage(
          "No se pudo compartir el PDF. Puedes descargarlo y adjuntarlo en WhatsApp."
        );
      }
    } finally {
      setSharingPdf(false);
    }
  }

  /* CART */

  function updateCart(next) {
    try {
      localStorage.setItem("cart", JSON.stringify(next));

      setCart(next);
      setError("");

      return true;
    } catch {
      setError(
        "No se pudo guardar el carrito. Tus artículos se conservan."
      );

      return false;
    }
  }

  function addProduct(product) {
    if (reviewing || saving) return;

    if (priceCents(product.price) < 0) {
      setError("Revisa el precio del producto.");
      return;
    }

    const exists = cart.some(
      (item) => item.id === product.id
    );

    const next = exists
      ? cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )
      : [
          ...cart,
          {
            ...product,
            quantity: 1,
          },
        ];

    updateCart(next);
  }

  function changeQuantity(id, delta) {
    if (reviewing || saving) return;

    const next = cart
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + delta,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(next);
  }

  /* TOTALS */

  const totalCents = cart.reduce(
    (sum, item) =>
      sum + priceCents(item.price) * item.quantity,
    0
  );

  const subtotalCents = Math.round(totalCents / 1.16);

  const total = totalCents / 100;
  const subtotal = subtotalCents / 100;
  const iva = (totalCents - subtotalCents) / 100;

  const filteredProducts = products.filter((product) =>
    String(product.name || "")
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  /* REVIEW */

  function openReview() {
    if (!cart.length) return;

    if (!orderNumber) {
      setOrderNumber(
        createId().slice(0, 18).toUpperCase()
      );
    }

    setError("");
    setReviewing(true);
  }

  function backToCart() {
    setReviewing(false);

    requestAnimationFrame(() => {
      continueRef.current?.focus();
    });
  }

  /* SAVE SALE */

  function completeOrder(event) {
    event.preventDefault();

    if (!cart.length || savingRef.current) return;

    savingRef.current = true;
    setSaving(true);
    setError("");

    try {
      const sales = readArray("sales");

      const employee = JSON.parse(
        localStorage.getItem("activeEmployee") || "null"
      );

      const sale = {
        id: createId(),
        orderNumber,

        customerName: customerName.trim() || "Cliente",
        customerPhone: customerPhone.trim(),
        tableNumber: tableNumber.trim() || "-",

        paymentMethod,

        subtotal: subtotal.toFixed(2),
        iva: iva.toFixed(2),
        total: total.toFixed(2),

        date: new Date().toISOString(),

        branch:
          localStorage.getItem("activeBranch") || "",

        employeeId: employee?.id ?? null,
        employeeName: employee?.name || "",

        items: cart.map((item) => ({ ...item })),
      };

      localStorage.setItem(
        "sales",
        JSON.stringify([...sales, sale])
      );

      setPdfFile(null);
      setReceipt(sale);

      setCart([]);
      setReviewing(false);
      setOrderNumber("");

      setCustomerName("");
      setCustomerPhone("");
      setTableNumber("");
      setPaymentMethod("Card");

      try {
        localStorage.removeItem("cart");
      } catch {
        setError(
          "La venta se guardó, pero no se pudo limpiar el carrito local."
        );
      }
    } catch (err) {
      setError(
        err.message ||
        "No se pudo guardar la venta. El carrito se conserva."
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  /* WHATSAPP */

  const digits =
    receipt?.customerPhone?.replace(/\D/g, "") || "";

  const phone =
    digits.length === 10 ? `52${digits}` : digits;

  const whatsappUrl =
    phone.length >= 11 && phone.length <= 15
      ? `https://wa.me/${phone}?text=${encodeURIComponent(
          [
            "El Cordobés",
            `Orden #${receipt?.orderNumber}`,
            `Total: ${formatMoney(receipt?.total)} MXN`,
            "Gracias por tu visita.",
          ].join("\n")
        )}`
      : "";

  /* RENDER */

  return (
    <div id="cori-pos" className="cori-home">
  <Sidebar goTo={goTo} active="pos" />

  <main className="ch-main cpos-main">

        {/* PREMIUM HEADER */}

        <header className="cpos-premium-header">
          <div className="cpos-premium-heading">
            <p className="cpos-premium-eyebrow">
              CORI POS / COFFEE TECH STUDIO
            </p>

            <h1>Nueva venta</h1>

            <p>
              Prepara una nueva orden para tu cliente.
            </p>
          </div>

         
        </header>


 <div className="cpos-academy-section">
  <CoriAcademy
    title="¡Hola! Soy Cori."
    description="Aprende a agregar café y pan, continuar al cobro, registrar una venta y compartir el ticket por WhatsApp."
    videoSrc={`${import.meta.env.BASE_URL}videos/cori_greeting_and_guiding_29857_Seedance_25.mp4`}
  />
</div>

        <div className="cpos-layout">

          {/* PRODUCTS */}

          <section
            className="cpos-menu"
            aria-label="Productos"
          >
            <header className="cpos-menu-header">
              <div>
                <h2>¿Qué vamos a preparar?</h2>
                <p>
                  Toca un cuadro para añadir el producto.
                </p>
              </div>

              <input
                className="cpos-search"
                type="search"
                placeholder="Buscar producto"
                aria-label="Buscar producto"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </header>

            {loading && (
              <p className="cpos-message">
                Cargando productos…
              </p>
            )}

            {!loading && !products.length && (
              <div className="cpos-message">
                <p>Aún no tienes productos.</p>

                <button
                  type="button"
                  className="cpos-button"
                  onClick={() => goTo("products")}
                >
                  Abrir catálogo
                </button>
              </div>
            )}

            {!loading &&
              products.length > 0 &&
              !filteredProducts.length && (
                <p className="cpos-message">
                  No encontramos ese producto.
                </p>
              )}

            <div className="cpos-grid">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="cpos-product"
                  disabled={reviewing || saving}
                  onClick={() => addProduct(product)}
                  aria-label={`Añadir ${product.name}, ${formatMoney(product.price)}`}
                >
                  <ProductPhoto
                    key={product.image || "empty"}
                    src={product.image}
                  />

                  <span className="cpos-product-info">
                    <span className="cpos-product-name">
                      {product.name}
                    </span>

                    <span className="cpos-product-price">
                      {formatMoney(product.price)}
                    </span>

                    <span className="cpos-product-add">
                      ＋ Añadir
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* CURRENT ORDER */}

          <aside
            className={`cpos-ticket${
              reviewing ? " is-reviewing" : ""
            }`}
            aria-label="Pedido actual"
          >
            <header className="cpos-ticket-header">
              <h2>
                {reviewing
                  ? "Revisar pedido"
                  : "Tu pedido"}
              </h2>

              <p>
                {reviewing
                  ? `Orden #${orderNumber}`
                  : "Todo listo para tu próximo café."}
              </p>
            </header>

            {error && (
              <p className="cpos-error" role="alert">
                {error}
              </p>
            )}

            <div className="cpos-ticket-body">
              {!cart.length && (
                <p className="cpos-message">
                  Añade productos para comenzar.
                </p>
              )}

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="cpos-item"
                >
                  <div className="cpos-item-info">
                    <strong>{item.name}</strong>

                    {reviewing ? (
                      <span>
                        Cantidad: {item.quantity}
                      </span>
                    ) : (
                      <div className="cpos-quantity">
                        <button
                          type="button"
                          aria-label={`Quitar una unidad de ${item.name}`}
                          onClick={() =>
                            changeQuantity(item.id, -1)
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          aria-label={`Añadir una unidad de ${item.name}`}
                          onClick={() =>
                            changeQuantity(item.id, 1)
                          }
                        >
                          ＋
                        </button>
                      </div>
                    )}
                  </div>

                  <strong>
                    {formatMoney(
                      priceCents(item.price) *
                        item.quantity /
                        100
                    )}
                  </strong>
                </div>
              ))}

              {/* PAYMENT REVIEW */}

              {reviewing && (
                <form
                  id="cpos-review-form"
                  className="cpos-form"
                  onSubmit={completeOrder}
                >
                  <label htmlFor="cpos-name">
                    Nombre del cliente
                  </label>

                  <input
                    ref={nameRef}
                    id="cpos-name"
                    value={customerName}
                    placeholder="Opcional"
                    onChange={(event) =>
                      setCustomerName(event.target.value)
                    }
                  />

                  <label htmlFor="cpos-phone">
                    WhatsApp
                  </label>

                  <input
                    id="cpos-phone"
                    type="tel"
                    value={customerPhone}
                    placeholder="Número del cliente · opcional"
                    onChange={(event) =>
                      setCustomerPhone(event.target.value)
                    }
                  />

                  <div className="cpos-form-pair">
                    <div>
                      <label htmlFor="cpos-table">
                        Mesa
                      </label>

                      <input
                        id="cpos-table"
                        value={tableNumber}
                        placeholder="Para llevar"
                        onChange={(event) =>
                          setTableNumber(event.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label htmlFor="cpos-payment">
                        Pago recibido
                      </label>

                      <select
                        id="cpos-payment"
                        value={paymentMethod}
                        onChange={(event) =>
                          setPaymentMethod(event.target.value)
                        }
                      >
                        <option value="Card">
                          Tarjeta
                        </option>
                        <option value="Cash">
                          Efectivo
                        </option>
                        <option value="Transferencia">
                          Transferencia
                        </option>
                        <option value="QR">
                          QR
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="cpos-tax-row">
                    <span>Subtotal</span>
                    <strong>
                      {formatMoney(subtotal)}
                    </strong>
                  </div>

                  <div className="cpos-tax-row">
                    <span>IVA incluido · 16%</span>
                    <strong>
                      {formatMoney(iva)}
                    </strong>
                  </div>

                  <p className="cpos-note">
                    Registra el pago recibido en tu
                    terminal o caja.
                  </p>
                </form>
              )}
            </div>

            {/* TOTAL AND CHECKOUT */}

            <footer className="cpos-ticket-footer">
              <div className="cpos-total">
                <span>Total</span>
                <strong>
                  {formatMoney(total)}
                </strong>
              </div>

              {reviewing ? (
                <div className="cpos-actions">
                  <button
                    type="button"
                    className="cpos-button cpos-secondary"
                    disabled={saving}
                    onClick={backToCart}
                  >
                    Volver
                  </button>

                  <button
                    type="submit"
                    form="cpos-review-form"
                    className="cpos-button"
                    disabled={saving || !cart.length}
                  >
                    {saving
                      ? "Guardando…"
                      : "Registrar venta"}
                  </button>
                </div>
              ) : (
                <button
                  ref={continueRef}
                  type="button"
                  className="cpos-button cpos-wide"
                  disabled={!cart.length}
                  onClick={openReview}
                >
                  Continuar al cobro →
                </button>
              )}
            </footer>
          </aside>
        </div>

        {/* RECEIPT AND PDF */}

        <dialog
          ref={receiptRef}
          className="cpos-receipt-dialog"
          aria-label="Venta registrada"
          onClose={() => setReceipt(null)}
          onCancel={() => setReceipt(null)}
        >
          {receipt && (
            <>
              <Receipt
                orderNumber={receipt.orderNumber}
                customerName={receipt.customerName}
                paymentMethod={receipt.paymentMethod}
                tableNumber={receipt.tableNumber}
                currentDate={new Date(
                  receipt.date
                ).toLocaleString("es-MX")}
                cart={receipt.items}
                subtotal={Number(receipt.subtotal)}
                iva={Number(receipt.iva)}
                total={Number(receipt.total)}
              />

              <div className="cpos-pdf-actions">
                <button
                  type="button"
                  className="cpos-button"
                  disabled={!pdfFile || sharingPdf}
                  onClick={downloadPdf}
                >
                  Descargar PDF
                </button>

                <button
                  type="button"
                  className="cpos-button"
                  disabled={!pdfFile || sharingPdf}
                  onClick={sharePdf}
                >
                  {sharingPdf
                    ? "Compartiendo…"
                    : "Compartir PDF"}
                </button>
              </div>

              {!pdfFile && !pdfError && (
                <p
                  className="cpos-note"
                  role="status"
                >
                  Preparando PDF…
                </p>
              )}

              {pdfError && (
                <p
                  className="cpos-error"
                  role="alert"
                >
                  {pdfError}
                </p>
              )}

              {pdfMessage && (
                <p
                  className="cpos-note"
                  role="status"
                >
                  {pdfMessage}
                </p>
              )}

              <p className="cpos-note">
                Para compartir el PDF, elige WhatsApp
                y luego el contacto.
              </p>

              {whatsappUrl && (
                <a
                  className="cpos-whatsapp"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir WhatsApp · texto
                </a>
              )}

              <button
                autoFocus
                type="button"
                className="cpos-button cpos-wide"
                disabled={sharingPdf}
                onClick={() => setReceipt(null)}
              >
                Nueva venta →
              </button>
            </>
          )}
        </dialog>
      </main>
    </div>
  );
}
