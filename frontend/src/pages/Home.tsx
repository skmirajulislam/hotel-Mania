import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bed, UtensilsCrossed, Phone, Star, Wifi, Car, Dumbbell, Coffee } from 'lucide-react';

interface Testimonial {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const API_BASE_URL = 'https://hotel-mania-two.vercel.app/api';

const Home: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/testimonials`);
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data.slice(0, 3)); // Show only 3 testimonials
        } else {
          // Fallback to empty array if API fails
          setTestimonials([]);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1600")'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Welcome to <span className="text-yellow-400">Grand Hotel</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 animate-fade-in-delay">
            Experience luxury, comfort, and unparalleled service in the heart of the city
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
            <Link
              to="/auth"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Book Now
            </Link>
            <Link
              to="/rooms"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              View Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Explore Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link to="/rooms" className="group">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <Bed className="h-12 w-12 text-yellow-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Luxurious Rooms</h3>
                <p className="text-gray-600 mb-4">Choose from our Standard, Premium, and Luxury accommodations, each designed for ultimate comfort.</p>
                <span className="text-yellow-600 font-semibold group-hover:underline">Explore Rooms →</span>
              </div>
            </Link>

            <Link to="/restaurant" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <UtensilsCrossed className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Fine Dining</h3>
                <p className="text-gray-600 mb-4">Savor exquisite cuisine from our world-class chefs with fresh, locally-sourced ingredients.</p>
                <span className="text-blue-600 font-semibold group-hover:underline">View Menu →</span>
              </div>
            </Link>

            <Link to="/contact" className="group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <Phone className="h-12 w-12 text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h3>
                <p className="text-gray-600 mb-4">Get in touch for reservations, inquiries, or special requests. We're here to help 24/7.</p>
                <span className="text-green-600 font-semibold group-hover:underline">Contact Info →</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">World-Class Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-white p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow duration-300">
                <Wifi className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Free Wi-Fi</h3>
              <p className="text-gray-600 text-sm">High-speed internet throughout</p>
            </div>

            <div className="text-center group">
              <div className="bg-white p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow duration-300">
                <Car className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Valet Parking</h3>
              <p className="text-gray-600 text-sm">Complimentary parking service</p>
            </div>

            <div className="text-center group">
              <div className="bg-white p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow duration-300">
                <Dumbbell className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Fitness Center</h3>
              <p className="text-gray-600 text-sm">24/7 state-of-the-art gym</p>
            </div>

            <div className="text-center group">
              <div className="bg-white p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow duration-300">
                <Coffee className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Room Service</h3>
              <p className="text-gray-600 text-sm">24-hour dining service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">What Our Guests Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              // Loading state
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl animate-pulse">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-5 w-5 bg-gray-300 rounded mr-1"></div>
                    ))}
                  </div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))
            ) : testimonials.length > 0 ? (
              // Display fetched testimonials
              testimonials.map((testimonial) => (
                <div key={testimonial._id} className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
                  <p className="font-semibold text-gray-900">- {testimonial.name}</p>
                </div>
              ))
            ) : (
              // Fallback content if no testimonials
              <div className="col-span-full text-center text-gray-600">
                <p>No testimonials available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;