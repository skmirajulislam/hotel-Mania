import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, Check, X } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Card element styling
const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
        },
        invalid: {
            color: '#9e2146',
        },
    },
    hidePostalCode: true,
};

const CheckoutForm = ({
    clientSecret,
    totalAmount,
    onSuccess,
    onError,
    onCancel,
    orderItems
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [cardComplete, setCardComplete] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (!cardComplete) {
            setPaymentError('Please complete your card information');
            return;
        }

        setProcessing(true);
        setPaymentError(null);

        const cardElement = elements.getElement(CardElement);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: 'Hotel Guest',
                    },
                }
            });

            if (error) {
                setPaymentError(error.message);
                onError(error);
            } else if (paymentIntent.status === 'succeeded') {
                setPaymentSuccess(true);
                onSuccess(paymentIntent);
            }
        } catch (err) {
            setPaymentError('An unexpected error occurred');
            onError(err);
        }

        setProcessing(false);
    };

    const handleCardChange = (event) => {
        setCardComplete(event.complete);
        setPaymentError(event.error ? event.error.message : null);
    };

    if (paymentSuccess) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600">Your order has been placed successfully.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2">
                    {orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <span>{item.name} x {item.quantity}</span>
                            <span>{item.price * item.quantity} INR</span>
                        </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{totalAmount} INR</span>
                    </div>
                </div>
            </div>

            {/* Card Details */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="h-4 w-4 inline mr-1" />
                    Card Details
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-white">
                    <CardElement
                        options={cardElementOptions}
                        onChange={handleCardChange}
                    />
                </div>
            </div>

            {/* Error Message */}
            {paymentError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {paymentError}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || processing || !cardComplete}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard className="h-4 w-4" />
                            Pay {totalAmount} INR
                        </>
                    )}
                </button>
            </div>

            {/* Security Notice */}
            <div className="text-center text-xs text-gray-500">
                <Lock className="h-3 w-3 inline mr-1" />
                Your payment information is secure and encrypted
            </div>
        </form>
    );
};

const StripeCheckout = ({
    isOpen,
    onClose,
    clientSecret,
    totalAmount,
    orderItems,
    onSuccess,
    onError
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <Elements stripe={stripePromise}>
                    <CheckoutForm
                        clientSecret={clientSecret}
                        totalAmount={totalAmount}
                        orderItems={orderItems}
                        onSuccess={onSuccess}
                        onError={onError}
                        onCancel={onClose}
                    />
                </Elements>
            </div>
        </div>
    );
};

export default StripeCheckout;
