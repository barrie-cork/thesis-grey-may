import React from 'react';
import { Badge } from '@chakra-ui/react';

type SearchExecutionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELED';

interface SearchExecutionStatusBadgeProps {
  status: SearchExecutionStatus;
}

export const SearchExecutionStatusBadge: React.FC<SearchExecutionStatusBadgeProps> = ({ status }) => {
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