export default function DashboardCard({ title, description, value, onClick }) {
  return (
    <button onClick={onClick} className="dashboard-card">
      <p className="card-value">{value}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </button>
  );
}