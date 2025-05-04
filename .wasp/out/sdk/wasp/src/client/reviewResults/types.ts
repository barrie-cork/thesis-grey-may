import { ProcessedResult, Note } from 'wasp/entities';

export interface ReviewTag {
  id: string;
  name: string;
  color: string;
  sessionId: string;
}

export interface TagAssignment {
  id: string;
  resultId: string;
  tagId: string;
  tag: ReviewTag;
}

export interface ProcessedResultWithTags extends ProcessedResult {
  reviewTags: TagAssignment[];
  notes: Note[];
}

export interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
} 