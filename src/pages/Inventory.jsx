import {
  useState,
  useEffect
} from "react";

import {
  useTranslation
} from "react-i18next";

import Sidebar
  from "../components/Sidebar";

import Topbar
  from "../components/Topbar";

import InventoryModal
  from "../components/InventoryModal";

import {

  saveInventoryDB,
  getInventoryDB,
  deleteInventoryDB

} from "../utils/db";

import "../styles/inventory.css";

/* =========================================================
   INVENTORY PAGE
========================================================= */

export default function Inventory({

  goTo

}) {

  /* =========================================================
     TRANSLATION
  ========================================================= */

  const { t } =
    useTranslation();

  /* =========================================================
     INVENTORY STATE
  ========================================================= */

  const [inventory, setInventory] =
    useState([]);

  /* =========================================================
     MODAL
  ========================================================= */

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState(null);

  /* =========================================================
     LOAD INVENTORY
  ========================================================= */

  useEffect(() => {

    loadInventory();

  }, []);

  /* =========================================================
     LOAD INVENTORY FUNCTION
  ========================================================= */

  const loadInventory =
    async () => {

    const inventoryData =

      await getInventoryDB();

    /* =========================================================
       DEFAULT INVENTORY
    ========================================================= */

    if (
      inventoryData.length === 0
    ) {

      const defaultItems = [

        {
          id: Date.now(),

          name:
            "Veracruz Espresso",

          stock: 8,

          minimumStock: 5,

          unit: "kg",

          supplier:
            "El Cordobés",

          cost: 180
        },

        {
          id: Date.now() + 1,

          name:
            "Whole Milk",

          stock: 3,

          minimumStock: 5,

          unit: "L",

          supplier:
            "Local Dairy",

          cost: 28
        },

        {
          id: Date.now() + 2,

          name:
            "Coffee Cups",

          stock: 120,

          minimumStock: 50,

          unit: "pcs",

          supplier:
            "Cup Supplier",

          cost: 2
        }

      ];

      /* =========================================================
         SAVE DEFAULT ITEMS
      ========================================================= */

      for (const item of defaultItems) {

        await saveInventoryDB(
          item
        );
      }

      setInventory(
        defaultItems
      );

    } else {

      setInventory(
        inventoryData
      );
    }
  };

  /* =========================================================
     SAVE INVENTORY
  ========================================================= */

  const saveInventoryItem =
    async (inventoryItem) => {

    await saveInventoryDB(
      inventoryItem
    );

    loadInventory();
  };

  /* =========================================================
     DELETE INVENTORY
  ========================================================= */

  const deleteInventoryItem =
    async (id) => {

    await deleteInventoryDB(
      id
    );

    loadInventory();
  };

  return (

    <div className="dashboard-layout">

      {/* =========================================================
         SIDEBAR
      ========================================================= */}

      <Sidebar
        goTo={goTo}
        active="inventory"
      />

      {/* =========================================================
         MAIN
      ========================================================= */}

      <main className="dashboard-main">

        {/* =========================================================
           TOPBAR
        ========================================================= */}

        <Topbar
          title={t("inventory")}
          subtitle="STOCK MANAGEMENT"
        />

        {/* =========================================================
           INVENTORY PAGE
        ========================================================= */}

        <div className="inventory-page">

          {/* =========================================================
             HEADER
          ========================================================= */}

          <div className="inventory-header">

            <div>

              <p>
                EL CORDOBÉS POS
              </p>

              <h1>
                Inventory System
              </h1>

              <span>

                Manage coffee stock,
                milk, syrups and café
                supplies.

              </span>

            </div>

            {/* =========================================================
               ADD BUTTON
            ========================================================= */}

            <button
              className="inventory-add-btn"

              onClick={() => {

                setEditingItem(
                  null
                );

                setIsModalOpen(
                  true
                );
              }}
            >

              + Add Inventory

            </button>

          </div>

          {/* =========================================================
             INVENTORY GRID
          ========================================================= */}

          <div className="inventory-grid">

            {inventory.map((item) => {

              /* =========================================================
                 LOW STOCK
              ========================================================= */

              const lowStock =

                item.stock <=
                item.minimumStock;

              return (

                <div
                  key={item.id}

                  className={

                    lowStock

                      ? "inventory-card low-stock-card"

                      : "inventory-card"
                  }
                >

                  {/* =========================================================
                     STATUS
                  ========================================================= */}

                  <div
                    className={

                      lowStock

                        ? "inventory-status low"

                        : "inventory-status healthy"
                    }
                  >

                    {lowStock

                      ? "Low Stock"

                      : "Healthy"}

                  </div>

                  {/* =========================================================
                     NAME
                  ========================================================= */}

                  <h2>

                    {item.name}

                  </h2>

                  {/* =========================================================
                     STOCK
                  ========================================================= */}

                  <div className="inventory-stock">

                    <span>

                      Current Stock

                    </span>

                    <h1>

                      {item.stock}
                      {" "}
                      {item.unit}

                    </h1>

                  </div>

                  {/* =========================================================
                     INFO
                  ========================================================= */}

                  <div className="inventory-info">

                    <div>

                      <p>
                        Minimum
                      </p>

                      <h3>

                        {item.minimumStock}
                        {" "}
                        {item.unit}

                      </h3>

                    </div>

                    <div>

                      <p>
                        Cost
                      </p>

                      <h3>

                        ${item.cost}

                      </h3>

                    </div>

                  </div>

                  {/* =========================================================
                     SUPPLIER
                  ========================================================= */}

                  <div className="inventory-supplier">

                    <span>
                      Supplier
                    </span>

                    <h4>

                      {item.supplier}

                    </h4>

                  </div>

                  {/* =========================================================
                     ACTIONS
                  ========================================================= */}

                  <div className="inventory-actions">

                    {/* =========================================================
                       ORDER COFFEE
                    ========================================================= */}

                    {lowStock && (

                      <button

                        className="inventory-order-btn"

                        onClick={() => {

                          const message =

                            `Hello El Cordobés, we need more ${item.name}. Current stock: ${item.stock}${item.unit}. Please restock this branch.`;

                          window.open(

                            `https://wa.me/5215512345678?text=${encodeURIComponent(message)}`,

                            "_blank"
                          );
                        }}
                      >

                        Order Coffee

                      </button>

                    )}

                    {/* =========================================================
                       EDIT
                    ========================================================= */}

                    <button
                      className="inventory-edit-btn"

                      onClick={() => {

                        setEditingItem(
                          item
                        );

                        setIsModalOpen(
                          true
                        );
                      }}
                    >

                      Edit

                    </button>

                    {/* =========================================================
                       DELETE
                    ========================================================= */}

                    <button
                      className="inventory-delete-btn"

                      onClick={() =>

                        deleteInventoryItem(
                          item.id
                        )

                      }
                    >

                      Delete

                    </button>

                  </div>

                </div>

              );
            })}

          </div>

        </div>

        {/* =========================================================
           INVENTORY MODAL
        ========================================================= */}

        <InventoryModal

          isOpen={isModalOpen}

          onClose={() =>
            setIsModalOpen(false)
          }

          onSave={saveInventoryItem}

          editingItem={editingItem}

        />

      </main>

    </div>

  );
}