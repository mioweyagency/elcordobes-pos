import {
  useState,
  useEffect
} from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/products.css";

import coffeeImg from "../assets/hero.png";

import {

  getProductsDB,

  deleteProductDB

} from "../utils/db";

export default function Products({ goTo }) {

  /* PRODUCTS */

  const [products, setProducts] =
    useState([]);

  /* CATEGORY */

  const [selectedCategory,
    setSelectedCategory] =
    useState("All");

  /* LOAD PRODUCTS */

  const loadProducts =
    async () => {

    const data =
      await getProductsDB();

    setProducts(data);
  };

  useEffect(() => {

    loadProducts();

  }, []);

  /* FILTER */

  const filteredProducts =

    selectedCategory === "All"

      ? products

      : products.filter(
          (product) =>

            product.category ===
            selectedCategory
        );

  /* DELETE PRODUCT */

  const deleteProduct =
    async (productId) => {

    await deleteProductDB(
      productId
    );

    loadProducts();
  };

  return (

    <div className="dashboard-layout">

      <Sidebar
        goTo={goTo}
        active="products"
      />

      <main className="dashboard-main">

        <Topbar
          title="Products"

          subtitle="MANAGE YOUR COFFEE MENU"
        />

        {/* HEADER */}

        <section className="products-header">

          <div>

            <p className="products-label">
              PRODUCT MANAGEMENT
            </p>

            <h1 className="products-title">
              Coffee Menu
            </h1>

            <p className="products-description">

              Upload and manage coffee,
              bakery, drinks and
              seasonal products.

            </p>

          </div>

          {/* ADD PRODUCT */}

          <button
            className="add-product-btn"

            onClick={() => {

              localStorage.setItem(

                "productMode",

                "new"
              );

              localStorage.removeItem(
                "selectedProduct"
              );

              goTo("productDetail");

            }}
          >

            + Add Product

          </button>

        </section>

        {/* FILTERS */}

        <section className="category-filter">

          {[
            "All",
            "Coffee",
            "Cold Drinks",
            "Tea & Matcha",
            "Bakery",
            "Desserts",
            "Food",
            "Retail Beans"
          ].map((category) => (

            <button
              key={category}

              className={

                selectedCategory ===
                category

                  ? "category-btn active"

                  : "category-btn"
              }

              onClick={() =>
                setSelectedCategory(
                  category
                )
              }
            >

              {category}

            </button>

          ))}

        </section>

        {/* PRODUCTS */}

        <section className="products-grid">

          {filteredProducts.length === 0 && (

            <div className="empty-products">

              No products yet

            </div>

          )}

          {filteredProducts.map(
            (product) => (

            <div
              key={product.id}
              className="product-card"
            >

              <img
                src={
                  product.image ||
                  coffeeImg
                }

                alt={product.name}

                className="product-image"
              />

              <div className="product-content">

                <div className="product-top">

                  <h2>
                    {product.name}
                  </h2>

                  <span className="product-price">

                    {product.price}

                  </span>

                </div>

                <p className="product-category">

                  {product.category}

                </p>

                {/* ACTIONS */}

                <div className="product-actions">

                  {/* EDIT */}

                  <button
                    className="edit-btn"

                    onClick={() => {

                      localStorage.setItem(

                        "productMode",

                        "edit"
                      );

                      localStorage.setItem(

                        "selectedProduct",

                        JSON.stringify(
                          product
                        )
                      );

                      goTo(
                        "productDetail"
                      );

                    }}
                  >

                    Edit

                  </button>

                  {/* DELETE */}

                  <button
                    className="delete-btn"

                    onClick={() =>
                      deleteProduct(
                        product.id
                      )
                    }
                  >

                    Delete

                  </button>

                </div>

                {/* POS */}

                <button
                  className="add-cart-btn"

                  onClick={() => {

                    const cart =

                      JSON.parse(
                        localStorage.getItem(
                          "cart"
                        )
                      ) || [];

                    cart.push(product);

                    localStorage.setItem(

                      "cart",

                      JSON.stringify(
                        cart
                      )

                    );

                    alert(
                      "Added To POS"
                    );

                  }}
                >

                  Add To Cart

                </button>

              </div>

            </div>

          ))}

        </section>

      </main>

    </div>

  );
}