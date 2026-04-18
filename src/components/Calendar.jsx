import React, { useState } from 'react';

export default function Calendar() {
  const [currentDate] = useState(new Date(2024, 6, 1)); // July 1st

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const days = [];
  const totalCells = firstDayOfMonth(currentDate) + daysInMonth(currentDate);

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth(currentDate); i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth(currentDate); i++) {
    days.push(i);
  }

  // Add empty cells to fill the grid
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-center text-sm font-bold mb-3 text-gray-300">
        {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
      </h3>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {/* Day headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div key={day} className="text-gray-500 font-semibold py-1">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`py-2 rounded text-xs ${
              day === 1
                ? 'bg-red-500 text-white font-bold'
                : day
                ? 'text-gray-400 hover:bg-gray-600 cursor-pointer'
                : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
