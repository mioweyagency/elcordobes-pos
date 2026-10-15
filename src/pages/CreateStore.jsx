import { useRef, useState } from "react";

import { supabase } from "../lib/supabase";

import "../styles/createstore.css";

import heroImage from "../assets/cordobespos.png";

export default function CreateStore({ goTo }) {
  /* ==========================================
     STATES
  ========================================== */

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [country, setCountry] = useState("México");
  const [currency, setCurrency] = useState("MXN");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submittingRef = useRef(false);

  /* ==========================================
     VALIDATION
  ========================================== */

  const validateForm = () => {
    if (
      !shopName.trim() ||
      !ownerName.trim() ||
      !email.trim() ||
      !password
    ) {
      return "Por favor, completa todos los campos obligatorios.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Ingresa un correo electrónico válido.";
    }

    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }

    if (!country.trim()) {
      return "Selecciona un país.";
    }

    return "";
  };

  /* ==========================================
     CREATE STORE RECORD
     Requires an authenticated session
  ========================================== */

  const saveStore = async (userId, values) => {
    const { error: storeError } = await supabase
      .from("stores")
      .insert([
        {
          user_id: userId,
          shop_name: values.shopName,
          owner_name: values.ownerName,
          email: values.email,
          country: values.country,
          currency: values.currency,
        },
      ]);

    if (storeError) {
      throw new Error(
        `La cuenta fue creada, pero no se pudo registrar la cafetería: ${storeError.message}`
      );
    }
  };

  /* ==========================================
     EMAIL NOTIFICATION
     Non-critical operation
  ========================================== */

  const sendNotification = async (values) => {
    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/pos@elcordobescoffee.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            shopName: values.shopName,
            ownerName: values.ownerName,
            email: values.email,
            country: values.country,
            currency: values.currency,
          }),
        }
      );

      if (!response.ok) {
        console.warn(
          "No se pudo enviar la notificación de registro."
        );
      }
    } catch (notificationError) {
      console.warn(
        "Notification error:",
        notificationError
      );
    }
  };

  /* ==========================================
     CREATE ACCOUNT
  ========================================== */

  const createStore = async (event) => {
    event?.preventDefault();

    if (submittingRef.current) return;

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const values = {
      shopName: shopName.trim(),
      ownerName: ownerName.trim(),
      email: email.trim().toLowerCase(),
      country: country.trim(),
      currency,
    };

    submittingRef.current = true;
    setLoading(true);

    try {
      /* ==========================================
         SIGN UP
      ========================================== */

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: values.email,
          password,
          options: {
            data: {
              shop_name: values.shopName,
              owner_name: values.ownerName,
              country: values.country,
              currency: values.currency,
            },
          },
        });

      if (signUpError) {
        throw signUpError;
      }

      const userId = data?.user?.id;
      const session = data?.session;

      if (!userId) {
        throw new Error(
          "Supabase no devolvió un usuario válido."
        );
      }

      /* ==========================================
         EMAIL CONFIRMATION REQUIRED
      ========================================== */

      if (!session) {
        setSuccess(
          "Revisa tu correo electrónico para verificar tu cuenta. Después inicia sesión para completar el registro de tu cafetería."
        );

        await sendNotification(values);

        return;
      }

      /* ==========================================
         SAVE STORE
      ========================================== */

      await saveStore(userId, values);

      /* ==========================================
         NOTIFY
      ========================================== */

      await sendNotification(values);

      /* ==========================================
         SUCCESS
      ========================================== */

      setSuccess(
        "¡Tu cafetería se registró correctamente!"
      );

      goTo?.("branchSelect");
    } catch (createError) {
      console.error(
        "CreateStore error:",
        createError
      );

      setError(
        createError?.message ||
          "Ocurrió un error al crear la cuenta."
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div className="create-page">
      {/* ==========================================
          LEFT SIDE
      ========================================== */}

      <section className="create-left">
        <img
          src={heroImage}
          alt="El Cordobés Coffee"
          className="create-bg"
        />

        <div className="create-overlay" />

        <div className="create-left-content">
          <div className="create-brand">
            <span className="create-brand-icon">
              ✦
            </span>

            <div>
              <strong>Cori POS</strong>
              <small>by El Cordobés</small>
            </div>
          </div>

          <p className="create-eyebrow">
            COFFEE TECH STUDIO
          </p>

          <h1>
            Tu cafetería.
            <br />
            <span>Tu universo.</span>
          </h1>

          <p className="create-description">
            Ventas, inventario y administración
            en un solo lugar.
            <br />
            Comienza tu experiencia con Cori.
          </p>

          <div className="create-left-footer">
            <span>✦</span>
            Diseñado para cafeterías modernas.
          </div>
        </div>
      </section>

      {/* ==========================================
          RIGHT SIDE
      ========================================== */}

      <section className="create-right">
        <div className="create-card">
          {/* HEADER */}

          <div className="create-card-header">
            <div className="create-card-symbol">
              ✦
            </div>

            <p className="create-label">
              BIENVENIDO A CORI POS
            </p>

            <h2>
              Crea tu cuenta
            </h2>

            <p className="create-subtitle">
              Registra tu cafetería y comienza
              a administrar tu negocio.
            </p>
          </div>

          {/* FORM */}

          <form
            className="create-form"
            onSubmit={createStore}
          >
            <div className="create-inputs">
              {/* SHOP NAME */}

              <label className="create-field">
                <span>
                  Nombre de la cafetería *
                </span>

                <input
                  type="text"
                  placeholder="Ej. El Cordobés Café"
                  value={shopName}
                  maxLength={100}
                  autoComplete="organization"
                  required
                  onChange={(event) =>
                    setShopName(event.target.value)
                  }
                />
              </label>

              {/* OWNER NAME */}

              <label className="create-field">
                <span>
                  Nombre del propietario *
                </span>

                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={ownerName}
                  maxLength={100}
                  autoComplete="name"
                  required
                  onChange={(event) =>
                    setOwnerName(event.target.value)
                  }
                />
              </label>

              {/* EMAIL */}

              <label className="create-field">
                <span>
                  Correo electrónico *
                </span>

                <input
                  type="email"
                  placeholder="correo@cafeteria.com"
                  value={email}
                  autoComplete="email"
                  required
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                />
              </label>

              {/* PASSWORD */}

              <label className="create-field">
                <span>
                  Contraseña *
                </span>

                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  minLength={6}
                  autoComplete="new-password"
                  required
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />
              </label>

              {/* COUNTRY + CURRENCY */}

              <div className="create-form-row">
                <label className="create-field">
                  <span>
                    País
                  </span>

                  <select
                    value={country}
                    onChange={(event) => {
                      const selectedCountry =
                        event.target.value;

                      setCountry(selectedCountry);

                      if (selectedCountry === "México") {
                        setCurrency("MXN");
                      } else if (
                        selectedCountry === "Estados Unidos"
                      ) {
                        setCurrency("USD");
                      }
                    }}
                  >
                    <option value="México">
                      México
                    </option>

                    <option value="Estados Unidos">
                      Estados Unidos
                    </option>

                    <option value="Otro">
                      Otro
                    </option>
                  </select>
                </label>

                <label className="create-field">
                  <span>
                    Moneda
                  </span>

                  <select
                    value={currency}
                    onChange={(event) =>
                      setCurrency(event.target.value)
                    }
                  >
                    <option value="MXN">
                      MXN
                    </option>

                    <option value="USD">
                      USD
                    </option>

                    <option value="EUR">
                      EUR
                    </option>
                  </select>
                </label>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="create-message create-error"
                role="alert"
              >
                <span>⚠</span>
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                className="create-message create-success"
                role="status"
              >
                <span>✓</span>
                {success}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="create-button"
              disabled={loading || Boolean(success)}
            >
              {loading
                ? "Creando cuenta..."
                : success
                ? "Revisa tu correo"
                : "Crear mi cafetería →"}
            </button>
          </form>

          {/* LOGIN */}

          <p className="create-login-text">
            ¿Ya tienes una cuenta?

            <button
              type="button"
              onClick={() => goTo?.("signIn")}
            >
              Iniciar sesión →
            </button>
          </p>

          <div className="create-security">
            <span>✦</span>
            Tu información está protegida
            mediante autenticación segura.
          </div>
        </div>
      </section>
    </div>
  );
}