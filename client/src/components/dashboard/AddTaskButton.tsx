import React, { useState } from 'react';
import TaskModal from './TaskModal';

interface Props {
  onTaskCreated: () => void;
}

export default function AddTaskButton({ onTaskCreated }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        style={{
          backgroundColor: '#a1792b',
          color: 'white',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '1rem',
          border: 'none',
          cursor: 'pointer',
          position: 'absolute',
          top: '1.5rem',
          right: '2rem'
        }}
      >
        Add Task
      </button>
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onTaskCreated={onTaskCreated}
      />
    </>
  );
}
