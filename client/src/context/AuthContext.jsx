import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_WIDGETS = [
  'wallpaper',
  'todo',
  'music',
  'note',
  'calendar',
  'screentime',
  'pomodoro',
  'reminders'
];

export const BENTO_CONSTRAINTS = {
  todo: { minCols: 2, maxCols: 3, minRows: 2, maxRows: 3 },
  note: { minCols: 2, maxCols: 3, minRows: 2, maxRows: 5 },
  wallpaper: { minCols: 2, maxCols: 4, minRows: 2, maxRows: 3 },
  music: { minCols: 2, maxCols: 4, minRows: 2, maxRows: 4 },
  calendar: { minCols: 2, maxCols: 3, minRows: 2, maxRows: 3 },
  screentime: { minCols: 1, maxCols: 2, minRows: 1, maxRows: 2 },
  pomodoro: { minCols: 2, maxCols: 3, minRows: 2, maxRows: 3 },
  reminders: { minCols: 2, maxCols: 3, minRows: 2, maxRows: 4 },
};

export const DEFAULT_BENTO_SPANS = {
  wallpaper: { cols: 3, rows: 2 },
  todo: { cols: 3, rows: 3 },
  note: { cols: 2, rows: 3 },
  music: { cols: 3, rows: 2 },
  calendar: { cols: 2, rows: 2 },
  screentime: { cols: 2, rows: 2 },
  pomodoro: { cols: 2, rows: 2 },
  reminders: { cols: 2, rows: 2 },
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('focusdock_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('focusdock_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('focusdock_prefs');
    return saved ? JSON.parse(saved) : {
      theme_name: 'glass-dark',
      active_widgets: DEFAULT_WIDGETS,
      background_url: '/HEROSCREEN-2025021222.webp',
      glass_blur: 16,
      glass_opacity: 80,
    };
  });
  const [isLoading, setIsLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState(null);

  // Bento Grid layout dimensions state
  const [bentoSpans, setBentoSpans] = useState(() => {
    try {
      const saved = localStorage.getItem('focusdock_bento_spans');
      return saved ? JSON.parse(saved) : DEFAULT_BENTO_SPANS;
    } catch {
      return DEFAULT_BENTO_SPANS;
    }
  });

  // Widget layout states: sizes, minimized, maximized
  const [widgetSizes, setWidgetSizes] = useState(() => {
    try {
      const saved = localStorage.getItem('focusdock_widget_sizes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [minimizedWidgets, setMinimizedWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem('focusdock_minimized');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [maximizedWidget, setMaximizedWidget] = useState(null);

  // Initial session restoration & health check
  useEffect(() => {
    async function init() {
      // Fetch system health (Postgres, Redis, S3 status)
      try {
        const health = await api.getHealth();
        setSystemHealth(health);
      } catch (err) {
        console.warn('Backend offline or health unreachable:', err);
      }

      const storedToken = localStorage.getItem('focusdock_token');
      if (storedToken) {
        try {
          const data = await api.getMe();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('focusdock_user', JSON.stringify(data.user));
          }
          if (data.preferences) {
            setPreferences(data.preferences);
            localStorage.setItem('focusdock_prefs', JSON.stringify(data.preferences));
          }
        } catch (err) {
          console.warn('Session expired or server restarted:', err);
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  const login = async (username, password) => {
    const data = await api.login(username, password);
    setToken(data.token);
    setUser(data.user);
    if (data.preferences) {
      setPreferences(data.preferences);
      localStorage.setItem('focusdock_prefs', JSON.stringify(data.preferences));
    }
    localStorage.setItem('focusdock_token', data.token);
    localStorage.setItem('focusdock_user', JSON.stringify(data.user));
    return data;
  };

  const signup = async (userData) => {
    const data = await api.signup(userData);
    setToken(data.token);
    setUser(data.user);
    if (data.preferences) {
      setPreferences(data.preferences);
      localStorage.setItem('focusdock_prefs', JSON.stringify(data.preferences));
    }
    localStorage.setItem('focusdock_token', data.token);
    localStorage.setItem('focusdock_user', JSON.stringify(data.user));
    return data;
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('focusdock_token');
    localStorage.removeItem('focusdock_user');
  };

  // Toggle mini-app plugin (load / unload)
  const toggleWidget = async (widgetId) => {
    const currentWidgets = preferences.active_widgets || DEFAULT_WIDGETS;
    let newWidgets;

    if (currentWidgets.includes(widgetId)) {
      newWidgets = currentWidgets.filter((w) => w !== widgetId);
      // Automatically readjust layout when widget is removed
      readjustLayout(newWidgets);
    } else {
      newWidgets = [...currentWidgets, widgetId];
    }

    const updated = {
      ...preferences,
      active_widgets: newWidgets,
    };
    setPreferences(updated);
    localStorage.setItem('focusdock_prefs', JSON.stringify(updated));

    if (token) {
      try {
        await api.updatePreferences({ active_widgets: newWidgets });
      } catch (e) {
        console.warn('Failed to sync widget change to backend:', e);
      }
    }
  };

  // Explicitly unload a mini-app
  const unloadWidget = async (widgetId) => {
    const currentWidgets = preferences.active_widgets || DEFAULT_WIDGETS;
    const newWidgets = currentWidgets.filter((w) => w !== widgetId);

    // Auto-readjust layout so grid fills seamlessly without awkward gaps
    readjustLayout(newWidgets);

    const updated = {
      ...preferences,
      active_widgets: newWidgets,
    };
    setPreferences(updated);
    localStorage.setItem('focusdock_prefs', JSON.stringify(updated));

    if (token) {
      try {
        await api.updatePreferences({ active_widgets: newWidgets });
      } catch (e) {
        console.warn('Failed to sync widget unload to backend:', e);
      }
    }
  };

  // Change theme preset
  const changeTheme = async (themeName) => {
    const updated = { ...preferences, theme_name: themeName };
    setPreferences(updated);
    localStorage.setItem('focusdock_prefs', JSON.stringify(updated));

    if (token) {
      try {
        await api.updatePreferences({ theme_name: themeName });
      } catch (e) {
        console.warn('Failed to sync theme change:', e);
      }
    }
  };

  // Change custom background wallpaper (URL or upload)
  const setBackgroundUrl = async (url) => {
    const updated = { ...preferences, background_url: url };
    setPreferences(updated);
    localStorage.setItem('focusdock_prefs', JSON.stringify(updated));

    if (token) {
      try {
        await api.updatePreferences({ background_url: url });
      } catch (e) {
        console.warn('Failed to sync background URL change:', e);
      }
    }
  };

  // Upload image to Amazon S3
  const uploadCustomBackground = async (file) => {
    const data = await api.uploadBackground(file);
    if (data.backgroundUrl) {
      const updated = {
        ...preferences,
        background_url: data.backgroundUrl,
      };
      setPreferences(updated);
      localStorage.setItem('focusdock_prefs', JSON.stringify(updated));
    }
    return data;
  };

  // Update blur & opacity settings
  const updateGlassSettings = async (settings) => {
    const updated = { ...preferences, ...settings };
    setPreferences(updated);
    localStorage.setItem('focusdock_prefs', JSON.stringify(updated));

    if (token) {
      try {
        await api.updatePreferences(settings);
      } catch (e) {
        console.warn('Failed to sync glass settings:', e);
      }
    }
  };

  // Reorder widgets for drag and drop
  const reorderWidgets = async (newOrder) => {
    const updated = {
      ...preferences,
      active_widgets: newOrder,
    };
    setPreferences(updated);
    localStorage.setItem('focusdock_prefs', JSON.stringify(updated));

    if (token) {
      try {
        await api.updatePreferences({ active_widgets: newOrder });
      } catch (e) {
        console.warn('Failed to sync widget order to backend:', e);
      }
    }
  };

  // Add / Load a widget
  const addWidget = async (widgetId) => {
    const currentWidgets = preferences.active_widgets || DEFAULT_WIDGETS;
    if (currentWidgets.includes(widgetId)) return;
    const newWidgets = [...currentWidgets, widgetId];
    await reorderWidgets(newWidgets);
  };

  // Change widget size ('normal' = 1 col, 'wide' = 2 col)
  const setWidgetSize = (widgetId, size) => {
    setWidgetSizes((prev) => {
      const next = { ...prev, [widgetId]: size };
      localStorage.setItem('focusdock_widget_sizes', JSON.stringify(next));
      return next;
    });
  };

  const toggleWidgetSize = (widgetId) => {
    const current = widgetSizes[widgetId] || 'normal';
    const next = current === 'wide' ? 'normal' : 'wide';
    setWidgetSize(widgetId, next);
  };

  // Toggle minimize widget
  const toggleMinimizeWidget = (widgetId) => {
    setMinimizedWidgets((prev) => {
      const isMin = prev.includes(widgetId);
      const next = isMin ? prev.filter((id) => id !== widgetId) : [...prev, widgetId];
      localStorage.setItem('focusdock_minimized', JSON.stringify(next));
      return next;
    });
  };

  // Toggle maximize widget (focus mode)
  const toggleMaximizeWidget = (widgetId) => {
    setMaximizedWidget((curr) => (curr === widgetId ? null : widgetId));
  };

  // Update Bento span dimensions (cols, rows) with constraints clamping
  const updateBentoSpan = (widgetId, requestedCols, requestedRows) => {
    const limits = BENTO_CONSTRAINTS[widgetId] || { minCols: 2, maxCols: 3, minRows: 2, maxRows: 3 };
    const cols = Math.max(limits.minCols, Math.min(limits.maxCols, requestedCols));
    const rows = Math.max(limits.minRows, Math.min(limits.maxRows, requestedRows));

    setBentoSpans((prev) => {
      const next = {
        ...prev,
        [widgetId]: { cols, rows },
      };
      localStorage.setItem('focusdock_bento_spans', JSON.stringify(next));
      return next;
    });
  };

  // Auto-readjust remaining Bento layout when a plugin is removed
  const readjustLayout = (remainingWidgets) => {
    if (!remainingWidgets || remainingWidgets.length === 0) return;

    setBentoSpans((prev) => {
      const next = { ...prev };
      const count = remainingWidgets.length;

      if (count === 1) {
        // Single widget expands into a prominent centerpiece within its limits
        const id = remainingWidgets[0];
        const limits = BENTO_CONSTRAINTS[id];
        if (limits) {
          next[id] = {
            cols: Math.min(limits.maxCols, 4),
            rows: Math.min(limits.maxRows, 3),
          };
        }
      } else if (count === 2) {
        // Two widgets: balance as 3 + 3 to fill the 6-col grid row
        remainingWidgets.forEach((id) => {
          const limits = BENTO_CONSTRAINTS[id];
          if (limits) {
            next[id] = {
              cols: Math.max(limits.minCols, Math.min(limits.maxCols, 3)),
              rows: Math.max(limits.minRows, next[id]?.rows || 2),
            };
          }
        });
      } else if (count === 3) {
        // Three widgets: 2 + 2 + 2 = 6, perfectly filling a single row
        remainingWidgets.forEach((id) => {
          const limits = BENTO_CONSTRAINTS[id];
          if (limits) {
            next[id] = {
              cols: Math.max(limits.minCols, Math.min(limits.maxCols, 2)),
              rows: Math.max(limits.minRows, next[id]?.rows || 2),
            };
          }
        });
      } else if (count === 4) {
        // Four widgets: two rows of 3 + 3
        remainingWidgets.forEach((id) => {
          const limits = BENTO_CONSTRAINTS[id];
          if (limits) {
            next[id] = {
              cols: Math.max(limits.minCols, Math.min(limits.maxCols, 3)),
              rows: Math.max(limits.minRows, next[id]?.rows || 2),
            };
          }
        });
      } else if (count === 5) {
        // Five widgets: first 2 get 3 cols (3+3=6), next 3 get 2 cols (2+2+2=6)
        remainingWidgets.forEach((id, idx) => {
          const limits = BENTO_CONSTRAINTS[id];
          if (limits) {
            const idealCols = idx < 2 ? 3 : 2;
            next[id] = {
              cols: Math.max(limits.minCols, Math.min(limits.maxCols, idealCols)),
              rows: Math.max(limits.minRows, next[id]?.rows || 2),
            };
          }
        });
      } else {
        // 6 or more widgets: ensure all adhere to constraints
        remainingWidgets.forEach((id) => {
          const limits = BENTO_CONSTRAINTS[id];
          if (limits && next[id]) {
            next[id] = {
              cols: Math.max(limits.minCols, Math.min(limits.maxCols, next[id].cols)),
              rows: Math.max(limits.minRows, Math.min(limits.maxRows, next[id].rows)),
            };
          }
        });
      }

      localStorage.setItem('focusdock_bento_spans', JSON.stringify(next));
      return next;
    });
  };

  const value = {
    token,
    user,
    preferences,
    isLoading,
    systemHealth,
    isAuthenticated: Boolean(token && user),
    bentoSpans,
    BENTO_CONSTRAINTS,
    updateBentoSpan,
    readjustLayout,
    widgetSizes,
    minimizedWidgets,
    maximizedWidget,
    login,
    signup,
    logout,
    toggleWidget,
    unloadWidget,
    addWidget,
    reorderWidgets,
    setWidgetSize,
    toggleWidgetSize,
    toggleMinimizeWidget,
    toggleMaximizeWidget,
    changeTheme,
    setBackgroundUrl,
    uploadCustomBackground,
    updateGlassSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
