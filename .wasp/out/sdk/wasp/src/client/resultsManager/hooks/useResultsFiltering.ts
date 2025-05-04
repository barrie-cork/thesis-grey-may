import { useState, useMemo } from 'react';
import { ProcessedResult } from 'wasp/entities';
import { TypedProcessedResult, ProcessedResultMetadata } from '../../../shared/interfaces/ProcessedResultTypes';

export interface FilterState {
  searchTerm: string;
  sortBy: 'relevance' | 'title' | 'date';
  sortOrder: 'asc' | 'desc';
  domains: string[];
  fileTypes: string[];
}

export function useResultsFiltering(results: TypedProcessedResult[] | undefined) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    sortBy: 'relevance',
    sortOrder: 'desc',
    domains: [],
    fileTypes: []
  });

  // Filter results
  const filteredResults = useMemo(() => {
    if (!results) return [];
    
    return results.filter(result => {
      // Get title from metadata or fallback to a default property
      const title = result.metadata?.title || '';
      const abstract = result.metadata?.abstract || '';
      
      // Search term filter
      if (filters.searchTerm && 
          !title.toString().toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
          !abstract.toString().toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      // Domain filter
      if (filters.domains.length > 0) {
        const domain = result.metadata?.domain || '';
        if (!filters.domains.includes(domain)) {
          return false;
        }
      }
      
      // File type filter
      if (filters.fileTypes.length > 0) {
        const fileType = result.metadata?.fileType || '';
        if (!filters.fileTypes.includes(fileType)) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by selected field
      if (filters.sortBy === 'title') {
        const titleA = (a.metadata?.title || '').toString();
        const titleB = (b.metadata?.title || '').toString();
        return filters.sortOrder === 'asc' 
          ? titleA.localeCompare(titleB) 
          : titleB.localeCompare(titleA);
      }
      
      // Sort by relevance score
      if (filters.sortBy === 'relevance') {
        const scoreA = a.metadata?.relevanceScore || 0;
        const scoreB = b.metadata?.relevanceScore || 0;
        return filters.sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      }
      
      // Default sort is by processed date
      const dateA = a.metadata?.processedAt 
        ? new Date(a.metadata.processedAt).getTime() 
        : new Date(a.createdAt).getTime();
      
      const dateB = b.metadata?.processedAt 
        ? new Date(b.metadata.processedAt).getTime() 
        : new Date(b.createdAt).getTime();
        
      return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [results, filters]);

  // Get unique domains and file types for filters
  const uniqueDomains = useMemo(() => {
    if (!results) return [];
    const domains = results.map(result => result.metadata?.domain || '').filter(Boolean);
    return [...new Set(domains)];
  }, [results]);

  const uniqueFileTypes = useMemo(() => {
    if (!results) return [];
    const fileTypes = results.map(result => result.metadata?.fileType || '').filter(Boolean);
    return [...new Set(fileTypes)];
  }, [results]);

  // Update filters
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    setFilters(prev => {
      // If clicking the same sort field, toggle order
      if (prev.sortBy === sortBy) {
        return { ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' };
      }
      // Otherwise, set the new sort field with default desc order
      return { ...prev, sortBy, sortOrder: 'desc' };
    });
  };

  const toggleDomainFilter = (domain: string) => {
    setFilters(prev => {
      const isSelected = prev.domains.includes(domain);
      return {
        ...prev,
        domains: isSelected 
          ? prev.domains.filter(d => d !== domain)
          : [...prev.domains, domain]
      };
    });
  };

  const toggleFileTypeFilter = (fileType: string) => {
    setFilters(prev => {
      const isSelected = prev.fileTypes.includes(fileType);
      return {
        ...prev,
        fileTypes: isSelected 
          ? prev.fileTypes.filter(ft => ft !== fileType)
          : [...prev.fileTypes, fileType]
      };
    });
  };

  return {
    filters,
    setFilters,
    filteredResults,
    uniqueDomains,
    uniqueFileTypes,
    handleSearchChange,
    handleSortChange,
    toggleDomainFilter,
    toggleFileTypeFilter
  };
} 