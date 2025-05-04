# Feature Implementation Details

This document provides an overview of how each core feature of Thesis Grey is implemented using the Wasp framework.

## 1. Authentication Feature

The authentication feature is implemented using Wasp v0.16.0's built-in authentication system.

### Configuration in main.wasp
```wasp
auth: {
  userEntity: User, // References the User entity in schema.prisma
  methods: {
    usernameAndPassword: {
      userSignupFields: import { userSignupFields } from "@src/server/auth/userSignupFields.ts"
    }
  },
  onAuthFailedRedirectTo: "/login",
  onBeforeSignup: import { onBeforeSignup } from "@src/server/auth/hooks.ts",
}

route LoginRoute { path: "/login", to: LoginPage }
route SignupRoute { path: "/signup", to: SignupPage }
route ProfileRoute { path: "/profile", to: ProfilePage }

page LoginPage {
  component: import { LoginPage } from "@src/client/auth/pages/LoginPage"
}

page SignupPage {
  component: import { SignupPage } from "@src/client/auth/pages/SignupPage"
}

page ProfilePage {
  authRequired: true,
  component: import { ProfilePage } from "@src/client/auth/pages/ProfilePage"
}
```

### Custom Field Handling

Wasp v0.16.0 handles custom user fields during registration using `userSignupFields`:

```typescript
// src/server/auth/userSignupFields.ts
import { UserSignupFields } from 'wasp/auth/providers/types';

export const userSignupFields: UserSignupFields = {
  username: async (data: any) => {
    // Ensure username exists
    if (!data.username) {
      throw new Error('Username is required');
    }
    return data.username;
  }
};
```

The `onBeforeSignup` hook performs validation or preliminary checks:

```typescript
// src/server/auth/hooks.ts
import { OnBeforeSignupHook } from 'wasp/server/auth';

export const onBeforeSignup: OnBeforeSignupHook = async ({ providerId, req, prisma }) => {
  // Validation or preliminary checks
  console.log('Signup request received for provider ID:', providerId);
  
  // No return value needed (void)
};
```

### Client Implementation
The client-side implementation uses Wasp's pre-built components and hooks:

```tsx
// LoginPage.tsx
import React from 'react';
import { LoginForm } from 'wasp/client/auth';
import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

// SignupPage.tsx
import React from 'react';
import { SignupForm } from 'wasp/client/auth';
import { Link } from 'react-router-dom';

export function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <div className="mt-8">
          <SignupForm additionalFields={[]} />
        </div>
      </div>
    </div>
  );
}

// ProfilePage.tsx - Using useAuth hook
import React from 'react';
import { useAuth, logout } from 'wasp/client/auth';

export function ProfilePage() {
  const { data: user } = useAuth();
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      <div className="mb-4">
        <p className="text-gray-700 mb-2"><strong>Username:</strong> {user?.username}</p>
        <p className="text-gray-700 mb-2"><strong>Email:</strong> {user?.email}</p>
      </div>
      <button 
        onClick={logout}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
```

### Authorization in Operations
Authorization is enforced in every operation using the `satisfies` operator for type-safety:

```typescript
// Example from a query in src/server/searchStrategy/queries.js
import { HttpError } from 'wasp/server';
import { type GetSearchSession } from 'wasp/server/operations';

export const getSearchSession = (async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  try {
    const session = await context.entities.SearchSession.findFirst({
      where: {
        id: args.id,
        userId: context.user.id
      }
    });

    if (!session) {
      throw new HttpError(404, "Search session not found or access denied");
    }

    return session;
  } catch (error) {
    // Re-throw HttpError instances
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error('Error fetching search session:', error);
    throw new HttpError(500, 'Failed to fetch search session');
  }
}) satisfies GetSearchSession;
```

## 2. Search Strategy Builder

The search strategy builder allows users to create and manage search sessions and queries.

### Configuration in main.wasp
```wasp
route SearchStrategyRoute { path: "/", to: SearchStrategyPage }
page SearchStrategyPage {
  component: import { SearchStrategyPage } from "@src/client/searchStrategy/pages/SearchStrategyPage",
  authRequired: true
}

query getSearchSessions {
  fn: import { getSearchSessions } from "@src/server/searchStrategy/queries.js",
  entities: [User, SearchSession, SearchQuery, ProcessedResult]
}

action createSearchSession {
  fn: import { createSearchSession } from "@src/server/searchStrategy/actions.js",
  entities: [User, SearchSession]
}

query getSearchSession {
  fn: import { getSearchSession } from "@src/server/searchStrategy/queries.js",
  entities: [User, SearchSession, SearchQuery, ProcessedResult]
}

action createSearchQuery {
  fn: import { createSearchQuery } from "@src/server/searchStrategy/actions.js",
  entities: [User, SearchSession, SearchQuery]
}

action updateSearchQuery {
  fn: import { updateSearchQuery } from "@src/server/searchStrategy/actions.js",
  entities: [User, SearchSession, SearchQuery]
}
```

