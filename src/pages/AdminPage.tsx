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
  Users,
  Image as ImageIcon,
  FileText,
  Download,
  Printer,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Product, SiteSettings, Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice, cn } from '../lib/utils';
import AdminSalesChart from '../components/AdminSalesChart';
import { useNavigate } from 'react-router-dom';

import PostManager from '../components/PostManager';
import MediaManager from '../components/MediaManager';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, setProducts, settings, updateSettings, orders, analytics, logout } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'settings' | 'orders' | 'media' | 'posts'>('dashboard');

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
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [tempSettings, setTempSettings] = useState<SiteSettings>(settings);

  // --- Product Handlers ---
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.id) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct as Product : p));
    } else {
      const newProduct = { 
        ...editingProduct, 
        id: Math.random().toString(36).substr(2, 9),
        reviews: editingProduct.reviews || [],
        views: editingProduct.views || 0,
        rating: editingProduct.rating || 4.5
      } as Product;
      setProducts(prev => [...prev, newProduct]);
    }
    setEditingProduct(null);
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
    if (window.confirm('Reset to default settings?')) {
        // Logic to reset would go here
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
                    <Settings size={18} /> Site Styling
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
                
                {/* SETTINGS TAB ... */}
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
                                         <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
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
                                    name: '', price: 0, originalPrice: 0, image: '', category: 'Electronics', description: '', rating: 4.5, reviews: [], stock: 10, views: 0
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
                                                    <img src={p.image} className="w-10 h-10 rounded object-cover bg-gray-100" referrerPolicy="no-referrer" />
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
                                    <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Product Name</label>
                                            <input 
                                                required
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4"
                                                value={editingProduct.name}
                                                onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sale Price (BDT)</label>
                                            <input 
                                                type="number"
                                                required
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 font-mono"
                                                value={editingProduct.price}
                                                onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Original Price (optional)</label>
                                            <input 
                                                type="number"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 font-mono"
                                                value={editingProduct.originalPrice}
                                                onChange={e => setEditingProduct({...editingProduct, originalPrice: Number(e.target.value)})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Category</label>
                                            <select 
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4"
                                                value={editingProduct.category}
                                                onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                                            >
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Stock Units</label>
                                            <input 
                                                type="number"
                                                required
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 font-mono"
                                                value={editingProduct.stock}
                                                onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                                            />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Image URL</label>
                                            <input 
                                                required
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4"
                                                value={editingProduct.image}
                                                placeholder="https://example.com/item.jpg"
                                                onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Rich Product Description</label>
                                            <ReactQuill 
                                                theme="snow"
                                                value={editingProduct.description}
                                                onChange={val => setEditingProduct({...editingProduct, description: val})}
                                            />
                                        </div>
                                        
                                        <div className="md:col-span-2 flex gap-4 pt-4">
                                            <button 
                                                type="submit" 
                                                className="flex-grow py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-xl"
                                            >
                                                Save Product
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setEditingProduct(null)}
                                                className="px-8 py-4 bg-gray-100 text-gray-500 font-black uppercase tracking-widest rounded-xl hover:bg-gray-200"
                                            >
                                                Cancel
                                            </button>
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

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="pb-6 border-b border-gray-100 flex justify-between items-center">
                             <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Recent Transactions</h2>
                                <p className="text-gray-400 text-sm mt-1">Real-time order feed and fulfillment</p>
                             </div>
                             {orders.length > 0 && (
                                <button 
                                    onClick={exportOrdersToExcel}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg hover:bg-green-600 transition-all"
                                >
                                    <Download size={14} /> Export to Excel
                                </button>
                             )}
                        </div>

                        {orders.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                                    <ShoppingBag size={40} />
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No orders received yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                    <ShoppingBag size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 uppercase tracking-tight">{order.id}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                 <span className="bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-yellow-100">
                                                     {order.status}
                                                 </span>
                                                 <span className="font-black text-lg" style={{ color: settings.primaryColor }}>{formatPrice(order.total)}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                            <div className="space-y-3">
                                                <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Customer Information</h5>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-gray-800">{order.customer.name}</p>
                                                    <p className="text-gray-500">{order.customer.phone}</p>
                                                    <p className="text-gray-500">{order.customer.address}</p>
                                                    <p className="text-gray-400 italic text-[10px] uppercase font-bold tracking-widest">Via {order.paymentMethod.toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Line Items ({order.items.length})</h5>
                                                <div className="space-y-2">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-600 font-medium">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                                                            <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex gap-2">
                                            <button className="grow py-2 bg-gray-900 text-white rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                <CheckCircle size={14} /> Mark as Delivered
                                            </button>
                                            <button 
                                                onClick={() => generateInvoice(order)}
                                                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-gray-200"
                                            >
                                                <Printer size={14} /> Invoice PDF
                                            </button>
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
