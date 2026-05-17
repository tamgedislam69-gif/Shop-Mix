import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Truck, MessageCircle, Phone, MessageSquare, ShieldCheck, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice, cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CheckoutModal: React.FC = () => {
    const { 
        checkoutDrawerOpen, 
        setCheckoutDrawerOpen, 
        selectedProductForCheckout, 
        settings, 
        addOrder
    } = useApp();

    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    
    // Customer Info
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<'inside' | 'outside'>('inside');

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [encodedMsg, setEncodedMsg] = useState('');

    const c = settings.customization?.colors;
    const l = settings.customization?.layout;

    useEffect(() => {
        if (selectedProductForCheckout) {
            setQuantity(1);
            if (selectedProductForCheckout.enableColors && selectedProductForCheckout.variants?.colors?.length > 0) {
                const colors = selectedProductForCheckout.variants.colors[0].name.split(',').map(s => s.trim()).filter(Boolean);
                setSelectedColor(colors[0] || '');
            } else {
                setSelectedColor('');
            }
            if (selectedProductForCheckout.enableSizes && selectedProductForCheckout.variants?.sizes?.length > 0) {
                const sizes = selectedProductForCheckout.variants.sizes[0].name.split(',').map(s => s.trim()).filter(Boolean);
                setSelectedSize(sizes[0] || '');
            } else {
                setSelectedSize('');
            }
            setShowSuccess(false);
            setErrors({});
            // Reset form
            setName('');
            setPhone('');
            setAddress('');
            setLocation('inside');
        }
    }, [selectedProductForCheckout]);

    if (!selectedProductForCheckout) return null;
    const product = selectedProductForCheckout;

    const deliveryCharge = location === 'inside' ? 60 : 130;
    const subtotal = product.price * quantity;
    const grandTotal = subtotal + deliveryCharge;

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = 'নাম দিন';
        if (!phone.trim()) {
            newErrors.phone = 'ফোন নম্বর দিন';
        } else if (!/^\d{11}$/.test(phone)) {
            newErrors.phone = 'সঠিক ১১ ডিজিটের নম্বর দিন';
        }
        
        if (product.enableSizes && product.variants?.sizes?.length > 0 && !selectedSize) {
            newErrors.size = 'সাইজ সিলেক্ট করুন';
        }
        if (product.enableColors && product.variants?.colors?.length > 0 && !selectedColor) {
            newErrors.color = 'কালার সিলেক্ট করুন';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirmOrder = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        const orderId = `ORD-${Date.now()}`;
        
        const message = `🚀 *Order Details - ${orderId}*
-------------------------
📦 *Product:* ${product.name}
${selectedColor ? `🎨 *Color:* ${selectedColor}` : ''}
${selectedSize ? `📐 *Size:* ${selectedSize}` : ''}
🔢 *Quantity:* ${quantity}
-------------------------
👤 *Name:* ${name}
📱 *Phone:* ${phone}
📍 *Location:* ${location === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}
${address ? `🏢 *Address:* ${address}` : ''}
-------------------------
💰 *Price:* ${product.price} x ${quantity} = ${subtotal} BDT
🚚 *Delivery:* ${deliveryCharge} BDT
💵 *Total Bill:* ${grandTotal} BDT`;

        const encodedMessage = encodeURIComponent(message);
        setEncodedMsg(encodedMessage);

        const newOrder = {
            id: orderId,
            items: [{
                ...product,
                quantity,
                selectedColor,
                selectedSize,
                price: product.price
            }],
            total: grandTotal,
            customer: {
                name,
                phone,
                address,
                location
            },
            paymentMethod: 'cod',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        try {
            // Save to Firebase
            await addDoc(collection(db, 'orders'), {
                ...newOrder,
                serverTimestamp: serverTimestamp()
            });
            
            // local state update
            addOrder(newOrder);

            setShowSuccess(true);
            
            // Auto redirect to WhatsApp after 2 seconds
            setTimeout(() => {
                window.open(`https://wa.me/+8801771357329?text=${encodedMessage}`, '_blank');
            }, 2000);

        } catch (error) {
            console.error("Order submission failed:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {checkoutDrawerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row"
                        style={{ borderRadius: `${l?.borderRadius || 24}px` }}
                    >
                        <button 
                            onClick={() => setCheckoutDrawerOpen(false)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-gray-900 shadow-sm"
                        >
                            <X size={20} />
                        </button>

                        {!showSuccess ? (
                            <>
                                {/* Left Side: Product Details & Live Bill summary */}
                                <div className="w-full md:w-5/12 bg-gray-50 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100">
                                    <div className="space-y-6">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-24 h-24 rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden shrink-0">
                                                <img src={product.image || undefined} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 leading-tight mb-2">{product.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black" style={{ color: c?.primary || settings.primaryColor }}>
                                                        {formatPrice(product.price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {product.enableColors && product.variants?.colors && product.variants.colors.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex justify-between">
                                                        Select Color 
                                                        {errors.color && <span className="text-red-500">{errors.color}</span>}
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {product.variants.colors.flatMap(cg => cg.name.split(',').map(s=>s.trim()).filter(Boolean)).map(color => (
                                                            <button
                                                                key={color}
                                                                onClick={() => { setSelectedColor(color); setErrors({...errors, color: ''}) }}
                                                                className={cn(
                                                                    "px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border",
                                                                    selectedColor === color 
                                                                    ? "border-transparent text-white shadow-md scale-[1.02]" 
                                                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                                                )}
                                                                style={selectedColor === color ? { backgroundColor: c?.primary || settings.primaryColor } : {}}
                                                            >
                                                                {color}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {product.enableSizes && product.variants?.sizes && product.variants.sizes.length > 0 && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex justify-between">
                                                        Select Size
                                                        {errors.size && <span className="text-red-500">{errors.size}</span>}
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {product.variants.sizes.flatMap(sg => sg.name.split(',').map(s=>s.trim()).filter(Boolean)).map(size => (
                                                            <button
                                                                key={size}
                                                                onClick={() => { setSelectedSize(size); setErrors({...errors, size: ''}) }}
                                                                className={cn(
                                                                    "px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border",
                                                                    selectedSize === size 
                                                                    ? "border-transparent text-white shadow-md scale-[1.02]" 
                                                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                                                )}
                                                                style={selectedSize === size ? { backgroundColor: c?.primary || settings.primaryColor } : {}}
                                                            >
                                                                {size}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Quantity</label>
                                                 <div className="flex items-center gap-4 bg-white p-2 rounded-xl justify-between border border-gray-100">
                                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg hover:bg-gray-50 flex items-center justify-center font-bold text-gray-400">
                                                        -
                                                    </button>
                                                    <span className="font-black text-lg">{quantity}</span>
                                                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg hover:bg-gray-50 flex items-center justify-center font-bold text-gray-400">
                                                        +
                                                    </button>
                                                 </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-3 pt-6 border-t border-gray-200">
                                        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                            <span>Delivery</span>
                                            <span>{formatPrice(deliveryCharge)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xl font-black text-gray-900 pt-3 border-t border-gray-200">
                                            <span>Total Bill</span>
                                            <span style={{ color: c?.primary || settings.primaryColor }}>{formatPrice(grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Customer Info form */}
                                <div className="w-full md:w-7/12 p-6 md:p-10 space-y-8 bg-white">
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight text-gray-900">Delivery Details</h2>
                                        <p className="text-sm font-bold text-gray-400 mt-1">Please provide your details below to confirm the order.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Full Name *</label>
                                                <input 
                                                    className={cn(
                                                        "w-full bg-gray-50 border rounded-2xl py-4 px-5 font-bold outline-none focus:border-gray-400 transition-all placeholder:text-gray-300",
                                                        errors.name ? "border-red-500" : "border-gray-200"
                                                    )}
                                                    placeholder="e.g. John Doe"
                                                    value={name}
                                                    onChange={(e) => { setName(e.target.value); setErrors({...errors, name: ''}) }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Phone Number *</label>
                                                <input 
                                                    type="tel"
                                                    className={cn(
                                                        "w-full bg-gray-50 border rounded-2xl py-4 px-5 font-mono font-bold outline-none focus:border-gray-400 transition-all placeholder:text-gray-300",
                                                        errors.phone ? "border-red-500" : "border-gray-200"
                                                    )}
                                                    placeholder="017xxxxxxxx"
                                                    value={phone}
                                                    onChange={(e) => { setPhone(e.target.value); setErrors({...errors, phone: ''}) }}
                                                />
                                                {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.phone}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Delivery Area *</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <label className={cn(
                                                    "cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3",
                                                    location === 'inside' ? "bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
                                                )}
                                                    style={location === 'inside' ? { borderColor: c?.primary || settings.primaryColor } : {}}
                                                >
                                                    <input type="radio" className="hidden" checked={location === 'inside'} onChange={() => setLocation('inside')} />
                                                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center")} style={location === 'inside' ? { borderColor: c?.primary || settings.primaryColor } : { borderColor: '#e5e7eb' }}>
                                                        {location === 'inside' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c?.primary || settings.primaryColor }}></div>}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-gray-900 leading-tight">Inside Dhaka</p>
                                                        <p className="font-bold text-[10px] text-gray-400 uppercase">60 BDT</p>
                                                    </div>
                                                </label>
                                                <label className={cn(
                                                    "cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3",
                                                    location === 'outside' ? "bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
                                                )}
                                                    style={location === 'outside' ? { borderColor: c?.primary || settings.primaryColor } : {}}
                                                >
                                                    <input type="radio" className="hidden" checked={location === 'outside'} onChange={() => setLocation('outside')} />
                                                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center")} style={location === 'outside' ? { borderColor: c?.primary || settings.primaryColor } : { borderColor: '#e5e7eb' }}>
                                                        {location === 'outside' && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c?.primary || settings.primaryColor }}></div>}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-gray-900 leading-tight">Outside Dhaka</p>
                                                        <p className="font-bold text-[10px] text-gray-400 uppercase">130 BDT</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Full Address (Optional)</label>
                                            <textarea 
                                                rows={2}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-5 font-bold outline-none focus:border-gray-400 transition-all resize-none placeholder:text-gray-300"
                                                placeholder="House/Road/Area..."
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleConfirmOrder}
                                        disabled={isSubmitting}
                                        className="w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                                        style={{ backgroundColor: c?.primary || settings.primaryColor }}
                                    >
                                        {isSubmitting ? 'Processing...' : 'Confirm Order'}
                                        {!isSubmitting && <CheckCircle2 size={18} />}
                                    </button>

                                    <div className="flex items-center justify-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                        <ShieldCheck size={14} /> Safe & Secure Cash on Delivery
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full p-12 flex flex-col items-center justify-center text-center space-y-6 bg-white py-20 min-h-[500px]">
                                <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }} 
                                    className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
                                    style={{ backgroundColor: c?.primary || settings.primaryColor }}
                                >
                                    <CheckCircle2 size={48} className="text-white" />
                                </motion.div>
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Order Confirmed!</h2>
                                    <p className="text-gray-500 font-bold max-w-sm mx-auto">Your order has been placed successfully. We are redirecting you to WhatsApp to complete the process.</p>
                                </div>

                                <div className="pt-8 w-full max-w-xs space-y-3">
                                    <button
                                        onClick={() => window.open(`https://wa.me/+8801771357329?text=${encodedMsg}`, '_blank')}
                                        className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black uppercase tracking-wider text-[11px] rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        <MessageCircle size={18} /> Open in WhatsApp
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(decodeURIComponent(encodedMsg));
                                            alert("Message copied! Please paste it in IMO.");
                                            window.open('intent://#Intent;scheme=imo;package=com.imo.android.imoim;end', '_blank');
                                        }}
                                        className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-black uppercase tracking-wider text-[11px] rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        <Phone size={18} /> Send via IMO
                                    </button>
                                    <button
                                        onClick={() => setCheckoutDrawerOpen(false)}
                                        className="w-full py-4 text-gray-500 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-gray-50 transition-all border border-gray-200"
                                    >
                                        Close Window
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;
