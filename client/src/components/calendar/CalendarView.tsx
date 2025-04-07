import React, { useState, useEffect } from 'react';
import './calendar.css';
import dayjs from 'dayjs';
import TaskDetailModal from './TaskDetailModal';

interface Task {
  id: number;
  title: string;
  description: string;
  scheduled_time?: string;
  end_time?: string;
}

export default function CalendarView() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [date, setDate] = useState(dayjs());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks', { credentials: 'include' });
    const data = await res.json();
    setTasks(data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handlePrev = () => setDate(prev => prev.subtract(1, view));
  const handleNext = () => setDate(prev => prev.add(1, view));

  const getWeekDays = () => {
    const start = date.startOf('week'); // Sunday
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
  };

  const getTasksForSlot = (day: dayjs.Dayjs, hour: number) => {
    return tasks.filter(t => {
      if (!t.scheduled_time) return false;
      const start = dayjs(t.scheduled_time);
      const end = t.end_time ? dayjs(t.end_time) : start.add(1, 'hour');
      return start.isSame(day, 'day') && hour >= start.hour() && hour < end.hour();
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Calendar</h2>
        <div className="calendar-nav">
          <button onClick={handlePrev}>&lt;</button>
          <button onClick={() => setDate(dayjs())}>Today</button>
          <span>{date.format(view === 'week' ? '[Week of] MMM D, YYYY' : 'MMMM D, YYYY')}</span>
          <button onClick={handleNext}>&gt;</button>
        </div>
        <div className="calendar-tabs">
          <button onClick={() => setView('day')} className={view === 'day' ? 'active' : ''}>Day</button>
          <button onClick={() => setView('week')} className={view === 'week' ? 'active' : ''}>Week</button>
          <button disabled>Month</button>
        </div>
      </div>

      {view === 'day' && (
        <div className="day-grid">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="hour-block">
              <span className="hour-label">{i.toString().padStart(2, '0')}:00</span>
              <div className="hour-slot">
                {getTasksForSlot(date, i).map(task => (
                  <div key={task.id} className="calendar-task" onClick={() => setSelectedTask(task)}>
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'week' && (
        <div className="week-grid">
          <div className="week-header">
            <div className="corner" />
            {getWeekDays().map((day, i) => (
              <div key={i} className="day-col-label">
                {day.format('ddd D')}
              </div>
            ))}
          </div>

          <div className="week-body">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="hour-row">
                <div className="hour-label">{hour.toString().padStart(2, '0')}:00</div>
                {getWeekDays().map((day, dayIdx) => (
                  <div key={dayIdx} className="hour-slot">
                    {getTasksForSlot(day, hour).map(task => (
                      <div key={task.id} className="calendar-task" onClick={() => setSelectedTask(task)}>
                        {task.title}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onRefresh={fetchTasks}
        />
      )}
    </div>
  );
}
