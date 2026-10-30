import React, { useState } from 'react';
import { Clock, TrendingDown } from 'lucide-react';

export default function ScreenTime() {
  const [hours, setHours] = useState(2);
  const [minutes, setMinutes] = useState(15);

  const WEEK_DAYS = [
    { day: 'M', hrs: 4.2 },
    { day: 'T', hrs: 3.5 },
    { day: 'W', hrs: 5.1 },
    { day: 'T', hrs: 2.2 },
    { day: 'F', hrs: 2.25 }, // Today
    { day: 'S', hrs: 1.0 },
    { day: 'S', hrs: 0.8 },
  ];

  return (
    <div
      className="w-full h-full px-7 py-5 flex flex-col justify-between items-center select-none relative"
      style={{ backgroundColor: '#212121' }}
    >
      <div className="w-full flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-400">
          DAILY SCREEN TIME
        </span>
        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-[6px] border border-emerald-800/40">
          <TrendingDown className="w-3 h-3" /> -18% vs avg
        </span>
      </div>

      {/* Hero numbers with generous spacing */}
      <div className="flex items-baseline justify-center gap-2 my-auto py-2">
        <span
          className="text-6xl font-black tracking-tight"
          style={{ color: '#f87171', fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          {hours}
        </span>
        <span className="text-3xl font-bold text-white tracking-tight">
          hrs
        </span>
        <span
          className="text-4xl font-extrabold ml-1"
          style={{ color: '#fca5a5', fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          {minutes}
        </span>
        <span className="text-xl font-bold text-slate-300">
          m
        </span>
      </div>

      {/* Mini weekly activity chart */}
      <div className="w-full pt-2 border-t border-white/5">
        <div className="flex items-end justify-between gap-1.5 h-10 px-1">
          {WEEK_DAYS.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-[4px] transition-all ${
                  d.day === 'F' ? 'bg-red-400 shadow-sm' : 'bg-white/15'
                }`}
                style={{ height: `${(d.hrs / 6) * 100}%` }}
              />
              <span className="text-[9px] text-slate-500 font-semibold">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
