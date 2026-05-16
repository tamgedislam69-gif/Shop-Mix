import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

const BackToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const { settings } = useApp();

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    onClick={scrollToTop}
                    className="fixed bottom-24 right-6 p-4 bg-white text-gray-900 shadow-2xl z-50 hover:shadow-primary/20 transition-all border border-gray-100"
                    style={{ 
                        color: settings.customization?.colors?.primary || settings.primaryColor,
                        borderRadius: `${settings.customization?.layout?.buttonRadius || 32}px`,
                        boxShadow: `0 10px 25px -5px ${settings.customization?.colors?.primary || settings.primaryColor}20` 
                    }}
                >
                    <ArrowUp size={24} />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
