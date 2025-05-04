# Thesis Grey: Product Requirements Document & Implementation Roadmap

## Overview

This document outlines the product requirements, implementation roadmap, and Wasp-specific guidelines for the Thesis Grey application Phase 1. It provides a structured approach to verify requirements and ensure proper implementation of all core features.

## Phase 1 Core Features & Verification Checklist

### 1. Authentication System

**Requirements:**
- [x] User registration with username and password
- [x] User login functionality
- [x] Protected routes with auth redirects
- [x] User profile management
- [x] Proper authentication configuration in main.wasp

**Verification Steps:**
1. Verify SignupPage works with `additionalFields` for username
2. Confirm LoginPage correctly authenticates users
3. Test protected routes redirect to login when unauthorized
4. Validate userSignupFields implementation handles required fields
5. Confirm onBeforeSignup hook implementation follows Wasp v0.16.0 pattern
6. Test profile page displays user information

### 2. Search Strategy Builder

**Requirements:**
- [ ] Create and manage search sessions
- [ ] Basic concept grouping (PIC framework)
- [ ] Domain selection for searches
- [ ] File type filtering
- [ ] Query generation
- [ ] Query preview

**Verification Steps:**
1. Test creating a new search session
2. Verify listing of user's search sessions
3. Check query building with PIC framework components
4. Validate domain selection functionality
5. Test file type filtering options
6. Confirm query generation produces correctly formatted output
7. Verify query preview shows expected syntax

### 3. SERP Execution 

**Requirements:**
- [ ] Integration with Google Search API via Serper
- [ ] Basic pagination of search results
- [ ] Progress tracking
- [ ] Storage of raw search results
- [ ] Error handling

**Verification Steps:**
1. Validate Google Search API connection with credentials
2. Test search execution with various queries
3. Verify pagination functionality for larger result sets
4. Confirm progress tracking updates during search
5. Check error handling for API failures
6. Validate raw results are stored in the database

### 4. Results Manager

**Requirements:**
- [ ] Process and normalize search results
- [ ] URL normalization for consistency
- [ ] Basic metadata extraction (domain, file type)
- [ ] Result filtering and sorting
- [ ] Result preview interface

**Verification Steps:**
1. Test batch processing of raw results
2. Verify URL normalization works correctly
3. Confirm metadata extraction for domains and file types
4. Validate filtering options work as expected
5. Test sorting functionality by different criteria
6. Check preview interface displays result details correctly

### 5. Review Results

**Requirements:**
- [ ] Basic inclusion/exclusion tagging
- [ ] Simple notes system
- [ ] Result filtering by tags
- [ ] Review progress tracking
- [ ] PRISMA-compliant workflow

**Verification Steps:**
1. Test tag creation functionality
2. Verify assigning tags to results
3. Confirm notes can be added to results
4. Validate filtering results by tag
5. Check review progress tracking metrics
6. Ensure workflow follows PRISMA guidelines

### 6. Reporting & Export

**Requirements:**
- [ ] Basic PRISMA flow diagrams
- [ ] Simple report generation
- [ ] Export in CSV and JSON formats
- [ ] Basic statistics on search results

**Verification Steps:**
1. Validate PRISMA flow diagram generation
2. Test report generation with various criteria
3. Verify CSV export format and content
4. Check JSON export format and content
5. Confirm statistics calculations are accurate

## Wasp-specific Implementation Guidelines

### Authentication Implementation

```typescript
// userSignupFields.ts
import { UserSignupFields } from 'wasp/auth/providers/types';

export const userSignupFields: UserSignupFields = {
  username: async (data: any) => {
    if (!data.username) {
      throw new Error('Username is required');
    }
    return data.username;
  }
};

// hooks.ts
import { OnBeforeSignupHook } from 'wasp/server/auth';

export const onBeforeSignup: OnBeforeSignupHook = async ({ providerId, req, prisma }) => {
  // Validation only - no return value in Wasp v0.16.0
  console.log('Signup request received for provider ID:', providerId);
};

// SignupPage.tsx
import { SignupForm } from 'wasp/client/auth';

export function SignupPage() {
  return (
    <div>
      <SignupForm additionalFields={[
        {
          name: 'username',
          type: 'input',
          label: 'Username',
          validations: {
            required: 'Username is required'
          }
        }
      ]} />
    </div>
  );
}
```

