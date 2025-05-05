# Thesis Grey: Phase 2 PRD

## Project Overview

Thesis Grey is a specialised search application designed to facilitate the discovery and management of grey literature for clinical guideline development. Phase 2 builds upon the foundation established in Phase 1, enhancing the application with advanced features, improved user experience, and sophisticated data processing capabilities.

This PRD outlines the Phase 2 implementation, which continues to follow Vertical Slice Architecture (VSA) principles while expanding on the core functionality delivered in Phase 1. Phase 2 focuses on advanced features, multi-user collaboration, and sophisticated data processing.

### Project Goals

1. Enhance search capabilities with multi-API integration and advanced query building
2. Implement sophisticated deduplication and metadata extraction
3. Support collaborative review workflows with multiple reviewers
4. Provide advanced reporting and analytics
5. Maintain backward compatibility with Phase 1 data and workflows

## Database Architecture

### Overview

Phase 2 will utilize the same database schema as Phase 1, now leveraging previously unused fields and adding new tables only for truly new functionality. The Prisma ORM integrated with the Wasp framework will continue to provide type-safe database operations.

### New/Enhanced Entities

```prisma
// Enhanced User model with roles
model User {
  // Existing fields from Phase 1...
  
  // New fields for Phase 2
  role              String            @default("researcher") // researcher, reviewer, admin
  organizationId    String?
  organization      Organization?     @relation(fields: [organizationId], references: [id])
  teams             TeamMembership[]
}

// New Organization model
model Organization {
  id                String            @id @default(uuid())
  name              String
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  users             User[]
  teams             Team[]
}

// New Team model
model Team {
  id                String            @id @default(uuid())
  name              String
  organizationId    String
  organization      Organization      @relation(fields: [organizationId], references: [id])
  members           TeamMembership[]
  searchSessions    SearchSession[]
}

// New TeamMembership model
model TeamMembership {
  id                String            @id @default(uuid())
  userId            String
  teamId            String
  role              String            // owner, admin, member
  user              User              @relation(fields: [userId], references: [id])
  team              Team              @relation(fields: [teamId], references: [id])
}

// Enhanced SearchSession model
model SearchSession {
  // Existing fields from Phase 1...
  
  // New fields for Phase 2
  teamId            String?
  team              Team?             @relation(fields: [teamId], references: [id])
  isTemplate        Boolean           @default(false)
  parentTemplateId  String?
  parentTemplate    SearchSession?    @relation("SessionTemplate", fields: [parentTemplateId], references: [id])
  derivedSessions   SearchSession[]   @relation("SessionTemplate")
}

// Enhanced SearchQuery model
model SearchQuery {
  // Existing fields from Phase 1...
  
  // New fields for Phase 2
  queryVersion      Int               @default(1)
  parentQueryId     String?
  parentQuery       SearchQuery?      @relation("QueryVersion", fields: [parentQueryId], references: [id])
  derivedQueries    SearchQuery[]     @relation("QueryVersion")
  conceptGroups     ConceptGroup[]
}

// New ConceptGroup model
model ConceptGroup {
  id                String            @id @default(uuid())
  name              String
  type              String            // population, interest, context
  queryId           String
  searchQuery       SearchQuery       @relation(fields: [queryId], references: [id])
  concepts          Concept[]
}

// New Concept model
model Concept {
  id                String            @id @default(uuid())
  term              String
  synonyms          String[]
  groupId           String
  conceptGroup      ConceptGroup      @relation(fields: [groupId], references: [id])
}

// Enhanced SearchExecution model
model SearchExecution {
  // Existing fields from Phase 1...
  
  // New fields for Phase 2
  searchEngine      String            // google, bing, duckduckgo, pubmed
  executionParams   Json              // API-specific parameters
}

// Enhanced ProcessedResult model
model ProcessedResult {
  // Existing fields from Phase 1...
  
  // New fields for Phase 2
  enhancedMetadata  Json              // Additional metadata from Phase 2 extraction
  fullText          String?           // Extracted or cached full text
  reviewAssignments ReviewAssignment[]
}

// Enhanced ReviewAssignment model
model ReviewAssignment {
  // Existing fields from Phase 1...
  
  // New fields for Phase 2
  resultId          String
  status            String            // pending, in_progress, completed
  assignedAt        DateTime          @default(now())
  completedAt       DateTime?
  result            ProcessedResult   @relation(fields: [resultId], references: [id])
}

// New ReviewConflict model
model ReviewConflict {
  id                String            @id @default(uuid())
  resultId          String
  conflictType      String            // tag_conflict, inclusion_conflict
  resolvedBy        String?
  resolvedAt        DateTime?
  reviewers         String[]
  result            ProcessedResult   @relation(fields: [resultId], references: [id])
}

// New ReportTemplate model
model ReportTemplate {
  id                String            @id @default(uuid())
  name              String
  template          Json
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  userId            String
  isPublic          Boolean           @default(false)
  user              User              @relation(fields: [userId], references: [id])
}
```

