import React, { useState } from 'react';
import TaskModal from './TaskModal';

interface Props {
  onTaskUpdated: () => void;
}

export default function AddTaskButton({ onTaskUpdated }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
      >
        Add Task
      </button>
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onTaskUpdated={onTaskUpdated}
      />
    </>
  );
}
