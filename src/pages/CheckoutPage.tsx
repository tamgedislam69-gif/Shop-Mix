import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CreditCard, Truck, ShieldCheck, CheckCircle, Smartphone, Wallet, Banknote } from 'lucide-react';
import { formatPrice, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../types';
import { generateInvoicePDF } from '../lib/pdfGenerator';
import { Download } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const { cart, clearCart, settings, addOrder } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'cod'>('cod');
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 150;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCustomer = formData.name ? formData : {
        name: 'Demo Customer',
        phone: '01900000000',
        address: 'House 12, Road 5, Dhanmondi, Dhaka',
        email: 'customer@example.com'
    };

    const newOrder: Order = {
      id: `ORDER-${Math.floor(Math.random() * 1000000)}`,
      items: cart,
      total,
      customer: finalCustomer,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    addOrder(newOrder);
    setLastOrder(newOrder);
    setIsSuccess(true);
    setTimeout(() => {
      clearCart();
    }, 100);
  };

  if (cart.length === 0 && !isSuccess) {
    navigate('/cart');
    return null;
  }

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-20 flex flex-col items-center text-center space-y-6"
      >
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle size={48} />
        </div>
        <div className="space-y-2">
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Order Placed!</h1>
            <p className="text-gray-500 max-w-sm mx-auto">
                Thank you for your order. We have received it and will start processing it immediately. 
                You will receive a confirmation call shortly.
            </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full max-w-md">
             <div className="flex justify-between text-sm mb-2">
                 <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Order ID</span>
                 <span className="font-black">#MIX-{Math.floor(Math.random() * 100000)}</span>
             </div>
             <div className="flex justify-between text-sm">
                 <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Delivery</span>
                 <span className="font-black">Within 48 Hours</span>
             </div>
        </div>
        
        <div className="flex flex-col gap-3">
            <button 
                onClick={() => lastOrder && generateInvoicePDF(lastOrder)}
                className="flex items-center justify-center gap-2 px-10 py-4 font-black uppercase tracking-widest text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
                <Download size={20} /> Download Invoice PDF
            </button>
            <button 
                onClick={() => navigate('/')}
                className="px-10 py-4 font-black uppercase tracking-widest text-white rounded-xl shadow-xl transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: settings.primaryColor }}
            >
                Return to Shopping
            </button>
        </div>
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
        <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Delivery & Payment</h1>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <Truck size={20} className="text-gray-400" />
                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-800">Shipping Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Full Name *</label>
                        <input 
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Phone Number *</label>
                        <input 
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="01XXXXXXXXX"
                        />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email Address (Optional)</label>
                        <input 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="email@example.com"
                        />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Full Address *</label>
                        <textarea 
                            required
                            rows={3}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            placeholder="House #, Street #, Area, City"
                        />
                    </div>
                </div>
            </section>

            <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={20} className="text-gray-400" />
                    <h2 className="text-lg font-black uppercase tracking-tight text-gray-800">Select Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('bkash')}
                        className={cn(
                            "p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all",
                            paymentMethod === 'bkash' ? "border-pink-500 bg-pink-50 ring-2 ring-pink-200" : "border-gray-100 hover:border-gray-200"
                        )}
                    >
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center overflow-hidden p-1">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Bkash_logo.png/512px-Bkash_logo.png" alt="bKash" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">bKash</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setPaymentMethod('nagad')}
                        className={cn(
                            "p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all",
                            paymentMethod === 'nagad' ? "border-orange-500 bg-orange-50 ring-2 ring-orange-200" : "border-gray-100 hover:border-gray-200"
                        )}
                    >
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center overflow-hidden p-2">
                            <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" alt="Nagad" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Nagad</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={cn(
                            "p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all",
                            paymentMethod === 'cod' ? "border-gray-900 bg-gray-50 ring-2 ring-gray-200" : "border-gray-100 hover:border-gray-200"
                        )}
                    >
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center">
                            <Banknote size={24} className="text-gray-700" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Cash On Delivery</span>
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {paymentMethod !== 'cod' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-4 bg-gray-900 text-white rounded-xl space-y-3"
                        >
                            <div className="flex items-center gap-2">
                                <Smartphone size={16} className="text-primary" style={{ color: settings.primaryColor }} />
                                <span className="text-xs font-black uppercase tracking-widest">Payment Instruction</span>
                            </div>
                            <p className="text-[10px] text-gray-400">
                                After placing the order, please send the total amount to <span className="text-white font-bold">01900-000000</span> (Personal) using {paymentMethod}. Put your order ID in the reference.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            <div className="flex items-center gap-4 py-4 px-2">
                <ShieldCheck size={24} className="text-green-500" />
                <p className="text-xs text-gray-500">
                    Your personal information is secure. By placing this order, you agree to our <span className="text-gray-900 font-bold underline">Terms & Conditions</span>.
                </p>
            </div>

            <button
                type="submit"
                className="w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 transition-transform active:scale-[0.98] flex items-center justify-center gap-3"
                style={{ backgroundColor: settings.primaryColor, color: 'white' }}
            >
                Complete Purchase <CheckCircle size={24} />
            </button>
          </form>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-28">
                 <h2 className="text-xl font-black uppercase tracking-tight mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
                 
                 <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
                     {cart.map(item => (
                         <div key={item.id} className="flex gap-4">
                             <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                                 <img 
                                src={item.image} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer" 
                                loading="lazy"
                            />
                             </div>
                             <div className="flex-grow flex flex-col justify-center">
                                 <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                                 <div className="flex justify-between items-center mt-1">
                                     <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.quantity} x {formatPrice(item.price)}</span>
                                     <span className="text-xs font-black text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>

                 <div className="space-y-3 pt-6 border-t border-gray-100">
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500 font-medium tracking-tight">Merchandise Subtotal</span>
                         <span className="font-bold">{formatPrice(subtotal)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                         <span className="text-gray-500 font-medium tracking-tight">Total Shipping Fee</span>
                         <span className={cn("font-bold", shipping === 0 ? "text-green-500" : "")}>
                             {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                         </span>
                     </div>
                     <div className="flex justify-between items-baseline pt-4 border-t border-dashed border-gray-200">
                         <span className="text-base font-black uppercase">Total Payable</span>
                         <span className="text-2xl font-black text-primary" style={{ color: settings.primaryColor }}>{formatPrice(total)}</span>
                     </div>
                 </div>

                 <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                     <div className="flex items-center gap-3 text-gray-500">
                        <Wallet size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Selected: {paymentMethod === 'cod' ? 'Cash On Delivery' : paymentMethod.toUpperCase()}</span>
                     </div>
                     <div className="flex items-center gap-3 text-gray-500">
                        <Truck size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Expected Delivery: {new Date(new Date().getTime() + 48 * 60 * 60 * 1000).toLocaleDateString()}</span>
                     </div>
                 </div>
             </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