## Project Structure

Phase 2 will maintain the Vertical Slice Architecture (VSA) using the Wasp framework, expanding on the existing features while preserving the cohesive organization around features.

### Enhanced Structure

```
thesis-grey/
├── main.wasp                 # Main Wasp configuration
├── src/
│   ├── client/               # Client-side code
│   │   ├── auth/             # Enhanced authentication UI with roles
│   │   ├── organization/     # New organization management
│   │   ├── team/             # New team collaboration features
│   │   ├── searchStrategy/   # Enhanced search strategy builder
│   │   ├── serpExecution/    # Multi-API search execution
│   │   ├── resultsManager/   # Advanced results processing
│   │   ├── reviewResults/    # Collaborative review interface
│   │   ├── reporting/        # Advanced reporting and analytics
│   │   └── shared/           # Shared UI components
│   ├── server/               # Server-side code
│   │   ├── auth/             # Enhanced authentication with roles
│   │   ├── organization/     # Organization management logic
│   │   ├── team/             # Team collaboration logic
│   │   ├── searchStrategy/   # Advanced search strategy logic
│   │   ├── serpExecution/    # Multi-API search execution
│   │   ├── resultsManager/   # Advanced deduplication and processing
│   │   ├── reviewResults/    # Collaborative review logic
│   │   ├── reporting/        # Advanced reporting logic
│   │   └── shared/           # Shared server utilities
│   └── shared/               # Code shared between client and server
│       ├── types.ts          # Enhanced TypeScript types
│       └── utils.ts          # Utility functions
├── public/                   # Public assets
└── migrations/               # Database migrations for Phase 2
```

## Tech Stack

Phase 2 will continue to utilize the Wasp full-stack framework while introducing additional technologies to support advanced features:

### Frontend (Enhancements)
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **React Query**: Advanced data fetching (provided by Wasp)
- **D3.js**: Advanced data visualizations
- **React PDF**: PDF generation for reports

### Backend (Enhancements)
- **Node.js**: JavaScript runtime
- **Express**: Web server framework (provided by Wasp)
- **Prisma**: ORM for database operations
- **JWT**: Authentication tokens
- **Bull**: Background job processing for search operations
- **NLP libraries**: For text analysis and similarity detection

### Database (Same as Phase 1)
- **PostgreSQL**: Relational database

### DevOps (Enhancements)
- **Docker**: Containerization
- **GitHub Actions**: CI/CD
- **Monitoring**: Performance monitoring with Prometheus

### APIs (Expanded)
- **Google Search API via Serper**: Search execution
- **Bing Search API**: Additional search engine
- **DuckDuckGo Search API**: Additional search engine
- **PubMed API**: Specialized academic search

## Core Requirements by Feature

### 1. Authentication Feature (Enhancements)

```wasp
app ThesisGrey {
  // ...
  auth: {
    userEntity: User,
    methods: {
      usernameAndPassword: {},
      google: {}, // Added in Phase 2
    },
    onAuthFailedRedirectTo: "/login",
    roles: {
      // Added in Phase 2
      researcher: {},
      reviewer: {},
      admin: {}
    }
  }
}

// Add admin routes
route AdminRoute { path: "/admin", to: AdminPage }
page AdminPage {
  authRequired: true,
  role: "admin",
  component: import { AdminPage } from "@src/client/auth/pages/AdminPage"
}
```

**Phase 2 Enhancements:**
- Multiple role types (Researcher, Reviewer, Admin)
- Organization-based access control
- Team collaboration features
- Enhanced security features
- OAuth integrations (Google)
- Role-based authorization

**Role Assignment in Phase 2:**
Users continue to receive the "Researcher" role by default at signup (no user selection required), with the ability for administrators to assign the "Admin" role. The "Reviewer" role is dynamically assigned when a Lead Reviewer (the creator of a search strategy) invites another user to review search results. This context-based role assignment aligns with the collaborative review workflow where a Lead Reviewer manages the review process while multiple Reviewers can tag and annotate results independently.

