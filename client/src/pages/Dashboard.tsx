import React, { useEffect, useState } from 'react';
import AddTaskButton from '../components/dashboard/AddTaskButton';
import TaskItem from '../components/dashboard/TaskItem';
import styles from '../components/dashboard/Dashboard.module.css';

export default function Dashboard() {
  const [refresh, setRefresh] = useState(false);
  const [tasks, setTasks] = useState([]);

  const triggerRefresh = () => setRefresh(prev => !prev);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks', {
      credentials: 'include'
    });
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, [refresh]);

  return (
    <div className={styles.dashboardPanel}>
      <div className={styles.headerrow}>
        <h2>Undone Tasks</h2>
        <button className={styles.goldbutton}>
          <AddTaskButton onTaskUpdated={triggerRefresh} />
        </button>
      </div>
      <div className={styles.tasklist}>
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} onTaskUpdated={triggerRefresh} />
        ))}
      </div>
    </div>
  );
}
