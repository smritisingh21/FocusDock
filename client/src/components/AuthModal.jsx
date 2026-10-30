import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { Lock, User, Mail, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, signup } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form states
  const [username, setUsername] = useState('user1');
  const [password, setPassword] = useState('1234');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatar, setAvatar] = useState('👩‍💻');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleQuickDemoFill = () => {
    setUsername('user1');
    setPassword('1234');
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      setSuccess('Welcome back!');
      setTimeout(() => {
        onClose?.();
      }, 500);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    setLoading(true);
    try {
      await signup({
        username,
        password,
        email: email || `${username}@focusdock.app`,
        fullName: fullName || username,
        avatar,
      });

      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

      setSuccess('Account created successfully!');
      setTimeout(() => {
        onClose?.();
      }, 800);
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const AVATARS = ['👩‍💻', '⚡️', '🚀', '🎧', '🎨', '🌿', '☕️', '🌟'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Container */}
      <div
        className="w-full max-w-md rounded-[10px] p-7 text-white shadow-2xl relative overflow-hidden transition-all border border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(28, 28, 32, 0.95), rgba(18, 18, 22, 0.98))',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
        }}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-b-full blur-[2px]" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[8px] bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-xl font-bold">
              ⚓️
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                FocusDock <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-[6px] text-indigo-300 font-semibold border border-white/5">v2.0</span>
              </h2>
              <p className="text-xs text-slate-400">Personal Modular Workspace</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[6px] bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm"
              title="Close modal"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-[8px] bg-black/40 border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setError('');
              setSuccess('');
            }}
            className={`py-2 text-xs font-semibold rounded-[6px] transition-all duration-200 ${
              isLoginTab
                ? 'bg-white/15 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setError('');
              setSuccess('');
            }}
            className={`py-2 text-xs font-semibold rounded-[6px] transition-all duration-200 ${
              !isLoginTab
                ? 'bg-white/15 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Fill Pill (Requirement 2: keep user = user1 and pwd = 1234) */}
        {isLoginTab && (
          <div className="mb-4 p-3 rounded-[8px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 text-sm">💡</span>
              <div className="text-[11px] text-slate-300 leading-tight">
                <span className="font-semibold text-indigo-300">Preset Demo Login:</span>
                <div>user: <code className="bg-white/10 px-1 py-0.5 rounded text-white">user1</code> | pwd: <code className="bg-white/10 px-1 py-0.5 rounded text-white">1234</code></div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-[6px] transition-colors flex-shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
            >
              Quick Fill ⚡️
            </button>
          </div>
        )}

        {/* Feedback Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-[8px] bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-shake">
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-[8px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {success}
          </div>
        )}

        {/* Forms */}
        {isLoginTab ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. user1"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-[8px] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-[8px] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-[8px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Workspace <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-white/5 border border-white/10 rounded-[8px] px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 uppercase tracking-wider">
                  Username *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="choose username"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-[8px] px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-[8px] px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1 uppercase tracking-wider">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="at least 4 characters"
                required
                className="w-full bg-white/5 border border-white/10 rounded-[8px] px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Choose Avatar
              </label>
              <div className="flex items-center gap-1.5">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`w-9 h-9 rounded-[8px] flex items-center justify-center text-lg transition-all cursor-pointer ${
                      avatar === emoji
                        ? 'bg-indigo-600 scale-110 shadow-md ring-2 ring-indigo-400'
                        : 'bg-white/5 hover:bg-white/10 text-white/80'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-[8px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" /> Create Account & Launch Dock
                </>
              )}
            </button>
          </form>
        )}

        {/* Cloud Architecture Badge */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" /> PostgreSQL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Redis Cache
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Amazon S3
          </span>
        </div>
      </div>
    </div>
  );
}
