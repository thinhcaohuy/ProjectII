/**
 * BackHeader.jsx - Reusable top navigation bar for secondary/detail pages.
 * Displays a clean back button/link with consistent typography, hover animations, and spacing.
 */
import React from 'react';
import { Link } from 'react-router-dom';

export function BackHeader({ to, text, title }) {
  return (
    <div className="as-back-header" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Link 
        to={to} 
        className="as-back-link" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#4b5563',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '0.95rem',
          transition: 'color 0.2s ease, transform 0.2s ease',
          width: 'fit-content'
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>←</span>
        <span>{text}</span>
      </Link>
      {title && (
        <h1 style={{ 
          fontSize: '1.75rem', 
          fontWeight: '800', 
          color: '#111827', 
          margin: '0.25rem 0 0 0',
          letterSpacing: '-0.02em' 
        }}>
          {title}
        </h1>
      )}
    </div>
  );
}

export default BackHeader;
