'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => { },
    setTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    const applyThemeToDOM = (t: Theme) => {
        if (typeof document === 'undefined') return;
        const root = document.documentElement;
        const body = document.body;

        if (t === 'dark') {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
            if (body) {
                body.classList.add('dark');
                body.setAttribute('data-theme', 'dark');
            }
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
            if (body) {
                body.classList.remove('dark');
                body.setAttribute('data-theme', 'light');
            }
        }
    };

    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem('vitree-theme') as Theme | null;
            if (savedTheme === 'light' || savedTheme === 'dark') {
                setThemeState(savedTheme);
                applyThemeToDOM(savedTheme);
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setThemeState('dark');
                applyThemeToDOM('dark');
            } else {
                applyThemeToDOM('light');
            }
        } catch {
            // localStorage not available
        }
        setMounted(true);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        applyThemeToDOM(newTheme);
        try {
            localStorage.setItem('vitree-theme', newTheme);
        } catch { }
    };

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
    };

    return (
        <ThemeContext.Provider value={{ theme: mounted ? theme : 'light', toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
