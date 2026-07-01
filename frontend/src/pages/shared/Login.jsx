import React from 'react';
import { useLoginForm } from './login/useLoginForm';
import LoginHero from './login/LoginHero';
import LoginForm from './login/LoginForm';
import '../../styles/Auth.css';

export default function Login() {
  const { form, error, loading, handleChange, handleSubmit } = useLoginForm();

  return (
    <div className="auth-page auth-page--login">
      <div className="auth-shell auth-shell--wide">
        <LoginHero />
        <LoginForm
          form={form}
          error={error}
          loading={loading}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
