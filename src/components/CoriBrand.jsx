import coriLogo from "../assets/cori-logo.png";

export default function CoriBrand() {
  return (
    <div className="cori-brand">
      <img
        src={coriLogo}
        alt="Cori POS"
        className="cori-brand-icon"
      />

      <div className="cori-brand-text">
        <strong>Cori POS</strong>
        <small>by El Cordobés</small>
      </div>
    </div>
  );
}