import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Package, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  RefreshCcw, 
  Palette, 
  Type, 
  Layout,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Users,
  FileText,
  Download,
  Printer,
  ChevronRight,
  LogOut,
  Clock,
  Calendar,
  Zap,
  Languages,
  EyeOff,
  Maximize2,
  Lock,
  Globe,
  Monitor,
  Smartphone,
  MousePointer2,
  Upload,
  Loader2,
  MessageSquare,
  User,
  Phone,
  MapPin,
  Type as TypeIcon,
  CheckCircle2
} from 'lucide-react';
import { CATEGORIES, INITIAL_SETTINGS } from '../constants';
import { Product, SiteSettings, Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, cn } from '../lib/utils';
import AdminSalesChart from '../components/AdminSalesChart';
import { useNavigate } from 'react-router-dom';

import PostManager from '../components/PostManager';
import MediaManager from '../components/MediaManager';
import ComplaintsManager from '../components/ComplaintsManager';
import SiteSettingsTab from '../components/SiteSettingsTab';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const SHOE_SIZES = ['38', '39', '40', '41', '42', '43', '44'];
const COLOR_PRESETS = [
  { name: 'Red', hex: '#FF0000', emoji: '🔴' },
  { name: 'Black', hex: '#000000', emoji: '⚫' },
  { name: 'White', hex: '#FFFFFF', emoji: '⚪' },
  { name: 'Blue', hex: '#0000FF', emoji: '🔵' },
  { name: 'Green', hex: '#008000', emoji: '🟢' },
  { name: 'Yellow', hex: '#FFFF00', emoji: '🟡' },
  { name: 'Orange', hex: '#FF6B00', emoji: '🟠' },
  { name: 'Purple', hex: '#800080', emoji: '🟣' },
  { name: 'Brown', hex: '#A52A2A', emoji: '🟤' },
  { name: 'Gray', hex: '#808080', emoji: '🩶' },
];

