import React, { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(today.getDate());

  const monthName = new Date(current.year, current.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const prevDays = new Date(current.year, current.month, 0).getDate();

  const isCurrentMonth = current.year === today.getFullYear() && current.month === today.getMonth();

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: prevDays - firstDay + i + 1, type: 'prev' });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, type: 'current' });
  }
  const remaining = 35 - cells.length > 0 ? 35 - cells.length : 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, type: 'next' });
  }

  const prevMonth = () => {
    setCurrent((c) => {
      const prevM = c.month === 0 ? 11 : c.month - 1;
      const prevY = c.month === 0 ? c.year - 1 : c.year;
      return { year: prevY, month: prevM };
    });
  };

  const nextMonth = () => {
    setCurrent((c) => {
      const nextM = c.month === 11 ? 0 : c.month + 1;
      const nextY = c.month === 11 ? c.year + 1 : c.year;
      return { year: nextY, month: nextM };
    });
  };

  return (
    <div
      className="w-full h-full px-7 py-5 flex flex-col justify-between select-none relative"
      style={{ backgroundColor: '#212121' }}
    >
      {/* Month Header Switcher */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-white tracking-wide">
          {monthName}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="w-6 h-6 rounded-[6px] bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ‹
          </button>
          <button
            onClick={nextMonth}
            className="w-6 h-6 rounded-[6px] bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ›
          </button>
        </div>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 mb-2 text-center">
        {DAYS.map((d, i) => (
          <div
            key={i}
            className="text-[11px] font-semibold text-slate-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid of Days with generous cell padding */}
      <div className="grid grid-cols-7 gap-y-2 gap-x-1.5 items-center justify-items-center flex-1">
        {cells.map((cell, i) => {
          const isToday = isCurrentMonth && cell.type === 'current' && cell.day === today.getDate();
          const isSelected = cell.type === 'current' && cell.day === selected;

          return (
            <button
              key={i}
              onClick={() => cell.type === 'current' && setSelected(cell.day)}
              className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-xs font-semibold transition-all cursor-pointer ${
                isToday
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                  : isSelected
                  ? 'bg-white/20 text-white font-bold'
                  : cell.type === 'current'
                  ? 'text-slate-200 hover:bg-white/10'
                  : 'text-slate-600 opacity-40'
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}