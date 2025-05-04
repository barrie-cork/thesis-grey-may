# Thesis Grey: Technology Stack

## Overview

Thesis Grey is implemented using the Wasp framework, a full-stack web application development platform that integrates React, Node.js, and Prisma. This document details the technology stack and architectural decisions made to optimize development efficiency and maintainability.

## Core Technologies

### Full-Stack Framework
- **Wasp**: A declarative DSL that generates and integrates code for web applications
  - Version: ^0.16.0
  - Provides integrated authentication, routing, database access, and API layer

### Frontend
- **React**: UI component library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing (provided by Wasp)

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web server framework (provided by Wasp)
- **Prisma**: ORM for database operations
- **JWT**: Authentication tokens (managed by Wasp)

### Database
- **PostgreSQL**: Relational database

### External APIs
- **Google Search API via Serper**: For search execution

## Architecture

Thesis Grey follows a Vertical Slice Architecture (VSA) while leveraging Wasp's built-in capabilities for common full-stack concerns:

### Core Layers

#### Domain Layer
- Business entities defined exclusively in schema.prisma
- Domain logic in feature-specific directories

#### Application Layer
- Use cases implemented via Wasp actions and queries
- Authentication using Wasp's built-in auth system with userSignupFields
- Error handling using Wasp's HttpError

#### Infrastructure Layer
Minimized through the use of Wasp's capabilities:
- **Authentication**: Wasp's built-in auth system with username/password
- **Database Access**: Wasp's Prisma integration
- **API Layer**: Implemented via Wasp actions and queries
- **External Services**: Custom adapters for search APIs

#### Presentation Layer
- React components with Wasp's routing system
- Auto-generated React Query hooks for data fetching

### Cross-cutting Concerns

#### Error Handling
- Wasp's `HttpError` for operation failures
- React error handling in UI components

#### Logging
- Console-based logging for development
- Structured logging for production

#### Security
- Authentication via Wasp's built-in auth system
- Authorization enforced in operations and routes

#### State Management
- **Client State**: React Query (provided by Wasp)
- **Server State**: Prisma transactions

## Project Structure

```
thesis-grey/
├── main.wasp                 # Wasp configuration (routes, pages, auth, queries, actions)
├── schema.prisma             # Database schema and entity definitions
├── src/
│   ├── client/               # Client-side code
│   │   ├── auth/             # Authentication UI components
│   │   │   └── pages/        # Auth page components (login, signup, profile)
│   │   ├── searchStrategy/   # Search strategy builder components
│   │   ├── serpExecution/    # Search execution components
│   │   ├── resultsManager/   # Results processing components
│   │   ├── reviewResults/    # Review interface components
│   │   └── reporting/        # Reporting components
│   ├── server/               # Server-side code
│   │   ├── auth/             # Authentication logic
│   │   │   ├── actions.js    # Auth-related actions
│   │   │   ├── queries.js    # Auth-related queries
│   │   │   ├── hooks.ts      # Auth hooks like onBeforeSignup
│   │   │   └── userSignupFields.ts # User field mapping for signup
│   │   ├── searchStrategy/   # Search strategy logic
│   │   ├── serpExecution/    # Search execution logic
│   │   ├── resultsManager/   # Results processing logic
│   │   ├── reviewResults/    # Review logic
│   │   └── reporting/        # Reporting logic
│   └── shared/               # Code shared between client and server
├── public/                   # Public assets
└── project_docs/             # Project documentation
```

## Feature-Specific Implementation

### Authentication
- Uses Wasp v0.16.0's built-in user authentication system
- Username/password authentication
- User signup field customization with `userSignupFields`
- JWT-based session management
- Protected routes using Wasp's `authRequired` property

### Search Strategy Builder
- Manages search sessions and queries
- Implements PICO framework concept grouping
- User-specific data with automatic authorization

### SERP Execution
- Integration with Google Search API via Serper
- Asynchronous search execution
- Progress tracking and error handling

### Results Manager
- Automated result processing
- URL normalization for duplicate detection
- Metadata extraction (domain, file type)

### Review Interface
- Custom tagging system with color coding
- Note-taking functionality
- Results filtering by tags
- PRISMA-compliant workflow

### Reporting & Export
- PRISMA flow diagram visualization
- Statistics and metrics
- CSV and JSON export options

## Wasp-Specific Advantages

The Thesis Grey implementation leverages several key advantages of the Wasp framework:

1. **Reduced Boilerplate**: Wasp generates common patterns for auth, CRUD operations, and API endpoints
2. **Type Safety**: Auto-generated TypeScript types from database schema
3. **Integrated Auth**: Built-in authentication system that handles sessions, tokens, and user management
4. **Unified Codebase**: Single repository with clear separation of concerns
5. **Operations Pattern**: Standardized approach to client-server communication via actions and queries

## TypeScript Integration

Wasp v0.16.0 provides strong TypeScript support that enhances developer experience:

```typescript
// Entity types auto-generated from schema.prisma
import type { User, SearchSession } from 'wasp/entities';

// Operation types auto-generated from main.wasp
import { type GetSearchSessions } from 'wasp/server/operations';

// Client operations hooks auto-generated from main.wasp
import { useQuery, getSearchSessions } from 'wasp/client/operations';

// Implementation using the satisfies operator with inferred types
export const getSearchSessions = (async (args, context) => {
  // Implementation...
}) satisfies GetSearchSessions;
```

## Extension Points

The architecture provides clear extension points for future enhancements:

1. **Advanced Search APIs**: Additional search engine integrations
2. **Collaborative Review**: Multi-user annotation and review
3. **Machine Learning**: Integration with NLP services for automated processing
4. **Advanced Reporting**: Extended analysis and visualization options
