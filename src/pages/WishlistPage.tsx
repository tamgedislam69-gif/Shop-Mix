import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslate } from '../hooks/useTranslate';

const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, addToCart, settings } = useApp();
  const { t } = useTranslate();

  const c = settings.customization?.colors;
  const l = settings.customization?.layout;

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
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">{t('আপনার উইশলিস্ট খালি', 'Your Wishlist is Empty')}</h2>
          <p className="text-gray-500">{t('আপনার পছন্দের পণ্যগুলো পরে সহজে খুঁজে পেতে সেভ করে রাখুন।', 'Save items you love to find them easily later.')}</p>
        </div>
        <Link 
          to="/" 
          className="px-10 py-4 text-white font-black uppercase tracking-widest shadow-lg"
          style={{ 
            backgroundColor: c?.primary || settings.primaryColor,
            borderRadius: `${l?.buttonRadius || 12}px`
          }}
        >
          {t('মার্কেটে ফিরে জান', 'Explore Shop')}
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
          <h1 className="text-3xl font-black uppercase tracking-tight">{t('আমার উইশলিস্ট', 'My Wishlist')} <span className="text-gray-300 font-medium ml-2">({wishlist.length} {t('টি আইটেম', 'Items')})</span></h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('পরবর্তী সময়ের জন্য সংরক্ষিত পণ্য', 'Saved products for later')}</p>
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
              className="bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden"
              style={{ borderRadius: `${l?.borderRadius || 16}px` }}
            >
              <Link to={`/product/${product.id}`} className="block relative aspect-square">
                <img loading="lazy" src={product.image || undefined} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
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
                  <h3 
                    className="font-bold line-clamp-2 min-h-[3rem]"
                    style={{ color: c?.textHeadings || '#111827' }}
                  >
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{t('ক্যাটাগরি', 'Category')}: {product.category}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xl font-black"
                    style={{ color: c?.priceColor || c?.primary || settings.primaryColor }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-600">{t('স্টক:', 'Stock:')}</span>
                      <span className="text-xs font-black text-green-500">{product.stock}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => addToCart(product)}
                      className="flex items-center justify-center gap-2 py-3 text-white text-xs font-black uppercase tracking-widest shadow-md transition-transform active:scale-95"
                      style={{ 
                        backgroundColor: c?.primary || settings.primaryColor,
                        borderRadius: `${l?.buttonRadius || 8}px`
                      }}
                    >
                      <ShoppingCart size={14} /> {t('অ্যাড', 'Add')}
                    </button>
                    <Link 
                      to={`/product/${product.id}`}
                      className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-gray-200"
                      style={{ borderRadius: `${l?.buttonRadius || 8}px` }}
                    >
                      {t('দেখুন', 'View')} <ArrowRight size={14} />
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
