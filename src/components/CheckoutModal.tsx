import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShoppingCart, MessageCircle, Phone, Smartphone, MapPin, Map, Navigation2, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice, cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ALL_DISTRICTS } from '../lib/geo';

interface OrderItem {
    id: string;
    productName: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
}

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
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    
    // Delivery Details
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedThana, setSelectedThana] = useState('');
    const [address, setAddress] = useState('');

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
            setName('');
            setPhone('');
            setAddress('');
            setSelectedDistrict('');
            setSelectedThana('');
            setOrderItems([]);
        }
    }, [selectedProductForCheckout]);

    if (!selectedProductForCheckout) return null;
    const product = selectedProductForCheckout;

    // Delivery Charge Logic
    let deliveryCharge = 0;
    if (selectedDistrict) {
        deliveryCharge = selectedDistrict.toLowerCase() === 'dhaka' ? 60 : 130;
    } else {
        deliveryCharge = 0;
    }

    const currentSubtotal = orderItems.length > 0 
        ? orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        : (product.price * quantity);

    const totalItemsCount = orderItems.length > 0 
        ? orderItems.reduce((acc, item) => acc + item.quantity, 0)
        : quantity;

    const grandTotal = currentSubtotal + deliveryCharge;

    const handleAddToList = () => {
        const newErrors: Record<string, string> = {};
        if (product.enableSizes && product.variants?.sizes?.length > 0 && !selectedSize) {
            newErrors.size = 'Please select a size';
        }
        if (product.enableColors && product.variants?.colors?.length > 0 && !selectedColor) {
            newErrors.color = 'Please select a color';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors({...errors, ...newErrors});
            return;
        }

        setErrors({...errors, color: '', size: ''});
        
        const existingIdx = orderItems.findIndex(i => i.color === selectedColor && i.size === selectedSize);
        if (existingIdx >= 0) {
            const updated = [...orderItems];
            updated[existingIdx].quantity += quantity;
            setOrderItems(updated);
        } else {
            setOrderItems([...orderItems, {
                id: Date.now().toString(),
                productName: product.name,
                color: selectedColor,
                size: selectedSize,
                quantity: quantity,
                price: product.price
            }]);
        }
        
        setQuantity(1);
    };

    const handleRemoveItem = (id: string) => {
        setOrderItems(orderItems.filter(item => item.id !== id));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^01[3-9]\d{8}$/.test(phone)) {
            newErrors.phone = 'Invalid 11-digit number (e.g. 017xxxxxxxx)';
        }
        if (!selectedDistrict) newErrors.district = 'District is required';
        if (!selectedThana) newErrors.thana = 'Thana is required';
        
        if (orderItems.length === 0) {
            if (product.enableSizes && product.variants?.sizes?.length > 0 && !selectedSize) {
                newErrors.size = 'Please select a size';
            }
            if (product.enableColors && product.variants?.colors?.length > 0 && !selectedColor) {
                newErrors.color = 'Please select a color';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirmOrder = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        const orderId = `ORD-${Date.now()}`;
        
        let finalOrderItems = orderItems.length > 0 ? orderItems : [{
            id: Date.now().toString(),
            productName: product.name,
            color: selectedColor,
            size: selectedSize,
            quantity: quantity,
            price: product.price
        }];

        const itemsText = finalOrderItems.map((item, idx) => {
            const parts = [];
            if (item.color) parts.push(`🎨 *Color:* ${item.color}`);
            if (item.size) parts.push(`📐 *Size:* ${item.size}`);
            const details = parts.length > 0 ? `\n${parts.join('\n')}` : '';
            return `📦 *Item ${idx + 1}:* ${item.productName}${details}\n🔢 *Quantity:* ${item.quantity}\n💰 *Sub:* ${item.price * item.quantity} BDT`;
        }).join('\n\n');

        const message = `🚀 *Order Details - ${orderId}*
-------------------------
${itemsText}
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
            items: finalOrderItems.map(i => ({
                id: product.id,
                name: i.productName,
                quantity: i.quantity,
                selectedColor: i.color,
                selectedSize: i.size,
                price: i.price,
                image: product.image
            })),
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

    const activeDistrictObj = ALL_DISTRICTS.find(d => d.name === selectedDistrict);
    const availableThanas = activeDistrictObj ? activeDistrictObj.upazilas.map(u => u.name) : [];

    return (
        <AnimatePresence>
            {checkoutDrawerOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-md">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="bg-white w-full max-w-5xl rounded-[2rem] max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col lg:flex-row border border-gray-100"
                    >
                        <button 
                            onClick={() => setCheckoutDrawerOpen(false)}
                            className="absolute top-6 right-6 z-10 p-3 bg-gray-100/80 backdrop-blur-md rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors shadow-sm"
                        >
                            <X size={20} />
                        </button>

                        {!showSuccess ? (
                            <>
                                {/* Left Side: Product Details & Live Bill summary */}
                                <div className="w-full lg:w-[45%] bg-[#F9FAFB] p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto hidden-scrollbar">
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Order Summary</h2>
                                            <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">Verify your items</p>
                                        </div>

                                        <div className="flex gap-5 items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                                            <div className="w-24 h-24 rounded-2xl bg-gray-50 overflow-hidden shrink-0">
                                                {product.image ? (
                                                    <img loading="lazy" src={product.image} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingCart size={24}/></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-sm text-gray-900 leading-tight mb-2 line-clamp-2">{product.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-lg" style={{ color: c?.primary || settings.primaryColor }}>
                                                        {formatPrice(product.price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {product.enableColors && product.variants?.colors && product.variants.colors.length > 0 && (
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex justify-between">
                                                        Select Color 
                                                        {errors.color && <span className="text-red-500">{errors.color}</span>}
                                                    </label>
                                                    <div className="flex flex-wrap gap-3">
                                                        {product.variants.colors.flatMap(cg => cg.name.split(',').map(s=>s.trim()).filter(Boolean)).map(color => (
                                                            <button
                                                                key={color}
                                                                onClick={() => { setSelectedColor(color); setErrors({...errors, color: ''}) }}
                                                                className={cn(
                                                                    "w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center flex-col gap-1 shadow-sm",
                                                                    selectedColor === color ? "scale-110 shadow-md" : "border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100"
                                                                )}
                                                                style={selectedColor === color ? { borderColor: c?.primary || settings.primaryColor } : {}}
                                                                title={color}
                                                            >
                                                                <div className="w-8 h-8 rounded-full shadow-inner border border-black/5" style={{ backgroundColor: color.toLowerCase().replace(/\s/g, '') }} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {product.enableSizes && product.variants?.sizes && product.variants.sizes.length > 0 && (
                                                <div className="space-y-3">
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
                                                                    "px-5 py-2.5 rounded-2xl text-sm font-bold uppercase transition-all shadow-sm",
                                                                    selectedSize === size 
                                                                    ? "text-white shadow-md" 
                                                                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                                )}
                                                                style={selectedSize === size ? { backgroundColor: c?.primary || settings.primaryColor } : {}}
                                                            >
                                                                {size}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                 <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Quantity</label>
                                                 <div className="flex items-center w-full max-w-[200px] bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-xl hover:bg-gray-50 flex items-center justify-center font-bold text-gray-500 transition-colors">
                                                        -
                                                    </button>
                                                    <span className="flex-1 text-center font-black text-xl">{quantity}</span>
                                                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 rounded-xl hover:bg-gray-50 flex items-center justify-center font-bold text-gray-500 transition-colors">
                                                        +
                                                    </button>
                                                 </div>
                                            </div>

                                            <button 
                                                onClick={handleAddToList}
                                                className="w-full py-4 text-xs font-black uppercase tracking-widest bg-gray-900 text-white rounded-2xl shadow-md hover:bg-gray-800 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                            >
                                                <Plus size={16} /> Add to Order List
                                            </button>

                                            {/* Visual Order List */}
                                            {orderItems.length > 0 && (
                                                <div className="mt-8 space-y-3 pt-6 border-t border-gray-200/60">
                                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex justify-between items-center">
                                                        Your Selection
                                                        <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full">{orderItems.length} items</span>
                                                    </label>
                                                    <div className="space-y-2 max-h-[160px] overflow-y-auto hidden-scrollbar">
                                                        <AnimatePresence initial={false}>
                                                            {orderItems.map(item => (
                                                                <motion.div 
                                                                    key={item.id}
                                                                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                                                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                                                    className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm"
                                                                >
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="font-bold text-sm text-gray-900 line-clamp-1 pr-2">
                                                                            {item.quantity}x {item.productName}
                                                                        </span>
                                                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                            {item.color && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: item.color.toLowerCase() }}></div>
                                                                                    {item.color}
                                                                                </span>
                                                                            )}
                                                                            {item.color && item.size && <span className="opacity-40">|</span>}
                                                                            {item.size && <span>Size: {item.size}</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 shrink-0">
                                                                        <span className="font-black text-sm text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                                                                        <button onClick={() => handleRemoveItem(item.id)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-12 space-y-4 pt-6 border-t border-gray-200/60 pb-8 lg:pb-0">
                                        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                            <span>Subtotal ({totalItemsCount} items)</span>
                                            <span>{formatPrice(currentSubtotal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                            <span>Delivery Charge</span>
                                            <div className="flex flex-col items-end">
                                                <span>{deliveryCharge ? formatPrice(deliveryCharge) : 'Calculated on location'}</span>
                                                {!selectedDistrict && <span className="text-[10px] text-orange-500">Select district</span>}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-xl font-black text-gray-900 pt-4 border-t border-gray-200">
                                            <span>Total</span>
                                            <span style={{ color: c?.primary || settings.primaryColor }}>{formatPrice(grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Customer Info form */}
                                <div className="w-full lg:w-[55%] p-8 lg:p-12 space-y-8 bg-white overflow-y-auto hidden-scrollbar">
                                    <div>
                                        <span className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
                                            <Navigation2 size={24} />
                                        </span>
                                        <h2 className="text-3xl font-black tracking-tight text-gray-900">Delivery Details</h2>
                                        <p className="text-sm font-medium text-gray-500 mt-2">Enter your destination to compute final delivery cost automatically.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1 flex justify-between">
                                                    Full Name * {errors.name && <span className="text-red-500 normal-case">{errors.name}</span>}
                                                </label>
                                                <input 
                                                    className={cn(
                                                        "w-full bg-[#f8fafc] border rounded-2xl py-4 px-5 font-bold outline-none focus:border-gray-400 transition-all placeholder:text-gray-400",
                                                        errors.name ? "border-red-500 ring-1 ring-red-500/20" : "border-gray-200"
                                                    )}
                                                    placeholder="e.g. John Doe"
                                                    value={name}
                                                    onChange={(e) => { setName(e.target.value); setErrors({...errors, name: ''}) }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1 flex justify-between">
                                                    Phone Number * {errors.phone && <span className="text-red-500 normal-case">{errors.phone}</span>}
                                                </label>
                                                <input 
                                                    type="tel"
                                                    className={cn(
                                                        "w-full bg-[#f8fafc] border rounded-2xl py-4 px-5 font-mono font-bold outline-none focus:border-gray-400 transition-all placeholder:text-gray-400",
                                                        errors.phone ? "border-red-500 ring-1 ring-red-500/20" : "border-gray-200"
                                                    )}
                                                    placeholder="01XXXXXXXXX"
                                                    maxLength={11}
                                                    value={phone}
                                                    onChange={(e) => { setPhone(e.target.value.replace(/[^0-9]/g, '')); setErrors({...errors, phone: ''}) }}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2 relative">
                                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1 flex justify-between">
                                                    District * {errors.district && <span className="text-red-500 normal-case">{errors.district}</span>}
                                                </label>
                                                <div className="relative">
                                                    <select 
                                                        className={cn(
                                                            "w-full bg-[#f8fafc] border rounded-2xl py-4 pl-5 pr-12 font-bold outline-none focus:border-gray-400 transition-all appearance-none cursor-pointer",
                                                            errors.district ? "border-red-500 ring-1 ring-red-500/20 text-red-900" : "border-gray-200 text-gray-700",
                                                            !selectedDistrict && "text-gray-400"
                                                        )}
                                                        value={selectedDistrict}
                                                        onChange={(e) => {
                                                            setSelectedDistrict(e.target.value);
                                                            setSelectedThana(''); // Reset thana when district changes
                                                            setErrors({...errors, district: '', thana: ''})
                                                        }}
                                                    >
                                                        <option value="" disabled>Select District</option>
                                                        {ALL_DISTRICTS.map(d => (
                                                            <option key={d.name} value={d.name} className="text-gray-900 font-medium">{d.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <Map size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2 relative">
                                                <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1 flex justify-between">
                                                    Thana * {errors.thana && <span className="text-red-500 normal-case">{errors.thana}</span>}
                                                </label>
                                                <div className="relative">
                                                    <select 
                                                        className={cn(
                                                            "w-full bg-[#f8fafc] border rounded-2xl py-4 pl-5 pr-12 font-bold outline-none focus:border-gray-400 transition-all appearance-none",
                                                            errors.thana ? "border-red-500 ring-1 ring-red-500/20 text-red-900" : "border-gray-200 text-gray-700",
                                                            !selectedDistrict ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                                                            !selectedThana && "text-gray-400"
                                                        )}
                                                        value={selectedThana}
                                                        disabled={!selectedDistrict}
                                                        onChange={(e) => { setSelectedThana(e.target.value); setErrors({...errors, thana: ''}) }}
                                                    >
                                                        <option value="" disabled>Select Thana</option>
                                                        {availableThanas.map(t => (
                                                            <option key={t} value={t} className="text-gray-900 font-medium">{t}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <MapPin size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest ml-1">Street Address (Optional)</label>
                                            <textarea 
                                                rows={2}
                                                className="w-full bg-[#f8fafc] border border-gray-200 rounded-2xl py-4 px-5 font-bold outline-none focus:border-gray-400 transition-all resize-none placeholder:text-gray-400"
                                                placeholder="House/Road/Area..."
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={handleConfirmOrder}
                                            disabled={isSubmitting}
                                            className="w-full py-5 rounded-2xl text-white font-black uppercase tracking-widest text-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
                                            style={{ backgroundColor: c?.primary || settings.primaryColor }}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">Processing <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><ShoppingCart size={18} /></motion.div></span>
                                            ) : (
                                                <>Confirm Order <CheckCircle2 size={18} /></>
                                            )}
                                        </button>
                                        <p className="text-center text-xs font-bold text-gray-400 mt-4 uppercase tracking-widest">
                                            Pay dynamically upon Delivery
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full p-8 lg:p-16 flex flex-col items-center justify-center text-center bg-white min-h-[600px]">
                                <motion.div 
                                    initial={{ scale: 0, rotate: -180 }} 
                                    animate={{ scale: 1, rotate: 0 }} 
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="w-28 h-28 rounded-[2rem] flex items-center justify-center shadow-2xl mb-8"
                                    style={{ backgroundColor: c?.primary || settings.primaryColor }}
                                >
                                    <CheckCircle2 size={56} className="text-white" />
                                </motion.div>
                                
                                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl font-black text-gray-900 tracking-tight mb-4">Order Confirmed!</motion.h2>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-gray-500 font-medium text-lg max-w-md mx-auto mb-10 leading-relaxed">
                                    Your order has been recorded securely. Let's finish up in your preferred messaging app.
                                </motion.p>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full max-w-sm space-y-4">
                                    <button
                                        onClick={() => window.open(`https://wa.me/+8801771357329?text=${encodedMsg}`, '_blank')}
                                        className="w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black hover:-translate-y-1 uppercase tracking-widest text-[11px] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
                                    >
                                        <MessageCircle size={20} /> Continue with WhatsApp
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(decodeURIComponent(encodedMsg));
                                            window.open('intent://#Intent;scheme=imo;package=com.imo.android.imoim;end', '_blank');
                                        }}
                                        className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-black hover:-translate-y-1 uppercase tracking-widest text-[11px] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
                                    >
                                        <Phone size={20} /> Send via IMO
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(decodeURIComponent(encodedMsg));
                                            window.open('https://m.me/your_page_username_or_id', '_blank');
                                        }}
                                        className="w-full py-4 bg-[#006AFF] hover:bg-[#005FE6] text-white font-black hover:-translate-y-1 uppercase tracking-widest text-[11px] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
                                    >
                                        <Smartphone size={20} /> Messenger (m.me)
                                    </button>
                                    
                                    <div className="pt-4 mt-8 border-t border-gray-100">
                                        <button
                                            onClick={() => setCheckoutDrawerOpen(false)}
                                            className="text-gray-400 hover:text-gray-600 font-bold uppercase tracking-widest text-xs transition-colors"
                                        >
                                            Close Window
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;
