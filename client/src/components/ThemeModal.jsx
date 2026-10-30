import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, Image, Sliders, Check, Sparkles, Cloud, ArrowUpRight, Palette } from 'lucide-react';

const THEMES = [
  {
    id: 'glass-dark',
    name: 'Obsidian Glass',
    description: 'Sleek frosted dark glass with subtle platinum highlights',
    accent: '#6366f1',
    cardBg: 'rgba(28, 28, 32, 0.72)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Azure',
    description: 'Deep celestial sapphire with glowing cyan borders',
    accent: '#38bdf8',
    cardBg: 'rgba(15, 23, 42, 0.75)',
    border: 'rgba(56, 189, 248, 0.2)',
  },
  {
    id: 'cyber-violet',
    name: 'Cyberpunk Violet',
    description: 'Vibrant neon purple with electric magenta hues',
    accent: '#c084fc',
    cardBg: 'rgba(26, 16, 37, 0.75)',
    border: 'rgba(192, 132, 252, 0.25)',
  },
  {
    id: 'emerald-forest',
    name: 'Emerald Grove',
    description: 'Organic deep moss green with mint and warm gold aura',
    accent: '#34d399',
    cardBg: 'rgba(14, 31, 23, 0.75)',
    border: 'rgba(52, 211, 153, 0.22)',
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Dunes',
    description: 'Warm terracotta, desert rose and golden amber glow',
    accent: '#fb923c',
    cardBg: 'rgba(36, 22, 18, 0.75)',
    border: 'rgba(251, 146, 60, 0.22)',
  },
];

const PRESET_WALLPAPERS = [
  { name: 'Original Hero', url: '/HEROSCREEN-2025021222.webp' },
  { name: 'Cosmic Nebula', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Minimal Mountain', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Tokyo Rain', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Emerald Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80' },
  { name: 'Dark Abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80' },
];

export default function ThemeModal({ isOpen, onClose }) {
  const { preferences, changeTheme, setBackgroundUrl, uploadCustomBackground, updateGlassSettings } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('wallpaper'); // 'wallpaper' | 'theme' | 'glass'
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [previewLocal, setPreviewLocal] = useState(null);

  if (!isOpen) return null;

  const currentThemeId = preferences?.theme_name || 'glass-dark';
  const currentBg = preferences?.background_url || '/HEROSCREEN-2025021222.webp';
  const blur = preferences?.glass_blur || 16;
  const opacity = preferences?.glass_opacity || 80;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 15MB
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File is too large (maximum 15MB allowed)');
      return;
    }

    setUploadError('');
    setUploadSuccess('');
    setUploading(true);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewLocal(ev.target.result);
    reader.readAsDataURL(file);

    try {
      const res = await uploadCustomBackground(file);
      setUploadSuccess(
        res.storage === 'amazon-s3'
          ? 'Uploaded to Amazon S3 & applied as app background!'
          : 'Image uploaded and applied as background! (Amazon S3 ready)'
      );
    } catch (err) {
      setUploadError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl rounded-[10px] p-7 text-white shadow-2xl relative overflow-hidden transition-all border border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(24, 24, 28, 0.95), rgba(16, 16, 20, 0.98))',
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(99, 102, 241, 0.2)',
        }}
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-b-full blur-[2px]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Theme & Wallpaper Customizer</h2>
              <p className="text-xs text-slate-400">Personalize background images with Amazon S3 and frosted glass</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[6px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Sub-Tabs */}
        <div className="grid grid-cols-3 p-1 rounded-[8px] bg-black/40 border border-white/5 mb-6">
          <button
            onClick={() => setActiveTab('wallpaper')}
            className={`py-2 text-xs font-semibold rounded-[6px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'wallpaper' ? 'bg-white/15 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Image className="w-3.5 h-3.5" /> Upload Background
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`py-2 text-xs font-semibold rounded-[6px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'theme' ? 'bg-white/15 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Color Palette
          </button>
          <button
            onClick={() => setActiveTab('glass')}
            className={`py-2 text-xs font-semibold rounded-[6px] flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'glass' ? 'bg-white/15 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Glassmorphism
          </button>
        </div>

        {/* TAB 1: WALLPAPER & S3 IMAGE UPLOAD */}
        {activeTab === 'wallpaper' && (
          <div className="space-y-5">
            {/* Direct Image Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-400/80 rounded-[8px] p-6 text-center cursor-pointer transition-all bg-indigo-500/5 hover:bg-indigo-500/10 group relative overflow-hidden"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-[8px] bg-indigo-500/20 group-hover:scale-110 text-indigo-400 flex items-center justify-center transition-transform shadow-md">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {uploading ? 'Streaming to Amazon S3...' : 'Upload your own background image'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click to browse or drag & drop PNG, JPG, WebP (up to 15MB)
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-[6px] border border-indigo-800/40">
                  <Cloud className="w-3 h-3" /> Amazon S3 Cloud Storage Integration
                </div>
              </div>
            </div>

            {/* Upload notifications */}
            {uploadSuccess && (
              <div className="p-3 rounded-[8px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {uploadSuccess}
              </div>
            )}
            {uploadError && (
              <div className="p-3 rounded-[8px] bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <span>⚠️</span> {uploadError}
              </div>
            )}

            {/* Presets Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Preset Wallpapers
                </span>
                <span className="text-[11px] text-slate-400">Click to switch</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {PRESET_WALLPAPERS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setBackgroundUrl(preset.url)}
                    className={`group relative h-20 rounded-[8px] overflow-hidden border-2 transition-all cursor-pointer ${
                      currentBg === preset.url
                        ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-105'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-medium text-white truncate">{preset.name}</span>
                    </div>
                    {currentBg === preset.url && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-[4px] bg-indigo-600 flex items-center justify-center text-white text-[10px]">
                        ✓
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PALETTES */}
        {activeTab === 'theme' && (
          <div className="space-y-3.5">
            <p className="text-xs text-slate-400">
              Select an ambient color theme that tunes card borders, glows, and widgets to your background:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {THEMES.map((t) => {
                const isActive = currentThemeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => changeTheme(t.id)}
                    className={`p-3.5 rounded-[8px] text-left border transition-all flex items-start gap-3 cursor-pointer ${
                      isActive
                        ? 'border-indigo-500 bg-white/10 shadow-lg ring-1 ring-indigo-500/40'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-[6px] flex-shrink-0 flex items-center justify-center border shadow-sm"
                      style={{ backgroundColor: t.cardBg, borderColor: t.border }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.accent }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">{t.name}</span>
                        {isActive && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GLASSMORPHISM SLIDERS */}
        {activeTab === 'glass' && (
          <div className="space-y-6 py-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Background Backdrop Blur</span>
                <span className="text-xs font-mono text-indigo-400">{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={blur}
                onChange={(e) => updateGlassSettings({ glass_blur: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-white/10 rounded-[6px]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Crystal Clear (0px)</span>
                <span>Balanced (16px)</span>
                <span>Deep Frost (32px)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Card Surface Opacity</span>
                <span className="text-xs font-mono text-indigo-400">{opacity}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                value={opacity}
                onChange={(e) => updateGlassSettings({ glass_opacity: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-white/10 rounded-[6px]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Translucent (30%)</span>
                <span>Frosted (80%)</span>
                <span>Solid (95%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Active background: <strong className="text-white truncate max-w-[200px] inline-block align-bottom">{currentBg.split('/').pop()}</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[8px] bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
