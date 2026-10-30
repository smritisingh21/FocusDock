import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const NOTE_COLORS = [
  { id: 'yellow', bg: '#fef08a', text: '#3a382c', line: 'rgba(0, 0, 0, 0.08)' },
  { id: 'mint', bg: '#bbf7d0', text: '#14532d', line: 'rgba(20, 83, 45, 0.09)' },
  { id: 'pink', bg: '#fbcfe8', text: '#831843', line: 'rgba(131, 24, 67, 0.09)' },
  { id: 'slate', bg: '#334155', text: '#f8fafc', line: 'rgba(255, 255, 255, 0.09)' },
];

export default function Note() {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState(() => {
    return localStorage.getItem('focusdock_notes') || '';
  });
  const [colorId, setColorId] = useState('yellow');
  const [syncStatus, setSyncStatus] = useState('saved');
  const syncTimerRef = useRef(null);

  const currentColor = NOTE_COLORS.find((c) => c.id === colorId) || NOTE_COLORS[0];

  useEffect(() => {
    if (isAuthenticated) {
      api.getNotes().then((res) => {
        if (res?.note?.content !== undefined) {
          setText(res.note.content);
          if (res.note.color) setColorId(res.note.color);
        }
      }).catch((e) => console.warn('Note fetch error:', e));
    }
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    setSyncStatus('typing...');
    localStorage.setItem('focusdock_notes', val);

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      if (isAuthenticated) {
        try {
          await api.updateNotes(val, colorId);
          setSyncStatus('synced');
        } catch (err) {
          setSyncStatus('saved offline');
        }
      } else {
        setSyncStatus('saved local');
      }
    }, 800);
  };

  const handleColorChange = async (newColorId) => {
    setColorId(newColorId);
    if (isAuthenticated) {
      try {
        await api.updateNotes(text, newColorId);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden select-none transition-all flex flex-col"
      style={{ backgroundColor: currentColor.bg }}
    >
      {/* Lined paper texture lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(transparent, transparent 27px, ${currentColor.line} 27px, ${currentColor.line} 28px)`,
          backgroundPosition: '0 32px',
        }}
      />

      {/* Note toolbar with Color Swatches & sync indicator */}
      <div className="relative z-10 flex items-center justify-between px-7 py-3 border-b border-black/5">
        <div className="flex items-center gap-2.5">
          {NOTE_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => handleColorChange(c.id)}
              className={`w-4 h-4 rounded-[4px] border border-black/20 transition-all ${
                colorId === c.id ? 'scale-125 ring-2 ring-black/40 shadow-sm' : 'hover:scale-110 opacity-80'
              }`}
              style={{ backgroundColor: c.bg }}
              title={`${c.id} paper`}
            />
          ))}
        </div>

        <span className="text-[10px] font-mono tracking-wider opacity-75 font-semibold" style={{ color: currentColor.text }}>
          {syncStatus}
        </span>
      </div>

      {/* Generous Padding for Writing */}
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Type quick thoughts, brainstorms, meeting notes..."
        className="w-full flex-1 relative z-10 bg-transparent border-none outline-none resize-none px-7 py-5 text-[15px] leading-[28px]"
        style={{
          color: currentColor.text,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 500,
          caretColor: currentColor.text,
        }}
      />
    </div>
  );
}