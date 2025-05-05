import { HttpError } from 'wasp/server';
import { type GetSearchSessions, type GetSearchSession } from 'wasp/server/operations';
import { type User, type SearchSession } from 'wasp/entities';

/**
 * Get all search sessions for the current user.
 */
export const getSearchSessions = (async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  try {
    const sessions = await context.entities.SearchSession.findMany({
      where: { userId: context.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        // Include counts for queries and results
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

// getSearchSession query
/**
 * Get a specific search session by ID for the current user, including its queries.
 */
export const getSearchSession = (async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  const { sessionId } = args;

  if (!sessionId) {
    throw new HttpError(400, 'Session ID is required');
  }

  try {
    const session = await context.entities.SearchSession.findFirst({
      where: {
        id: sessionId,
        userId: context.user.id, // Ensure the user owns the session
      },
      include: {
        searchQueries: {
          orderBy: { createdAt: 'asc' }, // Optional: order queries
        },
      },
    });

    if (!session) {
      throw new HttpError(404, 'Search session not found or you do not have access.');
    }

    return session;
  } catch (error) {
    // Re-throw HttpErrors
    if (error instanceof HttpError) {
      throw error;
    }
    // Log other errors and throw a generic one
    console.error(`Error fetching search session ${sessionId}:`, error);
    throw new HttpError(500, 'Failed to fetch search session');
  }
}) satisfies GetSearchSession;

// getSearchSession query will be added later 