import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Star, ShieldCheck, Truck, RefreshCcw, Minus, Plus, Heart, Share2, Facebook, Twitter, Link as LinkIcon, XCircle } from 'lucide-react';
import { formatPrice, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { Helmet } from 'react-helmet-async';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, setProducts, addToCart, settings, addToWishlist, removeFromWishlist, isInWishlist, incrementView } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', userName: '' });

  const product = products.find(p => p.id === id);
  const isFavorite = product ? isInWishlist(product.id) : false;

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
          if (product.variants.colors.length > 0) setSelectedColor(product.variants.colors[0].name);
          if (product.variants.sizes.length > 0) setSelectedSize(product.variants.sizes[0].name);
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
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <button onClick={() => navigate('/')} className="text-primary font-bold mt-4">Back to home</button>
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
        <title>{`${product.name} | Shop Mix BD`}</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={`${product.name} - Shop Mix BD`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content="BDT" />
      </Helmet>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative">
            <motion.img 
              key={selectedImage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={selectedImage} 
              alt={product.name} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
            {discount > 0 && (
              <div 
                className="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded bg-red-600 shadow-md"
              >
                FLASH SALE {discount}% OFF
              </div>
            )}
          </div>
          <div className="flex gap-4">
               {[product.image, ...Array(3).fill(product.image)].map((img, i) => (
                   <button 
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={cn(
                        "w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                        selectedImage === img ? "border-primary shadow-md" : "border-gray-100 opacity-60 hover:opacity-100"
                    )}
                    style={{ borderColor: selectedImage === img ? settings.primaryColor : undefined }}
                   >
                       <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   </button>
               ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="space-y-4 pb-6 border-b border-gray-100">
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                {product.name}
            </h1>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold">{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-blue-600 hover:underline cursor-pointer">{product.reviews.length} Ratings</span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-500">{product.views || 0} Views</span>
            </div>
          </div>

          {/* Variants Selectors */}
          {product.variants && (
              <div className="py-6 space-y-6 border-b border-gray-100">
                  {product.variants.colors.length > 0 && (
                      <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Color</label>
                          <div className="flex gap-2">
                              {product.variants.colors.map(c => (
                                  <button
                                      key={c.id}
                                      onClick={() => setSelectedColor(c.name)}
                                      className={cn(
                                          "px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                                          selectedColor === c.name ? "border-primary bg-primary/5" : "border-gray-100 text-gray-400"
                                      )}
                                      style={{ borderColor: selectedColor === c.name ? settings.primaryColor : undefined, color: selectedColor === c.name ? settings.primaryColor : undefined }}
                                  >
                                      {c.name} {c.priceModifier !== 0 && `(${c.priceModifier > 0 ? '+' : ''}${c.priceModifier})`}
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}
                  {product.variants.sizes.length > 0 && (
                      <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Size</label>
                          <div className="flex gap-2">
                              {product.variants.sizes.map(s => (
                                  <button
                                      key={s.id}
                                      onClick={() => setSelectedSize(s.name)}
                                      className={cn(
                                          "px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                                          selectedSize === s.name ? "border-primary bg-primary/5" : "border-gray-100 text-gray-400"
                                      )}
                                      style={{ borderColor: selectedSize === s.name ? settings.primaryColor : undefined, color: selectedSize === s.name ? settings.primaryColor : undefined }}
                                  >
                                      {s.name} {s.priceModifier !== 0 && `(${s.priceModifier > 0 ? '+' : ''}${s.priceModifier})`}
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          )}

          <div className="py-6 space-y-4 border-b border-gray-100">
               <div className="flex items-baseline gap-4">
                    <span className="text-3xl md:text-4xl font-black text-primary" style={{ color: settings.primaryColor }}>
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-400 line-through">
                                {formatPrice(product.originalPrice)}
                            </span>
                            <span className="text-xs font-bold text-gray-600">Saved {formatPrice(product.originalPrice - product.price)}</span>
                        </div>
                    )}
               </div>
               
               <div className="flex items-center gap-4 pt-4">
                   <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                       <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        disabled={quantity <= 1}
                       >
                           <Minus size={16} />
                       </button>
                       <span className="w-12 text-center font-bold">{quantity}</span>
                       <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                       >
                           <Plus size={16} />
                       </button>
                   </div>
                   <span className="text-xs text-gray-500">Only {product.stock} items left in stock!</span>
               </div>
          </div>

          {/* Action Buttons */}
          <div className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    addToCart(product, quantity, selectedColor, selectedSize);
                    navigate('/checkout');
                }}
                className="w-full font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                style={{ 
                    backgroundColor: settings.buyButton.color,
                    color: 'white',
                    padding: settings.buyButton.padding,
                    fontSize: settings.buyButton.fontSize,
                    borderRadius: settings.buyButton.borderRadius
                }}
               >
                 {settings.buyButton.text}
               </motion.button>
               <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product, quantity, selectedColor, selectedSize)}
                className="w-full font-black uppercase tracking-widest border-2 transition-all hover:bg-gray-50"
                style={{ 
                    borderColor: settings.addToCartButton.color,
                    color: settings.addToCartButton.color,
                    padding: settings.addToCartButton.padding,
                    fontSize: settings.addToCartButton.fontSize,
                    borderRadius: settings.addToCartButton.borderRadius
                }}
               >
                 {settings.addToCartButton.text}
               </motion.button>
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-primary" style={{ color: settings.primaryColor }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Genuine Product</span>
              </div>
              <div className="flex items-center gap-3">
                  <Truck size={20} className="text-primary" style={{ color: settings.primaryColor }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Free Delivery</span>
              </div>
              <div className="flex items-center gap-3">
                  <RefreshCcw size={20} className="text-primary" style={{ color: settings.primaryColor }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Easy Returns</span>
              </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
               <div className="flex items-center gap-6">
                   <button 
                    onClick={() => isFavorite ? removeFromWishlist(product.id) : addToWishlist(product)}
                    className={cn(
                        "flex items-center gap-2 text-sm font-bold transition-colors",
                        isFavorite ? "text-red-500" : "text-gray-500 hover:text-red-500"
                    )}
                   >
                       <Heart size={18} className={isFavorite ? "fill-red-500" : ""} /> {isFavorite ? 'Saved in Wishlist' : 'Add to Wishlist'}
                   </button>
                   <div className="flex items-center gap-2">
                       <span className="text-sm text-gray-400">Share:</span>
                       <div className="flex gap-2">
                           <button className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"><Facebook size={14} /></button>
                           <button className="p-2 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-100"><Twitter size={14} /></button>
                           <button className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100"><LinkIcon size={14} /></button>
                       </div>
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
