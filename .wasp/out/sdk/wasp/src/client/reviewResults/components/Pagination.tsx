import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center mt-6">
      <nav className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-50'
          }`}
        >
          Previous
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => (
            page === 1 || 
            page === totalPages || 
            Math.abs(page - currentPage) <= 1
          ))
          .map((page, i, arr) => {
            // Add ellipsis if there are gaps
            if (i > 0 && page > arr[i - 1] + 1) {
              return (
                <React.Fragment key={`ellipsis-${page}`}>
                  <span className="px-3 py-1">...</span>
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            }
            
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-blue-50'
                }`}
              >
                {page}
              </button>
            );
          })}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-blue-500 hover:bg-blue-50'
          }`}
        >
          Next
        </button>
      </nav>
    </div>
  );
} 