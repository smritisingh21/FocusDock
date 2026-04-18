import React, { useState, useEffect, useRef } from 'react'

export default function Wallpaper() {
  const [time, setTime] = useState(new Date());
  const [customWallpaper, setCustomWallpaper] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const dayName = time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCustomWallpaper(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const backgroundStyle = customWallpaper
    ? { backgroundImage: `url(${customWallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundImage: 'linear-gradient(160deg, #c0622a 0%, #7b3a1a 40%, #1a0a00 100%)' };

  return (
    <div
      className="w-full h-full relative rounded-3xl overflow-hidden flex"
      style={backgroundStyle}
    >
      {/* Left nav strip */}
      <div className="flex flex-col justify-start gap-5 pt-12 px-4 z-10 min-w-[110px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.18)' }}
      >
        <span className="text-white/90 text-2xl mb-2 cursor-pointer select-none">☰</span>
        {['Home', 'Settings', 'Check-list', 'Music', 'Calendar', 'Pomodoro'].map(item => (
          <a
            key={item}
            href="#"
            className="text-white/85 text-sm hover:text-white transition-colors"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
          >
            {item}
          </a>
        ))}
      </div>

      {/* Right side: change picture button + clock */}
      <div className="flex-1 relative flex flex-col">
        {/* Top-right: change picture */}
        <div className="flex justify-end p-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-white/75 text-xs px-3 py-1 rounded-md border hover:bg-black/40 hover:text-white transition-all"
            style={{
              backgroundColor: 'rgba(0,0,0,0.25)',
              borderColor: 'rgba(255,255,255,0.25)',
            }}
          >
            change picture
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Clock — top right area, below button */}
        <div className="flex flex-col items-center justify-start mt-4 px-4">
          <div
            className="text-6xl font-bold text-white font-mono leading-none"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
          >
            {hours}:{minutes}
          </div>
          <div
            className="text-sm text-white/85 mt-2 font-medium"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
          >
            {dayName}
          </div>
        </div>
      </div>
    </div>
  )
}