import { useTranslation } from "react-i18next";
import "../styles/languageswitcher.css";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLanguage = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "es"
  ).split("-")[0];

  const changeLanguage = async (language) => {
    await i18n.changeLanguage(language);

    try {
      localStorage.setItem("language", language);
    } catch {
      /* El cambio de idioma sigue activo aunque no pueda persistirse. */
    }
  };

  return (
    <div className="language-switcher" aria-label="Idioma / Language">
      <button
        type="button"
        className={
          currentLanguage === "es"
            ? "language-btn active"
            : "language-btn"
        }
        aria-pressed={currentLanguage === "es"}
        onClick={() => changeLanguage("es")}
      >
        Español
      </button>

      <button
        type="button"
        className={
          currentLanguage === "en"
            ? "language-btn active"
            : "language-btn"
        }
        aria-pressed={currentLanguage === "en"}
        onClick={() => changeLanguage("en")}
      >
        English
      </button>
    </div>
  );
}