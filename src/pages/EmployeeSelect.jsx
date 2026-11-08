
import { useEffect, useRef, useState } from "react";

import { supabase } from "../lib/supabase";

import CoriBrand from "../components/CoriBrand";
import EditEmployeeModal from "../components/EditEmployeeModal";

import heroImage from "../assets/cordobespos.png";

import "../styles/employeeselect.css";

/* ============================================
   CORI CLOUD CONFIGURATION
============================================ */

const PHOTO_BUCKET = "employee-photos";
const SIGNED_URL_SECONDS = 60 * 60;

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
   PHOTO HELPERS
============================================ */

function isLocalAvatar(photo) {
  return typeof photo === "string" &&
    photo.startsWith("/avatars/");
}

function isStoragePhoto(photo) {
  return typeof photo === "string" &&
    photo.length > 0 &&
    !photo.startsWith("data:") &&
    !photo.startsWith("http") &&
    !photo.startsWith("/");
}

function base64ToBlob(dataUrl) {
  const [header, encoded] = dataUrl.split(",");

  if (!header || !encoded) {
    throw new Error("La fotografía no es válida.");
  }

  const mimeType =
    header.match(/data:(.*?);base64/)?.[1] ||
    "image/jpeg";

  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], {
    type: mimeType,
  });
}