### 2. Search Strategy Builder (Enhancements)

```wasp
// New queries and actions
query getSearchTemplates {
  fn: import { getSearchTemplates } from "@src/server/searchStrategy/queries.js",
  entities: [SearchSession]
}

action createConceptGroup {
  fn: import { createConceptGroup } from "@src/server/searchStrategy/actions.js",
  entities: [ConceptGroup]
}

action createConcept {
  fn: import { createConcept } from "@src/server/searchStrategy/actions.js",
  entities: [Concept]
}

action saveAsTemplate {
  fn: import { saveAsTemplate } from "@src/server/searchStrategy/actions.js",
  entities: [SearchSession]
}

action useTemplate {
  fn: import { useTemplate } from "@src/server/searchStrategy/actions.js",
  entities: [SearchSession, SearchQuery, ConceptGroup, Concept]
}
```

**Phase 2 Enhancements:**
- Advanced concept relationships and operators
- AI-assisted query suggestions
- Query history and versioning
- Visual query builder interface
- Saved template library
- MeSH term integration
- Concept grouping with synonyms
- Advanced boolean logic

### 3. SERP Execution (Enhancements)

```wasp
// Add scheduler page
route SchedulerRoute { path: "/scheduler", to: SchedulerPage }
page SchedulerPage {
  authRequired: true,
  component: import { SchedulerPage } from "@src/client/serpExecution/pages/SchedulerPage"
}

// New queries and actions
action scheduleSearchExecution {
  fn: import { scheduleSearchExecution } from "@src/server/serpExecution/actions.js",
  entities: [SearchExecution]
}

action executeMultiApiSearch {
  fn: import { executeMultiApiSearch } from "@src/server/serpExecution/actions.js",
  entities: [SearchExecution, RawSearchResult]
}

query getSearchEngineStats {
  fn: import { getSearchEngineStats } from "@src/server/serpExecution/queries.js",
  entities: [SearchExecution, RawSearchResult]
}
```

**Phase 2 Enhancements:**
- Support for multiple search APIs:
  - Google Search API
  - Bing Search API
  - DuckDuckGo Search API
  - PubMed API
- Advanced rate limiting and quota management
- Parallel query execution
- Search execution scheduling
- Enhanced progress visualization
- Robust error recovery
- Result caching
- Configurable search parameters per API

### 4. Results Manager (Enhancements)

```wasp
// New advanced results page
route AdvancedResultsRoute { path: "/advanced-results/:sessionId", to: AdvancedResultsPage }
page AdvancedResultsPage {
  authRequired: true,
  component: import { AdvancedResultsPage } from "@src/client/resultsManager/pages/AdvancedResultsPage"
}

// New queries and actions
query getAdvancedMetadata {
  fn: import { getAdvancedMetadata } from "@src/server/resultsManager/queries.js",
  entities: [ProcessedResult]
}

action runDeduplicationPipeline {
  fn: import { runDeduplicationPipeline } from "@src/server/resultsManager/actions.js",
  entities: [ProcessedResult, DuplicateRelationship]
}

action manuallySetDuplicate {
  fn: import { manuallySetDuplicate } from "@src/server/resultsManager/actions.js",
  entities: [ProcessedResult, DuplicateRelationship]
}

action extractFullText {
  fn: import { extractFullText } from "@src/server/resultsManager/actions.js",
  entities: [ProcessedResult]
}
```

**Phase 2 Enhancements:**
- Advanced metadata extraction:
  - Author detection
  - Date normalization
  - Publication type classification
- Multi-stage deduplication pipeline in this specific order:
  1. URL similarity analysis
  2. Title similarity analysis
  3. Snippet similarity analysis
  4. Cross-reference between results from different search engines
- Manual duplicate management interface
- Full-text search within results
- Advanced filtering and categorization
- Bulk operations
- Content similarity analysis

### 5. Review Results (Enhancements)

