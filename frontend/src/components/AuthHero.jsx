/**
 * AuthHero.jsx - Reusable hero section for auth pages
 */
import React from 'react';

export function AuthHero({ badge, title, subtitle, highlights }) {
  return (
    <section className="auth-hero">
      <div className="auth-badge">{badge}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      
      {highlights && highlights.length > 0 && (
        <div className="auth-highlights">
          {highlights.map((item, idx) => (
            <div key={idx} className="auth-highlight">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AuthHero;