async function resolveEmployeePhotos(employees) {
  return Promise.all(
    employees.map(async (employee) => {
      if (!employee.photo) {
        return {
          ...employee,
          photoUrl: "",
        };
      }

      if (isLocalAvatar(employee.photo)) {
        return {
          ...employee,
          photoUrl: employee.photo,
        };
      }

      if (!isStoragePhoto(employee.photo)) {
        return {
          ...employee,
          photoUrl: "",
        };
      }

      const { data, error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(
          employee.photo,
          SIGNED_URL_SECONDS
        );

      if (error) {
        console.warn(
          "Cori Cloud: fotografía no disponible",
          error
        );

        return {
          ...employee,
          photoUrl: "",
        };
      }

      return {
        ...employee,
        photoUrl: data?.signedUrl || "",
      };
    })
  );
}

/* ============================================
   EMPLOYEE SELECT
============================================ */

export default function EmployeeSelect({ goTo }) {
  /* ============================================
     CORI CLOUD STATE
  ============================================ */

  const [employees, setEmployees] = useState([]);
  const [businessId, setBusinessId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  /* ============================================
     SELECTION AND MODALS
  ============================================ */

  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEditModal, setShowEditModal] =
    useState(false);

  /* ============================================
     NEW EMPLOYEE FORM
  ============================================ */

  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [employeeShift, setEmployeeShift] = useState("");
  const [employeePhoto, setEmployeePhoto] = useState("");

  /* ============================================
     CAMERA AND PHOTO LIBRARY
  ============================================ */

  const cameraInputRef = useRef(null);
  const libraryInputRef = useRef(null);

  /* ============================================
     ACTIVE BRANCH
  ============================================ */

  const activeBranch =
    localStorage.getItem("activeBranch") ||
    "Mi cafetería";

  const activeBranchId =
    localStorage.getItem("activeBranchId");

  /* ============================================
     SELECTED EMPLOYEE
  ============================================ */

  const selectedEmployee =
    employees.find(
      (employee) => employee.id === selectedId
    ) || null;

  /* ============================================
     LOAD EMPLOYEES FROM CORI CLOUD
  ============================================ */

  useEffect(() => {
    let cancelled = false;

    const loadEmployees = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        const userId = authData?.user?.id;

        if (!userId) {
          throw new Error(
            "Tu sesión ha expirado. Inicia sesión nuevamente."
          );
        }

        const storedBusinessId =
          localStorage.getItem("activeBusinessId");

        if (!storedBusinessId) {
          throw new Error(
            "Selecciona primero una sucursal."
          );
        }

        // Validate the business against the
        // authenticated owner, not just localStorage.
        const { data: business, error: businessError } =
          await supabase
            .from("businesses")
            .select("id, name")
            .eq("id", storedBusinessId)
            .eq("owner_id", userId)
            .single();

        if (businessError || !business) {
          throw new Error(
            "No tienes acceso a esta cafetería."
          );
        }

        // Validate the selected branch as well.
        if (!activeBranchId) {
          throw new Error(
            "No hay una sucursal seleccionada."
          );
        }

        const { data: location, error: locationError } =
          await supabase
            .from("locations")
            .select("id, name")
            .eq("id", activeBranchId)
            .eq("business_id", business.id)
            .eq("is_active", true)
            .single();

        if (locationError || !location) {
          throw new Error(
            "La sucursal seleccionada no está disponible."
          );
        }

        const { data, error: employeesError } =
          await supabase
            .from("employees")
            .select(
              "id, business_id, name, role, shift, photo, is_active, created_at"
            )
            .eq("business_id", business.id)
            .eq("is_active", true)
            .order("created_at", {
              ascending: true,
            });

        if (employeesError) throw employeesError;

        const employeesWithPhotos =
          await resolveEmployeePhotos(data || []);

        if (cancelled) return;

        setBusinessId(business.id);
        setEmployees(employeesWithPhotos);

        console.log(
          "Cori Cloud: empleados cargados",
          employeesWithPhotos.length
        );
      } catch (loadError) {
        if (cancelled) return;

        console.error(
          "Cori Cloud: error cargando empleados",
          loadError
        );

        setBusinessId(null);
        setEmployees([]);

        setError(
          loadError?.message ||
          "No se pudieron cargar los empleados."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [activeBranchId]);

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
    if (saving) return;

    setShowAdd(false);
    resetForm();
  };

  /* ============================================
     ADD EMPLOYEE TO SUPABASE
  ============================================ */

  const addEmployee = async (event) => {
    event.preventDefault();

    if (saving || !businessId) return;

    const cleanName = employeeName.trim();
    const cleanRole = employeeRole.trim();
    const cleanShift = employeeShift.trim();

    if (!cleanName || !cleanRole) {
      setError(
        "El nombre y el puesto son obligatorios."
      );
      return;
    }

    setSaving(true);
    setError("");

    let uploadedPhotoPath = null;

    try {
      const employeeId = crypto.randomUUID();
      let photoPath = null;

      /* UPLOAD PRIVATE PHOTO */

      if (employeePhoto.startsWith("data:image/")) {
        const blob = base64ToBlob(employeePhoto);

        if (blob.size > 5 * 1024 * 1024) {
          throw new Error(
            "La fotografía supera el límite de 5 MB."
          );
        }

        const path =
          `${businessId}/${employeeId}.jpg`;

        const { error: uploadError } =
          await supabase.storage
            .from(PHOTO_BUCKET)
            .upload(path, blob, {
              contentType: "image/jpeg",
              upsert: false,
            });

        if (uploadError) throw uploadError;

        uploadedPhotoPath = path;
        photoPath = path;
      } else if (isLocalAvatar(employeePhoto)) {
        photoPath = employeePhoto;
      }

      /* INSERT EMPLOYEE */

      const { data: newEmployee, error: insertError } =
        await supabase
          .from("employees")
          .insert({
            id: employeeId,
            business_id: businessId,
            name: cleanName,
            role: cleanRole,
            shift: cleanShift,
            photo: photoPath,
            is_active: true,
          })
          .select(
            "id, business_id, name, role, shift, photo, is_active, created_at"
          )
          .single();

      if (insertError) throw insertError;

      /* RESOLVE PHOTO */

      const [employeeWithPhoto] =
        await resolveEmployeePhotos([newEmployee]);

      setEmployees((previous) => [
        ...previous,
        employeeWithPhoto,
      ]);

      setSelectedId(newEmployee.id);
      setShowAdd(false);
      resetForm();

      console.log(
        "Cori Cloud: empleado registrado",
        newEmployee.id
      );
    } catch (saveError) {
      console.error(
        "Cori Cloud: error registrando empleado",
        saveError
      );

      // Remove an uploaded image if the database
      // insert failed. Do not erase local backups.
      if (uploadedPhotoPath) {
        // Check whether the employee record exists
        // before attempting cleanup.
        const { data: existing } = await supabase
          .from("employees")
          .select("id")
          .eq("photo", uploadedPhotoPath)
          .eq("business_id", businessId)
          .maybeSingle();

        if (!existing) {
          const { error: cleanupError } =
            await supabase.storage
              .from(PHOTO_BUCKET)
              .remove([uploadedPhotoPath]);

          if (cleanupError) {
            console.warn(
              "Cori Cloud: limpieza pendiente",
              cleanupError
            );
          }
        }
      }

      setError(
        saveError?.message ||
        "No se pudo guardar el empleado."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================
     DELETE EMPLOYEE FROM SUPABASE
  ============================================ */

  const deleteEmployee = async (employee) => {
    if (!businessId || deletingId) return;

    const confirmed = window.confirm(
      `¿Eliminar a ${employee.name}?`
    );

    if (!confirmed) return;

    setDeletingId(employee.id);
    setError("");

    try {
      // Soft delete preserves historical references.
      const { data, error: deleteError } =
        await supabase
          .from("employees")
          .update({
            is_active: false,
          })
          .eq("id", employee.id)
          .eq("business_id", businessId)
          .select("id")
          .single();

      if (deleteError) throw deleteError;

      if (!data) {
        throw new Error(
          "No se pudo actualizar el empleado."
        );
      }

      setEmployees((previous) =>
        previous.filter(
          (item) => item.id !== employee.id
        )
      );

      if (selectedId === employee.id) {
        setSelectedId(null);
      }

      setShowEditModal(false);
    } catch (deleteError) {
      console.error(
        "Cori Cloud: error eliminando empleado",
        deleteError
      );

      setError(
        deleteError?.message ||
        "No se pudo eliminar el empleado."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ============================================
     PHOTO UPLOAD / IPAD CAMERA
     PRESERVES ORIGINAL CENTER CROP
  ============================================ */

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecciona una imagen válida.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen debe pesar menos de 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");

        const side = Math.min(
          image.width,
          image.height
        );

        const sx = (image.width - side) / 2;
        const sy = (image.height - side) / 2;

        canvas.width = 256;
        canvas.height = 256;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          alert("No se pudo procesar la fotografía.");
          return;
        }

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

        const compressedPhoto =
          canvas.toDataURL("image/jpeg", 0.7);

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
     PRESERVES EXISTING POS COMPATIBILITY
  ============================================ */

  const checkInEmployee = () => {
    if (
      !selectedEmployee ||
      !businessId ||
      !activeBranchId
    ) {
      return;
    }

    const now = new Date();

    const activeEmployee = {
      ...selectedEmployee,
      photo:
        selectedEmployee.photoUrl ||
        selectedEmployee.photo ||
        "",
      checkIn: now.toLocaleTimeString(),
      checkInDate: now.toLocaleDateString(),
      active: true,

      businessId,
      locationId: activeBranchId,
      branchName: activeBranch,
    };

    localStorage.setItem(
      "activeEmployee",
      JSON.stringify(activeEmployee)
    );

    let history = [];

    try {
      const saved = JSON.parse(
        localStorage.getItem("employeeHistory") ||
        "[]"
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
     EDIT EMPLOYEE
     CLOUD EDITING PENDING MODAL UPDATE
  ============================================ */

  const openEditEmployee = (employee) => {
    setSelectedId(employee.id);

    // The existing EditEmployeeModal still writes
    // to localStorage. Do not open it for a cloud
    // employee until its save handler is migrated.
    setError(
      "La edición de empleados en Cori Cloud estará disponible después de conectar EditEmployeeModal.jsx con Supabase."
    );
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
                onClick={() => {
                  setError("");
                  setShowAdd(true);
                }}
                disabled={loading || !businessId}
              >
                + Nuevo
              </button>
            </div>

            {/* CLOUD STATUS / ERRORS */}

            {error && (
              <div
                role="alert"
                style={{
                  padding: "12px 16px",
                  marginBottom: 16,
                  borderRadius: 12,
                  border: "1px solid rgba(255,130,100,.35)",
                  color: "#e9a18d",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            {/* EMPLOYEE LIST */}

            <div className="employee-users">
              {loading ? (
                <div className="empty-employees">
                  <span aria-hidden="true">✦</span>

                  <strong>
                    Conectando con Cori Cloud...
                  </strong>

                  <p>
                    Cargando los perfiles de tu equipo.
                  </p>
                </div>
              ) : employees.length === 0 ? (
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
                    onClick={() => {
                      setError("");
                      setShowAdd(true);
                    }}
                    disabled={!businessId}
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
                        {employee.photoUrl ? (
                          <img
                            src={employee.photoUrl}
                            alt=""
                          />
                        ) : (
                          <Initials
                            name={employee.name}
                          />
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
                        onClick={() =>
                          openEditEmployee(employee)
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="employee-delete"
                        disabled={
                          deletingId === employee.id
                        }
                        onClick={() =>
                          deleteEmployee(employee)
                        }
                      >
                        {deletingId === employee.id
                          ? "Eliminando..."
                          : "Eliminar"}
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
                disabled={
                  !selectedEmployee ||
                  loading ||
                  !businessId
                }
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
                disabled={saving}
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
                      setEmployeeName(
                        event.target.value
                      )
                    }
                    disabled={saving}
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
                      setEmployeeRole(
                        event.target.value
                      )
                    }
                    disabled={saving}
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
                    setEmployeeShift(
                      event.target.value
                    )
                  }
                  disabled={saving}
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
                      disabled={saving}
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
                      disabled={saving}
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
                disabled={saving || !businessId}
              >
                {saving
                  ? "Guardando en Cori Cloud..."
                  : "Guardar empleado →"}
              </button>
            </form>
          </section>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL
          Reserved for the next cloud migration step.
          Never save cloud records only to localStorage.
      */}

      {showEditModal && selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          employees={employees}
          setEmployees={() => {
            setError(
              "La edición en la nube todavía no está habilitada."
            );
          }}
          onClose={() =>
            setShowEditModal(false)
          }
        />
      )}
    </div>
  );
}
