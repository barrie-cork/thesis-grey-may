# Component Organization in Thesis Grey

This document outlines the component organization structure implemented in the Thesis Grey project, following the principles of Vertical Slice Architecture (VSA).

## Overview

Thesis Grey organizes code by feature rather than by technical layer, with each feature containing its own set of pages, components, hooks, and utilities. This approach enhances code cohesion and makes the codebase easier to navigate and maintain.

## Directory Structure

Each feature follows a standardized internal structure:

```
feature/
├── pages/           # Page components that correspond to routes
├── components/      # UI components specific to this feature
├── hooks/           # Custom React hooks for this feature
└── utils/           # Utility functions specific to this feature
```

## Feature Modules

The application is organized into the following feature modules:

1. **auth**: Authentication and user profile management
   - Login, signup, and profile pages
   - Authentication-specific components

2. **searchStrategy**: Search session and query management
   - Session creation and management
   - Query building interface

3. **serpExecution**: Search execution against external APIs
   - Search execution interface
   - Progress tracking

4. **resultsManager**: Results processing and management
   - Results display and filtering
   - Duplicate detection

5. **reviewResults**: Review workflow with tagging
   - Tagging interface
   - Note-taking functionality

6. **reporting**: PRISMA flow diagrams and exports
   - Report generation
   - Data export functionality

Additionally, there is a `shared` directory for truly cross-cutting components:

```
shared/
└── components/      # Components used across multiple features
    └── MainLayout.tsx  # Main application layout
```

## Component Types

### Pages

Page components are the top-level components that correspond to routes defined in `main.wasp`. They:
- Focus on composition rather than implementation
- Use hooks for data fetching and state management
- Delegate UI rendering to smaller components

Example page component:
```tsx
// src/client/searchStrategy/pages/SearchStrategyPage.tsx
import React from 'react';
import { useQuery } from 'wasp/client/operations';
import { getSearchSessions } from 'wasp/client/operations';
import { SearchSessionsList } from '../components/SearchSessionsList';
import { CreateSessionForm } from '../components/CreateSessionForm';

export function SearchStrategyPage() {
  const [isCreating, setIsCreating] = React.useState(false);
  const { data: sessions, isLoading, error } = useQuery(getSearchSessions);
  
  if (isLoading) return <div>Loading sessions...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Search Strategy</h1>
      
      <div className="mb-6">
        {!isCreating ? (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create New Session
          </button>
        ) : (
          <CreateSessionForm 
            onSubmit={() => {
              setIsCreating(false);
              // Refetch sessions after creation
            }}
            onCancel={() => setIsCreating(false)}
          />
        )}
      </div>
      
      <SearchSessionsList sessions={sessions || []} />
    </div>
  );
}
```

### Components

Components are reusable UI elements specific to a feature. They:
- Encapsulate a specific piece of UI functionality
- Accept props for configuration
- Maintain their own internal state when needed

Example component:
```tsx
// src/client/auth/components/AuthFormWrapper.tsx
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthFormWrapperProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}

export function AuthFormWrapper({ title, subtitle, children }: AuthFormWrapperProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
```

Example usage in a page:
```tsx
// src/client/auth/pages/SignupPage.tsx
import React from 'react';
import { SignupForm } from 'wasp/client/auth';
import { Link } from 'react-router-dom';
import { AuthFormWrapper } from '../components/AuthFormWrapper';

export function SignupPage() {
  return (
    <AuthFormWrapper
      title="Create a new account"
      subtitle={
        <>
          Or{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            sign in to your existing account
          </Link>
        </>
      }
    >
      <SignupForm additionalFields={[]} />
    </AuthFormWrapper>
  );
}
```

### Hooks

Custom hooks encapsulate reusable logic specific to a feature. They:
- Abstract away data fetching, state management, and side effects
- Return data and functions for use by components
- Follow the React hooks naming convention (use*)

Example hook:
```tsx
// src/client/searchStrategy/hooks/useCreateSearchSession.ts
import { useState } from 'react';
import { createSearchSession } from 'wasp/client/operations';
import { useQuery } from 'wasp/client/operations';
import { getSearchSessions } from 'wasp/client/operations';

export function useCreateSearchSession() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { refetch } = useQuery(getSearchSessions);

  const handleCreateSession = async (name: string, description?: string) => {
    if (!name.trim()) {
      setError('Session name is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await createSearchSession({ name, description });
      await refetch();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createSession: handleCreateSession,
    isSubmitting,
    error
  };
}
```

### Utils

Utility functions provide helper methods for common tasks within a feature:

```typescript
// src/client/searchStrategy/utils/queryFormatter.ts
export function formatQueryString(query: string, options: { 
  includeFiletypes?: string[],
  excludeDomains?: string[]
} = {}): string {
  let formattedQuery = query.trim();
  
  // Add filetype restrictions
  if (options.includeFiletypes?.length) {
    const filetypes = options.includeFiletypes.join(' OR filetype:');
    formattedQuery += ` filetype:${filetypes}`;
  }
  
  // Add domain exclusions
  if (options.excludeDomains?.length) {
    options.excludeDomains.forEach(domain => {
      formattedQuery += ` -site:${domain}`;
    });
  }
  
  return formattedQuery;
}
```

## Component Composition

Components are composed in a hierarchical manner:

1. **Pages**: Top-level components tied to routes
2. **Feature Components**: Encapsulate feature-specific UI
3. **Shared Components**: Common UI elements used across features

Example of component composition:
```tsx
// src/client/reviewResults/pages/ReviewPage.tsx
import React from 'react';
import { useQuery } from 'wasp/client/operations';
import { getResultsWithTags } from 'wasp/client/operations';
import { ResultsList } from '../components/ResultsList';
import { TagFilter } from '../components/TagFilter';
import { MainLayout } from '../../shared/components/MainLayout';

export function ReviewPage() {
  const [selectedTagId, setSelectedTagId] = React.useState<string | null>(null);
  
  const { data: results, isLoading } = useQuery(getResultsWithTags, {
    tagId: selectedTagId
  });
  
  return (
    <MainLayout title="Review Results">
      <div className="flex space-x-4">
        <div className="w-1/4">
          <TagFilter 
            selectedTagId={selectedTagId} 
            onSelectTag={setSelectedTagId}
          />
        </div>
        <div className="w-3/4">
          <ResultsList 
            results={results || []} 
            isLoading={isLoading}
          />
        </div>
      </div>
    </MainLayout>
  );
}
```

## Best Practices

### Do
- Keep components focused on a single responsibility
- Use custom hooks to encapsulate data fetching and logic
- Prefer composition over inheritance
- Keep UI components decoupled from data fetching
- Use typed props for component interfaces

### Avoid
- Creating large, monolithic components
- Direct API calls in UI components
- Cross-feature dependencies
- Duplicated logic across features
- Deep component nesting

## Communication Between Components

- **Props**: Primary way of passing data down the component tree
- **Context**: For data needed by many components in a subtree
- **Custom Hooks**: For shared state and side effects
- **Query Client**: For sharing server state

Example of using context for feature-level state:
```tsx
// src/client/searchStrategy/context/SessionContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { SearchSession } from 'wasp/entities';

interface SessionContextType {
  currentSession: SearchSession | null;
  setCurrentSession: (session: SearchSession | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<SearchSession | null>(null);
  
  return (
    <SessionContext.Provider value={{ currentSession, setCurrentSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
``` 