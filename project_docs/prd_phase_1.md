# Thesis Grey: Phase 1 PRD

## Project Overview

Thesis Grey is a specialised search application designed to facilitate the discovery and management of grey literature for clinical guideline development. The application follows a phased implementation approach where Phase 1 delivers core functionality with a streamlined feature set, establishing the foundation for more advanced capabilities in Phase 2.

This PRD outlines the Phase 1 implementation, which follows Vertical Slice Architecture (VSA) principles to deliver a complete working application focused on essential features while providing clear extension points for future development.

### Project Goals

1. Provide researchers with tools to create and execute systematic search strategies
2. Enable efficient processing and review of search results
3. Support PRISMA-compliant workflows for literature reviews
4. Establish a foundation that can be extended in Phase 2 without significant refactoring

## Database Architecture

### Overview

Phase 1 will implement the full database schema designed to support both phases, with some fields remaining unused but available for Phase 2. The application will use Prisma ORM integrated with the Wasp framework for type-safe database operations.

### Database System

```wasp
app ThesisGrey {
  title: "Thesis Grey",
  wasp: { version: "^0.16.0" },
  db: {
    system: PostgreSQL,
    prisma: {
      clientPreviewFeatures: ["extendedWhereUnique"]
    }
  }
}
```

### Core Entities

```prisma
// User and Authentication
model User {
  id                 String            @id @default(uuid())
  username           String            @unique // Used for login
  email              String?           @unique // Optional
  password           String?           // Hashed password (managed by Wasp)
  role               String            @default("Researcher") // Default global role
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  searchSessions     SearchSession[]
  reviewAssignments  ReviewAssignment[] // Simplified for Phase 1
  sessionMemberships SessionMembership[] // Added for Phase 2 compatibility
}

// Search Session
model SearchSession {
  id                String            @id @default(uuid())
  name              String
  description       String?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  userId            String            // ID of the creator (Implicit Lead Reviewer)
  user              User              @relation(fields: [userId], references: [id])
  searchQueries     SearchQuery[]
  searchExecutions  SearchExecution[]
  processedResults  ProcessedResult[]
  reviewTags        ReviewTag[]
  members           SessionMembership[] // Added for Phase 2 compatibility
}

// Search Query
model SearchQuery {
  id                String            @id @default(uuid())
  query             String
  description       String?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  sessionId         String
  searchSession     SearchSession     @relation(fields: [sessionId], references: [id])
  searchExecutions  SearchExecution[]
  rawSearchResults  RawSearchResult[]
}

// Search Execution
model SearchExecution {
  id                String            @id @default(uuid())
  status            String            // running, completed, failed
  startTime         DateTime          @default(now())
  endTime           DateTime?
  resultCount       Int?
  error             String?
  queryId           String
  sessionId         String
  searchQuery       SearchQuery       @relation(fields: [queryId], references: [id])
  searchSession     SearchSession     @relation(fields: [sessionId], references: [id])
}

// Raw Search Result
model RawSearchResult {
  id                String            @id @default(uuid())
  queryId           String
  title             String
  url               String
  snippet           String?
  rank              Int
  searchEngine      String
  rawResponse       Json
  searchQuery       SearchQuery       @relation(fields: [queryId], references: [id])
  processedResult   ProcessedResult?
}

// Processed Result
model ProcessedResult {
  id                String            @id @default(uuid())
  rawResultId       String            @unique
  sessionId         String
  title             String
  url               String
  snippet           String?
  metadata          Json
  rawSearchResult   RawSearchResult   @relation(fields: [rawResultId], references: [id])
  searchSession     SearchSession     @relation(fields: [sessionId], references: [id])
  reviewTags        ReviewTagAssignment[]
  notes             Note[]
  duplicateOf       DuplicateRelationship[] @relation("primaryResult")
  duplicates        DuplicateRelationship[] @relation("duplicateResult")
}

// Duplicate Relationship (Basic implementation for Phase 1)
model DuplicateRelationship {
  id                String            @id @default(uuid())
  primaryResultId   String
  duplicateResultId String
  similarityScore   Float
  duplicateType     String
  primaryResult     ProcessedResult   @relation("primaryResult", fields: [primaryResultId], references: [id])
  duplicateResult   ProcessedResult   @relation("duplicateResult", fields: [duplicateResultId], references: [id])
}

// Review Tag
model ReviewTag {
  id                String            @id @default(uuid())
  name              String
  color             String
  sessionId         String
  searchSession     SearchSession     @relation(fields: [sessionId], references: [id])
  assignments       ReviewTagAssignment[]
}

// Review Tag Assignment
model ReviewTagAssignment {
  id                String            @id @default(uuid())
  tagId             String
  resultId          String
  tag               ReviewTag         @relation(fields: [tagId], references: [id])
  result            ProcessedResult   @relation(fields: [resultId], references: [id])
}

// Review Assignment (Simplified for Phase 1)
model ReviewAssignment {
  id                String            @id @default(uuid())
  userId            String
  user              User              @relation(fields: [userId], references: [id])
}

// Note
model Note {
  id                String            @id @default(uuid())
  content           String
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  resultId          String
  result            ProcessedResult   @relation(fields: [resultId], references: [id])
}

// Session Membership
model SessionMembership {
  id          String        @id @default(uuid())
  userId      String
  sessionId   String
  role        String        // e.g., "LeadReviewer", "Reviewer" - Defined roles for session context
  assignedAt  DateTime      @default(now())

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  searchSession SearchSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@unique([userId, sessionId]) // User can only have one role per session
  @@index([userId])
  @@index([sessionId])
}
```

