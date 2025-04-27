// import React from 'react';
// import Modal from 'react-modal';
// import styles from './TaskModal.module.css';
// import { FaTimes } from 'react-icons/fa';

// interface Task {
//   id?: number;
//   task_title: string;
//   task_details: string;
//   priority_lev: number;
//   est_hour: number;
//   est_min: number;
//   due_dates: string;
//   notification_yes: number;
// }

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   onTaskUpdated: () => void;
//   task?: Task;
// }

// export default function TaskModal({ isOpen, onClose, onTaskUpdated, task }: Props) {
//   const isEdit = !!task;

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const form = e.currentTarget;
//     const formData = new FormData(form);

//     const payload = {
//       task_title: formData.get('title'),
//       task_details: formData.get('details'),
//       priority_lev: Number(formData.get('priority')),
//       est_hour: Number(formData.get('hours')),
//       est_min: Number(formData.get('minutes')),
//       due_dates: formData.get('due_date'),
//       notification_yes: formData.get('notify') ? 1 : 0
//     };

//     const endpoint = isEdit ? `/api/tasks/${task.id}` : '/api/tasks';
//     const method = isEdit ? 'PUT' : 'POST';

//     await fetch(endpoint, {
//       method,
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify(payload)
//     });

//     form.reset();
//     onClose();
//     onTaskUpdated();
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onRequestClose={onClose}
//       className={styles.modal}
//       overlayClassName={styles.overlay}
//     >
//       <div className={styles.header}>
//         <h1>{isEdit ? 'Edit Task' : 'Add Task'}</h1>
        
//       </div>

//       <form className={styles.form} onSubmit={handleSubmit}>
//         <label>Title</label>
//         <input name="title" defaultValue={task?.task_title} required />

//         <label>Description</label>
//         <textarea name="details" defaultValue={task?.task_details} rows={3} />

//         <label>Priority</label>
//         <div className={styles.radioGroup}>
//           <label><input type="radio" name="priority" value="3" defaultChecked={task?.priority_lev === 3 || !isEdit} /> High</label>
//           <label><input type="radio" name="priority" value="2" defaultChecked={task?.priority_lev === 2} /> Medium</label>
//           <label><input type="radio" name="priority" value="1" defaultChecked={task?.priority_lev === 1} /> Low</label>
//         </div>

//         <label>Estimated Time</label>
//         <div className={styles.row}>
//           <input name="hours" type="number" min="0" max = "100" defaultValue={task?.est_hour || 0} required/>
//           <span>:</span>
//           <input name="minutes" type="number" min="0" max = "59" defaultValue={task?.est_min || 0} required/>
//         </div>

//         <label>Due Date</label>
//         <input name="due_date" type="date" defaultValue={task?.due_dates} required />

//         <label className={styles.toggleLabel}>
//           <input
//             name="notify"
//             type="checkbox"
//             defaultChecked={task?.notification_yes === 1}
//           />
//           Send notifications
//         </label>

//         <div className={styles.actions}>
//           <button type="button" onClick={onClose} className={styles.cancel}>Cancel</button>
//           <button type="submit">{isEdit ? 'Update Task' : 'Add Task'}</button>
//         </div>
//       </form>
//     </Modal>
//   );
// }


import React from 'react';
import Modal from 'react-modal';
import styles from './TaskModal.module.css';
import { FaTimes } from 'react-icons/fa';
import { apiFetch } from '../../utils/api';

interface Task {
  id?: string;
  task_title: string;
  task_details: string;
  priority_lev: number;
  est_hour: number;
  est_min: number;
  due_dates: string;
  notification_yes: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
  task?: Task;
}

export default function TaskModal({ isOpen, onClose, onTaskUpdated, task }: Props) {
  const isEdit = Boolean(task);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      task_title: formData.get('title'),
      task_details: formData.get('details'),
      priority_lev: Number(formData.get('priority')),
      est_hour: Number(formData.get('hours')),
      est_min: Number(formData.get('minutes')),
      due_dates: formData.get('due_date'),
      notification_yes: formData.get('notify') ? 1 : 0
    };

    const endpoint = isEdit ? `/api/tasks/${task!.id}` : '/api/tasks';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`Task ${method} failed:`, res.status, text);
        throw new Error(`Server returned ${res.status}`);
      }
      form.reset();
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error('Error creating/updating task:', err);
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
        <h1>{isEdit ? 'Edit Task' : 'Add Task'}</h1>
        <FaTimes onClick={onClose} className={styles.closeIcon} />
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>Title</label>
        <input name="title" defaultValue={task?.task_title} required />

        <label>Description</label>
        <textarea name="details" defaultValue={task?.task_details} rows={3} />

        <label>Priority</label>
        <div className={styles.radioGroup}>
          <label>
            <input
              type="radio"
              name="priority"
              value="3"
              defaultChecked={task?.priority_lev === 3 || !isEdit}
            />{' '}
            High
          </label>
          <label>
            <input
              type="radio"
              name="priority"
              value="2"
              defaultChecked={task?.priority_lev === 2}
            />{' '}
            Medium
          </label>
          <label>
            <input
              type="radio"
              name="priority"
              value="1"
              defaultChecked={task?.priority_lev === 1}
            />{' '}
            Low
          </label>
        </div>

        <label>Estimated Time</label>
        <div className={styles.row}>
          <input
            name="hours"
            type="number"
            min="0"
            max="100"
            defaultValue={task?.est_hour ?? 0}
            required
          />
          <span>:</span>
          <input
            name="minutes"
            type="number"
            min="0"
            max="59"
            defaultValue={task?.est_min ?? 0}
            required
          />
        </div>

        <label>Due Date</label>
        <input name="due_date" type="date" defaultValue={task?.due_dates} required />

        <label className={styles.toggleLabel}>
          <input
            name="notify"
            type="checkbox"
            defaultChecked={task?.notification_yes === 1}
          />
          Send notifications
        </label>

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancel}>
            Cancel
          </button>
          <button type="submit">{isEdit ? 'Update Task' : 'Add Task'}</button>
        </div>
      </form>
    </Modal>
  );
}
