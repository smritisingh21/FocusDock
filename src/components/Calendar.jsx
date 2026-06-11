import { useState } from 'react';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Calendar() {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(today.getDate());

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
  const prevDays = new Date(current.year, current.month, 0).getDate();

  const isCurrentMonth = current.year === today.getFullYear() && current.month === today.getMonth();

  const prev = () => setCurrent(c => c.month === 0
    ? { year: c.year - 1, month: 11 }
    : { year: c.year, month: c.month - 1 });

  const next = () => setCurrent(c => c.month === 11
    ? { year: c.year + 1, month: 0 }
    : { year: c.year, month: c.month + 1 });

  const cells = [];
  for (let i = 0; i < firstDay; i++)
    cells.push({ day: prevDays - firstDay + i + 1, type: 'prev' });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, type: 'current' });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++)
    cells.push({ day: d, type: 'next' });

  return (
    <div className="w-full h-full flex flex-col p-4" style={{ backgroundColor: '#242424' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <button onClick={prev} className="text-white/50 hover:text-white text-sm bg-transparent border-none cursor-pointer">‹</button>
        <span className="text-sm font-semibold text-white">
          {MONTHS[current.month]} {current.year}
        </span>
        <button onClick={next} className="text-white/50 hover:text-white text-sm bg-transparent border-none cursor-pointer">›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1 flex-shrink-0">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs font-medium py-1" style={{ color: '#666' }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1">
        {cells.map((cell, i) => {
          const isToday = isCurrentMonth && cell.type === 'current' && cell.day === today.getDate();
          const isSel = cell.type === 'current' && cell.day === selected;
          return (
            <div key={i}
              onClick={() => cell.type === 'current' && setSelected(cell.day)}
              className="flex items-center justify-center text-xs rounded-full cursor-pointer transition-colors"
              style={{
                color: cell.type !== 'current' ? '#444'
                  : isToday ? '#fff'
                  : isSel ? '#fff'
                  : '#ccc',
                backgroundColor: isToday ? '#e84040'
                  : isSel ? '#555'
                  : 'transparent',
                fontWeight: isToday || isSel ? '600' : '400',
                aspectRatio: '1',
              }}>
              {cell.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}