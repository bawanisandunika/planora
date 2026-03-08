
import { Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="text-white bg-gray-900">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4 space-x-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Planora</span>
            </div>
            <p className="max-w-md mb-4 text-gray-300">
              Your premier event management platform. Create, discover, and attend amazing events 
              with smart recommendations and seamless management tools.
            </p>
            
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Navigation</h3>
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="text-gray-300 transition-colors hover:text-white"
              >
                Home
              </Link>
              <Link
                to="/events"
                className="text-gray-300 transition-colors hover:text-white"
              >
                Events
              </Link>
              <Link
                to="/about"
                className="text-gray-300 transition-colors hover:text-white"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-gray-300 transition-colors hover:text-white"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">support@planora.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">+94 11 234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Colombo, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 text-center border-t border-gray-800">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Planora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}