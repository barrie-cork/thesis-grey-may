import React from 'react';
import { TagsPanel } from '../components/TagsPanel';
import { ResultsPanel } from '../components/ResultsPanel';
import { useResultReview } from '../hooks/useResultReview';

export function ReviewPage() {
  const {
    sessionId,
    tags,
    results,
    pagination,
    isLoading,
    error,
    currentPage,
    selectedTagId,
    untaggedOnly,
    setSelectedTagId,
    setUntaggedOnly,
    createTag,
    assignTag,
    removeTag,
    addNote,
    onPageChange
  } = useResultReview();

  if (!sessionId) {
    return <div className="p-4 text-red-500">Session ID is required</div>;
  }
  
  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Review Results</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <TagsPanel
          tags={tags}
          selectedTagId={selectedTagId}
          untaggedOnly={untaggedOnly}
          onSelectTag={setSelectedTagId}
          onToggleUntaggedOnly={setUntaggedOnly}
          onCreateTag={createTag}
        />
        
        <ResultsPanel
          results={results}
          tags={tags}
          selectedTagId={selectedTagId}
          untaggedOnly={untaggedOnly}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onAssignTag={assignTag}
          onRemoveTag={removeTag}
          onAddNote={addNote}
        />
      </div>
    </div>
  );
} 