
import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

import CoriBrand from "../components/CoriBrand";
import heroImage from "../assets/intro-bg.png";

import "../styles/branchselect.css";

export default function BranchSelect({ goTo }) {
  /* ============================================
     CORI CLOUD STATE
  ============================================ */

  const [branches, setBranches] = useState([]);
  const [newBranch, setNewBranch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");

  /* ============================================
     LOAD BRANCHES FROM SUPABASE
  ============================================ */

  useEffect(() => {
    let cancelled = false;

    const loadBranches = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        const userId = authData?.user?.id;

        if (!userId) {
          throw new Error(
            "Tu sesión no está activa. Inicia sesión nuevamente."
          );
        }

        // Find the business owned by this user.
        const { data: businesses, error: businessError } =
          await supabase
            .from("businesses")
            .select("id, name")
            .eq("owner_id", userId)
            .limit(1);

        if (businessError) throw businessError;

        const business = businesses?.[0];

        if (!business) {
          throw new Error(
            "No encontramos una cafetería asociada a tu cuenta."
          );
        }

        // Load only locations belonging to this business.
        const { data: locations, error: locationsError } =
          await supabase
            .from("locations")
            .select("id, business_id, name, is_active")
            .eq("business_id", business.id)
            .eq("is_active", true)
            .order("created_at", { ascending: true });

        if (locationsError) throw locationsError;

        if (cancelled) return;

        setBusinessName(business.name);
        setBranches(locations || []);

      } catch (loadError) {
        if (cancelled) return;

        console.error(
          "Cori Cloud BranchSelect:",
          loadError
        );

        setError(
          loadError?.message ||
            "No se pudieron cargar las sucursales."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBranches();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ============================================
     ADD BRANCH — PENDING CLOUD PERMISSIONS
  ============================================ */

  const addBranch = () => {
    setError(
      "La creación de sucursales adicionales estará disponible cuando configuremos los permisos y los límites de tu suscripción."
    );
  };

  /* ============================================
     SELECT BRANCH
  ============================================ */

  const selectBranch = (branch) => {
    if (!branch?.id || !branch.is_active) return;

    // Keep compatibility with existing POS screens.
    localStorage.setItem("activeBranch", branch.name);

    // New Cori Cloud identifiers.
    localStorage.setItem("activeBranchId", branch.id);
    localStorage.setItem(
      "activeBusinessId",
      branch.business_id
    );

    goTo?.("employeeSelect");
  };

  /* ============================================
     REMOVE BRANCH — PENDING CLOUD PERMISSIONS
  ============================================ */

  const removeBranch = () => {
    setError(
      "La eliminación de sucursales estará disponible cuando configuremos los permisos de administración."
    );
  };

  /* ============================================
     RENDER
  ============================================ */

  return (
    <div className="branch-page">
      <div
        className="branch-grid-background"
        aria-hidden="true"
      />

      {/* HEADER */}

      <header className="branch-header">
        <CoriBrand />

        <button
          type="button"
          className="branch-back-button"
          onClick={() => goTo?.("intro")}
        >
          <span aria-hidden="true">←</span>
          Volver al inicio
        </button>
      </header>

      {/* MAIN */}

      <main className="branch-main">

        {/* LEFT — COFFEE IMAGE */}

        <section className="branch-left">
          <div className="branch-image-container">
            <img
              src={heroImage}
              alt="Ambiente de cafetería"
              className="branch-bg"
            />

            <div className="branch-overlay" />

            <div className="branch-left-content">
              <div className="branch-eyebrow">
                <span className="branch-status-dot" />
                TU ESPACIO DE TRABAJO
              </div>

              <h1>
                Cada café
                <br />
                tiene su
                <br />
                <span>lugar.</span>
              </h1>

              <p className="branch-hero-description">
                Elige la sucursal donde comenzarás
                tu jornada. Cori se encarga de
                mantener todo conectado.
              </p>

              <div className="branch-hero-bottom">
                <span className="branch-hero-line" />
                <span>
                  BUEN CAFÉ. MEJORES HISTORIAS.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT — BRANCHES */}

        <section className="branch-right">
          <div className="branch-card">
            <div className="branch-card-header">
              <div className="branch-label">
                <span className="branch-label-dot" />
                CORI POS / SUCURSALES
              </div>

              <h2>
                Elige tu
                <br />
                <span>sucursal.</span>
              </h2>

              <p className="branch-subtitle">
                Selecciona dónde vas a trabajar
                o registra una nueva ubicación.
              </p>

              {businessName && (
                <p className="branch-subtitle">
                  Cafetería: {businessName}
                </p>
              )}
            </div>

            {/* ADD BRANCH */}

            <form
              className="branch-add-box"
              onSubmit={(event) => {
                event.preventDefault();
                addBranch();
              }}
            >
              <label
                htmlFor="branch-name"
                className="branch-input-label"
              >
                NUEVA SUCURSAL
              </label>

              <div className="branch-add-row">
                <input
                  id="branch-name"
                  type="text"
                  placeholder="Próximamente disponible"
                  value={newBranch}
                  onChange={(event) =>
                    setNewBranch(event.target.value)
                  }
                  className="branch-input"
                  disabled
                />

                <button
                  type="submit"
                  className="add-branch-btn"
                  disabled
                  title="Disponible próximamente"
                >
                  <span aria-hidden="true">＋</span>
                  Agregar
                </button>
              </div>
            </form>

            {/* ERROR */}

            {error && (
              <div
                className="cori-signin-message error"
                role="alert"
                style={{ marginBottom: 20 }}
              >
                {error}
              </div>
            )}

            {/* BRANCH LIST HEADER */}

            <div className="branch-list-header">
              <span>MIS SUCURSALES</span>

              <span className="branch-count">
                {branches.length}
              </span>
            </div>

            {/* LOADING */}

            {loading && (
              <div className="empty-branches">
                <strong>
                  Cargando tus sucursales...
                </strong>
                <p>
                  Conectando con Cori Cloud.
                </p>
              </div>
            )}

            {/* EMPTY STATE */}

            {!loading &&
              !error &&
              branches.length === 0 && (
                <div className="empty-branches">
                  <div className="branch-empty-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 10h18M5 10V6l2-3h10l2 3v4M5 10v11h14V10M9 21v-7h6v7" />
                    </svg>
                  </div>

                  <strong>
                    Todavía no hay sucursales activas.
                  </strong>

                  <p>
                    Tu cafetería no tiene ubicaciones
                    disponibles en Cori Cloud.
                  </p>
                </div>
              )}

            {/* BRANCHES */}

            <div className="branch-list">
              {branches.map((branch, index) => (
                <div
                  key={branch.id}
                  className="branch-item-wrapper"
                >
                  <button
                    type="button"
                    className="branch-item"
                    onClick={() => selectBranch(branch)}
                  >
                    <span className="branch-item-icon">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M3 10h18M5 10V6l2-3h10l2 3v4M5 10v11h14V10M9 21v-7h6v7" />
                      </svg>
                    </span>

                    <span className="branch-item-content">
                      <strong>{branch.name}</strong>

                      <small>
                        Sucursal{" "}
                        {String(index + 1).padStart(2, "0")}
                        {" · "}
                        Toca para continuar
                      </small>
                    </span>

                    <span
                      className="branch-item-arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </button>

                  <button
                    type="button"
                    className="remove-branch-btn"
                    onClick={removeBranch}
                    disabled
                    aria-label={`Eliminar sucursal ${branch.name}`}
                    title="Administración próximamente"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 7h16M10 3h4M6 7l1 14h10l1-14M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* CARD FOOTER */}

            <div className="branch-card-footer">
              <span className="branch-secure-dot" />
              Tus sucursales están conectadas
              con Cori Cloud.
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}

      <footer className="branch-bottom">
        <span>Buen café. Mejores historias.</span>
        <span>Cori POS · El Cordobés</span>
      </footer>
    </div>
  );
}
