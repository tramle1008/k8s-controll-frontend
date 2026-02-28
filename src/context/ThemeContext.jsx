import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';  // import createTheme

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [themeMode, setThemeMode] = useState(() => {  // Đổi tên state thành themeMode cho rõ
        const saved = localStorage.getItem('theme');
        if (saved) return saved;

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    // Tạo theme object động dựa trên mode
    const muiTheme = useMemo(() => {
        return createTheme({
            palette: {
                mode: themeMode === 'system'
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : themeMode,
            },

        });
    }, [themeMode]);  // Re-create khi mode thay đổi

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        let effectiveMode = themeMode;
        if (themeMode === 'system') {
            effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        root.classList.add(effectiveMode);
        localStorage.setItem('theme', themeMode);
    }, [themeMode]);

    // Listen system change nếu 'system'
    useEffect(() => {
        if (themeMode !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(mediaQuery.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [themeMode]);

    const toggleTheme = () => {
        setThemeMode((prev) => {
            if (prev === 'light') return 'dark';
            if (prev === 'dark') return 'system';
            return 'light';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme: themeMode, toggleTheme }}>
            <MuiThemeProvider theme={muiTheme}>  {/* ← Truyền object theme ở đây */}
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);