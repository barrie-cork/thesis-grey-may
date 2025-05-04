import { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getSearchSessions, createSearchSession } from 'wasp/client/operations';

export function useSearchSessions() {
  const [isCreating, setIsCreating] = useState(false);
  
  const { 
    data: sessions, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(getSearchSessions);

  const handleCreateSession = async (name: string) => {
    if (!name.trim()) return;
    
    try {
      // This would be replaced with the actual createSearchSession action
      // await createSearchSession({ name });
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  };

  return {
    sessions,
    isLoading,
    error,
    isCreating,
    setIsCreating,
    createSession: handleCreateSession,
  };
} 