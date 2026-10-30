import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import WidgetWrapper from './WidgetWrapper';
import Wallpaper from './Wallpaper';
import Todo from './Todo';
import Note from './Note';
import Music from './Music';
import Calendar from './Calendar';
import ScreenTime from './ScreenTime';
import Pomodoro from './Pomodoro';
import UpcomingReminders from './UpcomingReminders';
import {
  CheckSquare,
  Music as MusicIcon,
  FileText,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Clock,
  Timer,
  Bell,
  Plus,
  Minimize2,
  Sparkles,
  Layers,
} from 'lucide-react';

const WIDGET_DEFINITIONS = {
  wallpaper: {
    id: 'wallpaper',
    title: 'Hero Clock & Wallpaper',
    icon: ImageIcon,
    badgeText: 'Aesthetics',
    minimizedSummary: 'Live digital clock & custom background banner',
    component: Wallpaper,
  },
  todo: {
    id: 'todo',
    title: 'Today Task Checklist',
    icon: CheckSquare,
    badgeText: 'Productivity',
    minimizedSummary: 'Task checklist with progress meter & priority filters',
    component: Todo,
  },
  note: {
    id: 'note',
    title: 'Lined Sticky Note',
    icon: FileText,
    badgeText: 'Ideas',
    minimizedSummary: 'Lined paper scratchpad for quick notes & auto-sync',
    component: Note,
  },
  music: {
    id: 'music',
    title: 'Spotify & Music Player',
    icon: MusicIcon,
    badgeText: 'Media',
    minimizedSummary: 'Arctic Monkeys player with animated waveform & Spotify',
    component: Music,
  },
  calendar: {
    id: 'calendar',
    title: 'Monthly Calendar',
    icon: CalendarIcon,
    badgeText: 'Schedule',
    minimizedSummary: 'Monthly grid view with active day switcher',
    component: Calendar,
  },
  screentime: {
    id: 'screentime',
    title: 'Screen Time & Analytics',
    icon: Clock,
    badgeText: 'Metrics',
    minimizedSummary: 'Daily hours tracked with weekly breakdown chart',
    component: ScreenTime,
  },
  pomodoro: {
    id: 'pomodoro',
    title: 'Focus Pomodoro Timer',
    icon: Timer,
    badgeText: 'Deep Work',
    minimizedSummary: 'Interval countdown timer for deep focus sprints',
    component: Pomodoro,
  },
  reminders: {
    id: 'reminders',
    title: 'Upcoming Reminders',
    icon: Bell,
    badgeText: 'Alerts',
    minimizedSummary: 'Timely alerts and schedule deadline notifications',
    component: UpcomingReminders,
  },
};

const ALL_WIDGET_IDS = Object.keys(WIDGET_DEFINITIONS);

