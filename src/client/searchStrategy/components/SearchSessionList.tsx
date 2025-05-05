import React from 'react';
import { type SearchSession } from 'wasp/entities';
import { type getSearchSessions } from 'wasp/client/operations';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Link } from 'react-router-dom';

// Infer the type of a single session from the query return type
type SessionType = NonNullable<Awaited<ReturnType<typeof getSearchSessions>>>[number];

interface SearchSessionListProps {
  sessions: SessionType[];
}

export function SearchSessionList({ sessions }: SearchSessionListProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            You haven't created any search sessions yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <Card key={session.id} className="hover:shadow-md transition flex flex-col">
          <CardHeader>
            <CardTitle>{session.name}</CardTitle>
            {session.description && (
              <CardDescription>{session.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex-grow">
            <dl className="text-sm text-muted-foreground space-y-1">
              <div>
                <dt className="inline font-medium text-gray-600">Created:</dt>
                <dd className="inline ml-1">{new Date(session.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-600">Queries:</dt>
                <dd className="inline ml-1">{session._count.searchQueries}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-600">Results:</dt>
                <dd className="inline ml-1">{session._count.processedResults}</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter className="flex justify-end">
            {/* Link to detail page (implement later in Subtask 14) */}
            <Button variant="link" asChild>
              {/* Update path when detail route is added */}
              {/* <Link to={`/search-session/${session.id}`}> */}
              <Link to={`#`} onClick={(e) => e.preventDefault()} className="cursor-not-allowed">
                View Details
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 