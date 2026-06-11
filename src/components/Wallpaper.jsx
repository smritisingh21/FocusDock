import React, { useState, useEffect, useRef } from 'react';

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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCustomWallpaper(ev.target?.result);
    reader.readAsDataURL(file);
  };

  const backgroundStyle = customWallpaper
    ? { backgroundImage: `url(${customWallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundImage: 'linear-gradient(160deg, #c0622a 0%, #7b3a1a 50%, #1a0a00 100%)' };

  return (
    <div className="w-full h-full relative flex overflow-hidden" style={backgroundStyle}>

      {/* Left nav strip */}
      <div
        className="flex flex-col justify-start pt-10 px-5 gap-5 z-10 flex-shrink-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.22)', minWidth: '120px' }}
      >
        <span className="text-white/80 text-xl mb-1 select-none">☰</span>
        {['Home', 'Settings', 'Check-list', 'Music', 'Calendar', 'Pomodoro'].map(item => (
          <a key={item} href="#"
            className="text-sm hover:text-white transition-colors"
            style={{ color: 'rgba(255,255,255,0.82)', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
          >
            {item}
          </a>
        ))}
      </div>

      {/* Right: button + clock */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-end p-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1 rounded-md hover:bg-black/40 transition-all"
            style={{
              color: 'rgba(255,255,255,0.75)',
              backgroundColor: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            change picture
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </div>

        <div className="flex flex-col items-center mt-4 px-4">
          <div className="font-bold text-white leading-none"
            style={{ fontSize: '56px', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
          >
            {hours}:{minutes}
          </div>
          <div className="mt-2 text-sm font-medium"
            style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
          >
            {dayName}
          </div>
        </div>
      </div>
    </div>
  );
}