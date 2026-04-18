import Task from './Task'
import { useState } from 'react';

export default function Todo() {
const [tasks, setTasks] = useState([
  { id: 1, text: 'learn javascript', completed: true },
  { id: 2, text: 'build ui for the productivity app', completed: false },
  { id: 3, text: 'build ui for the productivity app', completed: false },
  { id: 4, text: 'build ui for the productivity app', completed: false },
]);
const[error , setError] =useState('')

const handleAddTask = () => {
  const newTask = { 
    id: Date.now(),
     text: '', 
     completed: false };

  setTasks([...tasks, newTask]);
};

const handleClearTasks = () => {
  setTasks([]);
};

const handleDeleteTask=(id) =>{
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
}

const validation = () => {
  const hasEmptyTask = tasks.some(task => task.text.trim() === '');
  if (hasEmptyTask) {
    setError('Please set all tasks!!');
    setTimeout(() => {
      setError('');
    }, 3000);
  } else {
    setError('');
  }
};

const toggleTaskCompleted = (id) => {
  validation();
  const taskToToggle = tasks.find(task => task.id === id);
  if (taskToToggle && taskToToggle.text.trim() !== '') {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }
};

const updateTaskText = (id, newText) => {
  setTasks(tasks.map(task =>
    task.id === id ? { ...task, text: newText } : task
  ));
};

  return (
    <>
    <div className="w-full h-full flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-3">Today</h2>
      
      <div className="flex gap-2 mb-3">
        <button 
          className="h-6 px-2 py-0 bg-none border rounded text-gray-300 font-light text-xs transition-colors"
          style={{ borderColor: '#888' }}
          onClick={handleAddTask}
        > 
          + Add new task
        </button>
        <button 
          className="h-6 px-2 py-0 bg-none border rounded text-gray-300 font-light text-xs transition-colors"
          style={{ borderColor: '#888' }}
          onClick={handleClearTasks}
        >
          Clear all
        </button>
      </div>

      {error && <div className="text-red-500 text-xs mb-2">{error}</div>}

      <div className="flex flex-col overflow-y-auto gap-2 flex-1">
        {tasks.map(task => (
          <Task
            key={task.id}
            task={task}
            onToggle={() => toggleTaskCompleted(task.id)}
            onChange={(newText) => updateTaskText(task.id, newText)}
            onDelete={() => handleDeleteTask(task.id)}
          />
        ))}
      </div>
    </div>
    </>
  );
}
