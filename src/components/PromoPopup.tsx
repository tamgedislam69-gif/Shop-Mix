import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Sparkles, Copy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PromoPopup: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const { settings } = useApp();

    useEffect(() => {
        const hasSeenPopup = sessionStorage.getItem('sm_promo_seen');
        if (!hasSeenPopup) {
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem('sm_promo_seen', 'true');
            }, 3000); // Show after 3 seconds
            return () => clearTimeout(timer);
        }
    }, []);

    const copyCode = () => {
        navigator.clipboard.writeText('WELCOME20');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="relative bg-white rounded-[2.5rem] overflow-hidden w-full max-w-lg shadow-2xl"
                    >
                        {/* Design Elements */}
                        <div 
                            className="h-32 flex items-center justify-center relative overflow-hidden"
                            style={{ backgroundColor: settings.primaryColor }}
                        >
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                                <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                            </div>
                            <Sparkles className="text-white relative z-10 animate-pulse" size={48} />
                        </div>

                        <div className="p-10 text-center space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900">
                                    Special Offer!
                                </h2>
                                <p className="text-gray-500 font-medium">
                                    Get <span className="text-primary font-black" style={{ color: settings.primaryColor }}>20% OFF</span> on your first order with this exclusive coupon code.
                                </p>
                            </div>

                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center gap-4 group hover:border-primary/50 transition-all">
                                <span className="text-4xl font-black tracking-[0.2em] text-gray-800">WELCOME20</span>
                                <button 
                                    onClick={copyCode}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all"
                                    style={{ backgroundColor: settings.primaryColor }}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </button>
                            </div>

                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                                Valid for new customers only • Ends in 24 hours
                            </p>

                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PromoPopup;
