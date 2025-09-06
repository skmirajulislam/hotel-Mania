import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { bookingService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Booking form component
const BookingForm = ({ roomId, roomPrice }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        adults: 1,
        children: 0,
        specialRequests: ''
    });

    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateTotalNights = () => {
        if (!formData.checkIn || !formData.checkOut) return 0;

        const checkIn = new Date(formData.checkIn);
        const checkOut = new Date(formData.checkOut);
        const diffTime = checkOut - checkIn;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
    };

    const calculateTotalPrice = () => {
        const nights = calculateTotalNights();
        return nights * roomPrice;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Create a payment intent
            const { clientSecret } = await bookingService.createPaymentIntent({
                amount: calculateTotalPrice() * 100, // Convert to cents for Stripe
                currency: 'usd'
            });

            // Confirm the payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: `${formData.firstName} ${formData.lastName}`,
                        email: formData.email
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            if (result.paymentIntent.status === 'succeeded') {
                // Create the booking
                await bookingService.createBooking({
                    roomId,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    checkIn: formData.checkIn,
                    checkOut: formData.checkOut,
                    adults: formData.adults,
                    children: formData.children,
                    specialRequests: formData.specialRequests,
                    totalPrice: calculateTotalPrice(),
                    paymentIntentId: result.paymentIntent.id
                });

                setSuccess(true);
                setTimeout(() => {
                    navigate('/rooms');
                }, 3000);
            }
        } catch (err) {
            setError(err.message || 'An error occurred during the booking process.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-green-100 p-6 rounded-lg text-center">
                <h2 className="text-2xl font-bold text-green-700 mb-2">Booking Successful!</h2>
                <p className="text-green-600">Your room has been booked. We've sent you a confirmation email.</p>
                <p className="text-green-600 mt-2">Redirecting to rooms page...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Check In Date</label>
                    <input
                        type="date"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Check Out Date</label>
                    <input
                        type="date"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Adults</label>
                    <input
                        type="number"
                        name="adults"
                        value={formData.adults}
                        onChange={handleChange}
                        min="1"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Children</label>
                    <input
                        type="number"
                        name="children"
                        value={formData.children}
                        onChange={handleChange}
                        min="0"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
            </div>

            <div className="my-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Payment Information</h3>
                <div className="border border-gray-300 rounded-md p-3">
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
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {calculateTotalNights() > 0 && (
                <div className="bg-gray-100 p-4 rounded-md">
                    <h3 className="text-lg font-medium text-gray-700">Booking Summary</h3>
                    <div className="mt-2 space-y-1">
                        <div className="flex justify-between">
                            <span>Number of nights:</span>
                            <span>{calculateTotalNights()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Price per night:</span>
                            <span>${roomPrice}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>${calculateTotalPrice()}</span>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-100 p-3 rounded-md text-red-700">
                    {error}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={!stripe || loading || calculateTotalNights() === 0}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${(!stripe || loading || calculateTotalNights() === 0) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? <LoadingSpinner /> : 'Complete Booking'}
                </button>
            </div>
        </form>
    );
};

// Main component
const RoomBooking = () => {
    const { id } = useParams();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch room data
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await axios.get(`/api/rooms/${id}`);
                setRoom(response.data);
            } catch (err) {
                setError('Failed to load room information.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, [id]);

    if (loading) return <LoadingSpinner />;

    if (error || !room) {
        return (
            <div className="bg-red-100 p-4 rounded-md text-red-700">
                {error || 'Room not found'}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Book Room: {room.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Elements stripe={stripePromise}>
                        <BookingForm roomId={id} roomPrice={room.price} />
                    </Elements>
                </div>

                <div className="bg-gray-50 p-4 rounded-md h-fit">
                    <h2 className="text-xl font-semibold mb-4">{room.name}</h2>
                    {room.images && room.images.length > 0 && (
                        <img
                            src={room.images[0]}
                            alt={room.name}
                            className="w-full h-48 object-cover rounded-md mb-4"
                        />
                    )}
                    <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                    <div className="text-lg font-bold mt-2">${room.price} / night</div>

                    {room.amenities && room.amenities.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-md font-medium mb-2">Amenities:</h3>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                                {room.amenities.map((amenity, index) => (
                                    <li key={index}>{amenity}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoomBooking;
