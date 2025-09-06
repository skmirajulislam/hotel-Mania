import React from 'react';
import { MapPin, Phone, Mail, Clock, Wifi, Car, Dumbbell, Coffee } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help make your stay unforgettable. Reach out to us for reservations, inquiries, or any special requests.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                  <p className="text-gray-600">
                    Mondlai , Pandua<br />
                    Hooghly , 712146<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Phone Numbers</h3>
                  <p className="text-gray-600">
                    Main: +91 6294516326<br />
                    Reservations: +91 8536086205<br />
                    Concierge: +91 7586982149
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">
                    General: souramoys@gmail.com<br />
                    Reservations: souramoy.shee.work@gmail.com<br />
                    Events: ssouramoy@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Reception Hours</h3>
                  <p className="text-gray-600">
                    24/7 Front Desk Service<br />
                    Check-in: 2:00 PM<br />
                    Check-out: 11:00 AM
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Services */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Services</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Wifi className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm">Free Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Car className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm">Valet Parking</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Dumbbell className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm">Fitness Center</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Coffee className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm">24/7 Room Service</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-full min-h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14601.867036336365!2d88.27886361822713!3d23.07806519369911!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f8f22c52312f91%3A0x33c46572a7c77f96!2sPandua%2C%20West%20Bengal%20712149!5e0!3m2!1sen!2sin!4v1691750706434!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '500px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Grand Hotel Location"
              />
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Send us a Message</h2>
          <form className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                  placeholder="Your first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                  placeholder="Your last name"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                id="subject"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
              >
                <option value="">Select a subject</option>
                <option value="reservation">Room Reservation</option>
                <option value="dining">Restaurant Inquiry</option>
                <option value="events">Event Planning</option>
                <option value="complaint">Complaint or Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors"
                placeholder="Please tell us how we can help you..."
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 transform hover:scale-105"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-4">Need Immediate Assistance?</h2>
          <p className="text-xl mb-6">Our 24/7 concierge team is always ready to help</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+918240203182"
              className="bg-white text-yellow-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Call Now: +91 8240203182
            </a>
            <a
              href="mailto:souramoys@gmail.com"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-yellow-700 transition-colors duration-200"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;