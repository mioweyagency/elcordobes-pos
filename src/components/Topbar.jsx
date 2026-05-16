export default function Topbar({
  title,
  subtitle
}) {

  /* STORE SETTINGS */

  const storeSettings =
    JSON.parse(

      localStorage.getItem(
        "storeSettings"
      )

    ) || {};

  return (

    <header className="topbar">

      {/* LEFT */}

      <div>

        <p className="eyebrow">
          {subtitle}
        </p>

        <h1>
          {title}
        </h1>

      </div>

      {/* RIGHT */}

      <div className="store-pill">

        {storeSettings.shopName ||

          "Coffee Shop"}

      </div>

    </header>

  );
}