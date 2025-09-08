import React, { useState } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ];

    const currentTheme = themes.find(t => t.value === theme) || themes[0];
    const CurrentIcon = currentTheme.icon;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-1"
                aria-label="Toggle theme"
            >
                <CurrentIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <ChevronDown className="h-3 w-3 text-gray-600 dark:text-gray-300" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    {themes.map((themeOption) => {
                        const IconComponent = themeOption.icon;
                        return (
                            <button
                                key={themeOption.value}
                                onClick={() => {
                                    setTheme(themeOption.value as 'light' | 'dark' | 'system');
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${theme === themeOption.value ? 'bg-gray-100 dark:bg-gray-700' : ''
                                    } ${themeOption.value === 'light' ? 'rounded-t-lg' : ''} ${themeOption.value === 'system' ? 'rounded-b-lg' : ''}`}
                            >
                                <IconComponent className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                <span className="text-sm text-gray-700 dark:text-gray-200">{themeOption.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
