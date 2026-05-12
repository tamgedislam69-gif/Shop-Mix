import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { ChevronRight, Zap, TrendingUp, ShieldCheck, Truck, RefreshCcw, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const HomePage: React.FC = () => {
  const { products, settings } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-16"
    >
      <Helmet>
        <title>Shop Mix | Bangladesh's Most Elegant Shopping Destination</title>
        <meta name="description" content="Shop Mix Online BD - Discover premium tech, fashion, and lifestyle products." />
        <meta property="og:title" content="Shop Mix BD" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" />
      </Helmet>
      {/* Video Hero Section */}
      <section className="relative h-[400px] md:h-[650px] bg-black overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        >
          <source src={settings.heroVideoUrl} type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

        <div className="container mx-auto px-6 h-full relative z-10 flex flex-col justify-center items-center text-center">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-6 max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mx-auto">
                 <Zap size={14} className="text-yellow-400 fill-yellow-400" /> Premium Shopping Experience
              </div>
              <h2 className="text-4xl md:text-8xl font-black text-white uppercase leading-[0.9] tracking-tighter mix-blend-difference">
                {settings.heroText}
              </h2>
              <p className="text-sm md:text-xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
                {settings.heroSubtext}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-4 px-10 font-black uppercase tracking-widest rounded-full shadow-2xl transition-all text-sm md:text-base"
                    style={{ 
                      backgroundColor: settings.primaryColor,
                      color: 'white'
                    }}
                  >
                    Shop Collection
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    className="py-4 px-10 font-black uppercase tracking-widest rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm md:text-base hover:bg-white/20 transition-all"
                  >
                    Learn More
                  </motion.button>
              </div>
            </motion.div>
        </div>

        {/* Floating Icons Decal */}
        <div className="absolute bottom-12 right-12 hidden lg:flex flex-col gap-6 items-center">
            <div className="w-1 h-24 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                    animate={{ y: [0, 96, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-full h-8 bg-white"
                />
            </div>
            <span className="text-[8px] font-black uppercase text-white tracking-[0.5em] rotate-90 whitespace-nowrap mt-4">Scroll Explorer</span>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100 py-4 hidden md:block">
        <div className="container mx-auto px-4 grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3 justify-center border-r border-gray-100">
            <ShieldCheck className="text-primary" style={{ color: settings.primaryColor }} />
            <div>
               <p className="text-sm font-bold text-gray-800">Genuine Products</p>
               <p className="text-[10px] text-gray-500">100% authentic guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center border-r border-gray-100">
            <Truck className="text-primary" style={{ color: settings.primaryColor }} />
            <div>
               <p className="text-sm font-bold text-gray-800">Fast Delivery</p>
               <p className="text-[10px] text-gray-500">Within 24-48 hours</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center border-r border-gray-100">
            <RefreshCcw className="text-primary" style={{ color: settings.primaryColor }} />
            <div>
               <p className="text-sm font-bold text-gray-800">Easy Return</p>
               <p className="text-[10px] text-gray-500">7 days money back</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Zap className="text-yellow-500" />
            <div>
               <p className="text-sm font-bold text-gray-800">Best Price</p>
               <p className="text-[10px] text-gray-500">Always competitive</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        
        {/* Categories Bar */}
        <div className="flex items-baseline justify-between mb-8 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-2 md:gap-4 flex-nowrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all border ${
                  selectedCategory === cat 
                    ? 'shadow-sm text-white' 
                    : 'text-gray-600 bg-white border-gray-200 hover:border-primary'
                }`}
                style={selectedCategory === cat ? { backgroundColor: settings.primaryColor, borderColor: settings.primaryColor } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
          <Link to="/" className="text-primary text-sm font-bold hidden md:flex items-center gap-1" style={{ color: settings.primaryColor }}>
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {/* Flash Sale Header */}
        <div className="flex items-center gap-2 mb-6 text-gray-800">
           <Zap className="fill-orange-500 text-orange-500 animate-bounce" />
           <h3 className="text-xl font-black uppercase tracking-tight">Flash Sale</h3>
           <div className="flex items-center gap-2 ml-4">
              <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded font-bold">12</span>
              <span className="text-gray-800">:</span>
              <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded font-bold">45</span>
              <span className="text-gray-800">:</span>
              <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded font-bold">08</span>
           </div>
        </div>

        {/* Product Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-6"
        >
          {filteredProducts.map(product => (
            <motion.div key={product.id} variants={item}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Load More Mock */}
        <div className="mt-12 text-center">
            <button 
              className="py-3 px-10 border-2 border-gray-200 font-bold rounded hover:bg-gray-100 transition-colors uppercase text-sm tracking-widest text-gray-600"
            >
              Load More Products
            </button>
        </div>

        {/* Trending Section Hero */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group overflow-hidden rounded-2xl h-[200px] md:h-[300px]">
                <img 
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop" 
                  alt="Trending" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8 text-white">
                    <span className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingUp size={14} /> Trending Now
                    </span>
                    <h4 className="text-3xl font-black mb-4 uppercase">New Sneaker Arrivals</h4>
                    <button className="text-sm font-bold border-b-2 border-white self-start pb-1">Shop Collection</button>
                </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl h-[200px] md:h-[300px]">
                <img 
                  src="https://images.unsplash.com/photo-1555529669-e69e730f162b?w=1000&auto=format&fit=crop" 
                  alt="Lifestyle" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8 text-white">
                    <span className="text-xs font-bold uppercase tracking-widest mb-2">Editor's Choice</span>
                    <h4 className="text-3xl font-black mb-4 uppercase">Essential Accessories</h4>
                    <button className="text-sm font-bold border-b-2 border-white self-start pb-1">Explore More</button>
                </div>
            </div>
        </section>

      </div>
    </motion.div>
  );
};

export default HomePage;
