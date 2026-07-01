/**
 * LoginForm.jsx - Login form component
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../../../components/AuthCard';
import { FormGroup } from '../../../components/FormGroup';

export function LoginForm({ form, error, loading, onSubmit, onChange }) {
  return (
    <AuthCard
      title="Login"
      subtitle="Enter your account credentials"
      error={error}
    >
      <form onSubmit={onSubmit} className="auth-form-grid">
        <FormGroup
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={onChange}
          required
          fullWidth
        />

        <FormGroup
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={onChange}
          required
          fullWidth
        />

        <button
          type="submit"
          disabled={loading}
          className="auth-submit"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="auth-footer">
        Don't have an account?{' '}
        <Link to="/register">Register</Link>
      </p>
    </AuthCard>
  );
}

export default LoginForm;
