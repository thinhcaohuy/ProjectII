/**
 * FormGroup.jsx - Reusable form group component
 */
import React from 'react';

export function FormGroup({ label, name, type = 'text', value, onChange, placeholder, required, optional, requiredTone, children, fullWidth }) {
  return (
    <div className={`form-group ${fullWidth ? 'form-group--full' : ''}`}>
      {label && (
        <label htmlFor={name} className={requiredTone === 'required' ? 'form-group__label form-group__label--required' : 'form-group__label'}>
          <span>{label}</span>
          {required ? <span className="form-group__meta form-group__meta--required">*</span> : null}
          {optional ? <span className="form-group__meta form-group__meta--optional">Optional</span> : null}
        </label>
      )}
      
      {children ? children : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows="4"
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
}

export default FormGroup;
