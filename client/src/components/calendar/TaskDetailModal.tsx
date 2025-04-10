import React, { useState } from 'react';
import Modal from 'react-modal';
import dayjs from 'dayjs';
import styles from '../dashboard/TaskModal.module.css';

Modal.setAppElement('#root');

interface Props {
  task: {
    id: number;
    task_title: string;
    task_details: string;
    scheduled_time: string;
    end_time: string;
    est_hour: number;
    est_min: number;
  };
  onClose: () => void;
  onRefresh: () => void;
}

export default function TaskDetailModal({ task, onClose, onRefresh }: Props) {
  const [title, setTitle] = useState(task.task_title);
  const [description, setDescription] = useState(task.task_details);
  const [scheduledTime, setScheduledTime] = useState(task.scheduled_time);

  const handleDelete = async () => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    onClose();
    onRefresh();
  };

  const handleUpdate = async () => {
    const payload = {
      task_title: title,
      task_details: description,
      scheduled_time: scheduledTime,
      est_hour: task.est_hour,
      est_min: task.est_min
    };
  
    await fetch(`/api/tasks/calendarEdit/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });
  
    onClose();
    onRefresh();
  };
  

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <div className={styles.header}>
        <h1>Edit Task</h1>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <div className={styles.form}>
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Scheduled Start</label>
        <input
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
        />

        <label>End Time</label>
        <input
          type="datetime-local"
          value={task.end_time ? dayjs(task.end_time).format('YYYY-MM-DDTHH:mm') : ''}
          readOnly
        />

        <label>Duration</label>
        <input
          type="text"
          value={`${task.est_hour}h ${task.est_min}m`}
          readOnly
/>

        <div className={styles.actions}>
          <button onClick={handleDelete}>Done</button>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleUpdate}>Save Changes</button>
        </div>
      </div>
    </Modal>
  );
}