import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc, addDoc, serverTimestamp, getDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref as rtdbRef, push, set as rtdbSet } from 'firebase/database';
import { storage, db, rtdb } from '../lib/firebase';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { products, setProducts, settings, updateSettings, orders, setOrders, analytics, logout } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'settings' | 'site_settings' | 'orders' | 'media' | 'posts' | 'customization' | 'complaints'>('dashboard');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'video' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setIsUploading(true);
    try {
      if (target === 'image' || target === 'gallery') {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=ea1036a8338df238983a385601265de4`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data && data.success) {
           const url = data.data.url;
           if (target === 'image') {
             setEditingProduct({ ...editingProduct, image: url });
           } else {
             setEditingProduct({ ...editingProduct, gallery: [...(editingProduct.gallery || []), url] });
           }
        } else {
           throw new Error(data.error?.message || 'Upload failed');
        }
      } else {
        const fileRef = storageRef(storage, `products/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);
        setEditingProduct({ ...editingProduct, videoUrl: url });
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const generateInvoice = (order: Order) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(settings.primaryColor);
    doc.text('SHOP MIX BD', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Premium Online Shopping Destination', 105, 28, { align: 'center' });
    
    // Invoice Info
    doc.setDrawColor(230);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`INVOICE: ${order.id}`, 20, 45);
    doc.text(`DATE: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 45);
    
    // Customer Info
    doc.setFontSize(10);
    doc.text('BILL TO:', 20, 60);
    doc.setFont('helvetica', 'bold');
    doc.text(order.customer.name, 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(order.customer.phone, 20, 70);
    doc.text(order.customer.address, 20, 75, { maxWidth: 60 });
    
    // Table
    autoTable(doc, {
        startY: 85,
        head: [['Product', 'Qty', 'Price', 'Total']],
        body: order.items.map(item => [
            item.name,
            item.quantity,
            formatPrice(item.price),
            formatPrice(item.price * item.quantity)
        ]),
        headStyles: { fillColor: settings.primaryColor },
        foot: [['', '', 'GRAND TOTAL:', formatPrice(order.total)]],
        footStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Thank you for shopping with Mix!', 105, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
    
    doc.save(`Invoice_${order.id}.pdf`);
  };

  const exportOrdersToExcel = () => {
    const data = orders.map(o => ({
        OrderID: o.id,
        Date: new Date(o.createdAt).toLocaleDateString(),
        Customer: o.customer.name,
        Phone: o.customer.phone,
        Address: o.customer.address,
        Total: o.total,
        Status: o.status,
        Items: o.items.map(i => `${i.name} (x${i.quantity})`).join(', ')
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Shop_Mix_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  
  // Sort products by views to get top viewed
  const topProducts = [...products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);

  // Play sound effect on new order (simulated for demo if needed, but here we just show the count)
  React.useEffect(() => {
    if (orders.length > 0 && orders[0].status === 'pending') {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio play blocked'));
    }
  }, [orders.length]);
  
  const [tempSettings, setTempSettings] = useState<SiteSettings>(settings);

  // --- Product Handlers ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSavingProduct(true);
    try {
      let finalProduct: Product;
      
      // Ensure colors and sizes are clean string arrays
      const cleanColors = Array.isArray(editingProduct.colors) 
          ? editingProduct.colors.map(c => String(c).trim()).filter(Boolean)
          : [];
          
      const cleanSizes = Array.isArray(editingProduct.sizes)
          ? editingProduct.sizes.map(s => String(s).trim()).filter(Boolean)
          : [];

      if (editingProduct.id) {
        finalProduct = {
            ...editingProduct,
            colors: cleanColors,
            sizes: cleanSizes
        } as Product;
        await rtdbSet(rtdbRef(rtdb, 'products/' + editingProduct.id), finalProduct);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? finalProduct : p));
      } else {
        const newProductRef = push(rtdbRef(rtdb, 'products'));
        finalProduct = { 
          ...editingProduct, 
          id: newProductRef.key as string,
          colors: cleanColors,
          sizes: cleanSizes,
          reviews: editingProduct.reviews || [],
          views: editingProduct.views || 0,
          rating: editingProduct.rating || 4.5,
          videoUrl: editingProduct.videoUrl || '',
          category: editingProduct.category || 'Electronics',
          source: editingProduct.source || 'own'
        } as Product;
        await rtdbSet(newProductRef, finalProduct);
        setProducts(prev => [...prev, finalProduct]);
      }
      
      setShowSaveSuccess(true);
      setTimeout(() => {
        setShowSaveSuccess(false);
        if (editingProduct.id) {
            setEditingProduct(null); // Close modal on edit completion
        } else {
            // Auto-reset form for new product
            setEditingProduct({
                id: '',
                name: '',
                price: 0,
                originalPrice: 0,
                description: '',
                shortDescription: '',
                image: '',
                category: CATEGORIES[0],
                stock: 0,
                rating: 0,
                reviews: [],
                views: 0,
                source: 'own',
                isOwnInventory: true,
                showImage: true,
                showVideo: false,
                videoUrl: '',
                enableColors: false,
                enableSizes: false,
                variants: { colors: [], sizes: [] }
            });
        }
      }, 2000);
    } catch (error) {
      console.error("Firebase Write Error:", error);
      alert("Failed to save product. Please try again.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('Delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // --- Settings Handlers ---
  const handleSaveSettings = () => {
    updateSettings(tempSettings);
    alert('Settings saved successfully!');
  };

  const resetSettings = () => {
    if (window.confirm('Reset to default settings? This will revert all customizations.')) {
        updateSettings(INITIAL_SETTINGS);
        setTempSettings(INITIAL_SETTINGS);
        alert('All settings reset to default!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tight mb-8">Admin Dashboard</h1>
            <nav className="flex flex-col gap-1">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-sm uppercase tracking-wider",
                    activeTab === 'dashboard' ? "bg-primary text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                  )}
                  style={activeTab === 'dashboard' ? { backgroundColor: settings.primaryColor } : {}}
                >
                    <Layout size={18} /> Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('products')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-sm uppercase tracking-wider",
                    activeTab === 'products' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                  )}
                  style={activeTab === 'products' ? { backgroundColor: '#1f2937' } : {}}
                >
                    <Package size={18} /> Products
                </button>
                <button 
                  onClick={() => setActiveTab('media')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-sm uppercase tracking-wider",
                    activeTab === 'media' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                  )}
                  style={activeTab === 'media' ? { backgroundColor: '#1f2937' } : {}}
                >
                    <ImageIcon size={18} /> Media Assets
                </button>
                <button 
                  onClick={() => setActiveTab('posts')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-sm uppercase tracking-wider",
                    activeTab === 'posts' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                  )}
                  style={activeTab === 'posts' ? { backgroundColor: '#1f2937' } : {}}
                >
                    <FileText size={18} /> Blog & Posts
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-sm uppercase tracking-wider",
                    activeTab === 'settings' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                  )}
                  style={activeTab === 'settings' ? { backgroundColor: '#1f2937' } : {}}
                >
                    <Settings size={18} /> Basic Engine
                </button>
                <button 
                  onClick={() => setActiveTab('customization')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-sm uppercase tracking-wider",
                    activeTab === 'customization' ? "bg-primary text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                  )}
                  style={activeTab === 'customization' ? { backgroundColor: settings.primaryColor } : {}}
                >
                    <Palette size={18} /> Customization
                </button>
                <button 
                  onClick={() => setActiveTab('site_settings')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-sm uppercase tracking-wider",
                    activeTab === 'site_settings' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                  )}
                  style={activeTab === 'site_settings' ? { backgroundColor: '#1f2937' } : {}}
                >
                    <Globe size={18} /> Site Settings
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-sm uppercase tracking-wider",
                    activeTab === 'orders' ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                  )}
                  style={activeTab === 'orders' ? { backgroundColor: '#1f2937' } : {}}
                >
                    <ShoppingBag size={18} /> Orders Feed
                    {orders.length > 0 && (
                        <span className="ml-auto bg-primary text-white text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: settings.primaryColor }}>{orders.length}</span>
                    )}
                </button>
                <button 
                  onClick={() => setActiveTab('complaints')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-sm uppercase tracking-wider",
                    activeTab === 'complaints' ? "bg-red-500 text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                    <MessageSquare size={18} /> Complaints Log
                </button>
            </nav>

            <div className="pt-4 border-t border-gray-100 mt-4">
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all text-sm uppercase tracking-wider text-red-500 hover:bg-red-50 w-full"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>

            <div className="mt-12 p-4 bg-gray-100 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <Layout size={14} /> Design System
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded shadow-sm border border-white" style={{ backgroundColor: settings.primaryColor }}></div>
                    <span className="text-xs font-bold font-mono uppercase">{settings.primaryColor}</span>
                </div>
            </div>
        </aside>

        {/* Main Area */}
        <main className="flex-grow min-h-[60vh] bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-8">
            <AnimatePresence mode="wait">
                
                {/* DASHBOARD TAB ... (omitted for brevity, assume current code remains) */}

                {/* MEDIA TAB */}
                {activeTab === 'media' && (
                  <motion.div 
                    key="media"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <MediaManager />
                  </motion.div>
                )}

                {/* POSTS TAB */}
                {activeTab === 'posts' && (
                  <motion.div 
                    key="posts"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <PostManager />
                  </motion.div>
                )}
                
                {/* CUSTOMIZATION TAB */}
                {activeTab === 'customization' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key="customization"
                    className="space-y-12 pb-20"
                  >
                    <div className="border-b border-gray-100 pb-4">
                      <h2 className="text-2xl font-black uppercase tracking-tight">🎨 Website Customization</h2>
                      <p className="text-gray-400 text-sm">ওয়েবসাইট কাস্টমাইজেশন - Real-time Style & Content Management</p>
                    </div>

                    {/* Language Settings */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <Type className="text-orange-500" size={20} />
                        <h3 className="font-black uppercase tracking-widest text-sm">🌐 Language Settings (ভাষা সেটিংস)</h3>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-4">
                          <select 
                            className="bg-white border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-sm"
                            value={tempSettings.customization?.language || 'bn'}
                            onChange={(e) => setTempSettings({
                              ...tempSettings,
                              customization: {
                                ...tempSettings.customization!,
                                language: e.target.value as any
                              }
                            })}
                          >
                            <option value="bn">🇧🇩 Bengali (বাংলা)</option>
                            <option value="en">🇬🇧 English</option>
                            <option value="mixed">Mixed (মিশ্র)</option>
                          </select>
                          <button 
                            onClick={handleSaveSettings}
                            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-colors"
                          >
                            Save Language
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 italic">Changing language will instantly update headings, menu labels, and product details across the store.</p>
                      </div>
                    </div>

                    {/* Color Customization */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <Palette className="text-orange-500" size={20} />
                          <h3 className="font-black uppercase tracking-widest text-sm">🎨 Color Customization (কালার কাস্টমাইজেশন)</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Theme Presets */}
                          <div className="bg-gray-900 p-6 rounded-3xl space-y-4 md:col-span-2 lg:col-span-3">
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Quick Apply Presets</h4>
                            <div className="flex flex-wrap gap-3">
                              {[
                                { name: 'Orange', primary: '#FF6B00', accent: '#FF6B00', bg: '#FDFDFD' },
                                { name: 'Blue Ocean', primary: '#0ea5e9', accent: '#0284c7', bg: '#f0f9ff' },
                                { name: 'Green Nature', primary: '#22c55e', accent: '#16a34a', bg: '#f0fdf4' },
                                { name: 'Purple Royal', primary: '#a855f7', accent: '#9333ea', bg: '#faf5ff' },
                                { name: 'Red Passion', primary: '#ef4444', accent: '#dc2626', bg: '#fef2f2' },
                                { name: 'Dark Mode', primary: '#f97316', accent: '#ea580c', bg: '#09090b', text: '#ffffff', headings: '#ffffff' },
                                { name: 'Pink Sweet', primary: '#ec4899', accent: '#db2777', bg: '#fdf2f8' },
                                { name: 'Yellow Sunshine', primary: '#eab308', accent: '#ca8a04', bg: '#fefce8' },
                              ].map(theme => (
                                <button 
                                  key={theme.name}
                                  onClick={() => {
                                    const c = tempSettings.customization?.colors || INITIAL_SETTINGS.customization!.colors;
                                    setTempSettings({
                                      ...tempSettings,
                                      primaryColor: theme.primary,
                                      customization: {
                                        ...tempSettings.customization!,
                                        colors: {
                                          ...c,
                                          primary: theme.primary,
                                          accent: theme.accent,
                                          background: theme.bg,
                                          textMain: theme.text || '#374151',
                                          textHeadings: theme.headings || '#111827',
                                          btnPrimaryBg: theme.primary,
                                          categoryTabActiveBg: theme.primary,
                                          priceColor: theme.primary,
                                        }
                                      }
                                    });
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-xl border border-gray-700 hover:border-orange-500 transition-all group"
                                >
                                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                                  <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-white">{theme.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Specific Colors */}
                          {[
                            { label: 'Primary Theme', key: 'primary' },
                            { label: 'Secondary Color', key: 'secondary' },
                            { label: 'Accent Color', key: 'accent' },
                            { label: 'Background', key: 'background' },
                            { label: 'Main Text', key: 'textMain' },
                            { label: 'Heading Text', key: 'textHeadings' },
                            { label: 'Header Bg', key: 'headerBg' },
                            { label: 'Header Text', key: 'headerText' },
                            { label: 'Footer Bg', key: 'footerBg' },
                            { label: 'Footer Text', key: 'footerText' },
                            { label: 'Category Active', key: 'categoryTabActiveBg' },
                            { label: 'WhatsApp Btn', key: 'whatsappBtn' },
                          ].map(item => (
                            <div key={item.key} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.label}</label>
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="color" 
                                    className="w-8 h-8 rounded-full border-none cursor-pointer"
                                    value={(tempSettings.customization?.colors as any)?.[item.key] || '#000000'}
                                    onChange={(e) => setTempSettings({
                                      ...tempSettings,
                                      customization: {
                                        ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                        colors: {
                                          ...(tempSettings.customization?.colors || INITIAL_SETTINGS.customization!.colors),
                                          [item.key]: e.target.value
                                        }
                                      }
                                    })}
                                  />
                                  <input 
                                    type="text" 
                                    className="bg-white border border-gray-200 rounded px-2 py-1 text-[10px] font-mono w-20"
                                    value={(tempSettings.customization?.colors as any)?.[item.key] || '#000000'}
                                    onChange={(e) => setTempSettings({
                                      ...tempSettings,
                                      customization: {
                                        ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                        colors: {
                                          ...(tempSettings.customization?.colors || INITIAL_SETTINGS.customization!.colors),
                                          [item.key]: e.target.value
                                        }
                                      }
                                    })}
                                  />
                                </div>
                            </div>
                          ))}
                        </div>
                    </div>

                    {/* Font Customization */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <Type className="text-orange-500" size={20} />
                          <h3 className="font-black uppercase tracking-widest text-sm">🔤 Font Customization (ফন্ট কাস্টমাইজেশন)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-8 rounded-[2.5rem]">
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Font Families</h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Heading Font</label>
                                  <select 
                                    className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-sm"
                                    value={tempSettings.customization?.fonts?.heading || 'Inter'}
                                    onChange={(e) => setTempSettings({
                                      ...tempSettings,
                                      customization: {
                                        ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                        fonts: { ...(tempSettings.customization?.fonts || INITIAL_SETTINGS.customization!.fonts), heading: e.target.value }
                                      }
                                    })}
                                  >
                                    <optgroup label="English Fonts">
                                      {['Poppins', 'Inter', 'Roboto', 'Montserrat', 'Open Sans', 'Lato', 'Nunito', 'Playfair Display'].map(f => <option key={f} value={f}>{f}</option>)}
                                    </optgroup>
                                    <optgroup label="Bengali Fonts">
                                      {['Noto Sans Bengali', 'Hind Siliguri', 'Tiro Bangla', 'Baloo Da 2', 'Mina', 'Anek Bangla', 'Galada'].map(f => <option key={f} value={f}>{f}</option>)}
                                    </optgroup>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Body Font</label>
                                  <select 
                                    className="w-full bg-white border border-gray-200 rounded-xl p-3 font-bold text-sm"
                                    value={tempSettings.customization?.fonts?.body || 'Inter'}
                                    onChange={(e) => setTempSettings({
                                      ...tempSettings,
                                      customization: {
                                        ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                        fonts: { ...(tempSettings.customization?.fonts || INITIAL_SETTINGS.customization!.fonts), body: e.target.value }
                                      }
                                    })}
                                  >
                                    {['Inter', 'Poppins', 'Roboto', 'Hind Siliguri', 'Noto Sans Bengali'].map(f => <option key={f} value={f}>{f}</option>)}
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Font Sizes (px)</h4>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                  {[
                                    { label: 'Heading 1', key: 'heading1', min: 12, max: 80 },
                                    { label: 'Heading 2', key: 'heading2', min: 12, max: 60 },
                                    { label: 'Body Text', key: 'body', min: 10, max: 24 },
                                    { label: 'Button Text', key: 'button', min: 10, max: 24 },
                                    { label: 'Price text', key: 'price', min: 12, max: 40 },
                                    { label: 'Menu text', key: 'menu', min: 10, max: 24 },
                                    { label: 'Product Title', key: 'productTitle', min: 10, max: 28 },
                                  ].map(f => (
                                    <div key={f.key} className="space-y-1">
                                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 px-2 tracking-widest">
                                        <span>{f.label}</span>
                                        <span>{(tempSettings.customization?.fonts?.sizes as any)?.[f.key] || 0}px</span>
                                      </div>
                                      <input 
                                        type="range"
                                        min={f.min}
                                        max={f.max}
                                        value={(tempSettings.customization?.fonts?.sizes as any)?.[f.key] || 0}
                                        onChange={(e) => setTempSettings({
                                          ...tempSettings,
                                          customization: {
                                            ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                            fonts: {
                                              ...(tempSettings.customization?.fonts || INITIAL_SETTINGS.customization!.fonts),
                                              sizes: {
                                                ...(tempSettings.customization?.fonts?.sizes || INITIAL_SETTINGS.customization!.fonts.sizes),
                                                [f.key]: parseInt(e.target.value)
                                              }
                                            }
                                          }
                                        })}
                                        className="w-full accent-orange-500"
                                      />
                                    </div>
                                  ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visibility Toggles */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <Eye className="text-orange-500" size={20} />
                          <h3 className="font-black uppercase tracking-widest text-sm">🔘 Section Visibility (সেকশন অন/অফ)</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {[
                             { label: 'Hero Banner', key: 'heroBanner' },
                             { label: 'Shop Collection Btn', key: 'shopCollectionBtn' },
                             { label: 'Learn More Btn', key: 'learnMoreBtn' },
                             { label: 'Category Tabs', key: 'categoryTabs' },
                             { label: 'Flash Sale Timer', key: 'flashSaleTimer' },
                             { label: 'Flash Sale Section', key: 'flashSaleSection' },
                             { label: 'Discount Badges', key: 'discountBadges' },
                             { label: 'Stock Info', key: 'stockInfo' },
                             { label: 'Star Ratings', key: 'starRatings' },
                             { label: 'Wishlist Button', key: 'wishlistBtn' },
                             { label: 'Share Button', key: 'shareBtn' },
                             { label: 'WhatsApp Float', key: 'whatsappFloat' },
                             { label: 'Cart Floating Icon', key: 'cartFloat' },
                             { label: 'Search Bar', key: 'searchBar' },
                             { label: 'Footer Section', key: 'footer' },
                             { label: 'Newsletter Signup', key: 'newsletter' },
                             { label: 'Social Media Links', key: 'socialLinks' },
                          ].map(item => (
                            <div key={item.key} className="p-4 bg-white border border-gray-100 rounded-xl flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{item.label}</span>
                              <button 
                                onClick={() => setTempSettings({
                                  ...tempSettings,
                                  customization: {
                                    ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                    visibility: {
                                      ...(tempSettings.customization?.visibility || INITIAL_SETTINGS.customization!.visibility),
                                      [item.key]: !(tempSettings.customization?.visibility as any)?.[item.key]
                                    }
                                  }
                                })}
                                className={cn(
                                  "w-10 h-5 rounded-full p-0.5 transition-colors duration-300",
                                  (tempSettings.customization?.visibility as any)?.[item.key] ? "bg-green-500" : "bg-gray-200"
                                )}
                              >
                                <div className={cn("w-4 h-4 bg-white rounded-full transition-transform duration-300", (tempSettings.customization?.visibility as any)?.[item.key] ? "translate-x-5" : "translate-x-0")} />
                              </button>
                            </div>
                          ))}
                        </div>
                    </div>

                    {/* Layout Controls */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <Layout className="text-orange-500" size={20} />
                          <h3 className="font-black uppercase tracking-widest text-sm">📏 Size & Spacing (সাইজ ও স্পেসিং)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl">
                            {[
                               { label: 'Image Height', key: 'imageHeight', min: 100, max: 600, unit: 'px' },
                               { label: 'Product Spacing', key: 'productSpacing', min: 0, max: 60, unit: 'px' },
                               { label: 'Container Padding', key: 'containerPadding', min: 0, max: 100, unit: 'px' },
                               { label: 'Border Radius', key: 'borderRadius', min: 0, max: 60, unit: 'px' },
                               { label: 'Button Radius', key: 'buttonRadius', min: 0, max: 40, unit: 'px' },
                               { label: 'Header Height', key: 'headerHeight', min: 40, max: 120, unit: 'px' },
                               { label: 'Footer Height', key: 'footerHeight', min: 200, max: 800, unit: 'px' },
                            ].map(item => (
                              <div key={item.key} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">
                                  <span>{item.label}</span>
                                  <span>{(tempSettings.customization?.layout as any)?.[item.key] || 0}{item.unit}</span>
                                </div>
                                <input 
                                  type="range"
                                  min={item.min}
                                  max={item.max}
                                  value={(tempSettings.customization?.layout as any)?.[item.key] || 0}
                                  onChange={(e) => setTempSettings({
                                    ...tempSettings,
                                    customization: {
                                      ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                      layout: {
                                        ...(tempSettings.customization?.layout || INITIAL_SETTINGS.customization!.layout),
                                        [item.key]: parseInt(e.target.value)
                                      }
                                    }
                                  })}
                                  className="w-full accent-orange-500"
                                />
                              </div>
                            ))}
                        </div>
                    </div>

                    {/* Text Customization */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <RefreshCcw className="text-orange-500" size={20} />
                          <h3 className="font-black uppercase tracking-widest text-sm">📝 Text Editor (লেখা পরিবর্তন করুন)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                             { label: 'Website Name', key: 'websiteName' },
                             { label: 'Hero Main Title', key: 'heroTitle' },
                             { label: 'Shop Button Text', key: 'shopCollectionBtn' },
                             { label: 'Learn More Btn Text', key: 'learnMoreBtn' },
                             { label: 'Flash Sale Title', key: 'flashSaleTitle' },
                             { label: 'Confirm Order Label', key: 'confirmOrderBtn' },
                          ].map(item => (
                            <div key={item.key} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-2">
                              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{item.label}</label>
                              <div className="flex gap-2">
                                <input 
                                  className="grow bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-sm font-bold"
                                  value={(tempSettings.customization?.text as any)?.[item.key] || ''}
                                  onChange={(e) => setTempSettings({
                                    ...tempSettings,
                                    customization: {
                                      ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                      text: {
                                        ...(tempSettings.customization?.text || INITIAL_SETTINGS.customization!.text),
                                        [item.key]: e.target.value
                                      }
                                    }
                                  })}
                                />
                                <button className="bg-gray-100 p-2 rounded-lg text-gray-400 hover:text-green-500 hover:bg-green-50 transition-all"><Save size={16} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="pt-10 flex flex-wrap gap-4 border-t border-gray-100">
                        <button 
                          onClick={handleSaveSettings}
                          className="flex-grow md:flex-none px-12 py-5 bg-orange-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                        >
                          <Save size={20} /> Save All Changes
                        </button>
                        <button 
                          onClick={() => setTempSettings({...tempSettings, customization: INITIAL_SETTINGS.customization})}
                          className="px-8 py-5 bg-gray-100 text-gray-600 font-extrabold uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all"
                        >
                          Reset to Default
                        </button>
                        <button 
                          onClick={() => {
                            const data = JSON.stringify(tempSettings.customization, null, 2);
                            const blob = new Blob([data], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ShopMix_Customization_${Date.now()}.json`;
                            a.click();
                          }}
                          className="px-8 py-5 bg-gray-900 text-white font-extrabold uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center gap-2"
                        >
                          <Download size={18} /> Export Settings
                        </button>
                    </div>
                  </motion.div>
                )}
                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Revenue', value: formatPrice(orders.reduce((s, o) => s + o.total, 0)), icon: DollarSign, color: 'text-green-500 bg-green-50' },
                        { label: 'Site Visitors', value: analytics.visitors, icon: Users, color: 'text-blue-500 bg-blue-50' },
                        { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-purple-500 bg-purple-50' },
                        { label: 'Pending Fulfillment', value: orders.filter(o => o.status === 'pending').length, icon: Package, color: 'text-orange-500 bg-orange-50' },
                      ].map((stat, i) => (
                        <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-bold", stat.color)}>
                              <stat.icon size={20} />
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                           <p className="text-xl font-black text-gray-900">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                         <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Sales Overview</h3>
                            <div className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase">
                               <TrendingUp size={12} /> Live Tracking
                            </div>
                         </div>
                         <AdminSalesChart />

                         <div className="space-y-4">
                             <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Top Viewed Products</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 {topProducts.map(p => (
                                     <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                         <img loading="lazy" src={p.image || undefined} className="w-12 h-12 rounded-lg object-cover" />
                                         <div className="flex-grow">
                                             <p className="text-xs font-bold line-clamp-1">{p.name}</p>
                                             <p className="text-[10px] text-gray-400 font-bold uppercase">{p.views || 0} views</p>
                                         </div>
                                         <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                                             <Eye size={16} className="text-gray-400" />
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                      </div>
                      
                      <div className="space-y-4">
                         <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Recent Activity</h3>
                         <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                           {orders.slice(0, 5).map((o, i) => (
                             <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black">{o.id}</p>
                                   <p className="text-[8px] text-gray-400 uppercase font-black">{new Date(o.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className="text-xs font-black" style={{ color: settings.primaryColor }}>{formatPrice(o.total)}</span>
                             </div>
                           ))}
                           {orders.length === 0 && <p className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">No activity</p>}
                         </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                             <h2 className="text-2xl font-black uppercase tracking-tight">Active Inventory</h2>
                             <button 
                                onClick={() => setEditingProduct({
                                    id: '', name: '', price: 0, originalPrice: 0, image: '', category: 'Electronics', description: '', rating: 5, reviews: [], stock: 10, views: 0, source: 'own', variants: { colors: [], sizes: [] } as any, enableSizes: false, enableColors: false
                                })}
                                className="flex items-center gap-2 px-6 py-2 rounded-lg text-white font-bold text-sm shadow-md"
                                style={{ backgroundColor: settings.primaryColor }}
                             >
                                <Plus size={18} /> Add Product
                             </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-50">
                                    <tr>
                                        <th className="px-4 py-4">Product</th>
                                        <th className="px-4 py-4">Category</th>
                                        <th className="px-4 py-4">Price</th>
                                        <th className="px-4 py-4">Stock</th>
                                        <th className="px-4 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {products.map(p => (
                                        <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img loading="lazy" src={p.image || undefined} className="w-10 h-10 rounded object-cover bg-gray-100" referrerPolicy="no-referrer" />
                                                    <span className="font-bold text-sm text-gray-800 line-clamp-1">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[10px] font-black uppercase bg-gray-100 px-2 py-1 rounded text-gray-500">{p.category}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="font-bold text-sm">{formatPrice(p.price)}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={cn("text-xs font-bold", p.stock < 10 ? "text-red-500" : "text-green-500 underline")}>{p.stock} units</span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingProduct(p)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors"><Edit size={16} /></button>
                                                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Edit Modal */}
                        {editingProduct && (
                            <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                >
                                    <h3 className="text-2xl font-black uppercase tracking-tight mb-8">
                                        {editingProduct.id ? 'Edit Product' : 'New Product'}
                                    </h3>
                                    <form onSubmit={handleSaveProduct} className="grid grid-cols-1 gap-8">
    
    {/* 1. Product Media */}
    <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">1. Product Media</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 relative">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Main Cover Image</label>
                </div>
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-48 border-2 border-dashed border-gray-300 rounded-[2rem] bg-white flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer group relative overflow-hidden">
                    {editingProduct.image ? (
                        <>
                            <img loading="lazy" src={editingProduct.image} className="w-full h-full object-contain p-2" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload className="text-white" size={24} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <Upload size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-orange-500">Upload Cover (ImgBB)</span>
                        </>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="animate-spin text-orange-500" size={24} />
                        </div>
                    )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                <input className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-[10px] font-mono outline-none focus:border-orange-500 focus:ring-2" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="Or paste Cover URL here..." />
            </div>

            <div className="space-y-4 relative">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Product Gallery (Extra Images)</label>
                </div>
                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-[2rem] bg-white p-2 overflow-y-auto relative">
                    <div className="grid grid-cols-3 gap-2 h-full">
                        {editingProduct.gallery?.map((url, idx) => (
                            <div key={idx} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-200 bg-gray-50">
                                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => {
                                    const newGallery = [...(editingProduct.gallery || [])];
                                    newGallery.splice(idx, 1);
                                    setEditingProduct({...editingProduct, gallery: newGallery});
                                }} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                    <Trash2 className="text-white" size={16} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => handleFileUpload(e as any, 'gallery');
                            input.click();
                        }} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-orange-500 hover:text-orange-500 text-gray-400 transition-colors">
                            <Plus size={20} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Add</span>
                        </button>
                    </div>
                    {isUploading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="animate-spin text-orange-500" size={24} />
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4 relative md:col-span-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Cinematic Video (Optional)</label>
                    <button type="button" onClick={() => setEditingProduct({...editingProduct, showVideo: !editingProduct.showVideo})} className={cn("w-10 h-5 rounded-full p-1 transition-colors duration-300", editingProduct.showVideo ? "bg-orange-500" : "bg-gray-300")}>
                        <div className={cn("w-3 h-3 bg-white rounded-full transition-transform duration-300", editingProduct.showVideo ? "translate-x-5" : "translate-x-0")} />
                    </button>
                </div>
                {editingProduct.showVideo && (
                    <>
                        <div onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'video/*';
                            input.onchange = (e) => handleFileUpload(e as any, 'video');
                            input.click();
                        }} className="w-full h-48 border-2 border-dashed border-gray-200 rounded-[2rem] bg-white flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer group relative overflow-hidden">
                            {editingProduct.videoUrl ? (
                                <>
                                    <video src={editingProduct.videoUrl || undefined} className="w-full h-full object-cover" muted />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Video className="text-white" size={24} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                        <Video size={20} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-orange-500">Upload Video</span>
                                </>
                            )}
                        </div>
                        <input className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-[10px] font-mono outline-none focus:border-orange-500 focus:ring-2" value={editingProduct.videoUrl || ''} onChange={e => setEditingProduct({...editingProduct, videoUrl: e.target.value})} placeholder="Or paste YouTube / File URL here..." />
                    </>
                )}
            </div>
        </div>
    </div>

    {/* 2. Basic Info & Search */}
    <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">2. Basic Info & Search Indexing</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Product Name</label>
                <input required className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold transition-all" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">SKU / Product Code</label>
                <input className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold transition-all" value={editingProduct.sku || ''} onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})} placeholder="e.g. PROD-001" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Category</label>
                <select className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold transition-all appearance-none cursor-pointer" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Stock Units</label>
                <input type="number" required className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-mono outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold transition-all" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} />
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Description (Text Area)</label>
                <textarea className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold transition-all resize-y min-h-[120px]" value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} placeholder="Product clean text description..." />
            </div>
        </div>
    </div>

    {/* 3. Smart Pricing */}
    <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">3. Smart Pricing</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Original Price (BDT)</label>
                <input type="number" required className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-mono font-bold outline-none focus:border-orange-500" value={editingProduct.originalPrice || editingProduct.price} onChange={e => {
                    const op = Number(e.target.value);
                    const dp = editingProduct.discountPercentage || 0;
                    setEditingProduct({...editingProduct, originalPrice: op, price: Math.round(op - (op * (dp / 100)))});
                }} />
            </div>
            
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Discount (%)</label>
                </div>
                <div className="relative">
                    <input type="number" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-mono font-bold outline-none focus:border-orange-500 pr-10" 
                        value={editingProduct.discountPercentage || 0}
                        onChange={e => {
                            let pct = Number(e.target.value);
                            if (pct < 0) pct = 0; if (pct > 100) pct = 100;
                            const op = editingProduct.originalPrice || editingProduct.price;
                            setEditingProduct({...editingProduct, discountPercentage: pct, originalPrice: op, price: Math.round(op - (op * (pct / 100)))});
                        }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-orange-500 tracking-widest ml-1">Final Sale Price</label>
                <input type="number" readOnly className="w-full bg-orange-50 border-2 border-orange-200 text-orange-600 rounded-xl py-3 px-4 font-mono font-black outline-none" value={editingProduct.price} />
            </div>
        </div>
    </div>

    {/* 4. Product Strategy (The Master Logic) */}
    <div className="p-8 bg-[#1a1a1a] text-white rounded-[2rem] border border-gray-800 shadow-2xl relative overflow-hidden group space-y-6">
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 mb-2 relative z-10">4. Product Strategy</h4>
        
        <div className="flex bg-gray-800 p-1 rounded-xl w-fit relative z-10">
            <button type="button" onClick={() => setEditingProduct({...editingProduct, source: 'alibaba', isOwnInventory: false})} className={cn("px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", editingProduct.source === 'alibaba' ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-gray-200")}>
                Affiliate / Other's Product
            </button>
            <button type="button" onClick={() => setEditingProduct({...editingProduct, source: 'own', isOwnInventory: true})} className={cn("px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", editingProduct.source === 'own' ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-gray-200")}>
                Own Product
            </button>
        </div>

        {editingProduct.source === 'alibaba' ? (
            <div className="space-y-2 relative z-10 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Redirect URL</label>
                <input 
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl py-4 px-6 focus:border-orange-500 outline-none transition-all shadow-sm font-mono placeholder:text-gray-600 focus:ring-2 focus:ring-orange-500/20"
                    value={editingProduct.affiliateLink || ''}
                    placeholder="https://example.com/product/..."
                    onChange={e => setEditingProduct({...editingProduct, affiliateLink: e.target.value})}
                />
            </div>
        ) : (
            <div className="space-y-8 relative z-10 pt-4 border-t border-gray-800 animate-in fade-in slide-in-from-top-4">
                <h5 className="text-[11px] font-black uppercase tracking-widest text-gray-300 mb-4">5. Custom Variants</h5>
                
                {/* 5. Custom Sizes */}
                <div className="space-y-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center justify-between">
                        <span>Sizes (Custom Input)</span>
                    </label>
                    <div className="flex gap-2">
                        <input id="custom-size-input-new" className="flex-grow bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 focus:border-orange-500 outline-none font-bold placeholder:text-gray-600 focus:ring-2 focus:ring-orange-500/20" placeholder="Type ANY size (e.g., S, M, L or 28, 30, 32) and press Enter" onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim().toUpperCase();
                                if (!val) return;
                                const currentSizes = editingProduct.sizes || [];
                                if (currentSizes.includes(val)) { e.currentTarget.value = ''; return; }
                                setEditingProduct({...editingProduct, enableSizes: true, sizes: [...currentSizes, val]});
                                e.currentTarget.value = '';
                            }
                        }} />
                        <button type="button" onClick={() => {
                            const input = document.getElementById('custom-size-input-new') as HTMLInputElement;
                            if(!input) return;
                            const val = input.value.trim().toUpperCase();
                            if (!val) return;
                            const currentSizes = editingProduct.sizes || [];
                            if (currentSizes.includes(val)) { input.value = ''; return; }
                            setEditingProduct({...editingProduct, enableSizes: true, sizes: [...currentSizes, val]});
                            input.value = '';
                        }} className="bg-gray-800 text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-colors border border-gray-700 hover:border-orange-500">
                            Add Size
                        </button>
                    </div>
                    {editingProduct.sizes && editingProduct.sizes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {editingProduct.sizes.map(s => (
                                <div key={s} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-gray-800 to-gray-700 text-white rounded-full border border-gray-600 shadow-md">
                                    <span className="text-xs font-black tracking-widest">{s}</span>
                                    <button type="button" onClick={() => setEditingProduct({...editingProduct, sizes: editingProduct.sizes!.filter(item => item !== s)})} className="text-gray-300 hover:text-red-400 transition-colors ml-1"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 5. Custom Colors */}
                <div className="space-y-4 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center justify-between">
                        <span>Colors (Preset Palette & Custom)</span>
                    </label>
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 mb-4">
                        {[
                            { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Gray', hex: '#808080' },
                            { name: 'Silver', hex: '#C0C0C0' }, { name: 'Red', hex: '#FF0000' }, { name: 'Maroon', hex: '#800000' },
                            { name: 'Blue', hex: '#0000FF' }, { name: 'Navy', hex: '#000080' }, { name: 'Cyan', hex: '#00FFFF' },
                            { name: 'Green', hex: '#008000' }, { name: 'Olive', hex: '#808000' }, { name: 'Lime', hex: '#00FF00' },
                            { name: 'Yellow', hex: '#FFFF00' }, { name: 'Orange', hex: '#FFA500' }, { name: 'Purple', hex: '#800080' },
                            { name: 'Pink', hex: '#FFC0CB' }, { name: 'Gold', hex: '#FFD700' }, { name: 'Brown', hex: '#A52A2A' },
                            { name: 'Teal', hex: '#008080' }
                        ].map(c => {
                            const isSelected = editingProduct.colors?.includes(c.name);
                            return (
                                <button
                                    key={c.name}
                                    type="button"
                                    onClick={() => {
                                        const currentColors = editingProduct.colors || [];
                                        if (isSelected) {
                                            setEditingProduct({ ...editingProduct, colors: currentColors.filter(item => item !== c.name) });
                                        } else {
                                            if (!currentColors.includes(c.name)) {
                                                setEditingProduct({ ...editingProduct, enableColors: true, colors: [...currentColors, c.name] });
                                            }
                                        }
                                    }}
                                    className={cn("w-full aspect-square rounded-lg border-2 shadow-sm transition-all relative group", isSelected ? "border-orange-500 scale-110" : "border-transparent hover:border-gray-500 hover:scale-105")}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                >
                                    {isSelected && <div className={cn("absolute inset-0 flex items-center justify-center", c.hex === '#FFFFFF' || c.hex === '#FFFF00' ? "text-black" : "text-white")}><CheckCircle2 size={16} /></div>}
                                </button>
                            );
                        })}
                    </div>
                    
                    <div className="flex gap-2">
                        <input id="custom-color-input-new" className="flex-grow bg-gray-900 border border-gray-700 rounded-xl py-3 px-4 focus:border-orange-500 outline-none font-bold placeholder:text-gray-600 focus:ring-2 focus:ring-orange-500/20" placeholder="Or type ANY color name (e.g., Midnight Blue) and press Enter" onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim();
                                if (!val) return;
                                const currentColors = editingProduct.colors || [];
                                if (currentColors.some(c => c.toLowerCase() === val.toLowerCase())) { e.currentTarget.value = ''; return; }
                                setEditingProduct({...editingProduct, enableColors: true, colors: [...currentColors, val]});
                                e.currentTarget.value = '';
                            }
                        }} />
                        <button type="button" onClick={() => {
                            const input = document.getElementById('custom-color-input-new') as HTMLInputElement;
                            if(!input) return;
                            const val = input.value.trim();
                            if (!val) return;
                            const currentColors = editingProduct.colors || [];
                            if (currentColors.some(c => c.toLowerCase() === val.toLowerCase())) { input.value = ''; return; }
                            setEditingProduct({...editingProduct, enableColors: true, colors: [...currentColors, val]});
                            input.value = '';
                        }} className="bg-gray-800 text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-colors border border-gray-700 hover:border-orange-500">
                            Add Custom
                        </button>
                    </div>
                    {editingProduct.colors && editingProduct.colors.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {editingProduct.colors.map(c => (
                                <div key={c} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-gray-800 to-gray-700 text-white rounded-full border border-gray-600 shadow-md">
                                    <div className="w-4 h-4 rounded-full border border-gray-500/50 shadow-inner" style={{ backgroundColor: c.toLowerCase().replace(/[^a-z0-9]/g, '') }} />
                                    <span className="text-xs font-black tracking-widest">{c}</span>
                                    <button type="button" onClick={() => setEditingProduct({...editingProduct, colors: editingProduct.colors!.filter(item => item !== c)})} className="text-gray-300 hover:text-red-400 transition-colors ml-1"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>

    <div className="md:col-span-1 pt-6 flex flex-col gap-4">
        {showSaveSuccess ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-grow py-5 bg-green-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2">
                <CheckCircle2 size={24} /> Published Successfully
            </motion.div>
        ) : (
            <div className="flex gap-4">
                <button type="submit" disabled={isSavingProduct} className="flex-grow py-5 bg-orange-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-orange-600 transition-colors shadow-orange-500/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                    {isSavingProduct ? <Loader2 className="animate-spin" size={24} /> : (editingProduct.id ? 'Save Changes' : 'Publish Product')}
                </button>
                <button type="button" onClick={() => setEditingProduct(null)} className="px-8 py-5 bg-white border border-gray-200 text-gray-400 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
            </div>
        )}
    </div>

</form>
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-10"
                    >
                         <div className="pb-6 border-b border-gray-100">
                             <h2 className="text-2xl font-black uppercase tracking-tight">Full Site Customization</h2>
                             <p className="text-gray-400 text-sm mt-1">Real-time styling engine for Shop Mix Online BD</p>
                        </div>

                        {/* Branding Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Palette className="text-gray-400" size={20} />
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Brand Identity</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Logo Display Text</label>
                                    <input 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 font-bold"
                                        value={tempSettings.logoText}
                                        onChange={e => setTempSettings({...tempSettings, logoText: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Theme Primary Color (HEX)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            className="grow bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 font-mono"
                                            value={tempSettings.primaryColor}
                                            onChange={e => setTempSettings({...tempSettings, primaryColor: e.target.value})}
                                        />
                                        <div className="w-12 h-12 rounded-lg shadow-inner border border-gray-100" style={{ backgroundColor: tempSettings.primaryColor }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Hero Video background URL (mp4)</label>
                                    <input 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 font-mono"
                                        value={tempSettings.heroVideoUrl}
                                        onChange={e => setTempSettings({...tempSettings, heroVideoUrl: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Hero Main Text</label>
                                    <input 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 font-bold"
                                        value={tempSettings.heroText}
                                        onChange={e => setTempSettings({...tempSettings, heroText: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Hero Subtext</label>
                                    <input 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 font-medium"
                                        value={tempSettings.heroSubtext}
                                        onChange={e => setTempSettings({...tempSettings, heroSubtext: e.target.value})}
                                    />
                                </div>
                            </div>
                        </section>
                        
                        {/* Flash Sale Section */}
                        <section className="space-y-6 pt-10 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <Zap className="text-orange-500" size={20} />
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Flash Sale Configuration</h3>
                            </div>
                            
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-800">Enable Flash Sale Countdown</p>
                                        <p className="text-xs text-gray-500">Enable or disable the real-time timer on the homepage</p>
                                    </div>
                                    <button 
                                        onClick={() => setTempSettings({
                                            ...tempSettings, 
                                            flashSale: { 
                                                ...(tempSettings.flashSale || { startTime: '', endTime: '', endMessage: '', isEnabled: false }), 
                                                isEnabled: !tempSettings.flashSale?.isEnabled 
                                            }
                                        })}
                                        className={cn(
                                            "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                                            tempSettings.flashSale?.isEnabled ? "bg-orange-500" : "bg-gray-300"
                                        )}
                                    >
                                        <div className={cn("w-4 h-4 bg-white rounded-full transition-transform duration-300", tempSettings.flashSale?.isEnabled ? "translate-x-6" : "translate-x-0")} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Start Date & Time</label>
                                        <input 
                                            type="datetime-local"
                                            className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 font-bold"
                                            value={tempSettings.flashSale?.startTime ? new Date(new Date(tempSettings.flashSale.startTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                flashSale: {
                                                    ...(tempSettings.flashSale || { startTime: '', endTime: '', endMessage: '', isEnabled: false }),
                                                    startTime: new Date(e.target.value).toISOString()
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">End Date & Time</label>
                                        <input 
                                            type="datetime-local"
                                            className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 font-bold"
                                            value={tempSettings.flashSale?.endTime ? new Date(new Date(tempSettings.flashSale.endTime).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                flashSale: {
                                                    ...(tempSettings.flashSale || { startTime: '', endTime: '', endMessage: '', isEnabled: false }),
                                                    endTime: new Date(e.target.value).toISOString()
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Custom End Message</label>
                                        <input 
                                            placeholder="Flash Sale Ended! Stay tuned for more."
                                            className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 font-medium"
                                            value={tempSettings.flashSale?.endMessage || ''}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                flashSale: {
                                                    ...(tempSettings.flashSale || { startTime: '', endTime: '', endMessage: '', isEnabled: false }),
                                                    endMessage: e.target.value
                                                }
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-orange-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-gray-800">Auto-Restart Sale</p>
                                            <p className="text-[10px] text-gray-400">Restart automatically when timer hits zero</p>
                                        </div>
                                        <button 
                                            onClick={() => setTempSettings({
                                                ...tempSettings,
                                                flashSale: {
                                                    ...(tempSettings.flashSale || { startTime: '', endTime: '', endMessage: '', isEnabled: false }),
                                                    autoRestart: !tempSettings.flashSale?.autoRestart
                                                }
                                            })}
                                            className={cn(
                                                "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                                                tempSettings.flashSale?.autoRestart ? "bg-orange-500" : "bg-gray-200"
                                            )}
                                        >
                                            <div className={cn("w-4 h-4 bg-white rounded-full transition-transform duration-300", tempSettings.flashSale?.autoRestart ? "translate-x-6" : "translate-x-0")} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Quick Set Duration</p>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">Hours</label>
                                                <input type="number" id="fs-h" placeholder="0" className="w-full bg-white border border-gray-200 rounded-lg p-2 font-bold text-center" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">Minutes</label>
                                                <input type="number" id="fs-m" placeholder="0" className="w-full bg-white border border-gray-200 rounded-lg p-2 font-bold text-center" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-bold text-gray-500 uppercase">Seconds</label>
                                                <input type="number" id="fs-s" placeholder="0" className="w-full bg-white border border-gray-200 rounded-lg p-2 font-bold text-center" />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                const h = parseInt((document.getElementById('fs-h') as HTMLInputElement).value) || 0;
                                                const m = parseInt((document.getElementById('fs-m') as HTMLInputElement).value) || 0;
                                                const s = parseInt((document.getElementById('fs-s') as HTMLInputElement).value) || 0;
                                                const duration = (h * 3600 + m * 60 + s);
                                                if (duration <= 0) return alert('Please set a duration greater than zero');
                                                
                                                const now = new Date();
                                                const end = new Date(now.getTime() + duration * 1000);
                                                
                                                setTempSettings({
                                                    ...tempSettings,
                                                    flashSale: {
                                                        ...(tempSettings.flashSale || { startTime: '', endTime: '', endMessage: '', isEnabled: false }),
                                                        startTime: now.toISOString(),
                                                        endTime: end.toISOString(),
                                                        durationSeconds: duration,
                                                        isEnabled: true
                                                    }
                                                });
                                            }}
                                            className="w-full py-3 bg-[#1a1a1a] text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-orange-500 transition-colors shadow-lg shadow-black/10"
                                        >
                                            Apply Duration & Start Sale
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => {
                                            const now = new Date();
                                            const end = new Date(now.getTime() + 2 * 60 * 60 * 1000); 
                                            setTempSettings({
                                                ...tempSettings,
                                                flashSale: {
                                                    ...(tempSettings.flashSale || { startTime: '', endTime: '', endMessage: '', isEnabled: false }),
                                                    startTime: now.toISOString(),
                                                    endTime: end.toISOString(),
                                                    isEnabled: true
                                                }
                                            });
                                        }}
                                        className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-white border border-orange-200 px-4 py-2.5 rounded-lg hover:bg-orange-100 transition-all shadow-sm"
                                    >
                                        Quick Set: 2 Hours
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setTempSettings({
                                                ...tempSettings,
                                                flashSale: {
                                                    ...(tempSettings.flashSale || { startTime: '', endTime: '', endMessage: '', isEnabled: false }),
                                                    isEnabled: false,
                                                    startTime: '',
                                                    endTime: ''
                                                }
                                            });
                                        }}
                                        className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                                    >
                                        Reset Timer
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Buttons Section */}
                        <section className="space-y-6">
                             <div className="flex items-center gap-2">
                                <Type className="text-gray-400" size={20} />
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Customizable Buttons</h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Buy Button Config */}
                                <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                                     <h4 className="font-bold text-sm text-gray-700 underline">"Buy Now" Button</h4>
                                     <div className="space-y-4">
                                         <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Text</label>
                                                <input value={tempSettings.buyButton.text} onChange={e => setTempSettings({...tempSettings, buyButton: {...tempSettings.buyButton, text: e.target.value}})} className="w-full p-2 bg-white border border-gray-200 rounded text-xs" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Color</label>
                                                <input value={tempSettings.buyButton.color} onChange={e => setTempSettings({...tempSettings, buyButton: {...tempSettings.buyButton, color: e.target.value}})} className="w-full p-2 bg-white border border-gray-200 rounded text-xs" />
                                            </div>
                                         </div>
                                         <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Font Size</label>
                                                <input value={tempSettings.buyButton.fontSize} onChange={e => setTempSettings({...tempSettings, buyButton: {...tempSettings.buyButton, fontSize: e.target.value}})} className="w-full p-2 bg-white border border-gray-200 rounded text-xs" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Rounding</label>
                                                <input value={tempSettings.buyButton.borderRadius} onChange={e => setTempSettings({...tempSettings, buyButton: {...tempSettings.buyButton, borderRadius: e.target.value}})} className="w-full p-2 bg-white border border-gray-200 rounded text-xs" />
                                            </div>
                                         </div>
                                         <div className="pt-4 flex flex-col items-center gap-2">
                                             <span className="text-[10px] font-bold text-gray-400 uppercase italic">Preview:</span>
                                             <button style={{ 
                                                 backgroundColor: tempSettings.buyButton.color,
                                                 color: 'white',
                                                 fontSize: tempSettings.buyButton.fontSize,
                                                 borderRadius: tempSettings.buyButton.borderRadius,
                                                 padding: tempSettings.buyButton.padding
                                             }} className="font-black uppercase tracking-widest">{tempSettings.buyButton.text}</button>
                                         </div>
                                     </div>
                                </div>

                                {/* Cart Button Config */}
                                <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                                     <h4 className="font-bold text-sm text-gray-700 underline">"Add to Cart" Button</h4>
                                     <div className="space-y-4">
                                         <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Text</label>
                                                <input value={tempSettings.addToCartButton.text} onChange={e => setTempSettings({...tempSettings, addToCartButton: {...tempSettings.addToCartButton, text: e.target.value}})} className="w-full p-2 bg-white border border-gray-200 rounded text-xs" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Color</label>
                                                <input value={tempSettings.addToCartButton.color} onChange={e => setTempSettings({...tempSettings, addToCartButton: {...tempSettings.addToCartButton, color: e.target.value}})} className="w-full p-2 bg-white border border-gray-200 rounded text-xs" />
                                            </div>
                                         </div>
                                         <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Font Size</label>
                                                <input value={tempSettings.addToCartButton.fontSize} onChange={e => setTempSettings({...tempSettings, addToCartButton: {...tempSettings.addToCartButton, fontSize: e.target.value}})} className="w-full p-2 bg-white border border-gray-200 rounded text-xs" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Rounding</label>
                                                <input value={tempSettings.addToCartButton.borderRadius} onChange={e => setTempSettings({...tempSettings, addToCartButton: {...tempSettings.addToCartButton, borderRadius: e.target.value}})} className="w-full p-2 bg-white border border-gray-200 rounded text-xs" />
                                            </div>
                                         </div>
                                         <div className="pt-4 flex flex-col items-center gap-2">
                                             <span className="text-[10px] font-bold text-gray-400 uppercase italic">Preview:</span>
                                             <button style={{ 
                                                 borderColor: tempSettings.addToCartButton.color,
                                                 color: tempSettings.addToCartButton.color,
                                                 fontSize: tempSettings.addToCartButton.fontSize,
                                                 borderRadius: tempSettings.addToCartButton.borderRadius,
                                                 padding: tempSettings.addToCartButton.padding,
                                                 borderWidth: '2px'
                                             }} className="font-black uppercase tracking-widest bg-white">{tempSettings.addToCartButton.text}</button>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex gap-4 pt-8">
                             <button 
                                onClick={handleSaveSettings}
                                className="flex-grow py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-xl shadow-xl flex items-center justify-center gap-2"
                             >
                                <Save size={18} /> Apply Visual Engine Changes
                             </button>
                             <button 
                                onClick={resetSettings}
                                className="px-8 py-4 bg-gray-100 text-gray-500 font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"
                             >
                                <RefreshCcw size={18} /> Reset
                             </button>
                        </div>
                    </motion.div>
                )}

                {/* CUSTOMIZATION TAB */}
                {activeTab === 'customization' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                         <div className="pb-6 border-b border-gray-100">
                             <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                                🎨 ওয়েবসাইট কাস্টমাইজেশন <span className="text-gray-300 font-medium text-lg">/ Website Customization</span>
                             </h2>
                             <p className="text-gray-400 text-sm mt-1">কন্ট্রোল প্যানেল থেকে আপনার ওয়েবসাইটের সবকিছু পরিবর্তন করুন (Full Control Over Your Website)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* 1. LANGUAGE SETTINGS */}
                            <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 text-orange-500">
                                    <Globe size={20} />
                                    <h3 className="font-black uppercase tracking-tight text-sm">১. ভাষা সেটিংস / Language</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] text-gray-500 uppercase font-black">সিলেক্ট করুন (Primary Language)</p>
                                    <div className="flex gap-2">
                                        {(['bn', 'en', 'mixed'] as const).map(lang => (
                                            <button 
                                                key={lang}
                                                onClick={() => setTempSettings({
                                                    ...tempSettings, 
                                                    customization: { 
                                                        ...(tempSettings.customization || INITIAL_SETTINGS.customization!), 
                                                        language: lang 
                                                    }
                                                })}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                                                    tempSettings.customization?.language === lang 
                                                        ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20" 
                                                        : "bg-white border-gray-200 text-gray-400 hover:border-orange-200"
                                                )}
                                            >
                                                {lang === 'bn' ? 'বাংলা' : lang === 'en' ? 'English' : 'Mixed'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* 2. COLOR CUSTOMIZATION */}
                            <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 text-blue-500">
                                    <Palette size={20} />
                                    <h3 className="font-black uppercase tracking-tight text-sm">২. রঙ কাস্টমাইজেশন / Colors</h3>
                                </div>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {[
                                        { label: 'Primary (প্রাইমারি)', key: 'primary' },
                                        { label: 'Background (ব্যাকগ্রাউন্ড)', key: 'background' },
                                        { label: 'Header BG (হেডার)', key: 'headerBg' },
                                        { label: 'Footer BG (ফুটার)', key: 'footerBg' },
                                        { label: 'Price (প্রাইস)', key: 'priceColor' },
                                        { label: 'WhatsApp (হোয়াটসঅ্যাপ)', key: 'whatsappBtn' }
                                    ].map(color => (
                                        <div key={color.key} className="flex flex-col gap-1">
                                            <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">{color.label}</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="color" 
                                                    className="w-8 h-8 rounded shrink-0 cursor-pointer"
                                                    value={(tempSettings.customization?.colors as any)?.[color.key] || '#000000'}
                                                    onChange={e => setTempSettings({
                                                        ...tempSettings,
                                                        customization: {
                                                            ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                                            colors: { 
                                                                ...(tempSettings.customization?.colors || INITIAL_SETTINGS.customization!.colors), 
                                                                [color.key]: e.target.value 
                                                            }
                                                        }
                                                    })}
                                                />
                                                <input 
                                                    className="grow p-2 text-[10px] font-mono border rounded uppercase"
                                                    value={(tempSettings.customization?.colors as any)?.[color.key] || '#000000'}
                                                    onChange={e => setTempSettings({
                                                        ...tempSettings,
                                                        customization: {
                                                            ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                                            colors: { 
                                                                ...(tempSettings.customization?.colors || INITIAL_SETTINGS.customization!.colors), 
                                                                [color.key]: e.target.value 
                                                            }
                                                        }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 3. FONT & TEXT STYLE */}
                            <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 text-purple-500">
                                    <TypeIcon size={20} />
                                    <h3 className="font-black uppercase tracking-tight text-sm">৩. ফন্ট ও টেক্সট / Font & Style</h3>
                                </div>
                                <div className="space-y-4">
                                    {/* Heading Font Size */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">হেডিং সাইজ (H1 Size)</label>
                                            <span className="text-[10px] font-bold text-orange-500">{tempSettings.customization?.fonts?.sizes?.heading1}px</span>
                                        </div>
                                        <input 
                                            type="range" min="20" max="80" 
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                            value={tempSettings.customization?.fonts?.sizes?.heading1 || 48}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                                    fonts: {
                                                        ...(tempSettings.customization?.fonts || INITIAL_SETTINGS.customization!.fonts),
                                                        sizes: { 
                                                            ...(tempSettings.customization?.fonts?.sizes || INITIAL_SETTINGS.customization!.fonts.sizes), 
                                                            heading1: Number(e.target.value) 
                                                        }
                                                    }
                                                }
                                            })}
                                        />
                                    </div>
                                    {/* Body Font Size */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">বডি সাইজ (Body Size)</label>
                                            <span className="text-[10px] font-bold text-orange-500">{tempSettings.customization?.fonts?.sizes?.body}px</span>
                                        </div>
                                        <input 
                                            type="range" min="12" max="24" 
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                            value={tempSettings.customization?.fonts?.sizes?.body || 16}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                                    fonts: {
                                                        ...(tempSettings.customization?.fonts || INITIAL_SETTINGS.customization!.fonts),
                                                        sizes: { 
                                                            ...(tempSettings.customization?.fonts?.sizes || INITIAL_SETTINGS.customization!.fonts.sizes), 
                                                            body: Number(e.target.value) 
                                                        }
                                                    }
                                                }
                                            })}
                                        />
                                    </div>
                                    {/* Heading Style */}
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">ফন্ট স্টাইল (Heading Font)</label>
                                        <select 
                                            className="w-full p-2 text-xs border rounded-lg bg-white"
                                            value={tempSettings.customization?.fonts?.heading || 'Inter'}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                                    fonts: { 
                                                        ...(tempSettings.customization?.fonts || INITIAL_SETTINGS.customization!.fonts), 
                                                        heading: e.target.value 
                                                    }
                                                }
                                            })}
                                        >
                                            <option value="Inter">Inter (Classic)</option>
                                            <option value="Poppins">Poppins (Modern)</option>
                                            <option value="Playfair Display">Playfair (Elegant)</option>
                                            <option value="Space Grotesk">Space Grotesk (Tech)</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* 4. SECTION VISIBILITY */}
                            <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 text-red-500">
                                    <Eye size={20} />
                                    <h3 className="font-black uppercase tracking-tight text-sm">৪. সেকশন শো/হাইড / Visibility</h3>
                                </div>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {[
                                        { label: 'Hero Banner (হিরো ব্যানার)', key: 'heroBanner' },
                                        { label: 'Category Tabs (ক্যাটাগরি)', key: 'categoryTabs' },
                                        { label: 'Flash Sale (ফ্ল্যাশ সেল)', key: 'flashSaleSection' },
                                        { label: 'Search Bar (সার্চ বার)', key: 'searchBar' },
                                        { label: 'Wishlist (উইশলিস্ট)', key: 'wishlistBtn' },
                                        { label: 'WhatsApp Button (হোয়াটসঅ্যাপ)', key: 'whatsappFloat' }
                                    ].map(item => (
                                        <div key={item.key} className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <span className="text-[10px] font-bold text-gray-600">{item.label}</span>
                                            <button 
                                                onClick={() => setTempSettings({
                                                    ...tempSettings,
                                                    customization: {
                                                        ...tempSettings.customization!,
                                                        visibility: { 
                                                            ...tempSettings.customization!.visibility, 
                                                            [item.key]: !(tempSettings.customization?.visibility as any)?.[item.key] 
                                                        }
                                                    }
                                                })}
                                                className={cn(
                                                    "w-10 h-5 rounded-full p-1 transition-colors duration-300",
                                                    (tempSettings.customization?.visibility as any)?.[item.key] ? "bg-green-500" : "bg-gray-300"
                                                )}
                                            >
                                                <div className={cn("w-3 h-3 bg-white rounded-full transition-transform duration-300", (tempSettings.customization?.visibility as any)?.[item.key] ? "translate-x-5" : "translate-x-0")} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 5. LAYOUT & SPACING */}
                            <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 text-green-500">
                                    <Maximize2 size={20} />
                                    <h3 className="font-black uppercase tracking-tight text-sm">৫. লেআউট ও সাইজ / Layout</h3>
                                </div>
                                <div className="space-y-4">
                                    {/* Border Radius */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">রাউন্ডিং (Border Radius)</label>
                                            <span className="text-[10px] font-bold text-orange-500">{tempSettings.customization?.layout?.borderRadius}px</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="50" 
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                            value={tempSettings.customization?.layout?.borderRadius || 24}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...tempSettings.customization!,
                                                    layout: { ...tempSettings.customization?.layout, borderRadius: Number(e.target.value) }
                                                }
                                            })}
                                        />
                                    </div>
                                    {/* Product Grid Height */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">পণ্যের ছবি হাইট (Image Height)</label>
                                            <span className="text-[10px] font-bold text-orange-500">{tempSettings.customization?.layout?.imageHeight}px</span>
                                        </div>
                                        <input 
                                            type="range" min="150" max="500" 
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                            value={tempSettings.customization?.layout?.imageHeight || 300}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...tempSettings.customization!,
                                                    layout: { ...tempSettings.customization?.layout, imageHeight: Number(e.target.value) }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 6. EDIT ANY TEXT */}
                            <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 text-cyan-500">
                                    <Edit size={20} />
                                    <h3 className="font-black uppercase tracking-tight text-sm">৬. টেক্সট পরিবর্তন / Edit Text</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">ওয়েবসাইট নাম (Website Name)</label>
                                        <input 
                                            className="w-full p-2 text-xs border rounded-lg"
                                            value={tempSettings.customization?.text?.websiteName || ''}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...tempSettings.customization!,
                                                    text: { ...tempSettings.customization?.text, websiteName: e.target.value }
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">হিরো টাইটেল (Hero Title)</label>
                                        <input 
                                            className="w-full p-2 text-xs border rounded-lg"
                                            value={tempSettings.customization?.text?.heroTitle || ''}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                                    text: { 
                                                        ...(tempSettings.customization?.text || INITIAL_SETTINGS.customization!.text), 
                                                        heroTitle: e.target.value 
                                                    }
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">ফ্ল্যাশ সেল টাইটেল (Flash Sale Title)</label>
                                        <input 
                                            className="w-full p-2 text-xs border rounded-lg"
                                            value={tempSettings.customization?.text?.flashSaleTitle || ''}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                                    text: { 
                                                        ...(tempSettings.customization?.text || INITIAL_SETTINGS.customization!.text), 
                                                        flashSaleTitle: e.target.value 
                                                    }
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">ফ্ল্যাশ সেল শেষ টেক্সট (Flash Sale Ended Text)</label>
                                        <input 
                                            className="w-full p-2 text-xs border rounded-lg"
                                            value={tempSettings.customization?.text?.flashSaleEnded || ''}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                                    text: { 
                                                        ...(tempSettings.customization?.text || INITIAL_SETTINGS.customization!.text), 
                                                        flashSaleEnded: e.target.value 
                                                    }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 7. PRODUCT POSTING ENHANCEMENTS */}
                            <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 text-yellow-600">
                                    <Package size={20} />
                                    <h3 className="font-black uppercase tracking-tight text-sm">৭. অ্যাডভান্সড পোস্টিং / Advanced Posting</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-2 bg-white rounded-xl">
                                        <span className="text-[10px] font-bold text-gray-600">Auto Open Cart on Add</span>
                                        <button 
                                            onClick={() => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                                    productPosting: { 
                                                        ...(tempSettings.customization?.productPosting || { defaultDescription: '', autoAddToCart: false, soldOutThreshold: 0 }), 
                                                        autoAddToCart: !tempSettings.customization?.productPosting?.autoAddToCart 
                                                    }
                                                }
                                            })}
                                            className={cn(
                                                "w-10 h-5 rounded-full p-1 transition-colors",
                                                tempSettings.customization?.productPosting?.autoAddToCart ? "bg-orange-500" : "bg-gray-300"
                                            )}
                                        >
                                            <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", tempSettings.customization?.productPosting?.autoAddToCart ? "translate-x-5" : "translate-x-0")} />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Default Sold Out Alert</label>
                                        <input 
                                            type="number"
                                            className="w-full p-2 text-xs border rounded-lg"
                                            value={tempSettings.customization?.productPosting?.soldOutThreshold || 0}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...(tempSettings.customization || INITIAL_SETTINGS.customization!),
                                                    productPosting: { 
                                                        ...(tempSettings.customization?.productPosting || { defaultDescription: '', autoAddToCart: false, soldOutThreshold: 0 }), 
                                                        soldOutThreshold: Number(e.target.value) 
                                                    }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 8. SETTINGS MANAGEMENT */}
                            <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 text-emerald-600">
                                    <Save size={20} />
                                    <h3 className="font-black uppercase tracking-tight text-sm">৮. সেভ ইওর কাস্টমাইজেশন / Save</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-2 pt-2">
                                    <button 
                                        onClick={handleSaveSettings}
                                        className="w-full py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2 shadow-xl"
                                    >
                                        <Save size={16} /> সেভ করুন / Save Design
                                    </button>
                                    <button 
                                        onClick={resetSettings}
                                        className="w-full py-3 bg-white border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw size={14} /> রিসেট করুন / Reset
                                    </button>
                                </div>
                            </section>

                            {/* 9. SAFETY & SECURITY */}
                            <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-3 text-indigo-600">
                                    <Lock size={20} />
                                    <h3 className="font-black uppercase tracking-tight text-sm">৯. নিরাপত্তা সেটিংস / Safety</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">অ্যাডমিন ইমেইল (Admin Email)</label>
                                        <input 
                                            className="w-full p-2 text-xs border rounded-lg font-mono"
                                            value={tempSettings.security?.adminEmail || ''}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                security: { ...tempSettings.security!, adminEmail: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">নতুন পাসওয়ার্ড (New Password)</label>
                                        <input 
                                            type="password"
                                            className="w-full p-2 text-xs border rounded-lg font-mono"
                                            placeholder="Leave blank to keep current"
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                security: { ...tempSettings.security!, adminPassword: e.target.value || 't112233t' }
                                            })}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 10. ADVANCED OPTIONS */}
                            <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 md:col-span-2 lg:col-span-1">
                                <div className="flex items-center gap-3 text-gray-800">
                                    <Zap size={20} />
                                    <h3 className="font-black uppercase tracking-tight text-sm">১০. অ্যাডভান্সড / Advanced</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Custom CSS (নিজস্ব ডিজাইন কোড)</label>
                                        <textarea 
                                            className="w-full p-2 text-[10px] font-mono border rounded-lg h-32"
                                            placeholder=".my-class { color: red; }"
                                            value={tempSettings.customization?.advanced?.customCss || ''}
                                            onChange={e => setTempSettings({
                                                ...tempSettings,
                                                customization: {
                                                    ...tempSettings.customization!,
                                                    advanced: { ...tempSettings.customization!.advanced, customCss: e.target.value }
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'site_settings' && (
                    <SiteSettingsTab />
                )}

                {activeTab === 'complaints' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <ComplaintsManager />
                    </motion.div>
                )}

                 {activeTab === 'orders' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center bg-gray-900 p-8 rounded-[2rem] shadow-xl text-white">
                             <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                                    <ShoppingBag className="text-orange-500" size={32} /> Orders Dashboard
                                </h2>
                                <p className="text-gray-400 text-sm mt-2 font-medium">Real-time enterprise order fulfillment and tracking system</p>
                             </div>
                             {orders.length > 0 && (
                                <button 
                                    onClick={exportOrdersToExcel}
                                    className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-gray-100 transition-all active:scale-95"
                                >
                                    <Download size={16} /> Export CSV
                                </button>
                             )}
                        </div>

                        {orders.length === 0 ? (
                            <div className="py-24 text-center space-y-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm mt-6">
                                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-200">
                                    <ShoppingBag size={48} />
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No orders received yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 mt-6">
                                {orders.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                                    <div key={order.id} className="bg-white border-2 border-transparent hover:border-gray-900 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-all duration-300">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 pb-6 border-b border-gray-100">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 bg-gray-50 rounded-[1.25rem] flex items-center justify-center text-gray-900 shadow-inner border border-gray-100">
                                                    <ShoppingBag size={24} className="text-orange-500" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-black text-xl text-gray-900 uppercase tracking-tight">
                                                            {order.id}
                                                        </h4>
                                                        {order.status === 'pending' && <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse">New Order</span>}
                                                    </div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                 <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Order Amount</span>
                                                    <span className="font-black text-2xl text-gray-900 tracking-tighter">{formatPrice(order.total)}</span>
                                                 </div>
                                                 <div className="w-px h-12 bg-gray-100 hidden lg:block"></div>
                                                 <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Status</span>
                                                    <select 
                                                      value={order.status}
                                                      onChange={(e) => {
                                                        const newStatus = e.target.value as any;
                                                        // Update visually immediately
                                                        setOrders(prev => prev.map(o => o.id === order.id ? {...o, status: newStatus} : o));
                                                        // Update in firestore
                                                        import('firebase/firestore').then(({ doc, updateDoc }) => {
                                                            import('../lib/firebase').then(({ db }) => {
                                                                updateDoc(doc(db, 'orders', order.id), { status: newStatus }).catch(console.error);
                                                            });
                                                        });
                                                      }}
                                                      className={cn(
                                                        "text-[11px] font-black uppercase px-4 py-3 rounded-xl border-2 focus:ring-4 outline-none transition-all cursor-pointer shadow-sm appearance-none relative",
                                                        order.status === 'pending' ? "bg-orange-50 text-orange-600 border-orange-200 focus:ring-orange-500/20" :
                                                        order.status === 'processing' ? "bg-blue-50 text-blue-600 border-blue-200 focus:ring-blue-500/20" :
                                                        order.status === 'shipped' ? "bg-purple-50 text-purple-600 border-purple-200 focus:ring-purple-500/20" :
                                                        "bg-green-50 text-green-600 border-green-200 focus:ring-green-500/20"
                                                      )}
                                                    >
                                                      <option value="pending">Pending</option>
                                                      <option value="processing">Processing</option>
                                                      <option value="shipped">Shipped</option>
                                                      <option value="delivered">Delivered</option>
                                                    </select>
                                                 </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="space-y-6 bg-[#f8f9fa] p-6 rounded-[1.5rem] border border-gray-100">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-200 pb-3">
                                                    <User size={14} className="text-gray-900" />
                                                    Customer Details
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-black text-gray-500 text-xs mt-0.5 shadow-sm">
                                                            {order.customer.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 text-sm">{order.customer.name}</p>
                                                            <p className="text-gray-500 font-bold text-xs mt-0.5 flex items-center gap-1"><Phone size={10}/> {order.customer.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                        <p className="text-[10px] uppercase text-gray-400 font-black mb-1 flex items-center gap-1"><MapPin size={10}/> Shipping Address</p>
                                                        <p className="text-gray-700 text-sm font-medium leading-relaxed">{order.customer.address}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <span className="text-[10px] uppercase text-gray-400 font-black">Payment</span>
                                                        <span className="text-[10px] bg-green-100 text-green-700 font-black px-2 py-1 rounded-md uppercase tracking-wider">
                                                            {order.paymentMethod === 'cod' ? 'Cash On Delivery' : order.paymentMethod}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="lg:col-span-2 space-y-6">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-100 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <ShoppingCart size={14} className="text-gray-900" />
                                                        Purchased Items ({order.items.length})
                                                    </div>
                                                    <span>Total: {formatPrice(order.total)}</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-2xl border border-transparent hover:border-gray-200">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                                                     {item.image ? (
                                                                        <img loading="lazy" src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                     ) : (
                                                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400"><ShoppingBag size={16}/></div>
                                                                     )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                                                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-wider mt-0.5">
                                                                        Qty: {item.quantity} × {formatPrice(item.price)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-black text-gray-900 text-lg">{formatPrice(item.price * item.quantity)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-6 flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                                                    <button 
                                                        onClick={() => generateInvoice(order)}
                                                        className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-gray-200 hover:shadow-md"
                                                    >
                                                        <Printer size={16} /> View/Print Invoice
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                          if(window.confirm('Permanently delete this order record? This cannot be undone.')) {
                                                            setOrders(prev => prev.filter(o => o.id !== order.id));
                                                            import('firebase/firestore').then(({ doc, deleteDoc }) => {
                                                                import('../lib/firebase').then(({ db }) => {
                                                                    deleteDoc(doc(db, 'orders', order.id)).catch(console.error);
                                                                });
                                                            });
                                                          }
                                                        }}
                                                        className="px-6 py-4 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-red-100 hover:shadow-md ml-auto"
                                                    >
                                                        <Trash2 size={16} /> Delete Order
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
