import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { ChevronRight, Zap, TrendingUp, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { cn } from '../lib/utils';
import { AnimatePresence } from 'motion/react';
import { useTranslate } from '../hooks/useTranslate';

const FlashSaleTimer: React.FC = () => {
  const { settings, setSettings } = useApp();
  const [timeLeft, setTimeLeft] = useState<{h: string, m: string, s: string} | null>(null);
  const [status, setStatus] = useState<'upcoming' | 'active' | 'ended'>('active');
  const { t } = useTranslate();

  useEffect(() => {
    if (!settings.flashSale?.isEnabled) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(settings.flashSale!.startTime).getTime();
      const end = new Date(settings.flashSale!.endTime).getTime();

      if (now < start) {
        setStatus('upcoming');
        const diff = start - now;
        return formatTime(diff);
      } else if (now > end) {
        setStatus('ended');
        return null;
      } else {
        setStatus('active');
        const diff = end - now;
        return formatTime(diff);
      }
    };

    const formatTime = (ms: number) => {
      const h = Math.floor(ms / (1000 * 60 * 60));
      const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((ms % (1000 * 60)) / 1000);
      return {
        h: h.toString().padStart(2, '0'),
        m: m.toString().padStart(2, '0'),
        s: s.toString().padStart(2, '0')
      };
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.flashSale]);

  useEffect(() => {
    if (status === 'ended' && settings.flashSale?.isEnabled && settings.flashSale?.autoRestart && settings.flashSale?.durationSeconds) {
      const duration = settings.flashSale.durationSeconds;
      const now = new Date();
      const end = new Date(now.getTime() + duration * 1000);
      
      setSettings(prev => ({
        ...prev,
        flashSale: {
          ...prev.flashSale!,
          startTime: now.toISOString(),
          endTime: end.toISOString()
        }
      }));
    }
  }, [status, settings.flashSale?.autoRestart, settings.flashSale?.durationSeconds, settings.flashSale?.isEnabled]);

  if (!settings.flashSale?.isEnabled || settings.customization?.visibility?.flashSaleTimer === false) return null;
  
  if (status === 'ended') {
    return (
      <div className="flex items-center gap-2 mb-6 text-gray-400">
        <Zap size={20} />
        <h3 className="text-xl font-black uppercase tracking-tight">
          {settings.customization?.text?.flashSaleEnded || settings.flashSale.endMessage || t('ফ্ল্যাশ সেল শেষ হয়েছে', 'Flash Sale Ended')}
        </h3>
      </div>
    );
  }

  const isUrgent = status === 'active' && timeLeft && parseInt(timeLeft.h) === 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
       <div className={cn("flex items-center gap-2 transition-colors duration-300", isUrgent ? "text-red-600" : "text-gray-800")}>
          <motion.div
            animate={isUrgent ? { scale: [1, 1.4, 1] } : { scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Zap className={cn("fill-current", isUrgent ? "text-red-500" : "text-orange-500")} />
          </motion.div>
          <h3 className="text-xl font-black uppercase tracking-tight">
            {status === 'upcoming' ? t('শুরু হবে', 'Starts In') : (settings.customization?.text?.flashSaleTitle || t('ফ্ল্যাশ সেল', 'Flash Sale'))}
          </h3>
       </div>
       
       {timeLeft && (
         <div className="flex items-center gap-2">
            {[ 
              { val: timeLeft.h, label: t('ঘণ্টা', 'Hours') }, 
              { val: timeLeft.m, label: t('মিনিট', 'Mins') }, 
              { val: timeLeft.s, label: t('সেকেন্ড', 'Secs') }
            ].map((unit, idx) => (
              <React.Fragment key={unit.label}>
                <div className="flex flex-col items-center">
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={unit.val}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        className={cn(
                          "text-xl md:text-2xl bg-gray-900 text-white px-3 py-2 rounded-lg font-black min-w-[3.5rem] shadow-lg transition-colors duration-300 flex items-center justify-center",
                          isUrgent && "bg-red-600 shadow-red-200"
                        )}
                      >
                          {unit.val}
                      </motion.span>
                    </AnimatePresence>
                    <span className={cn("text-[8px] font-black uppercase mt-1", isUrgent ? "text-red-500" : "text-gray-400")}>
                      {unit.label}
                    </span>
                </div>
                {idx < 2 && (
                  <span className={cn("text-gray-800 font-bold self-start mt-2", isUrgent && "text-red-600")}>:</span>
                )}
              </React.Fragment>
            ))}
         </div>
       )}
    </div>
  );
};

const HomePage: React.FC = () => {
  const { products, settings, searchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useTranslate();
  const vis = settings.customization?.visibility;
  const layout = settings.customization?.layout;
  const carousel = settings.customization?.carousel;

  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Carousel Logic
  useEffect(() => {
    if (!carousel?.isEnabled || !carousel?.urls || carousel.urls.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carousel.urls.length);
    }, (carousel.duration || 5) * 1000);

    return () => clearInterval(interval);
  }, [carousel]);

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
        <title>{settings.customization?.text?.websiteName || settings.logoText} | {t('বাংলাদেশের সেরা ই-কমার্স প্ল্যাটফর্ম', "Bangladesh's Most Elegant Shopping Destination")}</title>
        <meta name="description" content="Shop Mix Online BD - Discover premium tech, fashion, and lifestyle products." />
        <meta property="og:title" content={settings.customization?.text?.websiteName || settings.logoText} />
      </Helmet>

      {/* Hero Section */}
      {vis?.heroBanner !== false && (
        <section 
          className="relative overflow-hidden" 
          style={{ 
            height: `${layout?.heroHeight || 600}px`,
            padding: `${layout?.heroPadding || 40}px 0`
          }}
        >
          {/* Carousel Background */}
          <div className="absolute inset-0">
             <AnimatePresence mode="wait">
               <motion.div 
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.6, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute inset-0"
               >
                  {carousel?.urls && carousel.urls.length > 0 ? (
                    <img loading="lazy" 
                      src={carousel.urls[currentSlide] || undefined} 
                      className="w-full h-full object-cover"
                      alt="Banner"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <video 
                      autoPlay 
                      muted 
                      loop 
                      playsInline
                      className="w-full h-full object-cover opacity-60 scale-105"
                    >
                      <source src={settings.heroVideoUrl || undefined} type="video/mp4" />
                    </video>
                  )}
               </motion.div>
             </AnimatePresence>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

          <div className="container mx-auto px-6 h-full relative z-10 flex flex-col justify-center items-center text-center">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-6 max-w-4xl"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mx-auto">
                   <Zap size={14} className="text-yellow-400 fill-yellow-400" /> {t('প্রিমিয়াম শপিং অভিজ্ঞতা', 'Premium Shopping Experience')}
                </div>
                <h2 className="text-4xl md:text-8xl font-black text-white uppercase leading-[0.9] tracking-tighter mix-blend-difference">
                  {settings.customization?.text?.heroTitle || settings.heroText}
                </h2>
                <p className="text-sm md:text-xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
                  {settings.heroSubtext}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    {vis?.shopCollectionBtn !== false && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="py-4 px-10 font-black uppercase tracking-widest rounded-full shadow-2xl transition-all text-sm md:text-base"
                        style={{ 
                          backgroundColor: settings.customization?.colors?.primary || settings.primaryColor,
                          color: 'white'
                        }}
                      >
                        {settings.customization?.text?.shopCollectionBtn || t('কালেকশন দেখুন', 'Shop Collection')}
                      </motion.button>
                    )}
                    {vis?.learnMoreBtn !== false && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="py-4 px-10 font-black uppercase tracking-widest rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm md:text-base hover:bg-white/20 transition-all"
                      >
                        {settings.customization?.text?.learnMoreBtn || t('আরও জানুন', 'Learn More')}
                      </motion.button>
                    )}
                </div>
              </motion.div>
          </div>

          {/* Carousel Pagination */}
          {carousel?.urls && carousel.urls.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
               {carousel.urls.map((_, idx) => (
                 <button 
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={cn(
                    "w-8 h-1 rounded-full transition-all duration-500",
                    currentSlide === idx ? "bg-white w-12" : "bg-white/30"
                  )}
                 />
               ))}
            </div>
          )}
        </section>
      )}

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100 py-4 hidden md:block">
        <div className="container mx-auto px-4 grid grid-cols-4 gap-4">
          <div className="flex items-center gap-3 justify-center border-r border-gray-100">
            <ShieldCheck className="text-primary" style={{ color: settings.customization?.colors?.primary || settings.primaryColor }} />
            <div>
               <p className="text-sm font-bold text-gray-800">{t('আসল পণ্য', 'Genuine Products')}</p>
               <p className="text-[10px] text-gray-500">{t('১০০% আসল পণ্যের গ্যারান্টি', '100% authentic guarantee')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center border-r border-gray-100">
            <Truck className="text-primary" style={{ color: settings.customization?.colors?.primary || settings.primaryColor }} />
            <div>
               <p className="text-sm font-bold text-gray-800">{t('ফাস্ট ডেলিভারি', 'Fast Delivery')}</p>
               <p className="text-[10px] text-gray-500">{t('২৪-৪৮ ঘণ্টার মধ্যে', 'Within 24-48 hours')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center border-r border-gray-100">
            <RefreshCcw className="text-primary" style={{ color: settings.customization?.colors?.primary || settings.primaryColor }} />
            <div>
               <p className="text-sm font-bold text-gray-800">{t('সহজ রিটার্ন', 'Easy Return')}</p>
               <p className="text-[10px] text-gray-500">{t('৭ দিনের মধ্যে রিটার্ন', '7 days easy return')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Zap className="text-yellow-500" />
            <div>
               <p className="text-sm font-bold text-gray-800">{t('সেরা মূল্য', 'Best Price')}</p>
               <p className="text-[10px] text-gray-500">{t('সব সময় সাশ্রয়ী', 'Always competitive')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="w-full px-4 py-8 md:py-12" style={{ paddingLeft: `${settings.customization?.layout?.containerPadding || 16}px`, paddingRight: `${settings.customization?.layout?.containerPadding || 16}px` }}>
        
        {/* Categories Bar */}
        {vis?.categoryTabs !== false && (
          <div className="container mx-auto flex items-baseline justify-between mb-8 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-2 md:gap-4 flex-nowrap">
              {['All', ...CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all border",
                    selectedCategory === cat 
                      ? 'shadow-sm text-white' 
                      : 'text-gray-600 bg-white border-gray-200 hover:border-primary'
                  )}
                  style={selectedCategory === cat ? { backgroundColor: settings.customization?.colors?.categoryTabActiveBg || settings.primaryColor, borderColor: settings.customization?.colors?.categoryTabActiveBg || settings.primaryColor } : {}}
                >
                  {cat === 'All' ? t('সব', 'All') : cat}
                </button>
              ))}
            </div>
            <Link to="/" className="text-primary text-sm font-bold hidden md:flex items-center gap-1" style={{ color: settings.customization?.colors?.primary || settings.primaryColor }}>
              {t('সব দেখুন', 'View All')} <ChevronRight size={16} />
            </Link>
          </div>
        )}

        {/* Flash Sale Header */}
        {vis?.flashSaleSection !== false && <FlashSaleTimer />}

        {/* Product Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 lg:gap-6"
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
              className="py-3 px-10 border-2 border-gray-200 font-bold rounded-lg hover:bg-gray-100 transition-colors uppercase text-xs tracking-widest text-gray-500"
            >
              {t('আরও পণ্য লোড করুন', 'Load More Products')}
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
                        <TrendingUp size={14} /> {t('ট্রেন্ডিং এখন', 'Trending Now')}
                    </span>
                    <h4 className="text-3xl font-black mb-4 uppercase">{t('নতুন জুতার কালেকশন', 'New Sneaker Arrivals')}</h4>
                    <button className="text-sm font-bold border-b-2 border-white self-start pb-1">{t('কালেকশন দেখুন', 'Shop Collection')}</button>
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
                    <span className="text-xs font-bold uppercase tracking-widest mb-2">{t('এডিটরের পছন্দ', "Editor's Choice")}</span>
                    <h4 className="text-3xl font-black mb-4 uppercase">{t('প্রয়োজনীয় এক্সেসরিজ', 'Essential Accessories')}</h4>
                    <button className="text-sm font-bold border-b-2 border-white self-start pb-1">{t('আরও দেখুন', 'Explore More')}</button>
                </div>
            </div>
        </section>

      </div>
    </motion.div>
  );
};

export default HomePage;
