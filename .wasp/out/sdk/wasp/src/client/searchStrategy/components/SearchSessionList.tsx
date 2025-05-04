import React from 'react';
import { Link } from 'react-router-dom';
import { SearchSession } from 'wasp/entities';

interface SearchSessionListProps {
  sessions: SearchSession[];
}

export function SearchSessionList({ sessions }: SearchSessionListProps) {
  if (sessions?.length === 0) {
    return <p className="col-span-full text-gray-500">No search sessions found. Create your first one!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions?.map(session => (
        <div key={session.id} className="border rounded p-4 hover:shadow-md">
          <h3 className="text-xl font-semibold">{session.name}</h3>
          {session.description && (
            <p className="text-gray-600 mt-2">{session.description}</p>
          )}
          <div className="mt-4 flex space-x-2">
            <Link 
              to={`/search-execution/${session.id}`}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
            >
              Execute
            </Link>
            <Link 
              to={`/results/${session.id}`}
              className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
            >
              Results
            </Link>
            <Link 
              to={`/review/${session.id}`}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
            >
              Review
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
} 