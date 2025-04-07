import React, { useState } from 'react';
import Modal from 'react-modal';
import styles from './TaskModal.module.css';

Modal.setAppElement('#root');

interface Props {
  task: {
    id: number;
    title: string;
    est_hour: number;
    est_min: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export default function ScheduleTaskModal({ task, isOpen, onClose, onTaskUpdated }: Props) {
  const [suggested, setSuggested] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const fetchSuggestion = async () => {
    setLoading(true);
    const duration = task.est_hour * 60 + task.est_min;
    const res = await fetch(`/api/tasks/suggest?duration=${duration}`, {
      credentials: 'include'
    });
    const data = await res.json();
    if (data.suggested_time) {
      setSuggested(data.suggested_time.slice(0, 16));
      setStatus('');
    } else {
      setStatus(data.error || 'No available time found');
    }
    setLoading(false);
  };

  const confirmSchedule = async () => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ scheduled_time: suggested })
    });
    onTaskUpdated();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <div className={styles.header}>
        <h1>Schedule Task</h1>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <div className={styles.form}>
        <p><strong>{task.title}</strong></p>
        <p>Estimated Time: {task.est_hour}h {task.est_min}m</p>

        <div style={{ marginBottom: '1rem' }}>
          <button onClick={fetchSuggestion} disabled={loading}>
            {loading ? 'Finding...' : 'Suggest Time'}
          </button>
        </div>

        {suggested && (
          <p>
            Suggested Time: <strong>{suggested.replace('T', ' ')}</strong>
          </p>
        )}

        {status && <p style={{ color: 'red' }}>{status}</p>}

        <div className={styles.actions}>
          <button onClick={confirmSchedule} disabled={!suggested}>Confirm</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}