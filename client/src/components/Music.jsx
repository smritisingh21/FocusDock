import { useState, useEffect, useRef } from 'react';

const SONGS = [
  { title: 'I Wanna Be Yours', artist: 'Arctic Monkeys', device: 'iPhone', duration: 184 },
  { title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', device: 'iPhone', duration: 272 },
  { title: 'R U Mine?', artist: 'Arctic Monkeys', device: 'iPhone', duration: 200 },
];

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function Music() {
  const [songIdx, setSongIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(95);
  const [volume, setVolume] = useState(65);
  const intervalRef = useRef(null);
  const song = SONGS[songIdx];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= song.duration) { setPlaying(false); return 0; }
          return p + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, song.duration]);

  const prev = () => { setSongIdx(i => (i - 1 + SONGS.length) % SONGS.length); setProgress(0); };
  const next = () => { setSongIdx(i => (i + 1) % SONGS.length); setProgress(0); };
  const elapsed = formatTime(progress);
  const remaining = `-${formatTime(song.duration - progress)}`;

  // Waveform bars
  const waveHeights = [20,35,55,70,80,65,50,40,60,75,85,70,55,45,65,80,90,75,60,50,40,55,70,80,65,50,35,25,40,55,70,60,45,35,50,65,75,60,45,30];

  return (
    <div className="w-full h-full flex flex-col p-4 gap-3" style={{ backgroundColor: '#181818' }}>
      {/* Waveform */}
      <div className="flex items-center gap-0.5 h-14 px-1 flex-shrink-0">
        {waveHeights.map((h, i) => (
          <div key={i} className="flex-1 rounded-sm"
            style={{
              height: `${h}px`,
              backgroundColor: playing && i < (progress / song.duration) * waveHeights.length
                ? '#7abf3a' : '#ffffff',
              opacity: 0.75,
            }}
          />
        ))}
      </div>

      {/* Song info */}
      <div className="flex-shrink-0">
        <p className="text-xs mb-0.5" style={{ color: '#666' }}>{song.device}</p>
        <p className="text-sm font-semibold text-white">{song.title}</p>
        <p className="text-xs" style={{ color: '#888' }}>{song.artist}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 text-xs flex-shrink-0" style={{ color: '#666' }}>
        <span>{elapsed}</span>
        <input type="range" min="0" max={song.duration} value={progress}
          onChange={e => setProgress(Number(e.target.value))}
          className="flex-1" style={{ accentColor: '#7abf3a', height: '3px' }} />
        <span>{remaining}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 flex-shrink-0">
        <button onClick={prev} className="text-lg text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer">⏮</button>
        <button onClick={() => setPlaying(p => !p)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-base transition-colors"
          style={{ border: '2px solid white', backgroundColor: 'transparent' }}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={next} className="text-lg text-white/70 hover:text-white transition-colors bg-transparent border-none cursor-pointer">⏭</button>
        <span className="text-lg cursor-pointer" style={{ color: '#555' }}>📻</span>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs" style={{ color: '#555' }}>🔈</span>
        <input type="range" min="0" max="100" value={volume}
          onChange={e => setVolume(Number(e.target.value))}
          className="flex-1" style={{ accentColor: '#7abf3a', height: '3px' }} />
        <span className="text-xs" style={{ color: '#555' }}>🔊</span>
      </div>
    </div>
  );
}