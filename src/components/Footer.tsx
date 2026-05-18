import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin, MessageCircle, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslate } from '../hooks/useTranslate';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Footer: React.FC = () => {
  const { settings } = useApp();
  const { t } = useTranslate();
  const vis = settings.customization?.visibility;
  const col = settings.customization?.colors;

  if (vis?.footer === false) return null;

  return (
    <footer 
      className="pt-12 pb-6"
      style={{ 
        backgroundColor: col?.footerBg || '#111827',
        color: col?.footerText || '#d1d5db'
      }}
    >
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-black tracking-tighter" style={{ color: col?.footerTitle || 'white' }}>
            {settings.customization?.text?.websiteName || settings.logoText}
          </h2>
          <p className="text-sm leading-relaxed">
            {t(
              'বাংলাদেশের সেরা ই-কমার্স প্ল্যাটফর্ম। ইলেকট্রনিক্স, ফ্যাশন এবং ঘরোয়া প্রয়োজনীয় জিনিসের একটি বিশাল সংগ্রহ। কোয়ালিটি প্রোডাক্ট, ফাস্ট ডেলিভারি।',
              'Your premium destination for the latest electronics, fashion, and home essentials in Bangladesh. Quality products, lightning-fast delivery.'
            )}
          </p>
          {vis?.socialLinks !== false && (
            <div className="flex gap-4">
              {settings.companyInfo?.facebookProfile && (
                <a href={settings.companyInfo.facebookProfile} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:scale-110 transform"><Facebook size={20} /></a>
              )}
              {settings.companyInfo?.facebookPage && (
                <a href={settings.companyInfo.facebookPage} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:scale-110 transform"><Facebook size={20} /></a>
              )}
              {settings.companyInfo?.instagram && (
                <a href={settings.companyInfo.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:scale-110 transform"><Instagram size={20} /></a>
              )}
              {settings.companyInfo?.whatsapp && (
                <a href={settings.companyInfo.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:scale-110 transform"><MessageCircle size={20} /></a>
              )}
              {settings.companyInfo?.imo && (
                <a href={settings.companyInfo.imo} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:scale-110 transform"><MessageSquare size={20} /></a>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-black uppercase mb-6 tracking-widest" style={{ color: col?.footerTitle || 'white' }}>{t('কাস্টমার সার্ভিস', 'Customer Service')}</h3>
          <ul className="space-y-3 text-xs font-bold uppercase tracking-widest opacity-80">
            <li><Link to="/" className="hover:text-white transition-colors">{t('হেল্প সেন্টার', 'Help Center')}</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">{t('কিভাবে কিনবেন', 'How to Buy')}</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">{t('রিফান্ড এবং রিটার্ন', 'Returns & Refunds')}</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">{t('শর্তাবলী', 'Terms & Conditions')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-black uppercase mb-6 tracking-widest" style={{ color: col?.footerTitle || 'white' }}>{t('দ্রুত লিঙ্ক', 'Quick Links')}</h3>
          <ul className="space-y-3 text-xs font-bold uppercase tracking-widest opacity-80">
            <li><Link to="/" className="hover:text-white transition-colors">{t('সব পণ্যের তালিকা', 'All Products')}</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">{t('অ্যাডমিন লগইন', 'Admin Login')}</Link></li>
          </ul>
        </div>

        {/* VIP Premium WhatsApp Complaint Box */}
        <div className="lg:col-span-2">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-primary rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#0a0f18] rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-none mb-1">
                      {t('অভিযোগ বক্স', 'Complaint Box')}
                    </h3>
                    <p className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em]">
                      {t('সরাসরি আমাদের মেসেজ পাঠান', 'Elevated Support Channel')}
                    </p>
                  </div>
                </div>
                
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get('name');
                    const phone = formData.get('phone');
                    const message = formData.get('message');
                    const text = `*New VIP Complaint*\n\n👤 *Name:* ${name}\n📱 *Phone:* ${phone}\n\n📝 *Message:* ${message}`;
                    const encodedMessage = encodeURIComponent(text);

                    // 1. Save to Firestore
                    try {
                      await addDoc(collection(db, 'complaints'), {
                        name,
                        phone,
                        message,
                        createdAt: serverTimestamp()
                      });
                      alert("Message submitted successfully!");
                    } catch (error) {
                      console.error("Error saving complaint:", error);
                      alert("Firebase save failed, redirecting to WhatsApp...");
                    }
                    
                    // 2. WhatsApp Redirection
                    const dynamicPhone = settings.companyInfo?.phone || "01771357329";
                    const whatsappNumber = dynamicPhone.replace(/\D/g, ''); // Strip non-digits
                    // Make sure it has country code if omitted
                    const finalNumber = whatsappNumber.startsWith('880') ? whatsappNumber : `88${whatsappNumber}`;
                    
                    window.open(`https://wa.me/${finalNumber}?text=${encodedMessage}`, '_blank');
                    (e.target as HTMLFormElement).reset();
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('আপনার নাম', 'Owner Name')}</label>
                      <input 
                        name="name"
                        type="text" 
                        required
                        placeholder="আপনার নাম..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none text-white placeholder:text-gray-700 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('ফোন নম্বর', 'Contact No')}</label>
                      <input 
                        name="phone"
                        type="tel" 
                        required
                        placeholder="আপনার নম্বর..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none text-white placeholder:text-gray-700 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('অভিযোগ বা বার্তা', 'Message Details')}</label>
                    <textarea 
                      name="message"
                      required
                      placeholder="এখানে বিস্তারিত লিখুন..."
                      rows={4}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none text-white placeholder:text-gray-700 transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="group-submit w-full py-5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-[4px] rounded-3xl shadow-[0_20px_40px_-10px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(249,115,22,0.5)] active:scale-[0.98] transition-all duration-300 relative overflow-hidden"
                  >
                    <span className="relative z-10">{t('মেসেজ পাঠান', 'Submit Message')}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-black uppercase mb-6 tracking-widest" style={{ color: col?.footerTitle || 'white' }}>{t('যোগাযোগ', 'Contact Info')}</h3>
          <div className="flex items-start gap-3 text-sm flex-wrap">
            <MapPin size={18} className="mt-1 flex-shrink-0" style={{ color: col?.primary || settings.primaryColor }} />
            <span>{settings.companyInfo?.address || '380/1, Road, East Rampura, Dhaka -1219'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone size={18} className="flex-shrink-0" style={{ color: col?.primary || settings.primaryColor }} />
            <span>{settings.companyInfo?.phone || '+8801771357329'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail size={18} className="flex-shrink-0" style={{ color: col?.primary || settings.primaryColor }} />
            <span>{settings.companyInfo?.email || 'tamgedislam69@gmail.com'}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest opacity-60">
        <p>© 2026 {settings.customization?.text?.websiteName || settings.logoText}. All Rights Reserved.</p>
        <div className="flex gap-4">
          <img loading="lazy" src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-6 opacity-80" />
          <img loading="lazy" src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-6 opacity-80" />
          <img loading="lazy" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Bkash_logo.png/512px-Bkash_logo.png" alt="bKash" className="h-4 opacity-80 object-contain" />
          <span className="bg-white/5 px-2 py-1 rounded text-[10px]">{t('ক্যাশ অন ডেলিভারি', 'CASH ON DELIVERY')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