```wasp
// New collaborative review page
route CollaborativeReviewRoute { path: "/collaborative-review/:sessionId", to: CollaborativeReviewPage }
page CollaborativeReviewPage {
  authRequired: true,
  component: import { CollaborativeReviewPage } from "@src/client/reviewResults/pages/CollaborativeReviewPage"
}

// New queries and actions
query getReviewAssignments {
  fn: import { getReviewAssignments } from "@src/server/reviewResults/queries.js",
  entities: [ReviewAssignment, User]
}

query getReviewConflicts {
  fn: import { getReviewConflicts } from "@src/server/reviewResults/queries.js",
  entities: [ReviewConflict]
}

action assignReviewer {
  fn: import { assignReviewer } from "@src/server/reviewResults/actions.js",
  entities: [ReviewAssignment]
}

action resolveConflict {
  fn: import { resolveConflict } from "@src/server/reviewResults/actions.js",
  entities: [ReviewConflict]
}

action createCustomTag {
  fn: import { createCustomTag } from "@src/server/reviewResults/actions.js",
  entities: [ReviewTag]
}
```

**Phase 2 Enhancements:**
- Advanced tagging system with custom tags
- Multi-reviewer support
- Inter-reviewer reliability statistics
- Conflict resolution tools
- Annotation and highlighting tools
- AI-assisted screening
- Review analytics dashboard
- Citation management
- Bulk review operations
- Review progress tracking

**Collaborative Review Workflow in Phase 2:**
Phase 2 extends the review process to support a collaborative workflow with multiple reviewers:

1. The creator of a search strategy (default "Researcher" role) automatically becomes the Lead Reviewer for that session
2. The Lead Reviewer can invite other users to join as Reviewers for specific search sessions
3. When invited, users gain the "Reviewer" role contextually for that session while maintaining their default "Researcher" role systemwide
4. Lead Reviewers and Reviewers independently tag and annotate results
5. The system tracks conflicts between reviewers' tagging decisions
6. The Lead Reviewer can review conflicts and make final determinations

This contextual role assignment means that a user can be a Lead Reviewer for sessions they create and a Reviewer for sessions they're invited to, with appropriate permissions for each context.

### 6. Reporting & Export (Enhancements)

```wasp
// New advanced reporting page
route AdvancedReportingRoute { path: "/advanced-reporting/:sessionId", to: AdvancedReportingPage }
page AdvancedReportingPage {
  authRequired: true,
  component: import { AdvancedReportingPage } from "@src/client/reporting/pages/AdvancedReportingPage"
}

// New template management page
route ReportTemplatesRoute { path: "/report-templates", to: ReportTemplatesPage }
page ReportTemplatesPage {
  authRequired: true,
  component: import { ReportTemplatesPage } from "@src/client/reporting/pages/ReportTemplatesPage"
}

// New queries and actions
query getReportTemplates {
  fn: import { getReportTemplates } from "@src/server/reporting/queries.js",
  entities: [ReportTemplate]
}

action createReportTemplate {
  fn: import { createReportTemplate } from "@src/server/reporting/actions.js",
  entities: [ReportTemplate]
}

action generatePdfReport {
  fn: import { generatePdfReport } from "@src/server/reporting/actions.js"
}

action exportRisFormat {
  fn: import { exportRisFormat } from "@src/server/reporting/actions.js"
}
```

**Phase 2 Enhancements:**
- Advanced PRISMA visualizations
- Custom report templates
- Multiple export formats (PDF, Word, RIS)
- Interactive dashboards
- Extended analytics
- Reference management integration
- Publication-ready tables and figures
- Custom visualization tools

### 7. New Feature: Organization & Team Management

```wasp
// New organization management routes
route OrganizationsRoute { path: "/organizations", to: OrganizationsPage }
page OrganizationsPage {
  authRequired: true,
  component: import { OrganizationsPage } from "@src/client/organization/pages/OrganizationsPage"
}

route OrganizationDetailsRoute { path: "/organizations/:id", to: OrganizationDetailsPage }
page OrganizationDetailsPage {
  authRequired: true,
  component: import { OrganizationDetailsPage } from "@src/client/organization/pages/OrganizationDetailsPage"
}

// New team management routes
route TeamsRoute { path: "/teams", to: TeamsPage }
page TeamsPage {
  authRequired: true,
  component: import { TeamsPage } from "@src/client/team/pages/TeamsPage"
}

route TeamDetailsRoute { path: "/teams/:id", to: TeamDetailsPage }
page TeamDetailsPage {
  authRequired: true,
  component: import { TeamDetailsPage } from "@src/client/team/pages/TeamDetailsPage"
}

// New queries and actions
query getOrganizations {
  fn: import { getOrganizations } from "@src/server/organization/queries.js",
  entities: [Organization]
}

query getTeams {
  fn: import { getTeams } from "@src/server/team/queries.js",
  entities: [Team, TeamMembership, User]
}

action createOrganization {
  fn: import { createOrganization } from "@src/server/organization/actions.js",
  entities: [Organization]
}

action createTeam {
  fn: import { createTeam } from "@src/server/team/actions.js",
  entities: [Team, TeamMembership]
}

action addTeamMember {
  fn: import { addTeamMember } from "@src/server/team/actions.js",
  entities: [TeamMembership]
}
```

