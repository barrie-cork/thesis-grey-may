import { HttpError } from "wasp/server";

/**
 * Get raw search results for a specific session
 */
export const getRawResults = async ({ sessionId, queryId }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  try {
    // Validate that the session exists and belongs to the user
    const session = await context.entities.SearchSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new HttpError(404, "Search session not found");
    }

    if (session.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this session");
    }

    // Build the query
    const where = { searchQuery: { sessionId } };
    
    // If queryId is provided, filter by it
    if (queryId) {
      where.queryId = queryId;
    }

    // Get raw results
    const rawResults = await context.entities.RawSearchResult.findMany({
      where,
      include: {
        searchQuery: {
          select: {
            query: true,
            description: true
          }
        },
        processedResult: {
          select: {
            id: true
          }
        }
      },
      orderBy: { rank: 'asc' }
    });

    return rawResults;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error("Error fetching raw results:", error);
    throw new HttpError(500, "Failed to fetch raw results");
  }
};

/**
 * Get processed results for a specific session
 */
export const getProcessedResults = async ({ sessionId, includeTagged = false }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  try {
    // Validate that the session exists and belongs to the user
    const session = await context.entities.SearchSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new HttpError(404, "Search session not found");
    }

    if (session.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this session");
    }

    // Build the query
    const where = { sessionId };
    
    // If includeTagged is false, only get results with no tags
    if (!includeTagged) {
      where.reviewTags = { none: {} };
    }

    // Get processed results
    const processedResults = await context.entities.ProcessedResult.findMany({
      where,
      include: {
        rawSearchResult: {
          select: {
            searchQuery: {
              select: {
                query: true
              }
            },
            rank: true,
            searchEngine: true
          }
        },
        reviewTags: {
          include: {
            tag: true
          }
        },
        notes: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: { title: 'asc' }
    });

    return processedResults;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error("Error fetching processed results:", error);
    throw new HttpError(500, "Failed to fetch processed results");
  }
}; 