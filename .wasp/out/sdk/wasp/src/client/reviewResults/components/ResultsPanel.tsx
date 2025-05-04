import React from 'react';
import { ResultItem } from './ResultItem';
import { Pagination } from './Pagination';
import { ProcessedResultWithTags, ReviewTag, PaginationInfo } from '../types';

interface ResultsPanelProps {
  results: ProcessedResultWithTags[];
  tags: ReviewTag[];
  selectedTagId: string | null;
  untaggedOnly: boolean;
  pagination: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  onAssignTag: (resultId: string, tagId: string) => Promise<void>;
  onRemoveTag: (resultId: string, tagId: string) => Promise<void>;
  onAddNote: (resultId: string, content: string) => Promise<void>;
}

export function ResultsPanel({
  results,
  tags,
  selectedTagId,
  untaggedOnly,
  pagination,
  currentPage,
  onPageChange,
  onAssignTag,
  onRemoveTag,
  onAddNote
}: ResultsPanelProps) {
  const selectedTag = selectedTagId ? tags.find(t => t.id === selectedTagId) : null;

  return (
    <div className="md:col-span-3 bg-white shadow rounded p-4">
      <h2 className="text-xl font-semibold mb-4">
        {untaggedOnly ? 'Untagged Results' : 
          selectedTagId ? `Results Tagged with ${selectedTag?.name}` : 
          'All Results'}
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({pagination.totalCount} results)
        </span>
      </h2>
      
      {results.length === 0 ? (
        <div className="text-gray-500 py-8 text-center">
          No results found matching the current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(result => (
            <ResultItem
              key={result.id}
              result={result}
              tags={tags}
              onAssignTag={onAssignTag}
              onRemoveTag={onRemoveTag}
              onAddNote={onAddNote}
            />
          ))}
          
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
} 