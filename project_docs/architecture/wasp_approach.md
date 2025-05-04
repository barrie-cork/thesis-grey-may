# Leveraging Wasp Framework Features

## Overview

Thesis Grey leverages the Wasp framework's built-in capabilities to eliminate custom boilerplate code and focus on the core business logic. This document outlines how we've utilized Wasp's features instead of building custom infrastructure.

## Key Wasp Features Utilized

### 1. Declarative App Configuration

The `main.wasp` file serves as the central configuration for the entire application:

- Application metadata and settings
- Routes and pages with authentication requirements
- Client-server operations (queries and actions)
- Authentication configuration

**Note:** As of Wasp v0.16.0, entity models are defined *exclusively* in `schema.prisma`, not within `main.wasp` itself.

### 2. Authentication System

We leverage Wasp v0.16.0's built-in authentication system with custom field handling:

```wasp
auth: {
  userEntity: User,
  methods: {
    usernameAndPassword: {
      userSignupFields: import { userSignupFields } from "@src/server/auth/userSignupFields.ts"
    }
  },
  onAuthFailedRedirectTo: "/login",
  onBeforeSignup: import { onBeforeSignup } from "@src/server/auth/hooks.ts",
}
```

This provides:
- JWT token management
- User registration and login flows
- Session handling
- Protected routes with the `authRequired: true` property
- Custom field handling during user creation

The `userSignupFields` implementation ensures that required fields like `username` are properly handled:

```typescript
// src/server/auth/userSignupFields.ts
import { UserSignupFields } from 'wasp/auth/providers/types';

export const userSignupFields: UserSignupFields = {
  username: async (data: any) => {
    // Ensure username exists and is unique
    if (!data.username) {
      throw new Error('Username is required');
    }
    return data.username;
  }
};
```

The `onBeforeSignup` hook in Wasp v0.16.0 performs validation or preliminary checks:

```typescript
// src/server/auth/hooks.ts
import { OnBeforeSignupHook } from 'wasp/server/auth';

export const onBeforeSignup: OnBeforeSignupHook = async ({ providerId, req, prisma }) => {
  // Validation or preliminary checks
  console.log('Signup request received for provider ID:', providerId);
  
  // No return value needed (void)
};
```

### 3. Operation System (Queries & Actions)

Wasp's operations system provides a standardized approach to client-server communication:

```wasp
query getSearchSessions {
  fn: import { getSearchSessions } from "@src/server/searchStrategy/queries.js",
  entities: [User, SearchSession, SearchQuery, ProcessedResult]
}

action createSearchSession {
  fn: import { createSearchSession } from "@src/server/searchStrategy/actions.js",
  entities: [User, SearchSession]
}
```

Server-side implementation using TypeScript with the `satisfies` operator for type safety:

```typescript
import { HttpError } from 'wasp/server';
import { type GetSearchSessions } from 'wasp/server/operations';

export const getSearchSessions = (async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

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

Benefits:
- Type-safe client-server communication
- Automatic data fetching and caching via React Query
- Entity-based access control
- Optimistic UI updates

### 4. Error Handling

We use Wasp's `HttpError` for standardized error handling:

```typescript
import { HttpError } from "wasp/server";

if (!session) {
  throw new HttpError(404, "Search session not found");
}
```

This provides:
- Standardized HTTP error responses
- Automatic error handling in the client
- Consistent error patterns across the application

### 5. Type Safety

Wasp generates TypeScript types based on `schema.prisma` and operation definitions in `main.wasp`:

```typescript
// Entity types from schema.prisma
import type { SearchSession, User } from 'wasp/entities';

// Operation types from main.wasp
import type { GetSearchSessions } from 'wasp/server/operations';

// Client-side hooks
import { useQuery } from 'wasp/client/operations';

// Inside a component
function SearchSessionsList() {
  const { data: sessions, isLoading, error } = useQuery(getSearchSessions);
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  
  return (
    <ul>
      {sessions.map((session: SearchSession) => (
        <li key={session.id}>{session.name}</li>
      ))}
    </ul>
  );
}
```

Benefits:
- Single source of truth for types
- Automatic type updates when schema changes
- Enhanced developer experience with autocompletion

## Implementation Patterns

### Vertical Slice Architecture

Each feature follows a vertical slice architecture pattern:

```
feature/
├── client/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   └── hooks/          # Custom client hooks (optional)
└── server/
    ├── actions.js      # Write operations
    └── queries.js      # Read operations
