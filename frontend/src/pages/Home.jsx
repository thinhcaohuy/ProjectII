import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserType } from '../types/enums';

/**
 * Home.jsx - Redirect to appropriate dashboard based on user type
 */
export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.userType === UserType.EMPLOYER) {
      navigate('/employer');
    } else if (user?.userType === UserType.CANDIDATE) {
      navigate('/candidate-overview');
    }
  }, [user, navigate]);

  return <div>Redirecting...</div>;
}
