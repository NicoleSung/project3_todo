import React, { useEffect, useState } from 'react';
import AddTaskButton from '../components/dashboard/AddTaskButton';
import TaskItem from '../components/dashboard/TaskItem';
import styles from '../components/dashboard/Dashboard.module.css';
import { apiFetch } from '../utils/api';

export default function Dashboard() {
  const [refresh, setRefresh] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);

  const triggerRefresh = () => setRefresh(prev => !prev);

  const fetchTasks = async () => {
    try {
      // use apiFetch so the ID token is sent in Authorization header
      const res = await apiFetch('/api/tasks');
      if (!res.ok) {
        const errText = await res.text();
        console.error('Fetch tasks failed:', res.status, errText);
        return;
      }
      const data = await res.json();
      const activeTasks = data.filter(
        (task: any) => task.active_note === true || task.active_note === 1
      );
      setTasks(activeTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refresh]);

  return (
    <div className={styles.dashboardPanel}>
      <div className={styles.headerrow}>
        <AddTaskButton onTaskUpdated={triggerRefresh} />
        <h2>Undone Tasks</h2>
      </div>
      <div className={styles.tasklist}>
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} onTaskUpdated={triggerRefresh} />
        ))}
      </div>
    </div>
  );
}