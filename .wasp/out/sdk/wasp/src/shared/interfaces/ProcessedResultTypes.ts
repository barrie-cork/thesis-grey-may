import type { ProcessedResult } from 'wasp/entities';

export interface ProcessedResultMetadata {
  title?: string;
  abstract?: string;
  authors?: string[];
  year?: number;
  doi?: string;
  url?: string;
  journal?: string;
  relevanceScore?: number;
  processedAt?: string | Date;
  duplicateCount?: number;
  domain?: string;
  fileType?: string;
  [key: string]: any; // Allow for additional metadata properties
}

export type SortKey = 'title' | 'authors' | 'year' | 'journal';

// Extend ProcessedResult with properly typed metadata
export interface TypedProcessedResult extends Omit<ProcessedResult, 'metadata'> {
  id: string;
  metadata: ProcessedResultMetadata;
  status?: 'PENDING' | 'INCLUDED' | 'EXCLUDED' | 'REVIEWED';
  createdAt: string | Date;
} 