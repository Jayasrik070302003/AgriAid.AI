import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (supabase) {
            // Supabase Auth
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session?.user) {
                    setUser({ name: session.user.user_metadata?.name || session.user.email, email: session.user.email });
                    setIsAuthenticated(true);
                }
                setLoading(false);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user) {
                    setUser({ name: session.user.user_metadata?.name || session.user.email, email: session.user.email });
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            });

            return () => subscription.unsubscribe();
        } else {
            // Fallback: localStorage session
            const saved = localStorage.getItem('agriaid_user');
            if (saved) {
                setUser(JSON.parse(saved));
                setIsAuthenticated(true);
            }
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        if (supabase) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password
            });
            if (error) throw error;
            return data;
        } else {
            // Fallback
            const userData = { name: credentials.name || 'Farmer', email: credentials.email };
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('agriaid_user', JSON.stringify(userData));
        }
    };

    const signup = async (credentials) => {
        if (supabase) {
            const { data, error } = await supabase.auth.signUp({
                email: credentials.email,
                password: credentials.password,
                options: { data: { name: credentials.name } }
            });
            if (error) throw error;
            return data;
        } else {
            return login(credentials);
        }
    };

    const logout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('agriaid_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
