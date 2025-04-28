// import React, { useState, useEffect } from 'react';
// import Modal from 'react-modal';
// import styles from './ScheduleModal.module.css';


// interface Props {
//   task: {
//     id: number;
//     task_title: string;
//     task_details: string;
//     priority_lev: number;
//     est_hour: number;
//     est_min: number;
//     due_dates: string;
//     notification_yes: number;
//   };

//   isOpen: boolean;
//   onClose: () => void;
//   onTaskUpdated: () => void;
// }

// export default function ScheduleTaskModal({ task, isOpen, onClose, onTaskUpdated }: Props) {
//   const [suggested, setSuggested] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [ignoreBreak, setIgnoreBreak] = useState(false);
//   const [customTime, setCustomTime] = useState('');
//   const [validationStatus, setValidationStatus] = useState('');
//   const [validating, setValidating] = useState(false);
//   const [isTimeValid, setIsTimeValid] = useState(false);
  
//   const fetchSuggestion = async () => {
//     setLoading(true);
//     setIsTimeValid(false);
//     const duration = task.est_hour * 60 + task.est_min;
//     const res = await fetch(`/api/tasks/suggest?duration=${duration}&ignoreBreak=${ignoreBreak}`, {
//       credentials: 'include'
//     });
//     const data = await res.json();
//     if (data.suggested_time) {
//       setSuggested(data.suggested_time.slice(0, 16));
//       setIsTimeValid(true);
//     } else {
//       setValidationStatus(data.error || 'No available time found');
//     }
//     setLoading(false);
//   };

//   const validateCustomTime = async () => {
//     if (!customTime) return;
//     setValidating(true);
//     setValidationStatus('');
//     const res = await fetch('/api/tasks/validate-time', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify({
//         scheduled_time: customTime,
//         est_hour: task.est_hour,
//         est_min: task.est_min,
//         ignoreBreak: ignoreBreak
//       })
//     });
//     const data = await res.json();
//     if (res.ok) {
//       setValidationStatus('Time is available!');
//       setSuggested(customTime);
//       setIsTimeValid(true);
//     } else {
//       setValidationStatus(data.error || 'Time conflict.');
//       setIsTimeValid(false);
//     }
//     setValidating(false);
//   };

//   const confirmSchedule = async () => {
//     const LocalTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

//     await fetch(`/api/tasks/schedule/${task.id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify({
//         est_hour: task.est_hour,
//         est_min: task.est_min,
//         scheduled_time: suggested,
//         timezone: LocalTimeZone
//       })
//     });

//     onTaskUpdated();
//     onClose();
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onRequestClose={onClose}
//       className={styles['suggestion-modal']}
//       overlayClassName={styles['suggestion-overlay']}
//     >
//       <div className={styles['suggestion-header']}>
//         <h2>Schedule Suggestion</h2>
//       </div>

//       <div className={styles['suggestion-form']}>
//         <p><strong>Task:</strong> {task.task_title}</p>
//         <p>Based on your schedule and task priority, we recommend:</p>

//         {suggested && (
//           <div className={styles['suggestion-suggestionBlock']}>
//             {new Date(suggested).toLocaleDateString(undefined, {
//               weekday: 'long', month: 'long', day: 'numeric'
//             })}<br />
//             {new Date(suggested).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – 
//             {new Date(new Date(suggested).getTime() + (task.est_hour * 60 + task.est_min) * 60000)
//               .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
//             ({task.est_hour}h {task.est_min}m)
//           </div>
//         )}

//         <button onClick={fetchSuggestion} disabled={loading}>
//           {loading ? 'Finding...' : 'Suggest Time'}
//         </button>

//         <p style={{ marginTop: '1rem' }}>Not ideal? Choose a custom time:</p>
//         <input
//           type="datetime-local"
//           value={customTime}
//           onChange={(e) => {
//             setCustomTime(e.target.value);
//             setIsTimeValid(false);
//             setValidationStatus('');
//           }}
//           className={styles['suggestion-datetimeInput']}
//         />

//         <button onClick={validateCustomTime} disabled={!customTime || validating}>
//           {validating ? 'Validating...' : 'Validate Time'}
//         </button>

