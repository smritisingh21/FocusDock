import { useState } from 'react';

export default function Note() {
  const [text, setText] = useState('');

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: '#e8e840' }}>
      {/* Lined paper effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.12) 27px, rgba(0,0,0,0.12) 28px)',
          backgroundPosition: '0 36px',
        }}
      />

      
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write your notes here…"
        className="w-full h-full relative z-10 bg-transparent border-none outline-none resize-none p-4 pt-5 text-sm leading-7"
        style={{
          color: '#333',
          fontFamily: 'Georgia, serif',
          caretColor: '#333',
        }}
      />
    </div>
  );
}