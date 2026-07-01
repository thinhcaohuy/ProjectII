/**
 * StatCard.jsx - Shared metric card component for statistics displays
 */
import React from 'react';

export function StatCard({ label, value, detail, color = 'blue' }) {
  return (
    <article className={`as-stat-card ${color}`}>
      {label && <span className="as-stat-label">{label}</span>}
      {value !== undefined && <span className="as-stat-value">{value}</span>}
      {detail && <span className="as-stat-detail">{detail}</span>}
    </article>
  );
}

export default StatCard;
