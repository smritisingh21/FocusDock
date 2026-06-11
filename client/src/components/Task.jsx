import React from 'react';

export default function Task({ task, onToggle, onChange, onDelete }) {
  return (
    <div className="p-2 flex items-center gap-2 rounded-lg transition-colors" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
      <div 
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
        onClick={onToggle}
        style={{ borderColor: task.completed ? '#4ade80' : '#888', color: task.completed ? '#4ade80' : 'transparent' }}
      >
        {task.completed && '✓'}
      </div>
      <input
        type="text"
        value={task.text}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-gray-200 font-normal placeholder-gray-500 text-sm"
        placeholder="Enter task..."
      />
      <button
        onClick={onDelete}
        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 text-lg"
      >
        ×
      </button>
    </div>
  );
}