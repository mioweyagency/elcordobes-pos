import {
  useState,
  useEffect
} from "react";

import "../styles/inventorymodal.css";

/* =========================================================
   INVENTORY MODAL
========================================================= */

export default function InventoryModal({

  isOpen,

  onClose,

  onSave,

  editingItem

}) {

  /* =========================================================
     STATES
  ========================================================= */

  const [name, setName] =
    useState("");

  const [stock, setStock] =
    useState("");

  const [minimumStock, setMinimumStock] =
    useState("");

  const [unit, setUnit] =
    useState("kg");

  const [supplier, setSupplier] =
    useState("");

  const [cost, setCost] =
    useState("");

  /* =========================================================
     LOAD EDIT DATA
  ========================================================= */

  useEffect(() => {

    if (editingItem) {

      setName(
        editingItem.name || ""
      );

      setStock(
        editingItem.stock || ""
      );

      setMinimumStock(
        editingItem.minimumStock || ""
      );

      setUnit(
        editingItem.unit || "kg"
      );

      setSupplier(
        editingItem.supplier || ""
      );

      setCost(
        editingItem.cost || ""
      );

    } else {

      setName("");
      setStock("");
      setMinimumStock("");
      setUnit("kg");
      setSupplier("");
      setCost("");
    }

  }, [editingItem]);

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave =
    () => {

    if (!name.trim())
      return;

    const inventoryItem = {

      id:

        editingItem?.id ||

        Date.now(),

      name,

      stock:
        Number(stock),

      minimumStock:
        Number(minimumStock),

      unit,

      supplier,

      cost:
        Number(cost)
    };

    onSave(
      inventoryItem
    );

    onClose();
  };

  /* =========================================================
     CLOSE
  ========================================================= */

  if (!isOpen)
    return null;

  return (

    <div className="inventory-modal-overlay">

      {/* =========================================================
         MODAL
      ========================================================= */}

      <div className="inventory-modal">

        {/* =========================================================
           HEADER
        ========================================================= */}

        <div className="inventory-modal-header">

          <div>

            <p>
              EL CORDOBÉS POS
            </p>

            <h2>

              {editingItem

                ? "Edit Inventory"

                : "Add Inventory"}

            </h2>

          </div>

          <button
            className="inventory-close-btn"

            onClick={onClose}
          >

            ✕

          </button>

        </div>

        {/* =========================================================
           FORM
        ========================================================= */}

        <div className="inventory-form">

          {/* NAME */}

          <input
            type="text"

            placeholder="Inventory Name"

            value={name}

            onChange={(e) =>
              setName(
                e.target.value
              )
            }
          />

          {/* STOCK */}

          <input
            type="number"

            placeholder="Current Stock"

            value={stock}

            onChange={(e) =>
              setStock(
                e.target.value
              )
            }
          />

          {/* MINIMUM */}

          <input
            type="number"

            placeholder="Minimum Stock"

            value={minimumStock}

            onChange={(e) =>
              setMinimumStock(
                e.target.value
              )
            }
          />

          {/* UNIT */}

          <select
            value={unit}

            onChange={(e) =>
              setUnit(
                e.target.value
              )
            }
          >

            <option value="kg">
              kg
            </option>

            <option value="L">
              L
            </option>

            <option value="pcs">
              pcs
            </option>

          </select>

          {/* SUPPLIER */}

          <input
            type="text"

            placeholder="Supplier"

            value={supplier}

            onChange={(e) =>
              setSupplier(
                e.target.value
              )
            }
          />

          {/* COST */}

          <input
            type="number"

            placeholder="Cost"

            value={cost}

            onChange={(e) =>
              setCost(
                e.target.value
              )
            }
          />

        </div>

        {/* =========================================================
           ACTIONS
        ========================================================= */}

        <div className="inventory-modal-actions">

          <button
            className="inventory-cancel-btn"

            onClick={onClose}
          >

            Cancel

          </button>

          <button
            className="inventory-save-btn"

            onClick={handleSave}
          >

            Save Inventory

          </button>

        </div>

      </div>

    </div>

  );
}