## Project Structure

Phase 1 will follow Vertical Slice Architecture (VSA) using the Wasp framework. This approach organizes code around features rather than technical layers, leading to better cohesion and simpler testing.

### Core Structure

```
thesis-grey/
├── main.wasp                 # Main Wasp configuration
├── src/
│   ├── client/               # Client-side code
│   │   ├── auth/             # Authentication UI components
│   │   ├── searchStrategy/   # Search strategy builder components
│   │   ├── serpExecution/    # Search execution components
│   │   ├── resultsManager/   # Results processing components
│   │   ├── reviewResults/    # Review interface components
│   │   ├── reporting/        # Basic reporting components
│   │   └── shared/           # Shared UI components
│   ├── server/               # Server-side code
│   │   ├── auth/             # Authentication logic
│   │   ├── searchStrategy/   # Search strategy logic
│   │   ├── serpExecution/    # Search execution logic
│   │   ├── resultsManager/   # Results processing logic
│   │   ├── reviewResults/    # Review logic
│   │   ├── reporting/        # Reporting logic
│   │   └── shared/           # Shared server utilities
│   └── shared/               # Code shared between client and server
│       ├── types.ts          # TypeScript types
│       └── utils.ts          # Utility functions
├── public/                   # Public assets
└── migrations/               # Database migrations
```

### Vertical Slice Implementation

Each feature will follow a vertical slice structure:

```
feature/
├── client/
│   ├── components/           # React components
│   ├── hooks/                # React hooks
│   └── pages/                # Page components
├── server/
│   ├── actions.ts            # Wasp actions
│   ├── queries.ts            # Wasp queries
│   └── utils.ts              # Server-side utilities
└── shared/
    └── types.ts              # Shared types
```

## Tech Stack

Phase 1 will utilize the Wasp full-stack framework, which integrates several modern technologies:

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing (provided by Wasp)

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web server framework (provided by Wasp)
- **Prisma**: ORM for database operations
- **JWT**: Authentication tokens

### Database
- **PostgreSQL**: Relational database

### DevOps
- **Docker**: Containerization (for production)
- **GitHub Actions**: CI/CD

### APIs
- **Google Search API via Serper**: For search execution

## Core Requirements by Feature

### 1. Authentication Feature

**Full Implementation in Phase 1**

```wasp
app ThesisGrey {
  // ...
  auth: {
    userEntity: User,
    methods: {
      usernameAndPassword: { // Using username/password auth
        userSignupFields: import { userSignupFields } from "@src/server/auth/userSignupFields.ts"
      }
    },
    onAuthFailedRedirectTo: "/login",
    onBeforeSignup: import { onBeforeSignup } from "@src/server/auth/hooks.ts"
  }
}

route LoginRoute { path: "/login", to: LoginPage }
page LoginPage {
  component: import { LoginPage } from "@src/client/auth/pages/LoginPage"
}

route SignupRoute { path: "/signup", to: SignupPage }
page SignupPage {
  component: import { SignupPage } from "@src/client/auth/pages/SignupPage"
}

route ProfileRoute { path: "/profile", to: ProfilePage }
page ProfilePage {
  authRequired: true,
  component: import { ProfilePage } from "@src/client/auth/pages/ProfilePage"
}

// Removed email verification/password reset routes for Phase 1
```

