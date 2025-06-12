import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ClinicFlow. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
              Privacy
            </Link>
            <Link to="/help" className="text-sm text-gray-500 hover:text-gray-900">
              Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 