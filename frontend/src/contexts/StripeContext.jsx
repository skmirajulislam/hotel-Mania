import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripeContext = createContext();

export const useStripe = () => {
    const context = useContext(StripeContext);
    if (!context) {
        throw new Error('useStripe must be used within a StripeProvider');
    }
    return context;
};

export const StripeProvider = ({ children }) => {
    const [stripe, setStripe] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeStripe = async () => {
            try {
                const stripeInstance = await stripePromise;
                setStripe(stripeInstance);
            } catch (error) {
                console.error('Failed to initialize Stripe:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeStripe();
    }, []);

    const value = {
        stripe,
        loading
    };

    return (
        <StripeContext.Provider value={value}>
            {children}
        </StripeContext.Provider>
    );
};

export default StripeContext;
