import React, { useState } from 'react';
import EditTaskModal from './EditTaskModal';
import ScheduleTaskModal from './ScheduleTaskModal';

interface Props {
  task: {
    id: number;
    title: string;
    description: string;
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
const priorityColor = ['#00aa7f', '#e5a100', '#e74c3c'];

export default function TaskItem({ task, onTaskUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const deleteTask = async () => {
    const confirmed = confirm('Are you sure you want to delete this task?');
    if (!confirmed) return;

    await fetch(`/api/tasks/${task.id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    onTaskUpdated();
  };

  return (
    <div style={{
      borderRadius: '12px',
      background: 'white',
      padding: '1rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h3>{task.title}</h3>
        <p style={{ color: '#666' }}>{task.description}</p>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
          <span>🕒 {task.est_hour}h {task.est_min}m</span>
          <span>📅 Due: {task.due_dates}</span>
          {task.scheduled_time && (
            <span>🗓 Scheduled: {task.scheduled_time.replace('T', ' ').slice(0, 16)}</span>
          )}
          <span style={{
            backgroundColor: priorityColor[task.priority_lev - 1],
            color: 'white',
            padding: '2px 8px',
            borderRadius: '5px'
          }}>
            {priorityMap[task.priority_lev - 1]}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => setIsEditing(true)}>Edit</button>
        <button onClick={deleteTask} style={{ color: 'red' }}>Delete</button>
        {!task.scheduled_time && (
          <button onClick={() => setIsScheduling(true)}>Schedule</button>
        )}
      </div>

      {isEditing && (
        <EditTaskModal
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
