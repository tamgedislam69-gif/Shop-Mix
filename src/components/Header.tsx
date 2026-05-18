import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut, Heart, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useTranslate } from '../hooks/useTranslate';

const Header: React.FC = () => {
  const { 
    cart, 
    settings, 
    isAdmin, 
    logout, 
    searchQuery, 
    setSearchQuery, 
    setIsSettingsOpen, 
    isMenuOpen, 
    setIsMenuOpen 
  } = useApp();
  
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinAction, setPinAction] = useState<'menu' | 'admin' | 'settings' | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslate();

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = localStorage.getItem('drawer_pin') || '112233';
    if (pinInput === storedPin) {
      if (pinAction === 'menu') {
        setIsMenuOpen(true);
      } else if (pinAction === 'admin') {
        navigate('/secret-admin-access');
        setIsMenuOpen(false);
      } else if (pinAction === 'settings') {
        setIsSettingsOpen(true);
        setIsMenuOpen(false);
      }
      setShowPinModal(false);
      setPinInput('');
      setPinAction(null);
    } else {
      alert('ভুল পিন কোড! (Wrong PIN!)');
    }
  };

  const handleAdminClick = (e: React.MouseEvent, action: 'admin' | 'settings') => {
    if (isAdmin) {
      if (action === 'admin') navigate('/secret-admin-access');
      else setIsSettingsOpen(true);
      setIsMenuOpen(false);
      return;
    }
    
    setPinAction(action);
    setShowPinModal(true);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const v = settings.customization?.visibility;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
    setIsMobileSearchOpen(false);
  };

  return (
    <header 
      className="relative z-50 shadow-sm border-b"
      style={{ 
        backgroundColor: settings.customization?.colors?.headerBg || 'white',
        borderColor: settings.customization?.colors?.cardBorder || '#f1f1f1',
        height: `${settings.customization?.layout?.headerHeight || 80}px`
      }}
    >
      {/* PIN Modal Overlay */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPinModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-black" />
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Settings className="w-8 h-8 text-black opacity-20" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-1">পাসওয়ার্ড দিন</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Authorization Required</p>
              </div>
              
              <form onSubmit={handlePinSubmit} className="space-y-6">
                <div className="relative">
                  <input 
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••••"
                    autoFocus
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 px-6 text-center text-3xl font-black tracking-[12px] focus:ring-0 focus:border-black outline-none transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[2px] hover:shadow-xl active:scale-95 transition-all"
                  >
                    Authorize
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Top Bar */}
      <div className="bg-gray-100 hidden md:block border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-1 flex justify-between text-[10px] uppercase font-black tracking-widest text-gray-500">
          <div className="flex gap-4">
            <Link to="/track-order" className="hover:text-primary transition-colors">{t('অর্ডার ট্র্যাক করুন', 'Track Order')}</Link>
            <span>{t('কাস্টমার কেয়ার', 'Customer Care')}</span>
          </div>
          <div className="flex gap-4">
             {isAdmin ? (
               <div className="flex gap-4">
                 <Link to="/secret-admin-access" className="hover:text-primary font-bold">Panel</Link>
                 <button 
                   onClick={() => setIsSettingsOpen(true)}
                   className="hover:text-primary flex items-center gap-1 font-bold"
                 >
                   <Settings size={12} /> Settings
                 </button>
                 <button onClick={() => { logout(); navigate('/'); }} className="hover:text-primary flex items-center gap-1">
                   <LogOut size={12} /> Logout
                 </button>
               </div>
             ) : (
               <Link to="/login" className="hover:text-primary">{t('অ্যাডমিন অ্যাক্সেস', 'Admin Access')}</Link>
             )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 h-full flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 -ml-2 transition-colors relative z-[51]"
          style={{ color: settings.customization?.colors?.headerText || '#111827' }}
          onClick={() => {
            if (isMenuOpen) {
              setIsMenuOpen(false);
              return;
            }
            const isPinEnabled = localStorage.getItem('is_drawer_pin_enabled') === 'true'; // Only if explicitly enabled
            if (isPinEnabled) {
              setPinAction('menu');
              setShowPinModal(true);
            } else {
              setIsMenuOpen(true);
            }
          }}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <h1 
            className="text-xl md:text-2xl font-black tracking-tighter" 
            style={{ color: settings.customization?.colors?.primary || settings.primaryColor }}
          >
            {settings.customization?.text?.websiteName || settings.logoText}
          </h1>
        </Link>

        {/* Search Bar */}
        {v?.searchBar !== false && (
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-grow max-w-2xl relative"
          >
            <input
              type="text"
              placeholder={t('Shop Mix এ খুঁজুন...', 'Search in Shop Mix...')}
              className="w-full bg-gray-100 border-none rounded-md py-2 px-4 focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-0 top-0 h-full px-4 rounded-r-md text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: settings.customization?.colors?.primary || settings.primaryColor }}
            >
              <Search size={20} />
            </button>
          </form>
        )}

        {/* Icons */}
        <div className="flex items-center gap-3 md:gap-6">
          {v?.wishlistBtn !== false && (
            <Link to="/wishlist" className="hidden md:flex flex-col items-center hover:text-primary transition-colors" style={{ color: settings.customization?.colors?.headerText || '#374151' }}>
              <Heart size={24} />
              <span className="text-[10px] font-black uppercase mt-1 tracking-widest">{t('উইশলিস্ট', 'Wishlist')}</span>
            </Link>
          )}
          {isAdmin && (
            <Link to="/secret-admin-access" className="hidden md:flex flex-col items-center hover:text-primary transition-colors" style={{ color: settings.customization?.colors?.headerText || '#374151' }}>
              <User size={24} />
              <span className="text-[10px] font-black uppercase mt-1 tracking-widest">{t('ড্যাশবোর্ড', 'Dashboard')}</span>
            </Link>
          )}
          {v?.searchBar !== false && (
            <button 
              className="md:hidden"
              style={{ color: settings.customization?.colors?.headerText || '#111827' }}
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
               <Search size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-3">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder={t('Shop Mix এ খুঁজুন...', 'Search in Shop Mix...')}
                  className="w-full bg-gray-100 border-none rounded-md py-3 px-4 pr-12 focus:ring-2 focus:ring-primary outline-none font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-primary transition-colors"
                >
                  <Search size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <h1 className="text-xl font-black uppercase tracking-tight" style={{ color: settings.customization?.colors?.primary || settings.primaryColor }}>
                  {settings.customization?.text?.websiteName || settings.logoText}
                </h1>
                <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <nav className="flex flex-col gap-4 text-xs font-black uppercase tracking-widest">
                  <Link to="/" onClick={() => setIsMenuOpen(false)}>{t('হোম', 'Home')}</Link>
                  {v?.wishlistBtn !== false && <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>{t('উইশলিস্ট', 'Wishlist')}</Link>}
                  <Link to="/track-order" onClick={() => setIsMenuOpen(false)}>{t('অর্ডার ট্র্যাক করুন', 'Track Order')}</Link>
                  <Link to="/cart" onClick={() => setIsMenuOpen(false)}>{t('আমার কার্ট', 'My Cart')}</Link>
                  
                  <hr className="border-gray-100 my-2" />
                  
                  <button 
                    onClick={(e) => handleAdminClick(e, 'admin')}
                    className="text-left font-black text-xs uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    {t('অ্য্যাডমিন ড্যাশবোর্ড', 'Admin Dashboard')}
                  </button>
                  
                  <button 
                    onClick={(e) => handleAdminClick(e, 'settings')}
                    className="text-left flex items-center gap-2 hover:text-primary transition-colors font-black text-xs uppercase tracking-widest"
                  >
                     <Settings size={16} /> {t('সব সেটিংস', 'All Process Settings')}
                  </button>

                  {isAdmin && (
                    <button 
                      className="text-left py-2 text-red-500 font-bold uppercase text-[10px] tracking-widest"
                      onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}
                    >
                      Logout
                    </button>
                  )}
                </nav>
                
                <div className="pt-6 border-top border-gray-100 text-xs text-gray-500 font-bold uppercase tracking-widest">
                  <p>{t('যোগাযোগ করুন', 'Contact Us')}</p>
                  <p>+8801771357329</p>
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
