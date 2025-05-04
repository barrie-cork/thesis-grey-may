import { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { executeSearchQuery } from 'wasp/client/operations';
import { getSearchSession } from 'wasp/client/operations';

export function useSearchExecution(sessionId: string) {
  const [selectedEngines, setSelectedEngines] = useState<string[]>(['google']);
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionSuccess, setExecutionSuccess] = useState<boolean>(false);

  const { data: sessionData, isLoading, error } = useQuery(getSearchSession, { id: sessionId });
  const queries = sessionData?.searchQueries ?? [];

  const executeSearch = async () => {
    if (!selectedQueryId) {
      setExecutionError('Please select a query to execute');
      return;
    }

    setIsExecuting(true);
    setExecutionError(null);
    setExecutionSuccess(false);

    try {
      await executeSearchQuery();
      setExecutionSuccess(true);
    } catch (err: any) {
      setExecutionError(err?.message || 'An error occurred during search execution');
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    queries,
    isLoading,
    error,
    selectedQueryId,
    setSelectedQueryId,
    selectedEngines,
    setSelectedEngines,
    isExecuting,
    executionError,
    executionSuccess,
    executeSearch
  };
} 