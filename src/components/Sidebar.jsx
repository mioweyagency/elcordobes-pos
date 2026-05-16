import {
  useTranslation
} from "react-i18next";

import LanguageSwitcher
  from "./LanguageSwitcher";

/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar({

  goTo,

  active

}) {

  /* =========================================================
     TRANSLATION
  ========================================================= */

  const { t } =
    useTranslation();

  /* =========================================================
     NAVIGATION ITEMS
  ========================================================= */

  const items = [

    {
      id: "home",

      label:
        t("homeDashboard")
    },

    {
      id: "profile",

      label:
        t("profile")
    },

    {
      id: "pos",

      label:
        t("posRegister")
    },

    {
      id: "products",

      label:
        t("products")
    },

    {
      id: "inventory",

      label:
        t("inventory")
    },

    {
      id: "sales",

      label:
        t("sales")
    }

  ];

  /* =========================================================
     STORE SETTINGS
  ========================================================= */

  const storeSettings =
    JSON.parse(

      localStorage.getItem(
        "storeSettings"
      )

    ) || {};

  return (

    <aside className="sidebar">

      {/* =========================================================
         LOGO
      ========================================================= */}

      <div className="sidebar-logo">

        {storeSettings.logo ? (

          <img
            src={storeSettings.logo}

            alt="Logo"

            style={{
              width: "58px",
              height: "58px",
              objectFit: "cover",
              borderRadius: "18px"
            }}
          />

        ) : (

          <div className="logo-mark">
            EC
          </div>

        )}

        <div>

          <h3>

            {storeSettings.shopName ||

              "El Cordobés"}

          </h3>

          <p>

            {t("posSystem")}

          </p>

          <span
            style={{
              color:"#666",
              fontSize:"11px"
            }}
          >

            {t("poweredBy")}

          </span>

        </div>

      </div>

      {/* =========================================================
         NAVIGATION
      ========================================================= */}

      <nav className="sidebar-nav">

        {items.map((item) => (

          <button
            key={item.id}

            onClick={() =>
              goTo(item.id)
            }

            className={

              active === item.id

                ? "nav-item active"

                : "nav-item"
            }
          >

            {item.label}

          </button>

        ))}

      </nav>

      {/* =========================================================
         LANGUAGE SWITCHER
      ========================================================= */}

      <div className="sidebar-language">

        <LanguageSwitcher />

      </div>

    </aside>

  );
}