import "./Todo.css"
import Task from './Task'
import { useState } from 'react';

export default function Todo() {
const [tasks, setTasks] = useState([]);
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
  // Only validate when check button is clicked
  validation();
  // Only toggle if the task is not empty
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


  // Only count completed tasks that are not empty
  const completedCount = tasks.filter(task => task.completed && task.text.trim() !== '').length;
  const totalValidTasks = tasks.filter(task => task.text.trim() !== '').length;
  const progressPercent = totalValidTasks > 0 ? (completedCount / totalValidTasks) * 100 : 0;

  return (
    <>
    <div className="todo-container">
        <div className="task-list">
            <div id="top-area">
                <h1>TODAY'S GOALS</h1>
                <h3 style={{color:"yellow"}}></h3>
                <button className="add-btn"onClick={handleAddTask}> + Add new task</button>
                <button className="clear-btn"onClick={handleClearTasks}>Clear all</button>
                {
                error && 
                     <div className="errorElement" style={{ color: "red" }}>{error} </div>
                }          
                  </div>
            <div id="tasks">
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
        <div className="progress-bar">
           <div className="progress"
          style={{
          height: window.innerWidth > 600 ? `${progressPercent}%` : '100%',
          width: window.innerWidth > 600 ? '100%' : `${progressPercent}%`,
          backgroundColor: '#fff',
      }}>
           </div>
        </div>
    </div>
    </>
  );
}
