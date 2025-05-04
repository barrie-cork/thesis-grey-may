import { HttpError } from "wasp/server";

/**
 * Get report data for a specific session
 */
export const getReportData = async ({ sessionId }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  try {
    // Validate that the session exists and belongs to the user
    const session = await context.entities.SearchSession.findUnique({
      where: { id: sessionId },
      include: {
        searchQueries: true
      }
    });

    if (!session) {
      throw new HttpError(404, "Search session not found");
    }

    if (session.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this session");
    }

    // Get statistics for raw results
    const rawResultsCount = await context.entities.RawSearchResult.count({
      where: {
        searchQuery: {
          sessionId
        }
      }
    });

    // Get statistics for processed results
    const processedResultsCount = await context.entities.ProcessedResult.count({
      where: { sessionId }
    });

    // Get all tags for this session
    const tags = await context.entities.ReviewTag.findMany({
      where: { sessionId },
      include: {
        assignments: {
          select: {
            id: true
          }
        }
      }
    });

    // Count of results by tag
    const tagCounts = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      count: tag.assignments.length
    }));

    // Count of duplicate relationships
    const duplicatesCount = await context.entities.DuplicateRelationship.count({
      where: {
        OR: [
          { primaryResult: { sessionId } },
          { duplicateResult: { sessionId } }
        ]
      }
    });

    // Get general tag statistics
    const taggedResultsCount = await context.entities.ProcessedResult.count({
      where: {
        sessionId,
        reviewTags: {
          some: {}
        }
      }
    });

    const untaggedResultsCount = processedResultsCount - taggedResultsCount;

    // Get file type statistics
    const fileTypeResults = await context.entities.ProcessedResult.findMany({
      where: { sessionId },
      select: {
        metadata: true
      }
    });

    const fileTypeCounts = {};
    fileTypeResults.forEach(result => {
      const fileType = result.metadata.fileType || 'unknown';
      fileTypeCounts[fileType] = (fileTypeCounts[fileType] || 0) + 1;
    });

    return {
      summary: {
        name: session.name,
        description: session.description,
        queriesCount: session.searchQueries.length,
        rawResultsCount,
        processedResultsCount,
        taggedResultsCount,
        untaggedResultsCount,
        duplicatesCount
      },
      queries: session.searchQueries,
      tags: tagCounts,
      fileTypes: Object.entries(fileTypeCounts).map(([type, count]) => ({ type, count }))
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error("Error fetching report data:", error);
    throw new HttpError(500, "Failed to fetch report data");
  }
}; 