//         {validationStatus && <p>{validationStatus}</p>}

//         <label className={styles['suggestion-checkboxLabel']}>
//           <input
//             type="checkbox"
//             checked={ignoreBreak}
//             onChange={() => setIgnoreBreak(!ignoreBreak)}
//           />
//           Ignore 15-min break rule between tasks
//         </label>

//         <div className={styles['suggestion-actions']}>
//           <button onClick={onClose} className={styles['suggestion-cancelButton']}>Cancel</button>
//           <button onClick={confirmSchedule} disabled={!suggested || !isTimeValid}>
//             Schedule Now
//           </button>
//         </div>
//       </div>
//     </Modal>
//   );
// }


import React, { useState } from 'react';
import Modal from 'react-modal';
import styles from './ScheduleModal.module.css';
import { apiFetch } from '../../utils/api';

interface Props {
  task: {
    id: string;
    task_title: string;
    task_details: string;
    priority_lev: number;
    est_hour: number;
    est_min: number;
    due_dates: string;
    notification_yes: number;
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
    setValidationStatus('');
    const duration = task.est_hour * 60 + task.est_min;
    const res = await apiFetch(
      `/api/tasks/suggest?duration=${duration}&ignoreBreak=${ignoreBreak}`
    );
    const data = await res.json();
    if (res.ok && data.suggested_time) {
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
    const res = await apiFetch('/api/tasks/validate-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheduled_time: customTime,
        est_hour: task.est_hour,
        est_min: task.est_min,
        ignoreBreak: ignoreBreak
      })
    });
    const data = await res.json();
    if (res.ok) {
      setValidationStatus('Time is available!');
      setSuggested(customTime);
      setIsTimeValid(true);
    } else {
      setValidationStatus(data.error || 'Time conflict.');
      setIsTimeValid(false);
    }
    setValidating(false);
  };

  const confirmSchedule = async () => {
    const LocalTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await apiFetch(`/api/tasks/schedule/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        est_hour: task.est_hour,
        est_min: task.est_min,
        scheduled_time: suggested,
        timezone: LocalTimeZone
      })
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('Schedule failed:', res.status, text);
      return;
    }
    onTaskUpdated();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={styles['suggestion-modal']}
      overlayClassName={styles['suggestion-overlay']}
    >
      <div className={styles['suggestion-header']}>
        <h2>Schedule Suggestion</h2>
      </div>

      <div className={styles['suggestion-form']}>
        <p><strong>Task:</strong> {task.task_title}</p>
        <p>Based on your schedule and task priority, we recommend:</p>

        {suggested && (
          <div className={styles['suggestion-suggestionBlock']}>
            {new Date(suggested).toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric'
            })}<br/>
            {new Date(suggested).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – 
            {new Date(new Date(suggested).getTime() + (task.est_hour * 60 + task.est_min) * 60000)
              .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            ({task.est_hour}h {task.est_min}m)
          </div>
        )}

        <button onClick={fetchSuggestion} disabled={loading}>
          {loading ? 'Finding...' : 'Suggest Time'}
        </button>

        <p style={{ marginTop: '1rem' }}>Not ideal? Choose a custom time:</p>
        <input
          type="datetime-local"
          value={customTime}
          onChange={e => {
            setCustomTime(e.target.value);
            setIsTimeValid(false);
            setValidationStatus('');
          }}
          className={styles['suggestion-datetimeInput']}
        />

        <button onClick={validateCustomTime} disabled={!customTime || validating}>
          {validating ? 'Validating...' : 'Validate Time'}
        </button>

        {validationStatus && <p>{validationStatus}</p>}

        <label className={styles['suggestion-checkboxLabel']}>
          <input
            type="checkbox"
            checked={ignoreBreak}
            onChange={() => setIgnoreBreak(!ignoreBreak)}
          />
          Ignore 15‑min break rule between tasks
        </label>

        <div className={styles['suggestion-actions']}>
          <button onClick={onClose} className={styles['suggestion-cancelButton']}>
            Cancel
          </button>
          <button onClick={confirmSchedule} disabled={!suggested || !isTimeValid}>
            Schedule Now
          </button>
        </div>
      </div>
    </Modal>
  );
}