/**
 * useRegisterForm.js - Custom hook for register logic
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { LoginMessage, UserType } from '../../../types/enums';
import {
  CandidateRegisterRequest,
  EmployerRegisterRequest,
  LoginResponse
} from '../../../types/dto';

export function useRegisterForm() {
  const [userType, setUserType] = useState(UserType.CANDIDATE);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const isEmployer = userType === UserType.EMPLOYER;

  const handleUserTypeChange = (value) => {
    setUserType(value);
    setError('');

    if (value === UserType.EMPLOYER) {
      setFullName('');
      setPhoneNumber('');
    } else {
      setCompanyName('');
      setAddress('');
      setAvatarUrl('');
      setCompanySize('');
      setWebsite('');
      setDescription('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;

      if (isEmployer) {
        response = await authService.registerEmployer(
          email,
          password,
          companyName,
          address,
          avatarUrl,
          parseInt(companySize) || 0,
          website,
          description
        );
      } else {
        response = await authService.registerCandidate(
          email,
          password,
          fullName,
          phoneNumber,
          address,
          avatarUrl
        );
      }

      const userData = response.data;

      if (userData && userData.message === LoginMessage.SUCCESS) {
        const loginResponse = new LoginResponse(userData);
        login(loginResponse, loginResponse.email);
        navigate('/');
      } else {
        setError(userData?.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'fullName':
        setFullName(value);
        break;
      case 'phoneNumber':
        setPhoneNumber(value);
        break;
      case 'companyName':
        setCompanyName(value);
        break;
      case 'address':
        setAddress(value);
        break;
      case 'avatarUrl':
        setAvatarUrl(value);
        break;
      case 'companySize':
        setCompanySize(value);
        break;
      case 'website':
        setWebsite(value);
        break;
      case 'description':
        setDescription(value);
        break;
      default:
        break;
    }
  };

  return {
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
  };
}

export default useRegisterForm;
