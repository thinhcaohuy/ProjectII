import React, { createContext, useState, useEffect } from 'react';
import { LoginResponse } from '../types/dto';
import { APP_CONFIG } from '../config';

export const AuthContext = createContext(null);

const { USER, EMAIL } = APP_CONFIG.STORAGE_KEYS;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user from localStorage on mount
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(USER);
            const storedEmail = localStorage.getItem(EMAIL);

            if (storedUser) {
                // Convert stored user to LoginResponse DTO
                const userData = JSON.parse(storedUser);
                setUser(new LoginResponse(userData));
            }
            if (storedEmail) {
                setEmail(storedEmail);
            }
        } catch (err) {
            console.error('Error loading user from storage:', err);
            setError('Error loading user information');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (userData, userEmail) => {
        try {
            const loginResponse = userData instanceof LoginResponse
                ? userData
                : new LoginResponse(userData);

            localStorage.setItem(USER, JSON.stringify(loginResponse));
            localStorage.setItem(EMAIL, userEmail);
            setUser(loginResponse);
            setEmail(userEmail);
            setError(null);
        } catch (err) {
            console.error('Error during login:', err);
            setError('Error during login');
            throw err;
        }
    };

    const logout = () => {
        try {
            localStorage.removeItem(USER);
            localStorage.removeItem(EMAIL);
            setUser(null);
            setEmail(null);
            setError(null);
        } catch (err) {
            console.error('Error during logout:', err);
            setError('Error during logout');
        }
    };

    const clearError = () => setError(null);

    const value = {
        user,
        email,
        loading,
        error,
        login,
        logout,
        clearError,
        isAuthenticated: !!(user || email),
        // Helper method to check user type
        isUserType: (typeToCheck) => {
            const userTypeValue = typeof user?.userType === 'string'
                ? user.userType
                : user?.userType;
            const checkValue = typeof typeToCheck === 'string'
                ? typeToCheck
                : typeToCheck;
            return userTypeValue === checkValue;
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
