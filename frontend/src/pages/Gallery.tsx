
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { galleryService } from '../services/api';

interface GalleryItem {
  _id: string;
  type: 'image' | 'video';
  category: string;
  url: string;
  caption: string;
}

const Gallery: React.FC = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const response = await galleryService.getAllGalleryItems();
        console.log('Gallery API Response:', response); // Debug log
        setGallery(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error('Error fetching gallery:', error);
        setError('Failed to load gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Add keyboard escape listener for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedItem) {
        setSelectedItem(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedItem]);

  // No need to fetch, using local data

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'exterior', name: 'Exterior' },
    { id: 'rooms', name: 'Rooms' },
    { id: 'dining', name: 'Dining' },
    { id: 'amenities', name: 'Amenities' },
  ];

  const filteredGallery = selectedCategory === 'all'
    ? gallery
    : gallery.filter(item => item.category === selectedCategory);

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

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Photo Gallery</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the beauty and elegance of Grand Hotel through our collection of stunning photographs showcasing our facilities, rooms, and amenities.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${selectedCategory === category.id
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGallery.map((item) => (
            <div
              key={item._id}
              className="group relative cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              onClick={() => setSelectedItem(item)}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                    <p className="font-semibold">Click to view</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <p className="text-white text-sm font-medium">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Image Modal */}
        {selectedItem && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              // Close modal when clicking on backdrop
              if (e.target === e.currentTarget) {
                setSelectedItem(null);
              }
            }}
          >
            <div className="relative max-w-4xl w-full">
              {/* Close Button - Enhanced visibility */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-200 border border-white border-opacity-30"
                title="Close (Press Esc)"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Image */}
              <div className="relative">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.caption}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
                  <h3 className="text-white text-xl font-semibold mb-2">{selectedItem.caption}</h3>
                  <p className="text-gray-300 text-sm capitalize">
                    Category: {selectedItem.category.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hotel Features Section */}
        <div className="mt-20 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Experience Grand Hotel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Luxury Accommodations</h3>
              <p className="text-gray-600 text-sm">Premium rooms and suites designed for ultimate comfort</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍽️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fine Dining</h3>
              <p className="text-gray-600 text-sm">World-class cuisine from renowned chefs</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏊‍♀️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Recreation</h3>
              <p className="text-gray-600 text-sm">Pool, fitness center, and wellness facilities</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Premium Service</h3>
              <p className="text-gray-600 text-sm">24/7 concierge and personalized attention</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;