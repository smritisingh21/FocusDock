import Task from './Task';
import { useState } from 'react';   
import Todo from './Todo';
import Pomodoro from './Pomodoro';
import React from 'react'
import Note from './Note';
import Wallpaper from './Wallpaper';
import Music from './Music';
import Calendar from './Calendar';

export default function Grid() {
  return (
    <div className="flex-1 p-6 overflow-auto" style={{ backgroundColor: '#2a2a2a' }}>
      <div className="grid grid-cols-3 grid-rows-3 gap-6 h-full">
        <div className="col-span-1 row-span-2 rounded-3xl overflow-hidden shadow-2xl">
          <Wallpaper/>
        </div>
        <div className="col-span-1 row-span-2 rounded-3xl p-4 shadow-2xl overflow-hidden" style={{ backgroundColor: '#3a3a3a' }}>
          <Todo/>
        </div>

        <div className="col-span-2 row-span-1 rounded-3xl p-4 shadow-2xl flex gap-4" style={{ backgroundColor: '#2a2a2a' }}>
          <div className="flex-1 rounded-2xl p-4 flex flex-col items-center justify-center" style={{ backgroundColor: '#3a3a3a' }}>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mb-2 flex items-center justify-center text-2xl">👤</div>
            <h3 className="text-sm font-semibold">Smriti Singh</h3>
            <p className="text-xs text-gray-400">syx@gmail.com</p>
          </div>
          
          <div className="flex-1">
            <Note/>
          </div>
        </div>

        <div className="col-span-1 row-span-1 rounded-3xl p-4 shadow-2xl" style={{ backgroundColor: '#3a3a3a' }}>
          <Music/>
        </div>

        <div className="col-span-1 row-span-1 rounded-3xl p-4 shadow-2xl overflow-auto" style={{ backgroundColor: '#3a3a3a' }}>
          <Calendar/>
        </div>

        <div className="col-span-2 row-span-1 rounded-3xl p-4 shadow-2xl flex gap-4" style={{ backgroundColor: '#2a2a2a' }}>
          <div className="flex-1 rounded-2xl p-4 flex flex-col items-center justify-center" style={{ backgroundColor: '#1a4d4d' }}>
            <Pomodoro/>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: '#3a3a3a' }}>
              <p className="text-xs text-gray-400 mb-1">SCREEN TIME</p>
              <p className="text-3xl font-bold"><span className="text-red-500">2</span> hrs</p>
            </div>

            <div className="rounded-2xl p-4 flex-1 overflow-y-auto" style={{ backgroundColor: '#2a3a4a' }}>
              <p className="text-xs font-semibold mb-2">Upcoming reminder :</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-red-500 font-bold">04:30</span>
                  <span className="text-gray-400">wake up</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-500 font-bold">10:05</span>
                  <span className="text-gray-400">homework</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}