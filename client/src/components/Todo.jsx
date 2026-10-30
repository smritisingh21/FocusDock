import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, Trash2, Filter } from 'lucide-react';

export default function Todo() {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Design modular widget architecture', done: true, priority: 'high' },
    { id: 2, text: 'Configure PostgreSQL & Amazon S3 integration', done: true, priority: 'high' },
    { id: 3, text: 'Deploy FocusDock to AWS EC2 with Redis caching', done: false, priority: 'normal' },
    { id: 4, text: 'Build responsive drag and drop layout', done: true, priority: 'normal' },
  ]);
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  useEffect(() => {
    if (isAuthenticated) {
      api.getTodos().then((res) => {
        if (res?.todos && res.todos.length > 0) {
          setTasks(res.todos);
        }
      }).catch((e) => console.warn('Could not fetch todos:', e));
    }
  }, [isAuthenticated]);

  const completedCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const addTask = async () => {
    if (!input.trim()) return;
    const newTaskText = input.trim();
    setInput('');
    setShowInput(false);

    const tempId = Date.now();
    const newTask = { id: tempId, text: newTaskText, done: false, priority: 'normal' };
    setTasks((prev) => [...prev, newTask]);

    if (isAuthenticated) {
      try {
        const res = await api.createTodo(newTaskText);
        if (res?.todo) {
          setTasks((prev) => prev.map((t) => (t.id === tempId ? res.todo : t)));
        }
      } catch (err) {
        console.warn('Failed to sync todo to backend:', err);
      }
    }
  };

  const toggleTask = async (id) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const nextDone = !target.done;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: nextDone } : t))
    );

    if (isAuthenticated) {
      try {
        await api.toggleTodo(id, nextDone);
      } catch (err) {
        console.warn('Failed to sync toggle to backend:', err);
      }
    }
  };

  const deleteTask = async (e, id) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (isAuthenticated) {
      try {
        await api.deleteTodo(id);
      } catch (err) {
        console.warn('Failed to sync delete to backend:', err);
      }
    }
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.done));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  return (
    <div
      className="w-full h-full px-7 py-5 flex flex-col select-none relative overflow-hidden"
      style={{
        backgroundColor: '#241d1a',
      }}
    >
      {/* Top Action Row & Filter */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInput((v) => !v)}
            className="text-xs px-3.5 py-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 text-white font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>New Task</span>
          </button>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="text-xs px-2.5 py-1.5 rounded-[8px] bg-transparent hover:bg-white/5 text-[#a8988e] hover:text-white transition-colors cursor-pointer"
            >
              Clear Done
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-0.5 rounded-[8px] bg-black/40 border border-white/5 text-[10px]">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded-[6px] font-semibold capitalize transition-all ${
                filter === f ? 'bg-amber-600/50 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* New task input field */}
      {showInput && (
        <div className="flex gap-2 mb-3.5 flex-shrink-0 animate-fadeIn">
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTask();
              if (e.key === 'Escape') setShowInput(false);
            }}
            placeholder="What needs to get done today?"
            className="flex-1 text-xs px-3.5 py-2 rounded-[8px] text-white outline-none bg-black/40 border border-white/15 focus:border-amber-400/80 transition-all placeholder-slate-500"
          />
          <button
            onClick={addTask}
            className="text-xs px-4 py-2 rounded-[8px] text-white font-semibold hover:brightness-110 cursor-pointer bg-amber-700 shadow-md"
          >
            Add
          </button>
        </div>
      )}

      {/* Main card body with tasks list and vertical progress meter */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left Side: Tasks List */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col gap-2.5 overflow-y-auto pr-1.5 flex-1">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-xs text-[#a08e82] p-4">
                <p>No tasks in this view.</p>
                <button
                  onClick={() => setShowInput(true)}
                  className="mt-1.5 text-amber-400 hover:underline"
                >
                  + Add task
                </button>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isDone = task.done;

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-[8px] cursor-pointer transition-all group border"
                    style={{
                      backgroundColor: isDone ? 'rgba(99, 135, 60, 0.35)' : 'rgba(255, 255, 255, 0.04)',
                      borderColor: isDone ? 'rgba(99, 135, 60, 0.5)' : 'rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {/* Checkbox Squircle */}
                    <div
                      className="w-5 h-5 rounded-[6px] flex items-center justify-center text-xs transition-transform active:scale-90 flex-shrink-0"
                      style={{
                        border: isDone ? '1.5px solid #a3e635' : '1.5px solid #857467',
                        backgroundColor: isDone ? '#65a30d' : 'transparent',
                        color: '#ffffff',
                      }}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Task Text */}
                    <span
                      className="flex-1 text-xs leading-relaxed truncate transition-all pl-0.5"
                      style={{
                        color: isDone ? '#d9f99d' : '#f5f5f4',
                        textDecoration: isDone ? 'line-through' : 'none',
                        opacity: isDone ? 0.8 : 1,
                      }}
                    >
                      {task.text}
                    </span>

                    {/* Delete Icon */}
                    <button
                      onClick={(e) => deleteTask(e, task.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs p-1 rounded-[4px] text-slate-400 hover:text-red-400 hover:bg-white/10 transition-all"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Vertical Progress Meter */}
        <div className="w-12 flex flex-col items-center justify-between py-1 flex-shrink-0 border-l border-white/5 pl-2">
          <span className="text-[11px] font-bold text-amber-300">
            {progressPercent}%
          </span>

          <div
            className="w-3 flex-1 my-2.5 rounded-[6px] overflow-hidden flex flex-col-reverse p-0.5"
            style={{ backgroundColor: '#181210', border: '1px solid #362923' }}
          >
            <div
              className="w-full rounded-[4px] transition-all duration-500 ease-out"
              style={{
                height: `${progressPercent}%`,
                backgroundColor: '#84cc16',
                boxShadow: '0 0 10px rgba(132, 204, 22, 0.7)',
              }}
            />
          </div>

          <span className="text-[10px] text-[#8e7e72] font-mono">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>
    </div>
  );
}