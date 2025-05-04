import React from 'react';
import { Box, Heading, Text, VStack, Tag, HStack } from '@chakra-ui/react';
import { format } from 'date-fns';

// This assumes your SearchSession entity has similar properties
interface SearchSession {
  id: string;
  name: string;
  description?: string;
  createdAt: Date | string;
  searchQueries?: Array<{
    id: string;
    query: string;
    description?: string;
  }>;
}

interface SearchSessionSummaryProps {
  searchSession: SearchSession;
}

export const SearchSessionSummary: React.FC<SearchSessionSummaryProps> = ({ 
  searchSession 
}) => {
  return (
    <VStack align="start" spacing={3}>
      <Box>
        <Heading size="sm" mb={1}>Name</Heading>
        <Text>{searchSession.name}</Text>
      </Box>
      
      {searchSession.description && (
        <Box>
          <Heading size="sm" mb={1}>Description</Heading>
          <Text>{searchSession.description}</Text>
        </Box>
      )}
      
      <Box>
        <Heading size="sm" mb={1}>Created</Heading>
        <Text>{format(new Date(searchSession.createdAt), 'PPP')}</Text>
      </Box>
      
      {searchSession.searchQueries && searchSession.searchQueries.length > 0 && (
        <Box width="100%">
          <Heading size="sm" mb={2}>Queries</Heading>
          <VStack align="start" spacing={2}>
            {searchSession.searchQueries.map(query => (
              <Box 
                key={query.id} 
                p={3} 
                borderWidth="1px" 
                borderRadius="md" 
                width="100%"
              >
                <HStack mb={1}>
                  <Tag size="sm" colorScheme="blue">Query</Tag>
                  {query.description && (
                    <Text fontSize="sm" fontWeight="medium">{query.description}</Text>
                  )}
                </HStack>
                <Text fontFamily="mono" fontSize="sm">{query.query}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </VStack>
  );
}; 