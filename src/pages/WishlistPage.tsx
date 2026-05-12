import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, addToCart, settings } = useApp();

  if (wishlist.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-6"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <Heart size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Your Wishlist is Empty</h2>
          <p className="text-gray-500">Save items you love to find them easily later.</p>
        </div>
        <Link 
          to="/" 
          className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg ring-4 ring-primary/10"
          style={{ backgroundColor: settings.primaryColor }}
        >
          Explore Shop
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-12"
    >
      <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tight">My Wishlist <span className="text-gray-300 font-medium ml-2">({wishlist.length} Items)</span></h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Saved products for later</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {wishlist.map(product => (
            <motion.div 
              key={product.id}
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden"
            >
              <Link to={`/product/${product.id}`} className="block relative aspect-square">
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    removeFromWishlist(product.id);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </Link>
              
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]" style={{ color: settings.primaryColor }}>{product.name}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{product.category}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black">{formatPrice(product.price)}</span>
                  <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-600">Stock:</span>
                      <span className="text-xs font-black text-green-500">{product.stock}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => addToCart(product)}
                      className="flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-md transition-transform active:scale-95"
                    >
                      <ShoppingCart size={14} /> Add
                    </button>
                    <Link 
                      to={`/product/${product.id}`}
                      className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-200"
                    >
                      View <ArrowRight size={14} />
                    </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default WishlistPage;