### Search Session Query Implementation

```typescript
// src/server/searchStrategy/queries.js
import { HttpError } from 'wasp/server';
import { type GetSearchSessions } from 'wasp/server/operations';

export const getSearchSessions = (async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  // Query structure for Phase 1 - simplified
  const whereClause = { userId: context.user.id };
  
  try {
    const sessions = await context.entities.SearchSession.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            searchQueries: true,
            processedResults: true
          }
        }
      }
    });

    return sessions;
  } catch (error) {
    console.error('Error fetching search sessions:', error);
    throw new HttpError(500, 'Failed to fetch search sessions');
  }
}) satisfies GetSearchSessions;
```

### Implementation Highlights

1. **Session Management**
   - User-specific sessions
   - CRUD operations with automatic authorization checks

2. **Query Building**
   - PICO framework support (Population, Interest, Context)
   - Query preview functionality
   - Domain and file type filtering

3. **Client Implementation**
   ```tsx
   // Using Wasp's query hooks
   import { useQuery } from 'wasp/client/operations';
   
   function SearchSessionsList() {
     const { data: sessions, isLoading, error } = useQuery(getSearchSessions);
     
     if (isLoading) return <p>Loading...</p>;
     if (error) return <p>Error: {error.message}</p>;
     
     return (
       <ul>
         {sessions?.map(session => (
           <li key={session.id}>{session.name}</li>
         ))}
       </ul>
     );
   }
   
   // Creating a session
   const handleCreateSession = async () => {
     try {
       await createSearchSession({ name: sessionName, description });
       // Refetch sessions after creation
     } catch (error) {
       console.error("Failed to create session:", error);
     }
   };
   ```

## 3. SERP Execution

The SERP execution feature handles the running of search queries against external APIs.

### Configuration in main.wasp
```wasp
route SearchExecutionRoute { path: "/execute-search", to: SearchExecutionPage }
page SearchExecutionPage {
  component: import { SearchExecutionPage } from "@src/client/serpExecution/pages/SearchExecutionPage",
  authRequired: true
}

action executeSearchQuery {
  fn: import { executeSearchQuery } from "@src/server/serpExecution/actions.js",
  entities: [User, SearchQuery, SearchSession, SearchExecution, RawSearchResult]
}
```

### Implementation Highlights

1. **Query Execution**
   - Integration with Google Search API via Serper
   - Asynchronous execution to handle long-running operations
   - Progress tracking

2. **Error Handling**
   - Robust error handling for API failures
   - Status updates for failed executions

3. **Server Implementation**
   ```typescript
   // In src/server/serpExecution/actions.js
   import { HttpError } from 'wasp/server';
   import { type ExecuteSearchQuery } from 'wasp/server/operations';

   export const executeSearchQuery = (async (args, context) => {
     if (!context.user) {
       throw new HttpError(401, 'Not authorized');
     }

     try {
       // Fetch the query
       const query = await context.entities.SearchQuery.findUnique({
         where: { id: args.queryId },
         include: { searchSession: true }
       });
       
       if (!query) {
         throw new HttpError(404, 'Query not found');
       }
       
       // Authorization check
       if (query.searchSession.userId !== context.user.id) {
         throw new HttpError(403, 'Not authorized to execute this query');
       }
       
       // Create execution record
       const execution = await context.entities.SearchExecution.create({
         data: {
           queryId: query.id,
           sessionId: query.sessionId,
           status: 'running',
           startTime: new Date()
         }
       });
       
       // Start execution (could be implemented as a background job)
       // This is a simplified example
       executeSearchInBackground(context.entities, execution.id, query, args.maxResults || 100);
       
       return {
         executionId: execution.id,
         status: 'running'
       };
     } catch (error) {
       console.error('Error executing search query:', error);
       if (error instanceof HttpError) throw error;
       throw new HttpError(500, 'An error occurred while executing the search query');
     }
   }) satisfies ExecuteSearchQuery;
   ```

## 4. Results Manager

The results manager processes, normalizes, and manages search results.

