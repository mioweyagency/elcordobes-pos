
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import "../styles/inventorymodal.css";

export default function InventoryModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) {
  const { i18n } = useTranslation();

  const es = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "es"
  ).startsWith("es");

  const t = (spanish, english) =>
    es ? spanish : english;

  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [unit, setUnit] = useState("kg");
  const [supplier, setSupplier] = useState("");
  const [cost, setCost] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setName(editingItem?.name ?? "");
    setStock(editingItem?.stock ?? "");
    setMinimumStock(editingItem?.minimumStock ?? "");
    setUnit(editingItem?.unit ?? "kg");
    setSupplier(editingItem?.supplier ?? "");
    setCost(editingItem?.cost ?? "");
    setError("");
  }, [editingItem, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, saving, onClose]);

  async function handleSave(event) {
    event.preventDefault();

    if (saving) return;

    if (
      !name.trim() ||
      stock === "" ||
      minimumStock === "" ||
      cost === ""
    ) {
      setError(
        t(
          "Completa el nombre, existencias, mínimo y costo.",
          "Complete the name, stock, minimum and cost."
        )
      );
      return;
    }

    const values = [
      Number(stock),
      Number(minimumStock),
      Number(cost),
    ];

    if (
      values.some(
        (value) =>
          !Number.isFinite(value) || value < 0
      )
    ) {
      setError(
        t(
          "Los valores deben ser números iguales o mayores a cero.",
          "Values must be zero or greater."
        )
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        ...(editingItem || {}),
        id: editingItem?.id ?? Date.now(),
        name: name.trim(),
        stock: Number(stock),
        minimumStock: Number(minimumStock),
        unit,
        supplier: supplier.trim(),
        cost: Number(cost),
      });

      onClose();
    } catch (err) {
      console.error("Inventory save error:", err);

      setError(
        t(
          "No se pudo guardar. Los datos siguen en el formulario.",
          "Could not save. Your information remains in the form."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="inventory-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <form
        className="inventory-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-modal-title"
        onSubmit={handleSave}
      >
        <div className="inventory-modal-header">
          <div>
            <p>CORI POS / INVENTORY</p>

            <h2 id="inventory-modal-title">
              {editingItem
                ? t("Editar insumo", "Edit supply")
                : t("Nuevo insumo", "New supply")}
            </h2>

            <span>
              {t(
                "Organiza los recursos de tu cafetería.",
                "Organize your café supplies."
              )}
            </span>
          </div>

          <button
            type="button"
            className="inventory-close-btn"
            aria-label={t("Cerrar", "Close")}
            disabled={saving}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && (
          <p className="cori-error" role="alert">
            {error}
          </p>
        )}

        <div className="inventory-form">
          <label className="inventory-field full">
            <span>
              {t("Nombre del insumo", "Supply name")}
            </span>

            <input
              autoFocus
              required
              type="text"
              placeholder={t(
                "Ej. Leche entera",
                "E.g. Whole milk"
              )}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="inventory-field">
            <span>
              {t(
                "Existencias actuales",
                "Current stock"
              )}
            </span>

            <input
              required
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </label>

          <label className="inventory-field">
            <span>
              {t("Stock mínimo", "Minimum stock")}
            </span>

            <input
              required
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="0"
              value={minimumStock}
              onChange={(e) =>
                setMinimumStock(e.target.value)
              }
            />
          </label>

          <label className="inventory-field">
            <span>{t("Unidad", "Unit")}</span>

            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="kg">
                {t("Kilogramos", "Kilograms")} · kg
              </option>

              <option value="L">
                {t("Litros", "Liters")} · L
              </option>

              <option value="pcs">
                {t("Piezas", "Pieces")} · pcs
              </option>
            </select>
          </label>

          <label className="inventory-field">
            <span>
              {t("Costo por unidad", "Unit cost")} · MXN
            </span>

            <input
              required
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </label>

          <label className="inventory-field full">
            <span>{t("Proveedor", "Supplier")}</span>

            <input
              type="text"
              placeholder={t(
                "Nombre del proveedor",
                "Supplier name"
              )}
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </label>
        </div>

        <div className="inventory-modal-actions">
          <button
            type="button"
            className="inventory-cancel-btn"
            disabled={saving}
            onClick={onClose}
          >
            {t("Cancelar", "Cancel")}
          </button>

          <button
            type="submit"
            className="inventory-save-btn"
            disabled={saving}
          >
            {saving
              ? t("Guardando...", "Saving...")
              : t("Guardar insumo →", "Save supply →")}
          </button>
        </div>
      </form>
    </div>
  );
}
