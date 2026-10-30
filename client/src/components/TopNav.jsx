import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, Palette, User, LogOut, Database, Zap, Cloud, Sparkles } from 'lucide-react';

export default function TopNav({ onOpenPlugins, onOpenTheme, onOpenAuth }) {
  const { user, isAuthenticated, logout, preferences, systemHealth } = useAuth();

  const activeCount = preferences?.active_widgets?.length || 0;

  return (
    <header className="w-full flex-shrink-0 z-30 px-5 py-2.5 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/35 select-none transition-all">
      {/* Left: Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[8px] bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white text-base font-black shadow-md shadow-indigo-500/25">
          ⚓️
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-white font-extrabold text-base tracking-tight">FocusDock</span>
          <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-[6px] border border-indigo-800/40">
            PRO
          </span>
        </div>

        {/* Cloud Status Indicators */}
        <div className="hidden lg:flex items-center gap-3 ml-4 pl-4 border-l border-white/10 text-[10px] text-slate-300">
          <span
            className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-[6px] border border-white/5"
            title="PostgreSQL Database Status"
          >
            <Database className="w-3 h-3 text-blue-400" />
            <span>PG: {systemHealth?.services?.database?.connected ? 'Online' : 'Resilient'}</span>
          </span>
          <span
            className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-[6px] border border-white/5"
            title="Redis Cache Status"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Redis: {systemHealth?.services?.cache?.connected ? 'Online' : 'Cached'}</span>
          </span>
          <span
            className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-[6px] border border-white/5"
            title="Amazon S3 Storage"
          >
            <Cloud className="w-3 h-3 text-cyan-400" />
            <span>S3: Ready</span>
          </span>
        </div>
      </div>

      {/* Center / Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Add Mini-App / Plugin Store Button */}
        <button
          onClick={onOpenPlugins}
          className="px-3.5 py-1.5 rounded-[8px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>+ Add Mini-App</span>
          <span className="bg-white/20 text-white px-1.5 py-0.2 rounded-[6px] text-[10px] font-bold">
            {activeCount}
          </span>
        </button>

        {/* Change Theme & Upload Background Button */}
        <button
          onClick={onOpenTheme}
          className="px-3 py-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          <span>Theme & Wallpaper</span>
        </button>
      </div>

      {/* Right: Auth Profile */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-[8px] border border-white/10 transition-colors">
              <span className="text-base">{user?.avatar_url || '👩‍💻'}</span>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  @{user?.username}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-[6px] bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 rounded-[8px] bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In / Sign Up</span>
          </button>
        )}
      </div>
    </header>
  );
}
