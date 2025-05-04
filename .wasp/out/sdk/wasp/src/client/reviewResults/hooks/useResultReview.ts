import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getReviewTags, getResultsWithTags } from 'wasp/client/operations';
import { createReviewTag, assignTag, createNote } from 'wasp/client/operations';
import { ProcessedResultWithTags, ReviewTag, PaginationInfo } from '../types';

export function useResultReview() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [untaggedOnly, setUntaggedOnly] = useState(false);
  
  // Fetch tags
  const tagsQuery = useQuery(getReviewTags, { 
    sessionId: sessionId! 
  });
  
  // Fetch results with tags
  const resultsQuery = useQuery(getResultsWithTags, {
    sessionId: sessionId!,
    tagId: selectedTagId,
    untaggedOnly,
    page: currentPage,
    limit: 10
  });

  const handleCreateTag = async (name: string, color: string) => {
    if (!name.trim()) {
      throw new Error('Tag name is required');
    }
    
    try {
      await createReviewTag();
      
      tagsQuery.refetch();
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  };
  
  const handleAssignTag = async (resultId: string, tagId: string) => {
    try {
      await assignTag();
      resultsQuery.refetch();
    } catch (error) {
      console.error('Failed to assign tag:', error);
      throw error;
    }
  };
  
  const handleRemoveTag = async (resultId: string, tagId: string) => {
    try {
      await assignTag();
      resultsQuery.refetch();
    } catch (error) {
      console.error('Failed to remove tag:', error);
      throw error;
    }
  };
  
  const handleAddNote = async (resultId: string, content: string) => {
    if (!content.trim()) {
      throw new Error('Note content is required');
    }
    
    try {
      await createNote();
      resultsQuery.refetch();
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  };
  
  const handlePageChange = (page: number) => {
    const pagination = resultsQuery.data?.pagination as PaginationInfo;
    if (page < 1 || (pagination && page > pagination.totalPages)) return;
    setCurrentPage(page);
  };

  return {
    sessionId,
    tags: tagsQuery.data as ReviewTag[] || [],
    results: (resultsQuery.data?.results as ProcessedResultWithTags[]) || [],
    pagination: (resultsQuery.data?.pagination as PaginationInfo) || { 
      totalCount: 0, 
      totalPages: 1, 
      currentPage: 1 
    },
    isLoading: tagsQuery.isLoading || resultsQuery.isLoading,
    error: tagsQuery.error || resultsQuery.error,
    currentPage,
    selectedTagId,
    untaggedOnly,
    setSelectedTagId,
    setUntaggedOnly,
    createTag: handleCreateTag,
    assignTag: handleAssignTag,
    removeTag: handleRemoveTag,
    addNote: handleAddNote,
    onPageChange: handlePageChange
  };
} 