**Requirements:**
- Organization creation and management
- Team creation within organizations
- Team member management
- Role assignment within teams
- Shared resources within teams
- Team-level permissions

## API Implementation Examples

### Example: Multi-API Search Execution

```typescript
// src/server/serpExecution/actions.js
import { executeSearchInBackground } from '../shared/services/searchApi';

export const executeMultiApiSearch = async ({ queryId, engines, maxResults = 100 }, context) => {
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
    
    // Create execution records for each engine
    const executions = [];
    for (const engine of engines) {
      const execution = await context.entities.SearchExecution.create({
        data: {
          queryId: query.id,
          sessionId: query.sessionId,
          status: 'running',
          startTime: new Date(),
          searchEngine: engine,
          executionParams: { maxResults }
        }
      });
      
      executions.push(execution);
      
      // Execute search in parallel for each engine
      executeSearchInBackground(context.entities, execution.id, query, engine, maxResults);
    }
    
    return {
      executions: executions.map(e => ({
        executionId: e.id,
        queryId: query.id,
        engine: e.searchEngine,
        status: e.status,
        startTime: e.startTime
      }))
    };
  } catch (error) {
    console.error('Error executing multi-API search:', error);
    throw new HttpError(500, 'An unexpected error occurred');
  }
};
```

### Example: Advanced Deduplication Pipeline

```typescript
// src/server/resultsManager/actions.js
import { 
  normalizeUrls, 
  calculateTitleSimilarity, 
  calculateSnippetSimilarity,
  crossReferenceResults
} from '../shared/services/deduplication';

export const runDeduplicationPipeline = async ({ sessionId }, context) => {
  if (!context.user) {
    throw new HttpError(401);
  }

  try {
    // Fetch all raw results for the session
    const rawResults = await context.entities.RawSearchResult.findMany({
      where: {
        searchQuery: {
          sessionId
        }
      }
    });
    
    // 1. URL Similarity Analysis
    const urlGroups = normalizeUrls(rawResults);
    
    // 2. Title Similarity Analysis
    const titleGroups = calculateTitleSimilarity(urlGroups);
    
    // 3. Snippet Similarity Analysis
    const snippetGroups = calculateSnippetSimilarity(titleGroups);
    
    // 4. Cross-reference between search engines
    const finalGroups = crossReferenceResults(snippetGroups);
    
    // Process duplicate groups
    let uniqueCount = 0;
    let duplicateCount = 0;
    
    for (const group of finalGroups) {
      if (group.length === 1) {
        // Not a duplicate
        uniqueCount++;
        
        // Create or update processed result
        await processUniqueResult(context.entities, sessionId, group[0]);
      } else {
        // Found duplicates
        duplicateCount += group.length - 1;
        
        // Process duplicate group
        await processDuplicateGroup(context.entities, sessionId, group);
        
        uniqueCount++;
      }
    }
    
    return {
      sessionId,
      totalResults: rawResults.length,
      uniqueResults: uniqueCount,
      duplicateCount,
      status: 'completed'
    };
  } catch (error) {
    console.error('Error running deduplication pipeline:', error);
    throw new HttpError(500, 'An unexpected error occurred');
  }
};

async function processUniqueResult(entities, sessionId, result) {
  // Check if processed result already exists
  let processedResult = await entities.ProcessedResult.findFirst({
    where: {
      rawResultId: result.id
    }
  });
  
  if (!processedResult) {
    // Create processed result
    processedResult = await entities.ProcessedResult.create({
      data: {
        rawResultId: result.id,
        sessionId,
        title: result.title,
        url: result.url,
        snippet: result.snippet,
        metadata: {
          domain: extractDomain(result.url),
          fileType: extractFileType(result.url)
        },
        enhancedMetadata: {
          authors: extractAuthors(result),
          publicationDate: extractDate(result),
          publicationType: classifyPublication(result)
        }
      }
    });
  }
  
  return processedResult;
}

async function processDuplicateGroup(entities, sessionId, group) {
  // Find the best result (highest rank or most complete)
  const primaryResult = findBestResult(group);
  
  // Create or get primary processed result
  const processedResult = await processUniqueResult(entities, sessionId, primaryResult);
  
  // Create duplicate relationships
  for (const result of group) {
    if (result.id !== primaryResult.id) {
      await entities.DuplicateRelationship.create({
        data: {
          primaryResultId: processedResult.id,
          duplicateResultId: result.id,
          similarityScore: calculateSimilarityScore(primaryResult, result),
          duplicateType: determineDuplicateType(primaryResult, result)
        }
      });
    }
  }
  
  return processedResult;
}
```

