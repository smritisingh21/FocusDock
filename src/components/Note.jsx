import React from 'react'

export default function Note() {
  return (
    <div className='w-full h-full relative p-3 rounded-2xl overflow-hidden' style={{ backgroundColor: '#d4ff00' }}>
        <p 
          contentEditable="true" 
          className="w-full h-full box-border resize-none border-none bg-transparent p-2 text-gray-800 text-sm leading-relaxed overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words align-top focus:outline-none"
          placeholder='Notes...'
        />
    </div>
  )
}
