/**
 * RegisterForm.jsx - Main register form component
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '../../../components/AuthCard';
import { FormGroup } from '../../../components/FormGroup';
import { UserType } from '../../../types/enums';
import CandidateForm from './CandidateForm';
import EmployerForm from './EmployerForm';

export function RegisterForm({
  userType,
  isEmployer,
  email,
  password,
  fullName,
  phoneNumber,
  companyName,
  address,
  avatarUrl,
  companySize,
  website,
  description,
  error,
  loading,
  onUserTypeChange,
  onChange,
  onSubmit
}) {
  return (
    <AuthCard
      title="Register"
      subtitle="Select account type to see relevant fields."
      error={error}
    >
      <div className="role-switch" role="tablist" aria-label="Account type">
        <button
          type="button"
          className={`role-switch__item ${userType === UserType.CANDIDATE ? 'active' : ''}`}
          onClick={() => onUserTypeChange(UserType.CANDIDATE)}
        >
          <span className="role-switch__title">Job Seeker</span>
          <span className="role-switch__desc">Personal profile and experience</span>
        </button>

        <button
          type="button"
          className={`role-switch__item ${isEmployer ? 'active' : ''}`}
          onClick={() => onUserTypeChange(UserType.EMPLOYER)}
        >
          <span className="role-switch__title">Employer</span>
          <span className="role-switch__desc">Company, website and job postings</span>
        </button>
      </div>

      <form onSubmit={onSubmit} className="auth-form-grid">
        <FormGroup
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onChange('email', e.target.value)}
          required
          requiredTone="required"
        />

        <FormGroup
          label="Password"
          name="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => onChange('password', e.target.value)}
          required
          requiredTone="required"
        />

        {isEmployer ? (
          <EmployerForm
            companyName={companyName}
            address={address}
            avatarUrl={avatarUrl}
            companySize={companySize}
            website={website}
            description={description}
            onChange={onChange}
          />
        ) : (
          <CandidateForm
            fullName={fullName}
            phoneNumber={phoneNumber}
            address={address}
            avatarUrl={avatarUrl}
            onChange={onChange}
          />
        )}

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </AuthCard>
  );
}

export default RegisterForm;
