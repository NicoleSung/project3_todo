import React, { useState } from 'react';
import Modal from 'react-modal';
import styles from './TaskModal.module.css';

Modal.setAppElement('#root');

interface Task {
  id: number;
  title: string;
  description: string;
  priority_lev: number;
  est_hour: number;
  est_min: number;
  due_dates: string;
  notification_yes: boolean;
  scheduled_time?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
  task?: Task;
}

export default function TaskModal({ isOpen, onClose, onTaskUpdated, task }: Props) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority_lev || 1);
  const [estHour, setEstHour] = useState(task?.est_hour || 0);
  const [estMin, setEstMin] = useState(task?.est_min || 0);
  const [dueDate, setDueDate] = useState(task?.due_dates || '');
  const [notification, setNotification] = useState(task?.notification_yes || false);
  const [scheduledTime, setScheduledTime] = useState(task?.scheduled_time || '');

  const handleSave = async () => {
    const payload = {
      title,
      description,
      priority_lev: priority,
      est_hour: estHour,
      est_min: estMin,
      due_dates: dueDate,
      notification_yes: notification,
      scheduled_time: scheduledTime
    };

    const method = task ? 'PUT' : 'POST';
    const endpoint = task ? `/api/tasks/${task.id}` : '/api/tasks';

    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    onClose();
    onTaskUpdated();
  };

  const suggestTime = async () => {
    const duration = estHour * 60 + estMin;
    const res = await fetch(`/api/tasks/suggest?duration=${duration}`, {
      credentials: 'include'
    });
    const data = await res.json();
    if (data.suggested_time) {
      setScheduledTime(data.suggested_time.slice(0, 16)); // Trim for datetime-local input
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <div className={styles.header}>
        <h1>{task ? 'Edit Task' : 'Add Task'}</h1>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <div className={styles.form}>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Priority</label>
        <select value={priority} onChange={(e) => setPriority(parseInt(e.target.value))}>
          <option value={1}>Low</option>
          <option value={2}>Medium</option>
          <option value={3}>High</option>
        </select>

        <label>Estimated Time</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input type="number" value={estHour} onChange={(e) => setEstHour(+e.target.value)} placeholder="Hours" />
          <input type="number" value={estMin} onChange={(e) => setEstMin(+e.target.value)} placeholder="Minutes" />
        </div>

        <label>Due Date</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

        <label>Scheduled Time</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
          />
          <button type="button" onClick={suggestTime}>Suggest</button>
        </div>

        <label>
          <input
            type="checkbox"
            checked={notification}
            onChange={(e) => setNotification(e.target.checked)}
          />
          Notify Me
        </label>

        <div className={styles.actions}>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}
