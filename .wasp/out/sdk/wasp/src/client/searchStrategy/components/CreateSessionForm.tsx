import React, { useState } from 'react';

interface CreateSessionFormProps {
  onCreateSession: (name: string) => Promise<void>;
  onCancel: () => void;
}

export function CreateSessionForm({ onCreateSession, onCancel }: CreateSessionFormProps) {
  const [newSessionName, setNewSessionName] = useState('');

  const handleSubmit = async () => {
    if (!newSessionName.trim()) return;
    await onCreateSession(newSessionName);
    setNewSessionName('');
  };

  return (
    <div className="flex flex-col space-y-2 max-w-md">
      <input
        type="text"
        value={newSessionName}
        onChange={(e) => setNewSessionName(e.target.value)}
        placeholder="Session name"
        className="border p-2 rounded"
      />
      <div className="flex space-x-2">
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleSubmit}
        >
          Save
        </button>
        <button 
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => {
            setNewSessionName('');
            onCancel();
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 