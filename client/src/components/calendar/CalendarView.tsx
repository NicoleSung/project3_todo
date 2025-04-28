// import React, { useState, useEffect } from 'react';
// import './calendar.css';
// import dayjs from 'dayjs';
// import TaskDetailModal from './TaskDetailModal';
// import utc from 'dayjs/plugin/utc';
// dayjs.extend(utc);

// interface Task {
//   id: number;
//   task_title: string;
//   task_details: string;
//   scheduled_time?: string;
//   end_time?: string;
// }

// function getColorForTask(id: number): string {
//   const hue = (id * 2654435761) % 360;
//   return `hsl(${hue}, 70%, 75%)`;
// }

// export default function CalendarView() {
//   const [view, setView] = useState<'day' | 'week'>('day');
//   const [date, setDate] = useState(dayjs());
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);

//   const fetchTasks = async () => {
//     const res = await fetch('/api/tasks', { credentials: 'include' });
//     const data = await res.json();
//     setTasks(data);
//   };

//   useEffect(() => {
//     const initialize = async () => {
//       try {
//         const res = await fetch('/api/settings/view', { credentials: 'include' });
//         const settings = await res.json();
//         if (settings?.default_view === 'week' || settings?.default_view === 'day') {
//           setView(settings.default_view);
//         }
//       } catch (err) {
//         console.error('Failed to fetch default view:', err);
//       }

//       fetchTasks();
//     };

//     initialize();
//   }, []);

//   const handlePrev = () => setDate(prev => prev.subtract(1, view));
//   const handleNext = () => setDate(prev => prev.add(1, view));

//   const getWeekDays = () => {
//     const start = date.startOf('week');
//     return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
//   };

//   const getTasksForSlot = (day: dayjs.Dayjs, hour: number) => {
//     const slotStart = day.hour(hour).minute(0).second(0);
//     const slotEnd = slotStart.add(1, 'hour');

//     return tasks.filter(t => {
//       if (!t.scheduled_time) return false;
//       const start = dayjs(t.scheduled_time);
//       const end = t.end_time ? dayjs(t.end_time) : start.add(1, 'hour');
//       return start.isBefore(slotEnd) && end.isAfter(slotStart);
//     });
//   };

//   return (
//     <div className="calendar-container">
//       <div className="calendar-header">
//         <h2>Calendar</h2>
//         <div className="calendar-controls">
//           <div className="calendar-nav">
//             <button onClick={handlePrev}>&lt;</button>
//             <button onClick={() => setDate(dayjs())}>Today</button>
//             <button onClick={handleNext}>&gt;</button>
//           </div>
//           <div className="calendar-tabs">
//             <button onClick={() => setView('day')} className={view === 'day' ? 'active' : ''}>Day</button>
//             <button onClick={() => setView('week')} className={view === 'week' ? 'active' : ''}>Week</button>
//           </div>
//         </div>
//       </div>


//       {view === 'day' && (
//         <>
//           <div className="calendar-date-label">
//             {date.format('dddd - MMM D, YYYY')}
//           </div>
//           <div className="day-grid">
//             {Array.from({ length: 24 }, (_, i) => (
//               <div key={i} className="hour-block">
//                 <span className="hour-label">{i.toString().padStart(2, '0')}:00</span>
//                 <div className="hour-slot">
//                   {getTasksForSlot(date, i).map(task => {
//                     const start = dayjs(task.scheduled_time);
//                     const end = dayjs(task.end_time);
//                     const slotStart = date.hour(i).minute(0).second(0);
//                     const slotEnd = slotStart.add(1, 'hour');
//                     const actualStart = start.isBefore(slotStart) ? slotStart : start;
//                     const actualEnd = end.isAfter(slotEnd) ? slotEnd : end;
//                     const top = (actualStart.minute() / 60) * 100;
//                     const height = (actualEnd.diff(actualStart, 'minute') / 60) * 100;

//                     return (
//                       <div
//                         key={task.id}
//                         className="calendar-task"
//                         onClick={() => setSelectedTask(task)}
//                         style={{
//                           position: 'absolute',
//                           top: `${top}%`,
//                           height: `${height}%`,
//                           left: 0,
//                           right: 0,
//                           backgroundColor: getColorForTask(task.id)
//                         }}
//                       >
//                         {task.task_title}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       {view === 'week' && (
//         <>
//           <div className="week-header">
//             <div className="corner" />
//             {getWeekDays().map((day, i) => (
//               <div key={i} className="day-col-label">
//                 {day.format('ddd D')}
//               </div>
//             ))}
//           </div>
//           <div className="week-body">
//             {Array.from({ length: 24 }, (_, hour) => (
//               <div key={hour} className="hour-row">
//                 <div className="hour-label">{hour.toString().padStart(2, '0')}:00</div>
//                 {getWeekDays().map((day, dayIdx) => (
//                   <div key={dayIdx} className="hour-slot">
//                     {getTasksForSlot(day, hour).map(task => {
//                       const start = dayjs(task.scheduled_time);
//                       const end = dayjs(task.end_time);
//                       const slotStart = day.hour(hour).minute(0).second(0);
//                       const slotEnd = slotStart.add(1, 'hour');
//                       const actualStart = start.isBefore(slotStart) ? slotStart : start;
//                       const actualEnd = end.isAfter(slotEnd) ? slotEnd : end;
//                       const top = (actualStart.minute() / 60) * 100;
//                       const height = (actualEnd.diff(actualStart, 'minute') / 60) * 100;

