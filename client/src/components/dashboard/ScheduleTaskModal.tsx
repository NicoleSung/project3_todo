import React, { useState } from 'react';
import Modal from 'react-modal';
import styles from './TaskModal.module.css';

Modal.setAppElement('#root');

interface Props {
  task: {
    id: number;
    task_title: string;
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
  const [ignoreBreak, setIgnoreBreak] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [validationStatus, setValidationStatus] = useState('');
  const [validating, setValidating] = useState(false);
  const [isTimeValid, setIsTimeValid] = useState(false);

  const fetchSuggestion = async () => {
    setLoading(true);
    setIsTimeValid(false);
    const duration = task.est_hour * 60 + task.est_min;
    const res = await fetch(
      `/api/tasks/suggest?duration=${duration}&ignoreBreak=${ignoreBreak}`,
      { credentials: 'include' }
    );
    const data = await res.json();
    if (data.suggested_time) {
      setSuggested(data.suggested_time.slice(0, 16));
      setIsTimeValid(true);
    } else {
      setValidationStatus(data.error || 'No available time found');
    }
    setLoading(false);
  };

  const validateCustomTime = async () => {
    if (!customTime) return;
    setValidating(true);
    setValidationStatus('');
    const res = await fetch('/api/tasks/validate-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        scheduled_time: customTime,
        est_hour: task.est_hour,
        est_min: task.est_min,
        ignoreBreak
      })
    });
    const data = await res.json();
    if (res.ok) {
      setValidationStatus('Time is available!');
      setSuggested(customTime);
      setIsTimeValid(true);
    } else {
      setValidationStatus(`${data.error || 'Time conflict.'}`);
      setIsTimeValid(false);
    }
    setValidating(false);
  };

  const confirmSchedule = async () => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        scheduled_time: suggested,
        est_hour: task.est_hour,
        est_min: task.est_min
      })
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
        <h2>Schedule Suggestion</h2>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <div className={styles.form}>
        <p><strong>{task.task_title}</strong></p>
        <p>Based on your schedule and task priority, we recommend:</p>
        {suggested && (
          <div style={{ background: '#eee', padding: '1rem', borderRadius: '0.75rem' }}>
            {new Date(suggested).toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric'
            })}
            <br />
            {new Date(suggested).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – 
            {new Date(new Date(suggested).getTime() + (task.est_hour * 60 + task.est_min) * 60000)
              .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({task.est_hour}h {task.est_min}m)
          </div>
        )}

        <button onClick={fetchSuggestion} disabled={loading}>
          {loading ? 'Finding...' : 'Suggest Time'}
        </button>

        <p style={{ marginTop: '1rem' }}>Not ideal? Choose a custom time:</p>
        <input
          type="datetime-local"
          value={customTime}
          onChange={(e) => {
            setCustomTime(e.target.value);
            setIsTimeValid(false);
            setValidationStatus('');
          }}
          className={styles.datetimeInput}
        />
        <button onClick={validateCustomTime} disabled={!customTime || validating}>
          {validating ? 'Validating...' : 'Validate Time'}
        </button>

        {validationStatus && (
          <p style={{ color: validationStatus.startsWith('✅') ? 'green' : 'red' }}>
            {validationStatus}
          </p>
        )}

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={ignoreBreak}
            onChange={() => setIgnoreBreak(!ignoreBreak)}
          />
          Ignore 15-min break rule between tasks
        </label>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
          <button onClick={confirmSchedule} disabled={!suggested || !isTimeValid}>
            Schedule Now
          </button>
        </div>
      </div>
    </Modal>
  );
}
