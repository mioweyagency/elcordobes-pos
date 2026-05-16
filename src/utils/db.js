/* =========================================================
   DATABASE
========================================================= */

const DB_NAME =
  "elcordobesPOS";

/* =========================================================
   IMPORTANT
========================================================= */

/*
  VERSION MUST INCREASE
  WHEN ADDING NEW STORES
*/

const DB_VERSION = 2;

/* =========================================================
   STORE NAMES
========================================================= */

const PRODUCTS_STORE =
  "products";

const INVENTORY_STORE =
  "inventory";

/* =========================================================
   OPEN DATABASE
========================================================= */

export const openDB = () => {

  return new Promise((resolve, reject) => {

    const request = indexedDB.open(

      DB_NAME,

      DB_VERSION
    );

    /* =========================================================
       CREATE STORES
    ========================================================= */

    request.onupgradeneeded = () => {

      const db =
        request.result;

      /* =========================================================
         PRODUCTS STORE
      ========================================================= */

      if (

        !db.objectStoreNames.contains(
          PRODUCTS_STORE
        )

      ) {

        db.createObjectStore(

          PRODUCTS_STORE,

          {
            keyPath: "id"
          }

        );
      }

      /* =========================================================
         INVENTORY STORE
      ========================================================= */

      if (

        !db.objectStoreNames.contains(
          INVENTORY_STORE
        )

      ) {

        db.createObjectStore(

          INVENTORY_STORE,

          {
            keyPath: "id"
          }

        );
      }

    };

    /* =========================================================
       SUCCESS
    ========================================================= */

    request.onsuccess = () => {

      resolve(
        request.result
      );

    };

    /* =========================================================
       ERROR
    ========================================================= */

    request.onerror = () => {

      reject(
        request.error
      );

    };

  });

};

/* =========================================================
   SAVE PRODUCT
========================================================= */

export const saveProductDB =
  async (product) => {

  const db =
    await openDB();

  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(

          PRODUCTS_STORE,

          "readwrite"
        );

      const store =
        transaction.objectStore(

          PRODUCTS_STORE
        );

      const request =
        store.put(product);

      request.onsuccess = () => {

        resolve(true);

      };

      request.onerror = () => {

        reject(
          request.error
        );

      };

    });

};

/* =========================================================
   GET PRODUCTS
========================================================= */

export const getProductsDB =
  async () => {

  const db =
    await openDB();

  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(

          PRODUCTS_STORE,

          "readonly"
        );

      const store =
        transaction.objectStore(

          PRODUCTS_STORE
        );

      const request =
        store.getAll();

      request.onsuccess = () => {

        resolve(
          request.result
        );

      };

      request.onerror = () => {

        reject(
          request.error
        );

      };

    });

};

/* =========================================================
   DELETE PRODUCT
========================================================= */

export const deleteProductDB =
  async (id) => {

  const db =
    await openDB();

  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(

          PRODUCTS_STORE,

          "readwrite"
        );

      const store =
        transaction.objectStore(

          PRODUCTS_STORE
        );

      const request =
        store.delete(id);

      request.onsuccess = () => {

        resolve(true);

      };

      request.onerror = () => {

        reject(
          request.error
        );

      };

    });

};

/* =========================================================
   SAVE INVENTORY
========================================================= */

export const saveInventoryDB =
  async (inventoryItem) => {

  const db =
    await openDB();

  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(

          INVENTORY_STORE,

          "readwrite"
        );

      const store =
        transaction.objectStore(

          INVENTORY_STORE
        );

      const request =
        store.put(
          inventoryItem
        );

      request.onsuccess = () => {

        resolve(true);

      };

      request.onerror = () => {

        reject(
          request.error
        );

      };

    });

};

/* =========================================================
   GET INVENTORY
========================================================= */

export const getInventoryDB =
  async () => {

  const db =
    await openDB();

  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(

          INVENTORY_STORE,

          "readonly"
        );

      const store =
        transaction.objectStore(

          INVENTORY_STORE
        );

      const request =
        store.getAll();

      request.onsuccess = () => {

        resolve(
          request.result
        );

      };

      request.onerror = () => {

        reject(
          request.error
        );

      };

    });

};

/* =========================================================
   DELETE INVENTORY
========================================================= */

export const deleteInventoryDB =
  async (id) => {

  const db =
    await openDB();

  return new Promise(
    (resolve, reject) => {

      const transaction =
        db.transaction(

          INVENTORY_STORE,

          "readwrite"
        );

      const store =
        transaction.objectStore(

          INVENTORY_STORE
        );

      const request =
        store.delete(id);

      request.onsuccess = () => {

        resolve(true);

      };

      request.onerror = () => {

        reject(
          request.error
        );

      };

    });

};