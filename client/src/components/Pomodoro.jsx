import { useState, useEffect, useRef } from 'react';

const MODES = [
  { label: 'Focus', seconds: 25 * 60 },
  { label: 'Short break', seconds: 5 * 60 },
  { label: 'Long break', seconds: 15 * 60 },
];

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function Pomodoro() {
  const [modeIdx, setModeIdx] = useState(0);
  const [seconds, setSeconds] = useState(MODES[0].seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSeconds(MODES[modeIdx].seconds);
    setRunning(false);
  }, [modeIdx]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(intervalRef.current); setRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = () => { setRunning(false); setSeconds(MODES[modeIdx].seconds); };
  const total = MODES[modeIdx].seconds;
  const progress = ((total - seconds) / total) * 100;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4"
      style={{ backgroundColor: '#0d2418' }}>

      {/* Top bar */}
      <div className="flex justify-between w-full flex-shrink-0">
        <div className="flex gap-2">
          <button className="w-7 h-7 rounded text-white text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: '#1a3028', border: '1px solid #2a4038' }}>✕</button>
          <button className="w-7 h-7 rounded text-white text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: '#1a3028', border: '1px solid #2a4038' }}>−</button>
        </div>
        {/* Mode selector */}
        <div className="flex gap-1">
          {MODES.map((m, i) => (
            <button key={i} onClick={() => setModeIdx(i)}
              className="text-xs px-2 py-1 rounded transition-colors"
              style={{
                backgroundColor: modeIdx === i ? '#2a5040' : 'transparent',
                color: modeIdx === i ? '#b0f060' : '#5a8070',
                border: 'none',
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timer display */}
      <div className="flex flex-col items-center gap-2">
        <div className="font-bold leading-none" style={{ fontSize: '52px', color: '#b0f060', letterSpacing: '2px' }}>
          {fmt(seconds)}
        </div>
        {/* Progress bar */}
        <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1a3028' }}>
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, backgroundColor: '#6abf30' }} />
        </div>
        <p className="text-xs" style={{ color: '#4a7060' }}>{MODES[modeIdx].label}</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button onClick={reset}
          className="text-xs px-4 py-1.5 rounded"
          style={{ backgroundColor: '#1a3028', border: '1px solid #2a4038', color: '#b0f060' }}>
          reset
        </button>
        <button onClick={() => setRunning(r => !r)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold transition-colors"
          style={{
            backgroundColor: running ? '#2a5040' : '#4a8040',
            color: '#b0f060',
            border: 'none',
          }}>
          {running ? '⏸' : '▶'}
        </button>
      </div>
    </div>
  );
}