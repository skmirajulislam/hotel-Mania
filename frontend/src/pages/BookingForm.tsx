import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, User, Mail, Phone, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

// Date utils
const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const BookingForm = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [confirmationNumber, setConfirmationNumber] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        guest: {
            name: '',
            email: '',
            phone: ''
        },
        checkIn: formatDate(new Date()),
        checkOut: formatDate(new Date(Date.now() + 86400000)), // Tomorrow
        adults: 1,
        children: 0
    });

    // Booking calculation
    const nights = calculateNights(formData.checkIn, formData.checkOut);
    const totalPrice = room ? room.price * nights : 0;

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await fetch(`/api/rooms/${roomId}`);
                if (!response.ok) {
                    throw new Error('Room not found');
                }
                const data = await response.json();
                setRoom(data);
            } catch (error) {
                setError('Failed to load room data');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, [roomId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('guest.')) {
            const guestField = name.split('.')[1];
            setFormData({
                ...formData,
                guest: {
                    ...formData.guest,
                    [guestField]: value
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const handleConfirmBooking = async () => {
        setShowConfirmation(false);
        setShowPayment(true);

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId,
                    guest: formData.guest,
                    checkIn: formData.checkIn,
                    checkOut: formData.checkOut,
                    numberOfGuests: {
                        adults: parseInt(formData.adults),
                        children: parseInt(formData.children)
                    },
                    totalPrice
                })
            });

            if (!response.ok) {
                throw new Error('Booking failed');
            }

            const data = await response.json();

            // In a real app, you would use the payment client secret to
            // collect payment information with Stripe Elements
            // For this demo, we'll simulate a successful payment

            setTimeout(() => {
                setShowPayment(false);
                setBookingComplete(true);
                setConfirmationNumber(`BK${Date.now().toString().substr(-6)}`);
            }, 2000);

        } catch (error) {
            setError('Failed to complete booking');
            console.error(error);
            setShowPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/rooms')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    Back to Rooms
                </button>
            </div>
        );
    }

    if (bookingComplete) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-lg text-center">
                    <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
                    <p className="mb-2">Thank you for your booking at Grand Hotel.</p>
                    <p className="mb-4">Your confirmation number is: <span className="font-bold">{confirmationNumber}</span></p>
                    <p>A confirmation email has been sent to {formData.guest.email}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Book Your Stay</h1>

            {room && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Room Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-4">{room.name}</h2>
                            <div className="aspect-w-16 aspect-h-9 mb-4">
                                <img
                                    src={room.images[0]}
                                    alt={room.name}
                                    className="rounded-lg object-cover w-full h-48"
                                />
                            </div>
                            <p className="text-gray-600 mb-4">{room.description}</p>
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex justify-between mb-2">
                                    <span>Price per night</span>
                                    <span className="font-semibold">₹{room.price}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Nights</span>
                                    <span>{nights}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t border-gray-200">
                                    <span>Total</span>
                                    <span>₹{totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold mb-6">Guest Information</h2>

                            {/* Guest Details */}
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="guest.name"
                                        value={formData.guest.name}
                                        onChange={handleChange}
                                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-2">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            type="email"
                                            name="guest.email"
                                            value={formData.guest.email}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="guest.phone"
                                            value={formData.guest.phone}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                                            placeholder="Your phone number"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold mb-6 mt-8">Booking Details</h2>

                            {/* Date Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-2">Check-in Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            type="date"
                                            name="checkIn"
                                            value={formData.checkIn}
                                            onChange={handleChange}
                                            min={formatDate(new Date())}
                                            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Check-out Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            type="date"
                                            name="checkOut"
                                            value={formData.checkOut}
                                            onChange={handleChange}
                                            min={formatDate(new Date(new Date(formData.checkIn).getTime() + 86400000))}
                                            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-gray-700 mb-2">Adults</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <select
                                            name="adults"
                                            value={formData.adults}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                                            required
                                        >
                                            {[1, 2, 3, 4].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-2">Children</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <select
                                            name="children"
                                            value={formData.children}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                                        >
                                            {[0, 1, 2, 3, 4].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                Continue to Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Booking Confirmation Modal */}
            <Modal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Confirm Your Booking</h2>

                    <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-2">Room Details</h3>
                        <p>{room?.name} ({room?.category})</p>
                        <p className="text-gray-600">₹{room?.price} per night</p>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-2">Booking Details</h3>
                        <p><span className="font-medium">Check-in:</span> {new Date(formData.checkIn).toLocaleDateString()}</p>
                        <p><span className="font-medium">Check-out:</span> {new Date(formData.checkOut).toLocaleDateString()}</p>
                        <p><span className="font-medium">Guests:</span> {formData.adults} Adults, {formData.children} Children</p>
                        <p><span className="font-medium">Total:</span> ₹{totalPrice} ({nights} nights)</p>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => setShowConfirmation(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            Edit Details
                        </button>
                        <button
                            onClick={handleConfirmBooking}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Confirm & Pay
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Payment Modal (simplified for demo) */}
            <Modal isOpen={showPayment} onClose={() => { }}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Payment</h2>

                    <div className="mb-6 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                        <span>Processing payment...</span>
                    </div>

                    <div className="flex justify-center">
                        <LoadingSpinner />
                    </div>

                    <p className="text-sm text-gray-500 mt-4 text-center">
                        This is a demo. No actual payment will be processed.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default BookingForm;
