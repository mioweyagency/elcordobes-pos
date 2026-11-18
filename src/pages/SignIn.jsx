import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

import CoriBrand from "../components/CoriBrand";
import "../styles/signIn.css";

export default function SignIn({ goTo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [creatingBusiness, setCreatingBusiness] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [needsBusiness, setNeedsBusiness] = useState(false);
  const [businessName, setBusinessName] = useState("");

  const submittingRef = useRef(false);

  /* ==========================================
     CHECK EXISTING BUSINESS
  ========================================== */

  const findExistingBusiness = async (userId) => {
    const { data, error: lookupError } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("owner_id", userId)
      .limit(1);

    if (lookupError) throw lookupError;

    return data?.[0] || null;
  };

  const finishOAuthSignIn = async (user) => {
    if (!user?.id) return;

    const business = await findExistingBusiness(user.id);

    if (business) {
      goTo?.("branchSelect");
      return;
    }

    const { data: memberships, error: memberError } =
      await supabase
        .from("business_members")
        .select("business_id, role")
        .eq("user_id", user.id)
        .limit(1);

    if (memberError) throw memberError;

    if (memberships?.length) {
      goTo?.("branchSelect");
      return;
    }

    setBusinessName(user.user_metadata?.shop_name || "");
    setNeedsBusiness(true);
  };

  useEffect(() => {
    let active = true;

    const handleAuthState = async (_event, session) => {
      if (!active || !session?.user) return;

      try {
        await finishOAuthSignIn(session.user);
      } catch (authError) {
        if (!active) return;
        setError(authError?.message || "No se pudo completar el inicio de sesión.");
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      handleAuthState("INITIAL_SESSION", data?.session);
    });

    const { data: listener } =
      supabase.auth.onAuthStateChange(handleAuthState);

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  /* ==========================================
     SIGN IN
  ========================================== */

  const handleSignIn = async (event) => {
    event.preventDefault();

    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    setError("");
    setSuccess("");
    setNeedsBusiness(false);

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (authError) throw authError;

      const user = data?.user;

      if (!user?.id || !data?.session) {
        throw new Error("No se pudo verificar tu sesión.");
      }

      const business = await findExistingBusiness(user.id);

      if (business) {
        goTo?.("branchSelect");
        return;
      }

      // Si el usuario pertenece a una cafetería
      // como empleado, no crear otra automáticamente.
      const { data: memberships, error: memberError } =
        await supabase
          .from("business_members")
          .select("business_id, role")
          .eq("user_id", user.id)
          .limit(1);

      if (memberError) throw memberError;

      if (memberships?.length) {
        goTo?.("branchSelect");
        return;
      }

      // Usuario autenticado sin negocio.
      // Ofrecer completar el registro.
      const pendingName =
        user.user_metadata?.shop_name || "";

      setBusinessName(pendingName);
      setNeedsBusiness(true);

      setSuccess(
        "Tu cuenta está activa. Completa el registro de tu cafetería para continuar."
      );
    } catch (signInError) {
      console.error("Cori SignIn:", signInError);

      setError(
        signInError?.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : signInError?.message ||
              "No se pudo iniciar sesión."
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  /* ==========================================
     COMPLETE BUSINESS REGISTRATION
  ========================================== */

  const handleCreateBusiness = async () => {
    if (creatingBusiness || submittingRef.current) return;

    const cleanName = businessName.trim();

    if (!cleanName) {
      setError("Escribe el nombre de tu cafetería.");
      return;
    }

    submittingRef.current = true;
    setCreatingBusiness(true);
    setError("");
    setSuccess("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const user = authData?.user;

      if (!user?.id) {
        throw new Error(
          "Tu sesión expiró. Inicia sesión nuevamente."
        );
      }

      // Comprobar nuevamente antes de crear.
      const existingBusiness =
        await findExistingBusiness(user.id);

      if (existingBusiness) {
        goTo?.("branchSelect");
        return;
      }

      const { data: businessId, error: createError } =
        await supabase.rpc("create_business", {
          p_business_name: cleanName,
          p_location_name: "Sucursal Principal",
        });

      if (createError) throw createError;

      if (!businessId) {
        throw new Error(
          "No se recibió la confirmación de la cafetería."
        );
      }

      setSuccess("¡Tu cafetería se creó correctamente!");

      goTo?.("branchSelect");
    } catch (createError) {
      console.error("Cori Cloud Create Business:", createError);

      setError(
        createError?.message ||
          "No se pudo crear la cafetería."
      );
    } finally {
      submittingRef.current = false;
      setCreatingBusiness(false);
    }
  };

  /* ==========================================
     PASSWORD RECOVERY
  ========================================== */

  const handlePasswordRecovery = async () => {
    if (recovering) return;

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(
        "Escribe tu correo electrónico para recuperar tu contraseña."
      );
      return;
    }

    setRecovering(true);

    try {
      const { error: recoveryError } =
        await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo: window.location.origin,
          }
        );

      if (recoveryError) throw recoveryError;

      setSuccess(
        "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña."
      );
    } catch (recoveryError) {
      setError(
        recoveryError?.message ||
          "No se pudo solicitar la recuperación."
      );
    } finally {
      setRecovering(false);
    }
  };

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <main className="cori-signin">
      <header className="cori-signin-header">
        <CoriBrand />

        <button
          type="button"
          className="cori-signin-back"
          onClick={() => goTo?.("intro")}
        >
          ← Volver al inicio
        </button>
      </header>

      <section className="cori-signin-main">
        <div className="cori-signin-card">

          {/* OFFICIAL CORI LOGO */}

          <div className="cori-signin-symbol">
            <CoriBrand />
          </div>

          <p className="cori-signin-eyebrow">
            CORI CLOUD · COFFEE TECH STUDIO
          </p>

          <h1>
            Bienvenido
            <span> de nuevo.</span>
          </h1>

          <p className="cori-signin-description">
            Tu cafetería, tu equipo y tu universo.
            Todo conectado en un solo lugar.
          </p>

          {/* LOGIN FORM */}

          <form
            className="cori-signin-form"
            onSubmit={handleSignIn}
          >
            <label className="cori-signin-field">
              <span>Correo electrónico</span>

              <input
                type="email"
                autoComplete="email"
                placeholder="correo@cafeteria.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </label>

            <label className="cori-signin-field">
              <span>Contraseña</span>

              <input
                type="password"
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </label>

            <button
              type="button"
              className="cori-signin-recovery"
              onClick={handlePasswordRecovery}
              disabled={loading || recovering}
            >
              {recovering
                ? "Enviando..."
                : "¿Olvidaste tu contraseña?"}
            </button>

            {error && (
              <div
                className="cori-signin-message error"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="cori-signin-message success"
                role="status"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              className="cori-signin-submit"
              disabled={
                loading ||
                recovering ||
                creatingBusiness
              }
            >
              {loading
                ? "Verificando cuenta..."
                : "Entrar a mi cafetería →"}
            </button>
          </form>

          {/* GITHUB SIGN IN */}

          <div className="cori-signin-social-divider">
            <span>o continúa con</span>
          </div>

          <button
            type="button"
            className="cori-signin-github"
            onClick={handleGithubSignIn}
            disabled={
              loading ||
              githubLoading ||
              recovering ||
              creatingBusiness
            }
          >
            <svg
              className="cori-signin-github-icon"
              viewBox="0 0 19 19"
              aria-hidden="true"
            >
              <use href="/icons.svg#github-icon" />
            </svg>
            {githubLoading
              ? "Conectando con GitHub..."
              : "Continuar con GitHub"}
          </button>

          {/* COMPLETE REGISTRATION */}

          {needsBusiness && (
            <div className="cori-signin-complete">
              <p className="cori-signin-divider">
                Completa tu registro en Cori Cloud
              </p>

              <label className="cori-signin-field">
                <span>Nombre de tu cafetería</span>

                <input
                  type="text"
                  placeholder="Ej. El Cordobés Café"
                  value={businessName}
                  maxLength={100}
                  onChange={(event) =>
                    setBusinessName(event.target.value)
                  }
                />
              </label>

              <button
                type="button"
                className="cori-signin-submit"
                onClick={handleCreateBusiness}
                disabled={creatingBusiness || loading}
              >
                {creatingBusiness
                  ? "Registrando cafetería..."
                  : "Completar registro →"}
              </button>
            </div>
          )}

          {/* REGISTER NEW ACCOUNT */}

          <div className="cori-signin-divider">
            <span>¿Tu cafetería aún no está registrada?</span>
          </div>

          <button
            type="button"
            className="cori-signin-register"
            onClick={() => goTo?.("createStore")}
          >
            Crear una cuenta nueva →
          </button>
        </div>

        <p className="cori-signin-footer">
          ✦ CORI POS BY EL CORDOBÉS
        </p>
      </section>
    </main>
  );
}
