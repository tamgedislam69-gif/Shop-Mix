import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut, Heart, SearchCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const Header: React.FC = () => {
  const { cart, settings, isAdmin, logout } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would filter products or navigate to search page
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
      {/* Top Bar */}
      <div className="bg-gray-100 hidden md:block border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-1 flex justify-between text-xs text-gray-600">
          <div className="flex gap-4">
            <Link to="/track-order" className="hover:text-primary transition-colors">Track Order</Link>
            <span>Customer Care</span>
          </div>
          <div className="flex gap-4">
             {isAdmin ? (
               <div className="flex gap-4">
                 <Link to="/secret-admin-access" className="hover:text-primary font-bold">Panel</Link>
                 <button onClick={() => { logout(); navigate('/'); }} className="hover:text-primary flex items-center gap-1">
                   <LogOut size={12} /> Logout
                 </button>
               </div>
             ) : (
               <Link to="/login" className="hover:text-primary">Admin Access</Link>
             )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 -ml-2 text-gray-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tighter" style={{ color: settings.primaryColor }}>
            {settings.logoText} <span className="text-gray-800">Online</span>
          </h1>
        </Link>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearch}
          className="hidden md:flex flex-grow max-w-2xl relative"
        >
          <input
            type="text"
            placeholder="Search in Shop Mix..."
            className="w-full bg-gray-100 border-none rounded-md py-2 px-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-0 top-0 h-full px-4 rounded-r-md text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <Search size={20} />
          </button>
        </form>

        {/* Icons */}
        <div className="flex items-center gap-3 md:gap-6">
          <Link to="/wishlist" className="hidden md:flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
            <Heart size={24} />
            <span className="text-[10px] font-medium uppercase mt-1">Wishlist</span>
          </Link>
          {isAdmin && (
            <Link to="/secret-admin-access" className="hidden md:flex flex-col items-center text-gray-600 hover:text-primary transition-colors">
              <User size={24} />
              <span className="text-[10px] font-medium uppercase mt-1">Dashboard</span>
            </Link>
          )}
          <Link to="/cart" className="relative group p-2">
            <ShoppingCart size={24} className="text-gray-700 group-hover:text-primary transition-colors" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-0 right-0 h-5 w-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button className="md:hidden text-gray-700">
             <Search size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 p-6 md:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold" style={{ color: settings.primaryColor }}>{settings.logoText}</h1>
                <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <nav className="flex flex-col gap-4 text-lg font-medium">
                  <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
                  <Link to="/track-order" onClick={() => setIsMenuOpen(false)}>Track Order</Link>
                  <Link to="/cart" onClick={() => setIsMenuOpen(false)}>My Cart</Link>
                  {isAdmin ? (
                    <>
                      <Link to="/secret-admin-access" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                      <button 
                        className="text-left py-2 text-red-500 font-bold"
                        onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Admin Login</Link>
                  )}
                </nav>
                
                <div className="pt-6 border-top border-gray-100 text-sm text-gray-500">
                  <p>Contact Us</p>
                  <p>+880 1234567890</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
