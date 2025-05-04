import { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getProcessedResults, getRawResults } from 'wasp/client/operations';
import { processSessionResults } from 'wasp/client/operations';
import { FilterCriteria } from '../components/ResultsFilter';

export function useResultsManager(sessionId: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSuccess, setProcessingSuccess] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({
    searchTerm: '',
    sourceFilter: [],
    dateRange: {
      from: '',
      to: ''
    },
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [filteredResults, setFilteredResults] = useState<any[]>([]);

  // Get raw search results
  const { 
    data: rawResults, 
    isLoading: isLoadingRaw, 
    error: rawError 
  } = useQuery(getRawResults, { sessionId });

  // Get processed results
  const { 
    data: processedResults, 
    isLoading: isLoadingProcessed, 
    error: processedError,
    refetch: refetchProcessed
  } = useQuery(getProcessedResults, { sessionId });

  // Apply filters to processed results
  useEffect(() => {
    if (!processedResults) return;

    let results = [...processedResults];

    // Apply search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      results = results.filter(
        result => result.title.toLowerCase().includes(term) || 
                 (result.snippet && result.snippet.toLowerCase().includes(term))
      );
    }

    // Apply source filter
    if (filters.sourceFilter.length > 0) {
      results = results.filter(result => {
        const engine = result.rawSearchResult?.searchEngine;
        return engine && filters.sourceFilter.includes(engine);
      });
    }

    // Apply date filters if available in metadata
    if (filters.dateRange.from || filters.dateRange.to) {
      results = results.filter(result => {
        const date = result.metadata.date;
        if (!date) return true;
        
        const resultDate = new Date(date);
        
        if (filters.dateRange.from) {
          const fromDate = new Date(filters.dateRange.from);
          if (resultDate < fromDate) return false;
        }
        
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          if (resultDate > toDate) return false;
        }
        
        return true;
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      results.sort((a, b) => {
        let valueA, valueB;
        
        switch (filters.sortBy) {
          case 'title':
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
            break;
          case 'date':
            valueA = a.metadata.date ? new Date(a.metadata.date).getTime() : 0;
            valueB = b.metadata.date ? new Date(b.metadata.date).getTime() : 0;
            break;
          case 'relevance':
          default:
            // For relevance, use the original rank from raw results
            valueA = a.rawSearchResult?.rank || 0;
            valueB = b.rawSearchResult?.rank || 0;
            // For relevance, lower rank means higher relevance
            return filters.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        }
        
        // For non-relevance fields
        if (filters.sortOrder === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      });
    }

    setFilteredResults(results);
  }, [processedResults, filters]);

  // Process raw results
  const processResults = async () => {
    if (!rawResults || rawResults.length === 0) {
      setProcessingError('No raw results to process');
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    setProcessingSuccess(false);

    try {
      await processSessionResults();
      await refetchProcessed();
      setProcessingSuccess(true);
    } catch (error) {
      setProcessingError(error instanceof Error ? error.message : 'An error occurred during processing');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    rawResults,
    processedResults,
    filteredResults,
    isLoadingRaw,
    isLoadingProcessed,
    rawError,
    processedError,
    filters,
    setFilters,
    isProcessing,
    processingError,
    processingSuccess,
    processResults
  };
} 