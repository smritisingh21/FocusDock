import React, { useState } from 'react'

export default function Music() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      {/* Waveform visualization */}
      <div className="flex items-end justify-center gap-1 h-16">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full transition-all"
            style={{
              height: isPlaying ? Math.random() * 100 + '%' : '20%',
              backgroundColor: '#6b8cff'
            }}
          />
        ))}
      </div>

      {/* Song Info */}
      <div className="text-center">
        <p className="text-xs text-gray-400">♪ Music</p>
        <p className="text-sm text-gray-200 font-semibold">I Wanna Be Yours</p>
        <p className="text-xs text-gray-500">Arctic Monkeys</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button className="text-xl text-gray-300 hover:text-white transition">⏮</button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-2xl text-gray-300 hover:text-white transition"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="text-xl text-gray-300 hover:text-white transition">⏭</button>
      </div>

      {/* Progress bar */}
      <div className="w-full px-2">
        <div className="bg-gray-600 rounded-full h-1">
          <div className="h-1 rounded-full" style={{ width: '30%', backgroundColor: '#6b8cff' }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1:25</span>
          <span>4:15</span>
        </div>
      </div>
    </div>
  )
}
