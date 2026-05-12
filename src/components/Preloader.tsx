import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

const Preloader: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { settings } = useApp();

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10000] bg-white flex flex-col items-center justify-center gap-6"
                >
                    <div className="relative">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 rounded-full border-4 border-gray-100"
                            style={{ borderTopColor: settings.primaryColor }}
                        />
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0.5 }}
                            animate={{ scale: 1.1, opacity: 1 }}
                            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <span className="text-sm font-black uppercase tracking-tighter" style={{ color: settings.primaryColor }}>
                                MIX
                            </span>
                        </motion.div>
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900">Shop Mix</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Loading Perfection...</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;
