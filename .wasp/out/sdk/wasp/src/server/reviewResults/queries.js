import { HttpError } from "wasp/server";

/**
 * Get all review tags for a specific session
 */
export const getReviewTags = async ({ sessionId }, context) => {
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

    // Get all tags for this session
    return await context.entities.ReviewTag.findMany({
      where: { sessionId },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error("Error fetching review tags:", error);
    throw new HttpError(500, "Failed to fetch review tags");
  }
};

/**
 * Get results with their tags for review
 */
export const getResultsWithTags = async ({ 
  sessionId, 
  tagId = null,
  untaggedOnly = false,
  page = 1,
  limit = 20
}, context) => {
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

    // Build the where condition based on filters
    const where = { sessionId };
    
    if (tagId) {
      // Filter by specific tag
      where.reviewTags = {
        some: {
          tagId
        }
      };
    } else if (untaggedOnly) {
      // Filter for results with no tags
      where.reviewTags = {
        none: {}
      };
    }

    // Get total count for pagination
    const totalCount = await context.entities.ProcessedResult.count({ where });
    
    // Fetch results with pagination
    const results = await context.entities.ProcessedResult.findMany({
      where,
      include: {
        reviewTags: {
          include: {
            tag: true
          }
        },
        notes: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        rawSearchResult: {
          select: {
            searchQuery: {
              select: {
                query: true
              }
            }
          }
        }
      },
      orderBy: { title: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      results,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error("Error fetching results with tags:", error);
    throw new HttpError(500, "Failed to fetch results");
  }
}; 