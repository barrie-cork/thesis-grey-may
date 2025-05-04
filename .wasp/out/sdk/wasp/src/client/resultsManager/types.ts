import { type ProcessedResult } from 'wasp/entities';

export type SortKey = 'relevance' | 'title' | 'date';

export interface FilterState {
  searchTerm: string;
  sortBy: SortKey;
  sortOrder: 'asc' | 'desc';
  domains: string[];
  fileTypes: string[];
}

export interface ProcessedResultMetadata {
  processedAt?: string; // Assuming string based on usage, adjust if needed
  duplicateCount?: number;
  relevanceScore?: number;
  domain?: string;
  fileType?: string;
  source?: string;
  rawRank?: number;
  // Add other potential metadata fields here
} 