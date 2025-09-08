import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    actualTheme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Check localStorage first
        const savedTheme = localStorage.getItem('hotel-theme') as Theme;
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
            return savedTheme;
        }
        return 'system';
    });

    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Determine the actual theme to apply
        let newActualTheme: 'light' | 'dark';

        if (theme === 'system') {
            // Check system preference
            if (typeof window !== 'undefined' && window.matchMedia) {
                newActualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            } else {
                newActualTheme = 'light';
            }
        } else {
            newActualTheme = theme;
        }

        setActualTheme(newActualTheme);

        // Save to localStorage
        localStorage.setItem('hotel-theme', theme);

        // Apply theme to document
        const root = document.documentElement;
        if (newActualTheme === 'dark') {
            root.classList.add('dark');
            document.body.style.backgroundColor = '#0f0f0f';
        } else {
            root.classList.remove('dark');
            document.body.style.backgroundColor = '#ffffff';
        }
    }, [theme]);

    // Listen for system theme changes when theme is set to 'system'
    useEffect(() => {
        if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
                const newActualTheme = mediaQuery.matches ? 'dark' : 'light';
                setActualTheme(newActualTheme);

                // Apply theme to document
                const root = document.documentElement;
                if (newActualTheme === 'dark') {
                    root.classList.add('dark');
                    document.body.style.backgroundColor = '#0f0f0f';
                } else {
                    root.classList.remove('dark');
                    document.body.style.backgroundColor = '#ffffff';
                }
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const toggleTheme = () => {
        setThemeState(prev => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'system';
            return 'light';
        });
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const value = {
        theme,
        actualTheme,
        toggleTheme,
        setTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeProvider;
