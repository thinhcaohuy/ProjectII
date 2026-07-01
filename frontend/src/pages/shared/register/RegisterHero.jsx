/**
 * RegisterHero.jsx - Hero section for register page
 */
import React from 'react';
import { AuthHero } from '../../../components/AuthHero';

export function RegisterHero() {
  const highlights = [
    {
      title: 'Separate flows',
      description: 'Candidates and businesses'
    },
    {
      title: 'Clear forms',
      description: 'Only necessary fields shown'
    }
  ];

  return (
    <AuthHero
      badge="Recruitment System"
      title="Create an account"
      subtitle="Register as a job seeker to find opportunities or as an employer to post jobs."
      highlights={highlights}
    />
  );
}

export default RegisterHero;
