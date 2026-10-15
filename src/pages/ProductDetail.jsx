
import { useState } from "react";
import { useTranslation } from "react-i18next";

import Sidebar from "../components/Sidebar";
import defaultImage from "../assets/hero.png";

import "../styles/home.css";
import "../styles/productDetail.css";

import { saveProductDB } from "../utils/db";

const CATEGORIES = [
  "Coffee",
  "Cold Drinks",
  "Tea & Matcha",
  "Bakery",
  "Desserts",
  "Food",
  "Retail Beans",
];

const CATEGORY_ES = {
  Coffee: "Café",
  "Cold Drinks": "Bebidas frías",
  "Tea & Matcha": "Té y matcha",
  Bakery: "Panadería",
  Desserts: "Postres",
  Food: "Alimentos",
  "Retail Beans": "Café en grano",
};

function readSelectedProduct() {
  try {
    return JSON.parse(
      localStorage.getItem("selectedProduct") || "null"
    );
  } catch {
    return null;
  }
}

function parsePrice(value) {
  const clean = String(value ?? "")
    .replace(/[^0-9.-]/g, "");

  return clean === "" ? NaN : Number(clean);
}

export default function ProductDetail({ goTo }) {
  const { i18n } = useTranslation();

  const es = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "es"
  ).startsWith("es");

  const t = (spanish, english) =>
    es ? spanish : english;

  const [initial] = useState(() => {
    const selected = readSelectedProduct();
    const requestedMode = localStorage.getItem("productMode");

    return {
      mode:
        requestedMode === "edit" && selected
          ? "edit"
          : "new",
      product: selected,
    };
  });

  const { mode, product: selectedProduct } = initial;

  const [image, setImage] = useState(
    mode === "edit"
      ? selectedProduct.image || defaultImage
      : defaultImage
  );

  const [productName, setProductName] = useState(
    mode === "edit" ? selectedProduct.name || "" : ""
  );

  const [category, setCategory] = useState(
    mode === "edit" ? selectedProduct.category || "" : ""
  );

  const [price, setPrice] = useState(
    mode === "edit" ? selectedProduct.price ?? "" : ""
  );

  const [inventory, setInventory] = useState(
    mode === "edit" ? selectedProduct.inventory ?? "" : ""
  );

  const [description, setDescription] = useState(
    mode === "edit"
      ? selectedProduct.description || ""
      : ""
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        t(
          "Selecciona una imagen válida.",
          "Select a valid image."
        )
      );
      return;
    }

    setUploading(true);
    setError("");

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const img = await new Promise((resolve, reject) => {
        const picture = new Image();
        picture.onload = () => resolve(picture);
        picture.onerror = reject;
        picture.src = dataUrl;
      });

      const MAX_SIZE = 1000;
      const scale = Math.min(
        1,
        MAX_SIZE / Math.max(img.width, img.height)
      );

      const canvas = document.createElement("canvas");

      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas unavailable");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      setImage(canvas.toDataURL("image/jpeg", 0.78));
    } catch (err) {
      console.error("Image upload error:", err);
      setError(
        t(
          "No se pudo procesar la imagen.",
          "Could not process the image."
        )
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function saveProduct(event) {
    event.preventDefault();

    if (saving || uploading) return;

    const name = productName.trim();
    const amount = parsePrice(price);
    const stock = Number(inventory);

    if (!name) {
      setError(
        t(
          "Escribe el nombre del producto.",
          "Enter the product name."
        )
      );
      return;
    }

    if (!category) {
      setError(
        t(
          "Selecciona una categoría.",
          "Select a category."
        )
      );
      return;
    }

    if (!Number.isFinite(amount) || amount < 0) {
      setError(
        t(
          "Introduce un precio válido.",
          "Enter a valid price."
        )
      );
      return;
    }

    if (
      inventory !== "" &&
      (!Number.isInteger(stock) || stock < 0)
    ) {
      setError(
        t(
          "El inventario debe ser un número entero positivo o cero.",
          "Inventory must be a nonnegative whole number."
        )
      );
      return;
    }

    setSaving(true);
    setError("");

    const newProduct = {
      ...(mode === "edit" ? selectedProduct : {}),
      id:
        mode === "edit"
          ? selectedProduct.id
          : Date.now(),
      image,
      name,
      category,
      price: amount,
      inventory: inventory === "" ? "" : stock,
      description: description.trim(),
    };

    try {
      await saveProductDB(newProduct);

      localStorage.removeItem("selectedProduct");
      localStorage.removeItem("productMode");

      goTo("products");
    } catch (err) {
      console.error("Error saving product:", err);
      setError(
        t(
          "No se pudo guardar el producto.",
          "Could not save the product."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cori-home cori-detail-page">
      <Sidebar goTo={goTo} active="products" />

      <main className="ch-main product-detail-main">
        {/* HEADER */}

        <header className="product-detail-heading">
          <div>
            <p className="detail-eyebrow">
              CORI POS / COFFEE TECH STUDIO
            </p>

            <h1>
              {mode === "new"
                ? t("Nuevo producto", "New product")
                : t("Editar producto", "Edit product")}
            </h1>

            <p>
              {t(
                "Personaliza cada detalle de tu menú.",
                "Customize every detail of your menu."
              )}
            </p>
          </div>

          <button
            type="button"
            className="detail-header-back"
            onClick={() => goTo("products")}
          >
            ← {t("Volver al catálogo", "Back to catalog")}
          </button>
        </header>

        {/* FORM */}

        <form
          className="product-detail-container"
          onSubmit={saveProduct}
        >
          {/* IMAGE PANEL */}

          <section className="product-detail-left">
            <div className="detail-panel-title">
              <span className="detail-eyebrow">
                {t("PRESENTACIÓN", "PRESENTATION")}
              </span>
              <h2>
                {t("Imagen del producto", "Product image")}
              </h2>
              <p>
                {t(
                  "Una buena fotografía ayuda a identificar cada producto.",
                  "A great photo makes every product easy to recognize."
                )}
              </p>
            </div>

            <div className="detail-image-frame">
              <img
                src={image || defaultImage}
                alt={
                  productName ||
                  t("Producto", "Product")
                }
                className="detail-image"
                onError={(e) => {
                  e.currentTarget.src = defaultImage;
                }}
              />
            </div>

            <label className="upload-image-btn">
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M12 16V3m0 0L7 8m5-5 5 5" />
                <path d="M4 16v4h16v-4" />
              </svg>

              {uploading
                ? t("Procesando...", "Processing...")
                : t("Subir fotografía", "Upload photo")}

              <input
                type="file"
                accept="image/*"
                disabled={uploading || saving}
                onChange={handleImageUpload}
              />
            </label>

            <p className="detail-image-note">
              JPG, PNG o WebP · {t(
                "Se optimiza antes de guardar.",
                "Optimized before saving."
              )}
            </p>
          </section>

          {/* DETAILS PANEL */}

          <section className="product-detail-right">
            <div className="detail-panel-title">
              <span className="detail-eyebrow">
                {t("INFORMACIÓN", "INFORMATION")}
              </span>
              <h2>
                {t("Detalles del producto", "Product details")}
              </h2>
              <p>
                {t(
                  "Esta información aparecerá en tu catálogo y en Nueva Venta.",
                  "This information appears in your catalog and New Sale."
                )}
              </p>
            </div>

            <div className="detail-group">
              <label htmlFor="detail-name">
                {t("Nombre del producto", "Product name")}
              </label>

              <input
                id="detail-name"
                type="text"
                value={productName}
                onChange={(e) =>
                  setProductName(e.target.value)
                }
                placeholder="Cappuccino"
                required
              />
            </div>

            <div className="detail-group">
              <label htmlFor="detail-category">
                {t("Categoría", "Category")}
              </label>

              <select
                id="detail-category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                required
              >
                <option value="">
                  {t(
                    "Seleccionar categoría",
                    "Select category"
                  )}
                </option>

                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {es ? CATEGORY_ES[item] : item}
                  </option>
                ))}
              </select>
            </div>

            <div className="detail-form-row">
              <div className="detail-group">
                <label htmlFor="detail-price">
                  {t("Precio de venta", "Sale price")} · MXN
                </label>

                <div className="detail-input-prefix">
                  <span>$</span>

                  <input
                    id="detail-price"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                    placeholder="55.00"
                    required
                  />
                </div>
              </div>

              <div className="detail-group">
                <label htmlFor="detail-inventory">
                  {t("Inventario", "Inventory")}
                </label>

                <input
                  id="detail-inventory"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={inventory}
                  onChange={(e) =>
                    setInventory(e.target.value)
                  }
                  placeholder="40"
                />
              </div>
            </div>

            <div className="detail-group">
              <label htmlFor="detail-description">
                {t("Descripción", "Description")}
              </label>

              <textarea
                id="detail-description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder={t(
                  "Ej. Espresso doble con leche vaporizada...",
                  "E.g. Double espresso with steamed milk..."
                )}
                rows={5}
              />
            </div>

            {error && (
              <p className="detail-error" role="alert">
                {error}
              </p>
            )}

            <div className="detail-buttons">
              <button
                type="button"
                className="back-btn"
                onClick={() => goTo("products")}
                disabled={saving}
              >
                {t("Cancelar", "Cancel")}
              </button>

              <button
                type="submit"
                className="save-btn"
                disabled={saving || uploading}
              >
                {saving
                  ? t("Guardando...", "Saving...")
                  : mode === "new"
                  ? t("Crear producto →", "Create product →")
                  : t("Guardar cambios →", "Save changes →")}
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}
