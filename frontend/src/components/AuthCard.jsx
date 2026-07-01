/**
 * AuthCard.jsx - Reusable auth card for login/register
 */
import React from 'react';

export function AuthCard({ title, subtitle, children, error }) {
  return (
    <section className="auth-card">
      <div className="auth-card__header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      {error && <div className="error">{error}</div>}

      {children}
    </section>
  );
}

export default AuthCard;
