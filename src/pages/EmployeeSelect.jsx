
import { useRef, useState } from "react";

import CoriBrand from "../components/CoriBrand";
import EditEmployeeModal from "../components/EditEmployeeModal";

import heroImage from "../assets/cordobespos.png";

import "../styles/employeeselect.css";

/* ============================================
   INITIALS FALLBACK
============================================ */

function Initials({ name = "" }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className="employee-initials">
      {initials || "✦"}
    </span>
  );
}

/* ============================================
   EMPLOYEE SELECT
============================================ */

export default function EmployeeSelect({ goTo }) {
  /* EMPLOYEES */

  const [employees, setEmployees] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("employees") || "[]"
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  /* SELECTION AND MODALS */

  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  /* NEW EMPLOYEE FORM */

  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [employeeShift, setEmployeeShift] = useState("");
  const [employeePhoto, setEmployeePhoto] = useState("");

  /* CAMERA AND PHOTO LIBRARY */

  const cameraInputRef = useRef(null);
  const libraryInputRef = useRef(null);

  /* ACTIVE BRANCH */

  const activeBranch =
    localStorage.getItem("activeBranch") || "Mi cafetería";

  /* SELECTED EMPLOYEE */

  const selectedEmployee =
    employees.find(
      (employee) => employee.id === selectedId
    ) || null;

  /* ============================================
     SAVE EMPLOYEES
  ============================================ */

  const saveEmployees = (updated) => {
    setEmployees(updated);

    localStorage.setItem(
      "employees",
      JSON.stringify(updated)
    );
  };

  /* ============================================
     RESET FORM
  ============================================ */

  const resetForm = () => {
    setEmployeeName("");
    setEmployeeRole("");
    setEmployeeShift("");
    setEmployeePhoto("");
  };

  const closeAdd = () => {
    setShowAdd(false);
    resetForm();
  };

  /* ============================================
     ADD EMPLOYEE
  ============================================ */

  const addEmployee = (event) => {
    event.preventDefault();

    if (!employeeName.trim() || !employeeRole.trim()) {
      return;
    }

    const newEmployee = {
      id: Date.now(),
      name: employeeName.trim(),
      role: employeeRole.trim(),
      shift: employeeShift.trim(),
      photo: employeePhoto,
    };

    saveEmployees([...employees, newEmployee]);

    setSelectedId(newEmployee.id);

    closeAdd();
  };

  /* ============================================
     DELETE EMPLOYEE
  ============================================ */

  const deleteEmployee = (employee) => {
    const confirmed = window.confirm(
      `¿Eliminar a ${employee.name}?`
    );

    if (!confirmed) return;

    const updated = employees.filter(
      (item) => item.id !== employee.id
    );

    saveEmployees(updated);

    if (selectedId === employee.id) {
      setSelectedId(null);
    }
  };

  /* ============================================
     PHOTO UPLOAD / IPAD CAMERA
  ============================================ */

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecciona una imagen válida.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");

        /* CENTER SQUARE CROP */

        const side = Math.min(
          image.width,
          image.height
        );

        const sx = (image.width - side) / 2;
        const sy = (image.height - side) / 2;

        canvas.width = 256;
        canvas.height = 256;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        ctx.drawImage(
          image,
          sx,
          sy,
          side,
          side,
          0,
          0,
          256,
          256
        );

        const compressedPhoto = canvas.toDataURL(
          "image/jpeg",
          0.7
        );

        setEmployeePhoto(compressedPhoto);
      };

      image.onerror = () => {
        alert("No se pudo procesar la fotografía.");
      };

      image.src = reader.result;
    };

    reader.onerror = () => {
      alert("No se pudo leer la fotografía.");
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  /* ============================================
     EMPLOYEE CHECK IN
  ============================================ */

  const checkInEmployee = () => {
    if (!selectedEmployee) return;

    const now = new Date();

    const activeEmployee = {
      ...selectedEmployee,
      checkIn: now.toLocaleTimeString(),
      checkInDate: now.toLocaleDateString(),
      active: true,
    };

    localStorage.setItem(
      "activeEmployee",
      JSON.stringify(activeEmployee)
    );

    let history = [];

    try {
      const saved = JSON.parse(
        localStorage.getItem("employeeHistory") || "[]"
      );

      history = Array.isArray(saved) ? saved : [];
    } catch {
      history = [];
    }

    history.push({
      ...activeEmployee,
      checkOut: null,
      hoursWorked: null,
    });

    localStorage.setItem(
      "employeeHistory",
      JSON.stringify(history)
    );

    goTo("home");
  };

  /* ============================================
     RENDER
  ============================================ */

  return (
    <div className="employee-page">
      {/* HEADER */}

      <header className="employee-header">
        <CoriBrand />

        <button
          type="button"
          className="employee-back-button"
          onClick={() => goTo("branchSelect")}
        >
          <span aria-hidden="true">←</span>
          Sucursales
        </button>
      </header>

      {/* MAIN */}

      <main className="employee-main">
        <section className="employee-layout">
          {/* LEFT — COFFEE IMAGE */}

          <div className="employee-visual">
            <img
              src={heroImage}
              alt="Cafetería El Cordobés"
              className="employee-bg"
            />

            <div className="employee-overlay" />

            <div className="employee-visual-copy">
              <p>TU EQUIPO, TU CAFETERÍA</p>

              <h2>
                Grandes cafés.
                <br />
                Grandes <span>personas.</span>
              </h2>

              <small>
                Buen café. Mejores historias.
              </small>
            </div>
          </div>

          {/* RIGHT — EMPLOYEE PANEL */}

          <section className="employee-panel">
            {/* PANEL HEADER */}

            <div className="employee-panel-header">
              <div>
                <p className="employee-label">
                  CORI POS / EQUIPO
                </p>

                <h1>
                  Elige tu <span>perfil.</span>
                </h1>

                <p className="employee-subtitle">
                  {activeBranch} · Selecciona tu perfil
                </p>
              </div>

              <button
                type="button"
                className="employee-new-btn"
                onClick={() => setShowAdd(true)}
              >
                + Nuevo
              </button>
            </div>

            {/* EMPLOYEE LIST */}

            <div className="employee-users">
              {employees.length === 0 ? (
                <div className="empty-employees">
                  <span aria-hidden="true">✦</span>

                  <strong>
                    Tu equipo comienza aquí.
                  </strong>

                  <p>
                    Registra a tu primer empleado.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowAdd(true)}
                  >
                    + Agregar empleado
                  </button>
                </div>
              ) : (
                employees.map((employee) => (
                  <article
                    key={employee.id}
                    className={
                      selectedId === employee.id
                        ? "employee-profile selected"
                        : "employee-profile"
                    }
                  >
                    {/* SELECT PROFILE */}

                    <button
                      type="button"
                      className="employee-profile-select"
                      onClick={() =>
                        setSelectedId(employee.id)
                      }
                      aria-pressed={
                        selectedId === employee.id
                      }
                    >
                      <div className="employee-profile-photo">
                        {employee.photo ? (
                          <img
                            src={employee.photo}
                            alt=""
                          />
                        ) : (
                          <Initials name={employee.name} />
                        )}
                      </div>

                      <div className="employee-profile-info">
                        <strong>
                          {employee.name}
                        </strong>

                        <span>
                          {employee.role}
                          {employee.shift
                            ? ` · ${employee.shift}`
                            : ""}
                        </span>
                      </div>

                      <span
                        className="employee-profile-check"
                        aria-hidden="true"
                      >
                        {selectedId === employee.id
                          ? "✓"
                          : "○"}
                      </span>
                    </button>

                    {/* EDIT / DELETE */}

                    <div className="employee-profile-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(employee.id);
                          setShowEditModal(true);
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="employee-delete"
                        onClick={() =>
                          deleteEmployee(employee)
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* CHECK IN */}

            <div className="employee-checkin">
              {selectedEmployee && (
                <p>
                  Listo para comenzar:{" "}
                  <strong>
                    {selectedEmployee.name}
                  </strong>
                </p>
              )}

              <button
                type="button"
                className="employee-button"
                disabled={!selectedEmployee}
                onClick={checkInEmployee}
              >
                Iniciar turno
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        </section>
      </main>

      {/* ADD EMPLOYEE MODAL */}

      {showAdd && (
        <div
          className="employee-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAdd();
            }
          }}
        >
          <section
            className="employee-add-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-add-title"
          >
            {/* MODAL HEADER */}

            <div className="employee-modal-header">
              <div>
                <p className="employee-label">
                  CORI POS / NUEVO PERFIL
                </p>

                <h2 id="employee-add-title">
                  Nuevo empleado
                </h2>
              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={closeAdd}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form
              className="employee-form"
              onSubmit={addEmployee}
            >
              <div className="employee-form-row">
                <label>
                  Nombre

                  <input
                    className="employee-input"
                    value={employeeName}
                    placeholder="Nombre completo"
                    onChange={(event) =>
                      setEmployeeName(event.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Puesto

                  <input
                    className="employee-input"
                    value={employeeRole}
                    placeholder="Barista"
                    onChange={(event) =>
                      setEmployeeRole(event.target.value)
                    }
                    required
                  />
                </label>
              </div>

              <label>
                Turno

                <input
                  className="employee-input"
                  value={employeeShift}
                  placeholder="Matutino / Vespertino"
                  onChange={(event) =>
                    setEmployeeShift(event.target.value)
                  }
                />
              </label>

              {/* PHOTO SECTION */}

              <div className="employee-photo-section">
                <span>
                  FOTOGRAFÍA DEL EMPLEADO
                </span>

                <div className="employee-photo-row">
                  <div className="employee-photo-preview">
                    {employeePhoto ? (
                      <img
                        src={employeePhoto}
                        alt="Vista previa"
                      />
                    ) : (
                      <Initials name={employeeName} />
                    )}
                  </div>

                  <div className="employee-photo-actions">
                    <button
                      type="button"
                      onClick={() =>
                        cameraInputRef.current?.click()
                      }
                    >
                      <span aria-hidden="true">
                        ◉
                      </span>
                      Tomar foto
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        libraryInputRef.current?.click()
                      }
                    >
                      <span aria-hidden="true">
                        ↑
                      </span>
                      Elegir foto
                    </button>
                  </div>
                </div>

                <small>
                  Puedes usar la cámara del iPad
                  o seleccionar una fotografía existente.
                </small>

                {/* CAMERA INPUT */}

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  hidden
                  onChange={handlePhoto}
                />

                {/* PHOTO LIBRARY INPUT */}

                <input
                  ref={libraryInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhoto}
                />
              </div>

              <button
                type="submit"
                className="add-employee-btn"
              >
                Guardar empleado →
              </button>
            </form>
          </section>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}

      {showEditModal && selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          employees={employees}
          setEmployees={(updated) => {
            const next =
              typeof updated === "function"
                ? updated(employees)
                : updated;

            saveEmployees(next);
          }}
          onClose={() =>
            setShowEditModal(false)
          }
        />
      )}
    </div>
  );
}
