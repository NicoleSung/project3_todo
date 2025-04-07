import React, { useState } from 'react';
import AddTaskButton from '../components/dashboard/AddTaskButton';
import TodoList from '../components/dashboard/TodoList';

export default function Dashboard() {
  const [refresh, setRefresh] = useState(false);
  const triggerRefresh = () => setRefresh(!refresh);

  return (
    <div style={{ position: 'relative' }}>
      <AddTaskButton onTaskCreated={triggerRefresh} />
      <TodoList key={refresh.toString()} />
    </div>
  );
}
