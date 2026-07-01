import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserType } from '../types/enums';
import '../styles/App.css';

export function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Recruitment System</Link>
            </div>

            <div className="navbar-menu">
                {!isAuthenticated ? (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                ) : (
                    <>
                        {user?.userType === UserType.EMPLOYER ? (
                            <>
                                <Link to="/employer">Dashboard</Link>
                                <Link to="/employer/jobs">Jobs</Link>
                                <Link to="/employer/assessments">Assessments</Link>
                                <Link to="/market">Market</Link>
                                <Link to="/profile">Profile</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/candidate-overview">Dashboard</Link>
                                <Link to="/candidate/assessments">Assessments</Link>
                                <Link to="/market">Market</Link>
                                <Link to="/candidate">Applications</Link>
                                <Link to="/profile">Profile</Link>
                            </>
                        )}
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}