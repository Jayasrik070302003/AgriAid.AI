import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved user session on mount
        const savedUser = localStorage.getItem('agricure_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // In a real app, this would come from the API response
        const userToSave = {
            name: userData.name || 'Farmer',
            email: userData.email,
            avatar: userData.avatar || null
        };

        setUser(userToSave);
        setIsAuthenticated(true);
        localStorage.setItem('agricure_user', JSON.stringify(userToSave));
        localStorage.setItem('agricure_token', 'dummy_token'); // Simulate token
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('agricure_user');
        localStorage.removeItem('agricure_token');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
