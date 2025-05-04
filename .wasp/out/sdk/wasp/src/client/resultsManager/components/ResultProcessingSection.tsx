import React from 'react';

interface ResultProcessingSectionProps {
  onProcessResults: () => Promise<void>;
  isProcessing: boolean;
  processingError: string | null;
}

export function ResultProcessingSection({ 
  onProcessResults, 
  isProcessing, 
  processingError 
}: ResultProcessingSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Results Processing</h2>
        <button
          onClick={onProcessResults}
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Process Raw Results'}
        </button>
      </div>
      
      {processingError && (
        <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">
          {processingError}
        </div>
      )}
      
      <div className="p-4 bg-gray-50 rounded">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Processing Pipeline:</h3>
        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
          <li>Raw results retrieval from search API</li>
          <li>Result normalization and metadata extraction</li>
          <li>URL normalization for consistency</li>
          <li>Basic deduplication based on URL</li>
          <li>Storing processed results for review</li>
        </ol>
      </div>
    </div>
  );
} 