
import { useRef } from "react";

import CoriAvatar3D from "../components/CoriAvatar3D";
import CoriBrand from "../components/CoriBrand";

import "../styles/intro.css";

const CORI_VIDEO =
  "/videos/cori_greeting_and_guiding_59577_Seedance_25.mp4";

export default function Intro({ goTo }) {
  const tutorialRef = useRef(null);
  const tutorialVideoRef = useRef(null);

  /* =========================================
     OPEN VIDEO TUTORIAL
  ========================================= */

  const openTutorial = () => {
    const dialog = tutorialRef.current;

    if (!dialog || dialog.open) return;

    dialog.showModal();

    const video = tutorialVideoRef.current;

    if (video) {
      video.currentTime = 0;
      video.muted = false;

      video.play().catch(() => {
        // Si autoplay es bloqueado,
        // el usuario puede iniciar manualmente.
      });
    }
  };

  /* =========================================
     STOP VIDEO
  ========================================= */

  const stopTutorialVideo = () => {
    const video = tutorialVideoRef.current;

    if (!video) return;

    video.pause();
    video.currentTime = 0;
  };

  /* =========================================
     CLOSE VIDEO TUTORIAL
  ========================================= */

  const closeTutorial = () => {
    stopTutorialVideo();
    tutorialRef.current?.close();
  };

  /* =========================================
     REPLAY VIDEO
  ========================================= */

  const replayTutorial = () => {
    const video = tutorialVideoRef.current;

    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => {});
  };

  return (
    <div className="cori-intro">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="ci2-header">

        {/* OFFICIAL CORI POS BRAND */}

        <CoriBrand />

        {/* HEADER ACTIONS */}

        <div className="ci2-header-actions">

          <button
            type="button"
            className="ci2-help-link"
            onClick={openTutorial}
          >
            Cómo funciona
          </button>

          <button
            type="button"
            className="ci2-header-button"
            onClick={() => goTo("branchSelect")}
          >
            Entrar

            <span aria-hidden="true">
              ↗
            </span>
          </button>

        </div>

      </header>

      {/* =====================================
          MAIN HERO
      ===================================== */}

      <main className="ci2-main">

        {/* LEFT CONTENT */}

        <section className="ci2-copy">

          <div className="ci2-badge">
            <span aria-hidden="true" />

            HECHO PARA TU CAFETERÍA
          </div>

          <h1>
            Tu café.
            <br />
            Tu equipo.
            <br />
            <span>Todo conectado.</span>
          </h1>

          <p className="ci2-description">
            Más tiempo para preparar un gran café.
            Cori te acompaña con tus ventas, productos
            y equipo.
          </p>

          {/* MAIN ACTIONS */}

          <div className="ci2-actions">

            <button
              type="button"
              className="ci2-button ci2-primary"
              onClick={() => goTo("branchSelect")}
            >
              Entrar a mi cafetería

              <span aria-hidden="true">
                →
              </span>
            </button>

            <button
              type="button"
              className="ci2-button ci2-outline"
              onClick={() => goTo("createStore")}
            >
              Registrar mi cafetería

              <span aria-hidden="true">
                ＋
              </span>
            </button>

          </div>

          {/* BARISTA ACCESS */}

          <button
            type="button"
            className="ci2-barista-link"
            onClick={() => goTo("branchSelect")}
          >
            Soy barista · Entrar a mi sucursal

            <span aria-hidden="true">
              ↗
            </span>
          </button>

          {/* IPAD NOTE */}

          <div className="ci2-device-note">

            <span
              className="ci2-ipad-icon"
              aria-hidden="true"
            />

            Pensado para trabajar desde tu iPad.

          </div>

        </section>

        {/* =====================================
            CORI 3D CHARACTER
        ===================================== */}

        <section
          className="ci2-character"
          aria-label="Bienvenida de Cori"
        >

          {/* CHARACTER GLOW */}

          <div
            className="ci2-character-glow"
            aria-hidden="true"
          />

          {/* ANIMATED ORBIT */}

          <div
            className="ci2-orbit"
            aria-hidden="true"
          />

          {/* INTERACTIVE VIDEO CARD */}

          <button
            type="button"
            className="ci2-speech ci2-speech-video"
            onClick={openTutorial}
            aria-label="Ver video de bienvenida de Cori"
          >

            <span
              className="ci2-speech-dot"
              aria-hidden="true"
            />

            <span className="ci2-speech-content">

              <strong>
                Hola, soy Cori.
              </strong>

              <span>
                Mira cómo empezar.
              </span>

            </span>

            {/* PLAY ICON */}

            <span
              className="ci2-speech-play"
              aria-hidden="true"
            >

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7L8 5Z" />
              </svg>

            </span>

          </button>

          {/* ORIGINAL 3D AVATAR */}

          <div className="ci2-model">
            <CoriAvatar3D />
          </div>

          {/* CHARACTER CAPTION */}

          <div className="ci2-character-caption">
            TU COMPAÑERO DE CAFETERÍA
          </div>

        </section>

      </main>

      {/* =====================================
          BOTTOM FOOTER
      ===================================== */}

      <div className="ci2-bottom">

        <span>
          Buen café. Mejores historias.
        </span>

        <small>
          Cori POS · El Cordobés
        </small>

      </div>

      {/* =====================================
          VIDEO TUTORIAL MODAL
      ===================================== */}

      <dialog
        ref={tutorialRef}
        className="ci2-dialog ci2-video-dialog"
        aria-labelledby="ci2-tutorial-title"
        onClose={stopTutorialVideo}
      >

        {/* MODAL HEADER */}

        <div className="ci2-video-header">

          <p className="ci2-dialog-label">
            APRENDE CON CORI
          </p>

          <button
            type="button"
            className="ci2-video-close"
            onClick={closeTutorial}
            aria-label="Cerrar tutorial"
          >
            ×
          </button>

        </div>

        {/* TITLE */}

        <h2 id="ci2-tutorial-title">
          Empezamos juntos.
        </h2>

        <p className="ci2-video-description">
          Tu compañero Cori te enseña los primeros
          pasos para comenzar en tu cafetería.
        </p>

        {/* VIDEO PLAYER */}

        <div className="ci2-video-frame">

          <video
            ref={tutorialVideoRef}
            className="ci2-tutorial-video"
            src={CORI_VIDEO}
            controls
            playsInline
            preload="metadata"
            onError={() => {
              console.error(
                "No se pudo cargar el video de Cori."
              );
            }}
          >
            Tu navegador no puede reproducir este video.
          </video>

        </div>

        {/* THREE STEPS */}

        <div className="ci2-video-steps">

          <div className="ci2-video-step">
            <span>01</span>

            <strong>
              Elige tu sucursal
            </strong>
          </div>

          <div className="ci2-video-step">
            <span>02</span>

            <strong>
              Selecciona tu perfil
            </strong>
          </div>

          <div className="ci2-video-step">
            <span>03</span>

            <strong>
              Prepara tu primera venta
            </strong>
          </div>

        </div>

        {/* MODAL ACTIONS */}

        <div className="ci2-video-actions">

          <button
            type="button"
            className="ci2-video-replay"
            onClick={replayTutorial}
          >
            ↻ Repetir video
          </button>

          <button
            type="button"
            className="ci2-button ci2-primary"
            onClick={closeTutorial}
          >
            Vamos a comenzar

            <span aria-hidden="true">
              →
            </span>
          </button>

        </div>

      </dialog>

    </div>
  );
}
