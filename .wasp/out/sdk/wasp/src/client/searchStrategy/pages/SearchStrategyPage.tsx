import React from 'react';
import { CreateSessionForm } from '../components/CreateSessionForm';
import { SearchSessionList } from '../components/SearchSessionList';
import { useSearchSessions } from '../hooks/useSearchSessions';

export function SearchStrategyPage() {
  const {
    sessions,
    isLoading,
    error,
    isCreating,
    setIsCreating,
    createSession
  } = useSearchSessions();
  
  if (isLoading) return <div className="p-4">Loading search sessions...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Search Strategy</h1>
      
      <div className="mb-6">
        {!isCreating ? (
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setIsCreating(true)}
          >
            Create New Session
          </button>
        ) : (
          <CreateSessionForm 
            onCreateSession={createSession}
            onCancel={() => setIsCreating(false)}
          />
        )}
      </div>
      
      <SearchSessionList sessions={sessions || []} />
    </div>
  );
} 