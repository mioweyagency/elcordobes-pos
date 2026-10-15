
function readSettings() {
  try {
    const settings = JSON.parse(
      localStorage.getItem("storeSettings")
    );

    return settings &&
      typeof settings === "object" &&
      !Array.isArray(settings)
      ? settings
      : {};
  } catch {
    return {};
  }
}

export default function Topbar({ title, subtitle }) {
  const storeSettings = readSettings();

  return (
    <header className="topbar">
      <div className="topbar-heading">
        {subtitle && (
          <p className="eyebrow">{subtitle}</p>
        )}

        <h1>{title}</h1>
      </div>

      <div className="store-pill">
        {storeSettings.logo && (
          <img
            src={storeSettings.logo}
            alt=""
            className="store-pill-logo"
            width="38"
            height="38"
          />
        )}

        <span>
          {storeSettings.shopName || "El Cordobés"}
        </span>
      </div>
    </header>
  );
}
