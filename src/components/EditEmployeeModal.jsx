import { useEffect, useState } from "react";

import "../styles/editEmployeeModal.css";

const DEFAULT_AVATARS = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
];

export default function EditEmployeeModal({
  employee,
  employees,
  setEmployees,
  onClose,
}) {
  /* ==========================================
     STATES
  ========================================== */

  const [name, setName] = useState(employee?.name || "");
  const [role, setRole] = useState(employee?.role || "");
  const [shift, setShift] = useState(employee?.shift || "");
  const [photo, setPhoto] = useState(employee?.photo || "");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /* ==========================================
     SYNC EMPLOYEE DATA
  ========================================== */

  useEffect(() => {
    if (!employee) return;

    setName(employee.name || "");
    setRole(employee.role || "");
    setShift(employee.shift || "");
    setPhoto(employee.photo || "");

    setError("");
    setSaving(false);
  }, [employee]);

  /* ==========================================
     CLOSE MODAL WITH ESCAPE
  ========================================== */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  /* ==========================================
     UPLOAD CUSTOM PHOTO
  ========================================== */

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Selecciona una imagen válida.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen debe pesar menos de 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");

        const maxSize = 320;

        const scale = Math.min(
          maxSize / image.width,
          maxSize / image.height,
          1
        );

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
          setError("No se pudo procesar la fotografía.");
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const compressedPhoto = canvas.toDataURL(
          "image/jpeg",
          0.75
        );

        setPhoto(compressedPhoto);
      };

      image.onerror = () => {
        setError("No se pudo abrir la imagen.");
      };

      image.src = reader.result;
    };

    reader.onerror = () => {
      setError("No se pudo leer la fotografía.");
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  /* ==========================================
     SAVE CHANGES
  ========================================== */

  const saveChanges = () => {
    if (!employee || employee.id == null) {
      setError("No se encontró el empleado.");
      return;
    }

    const cleanName = name.trim();
    const cleanRole = role.trim();
    const cleanShift = shift.trim();

    if (!cleanName) {
      setError("El nombre del empleado es obligatorio.");
      return;
    }

    if (!Array.isArray(employees)) {
      setError("No se pudo cargar la lista de empleados.");
      return;
    }

    const exists = employees.some(
      (item) => item.id === employee.id
    );

    if (!exists) {
      setError("Este empleado ya no existe en la lista.");
      return;
    }

    setSaving(true);
    setError("");

    const updatedEmployees = employees.map((item) => {
      if (item.id === employee.id) {
        return {
          ...item,
          name: cleanName,
          role: cleanRole,
          shift: cleanShift,
          photo,
        };
      }

      return item;
    });

    try {
      /* SAVE TO LOCAL STORAGE */

      localStorage.setItem(
        "employees",
        JSON.stringify(updatedEmployees)
      );

      /* UPDATE REACT STATE */

      setEmployees(updatedEmployees);

      /* CLOSE */

      onClose?.();
    } catch (saveError) {
      console.error(
        "Error saving employee:",
        saveError
      );

      setError(
        "No se pudieron guardar los cambios. Revisa el espacio de almacenamiento."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================
     PREVENT EMPTY MODAL
  ========================================== */

  if (!employee) {
    return null;
  }

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div
      className="edit-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-employee-title"
      >
        {/* HEADER */}

        <div className="edit-header">
          <div>
            <p>TEAM MANAGEMENT</p>

            <h2 id="edit-employee-title">
              Editar empleado
            </h2>

            <span className="edit-header-description">
              Actualiza los datos de tu equipo.
            </span>
          </div>

          <button
            type="button"
            className="close-modal-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* AVATAR PREVIEW */}

        <div className="edit-avatar-preview">
          {photo ? (
            <img
              src={photo}
              alt={`Foto de ${name || "empleado"}`}
            />
          ) : (
            <div className="edit-avatar-placeholder">
              {name?.charAt(0)?.toUpperCase() || "✦"}
            </div>
          )}

          <div className="edit-avatar-info">
            <strong>
              {name || "Empleado"}
            </strong>

            <span>
              {role || "Sin puesto asignado"}
            </span>
          </div>
        </div>

        {/* FORM */}

        <form
          className="edit-employee-form"
          onSubmit={(event) => {
            event.preventDefault();
            saveChanges();
          }}
        >
          <div className="edit-inputs">
            <label>
              Nombre del empleado

              <input
                type="text"
                placeholder="Ej. María García"
                value={name}
                maxLength={80}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                required
              />
            </label>

            <label>
              Puesto

              <input
                type="text"
                placeholder="Ej. Barista"
                value={role}
                maxLength={60}
                onChange={(event) => {
                  setRole(event.target.value);
                }}
              />
            </label>

            <label>
              Turno

              <input
                type="text"
                placeholder="Ej. Mañana"
                value={shift}
                maxLength={60}
                onChange={(event) => {
                  setShift(event.target.value);
                }}
              />
            </label>
          </div>

          {/* DEFAULT AVATARS */}

          <div className="edit-avatar-section">
            <div className="edit-section-heading">
              <span>AVATARES DISPONIBLES</span>
              <small>Selecciona una imagen</small>
            </div>

            <div className="edit-avatar-grid">
              {DEFAULT_AVATARS.map((avatar, index) => (
                <button
                  type="button"
                  key={avatar}
                  className={
                    photo === avatar
                      ? "edit-avatar-btn active"
                      : "edit-avatar-btn"
                  }
                  onClick={() => {
                    setPhoto(avatar);
                    setError("");
                  }}
                  aria-label={`Seleccionar avatar ${index + 1}`}
                  aria-pressed={photo === avatar}
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM PHOTO */}

          <label className="edit-upload-btn">
            <span>＋</span>

            Subir fotografía personalizada

            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </label>

          {/* ERROR */}

          {error && (
            <div
              className="edit-error-message"
              role="alert"
            >
              ⚠ {error}
            </div>
          )}

          {/* ACTIONS */}

          <div className="edit-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : "Guardar cambios →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}