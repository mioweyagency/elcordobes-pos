import { useState }
  from "react";

import "./styles/global.css";
import "./styles/app.css";

/* =========================================================
   PAGES
========================================================= */

import CreateStore
  from "./pages/CreateStore";

import BranchSelect
  from "./pages/BranchSelect";

import EmployeeSelect
  from "./pages/EmployeeSelect";

import Home
  from "./pages/Home";

import Profile
  from "./pages/Profile";

import Products
  from "./pages/Products";

import ProductDetail
  from "./pages/ProductDetail";

import POS
  from "./pages/POS";

import Sales
  from "./pages/Sales";

import Inventory
  from "./pages/Inventory";

/* =========================================================
   APP
========================================================= */

export default function App() {

  /* =========================================================
     START SCREEN
  ========================================================= */

  const [screen, setScreen] =
    useState("createStore");

  return (

    <>

      {/* =========================================================
         CREATE STORE
      ========================================================= */}

      {screen === "createStore" && (

        <CreateStore
          goTo={setScreen}
        />

      )}

      {/* =========================================================
         BRANCH SELECT
      ========================================================= */}

      {screen === "branchSelect" && (

        <BranchSelect
          goTo={setScreen}
        />

      )}

      {/* =========================================================
         EMPLOYEE SELECT
      ========================================================= */}

      {screen === "employeeSelect" && (

        <EmployeeSelect
          goTo={setScreen}
        />

      )}

      {/* =========================================================
         HOME
      ========================================================= */}

      {screen === "home" && (

        <Home
          goTo={setScreen}
        />

      )}

      {/* =========================================================
         PROFILE
      ========================================================= */}

      {screen === "profile" && (

        <Profile
          goTo={setScreen}
        />

      )}

      {/* =========================================================
         PRODUCTS
      ========================================================= */}

      {screen === "products" && (

        <Products
          goTo={setScreen}
        />

      )}

      {/* =========================================================
         PRODUCT DETAIL
      ========================================================= */}

      {screen === "productDetail" && (

        <ProductDetail
          goTo={setScreen}
        />

      )}

      {/* =========================================================
         POS
      ========================================================= */}

      {screen === "pos" && (

        <POS
          goTo={setScreen}
        />

      )}

      {/* =========================================================
         SALES
      ========================================================= */}

      {screen === "sales" && (

        <Sales
          goTo={setScreen}
        />

      )}

      {/* =========================================================
         INVENTORY
      ========================================================= */}

      {screen === "inventory" && (

        <Inventory
          goTo={setScreen}
        />

      )}

    </>

  );
}