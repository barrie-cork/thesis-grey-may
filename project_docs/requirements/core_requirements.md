# Core Requirements for Thesis Grey

## Functional Requirements

### Authentication
- REQ-FR-AUTH-1: System must support user registration with username and password
- REQ-FR-AUTH-2: System must provide user login functionality
- REQ-FR-AUTH-3: System must support user profile management
- REQ-FR-AUTH-4: System must implement JWT-based authentication
- REQ-FR-AUTH-5: System must handle custom user fields during registration with userSignupFields
- REQ-FR-AUTH-6: System must validate user input with appropriate hooks (onBeforeSignup)

### Search Strategy Builder
- REQ-FR-SSB-1: System must allow users to create and manage search sessions
- REQ-FR-SSB-2: System must support basic concept grouping using the PIC framework (Population, Interest, Context)
- REQ-FR-SSB-3: System must allow domain selection for searches
- REQ-FR-SSB-4: System must support file type filtering
- REQ-FR-SSB-5: System must provide simple query generation
- REQ-FR-SSB-6: System must offer query preview functionality

### SERP Execution
- REQ-FR-SERP-1: System must integrate with Google Search API via Serper
- REQ-FR-SERP-2: System must handle basic pagination of search results
- REQ-FR-SERP-3: System must provide simple progress tracking for search execution
- REQ-FR-SERP-4: System must store raw search results
- REQ-FR-SERP-5: System must implement basic error handling for search execution
- REQ-FR-SERP-6: System must return the maximum available search results for each query as specified by the user

### Results Manager
- REQ-FR-RM-1: System must process and normalize search results
- REQ-FR-RM-2: System must implement basic URL normalization for consistency
- REQ-FR-RM-3: System must extract basic metadata (domain, file type)
- REQ-FR-RM-4: System must support filtering and sorting of results
- REQ-FR-RM-5: System must provide a result preview interface
- REQ-FR-RM-6: System must store search engine source for each result

### Review Results
- REQ-FR-RR-1: System must support basic inclusion/exclusion tagging
- REQ-FR-RR-2: System must provide a simple notes system
- REQ-FR-RR-3: System must support basic filtering of reviewed results
- REQ-FR-RR-4: System must track review progress
- REQ-FR-RR-5: System must implement PRISMA-compliant workflow

### Reporting & Export
- REQ-FR-RE-1: System must generate basic PRISMA flow diagrams
- REQ-FR-RE-2: System must support simple report generation
- REQ-FR-RE-3: System must allow export of results in CSV and JSON formats
- REQ-FR-RE-4: System must provide basic statistics on search results

## Technical Requirements

### Database
- REQ-TR-DB-1: System must use PostgreSQL as the database system
- REQ-TR-DB-2: System must define all entities in schema.prisma
- REQ-TR-DB-3: System must use Prisma ORM for database operations
- REQ-TR-DB-4: System must implement appropriate indexes for performance

### Architecture
- REQ-TR-ARCH-1: System must follow Vertical Slice Architecture (VSA) principles
- REQ-TR-ARCH-2: System must be built using the Wasp full-stack framework v0.16.0
- REQ-TR-ARCH-3: System must use React for the frontend
- REQ-TR-ARCH-4: System must use Node.js and Express for the backend
- REQ-TR-ARCH-5: System must be implemented with TypeScript for type safety
- REQ-TR-ARCH-6: System must use the "satisfies" operator for type inference

### Security
- REQ-TR-SEC-1: System must implement authentication via Wasp's built-in auth system
- REQ-TR-SEC-2: System must validate user input on both client and server sides
- REQ-TR-SEC-3: System must use HTTPS for all communications
- REQ-TR-SEC-4: System must implement proper authorization checks for all operations

### Error Handling
- REQ-TR-ERR-1: System must use Wasp's HttpError for error handling
- REQ-TR-ERR-2: System must provide appropriate error messages to users
- REQ-TR-ERR-3: System must log errors for debugging purposes
- REQ-TR-ERR-4: System must handle network failures gracefully

### Deployment
- REQ-TR-DEP-1: System must support Docker containerization for production
- REQ-TR-DEP-2: System must support deployment via Wasp's built-in deployment commands
