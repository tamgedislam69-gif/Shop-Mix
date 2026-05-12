import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Footer: React.FC = () => {
  const { settings } = useApp();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tighter">
            {settings.logoText} <span className="text-gray-400">Online</span>
          </h2>
          <p className="text-sm leading-relaxed">
            Your premium destination for the latest electronics, fashion, and home essentials in Bangladesh. Quality products, lightning-fast delivery.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors"><Facebook size={20} /></a>
            <a href="#" className="hover:text-primary transition-colors"><Instagram size={20} /></a>
            <a href="#" className="hover:text-primary transition-colors"><Twitter size={20} /></a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Help Center</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">How to Buy</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">My Shopping Cart</Link></li>
            <li><Link to="/checkout" className="hover:text-white transition-colors">Checkout Process</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Contact Info</h3>
          <div className="flex items-start gap-3 text-sm">
            <MapPin size={18} className="text-primary mt-1 flex-shrink-0" style={{ color: settings.primaryColor }} />
            <span>Bashundhara R/A, Block C, Road 18, Dhaka, Bangladesh</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone size={18} className="text-primary flex-shrink-0" style={{ color: settings.primaryColor }} />
            <span>+880 1900 000 000</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail size={18} className="text-primary flex-shrink-0" style={{ color: settings.primaryColor }} />
            <span>support@shopmixbd.com</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <p>© 2026 Shop Mix Online BD. All Rights Reserved.</p>
        <div className="flex gap-4">
          <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-6 opacity-80" />
          <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-6 opacity-80" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Bkash_logo.png/512px-Bkash_logo.png" alt="bKash" className="h-6 opacity-80 object-contain" />
          <span className="bg-gray-800 px-2 py-1 rounded text-[10px]">CASH ON DELIVERY</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
