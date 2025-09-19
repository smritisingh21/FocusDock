import  { useState, useEffect, useRef } from "react";
import "./Pomodoro.css";

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
    <div className="pomodoro-container">
      <div className="timer-display">{formatTime(timeLeft)}</div>
      <div className="button-group">
        <button onClick={handleStart} className="start">Start</button>
        <button onClick={handlePauseResume} className="pause-resume">
            {isRunning ? <span id="play-btn">&#10073;&#10073; </span > : <span id="pause-btn">&#9654; </span>}
        </button>
        <button onClick={handleReset} className="reset"><span>⟲</span></button>
      </div>
    </div>
  );
};

export default Pomodoro;
