
import { useState } from "react";

import CoriBrand from "../components/CoriBrand";
import heroImage from "../assets/intro-bg.png";

import "../styles/branchselect.css";

export default function BranchSelect({ goTo }) {
  /* ============================================
     BRANCH STATE
  ============================================ */

  const [branches, setBranches] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("branches") || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [newBranch, setNewBranch] = useState("");

  /* ============================================
     ADD BRANCH
  ============================================ */

  const addBranch = () => {
    const branchName = newBranch.trim();

    if (!branchName) return;

    const alreadyExists = branches.some(
      (branch) =>
        branch.name.trim().toLowerCase() ===
        branchName.toLowerCase()
    );

    if (alreadyExists) {
      alert("Esta sucursal ya existe.");
      return;
    }

    const updatedBranches = [
      ...branches,
      {
        id: Date.now(),
        name: branchName,
      },
    ];

    setBranches(updatedBranches);

    localStorage.setItem(
      "branches",
      JSON.stringify(updatedBranches)
    );

    setNewBranch("");
  };

  /* ============================================
     SELECT BRANCH
  ============================================ */

  const selectBranch = (branch) => {
    localStorage.setItem("activeBranch", branch.name);
    goTo("employeeSelect");
  };

  /* ============================================
     REMOVE BRANCH
  ============================================ */

  const removeBranch = (branchId) => {
    const updatedBranches = branches.filter(
      (branch) => branch.id !== branchId
    );

    setBranches(updatedBranches);

    localStorage.setItem(
      "branches",
      JSON.stringify(updatedBranches)
    );
  };

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
          onClick={() => goTo("intro")}
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
                  placeholder="Nombre de la sucursal"
                  value={newBranch}
                  onChange={(event) =>
                    setNewBranch(event.target.value)
                  }
                  className="branch-input"
                />

                <button
                  type="submit"
                  className="add-branch-btn"
                >
                  <span aria-hidden="true">＋</span>
                  Agregar
                </button>
              </div>
            </form>

            {/* BRANCH LIST HEADER */}

            <div className="branch-list-header">
              <span>MIS SUCURSALES</span>

              <span className="branch-count">
                {branches.length}
              </span>
            </div>

            {/* EMPTY STATE */}

            {branches.length === 0 && (
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
                  Tu primera sucursal empieza aquí.
                </strong>

                <p>
                  Agrega una ubicación para comenzar
                  a trabajar con Cori POS.
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
                    onClick={() => removeBranch(branch.id)}
                    aria-label={`Eliminar sucursal ${branch.name}`}
                    title="Eliminar sucursal"
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
              Tus sucursales se guardan en este dispositivo.
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
