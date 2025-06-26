import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaClock} from 'react-icons/fa';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative min-h-[80vh] flex items-center"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/3376790/pexels-photo-3376790.jpeg?auto=compress&cs=tinysrgb&w=1920')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="bg-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
              Your Health, Our Priority
            </h1>
            <p className="text-xl mb-8 text-blue-100 leading-relaxed">
              Connect with trusted healthcare providers who understand your needs. Find specialists, read reviews, and make informed decisions about your health journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/clinics" 
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaSearch className="h-5 w-5 mr-2" />
                Find a Clinic
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose HealthHub?</h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              We're revolutionizing how you connect with healthcare providers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <FaSearch className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Find the perfect healthcare provider based on specialty, location, and insurance coverage.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 -rotate-3">
                <FaStar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Verified Reviews</h3>
              <p className="text-gray-600 leading-relaxed">
                Make confident decisions with authentic patient reviews and detailed ratings.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <FaClock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Planning</h3>
              <p className="text-gray-600 leading-relaxed">
                View service details, pricing, and estimated duration for better planning.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">Healthcare Providers</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-white mb-2">50k+</div>
              <div className="text-blue-100">Patient Reviews</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-blue-100">Specialties</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-blue-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 md:p-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Are you a healthcare provider?
                </h2>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Join HealthHub to expand your reach and provide better care to more patients. Our platform helps you showcase your expertise and build trust.
                </p>
            
              </div>
              <div className="relative">
                <img 
                  src="https://images.pexels.com/photos/7088530/pexels-photo-7088530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Healthcare professional"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-900/10" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
