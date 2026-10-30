import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cloud, Upload, Sparkles } from 'lucide-react';

export default function Wallpaper() {
  const { preferences, uploadCustomBackground } = useAuth();
  const [time, setTime] = useState(new Date());
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = time.toLocaleDateString('en-US', { month: 'long' });
  const dayNum = time.getDate();
  const dateFormatted = `${dayName}, ${monthName} ${dayNum}`;

  const currentWallpaper = preferences?.background_url || '/HEROSCREEN-2025021222.webp';

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadCustomBackground(file);
    } catch (err) {
      console.error('Wallpaper upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="w-full h-full relative flex flex-col justify-between px-8 py-6 select-none transition-all group overflow-hidden"
      style={{
        backgroundImage: `url(${currentWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Subtle Dark Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35 pointer-events-none" />

      {/* Top Banner Action */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-black/40 px-3 py-1 rounded-[6px] border border-white/10 backdrop-blur-md">
          Personal Clock
        </span>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-xs px-3.5 py-1.5 rounded-[8px] transition-all hover:bg-black/70 active:scale-95 flex items-center gap-2 cursor-pointer text-white shadow-lg"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Cloud className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isUploading ? 'Uploading to S3...' : 'Change Image'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Clock & Date Display */}
      <div className="relative z-10 flex flex-col items-end pr-2 py-4">
        <div
          className="font-black text-white leading-none tracking-tight drop-shadow-2xl"
          style={{
            fontSize: '4.2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textShadow: '0 4px 28px rgba(0, 0, 0, 0.9)',
          }}
        >
          {hours}:{minutes}
        </div>
        <div
          className="mt-2 text-sm font-semibold tracking-wide text-white/95"
          style={{
            textShadow: '0 2px 14px rgba(0, 0, 0, 0.85)',
          }}
        >
          {dateFormatted}
        </div>
      </div>

      {/* Bottom Status footer */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-white/70 pt-2 border-t border-white/10">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Focus Dock Active
        </span>
        <span className="font-mono text-[10px] opacity-80">Amazon S3 Ready</span>
      </div>
    </div>
  );
}