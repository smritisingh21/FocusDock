import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function Pomodoro() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [initialSeconds, setInitialSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = () => {
    setRunning(false);
    setSeconds(initialSeconds);
  };

  const toggleTimer = () => {
    if (seconds === 0) setSeconds(initialSeconds);
    setRunning((r) => !r);
  };

  const setPreset = (mins) => {
    setRunning(false);
    setInitialSeconds(mins * 60);
    setSeconds(mins * 60);
  };

  const fmt = (s) => {
    const mins = String(Math.floor(s / 60)).padStart(2, '0');
    const secs = String(s % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const progress = initialSeconds > 0 ? ((initialSeconds - seconds) / initialSeconds) * 100 : 0;

  return (
    <div
      className="w-full h-full px-7 py-5 flex flex-col justify-between items-center select-none relative"
      style={{ backgroundColor: '#1a2923' }}
    >
      {/* Quick Interval Preset Pills */}
      <div className="flex gap-2 p-1 rounded-[8px] bg-black/40 border border-white/5">
        {[
          { label: '5m Break', val: 5 },
          { label: '25m Focus', val: 25 },
          { label: '50m Deep', val: 50 },
        ].map((p) => (
          <button
            key={p.val}
            onClick={() => setPreset(p.val)}
            className={`text-xs px-3 py-1 rounded-[6px] font-semibold transition-all cursor-pointer ${
              initialSeconds === p.val * 60
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Countdown Display */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        <span
          className="text-6xl font-black text-white tracking-tight drop-shadow-lg font-mono"
          style={{ letterSpacing: '-0.03em' }}
        >
          {fmt(seconds)}
        </span>
        <span className="text-xs text-emerald-300/80 font-medium tracking-widest uppercase mt-2">
          {running ? 'Deep Focus Session' : 'Interval Paused'}
        </span>
      </div>

      {/* Bottom Controls */}
      <div className="w-full flex items-center justify-center gap-4 mt-2">
        <button
          onClick={reset}
          className="p-2.5 rounded-[8px] bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/5"
          title="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTimer}
          className="px-6 py-2.5 rounded-[8px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          {running ? (
            <>
              <Pause className="w-4 h-4 fill-white" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white ml-0.5" /> Start Focus
            </>
          )}
        </button>
      </div>
    </div>
  );
}