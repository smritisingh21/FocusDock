import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bell, Plus, Trash2 } from 'lucide-react';

export default function UpcomingReminders({ onSelectReminder }) {
  const { isAuthenticated } = useAuth();
  const [reminders, setReminders] = useState([
    { id: 1, reminder_time: '04:30', text: 'Morning workout & coffee' },
    { id: 2, reminder_time: '10:05', text: 'Focus block & system review' },
    { id: 3, reminder_time: '16:00', text: 'Review sprint deliverables' },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTime, setNewTime] = useState('');
  const [newText, setNewText] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      api.getReminders().then((res) => {
        if (res?.reminders && res.reminders.length > 0) {
          setReminders(res.reminders);
        }
      }).catch((e) => console.warn('Reminders fetch error:', e));
    }
  }, [isAuthenticated]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTime || !newText) return;

    const tempId = Date.now();
    const item = { id: tempId, reminder_time: newTime, text: newText.trim() };
    setReminders([...reminders, item]);
    setNewTime('');
    setNewText('');
    setIsAdding(false);

    if (isAuthenticated) {
      try {
        const res = await api.createReminder(newTime, item.text);
        if (res?.reminder) {
          setReminders((prev) => prev.map((r) => (r.id === tempId ? res.reminder : r)));
        }
      } catch (err) {
        console.warn('Sync reminder error:', err);
      }
    }
  };

  const removeReminder = async (id) => {
    setReminders(reminders.filter((r) => r.id !== id));
    if (isAuthenticated) {
      try {
        await api.deleteReminder(id);
      } catch (err) {
        console.warn('Delete reminder error:', err);
      }
    }
  };

  return (
    <div
      className="w-full h-full px-7 py-5 flex flex-col justify-between select-none relative overflow-hidden"
      style={{ backgroundColor: '#1d273a' }}
    >
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <span className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reminders Schedule</span>
        </span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs px-3 py-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1 cursor-pointer font-medium"
        >
          {isAdding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-3.5 flex-shrink-0 animate-fadeIn">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-[8px] bg-black/40 border border-white/15 text-white outline-none w-24"
            required
          />
          <input
            type="text"
            placeholder="Reminder text..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-[8px] bg-black/40 border border-white/15 text-white outline-none flex-1 placeholder-slate-500"
            required
          />
          <button
            type="submit"
            className="text-xs px-3.5 py-1.5 rounded-[8px] bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md cursor-pointer"
          >
            Add
          </button>
        </form>
      )}

      {/* Reminders List */}
      <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-1 min-h-0">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-xs text-slate-400 text-center py-4">
            <p>No upcoming reminders.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-1 text-cyan-400 hover:underline"
            >
              + Create reminder
            </button>
          </div>
        ) : (
          reminders.map((r) => (
            <div
              key={r.id}
              onClick={() => onSelectReminder && onSelectReminder(r)}
              className="flex items-center justify-between p-3.5 rounded-[8px] bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded-[6px] border border-cyan-800/40">
                  {r.reminder_time || r.time}
                </span>
                <span className="text-xs text-slate-200 truncate">{r.text}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeReminder(r.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-xs p-1 rounded-[4px] text-slate-400 hover:text-red-400 hover:bg-white/10 transition-all"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
