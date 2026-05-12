import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice, cn } from '../lib/utils';
import { motion } from 'motion/react';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, settings } = useApp();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 150;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-6"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 uppercase">Your Cart is Empty</h2>
          <p className="text-gray-500">Looks like you haven't added anything to your cart yet.</p>
        </div>
        <Link 
          to="/" 
          className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-lg shadow-lg"
          style={{ backgroundColor: settings.primaryColor }}
        >
          Start Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-12"
    >
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Shopping Cart ({cart.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-4 bg-white rounded-t-xl border border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <span className="col-span-3">Product Detail</span>
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Subtotal</span>
          </div>
          
          <div className="space-y-3">
            {cart.map(item => (
              <motion.div 
                key={item.id}
                layout
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white p-4 md:px-6 md:py-8 rounded-xl border border-gray-100 shadow-sm relative group"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="col-span-3 flex gap-4 items-center">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover bg-gray-50 flex-shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight">{item.name}</h3>
                      <p className="text-xs text-gray-400 uppercase font-medium">{item.category}</p>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase mt-2 md:opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center hidden md:block">
                    <span className="font-bold text-gray-700">{formatPrice(item.price)}</span>
                  </div>

                  <div className="flex justify-center">
                    <div className="flex items-center border border-gray-100 rounded-lg overflow-hidden bg-gray-50 scale-90">
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-200 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex md:block items-baseline justify-between mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                    <span className="md:hidden text-[10px] font-bold uppercase text-gray-400">Total</span>
                    <span className="font-black text-primary" style={{ color: settings.primaryColor }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
            <h2 className="text-xl font-black uppercase tracking-tight mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({cart.length} items)</span>
                <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping Fee</span>
                <span className={cn("font-bold", shipping === 0 ? "text-green-500" : "text-gray-900")}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                  <p className="text-[10px] text-gray-400 font-medium">Add {formatPrice(5000 - subtotal)} more for FREE shipping!</p>
              )}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                <span className="text-base font-black uppercase">Estimated Total</span>
                <span className="text-2xl font-black text-primary" style={{ color: settings.primaryColor }}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
                <Link 
                  to="/" 
                  className="w-full py-3 flex items-center justify-center text-sm font-bold text-gray-600 hover:text-primary transition-colors"
                >
                  Continue Shopping
                </Link>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <ShoppingBag size={14} /> Safe & Secure Payments
                </div>
                <div className="flex gap-2 grayscale opacity-50">
                    <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-4" />
                    <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Bkash_logo.png/512px-Bkash_logo.png" alt="bKash" className="h-4 object-contain" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage;
