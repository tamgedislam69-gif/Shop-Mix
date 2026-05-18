import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Image as ImageIcon, 
  Video, 
  X,
  RefreshCcw,
  Maximize2,
  Minimize2,
  Sun,
  Contrast,
  ImagePlay,
  Upload,
  Loader2
} from 'lucide-react';
import { Media } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

const MediaManager: React.FC = () => {
  const { media, setMedia, settings } = useApp();
  const [editingMedia, setEditingMedia] = useState<Partial<Media & { width?: number, height?: number, brightness?: number, contrast?: number }> | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `media/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      setEditingMedia(prev => ({
        ...prev,
        url,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        title: prev?.title || file.name,
        description: prev?.description || '',
        brightness: 100,
        contrast: 100
      }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please check your Firebase Storage rules.");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredMedia = media.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || m.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    if (editingMedia.id) {
      setMedia(prev => prev.map(m => m.id === editingMedia.id ? editingMedia as Media : m));
    } else {
      const newMedia: Media = {
        ...editingMedia,
        id: `M-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as Media;
      setMedia(prev => [newMedia, ...prev]);
    }
    setEditingMedia(null);
  };

  const deleteMedia = (id: string) => {
    if (confirm('Delete this media file? This might break parts of the site using its URL.')) {
      setMedia(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Media Explorer Pro</h2>
          <p className="text-sm text-gray-500">Advanced assets & editing suite</p>
        </div>
        <button 
          onClick={() => setEditingMedia({ type: 'image', title: '', url: '', description: '', width: 1600, height: 900, brightness: 100, contrast: 100 })}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-lg"
          style={{ backgroundColor: settings.primaryColor }}
        >
          <Plus size={18} /> New Resource
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'image', 'video'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-grow sm:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              {f}s
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence>
          {filteredMedia.map(m => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden aspect-square hover:shadow-xl transition-all"
            >
              <div className="w-full h-full overflow-hidden">
                {m.type === 'image' ? (
                  <img 
                    src={m.url || undefined} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    referrerPolicy="no-referrer" 
                    loading="lazy"
                  />
                ) : (
                  <video src={m.url || undefined} className="w-full h-full object-cover" muted />
                )}
              </div>
              
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 backdrop-blur-[2px]">
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingMedia({...m, brightness: 100, contrast: 100})} className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 backdrop-blur-md"><Edit size={16} /></button>
                  <button onClick={() => deleteMedia(m.id)} className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg"><Trash2 size={16} /></button>
                </div>
                <div className="text-white">
                  <p className="text-xs font-black uppercase tracking-tight truncate">{m.title}</p>
                  <p className="text-[10px] opacity-60 font-medium truncate mt-0.5">{m.description || 'No description'}</p>
                </div>
              </div>
              
              {m.type === 'video' && (
                <div className="absolute top-3 left-3 p-1.5 bg-black/40 backdrop-blur-md text-white rounded-lg pointer-events-none">
                  <Video size={12} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Advanced Editor Modal */}
      <AnimatePresence>
        {editingMedia && (
          <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-lg">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-10 border border-white/20"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${settings.primaryColor}10` }}>
                        {editingMedia.type === 'image' ? <ImageIcon style={{ color: settings.primaryColor }} /> : <Video style={{ color: settings.primaryColor }} />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Media Studio</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Advanced Media Customization</p>
                    </div>
                </div>
                <button onClick={() => setEditingMedia(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all"><X size={28} /></button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Preview Panel */}
                <div className="space-y-6">
                    <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden shadow-inner relative border border-gray-100">
                        {editingMedia.type === 'image' ? (
                            <img loading="lazy" 
                                src={editingMedia.url || undefined} 
                                className="w-full h-full object-contain" 
                                style={{ 
                                    filter: `brightness(${editingMedia.brightness}%) contrast(${editingMedia.contrast}%)`
                                }}
                            />
                        ) : (
                            <video src={editingMedia.url || undefined} className="w-full h-full object-cover" controls />
                        )}
                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] text-white font-black uppercase tracking-widest">
                            {editingMedia.type} Preview
                        </div>
                    </div>

                    {/* Quick Filters */}
                    {editingMedia.type === 'image' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><Sun size={12} /> Brightness</label>
                                <input 
                                    type="range" min="50" max="150" 
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                    value={editingMedia.brightness}
                                    style={{ accentColor: settings.primaryColor }}
                                    onChange={e => setEditingMedia({...editingMedia, brightness: parseInt(e.target.value)})}
                                />
                                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                                    <span>Dim</span>
                                    <span>{editingMedia.brightness}%</span>
                                    <span>Bright</span>
                                </div>
                            </div>
                            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><Contrast size={12} /> Contrast</label>
                                <input 
                                    type="range" min="50" max="150" 
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                    value={editingMedia.contrast}
                                    style={{ accentColor: settings.primaryColor }}
                                    onChange={e => setEditingMedia({...editingMedia, contrast: parseInt(e.target.value)})}
                                />
                                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                                    <span>Soft</span>
                                    <span>{editingMedia.contrast}%</span>
                                    <span>Hard</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Panel */}
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Title</label>
                             <input 
                                required 
                                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all font-sans"
                                value={editingMedia.title}
                                onChange={(e) => setEditingMedia({...editingMedia, title: e.target.value})}
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Resizing (W x H)</label>
                             <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 font-bold outline-none text-center"
                                    placeholder="1920"
                                    value={editingMedia.width}
                                    onChange={e => setEditingMedia({...editingMedia, width: parseInt(e.target.value)})}
                                />
                                <span className="flex items-center text-gray-300">x</span>
                                <input 
                                    type="number" 
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 font-bold outline-none text-center"
                                    placeholder="1080"
                                    value={editingMedia.height}
                                    onChange={e => setEditingMedia({...editingMedia, height: parseInt(e.target.value)})}
                                />
                             </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Media Source</label>
                      <div className="flex flex-col gap-4">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-32 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-gray-50 transition-all cursor-pointer group relative overflow-hidden"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="animate-spin text-primary" size={24} />
                              <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Uploading to Cloud...</span>
                            </>
                          ) : (
                            <>
                              <div className="bg-black text-white p-3 rounded-full group-hover:scale-110 transition-all shadow-lg">
                                <Upload size={18} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Choose from Gallery</span>
                            </>
                          )}
                          <input 
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                          />
                        </div>

                        <div className="relative group">
                          <input 
                            required 
                            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-mono text-[10px] outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all font-bold pr-20"
                            value={editingMedia.url}
                            onChange={(e) => setEditingMedia({...editingMedia, url: e.target.value})}
                            placeholder="Or paste direct image/video URL here..."
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-gray-300 tracking-widest">
                            Manual URL
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Description / Meta Content</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all resize-none"
                        value={editingMedia.description}
                        onChange={(e) => setEditingMedia({...editingMedia, description: e.target.value})}
                        placeholder="Describe this asset for SEO..."
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                          type="submit"
                          className="flex-grow py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                          style={{ backgroundColor: settings.primaryColor }}
                        >
                          <RefreshCcw size={20} /> Deploy Changes
                        </button>
                    </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaManager;
