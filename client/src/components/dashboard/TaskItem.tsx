import React, { useState } from 'react';
import TaskModal from './TaskModal';
import ScheduleTaskModal from './ScheduleTaskModal';
import styles from './TaskItem.module.css';
import { FaClock, FaCalendarAlt, FaCalendarCheck } from 'react-icons/fa';

interface Props {
  task: {
    id: number;
    task_title: string;
    task_details: string;
    priority_lev: number;
    est_hour: number;
    est_min: number;
    due_dates: string;
    notification_yes: boolean;
    scheduled_time?: string;
  };
  onTaskUpdated: () => void;
}

const priorityMap = ['Low', 'Medium', 'High'];
const priorityColor = ['low', 'medium', 'high'];

export default function TaskItem({ task, onTaskUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(task.scheduled_time);
  const [deleteChecked, setDeleteChecked] = useState(false);


  const deleteTask = async () => {
    await fetch(`/api/tasks/${task.id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    onTaskUpdated();
  };
  
  const handleUnschedule = async () => {
    const res = await fetch(`/api/tasks/${task.id}/unschedule`, {
      method: 'PUT',
      credentials: 'include'
    });

    if (res.ok) {
      setScheduledTime(null);
    }
  };

  return (
        <div className={styles.taskCard}>
      <div className={styles.taskRow}>
        {/* Left: Delete Checkbox */}
        <input
          type="checkbox"
          checked={deleteChecked}
          onChange={async (e) => {
            if (e.target.checked) {
              const confirmed = confirm('Are you sure you want to delete this task?');
              if (confirmed) {
                await deleteTask();
              } else {
                setDeleteChecked(false); // Revert checkbox
              }
            }
          }}
          className={styles.deleteCheckbox}
          title="Delete task"
        />


        {/* Center: Task Info */}
        <div className={styles.taskInfo}>
          <div className={styles.taskTitleRow}>
            <span className={styles.taskTitle}>{task.task_title}</span>
          </div>
          <div className={styles.meta}>
            <span>{task.est_hour}h {task.est_min}m</span>
            <span>•</span>
            <span>Due: {task.due_dates}</span>
            <span>•</span>
            <span className={`${styles.priorityDot} ${styles[priorityColor[task.priority_lev - 1]]}`} />
            {task.scheduled_time && (
              <>
                <span>•</span>
                <span>Scheduled: {task.scheduled_time.replace('T', ' ').slice(0, 16)}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className={styles.taskActions}>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => setIsScheduling(true)}>Schedule</button>
        </div>
      </div>

      {/* Modals */}
      {isEditing && (
        <TaskModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onTaskUpdated={onTaskUpdated}
          task={task}
        />
      )}

      {isScheduling && (
        <ScheduleTaskModal
          isOpen={isScheduling}
          onClose={() => setIsScheduling(false)}
          onTaskUpdated={onTaskUpdated}
          task={task}
        />
      )}
    </div>

  );
}
