import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Check } from 'lucide-react';
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
      className="product-card overflow-hidden shadow-sm hover:shadow-md transition-all group"
      style={{ borderRadius: `${l?.borderRadius || 8}px` }}
    >
      <Link 
        to={`/product/${product.id}`} 
        className="block relative overflow-hidden bg-gray-100 product-image-container w-full"
        style={{ 
          height: 'var(--img-container-height, var(--prod-img-height, 250px))',
          aspectRatio: 'var(--prod-img-aspect-ratio, 4/5)'
        }}
      >
        {product.videoUrl ? (
          <video 
            src={product.videoUrl || undefined} 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full transition-transform duration-700"
            style={{ objectFit: 'var(--prod-img-fit, cover)' as any }}
          />
        ) : (
          <img 
            src={product.image || undefined} 
            alt={product.name} 
            className="w-full h-full transition-transform duration-500"
            style={{ 
              objectFit: 'var(--prod-img-fit, cover)' as any,
              backgroundColor: settings.customization?.layout?.productImageFit === 'contain' ? '#f9fafb' : 'transparent'
            }}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        )}
        {discount > 0 && v?.discountBadges !== false && (
          <div 
            className="absolute top-3 left-3 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg shadow-black/20"
            style={{ backgroundColor: c?.primary || settings.primaryColor }}
          >
            {discount}% OFF
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {v?.wishlistBtn !== false && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                isFavorite ? removeFromWishlist(product.id) : addToWishlist(product);
              }}
              className={cn(
                 "p-2 rounded-full shadow-lg transition-all backdrop-blur-md",
                 isFavorite ? "bg-primary text-white" : "bg-white/90 text-gray-400 hover:text-primary"
              )}
              style={isFavorite ? { backgroundColor: c?.primary || settings.primaryColor } : {}}
            >
              <Heart size={14} className={isFavorite ? "fill-white" : ""} />
            </button>
          )}
          {v?.shareBtn !== false && (
            <button 
              onClick={copyLink}
              className="p-2 rounded-full bg-white/90 text-gray-400 hover:text-primary shadow-lg transition-all backdrop-blur-md relative"
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
        </div>
      </Link>
      
      <div className="p-4 bg-white">
        <Link to={`/product/${product.id}`} className="block">
          <h3 
            className="text-sm font-black line-clamp-1 mb-1 group-hover:text-primary transition-colors"
            style={{ 
              color: c?.textHeadings || '#111827',
              fontSize: `${settings.customization?.fonts?.sizes?.productTitle || 14}px`
            }}
          >
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-3">
          <span 
            className="font-black leading-none"
            style={{ 
              color: c?.priceColor || c?.primary || settings.primaryColor,
              fontSize: `${settings.customization?.fonts?.sizes?.price || 20}px`
            }}
          >
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] text-gray-400 line-through font-bold">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {v?.starRatings !== false && (
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} className={cn(i < Math.floor(product.rating) ? "fill-orange-400 text-orange-400" : "text-gray-200")} />
                ))}
              </div>
            )}
            <span className="text-[10px] font-bold text-gray-400 ml-1">({product.reviews.length})</span>
          </div>
          {v?.stockInfo !== false && (
            <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest px-2 py-0.5 bg-gray-100 rounded">{t('স্টক', 'Stock')}: {product.stock}</span>
          )}
        </div>

        <button 
          onClick={(e) => {
            e.preventDefault();
            if (product.source === 'alibaba' && product.affiliateLink) {
              window.open(product.affiliateLink, '_blank');
            } else {
              openCheckout(product);
            }
          }}
          className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-xl transition-all duration-500 flex items-center justify-center gap-3 group/btn relative overflow-hidden"
          style={{ 
            backgroundColor: c?.btnPrimaryBg || '#1a1a1a', 
            color: c?.btnPrimaryText || 'white',
            borderRadius: `${l?.buttonRadius || 20}px`
          }}
        >
          <div 
            className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
            style={{ backgroundColor: c?.primary || settings.primaryColor }}
          ></div>
          <span className="relative z-10">{settings.customization?.text?.confirmOrderBtn || t('অর্ডার করুন', 'Order Now')}</span>
          <ShoppingCart size={14} className="relative z-10 group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
