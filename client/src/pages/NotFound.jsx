import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationCircle, FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <FaExclamationCircle className="h-20 w-20 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaHome className="h-5 w-5 mr-2" />
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
