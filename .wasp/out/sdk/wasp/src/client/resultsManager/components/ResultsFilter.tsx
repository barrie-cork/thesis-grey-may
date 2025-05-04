import React, { useState } from 'react';

interface ResultsFilterProps {
  onFilter: (filters: FilterCriteria) => void;
}

export interface FilterCriteria {
  searchTerm: string;
  sourceFilter: string[];
  dateRange: {
    from: string;
    to: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function ResultsFilter({ onFilter }: ResultsFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sources = [
    { id: 'google', name: 'Google' },
    { id: 'bing', name: 'Bing' },
    { id: 'pubmed', name: 'PubMed' },
    { id: 'cochrane', name: 'Cochrane Library' },
    { id: 'who', name: 'WHO' },
    { id: 'nice', name: 'NICE' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' }
  ];

  const toggleSource = (sourceId: string) => {
    if (sourceFilter.includes(sourceId)) {
      setSourceFilter(sourceFilter.filter(id => id !== sourceId));
    } else {
      setSourceFilter([...sourceFilter, sourceId]);
    }
  };

  const handleApplyFilter = () => {
    onFilter({
      searchTerm,
      sourceFilter,
      dateRange: {
        from: dateFrom,
        to: dateTo
      },
      sortBy,
      sortOrder
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSourceFilter([]);
    setDateFrom('');
    setDateTo('');
    setSortBy('relevance');
    setSortOrder('desc');
    
    onFilter({
      searchTerm: '',
      sourceFilter: [],
      dateRange: {
        from: '',
        to: ''
      },
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Filter Results</h3>
      
      {/* Search Term */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Term
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter keywords..."
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      
      {/* Source Filters */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sources
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sources.map(source => (
            <div key={source.id} className="flex items-center">
              <input
                type="checkbox"
                id={`source-${source.id}`}
                checked={sourceFilter.includes(source.id)}
                onChange={() => toggleSource(source.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`source-${source.id}`} className="ml-2 text-sm text-gray-700">
                {source.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Date Range */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      {/* Sort Options */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleClearFilters}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Clear Filters
        </button>
        <button
          onClick={handleApplyFilter}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
} 