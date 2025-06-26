import React from 'react';
import { FaHeart, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <FaHeart className="h-6 w-6 text-blue-300" />
              <span className="ml-2 text-xl font-semibold">HealthHub</span>
            </div>
            <p className="mt-3 text-white leading-relaxed text-sm">
              Connecting Kenyans with quality healthcare providers. Your health journey starts here.
            </p>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/public" className="text-white hover:text-blue-300 transition-colors duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="/clinics" className="text-white hover:text-blue-300 transition-colors duration-200">
                  Find Clinics
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-3">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-white">
                <FaEnvelope className="h-4 w-4 mr-2 text-blue-300" />
                support@HealthHub.co.ke
              </li>
              <li className="flex items-center text-white">
                <FaPhone className="h-4 w-4 mr-2 text-blue-300" />
                0700 123 456 
              </li>
              <li className="flex items-center text-white">
                <FaPhone className="h-4 w-4 mr-2 text-blue-300" />
                +254 700 123 456 
              </li>
              <li className="flex items-center text-white">
                <FaMapMarkerAlt className="h-4 w-4 mr-2 text-blue-300" />
                Upper Hill, Nairobi, Kenya
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-3">Health Alerts</h3>
            <p className="text-white mb-3 text-sm">
              Subscribe for Health updates and alerts.
            </p>
            <form className="flex">
              <input
                type="tel"
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 rounded-l-md bg-gray-800 border border-gray-700 text-gray-300 text-sm focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-blue-400 text-white rounded-r-md hover:bg-blue-500 transition-colors duration-200 text-sm"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-white text-xs">
          <p>&copy; {new Date().getFullYear()} HealthHub Kenya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;