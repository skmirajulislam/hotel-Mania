import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Mail, Phone, Users, LogIn, ArrowRight } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import LoadingSpinner from '../components/LoadingSpinner';
import { roomsService } from '../services/api';

// Initialize Stripe
const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RqVZHL0BO9CO24tYKo1RCuHFZCriV1XuPUDLzon5Iu2cv75CsDffiETmyZADa5UHhTcdUJJEEIonamPTv9alWgZ00iGEji4Gu'
);

// Get API URL
const getApiUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:5002';
};

// Types
interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
}

interface Room {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    available: number;
    amenities: string[];
}

interface BookingFormProps {
    isAuthenticated?: boolean;
    user?: User | null;
}

// Date utils
const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
};

const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

interface BookingData {
    guest: {
        name: string;
        email: string;
        phone: string;
    };
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    specialRequests: string;
    totalPrice: number;
}

// Booking Form Component with Stripe
const BookingFormWithPayment: React.FC<{
    room: Room;
    bookingData: BookingData;
    onSuccess: (confirmationNumber: string) => void;
    onCancel: () => void;
}> = ({ room, bookingData, onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const stripe = useStripe();
    const elements = useElements();

    const handlePayment = async () => {
        if (!stripe || !elements) return;

        setLoading(true);
        setError('');

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) throw new Error('Card element not found');

            // Create payment intent
            const response = await fetch(`${getApiUrl()}/api/utils/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: bookingData.totalPrice,
                    currency: 'inr',
                    metadata: {
                        roomId: room._id,
                        roomName: room.name,
                        checkIn: bookingData.checkIn,
                        checkOut: bookingData.checkOut
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret } = await response.json();

            // Confirm payment
            const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${bookingData.guest.name}`,
                        email: bookingData.guest.email,
                        phone: bookingData.guest.phone
                    }
                }
            });

            if (paymentError) {
                throw new Error(paymentError.message);
            }

            if (paymentIntent.status === 'succeeded') {
                // Create booking
                const bookingResponse = await fetch(`${getApiUrl()}/api/bookings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        roomId: room._id,
                        checkInDate: bookingData.checkIn,
                        checkOutDate: bookingData.checkOut,
                        numberOfGuests: {
                            adults: bookingData.adults,
                            children: bookingData.children
                        },
                        paymentIntentId: paymentIntent.id,
                        guestDetails: bookingData.guest,
                        specialRequests: bookingData.specialRequests ? {
                            notes: bookingData.specialRequests
                        } : {}
                    })
                });

                if (!bookingResponse.ok) {
                    throw new Error('Failed to create booking');
                }

                const booking = await bookingResponse.json();
                onSuccess(booking.confirmationNumber || booking._id);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Payment failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">Complete Payment</h3>

            <div className="mb-4 p-4 bg-gray-50 rounded">
                <h4 className="font-semibold">{room.name}</h4>
                <p className="text-sm text-gray-600">
                    {bookingData.checkIn} to {bookingData.checkOut} ({calculateNights(bookingData.checkIn, bookingData.checkOut)} nights)
                </p>
                <p className="text-lg font-bold text-blue-600">Total: ₹{bookingData.totalPrice.toLocaleString()}</p>
            </div>

            <div className="mb-4 p-3 border rounded">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                        },
                    }}
                />
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handlePayment}
                    disabled={!stripe || loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : 'Pay Now'}
                </button>
            </div>
        </div>
    );
};

// Main Booking Form Component
const EnhancedBookingForm: React.FC<BookingFormProps> = ({ isAuthenticated = false, user = null }) => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [showPayment, setShowPayment] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [confirmationNumber, setConfirmationNumber] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        guest: {
            name: user ? `${user.firstName} ${user.lastName}` : '',
            email: user?.email || '',
            phone: user?.phone || ''
        },
        checkIn: formatDate(new Date()),
        checkOut: formatDate(new Date(Date.now() + 86400000)), // Tomorrow
        adults: 1,
        children: 0,
        specialRequests: ''
    });

    // Calculate booking details
    const nights = calculateNights(formData.checkIn, formData.checkOut);
    const totalPrice = room ? room.price * nights : 0;

    // Check for restored booking intent on authentication
    useEffect(() => {
        if (isAuthenticated) {
            const bookingIntent = localStorage.getItem('bookingIntent');
            if (bookingIntent) {
                try {
                    const intent = JSON.parse(bookingIntent);
                    if (intent.roomId === roomId) {
                        setFormData(intent.formData);
                        setCurrentStep(intent.step || 1);
                    }
                } catch (error) {
                    console.error('Error restoring booking intent:', error);
                }
            }
        }
    }, [isAuthenticated, roomId]);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                if (!roomId) {
                    setError('Room not found');
                    return;
                }

                setLoading(true);
                const roomData = await roomsService.getRoomById(roomId);
                setRoom(roomData);
            } catch (err: unknown) {
                console.error('Error fetching room:', err);
                setError('Failed to load room details');
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, [roomId]);

    // Handle authentication requirement
    const handleAuthRequired = () => {
        // Store booking intent in localStorage
        localStorage.setItem('bookingIntent', JSON.stringify({
            roomId,
            formData,
            step: currentStep
        }));
        // Store redirect path
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate('/auth');
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            handleAuthRequired();
            return;
        }

        if (currentStep === 1) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setShowPayment(true);
        }
    };

    // Handle payment success
    const handlePaymentSuccess = (confirmation: string) => {
        setConfirmationNumber(confirmation);
        setBookingComplete(true);
        setShowPayment(false);

        // Clear booking intent
        localStorage.removeItem('bookingIntent');
    };

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-16">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <h3 className="font-bold">Error</h3>
                        <p>{error}</p>
                    </div>
                    <button
                        onClick={() => navigate('/rooms')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Rooms
                    </button>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-gray-50 py-16">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Room not found</h2>
                    <button
                        onClick={() => navigate('/rooms')}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Back to Rooms
                    </button>
                </div>
            </div>
        );
    }

    // Success screen
    if (bookingComplete) {
        return (
            <div className="min-h-screen bg-gray-50 py-16">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-8 rounded-lg">
                        <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
                        <p className="text-lg mb-2">Your booking has been successfully processed.</p>
                        <p className="font-semibold">Confirmation Number: {confirmationNumber}</p>
                        <p className="text-sm mt-4">You will receive a confirmation email shortly.</p>
                    </div>
                    <div className="mt-6 space-x-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            View My Bookings
                        </button>
                        <button
                            onClick={() => navigate('/rooms')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                            Book Another Room
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Payment screen
    if (showPayment) {
        return (
            <div className="min-h-screen bg-gray-50 py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <Elements stripe={stripePromise}>
                        <BookingFormWithPayment
                            room={room}
                            bookingData={{ ...formData, totalPrice }}
                            onSuccess={handlePaymentSuccess}
                            onCancel={() => setShowPayment(false)}
                        />
                    </Elements>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-4">
                        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                1
                            </div>
                            <span>Guest Details</span>
                        </div>
                        <ArrowRight className="text-gray-400" />
                        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                2
                            </div>
                            <span>Review Booking</span>
                        </div>
                        <ArrowRight className="text-gray-400" />
                        <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                3
                            </div>
                            <span>Payment</span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Room Details */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img
                            src={room.images[0]}
                            alt={room.name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
                            <p className="text-gray-600 mb-4">{room.description}</p>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-2xl font-bold text-blue-600">₹{room.price.toLocaleString()}</span>
                                <span className="text-gray-500">per night</span>
                            </div>

                            {room.amenities && room.amenities.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Amenities</h4>
                                    <div className="grid grid-cols-2 gap-1 text-sm text-gray-600">
                                        {room.amenities.slice(0, 6).map((amenity, index) => (
                                            <div key={index} className="flex items-center gap-1">
                                                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                                {amenity}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        {/* Auth Notice */}
                        {!isAuthenticated && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <LogIn className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-blue-800 mb-1">Login Required</h4>
                                        <p className="text-sm text-blue-700">
                                            You'll need to login or create an account to complete your booking.
                                            Your booking details will be saved.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold mb-4">Guest Details</h3>

                                    <div className="grid gap-4">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                <User className="h-4 w-4" />
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.guest.name}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    guest: { ...prev.guest, name: e.target.value }
                                                }))}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                <Mail className="h-4 w-4" />
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.guest.email}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    guest: { ...prev.guest, email: e.target.value }
                                                }))}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                <Phone className="h-4 w-4" />
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.guest.phone}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    guest: { ...prev.guest, phone: e.target.value }
                                                }))}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Check-in
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.checkIn}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                                                    min={formatDate(new Date())}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Check-out
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.checkOut}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                                                    min={formData.checkIn}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                    <Users className="h-4 w-4" />
                                                    Adults
                                                </label>
                                                <select
                                                    value={formData.adults}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    {[1, 2, 3, 4].map(num => (
                                                        <option key={num} value={num}>{num}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                                    <Users className="h-4 w-4" />
                                                    Children
                                                </label>
                                                <select
                                                    value={formData.children}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    {[0, 1, 2, 3].map(num => (
                                                        <option key={num} value={num}>{num}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                                                Special Requests (Optional)
                                            </label>
                                            <textarea
                                                value={formData.specialRequests}
                                                onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                                                rows={3}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Any special requirements or requests..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold mb-4">Review Your Booking</h3>

                                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                        <div className="flex justify-between">
                                            <span>Guest Name:</span>
                                            <span className="font-medium">{formData.guest.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Email:</span>
                                            <span className="font-medium">{formData.guest.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Phone:</span>
                                            <span className="font-medium">{formData.guest.phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Check-in:</span>
                                            <span className="font-medium">{new Date(formData.checkIn).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Check-out:</span>
                                            <span className="font-medium">{new Date(formData.checkOut).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Guests:</span>
                                            <span className="font-medium">{formData.adults} Adults, {formData.children} Children</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Nights:</span>
                                            <span className="font-medium">{nights}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-3">
                                            <span className="font-bold">Total Amount:</span>
                                            <span className="font-bold text-blue-600">₹{totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    {!isAuthenticated
                                        ? 'Login to Continue'
                                        : currentStep === 1
                                            ? 'Continue to Review'
                                            : 'Proceed to Payment'
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedBookingForm;
