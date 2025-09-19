
import './Task.css';


export default function Task({ task, onToggle, onChange, onDelete ,}) {
  return (
    <div className={`task-box `}> 
      <div className="check" onClick={onToggle} style={{color: task.completed ? 'green' : 'red'}}>
        {task.completed ? <i className="bi bi-check-circle-fill"></i> : ''}
      </div>
      <input
        type="text"
        value={task.text}
        onChange={(e) => onChange(e.target.value)}
        className="task-input"
        placeholder="Enter any task..." style={{color:"black", fontWeight:"bold"}}
      />
      <img className="delete-btn"
        src="../public/icons8-delete-button-50.png"
        title='delete task'
        onClick={onDelete}/>
    </div>
  );
}


