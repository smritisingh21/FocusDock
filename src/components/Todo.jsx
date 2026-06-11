import { useState } from 'react';

export default function Todo() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'learn javascript', done: true },
    { id: 2, text: 'build ui for the productivity app', done: false, active: true },
    { id: 3, text: 'build ui for the productivity app', done: false },
    { id: 4, text: 'build ui for the productivity app', done: false },
  ]);
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const completed = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input.trim(), done: false }]);
    setInput('');
    setShowInput(false);
  };

  const toggleTask = (id) =>
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done, active: false } : t));

  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));
  const clearAll = () => setTasks([]);

  return (
    <div className="w-full h-full flex flex-col p-4" style={{ backgroundColor: '#2a1f1a' }}>

      {/* Control buttons */}
      <div className="flex gap-2 mb-3 flex-shrink-0">
        <button className="w-7 h-7 rounded text-white text-xs font-bold flex items-center justify-center"
          style={{ backgroundColor: '#3a2a22', border: '1px solid #5a4a42' }}>✕</button>
        <button className="w-7 h-7 rounded text-white text-xs font-bold flex items-center justify-center"
          style={{ backgroundColor: '#3a2a22', border: '1px solid #5a4a42' }}>−</button>
      </div>

      <div className="flex gap-3 flex-1 min-h-0">

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <h2 className="text-white text-2xl font-bold text-center mb-4 flex-shrink-0">Today</h2>

          {/* Add/Clear */}
          <div className="flex gap-2 mb-3 flex-shrink-0">
            <button onClick={() => setShowInput(v => !v)}
              className="text-xs px-3 py-1.5 rounded text-white/75 hover:text-white transition-colors"
              style={{ border: '1px solid #5a4a42', backgroundColor: 'transparent' }}>
              + Add new task
            </button>
            <button onClick={clearAll}
              className="text-xs px-3 py-1.5 rounded text-white/75 hover:text-white transition-colors"
              style={{ border: '1px solid #5a4a42', backgroundColor: 'transparent' }}>
              Clear all
            </button>
          </div>

          {showInput && (
            <div className="flex gap-2 mb-3 flex-shrink-0">
              <input autoFocus value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="Type and press Enter…"
                className="flex-1 text-xs px-3 py-1.5 rounded text-white outline-none"
                style={{ backgroundColor: '#3a2a22', border: '1px solid #5a4a42' }} />
              <button onClick={addTask}
                className="text-xs px-3 py-1.5 rounded text-white"
                style={{ backgroundColor: '#5a7a30' }}>Add</button>
            </div>
          )}

          {/* Tasks */}
          <div className="flex flex-col gap-2 overflow-y-auto flex-1">
            {tasks.map(task => {
              const isDone = task.done;
              const isActive = task.active && !task.done;
              return (
                <div key={task.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: isDone ? '#5a7a30' : isActive ? '#2a2a3a' : 'transparent',
                    border: isActive ? '1.5px solid #5a5aaa' : '1px solid transparent',
                  }}>
                  <button onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isDone ? '#7abf3a' : '#e8a0a0', border: 'none' }}>
                    {isDone && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className="flex-1 text-sm font-semibold truncate"
                    style={{
                      color: isDone ? '#d0e8a0' : isActive ? '#fff' : '#c0b0a8',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}>
                    {task.text}
                  </span>
                  <button onClick={() => deleteTask(task.id)}
                    className="text-xs flex-shrink-0"
                    style={{ color: isDone ? '#a0c060' : '#8a7a72', opacity: 0.7 }}>
                    x
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress sidebar */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0" style={{ width: '36px' }}>
          {/* Track */}
          <div className="flex-1 w-full rounded-2xl relative overflow-hidden"
            style={{ backgroundColor: '#3a3040' }}>
            {/* Fill from bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 rounded-2xl"
              style={{
                height: `${progress}%`,
                backgroundColor: progress === 100 ? '#7abf3a' : '#6a7a30',
                transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
          {/* % label */}
          <span className="text-xs font-bold" style={{ color: '#a0b060' }}>{progress}%</span>
        </div>

      </div>
    </div>
  );
}