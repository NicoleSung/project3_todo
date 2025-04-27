import React, { useState, useEffect } from 'react';
import TaskModal from './TaskModal';
import ScheduleTaskModal from './ScheduleTaskModal';
import styles from './TaskItem.module.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { apiFetch } from '../../utils/api';

dayjs.extend(utc);

interface Props {
  task: {
    id: string;
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

const priorityColor = ['low', 'medium', 'high'];

export default function TaskItem({ task, onTaskUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledTime, setScheduledTime] = useState<string | null>(task.scheduled_time || null);
  const [deleteChecked, setDeleteChecked] = useState(false);

  useEffect(() => {
    setScheduledTime(task.scheduled_time || null);
  }, [task.scheduled_time]);

  const deleteTask = async () => {
    const res = await apiFetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const text = await res.text();
      console.error('Delete failed:', res.status, text);
      return;
    }
    onTaskUpdated();
  };

  const handleUnschedule = async () => {
    const res = await apiFetch(`/api/tasks/unschedule/${task.id}`, { method: 'PUT' });
    if (res.ok) {
      setScheduledTime(null);
      onTaskUpdated();
    } else {
      const text = await res.text();
      console.error('Unschedule failed:', res.status, text);
    }
  };

  return (
    <div className={styles.taskCard}>
      <div className={styles.taskRow}>
        {/* Left: Delete Checkbox */}
        <input
          type="checkbox"
          checked={deleteChecked}
          onChange={async e => {
            if (e.target.checked) {
              const confirmed = window.confirm('Are you sure you want to delete this task?');
              if (confirmed) {
                await deleteTask();
              } else {
                setDeleteChecked(false);
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
            {scheduledTime && (
              <>
                <span>•</span>
                <span>
                  Scheduled: {dayjs.utc(scheduledTime).local().format('MMM D, h:mm A')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className={styles.taskActions}>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          {scheduledTime ? (
            <button onClick={handleUnschedule}>Unschedule</button>
          ) : (
            <button onClick={() => setIsScheduling(true)}>Schedule</button>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <TaskModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onTaskUpdated={onTaskUpdated}
          task={task}
        />
      )}

      {/* Schedule Modal */}
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