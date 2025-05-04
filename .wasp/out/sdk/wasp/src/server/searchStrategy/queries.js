import { HttpError } from 'wasp/server';

/**
 * Get all search sessions for the current user
 */
export const getSearchSessions = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  // Query structure for Phase 1 - simplified
  const whereClause = { userId: context.user.id };
  
  // Phase 2 fields removed to match current schema
  
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
        // Phase 2 fields removed
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
};

/**
 * Get a specific search session by ID
 */
export const getSearchSession = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  const { id } = args;
  if (!id) {
    throw new HttpError(400, 'Session ID is required');
  }

  try {
    // Build a query that will work with team-based access in Phase 2
    const session = await context.entities.SearchSession.findFirst({
      where: {
        id,
        // This is where we'll add team access check in Phase 2
        userId: context.user.id
      },
      include: {
        searchQueries: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            searchQueries: true,
            processedResults: true
          }
        }
      }
    });

    if (!session) {
      throw new HttpError(404, 'Search session not found or access denied');
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
}; 