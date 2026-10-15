
import { useTranslation } from "react-i18next";
import CoriBrand from "./CoriBrand";

function NavIcon({ name }) {
  const shapes = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v12h14V9M9 21v-8h6v8" />
      </>
    ),

    pos: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M7 12h10" />
      </>
    ),

    products: (
      <>
        <path d="M4 5h12v8a6 6 0 0 1-12 0V5Z" />
        <path d="M16 6h2a3 3 0 0 1 0 6h-2M3 21h15" />
      </>
    ),

    inventory: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M4 10h16M10 4v16" />
      </>
    ),

    sales: (
      <>
        <path d="M5 21V12M12 21V4M19 21V9" />
      </>
    ),

    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[name] || shapes.home}
    </svg>
  );
}

export default function Sidebar({ goTo, active }) {
  const { i18n } = useTranslation();

  const es = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "es"
  ).startsWith("es");

  const text = (spanish, english) =>
    es ? spanish : english;

  const items = [
    {
      id: "home",
      label: text("Inicio", "Home"),
    },
    {
      id: "pos",
      label: text("Nueva venta", "New sale"),
    },
    {
      id: "products",
      label: text("Productos", "Products"),
    },
    {
      id: "inventory",
      label: text("Inventario", "Inventory"),
    },
    {
      id: "sales",
      label: text("Ventas", "Sales"),
    },
    {
      id: "profile",
      label: text("Perfil", "Profile"),
    },
  ];

  async function changeLanguage(language) {
    try {
      await i18n.changeLanguage(language);

      localStorage.setItem(
        "language",
        language
      );
    } catch (error) {
      console.error(
        "Error changing language:",
        error
      );
    }
  }

  return (
    <aside className="ch-sidebar cori-shared-sidebar">

      {/* OFFICIAL LOGO */}

      <div className="ch-brand">
        <CoriBrand />
      </div>

      {/* NAVIGATION */}

      <nav
        aria-label={text(
          "Navegación principal",
          "Main navigation"
        )}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              active === item.id
                ? "is-active"
                : ""
            }
            aria-current={
              active === item.id
                ? "page"
                : undefined
            }
            onClick={() => goTo(item.id)}
          >
            <span className="cori-nav-icon">
              <NavIcon name={item.id} />
            </span>

            <span className="ch-nav-label">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* BOTTOM */}

      <div className="ch-sidebar-bottom">

        {/* EMPLOYEE */}

        <button
          type="button"
          className="ch-team-link"
          onClick={() => goTo("employeeSelect")}
        >
          <span>
            {text(
              "Seleccionar empleado",
              "Select employee"
            )}
          </span>

          <span aria-hidden="true">→</span>
        </button>

        {/* LANGUAGE */}

        <div
          className="ch-language"
          role="group"
          aria-label={text("Idioma", "Language")}
        >
          <button
            type="button"
            aria-pressed={es}
            onClick={() => changeLanguage("es")}
          >
            Español
          </button>

          <button
            type="button"
            aria-pressed={!es}
            onClick={() => changeLanguage("en")}
          >
            English
          </button>
        </div>

        {/* FOOTER */}

        <p className="ch-sidebar-note">
          BUEN CAFÉ
          <br />
          MEJORES HISTORIAS
        </p>
      </div>
    </aside>
  );
}
