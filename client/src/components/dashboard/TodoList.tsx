import React, { useEffect, useState } from 'react';
import TaskItem from './TaskItem';

export default function TodoList() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks', {
      credentials: 'include'
    });
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div style={{ padding: '2rem 1rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Undone Tasks</h2>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          allTasks={tasks}
          onTaskUpdated={fetchTasks}
        />
      ))}
    </div>
    
  );
}