**Requirements:**
- [x] User registration with username and password
- [x] User login functionality
- [x] Protected routes with auth redirects (`authRequired: true`)
- [x] User profile management (basic display/update email)
- [x] JWT-based authentication
- [x] Proper authentication configuration in main.wasp

**Role Assignment in Phase 1:**
Phase 1 implements a simplified role system:
1.  **Researcher (Global Role):** Assigned to all users by default upon signup via `userSignupFields.ts`. Stored in `User.role`.
2.  **Admin (Global Role):** Can be manually assigned in the database post-signup for Phase 1. Admins have elevated privileges (exact privileges TBD based on feature implementation).
3.  **Implicit Lead Reviewer:** When a user (Researcher or Admin) creates a `SearchSession`, they automatically become the implicit "Lead Reviewer" *for that specific session*. This is determined by matching the logged-in user's ID with the `SearchSession.userId` field. In Phase 1, only the creator/Lead Reviewer can manage and review results within their own session.

The concept of inviting other users as "Reviewers" and explicit session-level roles using the `SessionMembership` table is deferred to Phase 2.

**Extension points for Phase 2:**
- Advanced roles and permissions system
- Organization-based access control
- Collaboration features

### 2. Search Strategy Builder

**Phase 1 Implementation:**

```wasp
route SearchStrategyRoute { path: "/search-strategy", to: SearchStrategyPage }
page SearchStrategyPage {
  authRequired: true,
  component: import { SearchStrategyPage } from "@src/client/searchStrategy/pages/SearchStrategyPage"
}

query getSearchSessions {
  fn: import { getSearchSessions } from "@src/server/searchStrategy/queries.js",
  entities: [SearchSession]
}

query getSearchSession {
  fn: import { getSearchSession } from "@src/server/searchStrategy/queries.js",
  entities: [SearchSession, SearchQuery]
}

action createSearchSession {
  fn: import { createSearchSession } from "@src/server/searchStrategy/actions.js",
  entities: [SearchSession]
}

action createSearchQuery {
  fn: import { createSearchQuery } from "@src/server/searchStrategy/actions.js",
  entities: [SearchQuery]
}

action updateSearchQuery {
  fn: import { updateSearchQuery } from "@src/server/searchStrategy/actions.js",
  entities: [SearchQuery]
}
```

**Requirements:**
- Basic concept grouping (Population, Interest, Context)
- Domain selection
- File type filtering
- Simple query generation
- Query preview
- PICO framework support

**Extension points for Phase 2:**
- Advanced concept relationships
- Query suggestion system
- Query history and versioning
- Visual query builder
- Template library

### 3. SERP Execution

**Phase 1 Implementation:**

```wasp
route SearchExecutionRoute { path: "/search-execution/:sessionId", to: SearchExecutionPage }
page SearchExecutionPage {
  authRequired: true,
  component: import { SearchExecutionPage } from "@src/client/serpExecution/pages/SearchExecutionPage"
}

query getSearchQueries {
  fn: import { getSearchQueries } from "@src/server/serpExecution/queries.js",
  entities: [SearchQuery]
}

query getSearchExecutions {
  fn: import { getSearchExecutions } from "@src/server/serpExecution/queries.js",
  entities: [SearchExecution]
}

action executeSearchQuery {
  fn: import { executeSearchQuery } from "@src/server/serpExecution/actions.js",
  entities: [SearchQuery, SearchExecution, RawSearchResult]
}
```

**Requirements:**
- Single API integration (Google Search API via Serper)
- Basic pagination handling
- Simple progress tracking
- Search execution
- Raw result storage
- Basic error handling

**Extension points for Phase 2:**
- Multi-API integration
- Advanced rate limiting and quota management
- Sophisticated error recovery
- Enhanced progress visualization
- Parallel query execution
- Search execution scheduling

