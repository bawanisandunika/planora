import { Calendar, Mail, Phone, MapPin, Heart, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#4B2E2B] text-[#FFF8F0] relative overflow-hidden">
      {/* Decorative Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C08552] via-[#8C5A3C] to-[#C08552]"></div>
      
      {/* Background glowing effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#C08552] rounded-full mix-blend-screen opacity-5 blur-3xl filter translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8C5A3C] rounded-full mix-blend-screen opacity-10 blur-3xl filter -translate-x-1/2 translate-y-1/3 pointer-events-none"></div>

      <div className="relative z-10 px-6 py-16 mx-auto max-w-7xl sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          
          {/* Brand & About */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link to="/" className="flex items-center space-x-3 mb-6 group inline-flex">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#C08552] to-[#8C5A3C] shadow-lg shadow-[#8C5A3C]/40 transform group-hover:scale-105 transition-all duration-300">
                <Calendar className="w-6 h-6 text-[#FFF8F0]" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[#FFF8F0]">Planora</span>
            </Link>
            <p className="max-w-md text-[#FFF8F0]/70 leading-relaxed text-sm md:text-base mb-8">
              Your premium event management platform. We bridge the gap between visionaries and eager attendees, ensuring every event leaves a massive impact.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 lg:col-span-4 flex md:justify-center">
            <div>
              <h3 className="mb-6 text-lg font-bold tracking-wide uppercase text-[#C08552] flex items-center">
                Explore
              </h3>
              <ul className="flex flex-col space-y-3">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Events', path: '/events' },
                  { name: 'About Us', path: '/about' },
                  { name: 'Contact Us', path: '/contact' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="inline-flex items-center text-[#FFF8F0]/70 transition-colors duration-300 hover:text-[#C08552] group"
                    >
                      <ChevronRight className="w-4 h-4 mr-2 text-[#C08552] opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-4 lg:col-span-4">
            <h3 className="mb-6 text-lg font-bold tracking-wide uppercase text-[#C08552]">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-4">
                <div className="mt-1 p-2 rounded-lg bg-[#8C5A3C]/20 border border-[#8C5A3C]/30 text-[#C08552]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#FFF8F0]/50 uppercase tracking-wider mb-1">Email</p>
                  <a href="mailto:support@planora.com" className="text-[#FFF8F0]/90 transition-colors hover:text-[#C08552]">
                    support@planora.com
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <div className="mt-1 p-2 rounded-lg bg-[#8C5A3C]/20 border border-[#8C5A3C]/30 text-[#C08552]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#FFF8F0]/50 uppercase tracking-wider mb-1">Phone</p>
                  <a href="tel:+94112345678" className="text-[#FFF8F0]/90 transition-colors hover:text-[#C08552]">
                    +94 11 234 5678
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <div className="mt-1 p-2 rounded-lg bg-[#8C5A3C]/20 border border-[#8C5A3C]/30 text-[#C08552]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#FFF8F0]/50 uppercase tracking-wider mb-1">Location</p>
                  <span className="text-[#FFF8F0]/90">
                    Colombo, Sri Lanka
                  </span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 mt-16 border-t border-[#8C5A3C]/30">
          <p className="text-[#FFF8F0]/50 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Planora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}