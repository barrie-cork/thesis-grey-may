import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getSearchSessions, createSearchSession } from 'wasp/client/operations';
import { Button } from '../../shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../shared/components/ui/card';
import { Input } from '../../shared/components/ui/input';
import { SearchSessionList } from '../components/SearchSessionList';
import { MainLayout } from '../../shared/components/MainLayout';
import { Alert, AlertDescription, AlertTitle } from '../../shared/components/ui/alert';
import { Label } from '../../shared/components/ui/label';

export function SearchStrategyPage() {
  const { data: sessions, isLoading, error, refetch } = useQuery(getSearchSessions);
  const [isCreating, setIsCreating] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      setCreateError('Session name is required');
      return;
    }
    
    setIsSubmitting(true);
    setCreateError('');
    setCreateSuccess(false);

    try {
      await createSearchSession({
        name: newSessionName,
        description: newSessionDescription
      });
      
      setNewSessionName('');
      setNewSessionDescription('');
      setIsCreating(false);
      setCreateSuccess(true);
      refetch();
      
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error creating session:', err);
      setCreateError(err.message || 'Failed to create session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-muted-foreground">Loading search sessions...</span>
        </div>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout>
        <Alert variant="destructive">
          <AlertTitle>Error Loading Sessions</AlertTitle>
          <AlertDescription>
            {error.message || 'Could not load search sessions. Please try again later.'}
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Search Strategy Sessions</h1>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              New Search Session
            </Button>
          )}
        </div>
        
        {createSuccess && (
          <Alert variant="default" className="bg-green-50 border border-green-200 text-green-800">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>Search session created successfully!</AlertDescription>
          </Alert>
        )}
        
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Search Session</CardTitle>
              <CardDescription>
                Create a new session to organize your search queries and results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name">Session Name *</Label>
                  <Input
                    id="session-name"
                    placeholder="e.g., Fall Prevention in Elderly Patients"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-description">Description (optional)</Label>
                  <Input
                    id="session-description"
                    placeholder="e.g., Systematic search for guidelines on..."
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                
                {createError && (
                   <Alert variant="destructive">
                    <AlertTitle>Creation Failed</AlertTitle>
                    <AlertDescription>{createError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex space-x-2">
                  <Button onClick={handleCreateSession} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Session'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setNewSessionName('');
                      setNewSessionDescription('');
                      setCreateError('');
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <SearchSessionList sessions={sessions || []} />

      </div>
    </MainLayout>
  );
} 