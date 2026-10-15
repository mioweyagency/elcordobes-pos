import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import Sidebar from "../components/Sidebar";
import CoriAcademy from "../components/CoriAcademy";

import coffeeImg from "../assets/hero.png";

import "../styles/home.css";
import "../styles/products.css";

import {
  getProductsDB,
  deleteProductDB,
} from "../utils/db";

/* ==========================================
   CATEGORIES
========================================== */

const CATEGORIES = [
  "All",
  "Coffee",
  "Cold Drinks",
  "Tea & Matcha",
  "Bakery",
  "Desserts",
  "Food",
  "Retail Beans",
];

const CATEGORY_ES = {
  All: "Todos",
  Coffee: "Café",
  "Cold Drinks": "Bebidas frías",
  "Tea & Matcha": "Té y matcha",
  Bakery: "Panadería",
  Desserts: "Postres",
  Food: "Alimentos",
  "Retail Beans": "Café en grano",
};

/* ==========================================
   MONEY FORMAT
========================================== */

function money(value) {
  const amount = Number(
    String(value ?? 0).replace(/[^0-9.-]/g, "")
  );

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number.isFinite(amount) ? amount : 0);
}

/* ==========================================
   PRODUCT IMAGE
========================================== */

function ProductImage({ src, name }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <img
      className="product-image"
      src={!src || failed ? coffeeImg : src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/* ==========================================
   PRODUCTS PAGE
========================================== */

export default function Products({ goTo }) {
  const { i18n } = useTranslation();

  const es = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "es"
  ).startsWith("es");

  const t = (spanish, english) =>
    es ? spanish : english;

  /* ==========================================
     STATES
  ========================================== */

  const [products, setProducts] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [busyId, setBusyId] = useState(null);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  /* ==========================================
     LOAD PRODUCTS
  ========================================== */

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const data = await getProductsDB();

      setProducts(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Error loading products:",
        err
      );

      setError(
        t(
          "No se pudo cargar el catálogo.",
          "Could not load the catalog."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  /* ==========================================
     FILTER PRODUCTS
  ========================================== */

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatches =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const searchMatches =
        !term ||
        String(product.name || "")
          .toLowerCase()
          .includes(term) ||
        String(product.category || "")
          .toLowerCase()
          .includes(term);

      return categoryMatches && searchMatches;
    });
  }, [
    products,
    selectedCategory,
    search,
  ]);

  const categoryCount = new Set(
    products
      .map((product) => product.category)
      .filter(Boolean)
  ).size;

  /* ==========================================
     ADD NEW PRODUCT
  ========================================== */

  function addNewProduct() {
    localStorage.setItem(
      "productMode",
      "new"
    );

    localStorage.removeItem(
      "selectedProduct"
    );

    goTo("productDetail");
  }

  /* ==========================================
     EDIT PRODUCT
  ========================================== */

  function editProduct(product) {
    localStorage.setItem(
      "productMode",
      "edit"
    );

    localStorage.setItem(
      "selectedProduct",
      JSON.stringify(product)
    );

    goTo("productDetail");
  }

  /* ==========================================
     DELETE PRODUCT
  ========================================== */

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      t(
        `¿Eliminar "${product.name}" del catálogo?`,
        `Delete "${product.name}" from the catalog?`
      )
    );

    if (!confirmed) return;

    setBusyId(product.id);
    setError("");
    setNotice("");

    try {
      await deleteProductDB(product.id);

      await loadProducts();

      setNotice(
        t(
          "Producto eliminado.",
          "Product deleted."
        )
      );
    } catch (err) {
      console.error(
        "Error deleting product:",
        err
      );

      setError(
        t(
          "No se pudo eliminar el producto.",
          "Could not delete the product."
        )
      );
    } finally {
      setBusyId(null);
    }
  }

  /* ==========================================
     ADD PRODUCT TO POS
  ========================================== */

  function addToCart(product) {
    setError("");
    setNotice("");

    try {
      const stored = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const cart = Array.isArray(stored)
        ? stored
        : [];

      const index = cart.findIndex(
        (item) =>
          String(item.id) ===
          String(product.id)
      );

      if (index >= 0) {
        cart[index] = {
          ...cart[index],
          quantity:
            Math.max(
              1,
              Number(cart[index].quantity) || 1
            ) + 1,
        };
      } else {
        cart.push({
          ...product,
          quantity: 1,
        });
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(cart)
      );

      setNotice(
        t(
          `${product.name} agregado al carrito.`,
          `${product.name} added to cart.`
        )
      );
    } catch (err) {
      console.error(
        "Error adding to cart:",
        err
      );

      setError(
        t(
          "No se pudo actualizar el carrito.",
          "Could not update the cart."
        )
      );
    }
  }

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div className="cori-home cori-products-page">

      {/* SIDEBAR */}

      <Sidebar
        goTo={goTo}
        active="products"
      />

      <main className="ch-main products-main">

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <header className="products-page-heading">

          <div>
            <p className="products-label">
              CORI POS / COFFEE TECH STUDIO
            </p>

            <h1 className="products-title">
              {t("Productos", "Products")}
            </h1>

            <p className="products-description">
              {t(
                "Organiza el menú de tu cafetería, precios e inventario.",
                "Manage your café menu, prices and inventory."
              )}
            </p>
          </div>

          <span className="products-header-tag">
            {t("CATÁLOGO", "CATALOG")}
          </span>

        </header>

        {/* =====================================
            MANAGEMENT HERO
        ===================================== */}

        <section className="products-header">

          <div className="products-header-copy">

            <span className="products-kicker">
              {t(
                "GESTIÓN DEL MENÚ",
                "MENU MANAGEMENT"
              )}
            </span>

            <h2>
              {t(
                "Cada producto cuenta.",
                "Every product matters."
              )}
            </h2>

            <p>
              {t(
                "Agrega cafés, bebidas, panadería y productos especiales para que tu equipo los encuentre rápidamente.",
                "Add coffee, drinks, bakery and seasonal products so your team can find them quickly."
              )}
            </p>

          </div>

          <button
            type="button"
            className="add-product-btn"
            onClick={addNewProduct}
          >
            <span aria-hidden="true">＋</span>

            {t(
              "Nuevo producto",
              "New product"
            )}
          </button>

        </section>

        {/* =====================================
            CORI ACADEMY — PRODUCTOS
        ===================================== */}

        <div className="cproducts-academy-section">

          <CoriAcademy
            title={t(
              "¡Hola! Soy Cori.",
              "Hi! I'm Cori."
            )}
            description={t(
              "Aprende a crear productos, agregar fotografías, establecer precios y organizar tu catálogo por categorías.",
              "Learn how to create products, add photos, set prices and organize your catalog by category."
            )}
            videoSrc={`${import.meta.env.BASE_URL}videos/cori_greeting_and_guiding_81111_Seedance_25.mp4`}
          />

        </div>

        {/* =====================================
            STATS
        ===================================== */}

        <section
          className="products-stats"
          aria-label={t(
            "Resumen del catálogo",
            "Catalog overview"
          )}
        >

          <article className="products-stat">

            <span>
              {t(
                "Productos registrados",
                "Total products"
              )}
            </span>

            <strong>
              {products.length}
            </strong>

            <small>
              {t(
                "En tu catálogo",
                "In your catalog"
              )}
            </small>

          </article>

          <article className="products-stat">

            <span>
              {t(
                "Categorías activas",
                "Active categories"
              )}
            </span>

            <strong>
              {categoryCount}
            </strong>

            <small>
              {t(
                "Con productos",
                "With products"
              )}
            </small>

          </article>

          <article className="products-stat">

            <span>
              {t(
                "Resultados visibles",
                "Visible results"
              )}
            </span>

            <strong>
              {filteredProducts.length}
            </strong>

            <small>
              {t(
                "Filtro actual",
                "Current filter"
              )}
            </small>

          </article>

        </section>

        {/* =====================================
            PRODUCT CATALOG
        ===================================== */}

        <section className="products-catalog">

          {/* CATALOG HEADING */}

          <div className="products-catalog-heading">

            <div>

              <p className="products-label">
                {t(
                  "TU CAFETERÍA",
                  "YOUR COFFEE SHOP"
                )}
              </p>

              <h2>
                {t(
                  "Catálogo de productos",
                  "Product catalog"
                )}
              </h2>

            </div>

            {/* SEARCH */}

            <div className="products-search-wrap">

              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m16 16 5 5" />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={t(
                  "Buscar producto...",
                  "Search products..."
                )}
                aria-label={t(
                  "Buscar productos",
                  "Search products"
                )}
              />

            </div>

          </div>

          {/* =====================================
              CATEGORY FILTER
          ===================================== */}

          <div
            className="category-filter"
            aria-label={t(
              "Filtrar por categoría",
              "Filter by category"
            )}
          >

            {CATEGORIES.map((category) => (

              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "category-btn active"
                    : "category-btn"
                }
                aria-pressed={
                  selectedCategory === category
                }
                onClick={() =>
                  setSelectedCategory(category)
                }
              >

                {es
                  ? CATEGORY_ES[category]
                  : category}

              </button>

            ))}

          </div>

          {/* =====================================
              FEEDBACK
          ===================================== */}

          {error && (

            <p
              className="products-feedback is-error"
              role="alert"
            >
              {error}
            </p>

          )}

          {notice && (

            <p
              className="products-feedback"
              role="status"
            >
              {notice}
            </p>

          )}

          {/* =====================================
              PRODUCTS LIST
          ===================================== */}

          {loading ? (

            <div className="empty-products">
              {t(
                "Cargando productos...",
                "Loading products..."
              )}
            </div>

          ) : filteredProducts.length === 0 ? (

            /* EMPTY STATE */

            <div className="empty-products">

              <span className="empty-products-icon">
                ☕
              </span>

              <h3>
                {products.length === 0
                  ? t(
                      "Tu catálogo está listo para comenzar",
                      "Your catalog is ready to begin"
                    )
                  : t(
                      "No encontramos productos",
                      "No products found"
                    )}
              </h3>

              <p>
                {products.length === 0
                  ? t(
                      "Agrega tu primer producto para empezar a vender.",
                      "Add your first product to start selling."
                    )
                  : t(
                      "Prueba otra búsqueda o categoría.",
                      "Try another search or category."
                    )}
              </p>

              {products.length === 0 && (

                <button
                  type="button"
                  className="add-product-btn"
                  onClick={addNewProduct}
                >
                  {t(
                    "Agregar producto",
                    "Add product"
                  )}
                </button>

              )}

            </div>

          ) : (

            /* =====================================
                PRODUCT GRID
            ===================================== */

            <div className="products-grid">

              {filteredProducts.map((product) => (

                <article
                  key={product.id}
                  className="product-card"
                >

                  {/* PRODUCT IMAGE */}

                  <div className="product-image-wrap">

                    <ProductImage
                      src={product.image}
                      name={product.name}
                    />

                    <span className="product-image-badge">

                      {es
                        ? CATEGORY_ES[
                            product.category
                          ] ||
                          product.category ||
                          "General"
                        : product.category ||
                          "General"}

                    </span>

                  </div>

                  {/* PRODUCT CONTENT */}

                  <div className="product-content">

                    <div className="product-top">

                      <h3>
                        {product.name}
                      </h3>

                      <span className="product-price">
                        {money(product.price)}
                      </span>

                    </div>

                    <p className="product-category">

                      {product.description ||
                        t(
                          "Disponible en tu menú",
                          "Available on your menu"
                        )}

                    </p>

                    {/* EDIT / DELETE */}

                    <div className="product-actions">

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() =>
                          editProduct(product)
                        }
                      >
                        {t("Editar", "Edit")}
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        disabled={
                          busyId === product.id
                        }
                        onClick={() =>
                          deleteProduct(product)
                        }
                      >
                        {busyId === product.id
                          ? "..."
                          : t(
                              "Eliminar",
                              "Delete"
                            )}
                      </button>

                    </div>

                    {/* ADD TO POS */}

                    <button
                      type="button"
                      className="add-cart-btn"
                      onClick={() =>
                        addToCart(product)
                      }
                    >

                      <span aria-hidden="true">
                        ＋
                      </span>

                      {t(
                        "Agregar al POS",
                        "Add to POS"
                      )}

                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}