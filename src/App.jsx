
import { useState } from "react";

import "./styles/global.css";
import "./styles/app.css";

import Intro from "./pages/Intro";
import CreateStore from "./pages/CreateStore";

// CORI CLOUD — AUTHENTICATION
import SignIn from "./pages/SignIn";

import BranchSelect from "./pages/BranchSelect";
import EmployeeSelect from "./pages/EmployeeSelect";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import POS from "./pages/POS";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";

// CORI LOYALTY
import Clientes from "./pages/Clientes";

// CORI CASH CONTROL
import CashControl from "./pages/CashControl";

/* Load the shared theme last. */
import "./styles/coriTheme.css";

const pages = {
  intro: Intro,
  createStore: CreateStore,

  // CORI CLOUD — SIGN IN
  signIn: SignIn,

  branchSelect: BranchSelect,
  employeeSelect: EmployeeSelect,
  home: Home,
  profile: Profile,
  products: Products,
  productDetail: ProductDetail,
  pos: POS,
  sales: Sales,
  inventory: Inventory,

  // CORI LOYALTY
  clientes: Clientes,

  // CORI CASH CONTROL
  cashControl: CashControl,
};

export default function App() {
  const [screen, setScreen] = useState("intro");

  const Page = pages[screen] || Intro;

  return (
    <div className="cori-app">
      <Page goTo={setScreen} />
    </div>
  );
}
