import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, X, Grid, Image as ImageIcon, Palette, 
  Layout, Moon, Sun, Monitor, Clock, Plus, Trash2,
  ChevronRight, RefreshCw, Zap, Code2, Sparkles, Upload
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';
import { INITIAL_SETTINGS, THEME_PRESETS } from '../constants';

const MASTER_THEMES = [
  {
    id: 'luxury-dark',
    name: 'Luxury Dark (Gold)',
    ...THEME_PRESETS['luxury-dark'],
    preview: 'bg-[#000000] border-[#D4AF37]'
  },
  {
    id: 'minimal-white',
    name: 'Minimalist White',
    ...THEME_PRESETS['minimal-white'],
    preview: 'bg-white border-slate-200'
  },
  {
    id: 'festive',
    name: 'Festive Red',
    ...THEME_PRESETS['festive'],
    preview: 'bg-[#D62828] border-white'
  },
  {
    id: 'default',
    name: 'Default Shop Mix',
    colors: {
      primary: '#FF6B00',
      background: '#FDFDFD',
      textHeadings: '#111827',
      headerBg: '#FFFFFF',
      footerBg: '#1A1A1A',
      cardBg: '#FFFFFF',
    },
    preview: 'bg-[#FF6B00]'
  }
];

export const AdminProcessSettings: React.FC = () => {
  const { settings, updateSettings, isSettingsOpen, setIsSettingsOpen } = useApp();
  const [activeSegment, setActiveSegment] = useState<'layout' | 'theme' | 'carousel' | 'security' | 'advanced'>('theme');
  const [newPin, setNewPin] = useState('');
  const [isPinEnabled, setIsPinEnabled] = useState(() => {
    const saved = localStorage.getItem('is_drawer_pin_enabled');
    return saved === null ? true : saved === 'true';
  });

  const c = settings.customization || INITIAL_SETTINGS.customization!;

  const togglePin = () => {
    const newValue = !isPinEnabled;
    setIsPinEnabled(newValue);
    localStorage.setItem('is_drawer_pin_enabled', String(newValue));
  };

  const handleSavePin = () => {
    if (newPin.length < 4) {
      alert('PIN must be at least 4 characters');
      return;
    }
    localStorage.setItem('drawer_pin', newPin);
    alert('Drawer PIN updated successfully!');
    setNewPin('');
  };

  const updateNested = (path: string, value: any) => {
    const newSettings = JSON.parse(JSON.stringify(settings));
    const parts = path.split('.');
    let current = newSettings;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    updateSettings(newSettings);
  };

  const applyTheme = (theme: any) => {
    const newSettings = { ...settings };
    if (!newSettings.customization) newSettings.customization = { ...INITIAL_SETTINGS.customization! };
    
    newSettings.primaryColor = theme.colors.primary;
    newSettings.customization.colors = {
      ...newSettings.customization.colors,
      ...theme.colors
    };
    newSettings.customization.theme = theme.id;
    newSettings.customization.fonts = {
      ...newSettings.customization.fonts,
      heading: theme.fonts?.heading || 'Poppins',
      body: theme.fonts?.body || 'Inter'
    };
    newSettings.customization.darkMode = theme.id === 'luxury-dark';
    
    updateSettings(newSettings);
  };

  const addCarouselUrl = () => {
    const urls = [...(c.carousel?.urls || [])];
    urls.push('');
    updateNested('customization.carousel.urls', urls);
  };

  const removeCarouselUrl = (index: number) => {
    const urls = [...(c.carousel?.urls || [])];
    urls.splice(index, 1);
    updateNested('customization.carousel.urls', urls);
  };

  const updateCarouselUrl = (index: number, val: string) => {
    const urls = [...(c.carousel?.urls || [])];
    urls[index] = val;
    updateNested('customization.carousel.urls', urls);
  };

  return (
    <>
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[10001] flex flex-col"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                    <Zap className="fill-orange-500 text-orange-500" size={20} />
                    All Process Settings
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Admin Control Center</p>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex border-b">
                {(['theme', 'layout', 'carousel', 'security', 'advanced'] as const).map(seg => (
                  <button 
                    key={seg}
                    onClick={() => setActiveSegment(seg)}
                    className={cn(
                      "flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-b-2",
                      activeSegment === seg ? "border-black text-black" : "border-transparent text-gray-400"
                    )}
                  >
                    {seg}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
                {activeSegment === 'theme' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Sun size={12} /> Mode Control
                      </label>
                      <button 
                        onClick={() => updateNested('customization.darkMode', !c.darkMode)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                          c.darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {c.darkMode ? <Moon size={12} /> : <Sun size={12} />}
                        {c.darkMode ? 'Dark Mode' : 'Light Mode'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Palette size={12} /> Master Theme Engine
                      </label>
                      <div className="bg-black/5 p-5 rounded-3xl border border-gray-100 mb-4">
                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                          <Sparkles size={10} className="inline mr-1 text-primary" /> 
                          Instantly transform your shop's identity. Switching a theme updates colors, fonts, and layout presets globally.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {MASTER_THEMES.map(theme => (
                          <button 
                            key={theme.id}
                            onClick={() => applyTheme(theme)}
                            className={cn(
                              "group relative overflow-hidden rounded-3xl border-2 transition-all duration-500 text-left",
                              (settings.customization?.theme === theme.id)
                                ? "border-black ring-4 ring-black/5 bg-white shadow-xl scale-[1.02]" 
                                : "border-gray-100 bg-white hover:border-gray-300"
                            )}
                          >
                            <div className={cn("h-32 w-full transition-transform duration-700 group-hover:scale-110", theme.preview)} />
                            <div className="p-4 flex items-center justify-between">
                              <div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-black block">
                                  {theme.name}
                                </span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Premium Template</span>
                              </div>
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500",
                                (settings.customization?.theme === theme.id) ? "bg-black text-white" : "bg-gray-100 text-transparent"
                              )}>
                                <Zap size={10} />
                              </div>
                            </div>
                            
                            {settings.customization?.theme === theme.id && (
                              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                                <span className="text-[7px] font-black uppercase tracking-widest text-white">Active</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSegment === 'layout' && (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Grid size={12} /> Grid Columns (Desktop)
                      </label>
                      <div className="flex gap-2">
                        {[2, 3, 4, 5].map(cols => (
                          <button 
                            key={cols}
                            onClick={() => updateNested('customization.layout.gridColumns', cols)}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-sm font-black transition-all border-2",
                              (c.layout.gridColumns || 4) === cols 
                                ? "border-black bg-black text-white" 
                                : "border-gray-100 text-gray-400"
                            )}
                          >
                            {cols}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <label>Hero Height</label>
                          <span>{(c.layout.heroHeight || 600)}px</span>
                        </div>
                        <input 
                          type="range"
                          min="300"
                          max="1000"
                          value={c.layout.heroHeight || 600}
                          onChange={(e) => updateNested('customization.layout.heroHeight', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <label>Hero Padding</label>
                          <span>{(c.layout.heroPadding || 40)}px</span>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="200"
                          value={c.layout.heroPadding || 40}
                          onChange={(e) => updateNested('customization.layout.heroPadding', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t font-bold">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 block">Product Image Styling</label>
                       
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                              <label>Image Height</label>
                              <span>{(c.layout.productImageHeight || 300)}px</span>
                            </div>
                            <input 
                              type="range"
                              min="100"
                              max="500"
                              value={c.layout.productImageHeight || 300}
                              onChange={(e) => updateNested('customization.layout.productImageHeight', parseInt(e.target.value))}
                              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fit Mode</label>
                            <div className="flex gap-2">
                               {[
                                 { id: 'cover', name: 'Cover Space' },
                                 { id: 'contain', name: 'Show Full' }
                               ].map(mode => (
                                 <button
                                   key={mode.id}
                                   onClick={() => updateNested('customization.layout.productImageFit', mode.id)}
                                   className={cn(
                                     "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                     (c.layout.productImageFit || 'cover') === mode.id 
                                       ? "border-black bg-black text-white" 
                                       : "border-gray-100 text-gray-400"
                                   )}
                                 >
                                   {mode.name}
                                 </button>
                               ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Aspect Ratio</label>
                            <select 
                              value={c.layout.productImageAspectRatio || '1/1'}
                              onChange={(e) => updateNested('customization.layout.productImageAspectRatio', e.target.value)}
                              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                            >
                              <option value="1/1">Square (1:1)</option>
                              <option value="3/4">Portrait (3:4)</option>
                              <option value="2/3">Portrait (2:3)</option>
                              <option value="16/9">Landscape (16:9)</option>
                              <option value="auto">Auto (Original)</option>
                            </select>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6 pt-6 border-t font-bold">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 block">Card Styling</label>
                       
                       <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                              <label>Radius</label>
                              <span>{(c.layout.borderRadius || 24)}px</span>
                            </div>
                            <input 
                              type="range"
                              min="0"
                              max="60"
                              value={c.layout.borderRadius || 24}
                              onChange={(e) => updateNested('customization.layout.borderRadius', parseInt(e.target.value))}
                              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                              <label>Gap</label>
                              <span>{(c.layout.cardGap || 24)}px</span>
                            </div>
                            <input 
                              type="range"
                              min="8"
                              max="64"
                              value={c.layout.cardGap || 24}
                              onChange={(e) => updateNested('customization.layout.cardGap', parseInt(e.target.value))}
                              className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeSegment === 'carousel' && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <RefreshCw size={12} /> Auto-Slide
                      </label>
                      <button 
                        onClick={() => updateNested('customization.carousel.isEnabled', !c.carousel?.isEnabled)}
                        className={cn(
                          "w-12 h-6 rounded-full p-1 transition-all",
                          c.carousel?.isEnabled ? "bg-green-500" : "bg-gray-200"
                        )}
                      >
                         <div className={cn("w-4 h-4 bg-white rounded-full transition-all", c.carousel?.isEnabled ? "translate-x-6" : "")} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <label>Slide Duration (Seconds)</label>
                        <span>{c.carousel?.duration || 5}s</span>
                      </div>
                      <input 
                        type="range"
                        min="2"
                        max="15"
                        value={c.carousel?.duration || 5}
                        onChange={(e) => updateNested('customization.carousel.duration', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>

                    <div className="space-y-4 pt-6 border-t">
                       <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Image Slides</label>
                          <button 
                            onClick={addCarouselUrl}
                            className="bg-black text-white p-1.5 rounded-lg hover:scale-105 transition-all"
                          >
                             <Plus size={16} />
                          </button>
                       </div>

                       <div className="space-y-3">
                          {(c.carousel?.urls || []).map((url, idx) => (
                            <div key={idx} className="flex gap-2 group">
                              <div className="grow relative">
                                <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                  value={url}
                                  onChange={(e) => updateCarouselUrl(idx, e.target.value)}
                                  placeholder="https://..."
                                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                />
                              </div>
                              <button 
                                onClick={() => removeCarouselUrl(idx)}
                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}

                {activeSegment === 'advanced' && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Code2 size={12} /> Custom HTML / Scripts
                      </label>
                      <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                        Paste any custom code here (Facebook Pixel, Google Analytics, Live Chat, etc.). 
                        It will be injected into the website automatically.
                      </p>
                      <textarea 
                        value={c.advanced?.customHtml || ''}
                        onChange={(e) => updateNested('customization.advanced.customHtml', e.target.value)}
                        placeholder="<!-- Paste scripts here -->"
                        className="w-full h-48 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-xs font-mono outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>

                    <div className="space-y-4 pt-6 border-t">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Palette size={12} /> Custom CSS
                      </label>
                      <textarea 
                        value={c.advanced?.customCss || ''}
                        onChange={(e) => updateNested('customization.advanced.customCss', e.target.value)}
                        placeholder=".my-class { color: red; }"
                        className="w-full h-48 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-xs font-mono outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                  </div>
                )}

                {activeSegment === 'security' && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Security Settings</label>

                       <div className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-xl", isPinEnabled ? "bg-green-50 text-green-500" : "bg-gray-50 text-gray-400")}>
                              <Zap size={16} />
                            </div>
                            <div>
                               <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block leading-tight">পাসওয়ার্ড প্রটেকশন</label>
                               <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Toggle Protection On/Off</span>
                            </div>
                          </div>
                          <button 
                            onClick={togglePin}
                            className={cn(
                              "w-14 h-8 rounded-full p-1.5 transition-all duration-300",
                              isPinEnabled ? "bg-black" : "bg-gray-200"
                            )}
                          >
                             <div className={cn("w-5 h-5 bg-white rounded-full transition-all duration-300", isPinEnabled ? "translate-x-6" : "")} />
                          </button>
                       </div>
                       
                       <div className="space-y-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Drawer PIN</label>
                            <input 
                              type="text"
                              value={newPin}
                              onChange={(e) => setNewPin(e.target.value)}
                              placeholder="e.g. 112233"
                              className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-5 text-xs font-bold focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
                            />
                          </div>

                          <button 
                            onClick={handleSavePin}
                            className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                          >
                            Save PIN
                          </button>
                       </div>

                       <p className="text-[9px] text-gray-400 font-bold leading-relaxed italic px-2">
                         Note: When disabled, the mobile menu opens directly. When enabled, it requires the PIN. Default is 112233.
                       </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t mt-auto">
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all customization settings?')) {
                      updateSettings({ ...settings, customization: INITIAL_SETTINGS.customization });
                    }
                  }}
                  className="w-full py-4 border-2 border-dashed border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-red-200 hover:text-red-500 transition-all rounded-2xl"
                >
                  Reset to Default
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
