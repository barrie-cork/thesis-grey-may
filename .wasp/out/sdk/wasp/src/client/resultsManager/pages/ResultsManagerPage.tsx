import React from 'react';
import { MainLayout } from '../../shared/components/MainLayout';
import { Link } from 'react-router-dom';
import { ResultsHeader } from '../components/ResultsHeader';
import { ResultProcessingSection } from '../components/ResultProcessingSection';
import { FilterControls } from '../components/FilterControls';
import { ResultsList } from '../components/ResultsList';
import { useResultsProcessing } from '../hooks/useResultsProcessing';
import { useResultsFiltering } from '../hooks/useResultsFiltering';
import { Box, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { TypedProcessedResult } from '../../../shared/interfaces/ProcessedResultTypes';

export function ResultsManagerPage() {
  const {
    sessionId,
    session,
    results,
    isLoadingSession,
    isLoadingResults,
    sessionError,
    resultsError,
    isProcessing,
    processingError,
    processResults
  } = useResultsProcessing();

  const {
    filters,
    setFilters,
    filteredResults,
    uniqueDomains,
    uniqueFileTypes,
    handleSearchChange,
    handleSortChange,
    toggleDomainFilter,
    toggleFileTypeFilter
  } = useResultsFiltering(results as TypedProcessedResult[] | undefined);

  if (isLoadingSession) {
    return (
      <MainLayout>
        <Box p={4}>
          <Spinner /> 
          <Text>Loading session...</Text>
        </Box>
      </MainLayout>
    );
  }

  if (sessionError) {
    return (
      <MainLayout>
        <Box p={4}>
          <Alert status="error" mb={4}>
            <AlertIcon />
            Error loading session: {sessionError.message}
          </Alert>
          <Link 
            to="/search-strategy" 
            style={{ color: 'blue', textDecoration: 'underline' }}
          >
            ← Back to Search Strategy
          </Link>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box maxWidth="1200px" mx="auto" p={4}>
        <ResultsHeader session={session} sessionId={sessionId ?? ''} />

        <ResultProcessingSection 
          onProcessResults={processResults}
          isProcessing={isProcessing}
          processingError={processingError}
        />

        <Box bg="white" borderRadius="lg" boxShadow="md" p={6}>
          <Text fontSize="xl" fontWeight="semibold" mb={6}>Processed Results</Text>
          
          <FilterControls
            filters={filters}
            handleSearchChange={handleSearchChange}
            handleSortChange={handleSortChange}
            toggleDomainFilter={toggleDomainFilter}
            toggleFileTypeFilter={toggleFileTypeFilter}
            uniqueDomains={uniqueDomains}
            uniqueFileTypes={uniqueFileTypes}
            setFilters={setFilters}
          />
          
          {isLoadingResults ? (
            <Box textAlign="center" py={8}>
              <Spinner />
              <Text mt={2}>Loading results...</Text>
            </Box>
          ) : resultsError ? (
            <Alert status="error" mt={4}>
              <AlertIcon />
              Error loading results: {resultsError.message}
            </Alert>
          ) : (
            <ResultsList
              results={filteredResults as TypedProcessedResult[]}
              onView={(result) => {
                console.log('Viewing result:', result);
                // Implement view functionality
              }}
            />
          )}
        </Box>
      </Box>
    </MainLayout>
  );
} 