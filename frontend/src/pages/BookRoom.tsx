import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Check, ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

interface Room {
    _id: string;
    number: string;
    type: string;
    category: string;
    price: number;
    capacity: number;
    amenities: string[];
    images: string[];
    description: string;
    available: boolean;
}

interface Package {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    services: string[];
    duration: number;
}

interface Service {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    duration: number;
    available: boolean;
}

const BookRoom: React.FC = () => {
    const [step, setStep] = useState(1);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [bookingData, setBookingData] = useState({
        checkIn: '',
        checkOut: '',
        guests: 1,
        selectedRoom: null as Room | null,
        selectedPackages: [] as Package[],
        selectedServices: [] as Service[],
        specialRequests: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch rooms
            const roomsResponse = await fetch(`${API_BASE_URL}/api/rooms`, { headers });
            if (roomsResponse.ok) {
                const roomsData = await roomsResponse.json();
                setRooms(roomsData.data || []);
            }

            // Fetch packages
            const packagesResponse = await fetch(`${API_BASE_URL}/api/packages`, { headers });
            if (packagesResponse.ok) {
                const packagesData = await packagesResponse.json();
                setPackages(packagesData.data || []);
            }

            // Fetch services
            const servicesResponse = await fetch(`${API_BASE_URL}/api/services`, { headers });
            if (servicesResponse.ok) {
                const servicesData = await servicesResponse.json();
                setServices(servicesData.data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load booking data');
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
        setBookingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const selectRoom = (room: Room) => {
        setBookingData(prev => ({
            ...prev,
            selectedRoom: room
        }));
        setStep(2);
    };

    const togglePackage = (pkg: Package) => {
        setBookingData(prev => ({
            ...prev,
            selectedPackages: prev.selectedPackages.some(p => p._id === pkg._id)
                ? prev.selectedPackages.filter(p => p._id !== pkg._id)
                : [...prev.selectedPackages, pkg]
        }));
    };

    const toggleService = (service: Service) => {
        setBookingData(prev => ({
            ...prev,
            selectedServices: prev.selectedServices.some(s => s._id === service._id)
                ? prev.selectedServices.filter(s => s._id !== service._id)
                : [...prev.selectedServices, service]
        }));
    };

    const calculateTotal = () => {
        const roomPrice = bookingData.selectedRoom?.price || 0;
        const packagesPrice = bookingData.selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);
        const servicesPrice = bookingData.selectedServices.reduce((sum, service) => sum + service.price, 0);

        const nights = bookingData.checkIn && bookingData.checkOut
            ? Math.max(1, Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
            : 1;

        return (roomPrice * nights) + packagesPrice + servicesPrice;
    };

    const handleBooking = async () => {
        if (!bookingData.selectedRoom || !bookingData.checkIn || !bookingData.checkOut) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    room: bookingData.selectedRoom._id,
                    checkIn: bookingData.checkIn,
                    checkOut: bookingData.checkOut,
                    guests: bookingData.guests,
                    packages: bookingData.selectedPackages.map(p => p._id),
                    services: bookingData.selectedServices.map(s => s._id),
                    specialRequests: bookingData.specialRequests
                })
            });

            const data = await response.json();

            if (data.success) {
                navigate('/dashboard');
            } else {
                setError(data.error || 'Booking failed');
            }
        } catch (error) {
            console.error('Booking error:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && rooms.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
                                className="mr-4 p-2 text-gray-400 hover:text-gray-500"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Book a Room</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-xl font-bold text-yellow-600">${calculateTotal()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Step Indicator */}
                <div className="mb-8">
                    <div className="flex items-center">
                        {[1, 2, 3].map((stepNumber) => (
                            <React.Fragment key={stepNumber}>
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= stepNumber ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {step > stepNumber ? <Check className="h-5 w-5" /> : stepNumber}
                                </div>
                                {stepNumber < 3 && (
                                    <div className={`flex-1 h-1 mx-2 ${step > stepNumber ? 'bg-yellow-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-600">Room & Dates</span>
                        <span className="text-sm text-gray-600">Packages & Services</span>
                        <span className="text-sm text-gray-600">Confirmation</span>
                    </div>
                </div>

                {/* Step 1: Room Selection */}
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Date Selection */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Dates and Guests</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Check-in Date
                                    </label>
                                    <input
                                        type="date"
                                        value={bookingData.checkIn}
                                        onChange={(e) => handleDateChange('checkIn', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Check-out Date
                                    </label>
                                    <input
                                        type="date"
                                        value={bookingData.checkOut}
                                        onChange={(e) => handleDateChange('checkOut', e.target.value)}
                                        min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Number of Guests
                                    </label>
                                    <select
                                        value={bookingData.guests}
                                        onChange={(e) => setBookingData(prev => ({ ...prev, guests: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        {[1, 2, 3, 4, 5, 6].map(num => (
                                            <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Room Selection */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Room</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rooms.filter(room => room.available).map((room) => (
                                    <div key={room._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                        {room.images && room.images.length > 0 && (
                                            <img
                                                src={room.images[0]}
                                                alt={`Room ${room.number}`}
                                                className="w-full h-48 object-cover"
                                            />
                                        )}
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Room {room.number}
                                                </h3>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-yellow-600">${room.price}</p>
                                                    <p className="text-sm text-gray-500">per night</p>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mb-2">{room.type} - {room.category}</p>
                                            <p className="text-sm text-gray-600 mb-3">{room.description}</p>

                                            <div className="flex items-center mb-3">
                                                <Users className="h-4 w-4 text-gray-400 mr-1" />
                                                <span className="text-sm text-gray-600">Up to {room.capacity} guests</span>
                                            </div>

                                            {room.amenities && room.amenities.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {room.amenities.slice(0, 3).map((amenity, index) => (
                                                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                {amenity}
                                                            </span>
                                                        ))}
                                                        {room.amenities.length > 3 && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                +{room.amenities.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => selectRoom(room)}
                                                disabled={!bookingData.checkIn || !bookingData.checkOut}
                                                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Select Room
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Packages and Services */}
                {step === 2 && (
                    <div className="space-y-6">
                        {/* Selected Room Summary */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Room</h2>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium">Room {bookingData.selectedRoom?.number}</h3>
                                    <p className="text-gray-600">{bookingData.selectedRoom?.type} - {bookingData.selectedRoom?.category}</p>
                                    <p className="text-sm text-gray-500">
                                        {bookingData.checkIn} to {bookingData.checkOut} • {bookingData.guests} guest{bookingData.guests > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">${bookingData.selectedRoom?.price} per night</p>
                                </div>
                            </div>
                        </div>

                        {/* Packages */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Packages (Optional)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {packages.map((pkg) => (
                                    <div
                                        key={pkg._id}
                                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${bookingData.selectedPackages.some(p => p._id === pkg._id)
                                            ? 'border-yellow-500 bg-yellow-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => togglePackage(pkg)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                                            <div className="text-right">
                                                <p className="font-bold text-yellow-600">${pkg.price}</p>
                                                <p className="text-xs text-gray-500">{pkg.duration} hours</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                                        <div className="flex items-center">
                                            <Package className="h-4 w-4 text-gray-400 mr-1" />
                                            <span className="text-xs text-gray-500">{pkg.category}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Services */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Services (Optional)</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {services.filter(service => service.available).map((service) => (
                                    <div
                                        key={service._id}
                                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${bookingData.selectedServices.some(s => s._id === service._id)
                                            ? 'border-yellow-500 bg-yellow-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => toggleService(service)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-gray-900">{service.name}</h3>
                                            <p className="font-bold text-yellow-600">${service.price}</p>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                        <p className="text-xs text-gray-500">{service.category} • {service.duration} min</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                            >
                                Continue to Confirmation
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h2>

                            {/* Room Details */}
                            <div className="border-b border-gray-200 pb-4 mb-4">
                                <h3 className="font-medium text-gray-900 mb-2">Room Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Room</p>
                                        <p className="font-medium">Room {bookingData.selectedRoom?.number}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Type</p>
                                        <p className="font-medium">{bookingData.selectedRoom?.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Check-in</p>
                                        <p className="font-medium">{bookingData.checkIn}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Check-out</p>
                                        <p className="font-medium">{bookingData.checkOut}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Packages */}
                            {bookingData.selectedPackages.length > 0 && (
                                <div className="border-b border-gray-200 pb-4 mb-4">
                                    <h3 className="font-medium text-gray-900 mb-2">Selected Packages</h3>
                                    {bookingData.selectedPackages.map((pkg) => (
                                        <div key={pkg._id} className="flex justify-between text-sm">
                                            <span>{pkg.name}</span>
                                            <span>${pkg.price}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Services */}
                            {bookingData.selectedServices.length > 0 && (
                                <div className="border-b border-gray-200 pb-4 mb-4">
                                    <h3 className="font-medium text-gray-900 mb-2">Selected Services</h3>
                                    {bookingData.selectedServices.map((service) => (
                                        <div key={service._id} className="flex justify-between text-sm">
                                            <span>{service.name}</span>
                                            <span>${service.price}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Special Requests */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Special Requests (Optional)
                                </label>
                                <textarea
                                    value={bookingData.specialRequests}
                                    onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    placeholder="Any special requests or preferences..."
                                />
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span className="text-yellow-600">${calculateTotal()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleBooking}
                                disabled={loading}
                                className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Booking...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookRoom;
