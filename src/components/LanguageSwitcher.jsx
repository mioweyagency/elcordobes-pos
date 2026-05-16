import {
  useTranslation
} from "react-i18next";

import "../styles/languageswitcher.css";

export default function LanguageSwitcher() {

  /* =========================================================
     TRANSLATION
  ========================================================= */

  const { i18n } =
    useTranslation();

  /* =========================================================
     ACTIVE LANGUAGE
  ========================================================= */

  const currentLanguage =
    i18n.language;

  /* =========================================================
     CHANGE LANGUAGE
  ========================================================= */

  const changeLanguage =
    (language) => {

    i18n.changeLanguage(
      language
    );

    localStorage.setItem(
      "language",
      language
    );
  };

  return (

    <div className="language-switcher">

      {/* =========================================================
         ENGLISH
      ========================================================= */}

      <button

        className={

          currentLanguage === "en"

            ? "language-btn active"

            : "language-btn"
        }

        onClick={() =>
          changeLanguage("en")
        }
      >

        English

      </button>

      {/* =========================================================
         SPANISH
      ========================================================= */}

      <button

        className={

          currentLanguage === "es"

            ? "language-btn active"

            : "language-btn"
        }

        onClick={() =>
          changeLanguage("es")
        }
      >

        Español

      </button>

    </div>

  );
}