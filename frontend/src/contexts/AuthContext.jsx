/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
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

    // Hay sesión guardada mientras se verifica contra el servidor, así que la
    // aplicación arranca en estado de carga y no parpadea hacia /login.
    const [loading, setLoading] = useState(() =>
        Boolean(localStorage.getItem('token') || sessionStorage.getItem('token'))
    );

    /**
     * Verifica la sesión guardada contra el servidor al arrancar.
     *
     * Antes se confiaba ciegamente en lo que hubiera en localStorage: con un
     * token caducado o revocado, la aplicación se pintaba entera como si el
     * usuario estuviera dentro y solo fallaba al primer fetch, mostrando
     * pantallas vacías sin explicación.
     */
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return undefined;
        }

        let cancelado = false;
        (async () => {
            try {
                const res = await authAPI.getMe();
                const actual = res.data?.data?.user || res.data?.data;
                if (cancelado || !actual) return;
                setUser(actual);
                const almacen = localStorage.getItem('token') ? localStorage : sessionStorage;
                almacen.setItem('user', JSON.stringify(actual));
            } catch (err) {
                // Un 401 ya limpia el almacenamiento en el interceptor de
                // services/api.js. Un fallo de red no debe cerrar la sesión:
                // se sigue con el usuario guardado y la app lo reintenta en la
                // siguiente petición.
                if (!cancelado && err.response?.status === 401) setUser(null);
            } finally {
                if (!cancelado) setLoading(false);
            }
        })();

        return () => {
            cancelado = true;
        };
    }, []);

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

    /**
     * Persiste el usuario actualizado en el mismo almacenamiento donde se
     * guardó la sesión. Sin esto, un cambio de perfil se veía en pantalla
     * pero desaparecía al recargar, porque el nombre y el correo se leen de
     * `localStorage`/`sessionStorage` al montar.
     */
    const updateUser = (nuevoUsuario) => {
        setUser(nuevoUsuario);
        const almacen = localStorage.getItem('user') ? localStorage : sessionStorage;
        almacen.setItem('user', JSON.stringify(nuevoUsuario));
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
        setUser,
        updateUser,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
