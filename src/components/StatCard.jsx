// echostats/src/components/StatCard.jsx
import React from 'react';

function StatCard({ title, loading, children, emptyMessage }) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      {loading ? (
        <p className="loading-message">Loading {title.toLowerCase()}...</p>
      ) : children ? (
        children
      ) : (
        <p className="stat-text">{emptyMessage || `No ${title.toLowerCase()} found for this period.`}</p>
      )}
    </div>
  );
}

export default StatCard;