### Configuration in main.wasp
```wasp
route ResultsManagerRoute { path: "/results", to: ResultsManagerPage }
page ResultsManagerPage {
  component: import { ResultsManagerPage } from "@src/client/resultsManager/pages/ResultsManagerPage",
  authRequired: true
}

query getRawResults {
  fn: import { getRawResults } from "@src/server/resultsManager/queries.js",
  entities: [User, SearchSession, RawSearchResult, SearchQuery, ProcessedResult]
}

query getProcessedResults {
  fn: import { getProcessedResults } from "@src/server/resultsManager/queries.js",
  entities: [User, SearchSession, ProcessedResult, RawSearchResult, SearchQuery, ReviewTagAssignment, ReviewTag, Note]
}

action processSessionResults {
  fn: import { processSessionResults } from "@src/server/resultsManager/actions.js",
  entities: [User, SearchSession, RawSearchResult, ProcessedResult, DuplicateRelationship]
}
```

### Implementation Highlights

1. **Result Processing**
   - Normalization of raw search results
   - Basic duplicate detection via URL normalization
   - Metadata extraction (domain, file type)

2. **Result Management**
   - Filtering and sorting capabilities
   - Result preview interface
   - Pagination for large result sets

3. **Client Implementation**
   ```tsx
   import { useQuery } from 'wasp/client/operations';
   
   function ProcessedResultsList({ sessionId }) {
     const { data: results, isLoading, error } = useQuery(getProcessedResults, { sessionId });
     
     if (isLoading) return <p>Loading results...</p>;
     if (error) return <p>Error: {error.message}</p>;
     
     return (
       <div>
         <h2>Processed Results ({results?.length || 0})</h2>
         <ul>
           {results?.map(result => (
             <li key={result.id}>
               <h3>{result.title}</h3>
               <p>{result.snippet}</p>
               <a href={result.url} target="_blank" rel="noopener noreferrer">
                 {result.url}
               </a>
             </li>
           ))}
         </ul>
       </div>
     );
   }
   ```

## 5. Review Results

The review results feature allows users to tag, annotate, and manage search results.

### Configuration in main.wasp
```wasp
route ReviewRoute { path: "/review", to: ReviewPage }
page ReviewPage {
  component: import { ReviewPage } from "@src/client/reviewResults/pages/ReviewPage",
  authRequired: true
}

query getReviewTags {
  fn: import { getReviewTags } from "@src/server/reviewResults/queries.js",
  entities: [User, SearchSession, ReviewTag]
}

query getResultsWithTags {
  fn: import { getResultsWithTags } from "@src/server/reviewResults/queries.js",
  entities: [User, SearchSession, ProcessedResult, ReviewTagAssignment, ReviewTag, Note, RawSearchResult, SearchQuery]
}

action createReviewTag {
  fn: import { createReviewTag } from "@src/server/reviewResults/actions.js",
  entities: [User, SearchSession, ReviewTag]
}

action assignTag {
  fn: import { assignTag } from "@src/server/reviewResults/actions.js",
  entities: [User, ProcessedResult, SearchSession, ReviewTagAssignment, ReviewTag]
}

action createNote {
  fn: import { createNote } from "@src/server/reviewResults/actions.js",
  entities: [User, ProcessedResult, SearchSession, Note]
}
```

### Implementation Highlights

1. **Tagging System**
   - Custom tag creation with color coding
   - Inclusion/exclusion tagging for PRISMA workflow
   - Bulk tagging operations

2. **Note-Taking**
   - Notes attached to specific results
   - Timestamped audit trail

3. **Filtering and Organization**
   - Filter by tag, search term, or metadata
   - Progress tracking for review workflow

## 6. Reporting

The reporting feature generates PRISMA flow diagrams and exports search results.

### Configuration in main.wasp
```wasp
route ReportingRoute { path: "/reporting", to: ReportingPage }
page ReportingPage {
  component: import { ReportingPage } from "@src/client/reporting/pages/ReportingPage",
  authRequired: true
}

query getReportData {
  fn: import { getReportData } from "@src/server/reporting/queries.js",
  entities: [User, SearchSession, SearchQuery, RawSearchResult, ProcessedResult, ReviewTag, ReviewTagAssignment, DuplicateRelationship]
}

action exportResults {
  fn: import { exportResults } from "@src/server/reporting/actions.js",
  entities: [User, SearchSession, ProcessedResult, RawSearchResult, SearchQuery, ReviewTagAssignment, ReviewTag, Note]
}
```

### Implementation Highlights

1. **PRISMA Flow Diagram**
   - Visual representation of search and review workflow
   - Automatic generation based on session data

2. **Export Formats**
   - CSV and JSON export formats
   - Configuration options for exported fields

3. **Statistics**
   - Summary statistics for search results
   - Review progress metrics

## Conclusion

Each feature implementation follows the same pattern of defining operations in `main.wasp` and implementing them in the corresponding server and client files. This consistent approach, combined with Wasp's built-in capabilities, results in a clean, maintainable codebase that focuses on business logic rather than infrastructure concerns. 