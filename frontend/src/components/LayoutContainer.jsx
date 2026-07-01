/**
 * LayoutContainer.jsx - Shared responsive container layout for all dashboard pages
 */
import React from 'react';

export function LayoutContainer({ children, className = '', title, subtitle, headerActions }) {
  return (
    <div className={`as-dashboard-container ${className}`}>
      {(title || subtitle) && (
        <div className="as-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {headerActions && <div className="as-banner-actions">{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default LayoutContainer;
