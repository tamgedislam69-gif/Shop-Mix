import React, { useState } from 'react';
import { MessageCircle, Phone, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const WhatsAppButton: React.FC = () => {
  const { settings, products } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const phoneNumber = '8801900000000'; // Replace with real number
  
  // Get current product if on product page
  const productId = location.pathname.split('/product/')[1];
  const currentProduct = products.find(p => p.id === productId);
  
  const message = currentProduct 
    ? `Hello Shop Mix! I'm interested in the "${currentProduct.name}". Can you help me?`
    : 'Hello Shop Mix! I have a general query.';

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl p-4 w-64 border border-gray-100 mb-2"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Direct Support</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-300"><X size={16} /></button>
            </div>
            <div className="space-y-2">
              <a
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-3 bg-[#25D366] text-white rounded-xl font-bold text-sm transition-transform hover:scale-[1.02]"
              >
                <MessageSquare size={18} /> WhatsApp Chat
              </a>
              <a
                href={`tel:${phoneNumber}`}
                className="flex items-center gap-3 w-full p-3 bg-gray-900 text-white rounded-xl font-bold text-sm transition-transform hover:scale-[1.02]"
              >
                <Phone size={18} /> Voice Call
              </a>
            </div>
            <p className="text-[8px] text-center text-gray-400 mt-3 font-bold uppercase tracking-widest">Available 24/7 for you</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={32} />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default WhatsAppButton;
