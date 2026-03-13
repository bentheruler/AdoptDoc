// NEW FILE — not in project structure
// Suggested location: client/src/components/dashboard/StatsCard.jsx
// (You may want to add a dashboard/ folder under components/)

const StatsCard = ({ label, value, icon }) => {
  return (
    <div className="stats-card">
      {icon && <span className="stats-card__icon">{icon}</span>}
      <div className="stats-card__value">{value ?? '—'}</div>
      <div className="stats-card__label">{label}</div>
    </div>
  );
};

export default StatsCard;