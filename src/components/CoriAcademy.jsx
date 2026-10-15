import { useEffect, useRef, useState } from "react";

import "../styles/coriAcademy.css";

export default function CoriAcademy({
  title = "¡Hola! Soy Cori.",
  description = "Te enseñaré cómo utilizar esta pantalla.",
  videoSrc,
  poster,
  label = "CORI ACADEMY",
}) {
  const [open, setOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const dialogRef = useRef(null);
  const previewRef = useRef(null);
  const playerRef = useRef(null);

  // Abrir y cerrar el modal
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }

    if (!open) {
      playerRef.current?.pause();
    }
  }, [open]);

  // Reiniciar el video del tutorial al abrir
  useEffect(() => {
    if (!open || !videoSrc || videoError) return;

    const player = playerRef.current;

    if (!player) return;

    player.currentTime = 0;
    player.muted = false;

    const playPromise = player.play();

    if (playPromise?.catch) {
      playPromise.catch((error) => {
        console.info(
          "El navegador requiere iniciar el video manualmente:",
          error
        );
      });
    }
  }, [open, videoSrc, videoError]);

  // Pausar la vista previa cuando el tutorial está abierto
  useEffect(() => {
    const preview = previewRef.current;

    if (!preview) return;

    if (open) {
      preview.pause();
    } else {
      preview.muted = true;

      const playPromise = preview.play();

      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    }
  }, [open]);

  // Reiniciar estados si cambia el video
  useEffect(() => {
    setVideoError(false);
    setPreviewError(false);
  }, [videoSrc]);

  function openTutorial() {
    setVideoError(false);
    setOpen(true);
  }

  function closeTutorial() {
    playerRef.current?.pause();
    setOpen(false);
  }

  function handleVideoError(event) {
    const video = event.currentTarget;

    console.error("CORI ACADEMY — VIDEO ERROR", {
      src: video.currentSrc,
      code: video.error?.code,
      message: video.error?.message,
      networkState: video.networkState,
      readyState: video.readyState,
    });

    setVideoError(true);
  }

  return (
    <>
      {/* =====================================
          CORI ACADEMY CARD
      ===================================== */}

      <section className="cacademy-card">
        <div className="cacademy-copy">
          <p className="cacademy-eyebrow">
            {label}
          </p>

          <h2>{title}</h2>

          <p className="cacademy-description">
            {description}
          </p>

          <button
            type="button"
            className="cacademy-button"
            onClick={openTutorial}
          >
            Ver tutorial
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {/* VIDEO PREVIEW */}

        <div className="cacademy-preview">
          {videoSrc && !previewError ? (
            <video
              ref={previewRef}
              className="cacademy-preview-video"
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={poster}
              aria-label="Vista previa animada de Cori"
              onError={(event) => {
                console.error(
                  "CORI ACADEMY — PREVIEW ERROR",
                  event.currentTarget.error
                );

                setPreviewError(true);
              }}
            />
          ) : poster ? (
            <img
              src={poster}
              alt="Cori Academy"
            />
          ) : (
            <div className="cacademy-placeholder">
              <span>✦</span>
              <strong>CORI ACADEMY</strong>
            </div>
          )}

          <button
            type="button"
            className="cacademy-play"
            aria-label="Reproducir tutorial de Cori"
            onClick={openTutorial}
          >
            ▶
          </button>
        </div>
      </section>

      {/* =====================================
          VIDEO MODAL
      ===================================== */}

      <dialog
        ref={dialogRef}
        className="cacademy-dialog"
        aria-label="Video tutorial de Cori Academy"
        onClose={() => {
          playerRef.current?.pause();
          setOpen(false);
        }}
        onCancel={(event) => {
          event.preventDefault();
          closeTutorial();
        }}
      >
        <div className="cacademy-dialog-header">
          <div>
            <p className="cacademy-eyebrow">
              CORI ACADEMY
            </p>

            <h2>{title}</h2>
          </div>

          <button
            type="button"
            className="cacademy-close"
            aria-label="Cerrar tutorial"
            onClick={closeTutorial}
          >
            ✕
          </button>
        </div>

        {videoSrc && !videoError ? (
          <video
            key={videoSrc}
            ref={playerRef}
            className="cacademy-video"
            src={videoSrc}
            controls
            autoPlay
            playsInline
            preload="auto"
            poster={poster}
            onError={handleVideoError}
          >
            Tu navegador no admite este video.
          </video>
        ) : (
          <div className="cacademy-video-empty">
            <span>✦</span>

            <h3>
              No se pudo cargar el tutorial
            </h3>

            <p>
              Revisa que el archivo MP4 exista en
              public/videos y sea compatible con
              tu navegador.
            </p>

            {videoSrc && (
              <a
                href={videoSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="cacademy-video-link"
              >
                Abrir video directamente →
              </a>
            )}
          </div>
        )}

        <p className="cacademy-dialog-note">
          Aprende a tu ritmo. Puedes cerrar el tutorial
          y continuar con tu venta.
        </p>
      </dialog>
    </>
  );
}