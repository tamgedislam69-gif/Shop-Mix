import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Package, MapPin, Truck, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, cn } from '../lib/utils';

const OrderTrackingPage: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const { getOrderById, settings } = useApp();
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const order = getOrderById(orderId.trim());
    if (order) {
      setTrackedOrder(order);
      setError('');
    } else {
      setTrackedOrder(null);
      setError('Order not found. Please check the ID and try again.');
    }
  };

  const steps = [
    { label: 'Order Placed', status: 'pending', icon: Clock },
    { label: 'Processing', status: 'processing', icon: Package },
    { label: 'Shipped', status: 'shipped', icon: Truck },
    { label: 'Delivered', status: 'delivered', icon: CheckCircle },
  ];

  const currentStepIndex = trackedOrder ? steps.findIndex(s => s.status === trackedOrder.status) : -1;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-12 md:py-20"
    >
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Track Your Order</h1>
          <p className="text-gray-500">Enter your order ID below to see the current status of your package.</p>
        </div>

        <form onSubmit={handleTrack} className="flex gap-2 max-w-lg mx-auto">
          <div className="relative flex-grow">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input
               type="text"
               placeholder="Order ID (e.g. ORDER-123456)"
               className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
               value={orderId}
               onChange={(e) => setOrderId(e.target.value)}
               style={{ focusRingColor: settings.primaryColor }}
             />
          </div>
          <button 
            type="submit"
            className="px-8 py-4 text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: settings.primaryColor }}
          >
            Track
          </button>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 font-bold"
            >
              {error}
            </motion.p>
          )}

          {trackedOrder && (
            <motion.div 
              key={trackedOrder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden text-left"
            >
              {/* Order Header */}
              <div className="p-8 bg-gray-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Tracking Order</h3>
                  <p className="text-xl font-black">{trackedOrder.id}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Expected Delivery</h3>
                  <p className="text-xl font-black">Within 48 Hours</p>
                </div>
              </div>

              <div className="p-8 space-y-12">
                {/* Stepper */}
                <div className="relative flex justify-between">
                   {/* Background Line */}
                   <div className="absolute top-6 left-0 right-0 h-1 bg-gray-100 -z-0" />
                   {/* Progress Line */}
                   <div 
                    className="absolute top-6 left-0 h-1 transition-all duration-1000 -z-0" 
                    style={{ 
                      backgroundColor: settings.primaryColor,
                      width: `${(currentStepIndex / (steps.length - 1)) * 100}%` 
                    }} 
                   />

                   {steps.map((step, idx) => {
                     const Icon = step.icon;
                     const isCompleted = idx <= currentStepIndex;
                     const isCurrent = idx === currentStepIndex;

                     return (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                           <div 
                            className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                              isCompleted ? "text-white shadow-lg" : "bg-white text-gray-300 border-2 border-gray-100",
                              isCurrent && "scale-110 ring-4 ring-primary/20"
                            )}
                            style={{ 
                              backgroundColor: isCompleted ? settings.primaryColor : undefined,
                              borderColor: isCurrent ? settings.primaryColor : undefined
                            }}
                           >
                             <Icon size={20} />
                           </div>
                           <span className={cn(
                             "text-[10px] font-black uppercase tracking-widest",
                             isCompleted ? "text-gray-900" : "text-gray-300"
                           )}>
                             {step.label}
                           </span>
                        </div>
                     )
                   })}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-400">
                         <MapPin size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Delivery Address</span>
                      </div>
                      <div className="space-y-1">
                         <p className="font-black text-gray-900">{trackedOrder.customer.name}</p>
                         <p className="text-sm text-gray-500">{trackedOrder.customer.address}</p>
                         <p className="text-sm text-gray-500">{trackedOrder.customer.phone}</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-400">
                         <Package size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Order Summary</span>
                      </div>
                      <div className="space-y-2">
                         {trackedOrder.items.map((item: any, idx: number) => (
                           <div key={idx} className="flex justify-between text-xs font-bold">
                              <span className="text-gray-500">{item.name} <span className="text-gray-300">x{item.quantity}</span></span>
                              <span>{formatPrice(item.price * item.quantity)}</span>
                           </div>
                         ))}
                         <div className="pt-2 border-t border-dashed border-gray-100 flex justify-between">
                            <span className="font-black uppercase text-[10px]">Total Paid</span>
                            <span className="font-black text-primary" style={{ color: settings.primaryColor }}>{formatPrice(trackedOrder.total)}</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OrderTrackingPage;
