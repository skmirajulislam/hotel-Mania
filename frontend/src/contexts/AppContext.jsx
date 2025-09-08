import React, { createContext, useContext, useState, useCallback } from 'react';

// Loading Context
const LoadingContext = createContext({
    isLoading: false,
    loadingMessage: '',
    startLoading: () => { },
    stopLoading: () => { },
    setLoadingMessage: () => { }
});

// Error Context
const ErrorContext = createContext({
    error: null,
    showError: () => { },
    clearError: () => { },
    isErrorVisible: false
});

// Loading Provider
export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [loadingCount, setLoadingCount] = useState(0);

    const startLoading = useCallback((message = 'Loading...') => {
        setLoadingCount(prev => prev + 1);
        setIsLoading(true);
        setLoadingMessage(message);
    }, []);

    const stopLoading = useCallback(() => {
        setLoadingCount(prev => {
            const newCount = Math.max(0, prev - 1);
            if (newCount === 0) {
                setIsLoading(false);
                setLoadingMessage('');
            }
            return newCount;
        });
    }, []);

    const value = {
        isLoading,
        loadingMessage,
        startLoading,
        stopLoading,
        setLoadingMessage
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
};

// Error Provider
export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null);
    const [isErrorVisible, setIsErrorVisible] = useState(false);

    const showError = useCallback((errorMessage, errorType = 'error', duration = 5000) => {
        const errorObj = {
            message: errorMessage,
            type: errorType, // 'error', 'warning', 'info', 'success'
            timestamp: new Date().toISOString(),
            id: Math.random().toString(36).substr(2, 9)
        };

        setError(errorObj);
        setIsErrorVisible(true);

        // Auto-hide error after duration
        if (duration > 0) {
            setTimeout(() => {
                clearError();
            }, duration);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
        setIsErrorVisible(false);
    }, []);

    const value = {
        error,
        showError,
        clearError,
        isErrorVisible
    };

    return (
        <ErrorContext.Provider value={value}>
            {children}
        </ErrorContext.Provider>
    );
};

// Custom hooks
export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

export const useError = () => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};

// HOC for automatic loading and error handling
export const withLoadingAndError = (WrappedComponent) => {
    return (props) => {
        const { startLoading, stopLoading } = useLoading();
        const { showError } = useError();

        const handleAsyncOperation = useCallback(async (operation, loadingMessage = 'Loading...') => {
            try {
                startLoading(loadingMessage);
                const result = await operation();
                return result;
            } catch (error) {
                showError(error.message || 'An unexpected error occurred');
                throw error;
            } finally {
                stopLoading();
            }
        }, [startLoading, stopLoading, showError]);

        return (
            <WrappedComponent
                {...props}
                handleAsyncOperation={handleAsyncOperation}
            />
        );
    };
};

// Loading Overlay Component
export const LoadingOverlay = () => {
    const { isLoading, loadingMessage } = useLoading();

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4 max-w-sm mx-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                <p className="text-gray-700 text-center">{loadingMessage}</p>
            </div>
        </div>
    );
};

// Error Toast Component
export const ErrorToast = () => {
    const { error, clearError, isErrorVisible } = useError();

    if (!error || !isErrorVisible) return null;

    const getErrorStyles = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-500 border-green-600';
            case 'warning':
                return 'bg-yellow-500 border-yellow-600';
            case 'info':
                return 'bg-blue-500 border-blue-600';
            default:
                return 'bg-red-500 border-red-600';
        }
    };

    const getErrorIcon = (type) => {
        switch (type) {
            case 'success':
                return '✓';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return '✕';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className={`${getErrorStyles(error.type)} text-white px-6 py-4 rounded-lg shadow-lg border-l-4 max-w-md`}>
                <div className="flex items-start">
                    <span className="text-xl mr-3 flex-shrink-0">
                        {getErrorIcon(error.type)}
                    </span>
                    <div className="flex-1">
                        <p className="font-semibold">
                            {error.type === 'success' ? 'Success' :
                                error.type === 'warning' ? 'Warning' :
                                    error.type === 'info' ? 'Info' : 'Error'}
                        </p>
                        <p className="text-sm mt-1">{error.message}</p>
                    </div>
                    <button
                        onClick={clearError}
                        className="ml-4 text-white hover:text-gray-200 text-xl flex-shrink-0"
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
};

// Combined Provider Component
export const AppProviders = ({ children }) => {
    return (
        <LoadingProvider>
            <ErrorProvider>
                {children}
                <LoadingOverlay />
                <ErrorToast />
            </ErrorProvider>
        </LoadingProvider>
    );
};
