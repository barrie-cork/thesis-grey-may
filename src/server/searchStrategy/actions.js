import { HttpError } from 'wasp/server';
import { ROLES, promoteToLeadReviewer } from '../auth/authorization.js';

/**
 * Create a new search session
 */
export const createSearchSession = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  const { name, description, teamId } = args;

  // Validate inputs
  if (!name || name.trim() === '') {
    throw new HttpError(400, 'Name is required');
  }

  // Data object prepared with Phase 2 in mind
  const data = {
    name,
    description,
    userId: context.user.id
  };

  // Phase 2 extension point - this will be a no-op in Phase 1
  if (teamId) {
    // In Phase 2, we would validate teamId and team membership here
    data.teamId = teamId;
  }

  try {
    // Transaction to create session and update user role if needed
    // Using the User entity via Prisma client
    const prisma = context.entities._prisma;
    
    // Create the session and potentially promote the user in a transaction
    const [newSession, updatedUser] = await prisma.$transaction(async (tx) => {
      // 1. Create the search session
      const session = await tx.searchSession.create({
        data,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      // 2. Promote user to Lead Reviewer if they're currently a Researcher
      let user = null;
      if (context.user.role === 'Researcher') {
        user = await tx.user.update({
          where: { id: context.user.id },
          data: { role: ROLES.LEAD_REVIEWER },
          select: { id: true, role: true }
        });
        console.log(`User ${context.user.id} promoted to Lead Reviewer`);
      }
      
      return [session, user];
    });

    return newSession;
  } catch (error) {
    console.error('Error creating search session:', error);
    throw new HttpError(500, 'Failed to create search session');
  }
};

/**
 * Create a new search query
 */
export const createSearchQuery = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  const { sessionId, query, description, queryType, structuredData } = args;

  // Validate inputs
  if (!sessionId) {
    throw new HttpError(400, 'Session ID is required');
  }
  if (!query || query.trim() === '') {
    throw new HttpError(400, 'Query string is required');
  }

  // Check if session exists and user has access to it
  const session = await context.entities.SearchSession.findFirst({
    where: {
      id: sessionId,
      // This is where we'll add team access in Phase 2
      userId: context.user.id
    }
  });

  if (!session) {
    throw new HttpError(404, 'Search session not found or access denied');
  }

  // Data object prepared with Phase 2 in mind
  const data = {
    query,
    description,
    sessionId
  };

  // Phase 2 extension points
  if (queryType) {
    data.queryType = queryType;
  }
  if (structuredData) {
    data.structuredData = structuredData;
  }

  try {
    const newQuery = await context.entities.SearchQuery.create({
      data,
      select: {
        id: true,
        query: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        sessionId: true
      }
    });

    return newQuery;
  } catch (error) {
    console.error('Error creating search query:', error);
    throw new HttpError(500, 'Failed to create search query');
  }
};

/**
 * Update an existing search query
 */
export const updateSearchQuery = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  const { id, query, description, queryType, structuredData } = args;

  // Validate inputs
  if (!id) {
    throw new HttpError(400, 'Query ID is required');
  }

  // Verify ownership of the query
  const existingQuery = await context.entities.SearchQuery.findFirst({
    where: {
      id,
      searchSession: {
        // This is where we'll add team access in Phase 2
        userId: context.user.id
      }
    },
    include: {
      searchSession: true
    }
  });

  if (!existingQuery) {
    throw new HttpError(404, 'Search query not found or access denied');
  }

  // Only update provided fields
  const data = {};
  if (query !== undefined) data.query = query;
  if (description !== undefined) data.description = description;
  
  // Phase 2 extension points
  if (queryType !== undefined) data.queryType = queryType;
  if (structuredData !== undefined) data.structuredData = structuredData;

  try {
    const updatedQuery = await context.entities.SearchQuery.update({
      where: { id },
      data,
      select: {
        id: true,
        query: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        sessionId: true,
        queryType: true,
        structuredData: true
      }
    });

    return updatedQuery;
  } catch (error) {
    console.error('Error updating search query:', error);
    throw new HttpError(500, 'Failed to update search query');
  }
}; 