## Deployment Strategy

Phase 2 will continue to leverage Wasp's deployment capabilities with enhanced infrastructure:

1. **Production Deployment Options**
   - Docker containers with `wasp build` output
   - Fly.io using Wasp's built-in deployment command: `wasp deploy fly`
   - Kubernetes deployment for larger installations
   - Standard Node.js hosting providers using the generated artifacts

2. **Scaling Considerations**
   - Horizontal scaling for API services
   - Database optimization for larger datasets
   - Caching strategies for frequently accessed data
   - Background job processing for resource-intensive operations

## Timeline and Milestones

1. **Organization & Team Management** - 3 weeks
   - Implement organization structure
   - Create team management
   - Configure role-based permissions

2. **Enhanced Search Strategy Builder** - 4 weeks
   - Implement advanced concept relationships
   - Create visual query builder
   - Build template system

3. **Multi-API SERP Execution** - 3 weeks
   - Integrate additional search APIs
   - Implement parallel execution
   - Create scheduling system

4. **Advanced Results Manager** - 4 weeks
   - Build sophisticated deduplication pipeline
   - Implement advanced metadata extraction
   - Create manual duplicate management

5. **Collaborative Review System** - 3 weeks
   - Implement multi-reviewer support
   - Create conflict resolution tools
   - Build annotation system

6. **Advanced Reporting & Export** - 3 weeks
   - Create custom report templates
   - Implement multiple export formats
   - Build interactive dashboards

7. **Testing & Refinement** - 2 weeks
   - Comprehensive testing
   - Performance optimization
   - Bug fixes and refinements

**Total Duration: 22 weeks (5.5 months)**

## Migration Strategy from Phase 1

A key consideration for Phase 2 is ensuring a smooth transition from Phase 1:

1. **Database Migration**
   - Run migration scripts to add new tables and fields
   - Preserve all existing data
   - Backfill computed fields where possible

2. **Feature Transition**
   - Ensure all Phase 1 features continue to work
   - Gradually introduce new features without disrupting existing workflows
   - Provide clear documentation and guidance for new capabilities

3. **User Experience**
   - Maintain consistent UI patterns between phases
   - Introduce progressive disclosure for advanced features
   - Provide tutorials and tooltips for new functionality

## Success Criteria

1. All Phase 1 functionality continues to work seamlessly
2. Multi-API search and advanced deduplication significantly improve result quality
3. Team collaboration features enable effective multi-user workflows
4. Advanced reporting provides actionable insights
5. System performance remains strong with larger datasets
6. User satisfaction increases with new capabilities

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Migration complexity | High | Medium | Thorough testing and rollback capability |
| API integration challenges | Medium | Medium | Modular design with fallback options |
| Performance with large datasets | High | Medium | Performance profiling and optimization |
| User learning curve | Medium | High | Progressive disclosure and user guidance |
| Scope creep | Medium | High | Strict feature prioritization and phased rollout |
| Framework limitations | Medium | Low | Custom implementations for critical features if needed |

## Future Directions (Beyond Phase 2)

After completing Phase 2, potential future directions include:

1. **AI Integration**
   - Machine learning for result classification
   - Natural language processing for content analysis
   - Predictive suggestions for search queries

2. **Extended Integrations**
   - Reference management systems
   - Clinical guideline authoring tools
   - Institutional repositories

3. **Advanced Collaboration**
   - Real-time collaborative review
   - Enhanced commentary and discussion
   - External stakeholder input

4. **Custom Domains**
   - Domain-specific search templates
   - Specialized metadata extraction
   - Field-specific reporting templates

The Phase 2 implementation builds upon the solid foundation established in Phase 1, delivering a comprehensive, enterprise-grade application for systematic literature review that supports collaborative research workflows and sophisticated data processing.
