import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Phone, Mail, MapPin, Facebook, Instagram, MessageSquare, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ref, set, onValue } from 'firebase/database';
import { rtdb } from '../lib/firebase';

export default function SiteSettingsTab() {
    const { settings, updateSettings } = useApp();
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [form, setForm] = useState({
        phone: '01771357329',
        email: 'tamgedislam69@gmail.com',
        address: '380/1, Road, East Rampura, Dhaka -1219',
        facebookProfile: '',
        facebookPage: '',
        instagram: '',
        whatsapp: '',
        imo: ''
    });

    useEffect(() => {
        if (settings.companyInfo) {
            setForm(settings.companyInfo);
        }
    }, [settings.companyInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await set(ref(rtdb, 'settings'), form);
            updateSettings({ ...settings, companyInfo: form });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving site settings:", error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="pb-6 border-b border-gray-100">
                <h2 className="text-2xl font-black uppercase tracking-tight">Globe Site Settings</h2>
                <p className="text-gray-400 text-sm mt-1">Manage global contact channels and social media links</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8 bg-gray-50 p-8 rounded-3xl border border-gray-100">
                
                {/* Contact Information */}
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 mb-4 flex items-center gap-2">
                        <MapPin size={18} className="text-orange-500" /> Contact Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-1">
                                <Phone size={12} /> Phone Number
                            </label>
                            <input 
                                name="phone" value={form.phone} onChange={handleChange} required
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-1">
                                <Mail size={12} /> Email Address
                            </label>
                            <input 
                                name="email" value={form.email} onChange={handleChange} type="email" required
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-1">
                                <MapPin size={12} /> Full Address
                            </label>
                            <input 
                                name="address" value={form.address} onChange={handleChange} required
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media Links */}
                <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-800 mb-4 flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-500" /> Social Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-1">
                                <Facebook size={12} /> Facebook Profile URL
                            </label>
                            <input 
                                name="facebookProfile" value={form.facebookProfile} onChange={handleChange}
                                placeholder="https://facebook.com/your-profile"
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-1">
                                <Facebook size={12} /> Facebook Page URL
                            </label>
                            <input 
                                name="facebookPage" value={form.facebookPage} onChange={handleChange}
                                placeholder="https://facebook.com/your-page"
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-1">
                                <Instagram size={12} /> Instagram URL
                            </label>
                            <input 
                                name="instagram" value={form.instagram} onChange={handleChange}
                                placeholder="https://instagram.com/your-page"
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-1">
                                <Phone size={12} /> WhatsApp Link
                            </label>
                            <input 
                                name="whatsapp" value={form.whatsapp} onChange={handleChange}
                                placeholder="https://wa.me/..."
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1 flex items-center gap-1">
                                <MessageSquare size={12} /> IMO Link
                            </label>
                            <input 
                                name="imo" value={form.imo} onChange={handleChange}
                                placeholder="IMO Link..."
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200 flex justify-end">
                    {showSuccess ? (
                        <div className="py-4 px-8 bg-green-500 text-white font-black uppercase tracking-widest rounded-xl shadow-xl flex items-center gap-2">
                            <CheckCircle2 size={20} /> Settings Saved
                        </div>
                    ) : (
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="py-4 px-8 bg-gray-900 text-white font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-gray-800 disabled:opacity-70 transition-colors flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    )}
                </div>

            </form>
        </motion.div>
    );
}
