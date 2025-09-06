
import React, { useState, useEffect } from 'react';
import { Bed, Users, Wifi, Eye, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { roomsService } from '../services/api';

interface Room {
  _id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  available: number;
  total: number;
  images: string[];
  videos?: string[];
  amenities: string[];
}

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string>('');

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

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log rooms data
  console.log('Rooms data:', rooms);
  console.log('Rooms length:', rooms.length);

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Luxury Accommodations</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our three distinct room categories: Standard, Premium, and Luxury. Each category offers unique amenities and unparalleled comfort for your perfect stay.
          </p>
        </div>

        {/* Debug info */}
        {rooms.length === 0 && (
          <div className="text-center mb-8">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
              No rooms available. Debug: Rooms array length is {rooms.length}
            </div>
          </div>
        )}

        {/* Room Categories */}
        <div className="space-y-16">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-8 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{room.category} Rooms</h2>
                    <p className="text-yellow-100 text-lg">{room.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{room.price} INR</div>
                    <div className="text-yellow-100">per night</div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Availability Status */}
                <div className="mb-6 p-4 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Room Availability</h3>
                      <p className="text-gray-600">Total rooms in this category: {room.total}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${room.available > 5 ? 'text-green-600' :
                        room.available > 0 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                        {room.available} Available
                      </div>
                      <div className={`text-sm font-medium ${room.available > 5 ? 'text-green-600' :
                        room.available > 0 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                        {room.available > 5 ? 'Good Availability' :
                          room.available > 0 ? 'Limited Availability' :
                            'Fully Booked'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Room Images */}
                  <div className="space-y-4">
                    <div className="relative h-64 overflow-hidden rounded-lg">
                      {room.videos && room.videos.length > 0 ? (
                        <video
                          src={room.videos[0]}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          controls
                          muted
                        />
                      ) : (
                        <img
                          src={room.images[0]}
                          alt={room.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      )}
                    </div>
                    {room.images[1] && (
                      <div className="relative h-32 overflow-hidden rounded-lg">
                        <img
                          src={room.images[1]}
                          alt={`${room.name} view 2`}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                  </div>

                  {/* Room Details */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{room.description}</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Amenities</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {room.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center gap-2 text-gray-700">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 space-y-3">
                      <button
                        onClick={() => setSelectedRoom(room)}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Eye className="h-5 w-5" />
                        View Full Details
                      </button>

                      <a
                        href={`/booking/${room._id}`}
                        className={`w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 ${room.available < 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                          }`}
                      >
                        <Bed className="h-5 w-5" />
                        {room.available > 0 ? 'Book Now' : 'Fully Booked'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Room Details Modal */}
        {selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                {/* Close Button */}
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <X className="h-6 w-6" />
                </button>

                {/* Media Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  {/* Display videos first if available */}
                  {selectedRoom.videos && selectedRoom.videos.map((video, index) => (
                    <div key={`video-${index}`} className="relative h-64 overflow-hidden rounded-lg">
                      <video
                        src={video}
                        className="w-full h-full object-cover"
                        controls
                        muted
                      />
                    </div>
                  ))}

                  {/* Then display images */}
                  {selectedRoom.images.map((image, index) => (
                    <div key={`image-${index}`} className="relative h-64 overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`${selectedRoom.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Room Details */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">{selectedRoom.name}</h2>
                      <span className="text-yellow-600 font-semibold">{selectedRoom.category} Room</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{selectedRoom.price} INR/night</div>
                      <div className={`text-sm font-semibold ${selectedRoom.available > 5 ? 'text-green-600' :
                        selectedRoom.available > 0 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                        {selectedRoom.available} of {selectedRoom.total} rooms available
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