```

This organization:
- Groups related code together
- Minimizes cross-feature dependencies
- Makes features easier to understand and maintain

### Authentication and Authorization

Authentication leverages Wasp's built-in system:

```tsx
// Page definition in main.wasp
page ProfilePage {
  authRequired: true,
  component: import { ProfilePage } from "@src/client/auth/pages/ProfilePage"
}

// Client-side usage
import { useAuth } from 'wasp/client/auth';

function ProfilePage() {
  const { data: user } = useAuth();
  // ...
}
```

Client-side auth form with Wasp v0.16.0's customization options:

```tsx
import { SignupForm } from 'wasp/client/auth';

export function SignupPage() {
  return (
    <div>
      <h1>Sign Up</h1>
      <SignupForm 
        additionalFields={[]} // Use additionalFields, not additionalSignupFields
      />
    </div>
  );
}
```

Authorization is enforced in operations using `context.user` and `context.entities`:

```typescript
import { HttpError } from 'wasp/server';
import { type GetSearchSession } from 'wasp/server/operations';

export const getSearchSession = (async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const session = await context.entities.SearchSession.findFirst({
    where: {
      id: args.id,
      userId: context.user.id
    }
  });

  if (!session) {
    throw new HttpError(404, "Session not found");
  }

  return session;
}) satisfies GetSearchSession;
```

### Database Access

Wasp's Prisma integration provides clean, type-safe database access via `context.entities` within server operations:

```typescript
export const getMySessions = (async (_args, context) => {
  if (!context.user) { throw new HttpError(401); }

  const sessions = await context.entities.SearchSession.findMany({
    where: { userId: context.user.id },
    include: { searchQueries: true }
  });

  return sessions;
}) satisfies GetMySessions;
```

## Benefits of the Wasp Approach

1. **Reduced Codebase Size**: By eliminating custom infrastructure, the codebase is significantly smaller and more focused.

2. **Faster Development**: Less time spent on boilerplate means more time implementing core features.

3. **Better Maintainability**: Standard patterns make the code easier to maintain and extend.

4. **Enhanced Security**: Using built-in authentication and authorization reduces security risks.

5. **Improved Developer Experience**: Type safety and consistent patterns improve developer productivity.

## Wasp v0.16.0 Changes and Considerations

Wasp v0.16.0 introduced several changes that affected our implementation:

1. **Entity Definition**: Entities are now defined exclusively in schema.prisma, not in main.wasp.

2. **Auth System**: The authentication system was significantly redesigned with separate auth models that are automatically created and linked to the User entity.

3. **Component API**: Form components have been updated with newer prop names (additionalFields instead of additionalSignupFields).

4. **Hook Function Signatures**: Auth hooks have specific return type expectations:
   - onBeforeSignup should return void, not an object with modified data
   - Data transformation is handled by userSignupFields, not hooks

5. **Type Inference**: TypeScript type inference is improved with the satisfies operator.

## Implementation Examples

### Error Handling Example

Before (custom error hierarchy):
```typescript
import { NotFoundError, UnauthorizedError } from '../shared/errors';

if (!session) {
  throw new NotFoundError('Session not found');
}
```

After (using Wasp's HttpError):
```typescript
import { HttpError } from 'wasp/server';

if (!session) {
  throw new HttpError(404, 'Session not found');
}
```

### Authentication Example

Before (custom JWT handling):
```typescript
import jwt from 'jsonwebtoken';
import { config } from '../shared/config';

const token = jwt.sign({ userId: user.id }, config.auth.jwtSecret, {
  expiresIn: config.auth.jwtExpiresIn
});
```

After (using Wasp's auth):
```tsx
import { LoginForm } from 'wasp/client/auth';

function LoginPage() {
  return <LoginForm />;
}
```

## Conclusion

By leveraging Wasp's built-in capabilities, we've created a more maintainable, secure, and efficient implementation of Thesis Grey. This approach allows us to focus on the core business logic and user experience rather than reinventing infrastructure components. 