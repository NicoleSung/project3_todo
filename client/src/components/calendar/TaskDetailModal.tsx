import React, { useState } from 'react';
import Modal from 'react-modal';
import dayjs from 'dayjs';
import styles from '../dashboard/TaskModal.module.css';

Modal.setAppElement('#root');

interface Props {
  task: {
    id: number;
    title: string;
    description: string;
    scheduled_time?: string;
    end_time?: string;
  };
  onClose: () => void;
  onRefresh: () => void;
}

export default function TaskDetailModal({ task, onClose, onRefresh }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [scheduledTime, setScheduledTime] = useState(task.scheduled_time || '');
  const [endTime, setEndTime] = useState(task.end_time || '');

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
      title,
      description,
      scheduled_time: scheduledTime,
      end_time: endTime
    };

    await fetch(`/api/tasks/${task.id}`, {
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

        <label>End Time (optional)</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <div className={styles.actions}>
          <button onClick={handleDelete} style={{ color: 'red' }}>Delete</button>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleUpdate}>Save Changes</button>
        </div>
      </div>
    </Modal>
  );
}
