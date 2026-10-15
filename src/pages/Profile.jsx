
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/home.css";
import "../styles/profile.css";

function readSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("storeSettings") || "{}"
    );

    return saved && typeof saved === "object"
      ? saved
      : {};
  } catch {
    return {};
  }
}

function ProfileIcon({ name, size = 21 }) {
  const icons = {
    shop: (
      <>
        <path d="M3 10h18l-2-6H5l-2 6Z" />
        <path d="M5 10v10h14V10M9 20v-7h6v7" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    team: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20v-2a7 7 0 0 1 14 0v2" />
        <path d="M17 5a3 3 0 0 1 0 6M19 14a6 6 0 0 1 3 5" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V3M7 8l5-5 5 5" />
        <path d="M4 14v6h16v-6" />
      </>
    ),
    save: (
      <>
        <path d="M5 3h12l4 4v14H3V3h2Z" />
        <path d="M7 3v6h10V3M7 21v-8h10v8" />
      </>
    ),
    check: <path d="m4 12 5 5L20 6" />,
    edit: (
      <>
        <path d="m15 5 4 4M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

export default function Profile({ goTo }) {
  const { i18n } = useTranslation();

  const es = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "es"
  ).startsWith("es");

  const t = (spanish, english) =>
    es ? spanish : english;

  const [shopName, setShopName] = useState(
    () => readSettings().shopName || ""
  );

  const [branchName, setBranchName] = useState(
    () =>
      localStorage.getItem("activeBranch") ||
      readSettings().branchName ||
      ""
  );

  const [logo, setLogo] = useState(
    () => readSettings().logo || ""
  );

  const [ownerName, setOwnerName] = useState(
    () => readSettings().ownerName || ""
  );

  const [teamSize, setTeamSize] = useState(
    () => readSettings().teamSize ?? ""
  );

  const [shopAddress, setShopAddress] = useState(
    () => readSettings().shopAddress || ""
  );

  const [status, setStatus] = useState("");
  const [processingLogo, setProcessingLogo] = useState(false);

  const displayName = useMemo(
    () =>
      shopName.trim() ||
      t("Mi cafetería", "My coffee shop"),
    [shopName, es]
  );

  async function handleLogoUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus(
        t(
          "Selecciona una imagen válida.",
          "Select a valid image."
        )
      );
      return;
    }

    setProcessingLogo(true);
    setStatus("");

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const image = await new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
      });

      const maxSize = 700;
      const scale = Math.min(
        1,
        maxSize / Math.max(image.width, image.height)
      );

      const canvas = document.createElement("canvas");

      canvas.width = Math.max(
        1,
        Math.round(image.width * scale)
      );

      canvas.height = Math.max(
        1,
        Math.round(image.height * scale)
      );

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Canvas unavailable");
      }

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // PNG conserva transparencias del logo.
      const compressed = canvas.toDataURL("image/png");

      setLogo(compressed);

      setStatus(
        t(
          "Logo preparado. Guarda los cambios para aplicarlo.",
          "Logo ready. Save changes to apply it."
        )
      );
    } catch (error) {
      console.error("Logo upload error:", error);

      setStatus(
        t(
          "No se pudo procesar el logo.",
          "Could not process the logo."
        )
      );
    } finally {
      setProcessingLogo(false);
      event.target.value = "";
    }
  }

  function removeLogo() {
    setLogo("");

    setStatus(
      t(
        "Logo eliminado del formulario. Guarda para confirmar.",
        "Logo removed from the form. Save to confirm."
      )
    );
  }

  function saveSettings(event) {
    event.preventDefault();

    if (!shopName.trim()) {
      setStatus(
        t(
          "Escribe el nombre de tu cafetería.",
          "Enter your coffee shop name."
        )
      );
      return;
    }

    if (!branchName.trim()) {
      setStatus(
        t(
          "Escribe el nombre de la sucursal.",
          "Enter the branch name."
        )
      );
      return;
    }

    const settings = {
      ...readSettings(),
      shopName: shopName.trim(),
      branchName: branchName.trim(),
      logo,
      ownerName: ownerName.trim(),
      teamSize: String(teamSize).trim(),
      shopAddress: shopAddress.trim(),
    };

    try {
      localStorage.setItem(
        "storeSettings",
        JSON.stringify(settings)
      );

      localStorage.setItem(
        "activeBranch",
        branchName.trim()
      );

      setStatus(
        t(
          "Configuración guardada correctamente.",
          "Settings saved successfully."
        )
      );

      // Conservamos el comportamiento original.
      goTo("home");
    } catch (error) {
      console.error("Profile save error:", error);

      setStatus(
        t(
          "No se pudieron guardar los cambios. Revisa el espacio disponible.",
          "Could not save changes. Check available storage."
        )
      );
    }
  }

  return (
    <div className="cori-home cori-profile-page">
      <Sidebar goTo={goTo} active="profile" />

      <main className="ch-main cori-profile-main">
        <Topbar
          title={t("Perfil", "Profile")}
          subtitle="CORI POS / SHOP SETTINGS"
        />

        <div className="profile-page-content">
          <header className="profile-page-header">
            <div>
              <p className="profile-eyebrow">
                CORI POS / YOUR COFFEE BUSINESS
              </p>

              <h1>
                {t(
                  "Tu cafetería, tu identidad.",
                  "Your coffee shop, your identity."
                )}
              </h1>

              <p>
                {t(
                  "Personaliza los detalles que hacen única a tu cafetería.",
                  "Customize the details that make your coffee shop unique."
                )}
              </p>
            </div>

            <span className="profile-header-mark">
              ✦ CORI POS
            </span>
          </header>

          <section className="profile-hero">
            <div className="profile-hero-logo">
              {logo ? (
                <img src={logo} alt={displayName} />
              ) : (
                <span aria-hidden="true">✦</span>
              )}
            </div>

            <div className="profile-hero-copy">
              <p className="profile-eyebrow">
                {t("MI CAFETERÍA", "MY COFFEE SHOP")}
              </p>

              <h2>{displayName}</h2>

              <p>
                {branchName ||
                  t(
                    "Configura tu sucursal",
                    "Set up your branch"
                  )}
              </p>

              <span className="profile-hero-status">
                <span className="profile-status-dot" />
                {t(
                  "Identidad de marca",
                  "Brand identity"
                )}
              </span>
            </div>

            <div className="profile-hero-decoration" aria-hidden="true">
              ✦
            </div>
          </section>

          <form
            className="profile-settings-layout"
            onSubmit={saveSettings}
          >
            <div className="profile-settings-main">
              <section className="profile-panel">
                <div className="profile-panel-heading">
                  <div className="profile-panel-icon">
                    <ProfileIcon name="shop" />
                  </div>

                  <div>
                    <p className="profile-eyebrow">
                      {t(
                        "CONFIGURACIÓN GENERAL",
                        "GENERAL SETTINGS"
                      )}
                    </p>

                    <h2>
                      {t(
                        "Información de tu negocio",
                        "Business information"
                      )}
                    </h2>
                  </div>
                </div>

                <div className="profile-form">
                  <label className="profile-field">
                    <span>
                      {t(
                        "Nombre de la cafetería",
                        "Coffee shop name"
                      )}
                    </span>

                    <input
                      required
                      type="text"
                      className="profile-input"
                      placeholder="El Cordobés Coffee"
                      value={shopName}
                      onChange={(event) =>
                        setShopName(event.target.value)
                      }
                    />
                  </label>

                  <label className="profile-field">
                    <span>
                      {t(
                        "Sucursal activa",
                        "Active branch"
                      )}
                    </span>

                    <input
                      required
                      type="text"
                      className="profile-input"
                      placeholder={t(
                        "Ej. Centro Histórico",
                        "E.g. Historic Center"
                      )}
                      value={branchName}
                      onChange={(event) =>
                        setBranchName(event.target.value)
                      }
                    />
                  </label>

                  <label className="profile-field">
                    <span>
                      <ProfileIcon name="user" size={15} />
                      {t(
                        "Propietario / Gerente",
                        "Owner / Manager"
                      )}
                    </span>

                    <input
                      type="text"
                      className="profile-input"
                      placeholder={t(
                        "Nombre del responsable",
                        "Manager name"
                      )}
                      value={ownerName}
                      onChange={(event) =>
                        setOwnerName(event.target.value)
                      }
                    />
                  </label>

                  <label className="profile-field">
                    <span>
                      <ProfileIcon name="team" size={15} />
                      {t(
                        "Número de empleados",
                        "Team size"
                      )}
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      className="profile-input"
                      placeholder="6"
                      value={teamSize}
                      onChange={(event) =>
                        setTeamSize(event.target.value)
                      }
                    />
                  </label>

                  <label className="profile-field full-width">
                    <span>
                      <ProfileIcon name="location" size={15} />
                      {t(
                        "Dirección de la cafetería",
                        "Coffee shop address"
                      )}
                    </span>

                    <input
                      type="text"
                      className="profile-input"
                      placeholder={t(
                        "Calle, número, colonia y ciudad",
                        "Street, number, neighborhood and city"
                      )}
                      value={shopAddress}
                      onChange={(event) =>
                        setShopAddress(event.target.value)
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="profile-panel">
                <div className="profile-panel-heading">
                  <div className="profile-panel-icon">
                    <ProfileIcon name="edit" />
                  </div>

                  <div>
                    <p className="profile-eyebrow">
                      {t(
                        "IDENTIDAD VISUAL",
                        "VISUAL IDENTITY"
                      )}
                    </p>

                    <h2>
                      {t(
                        "Logo de tu cafetería",
                        "Coffee shop logo"
                      )}
                    </h2>
                  </div>
                </div>

                <div className="profile-logo-section">
                  <div className="profile-logo-preview">
                    {logo ? (
                      <img
                        src={logo}
                        alt={t(
                          "Vista previa del logo",
                          "Logo preview"
                        )}
                      />
                    ) : (
                      <div className="profile-logo-placeholder">
                        ✦
                      </div>
                    )}
                  </div>

                  <div className="profile-logo-details">
                    <h3>
                      {t(
                        "Haz que tu marca destaque.",
                        "Make your brand stand out."
                      )}
                    </h3>

                    <p>
                      {t(
                        "Tu logo se utilizará en los espacios del POS que muestran la identidad de tu negocio.",
                        "Your logo will be used wherever your business identity appears in the POS."
                      )}
                    </p>

                    <div className="profile-logo-actions">
                      <label className="upload-image-btn">
                        <ProfileIcon name="upload" size={17} />

                        {processingLogo
                          ? t(
                              "Procesando...",
                              "Processing..."
                            )
                          : t(
                              "Subir logo",
                              "Upload logo"
                            )}

                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          disabled={processingLogo}
                          onChange={handleLogoUpload}
                        />
                      </label>

                      {logo && (
                        <button
                          type="button"
                          className="remove-logo-btn"
                          onClick={removeLogo}
                        >
                          {t(
                            "Eliminar logo",
                            "Remove logo"
                          )}
                        </button>
                      )}
                    </div>

                    <small>
                      {t(
                        "Recomendado: imagen cuadrada con fondo transparente.",
                        "Recommended: square image with transparent background."
                      )}
                    </small>
                  </div>
                </div>
              </section>
            </div>

            <aside className="profile-settings-side">
              <section className="profile-summary-card">
                <p className="profile-eyebrow">
                  {t(
                    "VISTA GENERAL",
                    "BUSINESS OVERVIEW"
                  )}
                </p>

                <h2>
                  {t(
                    "Tu espacio de trabajo",
                    "Your workspace"
                  )}
                </h2>

                <div className="profile-summary-list">
                  <div>
                    <span>
                      {t("Cafetería", "Coffee shop")}
                    </span>
                    <strong>{displayName}</strong>
                  </div>

                  <div>
                    <span>
                      {t("Sucursal", "Branch")}
                    </span>
                    <strong>
                      {branchName || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {t("Responsable", "Manager")}
                    </span>
                    <strong>
                      {ownerName || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      {t("Equipo", "Team")}
                    </span>
                    <strong>
                      {teamSize === ""
                        ? "—"
                        : `${teamSize} ${t(
                            "empleados",
                            "employees"
                          )}`}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="profile-tip-card">
                <div className="profile-tip-symbol">✦</div>

                <p className="profile-eyebrow">
                  CORI INSIGHTS
                </p>

                <h3>
                  {t(
                    "Una marca consistente crea confianza.",
                    "A consistent brand builds trust."
                  )}
                </h3>

                <p>
                  {t(
                    "Mantén actualizados tu logo, sucursal y datos comerciales para que tu equipo reconozca fácilmente el negocio.",
                    "Keep your logo, branch and business information updated so your team can easily identify the business."
                  )}
                </p>
              </section>

              <div className="profile-save-panel">
                <p>
                  {t(
                    "Los cambios se guardan en este dispositivo.",
                    "Changes are saved on this device."
                  )}
                </p>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={processingLogo}
                >
                  <ProfileIcon name="save" size={18} />

                  {t(
                    "Guardar configuración",
                    "Save settings"
                  )}
                </button>

                {status && (
                  <p
                    className="profile-status-message"
                    role="status"
                  >
                    {status}
                  </p>
                )}
              </div>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
}