### 4. Results Manager

**Phase 1 Implementation:**

```wasp
route ResultsManagerRoute { path: "/results/:sessionId", to: ResultsManagerPage }
page ResultsManagerPage {
  authRequired: true,
  component: import { ResultsManagerPage } from "@src/client/resultsManager/pages/ResultsManagerPage"
}

query getRawResults {
  fn: import { getRawResults } from "@src/server/resultsManager/queries.js",
  entities: [RawSearchResult]
}

query getProcessedResults {
  fn: import { getProcessedResults } from "@src/server/resultsManager/queries.js",
  entities: [ProcessedResult]
}

action processSessionResults {
  fn: import { processSessionResults } from "@src/server/resultsManager/actions.js",
  entities: [RawSearchResult, ProcessedResult, DuplicateRelationship]
}
```

**Requirements:**
- Basic result processing and normalization
- Simple URL normalization (for consistency, not for deduplication)
- Basic metadata extraction (domain, file type)
- Filtering and sorting of results
- Result preview interface
- Storage of search engine source for each result

**Extension points for Phase 2:**
- Multi-stage deduplication pipeline
- Advanced metadata extraction
- Manual duplicate management
- Advanced filtering and categorization
- Full-text search within results

### 5. Review Results

**Phase 1 Implementation:**

```wasp
route ReviewRoute { path: "/review/:sessionId", to: ReviewPage }
page ReviewPage {
  authRequired: true,
  component: import { ReviewPage } from "@src/client/reviewResults/pages/ReviewPage"
}

query getReviewTags {
  fn: import { getReviewTags } from "@src/server/reviewResults/queries.js",
  entities: [ReviewTag]
}

query getResultsWithTags {
  fn: import { getResultsWithTags } from "@src/server/reviewResults/queries.js",
  entities: [ProcessedResult, ReviewTagAssignment, ReviewTag, Note]
}

action createReviewTag {
  fn: import { createReviewTag } from "@src/server/reviewResults/actions.js",
  entities: [ReviewTag]
}

action assignTag {
  fn: import { assignTag } from "@src/server/reviewResults/actions.js",
  entities: [ReviewTagAssignment]
}

action createNote {
  fn: import { createNote } from "@src/server/reviewResults/actions.js",
  entities: [Note]
}
```

**Requirements:**
- Basic inclusion/exclusion tagging
- Simple notes system
- Basic filtering
- Progress tracking
- PRISMA-compliant workflow

**Review Workflow in Phase 1:**
In Phase 1, the user who creates a search strategy (the implicit Lead Reviewer, identified by `SearchSession.userId`) is responsible for reviewing and tagging all search results within that session. Phase 1 implements a single-user-per-session workflow. Phase 2 will extend this using the `SessionMembership` table to support collaborative review with multiple invited Reviewers.

**Extension points for Phase 2:**
- Advanced tagging system
- Multi-reviewer support
- Conflict resolution
- Annotation tools
- Bulk operations
- Review analytics

### 6. Reporting & Export

**Phase 1 Implementation:**

```wasp
route ReportingRoute { path: "/reporting/:sessionId", to: ReportingPage }
page ReportingPage {
  authRequired: true,
  component: import { ReportingPage } from "@src/client/reporting/pages/ReportingPage"
}

query getReportData {
  fn: import { getReportData } from "@src/server/reporting/queries.js",
  entities: [SearchSession, ProcessedResult, ReviewTagAssignment, ReviewTag]
}

action exportResults {
  fn: import { exportResults } from "@src/server/reporting/actions.js"
}
```

**Requirements:**
- Basic PRISMA flow diagram
- Simple report generation
- CSV and JSON export
- Basic statistics

**Extension points for Phase 2:**
- Advanced PRISMA visualizations
- Custom report templates
- PDF export
- Interactive dashboards
- Extended analytics
- Reference management integration

## API Implementation Strategy

For each feature, Phase 1 will implement a simplified version of the API that supports core functionality, using Wasp's operations pattern.

### Example: SERP Execution API

