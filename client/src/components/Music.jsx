import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music as MusicIcon, Volume2 } from 'lucide-react';

const SONGS = [
  { title: 'I Wanna Be Yours', artist: 'Arctic Monkeys', device: 'iPhone', duration: 184 },
  { title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', device: 'iPhone', duration: 272 },
  { title: '505', artist: 'Arctic Monkeys', device: 'iPhone', duration: 253 },
  { title: 'Starboy', artist: 'The Weeknd', device: 'MacBook', duration: 230 },
  { title: 'Nightcall', artist: 'Kavinsky', device: 'Studio', duration: 259 },
];

const SPOTIFY_PRESETS = [
  { name: 'Deep Focus', uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ' },
  { name: 'Lofi Beats', uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM' },
  { name: 'Peaceful Piano', uri: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO' },
];

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function Music() {
  const [mode, setMode] = useState('player'); // 'player' | 'spotify'
  const [songIdx, setSongIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(95);
  const [volume, setVolume] = useState(70);
  const [spotifyUrl, setSpotifyUrl] = useState(SPOTIFY_PRESETS[0].uri);
  const [customSpotifyInput, setCustomSpotifyInput] = useState('');
  const intervalRef = useRef(null);

  const song = SONGS[songIdx];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= song.duration) {
            setPlaying(false);
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, song.duration]);

  const prev = () => {
    setSongIdx((i) => (i - 1 + SONGS.length) % SONGS.length);
    setProgress(0);
  };

  const next = () => {
    setSongIdx((i) => (i + 1) % SONGS.length);
    setProgress(0);
  };

  const elapsed = formatTime(progress);
  const remaining = `-${formatTime(Math.max(0, song.duration - progress))}`;

  const waveHeights = [
    14, 22, 32, 46, 62, 48, 34, 22, 38, 56, 72, 58, 42, 26, 38, 54, 70, 52,
    36, 24, 42, 60, 66, 50, 34, 20, 28, 44, 56, 48, 30, 18, 28, 46, 62, 44,
    26, 16,
  ];

  const handleApplySpotify = (e) => {
    e.preventDefault();
    if (!customSpotifyInput.trim()) return;
    let url = customSpotifyInput.trim();
    if (url.includes('open.spotify.com') && !url.includes('/embed/')) {
      url = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
    }
    setSpotifyUrl(url);
    setCustomSpotifyInput('');
  };

  return (
    <div
      className="w-full h-full px-7 py-5 flex flex-col justify-between select-none relative overflow-hidden"
      style={{
        backgroundColor: '#1b1b1b',
      }}
    >
      {/* Top Mode Pill Bar */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center p-1 rounded-[8px] bg-black/40 border border-white/5">
          <button
            onClick={() => setMode('player')}
            className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition-all ${
              mode === 'player' ? 'bg-white/20 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Waveform Audio
          </button>
          <button
            onClick={() => setMode('spotify')}
            className={`px-3 py-1 text-xs font-semibold rounded-[6px] transition-all flex items-center gap-1.5 ${
              mode === 'spotify' ? 'bg-[#1DB954] text-black font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-black/60" />
            Spotify
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {mode === 'player' ? song.device : 'Online'}
        </span>
      </div>

      {mode === 'player' ? (
        <div className="flex-1 flex flex-col justify-between min-h-0">
          {/* Track Info Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-[8px] bg-white/5 border border-white/5">
            <div className="w-11 h-11 rounded-[8px] bg-gradient-to-tr from-purple-800 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/30 flex-shrink-0">
              <MusicIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-bold text-sm truncate">{song.title}</h3>
              <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
            </div>
          </div>

          {/* Animated Waveform Visualizer */}
          <div className="flex items-center justify-between gap-1.5 h-12 my-3 px-1">
            {waveHeights.map((h, i) => {
              const active = (i / waveHeights.length) * song.duration <= progress;
              return (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all duration-200"
                  style={{
                    height: playing ? `${Math.max(10, h * (0.6 + Math.random() * 0.5))}%` : `${h}%`,
                    backgroundColor: active ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
                  }}
                />
              );
            })}
          </div>

          {/* Time indicators */}
          <div className="flex justify-between text-xs text-slate-400 font-mono px-1 mb-2">
            <span>{elapsed}</span>
            <span>{remaining}</span>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-6 mt-1">
            <button
              onClick={prev}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-2"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPlaying(!playing)}
              className="w-11 h-11 rounded-full bg-white hover:bg-slate-200 text-black flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-lg shadow-white/10"
            >
              {playing ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
            </button>
            <button
              onClick={next}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-2"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* Spotify Mode */
        <div className="flex-1 flex flex-col justify-between min-h-0">
          <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
            {SPOTIFY_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setSpotifyUrl(preset.uri)}
                className={`text-xs px-3 py-1.5 rounded-[8px] flex-shrink-0 transition-colors ${
                  spotifyUrl === preset.uri
                    ? 'bg-[#1DB954] text-black font-bold'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-[110px] rounded-[8px] overflow-hidden bg-black/60 border border-white/10">
            <iframe
              src={spotifyUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="w-full h-full"
            />
          </div>

          <form onSubmit={handleApplySpotify} className="flex gap-2 mt-3">
            <input
              type="text"
              value={customSpotifyInput}
              onChange={(e) => setCustomSpotifyInput(e.target.value)}
              placeholder="Paste Spotify track/playlist URL..."
              className="flex-1 text-xs px-3.5 py-2 rounded-[8px] bg-white/5 border border-white/10 text-white outline-none focus:border-[#1DB954]"
            />
            <button
              type="submit"
              className="text-xs px-4 py-2 rounded-[8px] bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold"
            >
              Embed
            </button>
          </form>
        </div>
      )}
    </div>
  );
}