import React, { useState } from 'react';
import { Box, Heading, VStack, HStack, Button, Text, Alert, AlertIcon, useToast, Progress } from '@chakra-ui/react';
import { useParams, Link } from 'react-router-dom';
import { TypedProcessedResult } from '../../../shared/interfaces/ProcessedResultTypes';
import { ResultsList } from '../../resultsManager/components/ResultsList';
import { Badge } from '@chakra-ui/react';

// Define execution status type
type ExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELED';

// Define a minimal SearchExecutionStatusBadge component directly here
const SearchExecutionStatusBadge = ({ status }: { status: ExecutionStatus }) => {
  let colorScheme: string;
  
  switch (status) {
    case 'PENDING':
      colorScheme = 'gray';
      break;
    case 'RUNNING':
      colorScheme = 'blue';
      break;
    case 'COMPLETED':
      colorScheme = 'green';
      break;
    case 'FAILED':
      colorScheme = 'red';
      break;
    case 'CANCELED':
      colorScheme = 'orange';
      break;
    default:
      colorScheme = 'gray';
  }
  
  return (
    <Badge colorScheme={colorScheme}>
      {status}
    </Badge>
  );
};

// Minimal SearchSessionSummary component
const SearchSessionSummary = ({ searchSession }: { searchSession: any }) => {
  return (
    <Box>
      <Text fontWeight="bold">{searchSession.name}</Text>
      {searchSession.description && (
        <Text>{searchSession.description}</Text>
      )}
    </Box>
  );
};

export function SearchExecutionPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [results, setResults] = useState<TypedProcessedResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock data for UI development
  const mockExecution = {
    id: id || 'mock-id',
    status: 'PENDING' as ExecutionStatus,
    searchSessionId: 'mock-session-id',
    processedResults: [] as TypedProcessedResult[],
    searchSession: {
      id: 'mock-session-id',
      name: 'Mock Search Session',
      description: 'This is a mock session for UI development',
      createdAt: new Date().toISOString()
    }
  };

  const handleStartExecution = async () => {
    if (!id) return;
    
    setIsExecuting(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsExecuting(false);
          toast({
            title: "Search completed",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          return 100;
        }
        return newProgress;
      });
    }, 1000);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  };

  // For now, we'll use the mock data
  const execution = mockExecution;

  return (
    <Box p={5}>
      <VStack spacing={5} align="stretch">
        <HStack justifyContent="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Search Execution</Heading>
            <HStack>
              <Text>Status:</Text>
              <SearchExecutionStatusBadge status={execution.status} />
            </HStack>
          </VStack>
          
          <HStack>
            <Button
              colorScheme="blue"
              onClick={handleStartExecution}
              isLoading={isExecuting}
              isDisabled={isExecuting || execution.status === 'COMPLETED'}
            >
              {execution.status === 'PENDING' ? 'Start Execution' : 'Resume Execution'}
            </Button>
            
            <Button 
              as={Link} 
              to={`/search-sessions/${execution.searchSessionId}`}
              variant="outline"
            >
              Back to Session
            </Button>
          </HStack>
        </HStack>
        
        {execution.searchSession && (
          <Box borderWidth="1px" borderRadius="md" p={4}>
            <Heading size="md" mb={3}>Search Strategy</Heading>
            <SearchSessionSummary searchSession={execution.searchSession} />
          </Box>
        )}
        
        {isExecuting && (
          <Box>
            <Text mb={2}>Execution Progress: {progress}%</Text>
            <Progress value={progress} colorScheme="blue" height="8px" borderRadius="md" />
          </Box>
        )}
        
        <Box>
          <Heading size="md" mb={3}>Results ({results.length})</Heading>
          <ResultsList 
            results={results}
            onView={(result) => {
              console.log('View result:', result);
            }}
          />
        </Box>
      </VStack>
    </Box>
  );
} 