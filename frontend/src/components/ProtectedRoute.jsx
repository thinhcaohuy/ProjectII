import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserType } from '../types/enums';

export function ProtectedRoute({ children, requiredType }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="protected-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If requiredType is specified, check if user has the correct type
  if (requiredType && user?.userType) {
    // Support both enum values and string comparisons
    const userTypeValue = user.userType;
    const requiredTypeValue = (typeof requiredType === 'object') ? requiredType : requiredType;
    
    if (userTypeValue !== requiredTypeValue) {
      return <Navigate to="/" />;
    }
  }

  return children;
}