export default function Grid({ onOpenPlugins, onOpenTheme, onOpenAuth }) {
  const {
    preferences,
    unloadWidget,
    addWidget,
    reorderWidgets,
    bentoSpans,
    BENTO_CONSTRAINTS,
    updateBentoSpan,
    minimizedWidgets,
    toggleMinimizeWidget,
    maximizedWidget,
    toggleMaximizeWidget,
  } = useAuth();

  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const activeWidgets = preferences?.active_widgets || ALL_WIDGET_IDS;
  const unloadedWidgets = ALL_WIDGET_IDS.filter((id) => !activeWidgets.includes(id));

  // Drag and Drop Event Handlers
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = (e, id) => {
    if (dragOverId === id) {
      setDragOverId(null);
    }
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const currentOrder = [...activeWidgets];
    const fromIndex = currentOrder.indexOf(draggedId);
    const toIndex = currentOrder.indexOf(targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      currentOrder.splice(fromIndex, 1);
      currentOrder.splice(toIndex, 0, draggedId);
      reorderWidgets(currentOrder);
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // If a widget is maximized in Full Focus Mode, render it in expansive view
  if (maximizedWidget && WIDGET_DEFINITIONS[maximizedWidget]) {
    const maxDef = WIDGET_DEFINITIONS[maximizedWidget];
    const ComponentToRender = maxDef.component;

    return (
      <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center animate-fadeIn z-40">
        <div className="w-full h-full max-w-5xl rounded-[10px] overflow-hidden shadow-2xl flex flex-col border border-white/20 backdrop-blur-2xl bg-black/85">
          {/* Maximized Header with Restore button */}
          <div className="w-full px-5 py-3 bg-black/60 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-[6px] bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <maxDef.icon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">{maxDef.title}</h2>
                <p className="text-[10px] text-purple-300/80">Focused Bento View</p>
              </div>
            </div>

            <button
              onClick={() => toggleMaximizeWidget(maxDef.id)}
              className="px-3.5 py-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Restore to Bento Grid
            </button>
          </div>

          {/* Maximized Component Body with Generous Padding */}
          <div className="flex-1 min-h-0 w-full overflow-y-auto">
            <ComponentToRender />
          </div>
        </div>
      </div>
    );
  }

  // Empty state if all widgets unloaded
  if (activeWidgets.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
        <div className="max-w-md p-8 rounded-[10px] backdrop-blur-2xl bg-black/50 border border-white/10 shadow-2xl flex flex-col items-center">
          <div className="w-14 h-14 rounded-[10px] bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-2xl mb-4 shadow-lg shadow-indigo-500/20">
            📦
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Bento Workspace is Clear</h3>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            All mini-apps are currently unloaded. Click below to load To-Do, Spotify, Notes, Calendar, Pomodoro, and more into your Bento grid.
          </p>
          <button
            onClick={onOpenPlugins}
            className="px-5 py-2.5 rounded-[8px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Open Mini-App Plugin Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none">
      {/* 
        Quick Add Ribbon for Unloaded Apps (shows whenever any app is removed)
      */}
      {unloadedWidgets.length > 0 && (
        <div className="px-4 pt-2.5 pb-1 flex items-center gap-2 overflow-x-auto flex-shrink-0 z-10 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 flex-shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Add back:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {unloadedWidgets.map((uId) => {
              const uDef = WIDGET_DEFINITIONS[uId];
              if (!uDef) return null;
              return (
                <button
                  key={uId}
                  onClick={() => addWidget(uId)}
                  className="px-2.5 py-1 rounded-[8px] bg-white/10 hover:bg-emerald-600/80 text-white text-[11px] font-medium border border-white/10 hover:border-emerald-500 flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 shadow-sm"
                  title={`Add ${uDef.title} back to Bento grid`}
                >
                  <Plus className="w-3 h-3 text-emerald-300" />
                  <span>{uDef.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 
        TRUE BENTO GRID SYSTEM:
        - Desktop: 6 columns
        - Tablet: 4 columns
        - Mobile: 2 columns
        - Tight gap: 10px (gap-2.5)
        - Dynamic auto-flow: dense (automatically re-packs whenever a plugin is removed or resized)
        - Interactive corner resize cursor (se-resize)
        - Strict borders: rounded-[10px]
      */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5"
          style={{
            gridAutoFlow: 'dense',
            gridAutoRows: '125px',
          }}
        >
          {activeWidgets.map((widgetId) => {
            const def = WIDGET_DEFINITIONS[widgetId];
            if (!def) return null;

            const isMin = minimizedWidgets.includes(widgetId);
            const span = bentoSpans?.[widgetId] || { cols: 2, rows: 2 };
            const constraints = BENTO_CONSTRAINTS?.[widgetId] || { minCols: 2, maxCols: 3, minRows: 2, maxRows: 3 };

            const effectiveCols = span.cols || 2;
            const effectiveRows = isMin ? 1 : (span.rows || 2);

            const Component = def.component;

            return (
              <div
                key={widgetId}
                style={{
                  gridColumn: `span ${effectiveCols}`,
                  gridRow: `span ${effectiveRows}`,
                }}
                className="transition-all duration-200"
              >
                <WidgetWrapper
                  id={widgetId}
                  title={def.title}
                  icon={def.icon}
                  badgeText={def.badgeText}
                  cols={effectiveCols}
                  rows={span.rows || 2}
                  minCols={constraints.minCols}
                  maxCols={constraints.maxCols}
                  minRows={constraints.minRows}
                  maxRows={constraints.maxRows}
                  onResizeSpan={(c, r) => updateBentoSpan(widgetId, c, r)}
                  isMinimized={isMin}
                  onToggleMinimize={() => toggleMinimizeWidget(widgetId)}
                  isMaximized={maximizedWidget === widgetId}
                  onToggleMaximize={() => toggleMaximizeWidget(widgetId)}
                  onRemove={() => unloadWidget(widgetId)}
                  isDragging={draggedId === widgetId}
                  isDropTarget={dragOverId === widgetId}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  minimizedSummary={def.minimizedSummary}
                >
                  <Component />
                </WidgetWrapper>
              </div>
            );
          })}

          {/* Inline Bento Slot to Add More Mini-Apps */}
          <div
            onClick={onOpenPlugins}
            style={{
              gridColumn: 'span 2',
              gridRow: 'span 2',
            }}
            className="rounded-[10px] border border-dashed border-white/20 hover:border-emerald-400/80 bg-black/25 hover:bg-emerald-500/10 flex flex-col items-center justify-center p-5 text-slate-400 hover:text-white transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-8 h-8 rounded-[8px] bg-white/5 group-hover:bg-emerald-500/20 text-slate-300 group-hover:text-emerald-300 flex items-center justify-center transition-all mb-2 group-hover:scale-110 shadow-sm">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold tracking-wide text-slate-300 group-hover:text-white">
              + Add Mini-App
            </span>
            <span className="text-[10px] text-slate-500 group-hover:text-emerald-300/80 mt-0.5">
              Open Bento Plugin Catalog
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}