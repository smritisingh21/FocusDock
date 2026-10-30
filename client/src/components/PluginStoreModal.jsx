import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Music,
  FileText,
  Image,
  Calendar,
  Clock,
  Timer,
  Bell,
  Plus,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';

const PLUGIN_CATALOG = [
  {
    id: 'todo',
    name: 'Today Task Checklist',
    category: 'Productivity',
    description: 'Interactive daily tasks with completion percentage, priority tags, and quick-add actions.',
    icon: CheckSquare,
    badgeColor: 'from-amber-500 to-orange-500',
  },
  {
    id: 'music',
    name: 'Spotify & Music Player',
    category: 'Media & Focus',
    description: 'Listen to Arctic Monkeys or paste any Spotify playlist URI to focus with ambient beats.',
    icon: Music,
    badgeColor: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'note',
    name: 'Lined Sticky Note',
    category: 'Notes & Ideas',
    description: 'Realistic yellow lined paper for quick thoughts, brainstorms, and scratchpad notes.',
    icon: FileText,
    badgeColor: 'from-yellow-400 to-amber-500',
  },
  {
    id: 'wallpaper',
    name: 'Hero Clock & Banner',
    category: 'Time & Aesthetics',
    description: 'Displays large real-time clock, day/date, and quick workspace navigation.',
    icon: Image,
    badgeColor: 'from-blue-500 to-indigo-500',
  },
  {
    id: 'pomodoro',
    name: 'Focus Pomodoro Timer',
    category: 'Focus Techniques',
    description: 'Configurable countdown timer for deep work sprints and recovery intervals.',
    icon: Timer,
    badgeColor: 'from-rose-500 to-red-500',
  },
  {
    id: 'calendar',
    name: 'Monthly Mini Calendar',
    category: 'Scheduling',
    description: 'Interactive monthly grid showing current dates, week days, and calendar markers.',
    icon: Calendar,
    badgeColor: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'screentime',
    name: 'Screen Time Tracker',
    category: 'Analytics',
    description: 'Monitor daily screen hours and maintain focus discipline throughout your work sessions.',
    icon: Clock,
    badgeColor: 'from-violet-500 to-purple-500',
  },
  {
    id: 'reminders',
    name: 'Upcoming Reminders',
    category: 'Notifications',
    description: 'Timely reminders list with custom time stamps and alert tags for priority deadlines.',
    icon: Bell,
    badgeColor: 'from-pink-500 to-rose-500',
  },
];

export default function PluginStoreModal({ isOpen, onClose }) {
  const { preferences, toggleWidget } = useAuth();
  const [filter, setFilter] = useState('all'); // 'all' | 'loaded' | 'unloaded'

  if (!isOpen) return null;

  const activeWidgets = preferences?.active_widgets || [];

  const filteredPlugins = PLUGIN_CATALOG.filter((plugin) => {
    const isLoaded = activeWidgets.includes(plugin.id);
    if (filter === 'loaded') return isLoaded;
    if (filter === 'unloaded') return !isLoaded;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-3xl rounded-[10px] p-7 text-white shadow-2xl relative overflow-hidden transition-all border border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(24, 24, 28, 0.95), rgba(16, 16, 20, 0.98))',
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(99, 102, 241, 0.2)',
        }}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-b-full blur-[2px]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Mini-App Plugin Store
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-[6px] border border-emerald-500/30">
                  {activeWidgets.length} / {PLUGIN_CATALOG.length} Loaded
                </span>
              </h2>
              <p className="text-xs text-slate-400">Load or unload modular widgets into your home dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[6px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-1.5 p-1 rounded-[8px] bg-black/40 border border-white/5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                filter === 'all' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Mini-Apps ({PLUGIN_CATALOG.length})
            </button>
            <button
              onClick={() => setFilter('loaded')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                filter === 'loaded' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Loaded ({activeWidgets.length})
            </button>
            <button
              onClick={() => setFilter('unloaded')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[6px] transition-all cursor-pointer ${
                filter === 'unloaded' ? 'bg-white/15 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unloaded ({PLUGIN_CATALOG.length - activeWidgets.length})
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Click any button to dynamically mount or unmount
          </div>
        </div>

        {/* Plugin Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[420px] overflow-y-auto pr-1">
          {filteredPlugins.map((plugin) => {
            const IconComponent = plugin.icon;
            const isLoaded = activeWidgets.includes(plugin.id);

            return (
              <div
                key={plugin.id}
                className={`p-4 rounded-[8px] border transition-all flex flex-col justify-between ${
                  isLoaded
                    ? 'border-emerald-500/40 bg-emerald-500/5 shadow-md'
                    : 'border-white/10 bg-white/5 opacity-85 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-[8px] bg-gradient-to-br ${plugin.badgeColor} flex items-center justify-center text-white shadow-md flex-shrink-0`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{plugin.name}</h4>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {plugin.category}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[6px] border ${
                        isLoaded
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {isLoaded ? 'Loaded' : 'Unloaded'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300/80 leading-relaxed line-clamp-2">
                    {plugin.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isLoaded ? 'Active on dashboard' : 'Hidden from workspace'}
                  </span>
                  <button
                    onClick={() => toggleWidget(plugin.id)}
                    className={`px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isLoaded
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                    }`}
                  >
                    {isLoaded ? (
                      <>
                        <Trash2 className="w-3.5 h-3.5" /> Unload Plugin
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Load Plugin
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Changes are cached in Redis and synced to PostgreSQL automatically</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[8px] bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
          >
            Close Store
          </button>
        </div>
      </div>
    </div>
  );
}
