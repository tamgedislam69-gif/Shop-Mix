import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Truck, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { formatPrice, cn } from '../lib/utils';
import { DIVISIONS, DISTRICTS } from '../constants/locations';
import { Order } from '../types';
import { useTranslate } from '../hooks/useTranslate';

const CheckoutDrawer: React.FC = () => {
  const { 
    checkoutDrawerOpen, 
    setCheckoutDrawerOpen, 
    selectedProductForCheckout, 
    settings,
    addOrder 
  } = useApp();
  const { t } = useTranslate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    divisionId: '',
    districtId: '',
    address: '',
    quantity: 1,
    color: '',
    size: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (selectedProductForCheckout) {
      setFormData(prev => ({
        ...prev,
        color: '',
        size: '',
        quantity: 1
      }));
      setStep(1);
      setShowSuccess(false);
      setErrors({}); // Clear any previous errors
    }
  }, [selectedProductForCheckout]);

  if (!selectedProductForCheckout) return null;

  const product = selectedProductForCheckout;
  const c = settings.customization?.colors;
  const l = settings.customization?.layout;
  
  const selectedDivision = DIVISIONS.find(d => d.id === formData.divisionId);
  const filteredDistricts = DISTRICTS.filter(d => d.divisionId === formData.divisionId);
  const selectedDistrict = DISTRICTS.find(d => d.id === formData.districtId);

  // Shipping Logic: Dhaka = 70, Others = 120
  const shippingCharge = selectedDivision?.name === 'Dhaka' ? 70 : 120;
  
  // Calculate price modifier from variants
  let priceModifier = 0;
  if (product.variants) {
    const colorVar = product.variants.colors.find(c => c.name === formData.color);
    const sizeVar = product.variants.sizes.find(s => s.name === formData.size);
    if (colorVar) priceModifier += colorVar.priceModifier;
    if (sizeVar) priceModifier += sizeVar.priceModifier;
  }
  
  const unitPrice = product.price + priceModifier;
  const subtotal = unitPrice * formData.quantity;
  const grandTotal = subtotal + (formData.divisionId ? shippingCharge : 0);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'নাম প্রয়োজন';
    if (!formData.phone) {
        newErrors.phone = 'ফোন নম্বর প্রয়োজন';
    } else if (!/^\d{11}$/.test(formData.phone)) {
        newErrors.phone = 'সঠিক ১১ ডিজিটের নম্বর দিন';
    }
    if (!formData.divisionId) newErrors.division = 'বিভাগ নির্বাচন করুন';
    if (!formData.districtId) newErrors.district = 'জেলা নির্বাচন করুন';
    if (!formData.address) newErrors.address = 'পূর্ণ ঠিকানা দিন';
    
    // Add Size & Color Validation
    if (product.enableSizes && product.variants?.sizes && product.variants.sizes.length > 0 && !formData.size) {
        newErrors.size = 'অনুগ্রহ করে সাইজ সিলেক্ট করুন';
    }
    if (product.enableColors && product.variants?.colors && product.variants.colors.length > 0 && !formData.color) {
        newErrors.color = 'অনুগ্রহ করে কালার সিলেক্ট করুন';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const message = `🚀 *Order Confirmation*
-------------------------
📦 *Product:* ${product.name}
🎨 *Color:* ${formData.color || 'N/A'}
📐 *Size:* ${formData.size || 'N/A'}
🔢 *Quantity:* ${formData.quantity}
-------------------------
👤 *Customer:* ${formData.name}
📱 *Phone:* ${formData.phone}
📍 *Location:* ${formData.address}, ${selectedDistrict?.bnName}, ${selectedDivision?.bnName}
-------------------------
💰 *Final Bill:* ${grandTotal} BDT`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/8801771357329?text=${encodedMessage}`;

    // Small delay to simulate processing before redirect
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      
      // Add to local orders for history/analytics
      const orderId = `ORD-${Date.now()}`;
      const newOrder: Order = {
        id: orderId,
        items: [{ ...product, quantity: formData.quantity, selectedSize: formData.size, selectedColor: formData.color }],
        total: grandTotal,
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        },
        paymentMethod: 'cod',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      addOrder(newOrder);

      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1000);
  };

  const handleClose = () => {
    setCheckoutDrawerOpen(false);
  };

  return (
    <AnimatePresence>
      {checkoutDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#000000]/80 z-[100] backdrop-blur-md"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[101] shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between bg-[#1a1a1a] text-white">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: c?.primary || settings.primaryColor }}
                >
                    <ShoppingBag size={20} className="text-white" />
                </div>
                <div>
                    <h2 
                      className="font-black text-xs uppercase tracking-widest"
                      style={{ color: c?.primary || settings.primaryColor }}
                    >Checkout</h2>
                    <p className="font-bold text-sm">অর্ডার সম্পন্ন করুন</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                id="close-checkout"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              {!showSuccess ? (
                <div className="p-6">
                  {/* Product Overview */}
                  <div className="flex gap-4 p-5 bg-[#1a1a1a] rounded-2xl mb-8 shadow-xl border border-gray-800">
                    <div className="relative">
                        <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-20 h-20 object-cover rounded-xl shadow-lg border border-gray-700"
                        />
                        <div 
                          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shadow-lg"
                          style={{ backgroundColor: c?.primary || settings.primaryColor }}
                        >
                            {formData.quantity}
                        </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-100 text-sm line-clamp-1">{product.name}</h3>
                      <p 
                        className="font-black text-xl mt-1"
                        style={{ color: c?.priceColor || c?.primary || settings.primaryColor }}
                      >{formatPrice(unitPrice)}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider bg-gray-800 px-2 py-0.5 rounded">In Stock: {product.stock} Units</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Attributes */}
                    <div className="space-y-6">
                      {product.enableSizes && product.variants?.sizes && product.variants.sizes.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className={cn(
                            "text-base font-semibold mb-3 flex items-center justify-between",
                            errors.size ? "text-red-500" : "text-gray-900"
                          )}>
                             <div className="flex items-center gap-2">
                               সাইজ সিলেক্ট করুন <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", errors.size ? "bg-red-500" : "bg-[#FF6B00]")}></div>
                             </div>
                             {errors.size && <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">{errors.size}</span>}
                          </div>
                          <div className="flex flex-wrap gap-3">
                             {product.variants.sizes.map(size => (
                                 <button
                                 key={size.id}
                                 type="button"
                                 onClick={() => {
                                   setFormData({...formData, size: size.name});
                                   if (errors.size) setErrors({...errors, size: ''});
                                 }}
                                 className={cn(
                                   "px-5 py-3 text-sm font-black uppercase rounded-2xl border-2 transition-all duration-300",
                                   formData.size === size.name 
                                     ? "text-white scale-[1.05] shadow-xl" 
                                     : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                                 )}
                                 style={formData.size === size.name ? { 
                                     backgroundColor: c?.primary || settings.primaryColor,
                                     borderColor: c?.primary || settings.primaryColor,
                                     borderRadius: `${l?.borderRadius || 16}px`
                                 } : { borderRadius: `${l?.borderRadius || 16}px` }}
                               >
                                 {size.name}
                               </button>
                             ))}
                          </div>
                        </div>
                      )}

                      {product.enableColors && product.variants?.colors && product.variants.colors.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                           <div className={cn(
                            "text-base font-semibold mb-3 flex items-center justify-between",
                            errors.color ? "text-red-500" : "text-gray-900"
                          )}>
                             <div className="flex items-center gap-2">
                               কালার সিলেক্ট করুন <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", errors.color ? "bg-red-500" : "bg-[#FF6B00]")}></div>
                             </div>
                             {errors.color && <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">{errors.color}</span>}
                          </div>
                          <div className="flex flex-wrap gap-4">
                             {product.variants.colors.map(color => (
                               <button
                                 key={color.id}
                                 type="button"
                                 onMouseDown={() => {
                                   setFormData({...formData, color: color.name});
                                   if (errors.color) setErrors({...errors, color: ''});
                                 }}
                                 className="group relative flex flex-col items-center gap-2"
                               >
                                 <div className={cn(
                                   "w-12 h-12 rounded-full border-2 p-1 transition-all duration-300 flex items-center justify-center",
                                   formData.color === color.name 
                                     ? "scale-110 shadow-lg" 
                                     : "border-transparent hover:scale-105"
                                 )}
                                 style={formData.color === color.name ? { borderColor: c?.primary || settings.primaryColor } : {}}
                                 >
                                   <div 
                                      className="w-full h-full rounded-full shadow-inner border border-black/5" 
                                      style={{ backgroundColor: color.hex || '#000000' }}
                                   />
                                   {formData.color === color.name && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                         <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
                                      </div>
                                   )}
                                 </div>
                                 <span className={cn(
                                   "text-[10px] font-black uppercase tracking-wider transition-colors",
                                   formData.color === color.name ? "text-gray-900" : "text-gray-400"
                                 )}>
                                   {color.name}
                                 </span>
                               </button>
                             ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">পরিমান</label>
                        <div className="flex items-center gap-4 bg-gray-50 w-fit p-1.5 rounded-2xl border border-gray-100">
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-800 hover:bg-gray-50 transition-all"
                            style={{ borderColor: formData.quantity > 1 ? (c?.primary || settings.primaryColor) : '#e5e7eb' } as any}
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-black text-gray-900">{formData.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, quantity: Math.min(product.stock, formData.quantity + 1)})}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-gray-800 hover:bg-gray-50 transition-all"
                            style={{ borderColor: c?.primary || settings.primaryColor }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-6 pt-8 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                             <User size={16} />
                         </div>
                         <h4 className="font-black text-xs uppercase tracking-widest text-gray-900">আপনার তথ্য দিন</h4>
                      </div>

                      <div className="space-y-5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">পূর্ণ নাম</label>
                          <input 
                            type="text"
                            placeholder="আপনার নাম লিখুন..."
                            className={cn(
                              "w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all placeholder:text-gray-300 font-bold",
                              errors.name ? "border-red-500" : "border-gray-100"
                            )}
                            style={!errors.name ? { borderRadius: `${l?.borderRadius || 24}px` } : {}}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>

                        <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">মোবাইল নম্বর (১১ ডিজিট)</label>
                          <input 
                            type="tel"
                            placeholder="017xxxxxxxx"
                            className={cn(
                              "w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all placeholder:text-gray-300 font-bold font-mono",
                              errors.phone ? "border-red-500" : "border-gray-100"
                            )}
                            style={!errors.phone ? { borderRadius: `${l?.borderRadius || 24}px` } : {}}
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                          {errors.phone && <p className="text-red-500 text-[9px] font-black uppercase mt-1 ml-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                           <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">বিভাগ</label>
                           <select
                             className={cn(
                               "w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all appearance-none cursor-pointer font-bold",
                               errors.division ? "border-red-500" : "border-gray-100"
                             )}
                             style={!errors.division ? { borderRadius: `${l?.borderRadius || 24}px` } : {}}
                             value={formData.divisionId}
                             onChange={(e) => setFormData({...formData, divisionId: e.target.value, districtId: ''})}
                           >
                             <option value="">সিলেক্ট করুন</option>
                             {DIVISIONS.map(div => (
                               <option key={div.id} value={div.id}>{div.bnName}</option>
                             ))}
                           </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">জেলা</label>
                           <select
                             className={cn(
                               "w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 font-bold",
                               errors.district ? "border-red-500" : "border-gray-100"
                             )}
                             style={!errors.district ? { borderRadius: `${l?.borderRadius || 24}px` } : {}}
                             value={formData.districtId}
                             onChange={(e) => setFormData({...formData, districtId: e.target.value})}
                             disabled={!formData.divisionId}
                           >
                             <option value="">সিলেক্ট করুন</option>
                             {filteredDistricts.map(dist => (
                               <option key={dist.id} value={dist.id}>{dist.bnName}</option>
                             ))}
                           </select>
                         </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">পূর্ণ ঠিকানা (গ্রাম/রোড, পোস্ট, উপজেলা)</label>
                        <textarea 
                          placeholder="আপনার পূর্ণ ঠিকানা লিখুন..."
                          rows={3}
                          className={cn(
                            "w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all placeholder:text-gray-300 font-bold resize-none",
                            errors.address ? "border-red-500" : "border-gray-100"
                          )}
                          style={!errors.address ? { borderRadius: `${l?.borderRadius || 24}px` } : {}}
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div 
                      className="rounded-[2rem] p-8 text-white relative overflow-hidden group border"
                      style={{ 
                        backgroundColor: c?.footerBg || '#1a1a1a',
                        borderColor: c?.cardBorder || '#1f2937',
                        borderRadius: `${l?.borderRadius || 32}px`
                      }}
                    >
                        <div 
                          className="absolute top-0 right-0 w-32 h-32 blur-[60px] -mr-16 -mt-16 opacity-20"
                          style={{ backgroundColor: c?.primary || settings.primaryColor }}
                        ></div>

                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Subtotal</span>
                                <span className="font-bold text-gray-300">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Truck size={14} style={{ color: c?.primary || settings.primaryColor }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Shipping</span>
                                </div>
                                <span className="font-bold text-gray-300">
                                    {formData.divisionId ? formatPrice(shippingCharge) : '--'}
                                </span>
                            </div>
                            <div className="pt-6 border-t border-gray-800 flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span 
                                      className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                                      style={{ color: c?.primary || settings.primaryColor }}
                                    >Grand Total</span>
                                    <span className="text-4xl font-black text-white tabular-nums tracking-tighter">
                                        {formatPrice(grandTotal)}
                                    </span>
                                </div>
                                <div className="bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-700 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">COD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center justify-center text-center h-full bg-[#1a1a1a]">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl"
                    style={{ backgroundColor: c?.primary || settings.primaryColor }}
                  >
                    <CheckCircle2 size={56} className="text-white" />
                  </motion.div>
                  <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">THANK YOU!</h2>
                  <p className="text-gray-400 mb-10 max-w-[280px] text-sm font-medium leading-relaxed">
                    আপনার অর্ডারটি সফলভাবে প্রেরণ করা হয়েছে। আমরা খুব শীঘ্রই আপনার হোয়াটসঅ্যাপে যোগাযোগ করবো।
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full py-5 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl active:scale-[0.98] transition-all"
                    style={{ backgroundColor: c?.primary || settings.primaryColor, borderRadius: `${l?.buttonRadius || 16}px` }}
                  >
                    Back to Shop
                  </button>
                  
                  <div className="mt-12 flex items-center gap-4">
                      <div className="w-12 h-px bg-gray-800"></div>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Order Success</span>
                      <div className="w-12 h-px bg-gray-800"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            {!showSuccess && (
              <div className="p-6 border-t border-gray-100 bg-white">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={cn(
                    "w-full py-5 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden",
                    isSubmitting ? "opacity-70 cursor-not-allowed" : "active:scale-[0.98]"
                  )}
                  style={{ backgroundColor: c?.primary || settings.primaryColor, borderRadius: `${l?.buttonRadius || 16}px` }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {isSubmitting ? 'প্রসেসিং হচ্ছে...' : (t('অর্ডার কনফার্ম করুন', 'Confirm Order'))}
                    {!isSubmitting && <Truck size={18} />}
                  </span>
                </button>
                <p className="text-[10px] font-bold text-center text-gray-400 mt-4 leading-relaxed max-w-[300px] mx-auto">
                   অর্ডার কনফার্ম করতে বাটনে ক্লিক করুন, আপনাকে সরাসরি আমাদের ম্যানেজার-এর সাথে হোয়াটসঅ্যাপে নিয়ে যাওয়া হবে।
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutDrawer;
