import { useState, useEffect, useRef } from "react";

const Pomodoro = () => {
  const initialTime = 30 * 60; 
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            alert("Pomodoro completed!");
            return 0;
          }else{
          return prevTime - 1;
          }
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handlePauseResume = () => setIsRunning(prev => !prev);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-center py-4">
      <div className="text-6xl mb-2 drop-shadow-2xl font-mono font-bold" style={{ color: '#a6ea78' }}>{formatTime(timeLeft)}</div>
      <div className="flex justify-center gap-2 w-full flex-wrap">
        <button 
          onClick={handleStart} 
          className="px-3 py-1 bg-gray-700/60 text-gray-100 rounded-xl hover:bg-gray-600 transition-all cursor-pointer shadow-lg text-xs"
        >
          Start
        </button>
        <button 
          onClick={handlePauseResume} 
          className="px-3 py-1 bg-yellow-500/40 text-gray-100 rounded-xl hover:bg-yellow-500/60 transition-all cursor-pointer shadow-lg text-xs"
        >
          {isRunning ? '⏸' : '▶'}
        </button>
        <button 
          onClick={handleReset} 
          className="px-3 py-1 bg-white/20 text-white rounded-xl hover:bg-white/40 transition-all cursor-pointer shadow-lg text-xs"
        >
          ⟲
        </button>
      </div>
    </div>
  );
};

export default Pomodoro;
