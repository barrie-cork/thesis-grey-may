import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getSearchSession, getProcessedResults, processSessionResults } from 'wasp/client/operations';

export function useResultsProcessing() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Get session details
  const { 
    data: session, 
    isLoading: isLoadingSession, 
    error: sessionError 
  } = useQuery(getSearchSession, { id: sessionId });

  // Get processed results
  const { 
    data: results, 
    isLoading: isLoadingResults, 
    error: resultsError,
    refetch: refetchResults 
  } = useQuery(getProcessedResults, { sessionId });

  // Process raw results
  const handleProcessResults = async () => {
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      await processSessionResults();
      await refetchResults();
    } catch (error: any) {
      setProcessingError(error.message || 'Failed to process results');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    sessionId,
    session,
    results,
    isLoadingSession,
    isLoadingResults,
    sessionError,
    resultsError,
    isProcessing,
    processingError,
    processResults: handleProcessResults,
    refetchResults
  };
} 