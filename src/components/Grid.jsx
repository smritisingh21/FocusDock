import Task from './Task';
import { useState } from 'react';   
import Todo from './Todo';
import Pomodoro from './Pomodoro';
import './Grid.css';
import React from 'react'
import Note from './Note';
import Wallpaper from './Wallpaper';
import Music from './Music';

export default function Grid() {
  return (
    <div>
        <div className="main-grid">
            <div className="tile" ><Wallpaper/></div>
            <div className="tile" ><Todo/> </div>
            <div className="tile" > <Note/></div>
            <div className="tile" ><Music/></div>
            <div className="tile" ></div>
            <div className="tile" > <Pomodoro/></div>
        </div>
    </div>
  )

}