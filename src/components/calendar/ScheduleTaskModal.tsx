import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import dayjs from 'dayjs';
import styles from './TaskModal.module.css';

Modal.setAppElement('#root');

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
  task: any;
  existingTasks: any[];
}

export default function ScheduleTaskModal({ isOpen, onClose, task, onScheduled, existingTasks }: Props) {
  const [suggestedTime, setSuggestedTime] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');

  // Find first available hour block
  useEffect(() => {
    const today = dayjs().startOf('day');
    const takenSlots = new Set(
      existingTasks
        .filter(t => t.scheduled_time)
        .map(t => dayjs(t.scheduled_time).hour())
    );

    for (let hour = 8; hour < 18; hour++) {
      if (!takenSlots.has(hour)) {
        setSuggestedTime(today.hour(hour).format('YYYY-MM-DDTHH:00'));
        break;
      }
    }
  }, [existingTasks]);

  const handleSchedule = async () => {
    const scheduled_time = customTime || suggestedTime;

    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...task, scheduled_time })
    });

    onClose();
    onScheduled();
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
        <p><strong>Task:</strong> {task.title}</p>
        <p><strong>Suggested Time:</strong> {dayjs(suggestedTime).format('MMMM D, HH:mm')}</p>

        <label>Pick another time (optional)</label>
        <input
          type="datetime-local"
          value={customTime}
          onChange={(e) => setCustomTime(e.target.value)}
        />

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.cancel}>Cancel</button>
          <button onClick={handleSchedule}>Schedule Task</button>
        </div>
      </div>
    </Modal>
  );
}
