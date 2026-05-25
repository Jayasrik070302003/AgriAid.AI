import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Check localStorage, default to 'dark-ai' (the Dark AI Theme)
    const [theme, setThemeState] = useState(() => {
        const savedTheme = localStorage.getItem('agriaid-theme');
        return savedTheme || 'dark-ai';
    });

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };

    useEffect(() => {
        localStorage.setItem('agriaid-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        // Tailwind darkMode: 'class' compatibility
        if (theme === 'dark-ai' || theme === 'cyber-neon') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Backwards compatibility computed fields
    const isDarkMode = theme === 'dark-ai' || theme === 'cyber-neon';
    
    const toggleTheme = () => {
        setThemeState(prev => (prev === 'light' || prev === 'green-agri') ? 'dark-ai' : 'light');
    };

    // Metadata for the themes to show preview dots in the switcher
    const themes = [
        {
            id: 'dark-ai',
            name: 'Dark AI Theme',
            desc: 'Deep tech carbon space',
            colors: ['#050B14', '#080F1E', '#10b981', '#ffffff'] // [bg, card, accent, text]
        },
        {
            id: 'light',
            name: 'Light Theme',
            desc: 'Clean ultra-crisp slate',
            colors: ['#f8fafc', '#ffffff', '#10b981', '#1e293b']
        },
        {
            id: 'green-agri',
            name: 'Green Agri Theme',
            desc: 'Eco-friendly natural vibe',
            colors: ['#f0fdf4', '#ffffff', '#059669', '#166534']
        },
        {
            id: 'cyber-neon',
            name: 'Cyber Neon Theme',
            desc: 'Futuristic vibrant synth',
            colors: ['#030008', '#0c021a', '#ff007f', '#00f5ff']
        }
    ];

    return (
        <ThemeContext.Provider value={{ theme, setTheme, themes, isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