//                       return (
//                         <div
//                           key={task.id}
//                           className="calendar-task"
//                           onClick={() => setSelectedTask(task)}
//                           style={{
//                             position: 'absolute',
//                             top: `${top}%`,
//                             height: `${height}%`,
//                             left: 0,
//                             right: 0,
//                             backgroundColor: getColorForTask(task.id)
//                           }}
//                         >
//                           {task.task_title}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       {selectedTask && (
//         <TaskDetailModal
//           task={selectedTask}
//           onClose={() => setSelectedTask(null)}
//           onRefresh={fetchTasks}
//         />
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import './calendar.css';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { apiFetch } from '../../utils/api';
import TaskDetailModal from './TaskDetailModal';

dayjs.extend(utc);

interface Task {
  id: string | number;
  task_title: string;
  task_details: string;
  scheduled_time?: string;
  end_time?: string;
}

function getColorForTask(id: number | string): string {
  const n = typeof id === 'number' ? id : parseInt(id as string, 10);
  const hue = (n * 2654435761) % 360;
  return `hsl(${hue}, 70%, 75%)`;
}

export default function CalendarView() {
  const [view, setView] = useState<'day' | 'week'>('day');
  const [date, setDate] = useState(dayjs());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/settings/view');
        if (res.ok) {
          const settings = await res.json();
          if (['day', 'week'].includes(settings.default_view)) {
            setView(settings.default_view);
          }
        }
      } catch (err) {
        console.error('Failed to fetch default view:', err);
      }
      fetchTasks();
    })();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await apiFetch('/api/tasks');
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const handlePrev = () => setDate(d => d.subtract(1, view));
  const handleNext = () => setDate(d => d.add(1, view));

  const getWeekDays = () => {
    const start = date.startOf('week');
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
  };

  const getTasksForSlot = (day: dayjs.Dayjs, hour: number) => {
    const slotStart = day.hour(hour).minute(0).second(0);
    const slotEnd = slotStart.add(1, 'hour');
    return tasks.filter(t => {
      if (!t.scheduled_time) return false;
      const start = dayjs(t.scheduled_time);
      const end = t.end_time ? dayjs(t.end_time) : start.add(1, 'hour');
      return start.isBefore(slotEnd) && end.isAfter(slotStart);
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>Calendar</h2>
        <div className="calendar-controls">
          <div className="calendar-nav">
            <button onClick={handlePrev}>&lt;</button>
            <button onClick={() => setDate(dayjs())}>Today</button>
            <button onClick={handleNext}>&gt;</button>
          </div>
          <div className="calendar-tabs">
            <button
              onClick={() => setView('day')}
              className={view === 'day' ? 'active' : ''}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={view === 'week' ? 'active' : ''}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {view === 'day' && (
        <>
          <div className="calendar-date-label">
            {date.format('dddd - MMM D, YYYY')}
          </div>
          <div className="day-grid">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="hour-block">
                <span className="hour-label">
                  {i.toString().padStart(2, '0')}:00
                </span>
                <div className="hour-slot">
                  {getTasksForSlot(date, i).map(task => {
                    const start = dayjs(task.scheduled_time!);
                    const end = task.end_time
                      ? dayjs(task.end_time)
                      : start.add(1, 'hour');
                    const slotStart = date.hour(i).minute(0);
                    const top =
                      (Math.max(0, start.diff(slotStart, 'minute')) / 60) * 100;
                    const height =
                      (Math.min(end.diff(start, 'minute'), 60) / 60) * 100;
                    return (
                      <div
                        key={task.id}
                        className="calendar-task"
                        onClick={() => setSelectedTask(task)}
                        style={{
                          position: 'absolute',
                          top: `${top}%`,
                          height: `${height}%`,
                          left: 0,
                          right: 0,
                          backgroundColor: getColorForTask(task.id),
                        }}
                      >
                        {task.task_title}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'week' && (
        <>
          <div className="week-header">
            <div className="corner" />
            {getWeekDays().map((d, i) => (
              <div key={i} className="day-col-label">
                {d.format('ddd D')}
              </div>
            ))}
          </div>
          <div className="week-body">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="hour-row">
                <div className="hour-label">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {getWeekDays().map((day, i) => (
                  <div key={i} className="hour-slot">
                    {getTasksForSlot(day, hour).map(task => {
                      const start = dayjs(task.scheduled_time!);
                      const end = task.end_time ? dayjs(task.end_time!) : start.add(1, 'hour');
                      const slotStart = day.hour(hour).minute(0);
                      const top =
                        (Math.max(0, start.diff(slotStart, 'minute')) / 60) * 100;
                      const height =
                        (Math.min(end.diff(start, 'minute'), 60) / 60) * 100;
                      return (
                        <div
                          key={task.id}
                          className="calendar-task"
                          onClick={() => setSelectedTask(task)}
                          style={{
                            position: 'absolute',
                            top: `${top}%`,
                            height: `${height}%`,
                            left: 0,
                            right: 0,
                            backgroundColor: getColorForTask(task.id),
                          }}
                        >
                          {task.task_title}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
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