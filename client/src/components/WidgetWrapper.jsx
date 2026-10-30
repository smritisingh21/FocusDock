import React, { useState, useRef } from 'react';
import {
  GripVertical,
  Minus,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
} from 'lucide-react';

export default function WidgetWrapper({
  id,
  title,
  icon: Icon,
  badgeText,
  cols = 2,
  rows = 2,
  minCols = 2,
  maxCols = 3,
  minRows = 2,
  maxRows = 3,
  onResizeSpan,
  isMinimized = false,
  onToggleMinimize,
  isMaximized = false,
  onToggleMaximize,
  onRemove,
  isDragging = false,
  isDropTarget = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  minimizedSummary,
  children,
  className = '',
  style = {},
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizingSize, setResizingSize] = useState({ cols, rows });

  const dragStartPos = useRef({ x: 0, y: 0, cols, rows });

  // Handle Corner Bento Resize Drag
  const handleResizePointerDown = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }

    document.body.classList.add('is-resizing-bento');
    setIsResizing(true);
    setResizingSize({ cols, rows });
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      cols,
      rows,
    };
  };

  const handleResizePointerMove = (e) => {
    if (!isResizing) return;
    e.stopPropagation();

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    // Approximate grid cell step sizes: ~130px width per col, ~120px height per row
    const colStep = 110;
    const rowStep = 95;

    const colDelta = Math.round(dx / colStep);
    const rowDelta = Math.round(dy / rowStep);

    const targetCols = Math.max(minCols, Math.min(maxCols, dragStartPos.current.cols + colDelta));
    const targetRows = Math.max(minRows, Math.min(maxRows, dragStartPos.current.rows + rowDelta));

    setResizingSize({ cols: targetCols, rows: targetRows });

    if (onResizeSpan && (targetCols !== cols || targetRows !== rows)) {
      onResizeSpan(targetCols, targetRows);
    }
  };

  const handleResizePointerUp = (e) => {
    if (!isResizing) return;
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
    document.body.classList.remove('is-resizing-bento');
    setIsResizing(false);
  };

  const currentCols = isResizing ? resizingSize.cols : cols;
  const currentRows = isResizing ? resizingSize.rows : rows;

  return (
    <div
      id={`widget-${id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={(e) => onDragOver && onDragOver(e, id)}
      onDragLeave={(e) => onDragLeave && onDragLeave(e, id)}
      onDrop={(e) => onDrop && onDrop(e, id)}
      className={`relative rounded-[10px] transition-all duration-200 flex flex-col overflow-hidden select-none border border-white/10 ${
        isDropTarget ? 'ring-2 ring-indigo-400 scale-[1.01] shadow-2xl bg-indigo-500/10' : ''
      } ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'} ${
        isResizing ? 'ring-2 ring-indigo-500 shadow-2xl scale-[1.005]' : ''
      } ${isMinimized ? 'h-[54px] min-h-[54px]' : 'h-full min-h-0'} ${className}`}
      style={{
        boxShadow: isHovered
          ? '0 16px 36px -10px rgba(0, 0, 0, 0.75), 0 0 20px rgba(255, 255, 255, 0.05)'
          : '0 10px 25px -10px rgba(0, 0, 0, 0.65)',
        ...style,
      }}
    >
      {/* 
        Window Control Header Bar (Strictly rounded-[10px] top corners)
      */}
      <div
        className="w-full flex-shrink-0 px-3.5 py-2 flex items-center justify-between border-b transition-colors z-20"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Left: Drag Handle, Icon & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            draggable
            onDragStart={(e) => onDragStart && onDragStart(e, id)}
            onDragEnd={onDragEnd}
            className="drag-handle p-1 -ml-1 text-slate-400 hover:text-white rounded-[6px] hover:bg-white/10 transition-colors flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{
              touchAction: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
            title="Drag to reposition in Bento grid"
            aria-label={`Drag to reposition ${title}`}
          >
            <GripVertical className="w-3.5 h-3.5 opacity-70 hover:opacity-100" />
          </div>

          {Icon && (
            <div className="w-5 h-5 rounded-[6px] bg-white/10 flex items-center justify-center text-xs text-white/90 flex-shrink-0">
              {typeof Icon === 'string' ? (
                <span>{Icon}</span>
              ) : (
                <Icon className="w-3 h-3 text-indigo-300" />
              )}
            </div>
          )}

          <span className="text-xs font-bold text-white tracking-wide truncate">
            {title}
          </span>

          {/* Bento Dimension Badge */}
          <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded-[5px] bg-white/10 text-slate-300 border border-white/5">
            {currentCols}×{currentRows}
          </span>
        </div>

        {/* Right: Window Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Minimize / Collapse Button */}
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className={`w-5 h-5 rounded-[6px] flex items-center justify-center text-xs transition-all cursor-pointer ${
                isMinimized
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/5'
              }`}
              title={isMinimized ? 'Expand Widget' : 'Minimize Widget'}
            >
              {isMinimized ? '+' : '−'}
            </button>
          )}

          {/* Maximize / Focus Mode Button */}
          {onToggleMaximize && !isMinimized && (
            <button
              onClick={onToggleMaximize}
              className={`w-5 h-5 rounded-[6px] flex items-center justify-center text-xs transition-all cursor-pointer ${
                isMaximized
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/5'
              }`}
              title={isMaximized ? 'Restore Size' : 'Maximize to Full Focus'}
            >
              {isMaximized ? (
                <Minimize2 className="w-3 h-3" />
              ) : (
                <Maximize2 className="w-3 h-3" />
              )}
            </button>
          )}

          {/* Remove / Unload Button */}
          {onRemove && (
            <button
              onClick={onRemove}
              className="w-5 h-5 rounded-[6px] bg-white/5 hover:bg-red-500 hover:text-white text-slate-400 border border-white/5 flex items-center justify-center transition-colors text-xs cursor-pointer"
              title="Remove / Unload Mini-App"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 
        Widget Content or Minimized Summary 
      */}
      {isMinimized ? (
        <div
          onClick={onToggleMinimize}
          className="w-full flex-1 px-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors text-xs text-slate-300"
        >
          <span className="truncate italic text-[11px] text-slate-400">
            {minimizedSummary || 'Widget minimized • Click to expand'}
          </span>
          <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1">
            Expand ↗
          </span>
        </div>
      ) : (
        <div className="w-full flex-1 min-h-0 relative flex flex-col overflow-hidden">
          {children}
        </div>
      )}

      {/* 
        Interactive Bottom-Right Bento Resizing Handle 
        (Cursor: se-resize with tactile diagonal grip pattern)
      */}
      {!isMinimized && onResizeSpan && (
        <div
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          onPointerCancel={handleResizePointerUp}
          className="resize-handle absolute bottom-0 right-0 w-6 h-6 z-30 cursor-se-resize flex items-end justify-end p-1 select-none hover:bg-white/15 active:bg-indigo-500/40 transition-all rounded-tl-[8px] rounded-br-[10px] group/handle"
          title={`Resize Bento dimensions (Min: ${minCols}×${minRows}, Max: ${maxCols}×${maxRows})`}
          style={{
            touchAction: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            cursor: 'se-resize',
          }}
        >
          {/* Visual 3-Diagonal Lines Affordance */}
          <svg
            className="w-3.5 h-3.5 text-slate-400 group-hover/handle:text-white transition-colors pointer-events-none drop-shadow"
            viewBox="0 0 10 10"
            fill="currentColor"
          >
            <circle cx="8" cy="8" r="1.15" />
            <circle cx="5" cy="8" r="1.15" />
            <circle cx="8" cy="5" r="1.15" />
            <circle cx="2" cy="8" r="1.15" />
            <circle cx="5" cy="5" r="1.15" />
            <circle cx="8" cy="2" r="1.15" />
          </svg>

          {/* Floating Dimensions Tooltip while resizing */}
          {isResizing && (
            <div className="absolute -top-7 right-0 px-2 py-0.5 rounded-[6px] bg-indigo-600 text-white font-mono text-[10px] font-bold shadow-lg pointer-events-none whitespace-nowrap z-50 animate-fadeIn">
              {currentCols} × {currentRows}
              {currentCols === maxCols && currentRows === maxRows ? ' (Max)' : ''}
              {currentCols === minCols && currentRows === minRows ? ' (Min)' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
