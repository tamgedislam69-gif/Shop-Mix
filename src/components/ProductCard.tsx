import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Share2, Check } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { formatPrice, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, settings, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
  const [copied, setCopied] = useState(false);

  const isFavorite = isInWishlist(product.id);

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
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-gray-100"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {discount > 0 && (
          <div 
            className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-1 rounded"
            style={{ backgroundColor: settings.primaryColor }}
          >
            -{discount}%
          </div>
        )}
        <button 
          onClick={(e) => {
            e.preventDefault();
            isFavorite ? removeFromWishlist(product.id) : addToWishlist(product);
          }}
          className={cn(
             "absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-all z-10",
             isFavorite ? "bg-red-500 text-white" : "bg-white text-gray-400 hover:text-red-500"
          )}
        >
          <Heart size={14} className={isFavorite ? "fill-white" : ""} />
        </button>
        <button 
          onClick={copyLink}
          className="absolute top-10 right-2 p-1.5 bg-white text-gray-400 hover:text-blue-500 rounded-full shadow-sm transition-all z-10"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
        </button>
      </Link>
      
      <div className="p-3">
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-sm text-gray-800 line-clamp-2 min-h-[2.5rem] hover:text-primary transition-colors mb-1 font-medium">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex flex-col mb-2">
          <span className="text-lg font-bold text-gray-900 leading-none" style={{ color: settings.primaryColor }}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
            <span className="text-[10px] text-gray-400">({product.reviews.length})</span>
          </div>
          
          <button 
            onClick={() => addToCart(product)}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:text-white transition-colors animate-pulse hover:animate-none"
            style={{ 
               backgroundColor: 'transparent',
               borderColor: settings.addToCartButton.color,
               borderWidth: '0px'
            }}
             onMouseEnter={(e) => {
               (e.currentTarget as any).style.backgroundColor = settings.primaryColor;
               (e.currentTarget as any).style.color = 'white';
             }}
             onMouseLeave={(e) => {
               (e.currentTarget as any).style.backgroundColor = 'transparent';
               (e.currentTarget as any).style.color = '#4b5563';
             }}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
