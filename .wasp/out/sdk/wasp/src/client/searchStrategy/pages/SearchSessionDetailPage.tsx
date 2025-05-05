import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getSearchSession } from 'wasp/client/operations';
import { MainLayout } from '../../shared/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../shared/components/ui/alert';
import { ArrowLeft } from 'lucide-react'; // Using lucide-react for icons

export function SearchSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) {
    // This should ideally not happen if the route is matched correctly
    return (
      <MainLayout>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Session ID is missing.</AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  const { data: session, isLoading, error } = useQuery(
    getSearchSession,
    { sessionId }, 
    { enabled: !!sessionId } // Only run the query if sessionId is available
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-muted-foreground">Loading session details...</span>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="mb-4">
            <Button variant="outline" size="sm" asChild>
                <Link to="/search-strategy">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sessions
                </Link>
            </Button>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Error Loading Session</AlertTitle>
          <AlertDescription>
            {error.message || 'Could not load the search session. It might not exist or you may not have access.'}
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  if (!session) {
    // This case handles if the query ran successfully but returned null/undefined (e.g., not found)
     return (
      <MainLayout>
         <div className="mb-4">
            <Button variant="outline" size="sm" asChild>
                <Link to="/search-strategy">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sessions
                </Link>
            </Button>
        </div>
        <Alert variant="destructive">
          <AlertTitle>Session Not Found</AlertTitle>
          <AlertDescription>
            The requested search session could not be found.
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <div className="mb-4">
            <Button variant="outline" size="sm" asChild>
                <Link to="/search-strategy">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sessions
                </Link>
            </Button>
        </div>

        {/* Session Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{session.name}</CardTitle>
            {session.description && (
              <CardDescription className="text-base mt-1">{session.description}</CardDescription>
            )}
          </CardHeader>
        </Card>

        {/* Query List Area (Placeholder) */}
        <Card>
           <CardHeader>
             <CardTitle>Search Queries</CardTitle>
             <CardDescription>Manage the search queries for this session.</CardDescription>
           </CardHeader>
           <CardContent>
             <p className="text-muted-foreground">
               (Query list and query builder components will go here - Subtasks 4, 5, 6, 8, 9, 10)
             </p>
             {/* Display existing queries (placeholder) */}
             {session.searchQueries && session.searchQueries.length > 0 ? (
               <ul className="mt-4 space-y-2">
                 {session.searchQueries.map(query => (
                   <li key={query.id} className="text-sm p-2 border rounded bg-muted/50">
                     {query.description || `Query created at ${new Date(query.createdAt).toLocaleString()}`}
                     <pre className="mt-1 text-xs overflow-x-auto bg-background p-1 rounded">{query.query}</pre>
                   </li>
                 ))}
               </ul>
             ) : (
               <p className="mt-4 text-muted-foreground italic">No queries added yet.</p>
             )}
             {/* TODO: Add SearchQueryForm component here */}
           </CardContent>
        </Card>

      </div>
    </MainLayout>
  );
} 