import React from 'react';
import { FilterState } from '../types';

interface FilterControlsProps {
  filters: FilterState;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSortChange: (sortBy: FilterState['sortBy']) => void;
  toggleDomainFilter: (domain: string) => void;
  toggleFileTypeFilter: (fileType: string) => void;
  uniqueDomains: string[];
  uniqueFileTypes: string[];
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export function FilterControls({
  filters,
  handleSearchChange,
  handleSortChange,
  toggleDomainFilter,
  toggleFileTypeFilter,
  uniqueDomains,
  uniqueFileTypes,
  setFilters
}: FilterControlsProps) {
  return (
    <>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search filter */}
        <div className="col-span-3 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Results
          </label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={handleSearchChange}
            placeholder="Search within results..."
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        {/* Sort selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => handleSortChange('relevance')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md ${
                filters.sortBy === 'relevance' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Relevance
            </button>
            <button
              onClick={() => handleSortChange('title')}
              className={`px-3 py-2 text-sm font-medium ${
                filters.sortBy === 'title' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Title
            </button>
            <button
              onClick={() => handleSortChange('date')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md ${
                filters.sortBy === 'date' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Date
            </button>
          </div>
        </div>
      </div>
      
      {/* Filter pills */}
      {(filters.domains.length > 0 || filters.fileTypes.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.domains.map(domain => (
            <span 
              key={domain}
              onClick={() => toggleDomainFilter(domain)}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md flex items-center cursor-pointer"
            >
              {domain}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </span>
          ))}
          
          {filters.fileTypes.map(fileType => (
            <span 
              key={fileType}
              onClick={() => toggleFileTypeFilter(fileType)}
              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md flex items-center cursor-pointer"
            >
              .{fileType}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </span>
          ))}
          
          <span 
            onClick={() => setFilters(prev => ({ ...prev, domains: [], fileTypes: [] }))}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-md flex items-center cursor-pointer"
          >
            Clear All
          </span>
        </div>
      )}
      
      {/* Filter sidebar */}
      {(uniqueDomains.length > 0 || uniqueFileTypes.length > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uniqueDomains.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Domain</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {uniqueDomains.map(domain => (
                    <label key={domain} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={filters.domains.includes(domain)}
                        onChange={() => toggleDomainFilter(domain)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">{domain}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {uniqueFileTypes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by File Type</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {uniqueFileTypes.map(fileType => (
                    <label key={fileType} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={filters.fileTypes.includes(fileType)}
                        onChange={() => toggleFileTypeFilter(fileType)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">.{fileType}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 