```typescript
// src/server/serpExecution/actions.js
import { executeSearchInBackground } from '../shared/services/googleSearchApi';

export const executeSearchQuery = async ({ queryId, maxResults = 100 }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  try {
    // Fetch the query
    const query = await context.entities.SearchQuery.findUnique({
      where: { id: queryId },
      include: { searchSession: true }
    });
    
    if (!query) {
      throw new HttpError(404, 'Query not found');
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
    
    // Execute search (single API only in Phase 1)
    // Use Google Search API via Serper
    executeSearchInBackground(context.entities, execution.id, query, maxResults);
    
    return {
      executionId: execution.id,
      queryId: query.id,
      status: 'running',
      startTime: execution.startTime
    };
  } catch (error) {
    console.error('Error executing query:', error);
    throw new HttpError(500, 'An unexpected error occurred');
  }
};
```

```typescript
// src/shared/services/googleSearchApi.js
import axios from 'axios';

export const executeSearchInBackground = async (entities, executionId, query, maxResults) => {
  try {
    // Simple API handler for Google Search only
    const serperApiKey = process.env.SERPER_API_KEY;
    const results = await searchGoogle(query.query, maxResults, serperApiKey);
    
    // Store results
    for (const result of results) {
      await entities.RawSearchResult.create({
        data: {
          queryId: query.id,
          title: result.title,
          url: result.link,
          snippet: result.snippet,
          rank: result.position,
          searchEngine: 'google',
          rawResponse: result
        }
      });
    }
    
    // Update execution status
    await entities.SearchExecution.update({
      where: { id: executionId },
      data: {
        status: 'completed',
        endTime: new Date(),
        resultCount: results.length
      }
    });
  } catch (error) {
    console.error('Error in background execution:', error);
    
    // Update execution status
    await entities.SearchExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        endTime: new Date(),
        error: error.message
      }
    });
  }
};

async function searchGoogle(query, maxResults, apiKey) {
  const response = await axios.post('https://google.serper.dev/search', {
    q: query,
    num: maxResults
  }, {
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.organic || [];
}
```

## Deployment Strategy

Phase 1, with its Wasp framework integration, will support multiple deployment options:

1. **Development Environment**
   - Use `wasp start` for local development
   - Automatically starts both frontend and backend servers

2. **Production Deployment Options**
   - Docker containers with `wasp build` output
   - Fly.io using Wasp's built-in deployment command: `wasp deploy fly`
   - Standard Node.js hosting providers using the generated artifacts

## Timeline and Milestones

1. **Project Setup & Authentication** - 2 weeks
   - Initialize Wasp project
   - Implement authentication system
   - Create user management

2. **Search Strategy Builder** - 3 weeks
   - Implement basic search strategy interface
   - Create query generation logic

3. **SERP Execution** - 2 weeks
   - Integrate with Google Search API
   - Implement search execution flow

4. **Results Manager** - 3 weeks
   - Build results processing pipeline
   - Create results viewing interface

5. **Review Results** - 2 weeks
   - Implement basic review interface
   - Create tagging and notes system

6. **Reporting & Export** - 2 weeks
   - Implement basic reporting
   - Create export functionality

7. **Testing & Refinement** - 2 weeks
   - Comprehensive testing
   - Bug fixes and refinements

**Total Duration: 16 weeks (4 months)**

## Success Criteria

1. Researchers can create and execute search strategies
2. Results can be processed, viewed, and tagged
3. Basic reporting and export functionality is available
4. Application is stable and performs reliably
5. All extension points for Phase 2 are clearly defined

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| API rate limits | High | Medium | Implement rate limiting and retry mechanisms |
| Database performance | Medium | Low | Monitor performance and optimize queries |
| User adoption | High | Medium | Focus on UX and gather early feedback |
| Development delays | Medium | Medium | Prioritize core features and establish clear MVP |
| Wasp framework limitations | Medium | Low | Identify fallback options for specific features if needed |

## Next Steps

Upon successful completion of Phase 1, the team will prepare for Phase 2 implementation by:

1. Gathering user feedback from Phase 1
2. Refining the roadmap for Phase 2 features
3. Identifying any necessary architecture adjustments
4. Planning the development timeline for Phase 2

The Phase 1 implementation provides a solid foundation that enables researchers to begin using the system while establishing clear extension points for the more sophisticated capabilities planned for Phase 2.
