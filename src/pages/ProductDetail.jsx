import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/productDetail.css";

import defaultImage from "../assets/hero.png";

import {
  saveProductDB
} from "../utils/db";

export default function ProductDetail({ goTo }) {

  /* MODE */

  const mode =
    localStorage.getItem(
      "productMode"
    );

  /* SELECTED PRODUCT */

  const selectedProduct =
    JSON.parse(
      localStorage.getItem(
        "selectedProduct"
      )
    );

  /* STATES */

  const [image, setImage] =
    useState(

      mode === "edit" &&
      selectedProduct

        ? selectedProduct.image

        : defaultImage

    );

  const [productName,
    setProductName] =
    useState(

      mode === "edit" &&
      selectedProduct

        ? selectedProduct.name

        : ""

    );

  const [category,
    setCategory] =
    useState(

      mode === "edit" &&
      selectedProduct

        ? selectedProduct.category

        : ""

    );

  const [price,
    setPrice] =
    useState(

      mode === "edit" &&
      selectedProduct

        ? selectedProduct.price

        : ""

    );

  const [inventory,
    setInventory] =
    useState(

      mode === "edit" &&
      selectedProduct

        ? selectedProduct.inventory

        : ""

    );

  const [description,
    setDescription] =
    useState(

      mode === "edit" &&
      selectedProduct

        ? selectedProduct.description

        : ""

    );

  /* SAVE PRODUCT */

  const saveProduct = async () => {

    const newProduct = {

      id:

        mode === "edit" &&
        selectedProduct

          ? selectedProduct.id

          : Date.now(),

      image,

      name: productName,

      category,

      price,

      inventory,

      description
    };

    await saveProductDB(
      newProduct
    );

    alert(

      mode === "new"

        ? "Product Created"

        : "Product Updated"

    );

    goTo("products");
  };

  return (

    <div className="dashboard-layout">

      <Sidebar
        goTo={goTo}
        active="products"
      />

      <main className="dashboard-main">

        <Topbar
          title="Product Detail"

          subtitle={
            mode === "new"

              ? "ADD PRODUCT"

              : "EDIT PRODUCT"
          }
        />

        <section className="product-detail-container">

          {/* LEFT SIDE */}

          <div className="product-detail-left">

            <img
              src={image}
              alt="Product"
              className="detail-image"
            />

            {/* UPLOAD IMAGE */}

            <label className="upload-image-btn">

              Upload Image

              <input
                type="file"

                accept="image/*"

                hidden

                onChange={(e) => {

                  const file =
                    e.target.files[0];

                  if (!file) return;

                  const reader =
                    new FileReader();

                  reader.onload =
                    (event) => {

                    const img =
                      new Image();

                    img.onload =
                      () => {

                      const canvas =
                        document.createElement(
                          "canvas"
                        );

                      const MAX_WIDTH =
                        500;

                      const scaleSize =
                        MAX_WIDTH /
                        img.width;

                      canvas.width =
                        MAX_WIDTH;

                      canvas.height =
                        img.height *
                        scaleSize;

                      const ctx =
                        canvas.getContext(
                          "2d"
                        );

                      ctx.drawImage(

                        img,

                        0,
                        0,

                        canvas.width,
                        canvas.height
                      );

                      const compressed =
                        canvas.toDataURL(

                          "image/jpeg",

                          0.6
                        );

                      setImage(
                        compressed
                      );

                    };

                    img.src =
                      event.target.result;

                  };

                  reader.readAsDataURL(
                    file
                  );

                }}
              />

            </label>

          </div>

          {/* RIGHT SIDE */}

          <div className="product-detail-right">

            {/* PRODUCT NAME */}

            <div className="detail-group">

              <label>
                Product Name
              </label>

              <input
                type="text"

                value={productName}

                onChange={(e) =>
                  setProductName(
                    e.target.value
                  )
                }

                placeholder="Latte"
              />

            </div>

            {/* CATEGORY */}

            <div className="detail-group">

              <label>
                Category
              </label>

              <select
                value={category}

                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Category
                </option>

                <option>
                  Coffee
                </option>

                <option>
                  Cold Drinks
                </option>

                <option>
                  Tea & Matcha
                </option>

                <option>
                  Bakery
                </option>

                <option>
                  Desserts
                </option>

                <option>
                  Food
                </option>

                <option>
                  Retail Beans
                </option>

              </select>

            </div>

            {/* PRICE */}

            <div className="detail-group">

              <label>
                Price
              </label>

              <input
                type="text"

                value={price}

                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }

                placeholder="$120"
              />

            </div>

            {/* INVENTORY */}

            <div className="detail-group">

              <label>
                Inventory
              </label>

              <input
                type="text"

                value={inventory}

                onChange={(e) =>
                  setInventory(
                    e.target.value
                  )
                }

                placeholder="40"
              />

            </div>

            {/* DESCRIPTION */}

            <div className="detail-group">

              <label>
                Description
              </label>

              <textarea
                value={description}

                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }

                placeholder="Smooth espresso with milk."
              />

            </div>

            {/* BUTTONS */}

            <div className="detail-buttons">

              <button
                className="back-btn"

                onClick={() =>
                  goTo("products")
                }
              >

                Back

              </button>

              <button
                className="save-btn"

                onClick={saveProduct}
              >

                {mode === "new"

                  ? "Create Product"

                  : "Save Changes"}

              </button>

            </div>

          </div>

        </section>

      </main>

    </div>

  );
}