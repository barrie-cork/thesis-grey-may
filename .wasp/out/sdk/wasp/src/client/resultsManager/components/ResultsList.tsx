import React, { useState } from 'react';
import { Box, Text, VStack, HStack, Badge, IconButton, Input, Select } from '@chakra-ui/react';
import { CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import { TypedProcessedResult, SortKey, ProcessedResultMetadata } from '../../../shared/interfaces/ProcessedResultTypes';

// Helper function to safely get string value
const safeString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  if (value) return String(value);
  return '';
};

interface ResultsListProps {
  results: TypedProcessedResult[];
  onInclude?: (id: string) => void;
  onExclude?: (id: string) => void;
  onView?: (result: TypedProcessedResult) => void;
}

export const ResultsList: React.FC<ResultsListProps> = ({ 
  results, 
  onInclude, 
  onExclude, 
  onView 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('title');

  const filteredResults = results.filter(result => {
    const metadata = result.metadata || {};
    const title = safeString(metadata.title);
    const abstract = safeString(metadata.abstract);
    const authors = safeString(metadata.authors);
    
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
      authors.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    const metadataA = a.metadata || {};
    const metadataB = b.metadata || {};

    if (sortBy === 'year') {
      const yearA = metadataA.year || 0;
      const yearB = metadataB.year || 0;
      return yearB - yearA; // Sort years in descending order
    }

    if (sortBy === 'authors') {
      const authorsA = safeString(metadataA.authors).toLowerCase();
      const authorsB = safeString(metadataB.authors).toLowerCase();
      return authorsA.localeCompare(authorsB);
    }

    if (sortBy === 'journal') {
      const journalA = safeString(metadataA.journal).toLowerCase();
      const journalB = safeString(metadataB.journal).toLowerCase();
      return journalA.localeCompare(journalB);
    }

    // Default sort by title
    const titleA = safeString(metadataA.title).toLowerCase();
    const titleB = safeString(metadataB.title).toLowerCase();
    return titleA.localeCompare(titleB);
  });

  return (
    <Box width="100%">
      <HStack spacing={4} mb={4}>
        <Input
          placeholder="Search results..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          flex={1}
        />
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          width="200px"
        >
          <option value="title">Sort by Title</option>
          <option value="authors">Sort by Authors</option>
          <option value="year">Sort by Year</option>
          <option value="journal">Sort by Journal</option>
        </Select>
      </HStack>

      <VStack spacing={3} align="stretch">
        {sortedResults.map((result) => {
          const metadata = result.metadata || {};
          return (
            <Box 
              key={result.id} 
              p={4} 
              borderWidth="1px" 
              borderRadius="md"
              _hover={{ 
                boxShadow: "sm", 
                cursor: onView ? "pointer" : "default" 
              }}
              onClick={() => onView && onView(result)}
            >
              <HStack justifyContent="space-between" alignItems="flex-start">
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="bold" fontSize="lg">
                    {metadata.title || 'Untitled'}
                  </Text>
                  
                  <HStack>
                    {metadata.authors && (
                      <Text fontSize="sm" color="gray.600">
                        {Array.isArray(metadata.authors) 
                          ? metadata.authors.join(', ') 
                          : metadata.authors}
                      </Text>
                    )}
                    
                    {metadata.year && (
                      <Text fontSize="sm" color="gray.600">
                        ({metadata.year})
                      </Text>
                    )}
                  </HStack>
                  
                  {metadata.journal && (
                    <Text fontSize="sm" fontStyle="italic" color="gray.600">
                      {metadata.journal}
                    </Text>
                  )}
                  
                  {metadata.abstract && (
                    <Text fontSize="sm" noOfLines={2} color="gray.700">
                      {metadata.abstract}
                    </Text>
                  )}
                  
                  <HStack spacing={2} mt={1}>
                    {result.status && (
                      <Badge colorScheme={
                        result.status === 'INCLUDED' ? 'green' : 
                        result.status === 'EXCLUDED' ? 'red' : 'gray'
                      }>
                        {result.status}
                      </Badge>
                    )}
                    
                    {metadata.doi && (
                      <Badge colorScheme="blue">DOI: {metadata.doi}</Badge>
                    )}
                    
                    <Text fontSize="xs" color="gray.500">
                      Imported: {format(new Date(result.createdAt), 'MMM d, yyyy')}
                    </Text>
                  </HStack>
                </VStack>
                
                <HStack>
                  {onInclude && (
                    <IconButton
                      aria-label="Include"
                      icon={<CheckIcon />}
                      colorScheme="green"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInclude(result.id);
                      }}
                    />
                  )}
                  
                  {onExclude && (
                    <IconButton
                      aria-label="Exclude"
                      icon={<CloseIcon />}
                      colorScheme="red"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExclude(result.id);
                      }}
                    />
                  )}
                  
                  {metadata.url && (
                    <IconButton
                      aria-label="Open URL"
                      icon={<ExternalLinkIcon />}
                      colorScheme="blue"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(metadata.url, '_blank');
                      }}
                    />
                  )}
                </HStack>
              </HStack>
            </Box>
          );
        })}
        
        {sortedResults.length === 0 && (
          <Box p={4} borderWidth="1px" borderRadius="md" textAlign="center">
            <Text>No results found</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}; 