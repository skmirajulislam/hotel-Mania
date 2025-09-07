import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Users, Wifi, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { roomsService } from '../services/api';

interface Room {
  _id: string;
  category: {
    _id: string;
    name: string;
    description: string;
    basePrice: number;
    availableRooms: number;
    id: string;
  } | string; // Support both populated object and string ID
  name: string;
  description: string;
  price: number;
  available?: number;
  total?: number;
  isAvailable?: boolean;
  images: Array<{
    url: string;
    cloudinaryId: string;
    caption: string;
  }>;
  videos?: Array<{
    url: string;
    cloudinaryId: string;
    title: string;
  }>;
  amenities: string[];
}

// Helper function to get category name
const getCategoryName = (category: Room['category']): string => {
  return typeof category === 'object' ? category.name : category;
};

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await roomsService.getAllRooms();
        console.log('API Response:', response); // Debug log
        // Backend returns array directly, not nested in a 'rooms' property
        setRooms(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Failed to load rooms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Add keyboard escape listener for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedRoom) {
        setSelectedRoom(null);
        setCurrentImageIndex(0);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedRoom]);

  // Reset image index when modal opens
  useEffect(() => {
    if (selectedRoom) {
      setCurrentImageIndex(0);
    }
  }, [selectedRoom]);

  // Slideshow navigation functions
  const nextImage = () => {
    if (selectedRoom) {
      const maxImages = Math.min(selectedRoom.images.length, 4);
      setCurrentImageIndex((prev) => (prev + 1) % maxImages);
    }
  };

  const prevImage = () => {
    if (selectedRoom) {
      const maxImages = Math.min(selectedRoom.images.length, 4);
      setCurrentImageIndex((prev) => (prev - 1 + maxImages) % maxImages);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Rooms</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Experience luxury and comfort in our carefully designed rooms
          </p>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No rooms available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <div key={room._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64">
                  {room.videos && room.videos.length > 0 ? (
                    <video
                      src={room.videos[0].url}
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                    />
                  ) : room.images && room.images.length > 0 ? (
                    <img
                      src={room.images[0].url}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {getCategoryName(room.category)}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                    {room.images?.length || 0} Photos
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{room.price} INR</div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">{room.description}</p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>King Size</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>2 Guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wifi className="h-4 w-4" />
                      <span>Free Wi-Fi</span>
                    </div>
                  </div>

                  <div className={`text-sm font-semibold mb-4 ${room.isAvailable ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {room.isAvailable ? 'Available' : 'Not Available'}
                    {room.available && room.total && (
                      <span className="ml-2">({room.available} of {room.total} rooms available)</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedRoom(room)}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="h-5 w-5" />
                      View Full Details
                    </button>

                    <Link
                      to={`/booking/${room._id}`}
                      className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 ${!room.isAvailable || (room.available !== undefined && room.available < 1)
                        ? 'opacity-50 cursor-not-allowed pointer-events-none'
                        : ''
                        }`}
                    >
                      <Bed className="h-5 w-5" />
                      {room.isAvailable && (room.available === undefined || room.available > 0) ? 'Book Now' : 'Fully Booked'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Room Details Modal with Image Slideshow */}
        {selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedRoom(null);
                    setCurrentImageIndex(0);
                  }}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Image Slideshow */}
                <div className="relative">
                  {/* Main Image Display */}
                  <div className="relative h-96 overflow-hidden rounded-t-xl">
                    <img
                      src={selectedRoom.images[currentImageIndex]?.url || ''}
                      alt={`${selectedRoom.name} ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Navigation Arrows */}
                    {selectedRoom.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
                      {currentImageIndex + 1} / {Math.min(selectedRoom.images.length, 4)}
                    </div>
                  </div>

                  {/* Thumbnail Navigation */}
                  {selectedRoom.images.length > 1 && (
                    <div className="flex justify-center gap-2 p-4 bg-gray-50">
                      {selectedRoom.images.slice(0, 4).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`relative h-16 w-20 overflow-hidden rounded-lg border-2 transition-all ${currentImageIndex === index
                            ? 'border-yellow-600 ring-2 ring-yellow-200'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                          <img
                            src={image.url}
                            alt={`${selectedRoom.name} thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Room Details */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">{selectedRoom.name}</h2>
                      <span className="text-yellow-600 font-semibold">
                        {getCategoryName(selectedRoom.category)} Room
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{selectedRoom.price} INR/night</div>
                      <div className={`text-sm font-semibold ${selectedRoom.isAvailable ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {selectedRoom.isAvailable ? 'Available' : 'Not Available'}
                        {selectedRoom.available && selectedRoom.total && (
                          <span className="ml-2">({selectedRoom.available} of {selectedRoom.total} rooms available)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6">{selectedRoom.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">All Amenities</h3>
                      <ul className="space-y-2">
                        {selectedRoom.amenities.map((amenity, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-700">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                            {amenity}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Room Features</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-700">
                          <Bed className="h-5 w-5 text-yellow-600" />
                          <span>King-size bed with premium linens</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <Users className="h-5 w-5 text-yellow-600" />
                          <span>Accommodates up to 2 guests</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <Wifi className="h-5 w-5 text-yellow-600" />
                          <span>Complimentary high-speed Wi-Fi</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-4">
                    <Link
                      to={`/booking/${selectedRoom._id}`}
                      className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 ${!selectedRoom.isAvailable || (selectedRoom.available !== undefined && selectedRoom.available < 1)
                        ? 'opacity-50 cursor-not-allowed pointer-events-none'
                        : ''
                        }`}
                      onClick={() => {
                        setSelectedRoom(null);
                        setCurrentImageIndex(0);
                      }}
                    >
                      <Bed className="h-5 w-5" />
                      {selectedRoom.isAvailable && (selectedRoom.available === undefined || selectedRoom.available > 0) ? 'Book Now' : 'Fully Booked'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rooms;