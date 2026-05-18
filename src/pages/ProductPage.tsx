import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Star, ShieldCheck, Truck, RefreshCcw, Minus, Plus, Heart, Share2, Facebook, Twitter, Link as LinkIcon, XCircle, Users, ShoppingCart, ShoppingBag } from 'lucide-react';
import { formatPrice, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { useTranslate } from '../hooks/useTranslate';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, setProducts, addToCart, settings, addToWishlist, removeFromWishlist, isInWishlist, incrementView, openCheckout } = useApp();
  const { t } = useTranslate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', userName: '' });

  const product = React.useMemo(() => products.find(p => p.id === id), [products, id]);
  const isFavorite = React.useMemo(() => product ? isInWishlist(product.id) : false, [product, isInWishlist]);
  const c = settings.customization?.colors;
  const v = settings.customization?.visibility;
  const l = settings.customization?.layout;

  useEffect(() => {
    // Track product view
    if (id) {
        incrementView(id);
    }
  }, [id]);

  useEffect(() => {
    // Simulate page load
    const timer = setTimeout(() => setLoading(false), 800);
    if (product) {
      setSelectedImage(product.image);
      if (product.variants) {
          if (product.enableColors && product.variants.colors.length > 0) {
              const colors = product.variants.colors[0].name.split(',').map(s => s.trim()).filter(Boolean);
              if (colors.length > 0) setSelectedColor(colors[0]);
          }
          if (product.enableSizes && product.variants.sizes.length > 0) {
              const sizes = product.variants.sizes[0].name.split(',').map(s => s.trim()).filter(Boolean);
              if (sizes.length > 0) setSelectedSize(sizes[0]);
          }
      }
    }
    return () => clearTimeout(timer);
  }, [product, id]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    const review = {
        id: Math.random().toString(36).substr(2, 9),
        ...newReview,
        createdAt: new Date().toISOString()
    };

    setProducts(prev => prev.map(p => 
        p.id === product.id 
            ? { ...p, reviews: [review, ...p.reviews], rating: ((p.rating * p.reviews.length) + newReview.rating) / (p.reviews.length + 1) } 
            : p
    ));
    setShowReviewForm(false);
    setNewReview({ rating: 5, comment: '', userName: '' });
  };

  if (loading) {
      return (
          <div className="container mx-auto px-4 py-8 animate-pulse">
              <div className="bg-white rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="aspect-square bg-gray-100 rounded-2xl" />
                  <div className="space-y-6">
                      <div className="h-10 bg-gray-100 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                      <div className="h-12 bg-gray-100 rounded w-1/4" />
                      <div className="h-48 bg-gray-100 rounded w-full" />
                  </div>
              </div>
          </div>
      )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">{t('পণ্যটি পাওয়া যায়নি', 'Product Not Found')}</h2>
        <button onClick={() => navigate('/')} className="text-primary font-bold mt-4">{t('হোমে ফিরে যান', 'Back to home')}</button>
      </div>
    );
  }

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <Helmet>
        <title>{`${product.name} | ${settings.customization?.text?.websiteName || settings.websiteName}`}</title>
        <meta name="description" content={product.description} />
      </Helmet>
      <div 
        className="bg-white shadow-2xl border border-gray-100 p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-16"
        style={{ borderRadius: `${l?.borderRadius || 24}px` }}
      >
        {/* Gallery */}
        <div className="space-y-6">
          <div 
            className="aspect-square overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative shadow-xl group"
            style={{ borderRadius: `${l?.borderRadius || 32}px` }}
          >
             {product.videoUrl ? (
                <video 
                  src={product.videoUrl || undefined} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <motion.img 
                  key={selectedImage}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={selectedImage || undefined} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                />
              )}
            {discount > 0 && v?.discountBadges !== false && (
              <div 
                className="absolute top-6 left-6 text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl shadow-2xl tracking-[0.1em] uppercase"
                style={{ backgroundColor: c?.primary || settings.primaryColor }}
              >
                SPECIAL {discount}% OFF
              </div>
            )}
          </div>
          <div className="flex gap-4">
               {[product.image, ...Array(3).fill(product.image)].map((img, i) => (
                   <button 
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={cn(
                        "w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all duration-300 transform",
                        selectedImage === img ? "shadow-xl scale-105" : "border-gray-50 opacity-50 hover:opacity-100 hover:border-primary/30"
                    )}
                    style={selectedImage === img ? { borderColor: c?.primary || settings.primaryColor } : {}}
                   >
                       <img loading="lazy" src={img || undefined} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   </button>
               ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="space-y-6 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-orange-50 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg" style={{ color: c?.primary || settings.primaryColor }}>Official Store</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('ক্যাটাগরি', 'Category')}: {product.category}</span>
            </div>
            <h1 
              className="text-3xl md:text-5xl font-black tracking-tighter leading-[1.1]"
              style={{ 
                color: c?.textHeadings || '#1a1a1a',
                fontSize: `${settings.customization?.fonts?.sizes?.productTitle || 36}px`
              }}
            >
                {product.name}
            </h1>
            <div className="flex items-center gap-8">
                {v?.starRatings !== false && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={cn(i < Math.floor(product.rating) ? "fill-orange-400 text-orange-400" : "text-gray-200")} />
                        ))}
                    </div>
                    <span className="text-xs font-black text-[#1a1a1a]">{product.rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <Users size={14} style={{ color: c?.primary || settings.primaryColor }} />
                    {product.views || 0} {t('জন দেখছেন', 'People Watching')}
                </div>
            </div>
          </div>

          {/* Variants Selectors */}
          {product.variants && (
              <div className="py-8 space-y-8 border-b border-gray-100">
                  {product.enableColors && product.variants?.colors && product.variants.colors.length > 0 && (
                      <div className="space-y-4">
                          <div className="text-base font-semibold text-[#1a1a1a] flex items-center gap-2">
                              {t('কালার সিলেক্ট করুন', 'Select Color')} <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: c?.primary || settings.primaryColor }}></div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                              {product.variants.colors.map(colorGroup => {
                                  const individualColors = colorGroup.name.split(',').map(s => s.trim()).filter(Boolean);
                                  return individualColors.map(colorName => (
                                      <button
                                          key={`${colorGroup.id}-${colorName}`}
                                          onClick={() => setSelectedColor(colorName)}
                                          className={cn(
                                              "px-6 py-3 rounded-xl text-sm font-medium uppercase border transition-all duration-200",
                                              selectedColor === colorName 
                                                ? "text-white scale-[1.02] shadow-lg" 
                                                : "bg-[#1a1a1a] text-white border-[#333] hover:border-primary"
                                          )}
                                          style={selectedColor === colorName ? { backgroundColor: c?.primary || settings.primaryColor, borderColor: c?.primary || settings.primaryColor } : {}}
                                      >
                                          {colorName}
                                      </button>
                                  ));
                              })}
                          </div>
                      </div>
                  )}
                  {product.enableSizes && product.variants?.sizes && product.variants.sizes.length > 0 && (
                      <div className="space-y-4">
                          <div className="text-base font-semibold text-[#1a1a1a] flex items-center gap-2">
                              {t('সাইজ সিলেক্ট করুন', 'Select Size')} <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: c?.primary || settings.primaryColor }}></div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                              {product.variants.sizes.map(sizeGroup => {
                                  const individualSizes = sizeGroup.name.split(',').map(s => s.trim()).filter(Boolean);
                                  return individualSizes.map(sizeName => (
                                      <button
                                          key={`${sizeGroup.id}-${sizeName}`}
                                          onClick={() => setSelectedSize(sizeName)}
                                          className={cn(
                                              "px-6 py-3 rounded-xl text-sm font-medium uppercase border transition-all duration-200",
                                              selectedSize === sizeName 
                                                ? "text-white scale-[1.02] shadow-lg" 
                                                : "bg-[#1a1a1a] text-white border-[#333] hover:border-primary"
                                          )}
                                          style={selectedSize === sizeName ? { backgroundColor: c?.primary || settings.primaryColor, borderColor: c?.primary || settings.primaryColor } : {}}
                                      >
                                          {sizeName}
                                      </button>
                                  ));
                              })}
                          </div>
                      </div>
                  )}
              </div>
          )}

          <div className="py-8 space-y-8">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('স্পেশাল ডিসকাউন্ট মূল্য', 'Special Discount Price')}</span>
                        <div className="flex items-baseline gap-4">
                            <span 
                              className="font-black tabular-nums tracking-tighter"
                              style={{ 
                                color: c?.priceColor || c?.primary || settings.primaryColor,
                                fontSize: `${settings.customization?.fonts?.sizes?.price || 48}px`
                              }}
                            >
                                {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                                <span className="text-xl text-gray-400 line-through font-bold tabular-nums">
                                    {formatPrice(product.originalPrice)}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-primary hover:border-primary transition-all"
                                style={{ '--tw-text-opacity': 1, color: c?.primary || settings.primaryColor } as any}
                                disabled={quantity <= 1}
                            >
                                <Minus size={18} />
                            </button>
                            <span className="w-14 text-center font-black text-xl tabular-nums text-[#1a1a1a]">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-primary hover:border-primary transition-all"
                                style={{ '--tw-text-opacity': 1, color: c?.primary || settings.primaryColor } as any}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>
               </div>

               {/* Action Buttons */}
               <div className="grid grid-cols-1 gap-4 pt-6">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (product.source === 'alibaba' && product.affiliateLink) {
                            window.open(product.affiliateLink, '_blank');
                          } else {
                            openCheckout(product);
                          }
                        }}
                        className="w-full py-5 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 relative overflow-hidden group"
                        style={{ 
                          backgroundColor: c?.primary || settings.primaryColor,
                          borderRadius: `${l?.buttonRadius || 24}px`
                        }}
                    >
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative z-10">{settings.customization?.text?.confirmOrderBtn || t('অর্ডার করুন', 'Order Now')}</span>
                      <ShoppingCart size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
                    </motion.button>
               </div>
          </div>

          {/* Delivery Note */}
          <div 
            className="p-6 bg-[#1a1a1a] border border-gray-800 shadow-xl relative overflow-hidden group"
            style={{ borderRadius: `${l?.borderRadius || 32}px` }}
          >
               <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-colors duration-500" style={{ backgroundColor: c?.primary || settings.primaryColor }}></div>
               <div className="relative z-10 flex items-center gap-6">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl"
                      style={{ backgroundColor: c?.primary || settings.primaryColor }}
                    >
                        <Truck size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">{t('সারা বাংলাদেশে দ্রুত ডেলিভারি', 'Fast Delivery Across BD')}</h4>
                        <p className="text-gray-400 text-xs font-bold">{t('ঢাকা: ৭০ টাকা | ঢাকার বাইরে: ১২০ টাকা', 'Dhaka: 70 BDT | Outside: 120 BDT')}</p>
                    </div>
               </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-black uppercase tracking-tight mb-6 border-b border-gray-100 pb-4">Product Details</h2>
          <div className="prose prose-sm max-w-none text-gray-600">
               <div 
                    className="mb-4"
                    dangerouslySetInnerHTML={{ __html: product.description }}
               />
               <h4 className="font-bold text-gray-800 mb-2">Key Specifications:</h4>
               <ul className="list-disc pl-5 space-y-2">
                   <li>Premium grade manufacturing</li>
                   <li>Ergonomic design for maximum comfort</li>
                   <li>High durability and impact resistance</li>
                   <li>Includes luxury packaging box</li>
                   <li>12 Months manufacturer warranty</li>
               </ul>
          </div>
      </div>
      {/* Reviews Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
          <div className="flex justify-between items-center border-b border-gray-100 pb-6">
              <div>
                  <h2 className="text-xl font-black uppercase tracking-tight">Customer Feedbacks</h2>
                  <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                          {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={cn("fill-current", i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-200")} />
                          ))}
                      </div>
                      <span className="text-xs font-bold text-gray-500">{product.rating.toFixed(1)} out of 5</span>
                  </div>
              </div>
              <button 
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-widest shadow-lg"
                style={{ backgroundColor: settings.primaryColor }}
              >
                  Write a Review
              </button>
          </div>

          <AnimatePresence>
              {showReviewForm && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-50 rounded-2xl p-6"
                  >
                      <form onSubmit={handleAddReview} className="space-y-4">
                          <div className="flex justify-between items-center">
                              <h3 className="font-black text-sm uppercase tracking-widest">Share your experience</h3>
                              <button type="button" onClick={() => setShowReviewForm(false)} className="text-gray-400"><XCircle size={18} /></button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input 
                                required
                                placeholder="Your Name"
                                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none"
                                value={newReview.userName}
                                onChange={e => setNewReview({...newReview, userName: e.target.value})}
                              />
                               <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2">
                                  <span className="text-sm font-bold text-gray-400">Rating:</span>
                                  {[1,2,3,4,5].map(rating => (
                                      <button 
                                        key={rating}
                                        type="button"
                                        onClick={() => setNewReview({...newReview, rating})}
                                        className={cn("p-1", newReview.rating === rating ? "text-yellow-400" : "text-gray-200")}
                                      >
                                          <Star size={18} className="fill-current" />
                                      </button>
                                  ))}
                              </div>
                          </div>
                          <textarea 
                            required
                            placeholder="Tell us what you think..."
                            rows={3}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none resize-none"
                            value={newReview.comment}
                            onChange={e => setNewReview({...newReview, comment: e.target.value})}
                          />
                          <button 
                            type="submit"
                            className="w-full py-3 rounded-xl text-white font-black uppercase tracking-widest text-xs"
                            style={{ backgroundColor: settings.primaryColor }}
                          >
                              Submit Review
                          </button>
                      </form>
                  </motion.div>
              )}
          </AnimatePresence>

          <div className="space-y-8">
              {product.reviews.map((review, i) => (
                  <div key={review.id} className="space-y-3 pb-8 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                          <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                  <div className="flex">
                                      {[...Array(5)].map((_, idx) => (
                                          <Star key={idx} size={12} className={cn("fill-current", idx < review.rating ? "text-yellow-400" : "text-gray-200")} />
                                      ))}
                                  </div>
                                  <span className="text-xs font-black uppercase tracking-tight">{review.userName}</span>
                                  <span className="text-green-500 flex items-center gap-1 text-[10px] font-bold uppercase">
                                      <ShieldCheck size={10} /> Verified Buyer
                                  </span>
                              </div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                          {review.comment}
                      </p>
                  </div>
              ))}
              {product.reviews.length === 0 && (
                  <div className="py-12 text-center text-gray-400 italic">No reviews yet. Be the first to review this product!</div>
              )}
          </div>
      </div>
    </motion.div>
  );
};

export default ProductPage;
