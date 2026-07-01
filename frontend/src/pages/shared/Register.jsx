import React from 'react';
import { useRegisterForm } from './register/useRegisterForm';
import RegisterHero from './register/RegisterHero';
import RegisterForm from './register/RegisterForm';
import '../../styles/Auth.css';

export default function Register() {
  const {
    userType,
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
    isEmployer,
    error,
    loading,
    handleUserTypeChange,
    handleFieldChange,
    handleSubmit
  } = useRegisterForm();

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-shell auth-shell--wide">
        <RegisterHero />
        <RegisterForm
          userType={userType}
          isEmployer={isEmployer}
          email={email}
          password={password}
          fullName={fullName}
          phoneNumber={phoneNumber}
          companyName={companyName}
          address={address}
          avatarUrl={avatarUrl}
          companySize={companySize}
          website={website}
          description={description}
          error={error}
          loading={loading}
          onUserTypeChange={handleUserTypeChange}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
