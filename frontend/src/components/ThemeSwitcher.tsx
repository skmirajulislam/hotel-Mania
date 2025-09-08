import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 dark:glow-card"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? (
                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                    <Sun className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                )}
            </button>
        </div>
    );
};

export default ThemeSwitcher;
