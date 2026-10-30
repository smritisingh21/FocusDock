import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import TopNav from './components/TopNav';
import Grid from './components/Grid';
import AuthModal from './components/AuthModal';
import ThemeModal from './components/ThemeModal';
import PluginStoreModal from './components/PluginStoreModal';
import './App.css';

function MainApp() {
  const { preferences, isAuthenticated } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [pluginModalOpen, setPluginModalOpen] = useState(false);

  // Background and Glassmorphism preferences
  const backgroundUrl = preferences?.background_url || '/HEROSCREEN-2025021222.webp';
  const blur = preferences?.glass_blur ?? 16;
  const opacity = preferences?.glass_opacity ?? 80;
  const themeName = preferences?.theme_name || 'glass-dark';

  // Dynamic theme gradient overlay based on current theme palette
  const getThemeOverlay = () => {
    switch (themeName) {
      case 'midnight-blue':
        return 'linear-gradient(135deg, rgba(10, 15, 30, 0.75), rgba(15, 23, 42, 0.85))';
      case 'cyber-violet':
        return 'linear-gradient(135deg, rgba(20, 10, 30, 0.75), rgba(26, 16, 37, 0.85))';
      case 'emerald-forest':
        return 'linear-gradient(135deg, rgba(8, 24, 16, 0.75), rgba(14, 31, 23, 0.85))';
      case 'sunset-amber':
        return 'linear-gradient(135deg, rgba(30, 16, 12, 0.75), rgba(36, 22, 18, 0.85))';
      case 'glass-dark':
      default:
        return 'linear-gradient(135deg, rgba(14, 14, 16, 0.72), rgba(20, 20, 24, 0.82))';
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden text-white font-sans flex flex-col select-none">
      {/* 
        Full Application Dynamic Background Image Layer 
        (Uses the uploaded Amazon S3 image or preset)
      */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
        }}
      />

      {/* 
        Frosted Glassmorphic Ambient Tint Overlay 
      */}
      <div
        className="fixed inset-0 z-0 transition-all duration-500 pointer-events-none"
        style={{
          background: getThemeOverlay(),
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          opacity: opacity / 100,
        }}
      />

      {/* Subtle Ambient Vignette */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.55) 100%)',
        }}
      />

      {/* Top Application Bar */}
      <TopNav
        onOpenPlugins={() => setPluginModalOpen(true)}
        onOpenTheme={() => setThemeModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Grid Workspace */}
      <main className="relative z-10 flex-1 min-h-0 w-full">
        <Grid
          onOpenPlugins={() => setPluginModalOpen(true)}
          onOpenTheme={() => setThemeModalOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <ThemeModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />

      <PluginStoreModal
        isOpen={pluginModalOpen}
        onClose={() => setPluginModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
