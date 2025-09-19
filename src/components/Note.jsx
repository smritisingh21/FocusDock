import React from 'react'
import './Note.css';    

export default function Note() {
  return (
    <div className='note-app'>
        <p contentEditable="true" 
        className="writing-box"
         placeholder='Type something..'></p>
    </div>
  )
}
