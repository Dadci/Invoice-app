import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../store/themeSlice';

const ThemeInitializer = () => {
    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);

    // First effect: Run once on mount to initialize theme from localStorage or system preference
    useEffect(() => {
        // Get saved theme from localStorage or system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

        // If there's a saved theme in localStorage, use that
        if (savedTheme) {
            dispatch(setTheme(savedTheme));
        }
        // Otherwise use system preference
        else if (prefersDark) {
            dispatch(setTheme('dark'));
        } else {
            dispatch(setTheme('light'));
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSystemThemeChange = (e) => {
            // Only change theme automatically if user hasn't explicitly set a preference
            if (!localStorage.getItem('theme')) {
                dispatch(setTheme(e.matches ? 'dark' : 'light'));
            }
        };

        mediaQuery.addEventListener('change', handleSystemThemeChange);
        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, [dispatch]);

    // Second effect: Apply theme whenever it changes in Redux state
    useEffect(() => {
        if (!theme) return; // Skip if theme is not yet initialized

        // Save theme preference to localStorage
        localStorage.setItem('theme', theme);

        // Apply theme to document
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.backgroundColor = '#141625';
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.backgroundColor = '#F8F8FB';
            document.documentElement.style.colorScheme = 'light';
        }
    }, [theme]);

    // This component doesn't render anything
    return null;
};

export default ThemeInitializer; 