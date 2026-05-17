import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Check, Eye } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatPrice, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslate } from '../hooks/useTranslate';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, settings, addToWishlist, removeFromWishlist, isInWishlist, openCheckout } = useApp();
  const [copied, setCopied] = useState(false);
  const { t } = useTranslate();

  const isFavorite = isInWishlist(product.id);
  const c = settings.customization?.colors;
  const v = settings.customization?.visibility;
  const l = settings.customization?.layout;

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const copyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="product-card overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl transition-all group bg-white flex flex-col h-full border border-gray-100"
      style={{ borderRadius: `${l?.borderRadius || 16}px` }}
    >
      <Link 
        to={`/product/${product.id}`} 
        className="block relative overflow-hidden bg-gray-50 w-full aspect-square"
      >
        {product.videoUrl ? (
          <video 
            src={product.videoUrl || undefined} 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <img 
            src={product.image || undefined} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {discount > 0 && v?.discountBadges !== false && (
            <div 
              className="text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm"
              style={{ backgroundColor: c?.primary || settings.primaryColor }}
            >
              {discount}% OFF
            </div>
          )}
        </div>
        
        {/* Share Button (Optional Overlay) */}
        {v?.shareBtn !== false && (
          <button 
            onClick={copyLink}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-gray-400 hover:text-gray-900 shadow-sm transition-all backdrop-blur-md opacity-0 group-hover:opacity-100"
          >
            <AnimatePresence>
              {copied ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-green-500 rounded-full text-white"
                >
                  <Check size={12} />
                </motion.div>
              ) : (
                <Share2 size={14} />
              )}
            </AnimatePresence>
          </button>
        )}
      </Link>
      
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <Link to={`/product/${product.id}`} className="block mb-2 mt-1">
            <h3 
              className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors leading-[1.4]"
              style={{ 
                color: c?.textHeadings || '#111827',
                fontSize: `${settings.customization?.fonts?.sizes?.productTitle || 14}px`
              }}
            >
              {product.name}
            </h3>
          </Link>

          {/* Ratings & Stock (Optional) */}
          <div className="flex items-center justify-between mb-3">
            {v?.starRatings !== false ? (
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={cn(i < Math.floor(product.rating) ? "fill-orange-400 text-orange-400" : "text-gray-200")} />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-gray-400">({product.reviews.length})</span>
              </div>
            ) : <div />}
            {v?.stockInfo !== false && (
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest bg-gray-50 px-2 py-0.5 rounded">
                {product.stock} Left
              </span>
            )}
          </div>
          
          <div className="flex items-end gap-2 mb-4">
            <span 
              className="font-black leading-none tracking-tight"
              style={{ 
                color: c?.priceColor || c?.primary || settings.primaryColor,
                fontSize: `${settings.customization?.fonts?.sizes?.price || 18}px`
              }}
            >
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through font-bold mb-[1px]">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* 3 Action Icons Row */}
        <div className="grid grid-cols-5 gap-2 mt-auto">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              isFavorite ? removeFromWishlist(product.id) : addToWishlist(product);
            }}
            className={cn(
              "col-span-1 py-3 rounded-xl flex items-center justify-center transition-all border shrink-0",
              isFavorite ? "border-red-100 bg-red-50 text-red-500" : "bg-white border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50"
            )}
            title={t('উইশলিস্ট', 'Wishlist')}
          >
            <Heart size={16} className={isFavorite ? "fill-current" : ""} />
          </button>

          <Link
            to={`/product/${product.id}`}
            className="col-span-1 py-3 rounded-xl flex items-center justify-center transition-all border border-gray-100 bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50 shrink-0"
            title={t('বিস্তারিত দেখুন', 'Quick View')}
          >
            <Eye size={16} />
          </Link>

          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (product.source === 'alibaba' && product.affiliateLink) {
                window.open(product.affiliateLink, '_blank');
              } else {
                openCheckout(product);
              }
            }}
            className="col-span-3 py-3 rounded-xl flex items-center justify-center gap-2 text-white text-[11px] font-black uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            style={{ backgroundColor: c?.primary || settings.primaryColor }}
            title={t('কার্টে যোগ করুন', 'Add to Cart')}
          >
             <ShoppingCart size={14} /> Buy
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
