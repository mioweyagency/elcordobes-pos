
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";
import InventoryModal from "../components/InventoryModal";
import CoriAcademy from "../components/CoriAcademy";
import {
  saveInventoryDB,
  getInventoryDB,
  deleteInventoryDB,
} from "../utils/db";
import "../styles/home.css";
import "../styles/inventory.css";
const money = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value) || 0);
function StockIcon({ name, size = 20 }) {
  const icons = {
    package: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="M3 8v9l9 5 9-5V8M12 13v9" />
      </>
    ),
    alert: (
      <>
        <path d="m12 3 10 18H2L12 3Z" />
        <path d="M12 9v5M12 18h.01" />
      </>
    ),
    empty: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
      </>
    ),
    value: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9c-.7-1-1.8-1.5-3-1.5-2 0-3 1-3 2.5 0 3.5 6 1 6 4.5 0 1.5-1.3 2.5-3 2.5-1.3 0-2.4-.5-3.2-1.5M12 5v14" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 5 5" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}
export default function Inventory({ goTo }) {
  const { i18n } = useTranslation();
  const es = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "es"
  ).startsWith("es");
  const t = (spanish, english) =>
    es ? spanish : english;
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  async function loadInventory() {
    setLoading(true);
    setError("");
    try {
      const data = await getInventoryDB();
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Inventory load error:", err);
      setError(
        t(
          "No se pudo cargar el inventario.",
          "Could not load inventory."
        )
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadInventory();
  }, []);
  const summary = useMemo(() => {
    const low = inventory.filter(
      (item) =>
        Number(item.stock) > 0 &&
        Number(item.stock) <= Number(item.minimumStock)
    );
    const out = inventory.filter(
      (item) => Number(item.stock) <= 0
    );
    const value = inventory.reduce(
      (total, item) =>
        total +
        (Number(item.stock) || 0) *
          (Number(item.cost) || 0),
      0
    );
    return {
      total: inventory.length,
      low: low.length,
      out: out.length,
      value,
    };
  }, [inventory]);
  /* CORI SMART ALERTS */
  const coriAlerts = useMemo(() => {
    const out = inventory.filter((item) => Number(item.stock) <= 0);
    const low = inventory.filter((item) => {
      const stock = Number(item.stock) || 0;
      const minimum = Number(item.minimumStock) || 0;
      return stock > 0 && stock <= minimum;
    });
    return { out, low };
  }, [inventory]);
  const criticalItem = coriAlerts.out[0];
  const warningItem = coriAlerts.low[0];
  const alertType = criticalItem ? "danger" : warningItem ? "warning" : "success";
  function viewCoriAlerts() {
    setSearch("");
    if (coriAlerts.out.length > 0) setFilter("out");
    else if (coriAlerts.low.length > 0) setFilter("low");
    requestAnimationFrame(() => {
      document.getElementById("inventory-catalog")?.scrollIntoView({
        behavior: "smooth", block: "start",
      });
    });
  }
  const filteredInventory = useMemo(() => {
    const term = search.trim().toLowerCase();
    return inventory.filter((item) => {
      const stock = Number(item.stock) || 0;
      const minimum = Number(item.minimumStock) || 0;
      const matchesSearch =
        !term ||
        String(item.name || "")
          .toLowerCase()
          .includes(term) ||
        String(item.supplier || "")
          .toLowerCase()
          .includes(term);
      let matchesFilter = true;
      if (filter === "low") {
        matchesFilter = stock > 0 && stock <= minimum;
      }
      if (filter === "out") {
        matchesFilter = stock <= 0;
      }
      if (filter === "healthy") {
        matchesFilter = stock > minimum;
      }
      return matchesSearch && matchesFilter;
    });
  }, [inventory, search, filter]);
  function openNewItem() {
    setEditingItem(null);
    setIsModalOpen(true);
  }
  function openEditItem(item) {
    setEditingItem(item);
    setIsModalOpen(true);
  }
  async function saveInventoryItem(item) {
    await saveInventoryDB(item);
    await loadInventory();
    setNotice(
      t(
        "Inventario actualizado correctamente.",
        "Inventory updated successfully."
      )
    );
  }
  async function deleteInventoryItem(item) {
    const confirmed = window.confirm(
      t(
        `¿Eliminar "${item.name}" del inventario?`,
        `Delete "${item.name}" from inventory?`
      )
    );
    if (!confirmed) return;
    setBusyId(item.id);
    setError("");
    setNotice("");
    try {
      await deleteInventoryDB(item.id);
      await loadInventory();
      setNotice(
        t("Insumo eliminado.", "Supply deleted.")
      );
    } catch (err) {
      console.error("Inventory delete error:", err);
      setError(
        t(
          "No se pudo eliminar el insumo.",
          "Could not delete supply."
        )
      );
    } finally {
      setBusyId(null);
    }
  }
  async function adjustStock(item, delta) {
    if (busyId !== null) return;
    const current = Number(item.stock) || 0;
    const next = Math.max(0, current + delta);
    if (next === current) return;
    setBusyId(item.id);
    setError("");
    try {
      await saveInventoryDB({
        ...item,
        stock: next,
      });
      await loadInventory();
    } catch (err) {
      console.error("Stock update error:", err);
      setError(
        t(
          "No se pudo ajustar el inventario.",
          "Could not adjust stock."
        )
      );
    } finally {
      setBusyId(null);
    }
  }
  async function requestRestock(item) {
    const minimum = Number(item.minimumStock) || 0;
    const current = Number(item.stock) || 0;
    const suggested = Math.max(
      minimum * 2 - current,
      minimum - current,
      0
    );
    const message = t(
      `Hola, quisiera solicitar una reposición de ${item.name}.\n\nExistencias actuales: ${current} ${item.unit}\nMínimo: ${minimum} ${item.unit}\nCantidad sugerida: ${suggested} ${item.unit}\nProveedor: ${item.supplier || "Por confirmar"}\n\nGracias.`,
      `Hello, I would like to request a restock of ${item.name}.\n\nCurrent stock: ${current} ${item.unit}\nMinimum: ${minimum} ${item.unit}\nSuggested quantity: ${suggested} ${item.unit}\nSupplier: ${item.supplier || "To confirm"}\n\nThank you.`
    );
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("Pedido de insumos", "Supply order"),
          text: message,
        });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }
    const url = `https\://wa.me/?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }
  const filters = [
    { id: "all", label: t("Todos", "All") },
    { id: "low", label: t("Stock bajo", "Low stock") },
    { id: "out", label: t("Agotados", "Out of stock") },
    { id: "healthy", label: t("En orden", "Healthy") },
  ];
  return (
    <div className="cori-home cori-inventory-page">
      <Sidebar goTo={goTo} active="inventory" />
      <main className="ch-main inventory-main">
        <div className="inventory-page">
          {/* HEADER */}
          <header className="inventory-header">
            <div>
              <p>CORI POS / COFFEE TECH STUDIO</p>
              <h1>{t("Inventario", "Inventory")}</h1>
              <span>
                {t(
                  "Controla tus insumos, existencias y proveedores desde un solo lugar.",
                  "Manage supplies, stock levels and suppliers in one place."
                )}
              </span>
            </div>
            <button
              type="button"
              className="inventory-add-btn"
              onClick={openNewItem}
            >
              <span aria-hidden="true">＋</span>
              {t("Nuevo insumo", "New supply")}
            </button>
          </header>
          {/* CORI SMART ALERTS */}
          {!loading && !error && inventory.length > 0 && (
            <section
              className={`cori-stock-alert ${alertType}`}
              role="status"
              aria-live="polite"
            >
              <div className="cori-stock-alert-icon" aria-hidden="true">
                {alertType === "danger" ? "🚨" : alertType === "warning" ? "🔔" : "✦"}
              </div>
              <div className="cori-stock-alert-content">
                <span className="cori-stock-alert-eyebrow">CORI SMART ALERTS</span>
                <h3>
                  {alertType === "danger"
                    ? t("¡Ay, no! Tenemos productos agotados.", "Oh no! Some supplies are out of stock.")
                    : alertType === "warning"
                    ? t("¡Atención! Tenemos inventario bajo.", "Attention! Some supplies are running low.")
                    : t("¡Excelente! Todo está en orden.", "Excellent! Everything is in order.")}
                </h3>
                <p>
                  {alertType === "danger"
                    ? t(
                        `${criticalItem.name} está agotado. Hay ${coriAlerts.out.length} insumo(s) sin existencias y ${coriAlerts.low.length} con stock bajo.`,
                        `${criticalItem.name} is out of stock. ${coriAlerts.out.length} item(s) are unavailable and ${coriAlerts.low.length} are running low.`
                      )
                    : alertType === "warning"
                    ? t(
                        `${warningItem.name} tiene solamente ${warningItem.stock} ${warningItem.unit || ""}. Hay ${coriAlerts.low.length} insumo(s) que necesitan reposición.`,
                        `${warningItem.name} has only ${warningItem.stock} ${warningItem.unit || ""} remaining. ${coriAlerts.low.length} item(s) need restocking.`
                      )
                    : t(
                        "Cori está vigilando tus existencias. No hay productos agotados ni con stock bajo.",
                        "Cori is monitoring your supplies. No items are out of stock or running low."
                      )}
                </p>
              </div>
              {alertType !== "success" && (
                <button type="button" className="cori-stock-alert-button" onClick={viewCoriAlerts}>
                  {t("Ver productos →", "View supplies →")}
                </button>
              )}
            </section>
          )}
          {/* CORI ACADEMY — INVENTARIO */}
          <div className="cinventory-academy-section">
            <CoriAcademy
              title={t("¡Ay, no! ¡Nos quedamos sin café!", "Oh no! We're out of coffee!")}
              description={t(
                "Aprende a agregar inventario, controlar existencias y recibir alertas antes de que se agoten tus insumos.",
                "Learn to add inventory, monitor supplies and receive alerts before items run out."
              )}
              videoSrc={`${import.meta.env.BASE_URL}videos/cori_greeting_and_guiding_15087_Seedance_25.mp4`}
            />
          </div>
          {/* HERO */}
          <section className="inventory-hero">
            <div>
              <p className="inventory-eyebrow">
                {t(
                  "CONTROL INTELIGENTE",
                  "SMART INVENTORY"
                )}
              </p>
              <h2>
                {t(
                  "Todo listo para un gran café.",
                  "Everything ready for great coffee."
                )}
              </h2>
              <span>
                {t(
                  "Conoce lo que tienes, identifica lo que falta y mantén tu cafetería preparada.",
                  "Know what you have, spot what's missing and keep your café prepared."
                )}
              </span>
            </div>
            <div className="inventory-hero-symbol" aria-hidden="true">
              ✦
            </div>
          </section>
          {/* STATS */}
          <section className="inventory-stats">
            <article className="inventory-stat">
              <div className="inventory-stat-icon">
                <StockIcon name="package" />
              </div>
              <span>{t("Insumos", "Supplies")}</span>
              <strong>{summary.total}</strong>
              <small>
                {t("Registrados", "Registered")}
              </small>
            </article>
            <article className="inventory-stat">
              <div className="inventory-stat-icon warning">
                <StockIcon name="alert" />
              </div>
              <span>{t("Stock bajo", "Low stock")}</span>
              <strong>{summary.low}</strong>
              <small>
                {t(
                  "Necesitan atención",
                  "Need attention"
                )}
              </small>
            </article>
            <article className="inventory-stat">
              <div className="inventory-stat-icon danger">
                <StockIcon name="empty" />
              </div>
              <span>{t("Agotados", "Out of stock")}</span>
              <strong>{summary.out}</strong>
              <small>
                {t("Sin existencias", "No stock")}
              </small>
            </article>
            <article className="inventory-stat">
              <div className="inventory-stat-icon">
                <StockIcon name="value" />
              </div>
              <span>
                {t("Valor del inventario", "Stock value")}
              </span>
              <strong className="inventory-stat-money">
                {money(summary.value)}
              </strong>
              <small>
                {t("Costo estimado", "Estimated cost")}
              </small>
            </article>
          </section>
          {/* TOOLBAR */}
          <section id="inventory-catalog" className="inventory-catalog">
            <div className="inventory-catalog-heading">
              <div>
                <p className="inventory-eyebrow">
                  {t("TU CAFETERÍA", "YOUR COFFEE SHOP")}
                </p>
                <h2>
                  {t(
                    "Control de existencias",
                    "Stock management"
                  )}
                </h2>
              </div>
              <div className="inventory-search">
                <StockIcon name="search" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder={t(
                    "Buscar insumo...",
                    "Search supplies..."
                  )}
                  aria-label={t(
                    "Buscar insumos",
                    "Search supplies"
                  )}
                />
              </div>
            </div>
            <div className="inventory-filters">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    filter === item.id
                      ? "inventory-filter active"
                      : "inventory-filter"
                  }
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {error && (
              <p className="inventory-feedback error" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="inventory-feedback" role="status">
                {notice}
              </p>
            )}
            {/* CARDS */}
            {loading ? (
              <div className="inventory-empty">
                {t(
                  "Cargando inventario...",
                  "Loading inventory..."
                )}
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="inventory-empty">
                <div className="inventory-empty-icon">☕</div>
                <h3>
                  {inventory.length === 0
                    ? t(
                        "Comienza tu inventario",
                        "Start your inventory"
                      )
                    : t(
                        "No encontramos insumos",
                        "No supplies found"
                      )}
                </h3>
                <p>
                  {inventory.length === 0
                    ? t(
                        "Registra café, leche, vasos y los demás insumos de tu cafetería.",
                        "Add coffee, milk, cups and other café supplies."
                      )
                    : t(
                        "Prueba otra búsqueda o filtro.",
                        "Try another search or filter."
                      )}
                </p>
                {inventory.length === 0 && (
                  <button
                    type="button"
                    className="inventory-add-btn"
                    onClick={openNewItem}
                  >
                    {t("Agregar insumo", "Add supply")}
                  </button>
                )}
              </div>
            ) : (
              <div className="inventory-grid">
                {filteredInventory.map((item) => {
                  const stock = Number(item.stock) || 0;
                  const minimum =
                    Number(item.minimumStock) || 0;
                  const out = stock <= 0;
                  const low = !out && stock <= minimum;
                  const status = out
                    ? "out"
                    : low
                    ? "low"
                    : "healthy";
                  const percentage =
                    minimum > 0
                      ? Math.min(
                          100,
                          (stock / (minimum * 2)) * 100
                        )
                      : stock > 0
                      ? 100
                      : 0;
                  return (
                    <article
                      key={item.id}
                      className={`inventory-card ${
                        status !== "healthy"
                          ? "low-stock-card"
                          : ""
                      }`}
                    >
                      <div className="inventory-card-top">
                        <span className="inventory-item-icon">
                          <StockIcon name="package" size={22} />
                        </span>
                        <span
                          className={`inventory-status ${status}`}
                        >
                          {out
                            ? t("Agotado", "Out of stock")
                            : low
                            ? t("Stock bajo", "Low stock")
                            : t("En orden", "Healthy")}
                        </span>
                      </div>
                      <h2>{item.name}</h2>
                      <div className="inventory-stock">
                        <span>
                          {t(
                            "EXISTENCIAS ACTUALES",
                            "CURRENT STOCK"
                          )}
                        </span>
                        <h3>
                          {stock}
                          <small> {item.unit}</small>
                        </h3>
                      </div>
                      <div
                        className={`inventory-progress ${status}`}
                        aria-label={t(
                          "Nivel de existencias",
                          "Stock level"
                        )}
                      >
                        <span
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                      <div className="inventory-info">
                        <div>
                          <p>{t("Mínimo", "Minimum")}</p>
                          <h3>
                            {minimum} {item.unit}
                          </h3>
                        </div>
                        <div>
                          <p>
                            {t(
                              "Costo unitario",
                              "Unit cost"
                            )}
                          </p>
                          <h3>{money(item.cost)}</h3>
                        </div>
                      </div>
                      <div className="inventory-supplier">
                        <span>
                          {t("PROVEEDOR", "SUPPLIER")}
                        </span>
                        <h4>
                          {item.supplier ||
                            t(
                              "Sin proveedor",
                              "No supplier"
                            )}
                        </h4>
                      </div>
                      <div className="inventory-quick-adjust">
                        <span>
                          {t(
                            "Ajuste rápido",
                            "Quick adjustment"
                          )}
                        </span>
                        <div>
                          <button
                            type="button"
                            disabled={
                              busyId !== null || stock <= 0
                            }
                            onClick={() =>
                              adjustStock(item, -1)
                            }
                            aria-label={t(
                              `Reducir ${item.name}`,
                              `Decrease ${item.name}`
                            )}
                          >
                            −
                          </button>
                          <strong>
                            {stock} {item.unit}
                          </strong>
                          <button
                            type="button"
                            disabled={busyId !== null}
                            onClick={() =>
                              adjustStock(item, 1)
                            }
                            aria-label={t(
                              `Aumentar ${item.name}`,
                              `Increase ${item.name}`
                            )}
                          >
                            \+
                          </button>
                        </div>
                      </div>
                      {(low || out) && (
                        <button
                          type="button"
                          className="inventory-order-btn"
                          onClick={() =>
                            requestRestock(item)
                          }
                        >
                          {t(
                            "Solicitar reposición ↗",
                            "Request restock ↗"
                          )}
                        </button>
                      )}
                      <div className="inventory-actions">
                        <button
                          type="button"
                          className="inventory-edit-btn"
                          onClick={() =>
                            openEditItem(item)
                          }
                        >
                          {t("Editar", "Edit")}
                        </button>
                        <button
                          type="button"
                          className="inventory-delete-btn"
                          disabled={busyId !== null}
                          onClick={() =>
                            deleteInventoryItem(item)
                          }
                        >
                          {t("Eliminar", "Delete")}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
          {/* CORI INSIGHTS */}
          <section className="inventory-insights">
            <div className="inventory-insights-symbol">✦</div>
            <div>
              <p className="inventory-eyebrow">
                CORI INSIGHTS
              </p>
              <h3>
                {summary.low + summary.out > 0
                  ? t(
                      "Hay insumos que necesitan atención.",
                      "Some supplies need attention."
                    )
                  : t(
                      "Tu inventario está en orden.",
                      "Your inventory is looking good."
                    )}
              </h3>
              <p>
                {summary.low + summary.out > 0
                  ? t(
                      `Tienes ${summary.low} insumos con stock bajo y ${summary.out} agotados. Revisa las existencias antes de tu próximo turno.`,
                      `You have ${summary.low} low-stock supplies and ${summary.out} out of stock. Review your supplies before the next shift.`
                    )
                  : t(
                      "No hay alertas de existencias en este momento.",
                      "There are no stock alerts right now."
                    )}
              </p>
            </div>
          </section>
        </div>
        <InventoryModal
          isOpen={isModalOpen}
          editingItem={editingItem}
          onClose={() => setIsModalOpen(false)}
          onSave={saveInventoryItem}
        />
      </main>
    </div>
  );
}