### Database Operations

When implementing database operations, follow this pattern for type safety:

```typescript
import { HttpError } from 'wasp/server';
import { type GetSearchSessions } from 'wasp/server/operations';

export const getSearchSessions = (async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  try {
    const sessions = await context.entities.SearchSession.findMany({
      where: { userId: context.user.id },
      // Include other query options...
    });

    return sessions;
  } catch (error) {
    console.error('Error:', error);
    throw new HttpError(500, 'Server error');
  }
}) satisfies GetSearchSessions;
```

### Entity Relationships

Entity relationships should be defined in `schema.prisma` following this pattern:

```prisma
model User {
  id            Int            @id @default(autoincrement())
  // Auth fields handled by Wasp
  username      String         @unique
  searchSessions SearchSession[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model SearchSession {
  id            Int            @id @default(autoincrement())
  name          String
  description   String?
  userId        Int
  user          User           @relation(fields: [userId], references: [id])
  searchQueries SearchQuery[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

### Client-side Data Fetching

```typescript
import { useQuery } from 'wasp/client/operations';
import { getSearchSessions } from 'wasp/client/operations';

function SearchSessionsList() {
  const { data: sessions, isLoading, error } = useQuery(getSearchSessions);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {sessions?.map(session => (
        <li key={session.id}>{session.name}</li>
      ))}
    </ul>
  );
}
```

## Development Workflow & Commands

### Setup & Starting Development

```bash
# Start the application in development mode
wasp start

# After changing entity definitions, apply migrations
wasp db migrate-dev

# Open database studio for inspection
wasp db studio
```

### Database Operations

After any changes to entity models in `schema.prisma`:

1. Stop `wasp start` (if running)
2. Run `wasp db migrate-dev` and provide a name for the migration
3. Restart the application with `wasp start`

### Debugging

- Server-side logs appear in the terminal running `wasp start`
- Client-side errors can be viewed in the browser console
- Use `console.log()` statements strategically for debugging
- `wasp db studio` provides a visual interface to inspect database content

## Implementation Roadmap

### Week 1: Authentication & Core Setup
- [x] Complete authentication system
- [x] Set up user profiles
- [x] Verify auth flows work correctly

### Week 2: Search Strategy Builder
- [ ] Implement search session creation and management
- [ ] Develop PIC framework components
- [ ] Add domain and file type filtering
- [ ] Create query builder interface

### Week 3: SERP Execution
- [ ] Integrate with Google Search API
- [ ] Implement search execution flow
- [ ] Add progress tracking
- [ ] Handle pagination and result storage

### Week 4: Results Processing
- [ ] Develop result normalization logic
- [ ] Implement metadata extraction
- [ ] Create filtering and sorting interface
- [ ] Build result preview component

### Week 5: Review Interface
- [ ] Create tagging system
- [ ] Implement notes functionality
- [ ] Develop filtered views by tag
- [ ] Add review progress tracking

### Week 6: Reporting & Testing
- [ ] Build PRISMA flow diagram generation
- [ ] Implement export functionality
- [ ] Add statistics calculations
- [ ] Comprehensive testing of all features

## Error Handling Best Practices

1. **Client-side:**
   - Use try/catch blocks around async operations
   - Display user-friendly error messages
   - Implement loading states for better UX

2. **Server-side:**
   - Use `HttpError` from 'wasp/server' with appropriate status codes
   - Log errors with context information
   - Return meaningful error messages

Example:
```typescript
try {
  // Operation code
} catch (error) {
  // If already an HttpError, rethrow
  if (error instanceof HttpError) throw error;
  
  // Otherwise create a new HttpError
  console.error('Operation failed:', error);
  throw new HttpError(500, 'Operation failed. Please try again.');
}
```

## Conclusion

This document provides a comprehensive roadmap for implementing Phase 1 of the Thesis Grey application. By following the verification steps for each feature and adhering to the Wasp-specific guidelines, the UI team can efficiently develop the application while ensuring it meets all requirements. 