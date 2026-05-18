import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShoppingCart, MessageCircle, Phone, Smartphone, MapPin, Map, Navigation2, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice, cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ALL_DISTRICTS } from '../lib/geo';

const CheckoutModal: React.FC = () => {
    const { 
        checkoutDrawerOpen, 
        setCheckoutDrawerOpen, 
        selectedProductForCheckout, 
        settings, 
        addOrder
    } = useApp();

    const [quantity, setQuantity] = useState(1);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    
    // Delivery Details
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedThana, setSelectedThana] = useState('');
    const [address, setAddress] = useState(''); // explicitly labeled non-mandatory

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [encodedMsg, setEncodedMsg] = useState('');

    const c = settings.customization?.colors;

    useEffect(() => {
        if (selectedProductForCheckout) {
            setQuantity(1);
            setSelectedColors([]);
            setSelectedSizes([]);
            setShowSuccess(false);
            setErrors({});
            setName('');
            setPhone('');
            setAddress('');
            setSelectedDistrict('');
            setSelectedThana('');
        }
    }, [selectedProductForCheckout]);

    if (!selectedProductForCheckout) return null;
    const product = selectedProductForCheckout;

    // Use product.colors and product.sizes arrays if they exist
    const availableColors = product.colors || (product.variants?.colors?.[0]?.name.split(',').map(s=>s.trim()).filter(Boolean)) || [];
    const availableSizes = product.sizes || (product.variants?.sizes?.[0]?.name.split(',').map(s=>s.trim()).filter(Boolean)) || [];

    let deliveryCharge = 0;
    if (selectedDistrict) {
        deliveryCharge = selectedDistrict.toLowerCase() === 'dhaka' ? 60 : 130;
    }

    const currentSubtotal = product.price * quantity;
    const grandTotal = currentSubtotal + deliveryCharge;

    const handleColorPick = (color: string) => {
        if (!selectedColors.includes(color)) setSelectedColors([...selectedColors, color]);
        setErrors({...errors, color: ''});
    };

    const handleColorRemove = (color: string) => {
        setSelectedColors(selectedColors.filter(c => c !== color));
    };

    const handleSizePick = (size: string) => {
        if (!selectedSizes.includes(size)) setSelectedSizes([...selectedSizes, size]);
        setErrors({...errors, size: ''});
    };

    const handleSizeRemove = (size: string) => {
        setSelectedSizes(selectedSizes.filter(s => s !== size));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = 'Required';
        if (!phone.trim()) {
            newErrors.phone = 'Required';
        } else if (!/^01[3-9]\d{8}$/.test(phone)) {
            newErrors.phone = 'Invalid 11-digit number';
        }
        if (!selectedDistrict) newErrors.district = 'Required';
        if (!selectedThana) newErrors.thana = 'Required';
        
        if (availableColors.length > 0 && selectedColors.length === 0) {
            newErrors.color = 'Pick at least one color';
        }
        if (availableSizes.length > 0 && selectedSizes.length === 0) {
            newErrors.size = 'Pick at least one size';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirmOrder = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        const orderId = `ORD-${Date.now()}`;

        const colorStr = selectedColors.length > 0 ? `🎨 *Colors:* ${selectedColors.join(', ')}` : '';
        const sizeStr = selectedSizes.length > 0 ? `📐 *Sizes:* ${selectedSizes.join(', ')}` : '';

        const message = `🚀 *Order Details - ${orderId}*
-------------------------
📦 *Item:* ${product.name}
🔢 *Quantity:* ${quantity}
💰 *Subtotal:* ${currentSubtotal} BDT
${colorStr}
${sizeStr}
-------------------------
👤 *Name:* ${name}
📱 *Phone:* ${phone}
🗺️ *District:* ${selectedDistrict}
📍 *Thana:* ${selectedThana}
${address ? `🏢 *Address:* ${address}\n` : ''}-------------------------
💵 *Cart Subtotal:* ${currentSubtotal} BDT
🚚 *Delivery:* ${deliveryCharge} BDT
💳 *GRAND TOTAL:* ${grandTotal} BDT`;

        const encodedMessage = encodeURIComponent(message);
        setEncodedMsg(encodedMessage);

        const newOrder = {
            id: orderId,
            items: [{
                id: product.id,
                name: product.name,
                quantity: quantity,
                selectedColors: selectedColors,
                selectedSizes: selectedSizes,
                price: product.price,
                image: product.image
            }],
            total: grandTotal,
            customer: {
                name,
                phone,
                district: selectedDistrict,
                thana: selectedThana,
                address,
                location: selectedDistrict.toLowerCase() === 'dhaka' ? 'inside' : 'outside'
            },
            paymentMethod: 'cod',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, 'orders'), {
                ...newOrder,
                serverTimestamp: serverTimestamp()
            });
            
            addOrder(newOrder);

            setShowSuccess(true);
            
            // Clean fields upon success animation trigger
            setName('');
            setPhone('');
            setAddress('');
            setSelectedDistrict('');
            setSelectedThana('');
            setQuantity(1);
            setSelectedColors([]);
            setSelectedSizes([]);

        } catch (error) {
            console.error("Order submission failed:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const activeDistrictObj = ALL_DISTRICTS.find(d => d.name === selectedDistrict);
    const availableThanas = activeDistrictObj ? activeDistrictObj.upazilas.map(u => u.name) : [];

    return (
        <AnimatePresence>
            {checkoutDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="bg-white w-full max-w-2xl rounded-3xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col font-sans"
                    >
                        {/* Header Info */}
                        <div className="bg-gray-50 border-b border-gray-100 p-5 pr-14 relative shrink-0">
                             <button 
                                onClick={() => setCheckoutDrawerOpen(false)}
                                className="absolute top-5 right-5 p-2 bg-white rounded-full text-gray-500 hover:text-gray-900 shadow-sm border border-gray-100 transition-colors"
                             >
                                 <X size={20} />
                             </button>
                             <div className="flex gap-4 items-center">
                                 <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 overflow-hidden shrink-0 shadow-sm">
                                     {product.image ? (
                                         <img loading="lazy" src={product.image} className="w-full h-full object-cover" />
                                     ) : (
                                         <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingCart size={20}/></div>
                                     )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <h3 className="font-black text-gray-900 leading-tight line-clamp-1 text-lg truncate pr-4">{product.name}</h3>
                                     <div className="flex items-baseline gap-2 mt-1">
                                         <span className="font-black text-xl" style={{ color: c?.primary || settings.primaryColor }}>
                                             {formatPrice(product.price)}
                                         </span>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        {/* Body Scrollable Area */}
                        <div className="flex-1 overflow-y-auto hidden-scrollbar p-6 space-y-8 bg-white">
                            {!showSuccess ? (
                                <>
                                    {/* Variant & Quantity Selection */}
                                    <div className="space-y-6">
                                        {/* Colors */}
                                        {availableColors.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Colors:</span>
                                                    <div className="flex gap-2 flex-wrap items-center">
                                                        {selectedColors.map(color => (
                                                            <div key={color} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-bold shadow-sm">
                                                                <span className="w-3 h-3 rounded-full border border-gray-600 inline-block" style={{ backgroundColor: color.toLowerCase() }} />
                                                                {color}
                                                                <button onClick={() => handleColorRemove(color)} className="ml-1 text-gray-400 hover:text-red-400 transition-colors"><X size={14}/></button>
                                                            </div>
                                                        ))}
                                                        {errors.color && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.color}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {availableColors.map(color => {
                                                        if (selectedColors.includes(color)) return null;
                                                        return (
                                                            <button
                                                                key={color}
                                                                type="button"
                                                                onClick={() => handleColorPick(color)}
                                                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-500 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                                                            >
                                                                <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: color.toLowerCase() }} />
                                                                {color}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sizes */}
                                        {availableSizes.length > 0 && (
                                            <div className="border-t border-gray-100 pt-6 space-y-3">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Sizes:</span>
                                                    <div className="flex gap-2 flex-wrap items-center">
                                                        {selectedSizes.map(size => (
                                                            <div key={size} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-full text-xs font-bold shadow-sm">
                                                                {size}
                                                                <button onClick={() => handleSizeRemove(size)} className="ml-1 text-gray-400 hover:text-red-400 transition-colors"><X size={14}/></button>
                                                            </div>
                                                        ))}
                                                        {errors.size && <span className="text-[10px] text-red-500 font-bold uppercase">{errors.size}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {availableSizes.map(size => {
                                                        if (selectedSizes.includes(size)) return null;
                                                        return (
                                                            <button
                                                                key={size}
                                                                type="button"
                                                                onClick={() => handleSizePick(size)}
                                                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-gray-500 hover:bg-gray-50 transition-all shadow-sm uppercase"
                                                            >
                                                                {size}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
                                             <span className="text-xs font-black uppercase tracking-widest text-gray-400">Quantity</span>
                                             <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 shadow-inner overflow-hidden w-[120px]">
                                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-200 transition-colors">-</button>
                                                <span className="flex-1 text-center font-black">{quantity}</span>
                                                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center font-bold text-gray-500 hover:bg-gray-200 transition-colors">+</button>
                                             </div>
                                        </div>
                                    </div>

                                    {/* Customer Details Form */}
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                                        <div className="flex items-center gap-2 mb-2 text-gray-800">
                                            <Navigation2 size={18} />
                                            <h3 className="font-black tracking-tight text-lg uppercase">Delivery Info</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex justify-between">
                                                    Full Name {errors.name && <span className="text-red-500">Required</span>}
                                                </label>
                                                <input 
                                                    className={cn(
                                                        "w-full bg-white border rounded-xl py-3 px-4 font-bold outline-none focus:border-gray-400 transition-all shadow-sm",
                                                        errors.name ? "border-red-500 ring-1 ring-red-500/20" : "border-gray-200"
                                                    )}
                                                    placeholder="John Doe"
                                                    value={name}
                                                    onChange={(e) => { setName(e.target.value); setErrors({...errors, name: ''}) }}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex justify-between">
                                                    Phone {errors.phone && <span className="text-red-500">{errors.phone}</span>}
                                                </label>
                                                <input 
                                                    type="tel"
                                                    className={cn(
                                                        "w-full bg-white border rounded-xl py-3 px-4 font-mono font-bold outline-none focus:border-gray-400 transition-all shadow-sm",
                                                        errors.phone ? "border-red-500 ring-1 ring-red-500/20" : "border-gray-200"
                                                    )}
                                                    placeholder="01XXXXXXXXX"
                                                    maxLength={11}
                                                    value={phone}
                                                    onChange={(e) => { setPhone(e.target.value.replace(/[^0-9]/g, '')); setErrors({...errors, phone: ''}) }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex justify-between">
                                                    District {errors.district && <span className="text-red-500">Required</span>}
                                                </label>
                                                <select 
                                                    className={cn(
                                                        "w-full bg-white border rounded-xl py-3 pl-4 pr-10 font-bold outline-none focus:border-gray-400 transition-all appearance-none shadow-sm cursor-pointer",
                                                        errors.district ? "border-red-500" : "border-gray-200", !selectedDistrict && "text-gray-400"
                                                    )}
                                                    value={selectedDistrict}
                                                    onChange={(e) => {
                                                        setSelectedDistrict(e.target.value);
                                                        setSelectedThana('');
                                                        setErrors({...errors, district: '', thana: ''})
                                                    }}
                                                >
                                                    <option value="" disabled>Select District</option>
                                                    {ALL_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                                </select>
                                                <Map size={16} className="absolute right-4 top-[30px] pointer-events-none text-gray-400" />
                                            </div>
                                            <div className="relative">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex justify-between">
                                                    Thana {errors.thana && <span className="text-red-500">Required</span>}
                                                </label>
                                                <select 
                                                    className={cn(
                                                        "w-full bg-white border rounded-xl py-3 pl-4 pr-10 font-bold outline-none focus:border-gray-400 transition-all appearance-none shadow-sm",
                                                        errors.thana ? "border-red-500" : "border-gray-200", 
                                                        !selectedDistrict ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                                                        !selectedThana && "text-gray-400"
                                                    )}
                                                    value={selectedThana}
                                                    disabled={!selectedDistrict}
                                                    onChange={(e) => { setSelectedThana(e.target.value); setErrors({...errors, thana: ''}) }}
                                                >
                                                    <option value="" disabled>Select Thana</option>
                                                    {availableThanas.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                                <MapPin size={16} className="absolute right-4 top-[30px] pointer-events-none text-gray-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Detail Address (Optional)</label>
                                            <textarea 
                                                rows={2}
                                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-gray-400 transition-all resize-none shadow-sm placeholder:text-gray-400 mt-1.5"
                                                placeholder="House Name / Area / Road No..."
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                            <div className="w-full p-8 lg:p-16 flex flex-col items-center justify-center text-center bg-white min-h-[500px] relative overflow-hidden">
                                {/* Success Celebration Background Shapes */}
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <motion.div 
                                        key={i}
                                        className="absolute rounded-full pointer-events-none"
                                        initial={{ 
                                            opacity: 1, 
                                            x: "0vw", y: "0vh", 
                                            scale: Math.random() * 0.5 + 0.5 
                                        }}
                                        animate={{ 
                                            opacity: 0, 
                                            x: `${(Math.random() - 0.5) * 150}vw`, 
                                            y: `${(Math.random() - 0.5) * 150}vh`, 
                                            rotate: Math.random() * 360
                                        }}
                                        transition={{ duration: 2, ease: "easeOut" }}
                                        style={{
                                            width: `${Math.random() * 20 + 10}px`,
                                            height: `${Math.random() * 20 + 10}px`,
                                            backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#f43f5e', '#eab308'][Math.floor(Math.random() * 5)],
                                            top: '50%',
                                            left: '50%'
                                        }}
                                    />
                                ))}
                                
                                <motion.div 
                                    initial={{ scale: 0, rotate: -180 }} 
                                    animate={{ scale: 1, rotate: 0 }} 
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="w-28 h-28 rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 relative z-10"
                                    style={{ backgroundColor: c?.primary || settings.primaryColor }}
                                >
                                    <div className="absolute inset-0 rounded-[2rem] animate-ping opacity-30 bg-inherit pointer-events-none" />
                                    <CheckCircle2 size={56} className="text-white relative z-10" />
                                </motion.div>
                                
                                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl font-black text-gray-900 tracking-tight mb-4 relative z-10">Order Confirmed!</motion.h2>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-gray-500 font-medium text-lg max-w-md mx-auto mb-10 leading-relaxed relative z-10">
                                    Your order has been recorded securely. You can securely track your details or chat with our automated systems directly.
                                </motion.p>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full max-w-sm space-y-4 relative z-10">
                                    <button
                                        onClick={() => window.open(`https://wa.me/+8801732389148?text=${encodedMsg}`, '_blank')}
                                        className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black hover:-translate-y-1 uppercase tracking-widest text-[11px] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
                                    >
                                        <MessageCircle size={20} /> Continue with WhatsApp
                                    </button>
                                    <button
                                        onClick={() => { setCheckoutDrawerOpen(false); }}
                                        className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black hover:-translate-y-1 uppercase tracking-widest text-[11px] rounded-2xl transition-all flex items-center justify-center gap-3"
                                    >
                                        Close Window
                                    </button>
                                </motion.div>
                            </div>
                            )}
                        </div>

                        {/* Sticky Footer */}
                        {!showSuccess && (
                            <div className="border-t border-gray-100 bg-white p-5 space-y-4 shrink-0">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span className="uppercase tracking-widest">Subtotal ({quantity} items)</span>
                                        <span>{formatPrice(currentSubtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                        <span className="uppercase tracking-widest">Delivery Charge</span>
                                        <span className={!selectedDistrict ? "text-[10px] text-orange-500" : ""}>
                                            {selectedDistrict ? formatPrice(deliveryCharge) : 'Pending Location'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <span className="font-black uppercase tracking-widest text-sm">Total Bill</span>
                                        <span className="text-2xl font-black" style={{ color: c?.primary || settings.primaryColor }}>{formatPrice(grandTotal)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmOrder}
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-xl text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                                    style={{ backgroundColor: c?.primary || settings.primaryColor }}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">Processing <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><ShoppingCart size={14} /></motion.div></span>
                                    ) : (
                                        <>Place Order (COD) <CreditCard size={16} /></>
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;

