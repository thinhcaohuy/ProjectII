/**
 * LoginHero.jsx - Hero section for login page
 */
import React from 'react';
import { AuthHero } from '../../../components/AuthHero';

export function LoginHero() {
  const highlights = [
    {
      title: 'Fast Access',
      description: 'Manage your profile and applications'
    },
    {
      title: 'Secure',
      description: 'Your data is protected'
    }
  ];

  return (
    <AuthHero
      badge="Recruitment System"
      title="Welcome Back"
      subtitle="Log in to continue searching for jobs or managing recruitment activities."
      highlights={highlights}
    />
  );
}

export default LoginHero;
