import React from 'react';
import { Link } from 'react-router-dom';
import { SearchSession } from 'wasp/entities';

interface ResultsHeaderProps {
  session: SearchSession | undefined;
  sessionId: string;
}

export function ResultsHeader({ session, sessionId }: ResultsHeaderProps) {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold mb-1">{session?.name} - Results</h1>
        <p className="text-gray-600">{session?.description}</p>
      </div>
      <div className="flex space-x-3">
        <Link 
          to={`/search-execution/${sessionId}`}
          className="text-blue-600 hover:underline"
        >
          ← Back to Search Execution
        </Link>
        <Link 
          to={`/review/${sessionId}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Review Results →
        </Link>
      </div>
    </div>
  );
} 