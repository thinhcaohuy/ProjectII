/**
 * useLoginForm.js - Custom hook for login logic
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';
import { LoginMessage } from '../../../types/enums';
import { LoginResponse } from '../../../types/dto';

export function useLoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const email = form.email.trim().toLowerCase();
      const password = form.password.trim();

      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      const { data } = await authService.login(email, password);

      if (data?.message === LoginMessage.SUCCESS) {
        const response = new LoginResponse(data);
        login(data, data.email);
        navigate('/');
      } else {
        setError(data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  return { form, error, loading, handleChange, handleSubmit };
}

export default useLoginForm;
