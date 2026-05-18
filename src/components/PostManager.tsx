import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Eye, 
  X, 
  Type, 
  Layout, 
  Image as ImageIcon,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Post } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const PostManager: React.FC = () => {
  const { posts, setPosts, settings } = useApp();
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Auto-save logic
  useEffect(() => {
    if (!editingPost || !editingPost.id) return;
    
    const timer = setTimeout(() => {
        handleSave(null);
        setLastSaved(new Date().toLocaleTimeString());
    }, 5000); // Auto-save every 5 seconds if changed

    return () => clearTimeout(timer);
  }, [editingPost]);

  const handleSave = (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    if (!editingPost) return;

    if (editingPost.id) {
      setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...editingPost, updatedAt: new Date().toISOString() } as Post : p));
    } else {
      const newPost: Post = {
        ...editingPost,
        id: `P-${Date.now()}`,
        author: 'Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published'
      } as Post;
      setPosts(prev => [newPost, ...prev]);
    }
    
    if (e) setEditingPost(null);
  };

  const deletePost = (id: string) => {
    if (confirm('Permanently delete this post?')) {
      setPosts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Announcements & Blog</h2>
          <p className="text-sm text-gray-500">Engage customers with fresh content</p>
        </div>
        <button 
          onClick={() => setEditingPost({ title: '', content: '', image: '', status: 'draft' })}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-black uppercase tracking-widest text-xs shadow-lg"
          style={{ backgroundColor: settings.primaryColor }}
        >
          <Plus size={18} /> New Campaign
        </button>
      </div>

      {/* Post List */}
      <div className="grid grid-cols-1 gap-4">
        {posts.map(post => (
          <motion.div 
            key={post.id}
            layout
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-center group hover:shadow-md transition-all"
          >
            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
               <img loading="lazy" src={post.image || undefined} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-grow space-y-2 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-2">
                 <span className={cn(
                   "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                   post.status === 'published' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                 )}>
                   {post.status}
                 </span>
                 <span className="text-[10px] text-gray-400 font-bold">{new Date(post.updatedAt).toLocaleDateString()}</span>
               </div>
               <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors" style={{ color: settings.primaryColor }}>{post.title}</h3>
               <p className="text-sm text-gray-500 line-clamp-2">{post.content}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditingPost(post)} className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"><Edit size={18} /></button>
                <button onClick={() => deletePost(post.id)} className="p-3 bg-gray-50 text-red-500 rounded-xl hover:bg-red-50 transition-all"><Trash2 size={18} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {editingPost && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 md:p-12 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${settings.primaryColor}10` }}>
                        <FileText size={24} style={{ color: settings.primaryColor }} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Content Workspace</h3>
                        {lastSaved && <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1"><CheckCircle size={10} /> Auto-saved at {lastSaved}</p>}
                    </div>
                 </div>
                 <button onClick={() => setEditingPost(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"><X size={24} /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><Type size={12} /> Campaign Heading</label>
                             <input 
                                required
                                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-lg font-black outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all"
                                value={editingPost.title}
                                onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                                placeholder="Summer Flash Sale"
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><ImageIcon size={12} /> Featured Media URL</label>
                             <input 
                                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-mono outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all"
                                value={editingPost.image}
                                onChange={e => setEditingPost({...editingPost, image: e.target.value})}
                                placeholder="https://..."
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><Layout size={12} /> Status</label>
                             <div className="flex gap-2">
                                {(['published', 'draft'] as const).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setEditingPost({...editingPost, status: s})}
                                        className={cn(
                                            "flex-grow py-3 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                                            editingPost.status === s ? "border-primary bg-primary/5 text-primary" : "border-gray-50 text-gray-300"
                                        )}
                                        style={{ 
                                            borderColor: editingPost.status === s ? settings.primaryColor : undefined,
                                            color: editingPost.status === s ? settings.primaryColor : undefined,
                                            backgroundColor: editingPost.status === s ? `${settings.primaryColor}10` : undefined
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div className="space-y-2 flex flex-col">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">Main Content</label>
                        <div className="flex-grow relative">
                             <textarea 
                                required
                                rows={10}
                                className="w-full h-full bg-gray-50 border-none rounded-2xl py-6 px-8 text-sm leading-relaxed outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all resize-none"
                                value={editingPost.content}
                                onChange={e => setEditingPost({...editingPost, content: e.target.value})}
                                placeholder="Write your announcement body here..."
                             />
                             <div className="absolute top-4 right-4 flex gap-2">
                                <button type="button" className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 font-bold hover:bg-gray-50 transition-all">B</button>
                                <button type="button" className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 italic hover:bg-gray-50 transition-all">I</button>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button 
                        type="submit"
                        className="flex-grow py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:scale-[1.01] transition-transform active:scale-[0.98]"
                    >
                        Publish Instantly
                    </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostManager;
