import React from 'react';
import { ShoppingCart, X, Plus, Minus, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const FloatingCart: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { cart, removeFromCart, updateCartQuantity, settings } = useApp();
    const navigate = useNavigate();
    
    if (settings.customization?.visibility?.cartFloat === false) return null;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    const c = settings.customization?.colors;
    const l = settings.customization?.layout;

    if (count === 0) return null;

    return (
        <div className="fixed bottom-24 right-6 z-[60]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-20 right-0 w-[320px] glass rounded-[2.5rem] shadow-2xl p-6 overflow-hidden"
                        style={{ borderRadius: `${l?.borderRadius || 40}px` }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black uppercase tracking-widest">Your Mix Bag</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400"><X size={18} /></button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <img src={item.image || undefined} className="w-12 h-12 rounded-xl object-cover" />
                                    <div className="flex-grow">
                                        <p className="text-[10px] font-bold line-clamp-1">{item.name}</p>
                                        <p className="text-[10px] text-primary font-black" style={{ color: settings.primaryColor }}>{formatPrice(item.price)}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <button onClick={() => updateCartQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1"><Minus size={10} /></button>
                                            <span className="text-[10px] font-bold">{item.quantity}</span>
                                            <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="p-1"><Plus size={10} /></button>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><X size={12} /></button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-gray-400">Total Selection</span>
                                <span className="text-lg font-black">{formatPrice(total)}</span>
                            </div>
                            <button 
                                onClick={() => { setIsOpen(false); navigate('/checkout'); }}
                                className="w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center justify-center gap-2"
                                style={{ backgroundColor: settings.primaryColor }}
                            >
                                Secure Checkout <ArrowRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                layoutId="cart-trigger"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-full text-white shadow-2xl flex items-center justify-center relative"
                style={{ 
                    backgroundColor: c?.primary || settings.primaryColor,
                    borderRadius: `${l?.buttonRadius || 32}px`
                }}
            >
                <ShoppingCart size={24} />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-gray-900 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-primary" style={{ borderColor: settings.primaryColor }}>
                    {count}
                </span>
            </motion.button>
        </div>
    );
};

export default FloatingCart;
