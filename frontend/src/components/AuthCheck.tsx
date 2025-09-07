import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthCheckProps {
    isAuthenticated: boolean;
    children: React.ReactNode;
    redirectTo?: string;
    fallback?: React.ReactNode;
    onAuthRequired?: () => void;
}

const AuthCheck: React.FC<AuthCheckProps> = ({
    isAuthenticated,
    children,
    redirectTo = '/auth',
    fallback = null,
    onAuthRequired
}) => {
    const navigate = useNavigate();

    const handleAuthRequired = () => {
        if (onAuthRequired) {
            onAuthRequired();
        } else {
            // Store current location for redirect after login
            localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
            navigate(redirectTo);
        }
    };

    if (!isAuthenticated) {
        if (fallback) {
            return (
                <div onClick={handleAuthRequired}>
                    {fallback}
                </div>
            );
        }
        handleAuthRequired();
        return null;
    }

    return <>{children}</>;
};

export default AuthCheck;
