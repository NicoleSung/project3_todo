import React from 'react';
import Modal from 'react-modal';
import styles from './TaskModal.module.css';

Modal.setAppElement('#root');

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
  task: any;
}

export default function EditTaskModal({ isOpen, onClose, onTaskUpdated, task }: Props) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const updated = {
      title: formData.get('title'),
      description: formData.get('description'),
      priority_lev: Number(formData.get('priority')),
      est_hour: Number(formData.get('hours')),
      est_min: Number(formData.get('minutes')),
      due_dates: formData.get('due_date'),
      notification_yes: formData.get('notify') ? 1 : 0
    };

    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updated)
    });

    form.reset();
    onClose();
    onTaskUpdated();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <div className={styles.header}>
        <h1>Edit Task</h1>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>Title</label>
        <input name="title" defaultValue={task.title} required />

        <label>Description</label>
        <textarea name="description" defaultValue={task.description} rows={3} />

        <label>Priority</label>
        <div className={styles.radioGroup}>
          <label><input type="radio" name="priority" value="3" defaultChecked={task.priority_lev === 3} /> High</label>
          <label><input type="radio" name="priority" value="2" defaultChecked={task.priority_lev === 2} /> Medium</label>
          <label><input type="radio" name="priority" value="1" defaultChecked={task.priority_lev === 1} /> Low</label>
        </div>

        <label>Estimated Time</label>
        <div className={styles.row}>
          <input name="hours" type="number" defaultValue={task.est_hour} />
          <input name="minutes" type="number" defaultValue={task.est_min} />
        </div>

        <label>Due Date</label>
        <input name="due_date" type="date" defaultValue={task.due_dates} required />

        <label className={styles.toggleLabel}>
          <input name="notify" type="checkbox" defaultChecked={task.notification_yes === 1} />
          Send notifications
        </label>

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancel}>Cancel</button>
          <button type="submit">Update Task</button>
        </div>
      </form>
    </Modal>
  );
}
