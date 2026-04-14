/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading] = useState(false);

    const login = async (email, password, rememberMe = false) => {
        try {
            const response = await authAPI.login({ email, password });
            const { user, token } = response.data.data;

            if (rememberMe) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
            } else {
                sessionStorage.setItem('token', token);
                sessionStorage.setItem('user', JSON.stringify(user));
            }

            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { user, token } = response.data.data;

            // Default to localStorage for registration for better UX, or could arguable be session
            // Let's default to persistent for now as it's standard behavior
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
