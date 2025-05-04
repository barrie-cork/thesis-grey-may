import { HttpError } from "wasp/server";

/**
 * Export results in a specific format
 */
export const exportResults = async ({ sessionId, format = 'csv', tagId = null }, context) => {
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

    // Build the query for results
    const where = { sessionId };
    
    // If tagId is provided, filter by that tag
    if (tagId) {
      where.reviewTags = {
        some: {
          tagId
        }
      };
    }

    // Get the results with their tags and notes
    const results = await context.entities.ProcessedResult.findMany({
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
        notes: true
      }
    });

    // Format the data for export
    const formattedResults = results.map(result => {
      // Get the tag names
      const tags = result.reviewTags.map(rt => rt.tag.name).join(', ');
      
      // Get the latest note (if any)
      const latestNote = result.notes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]?.content || '';

      // Return a formatted object for export
      return {
        title: result.title,
        url: result.url,
        snippet: result.snippet || '',
        query: result.rawSearchResult.searchQuery.query,
        tags,
        notes: latestNote,
        domain: result.metadata.domain || '',
        fileType: result.metadata.fileType || '',
        source: result.rawSearchResult.searchEngine || '',
        rank: result.rawSearchResult.rank
      };
    });

    // Generate the export content based on the format
    switch (format.toLowerCase()) {
      case 'csv':
        return {
          format: 'csv',
          filename: `thesis-grey-export-${session.name}-${new Date().toISOString().slice(0,10)}.csv`,
          content: generateCSV(formattedResults)
        };
      case 'json':
        return {
          format: 'json',
          filename: `thesis-grey-export-${session.name}-${new Date().toISOString().slice(0,10)}.json`,
          content: JSON.stringify(formattedResults, null, 2)
        };
      default:
        throw new HttpError(400, `Unsupported export format: ${format}`);
    }
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error("Error exporting results:", error);
    throw new HttpError(500, "Failed to export results");
  }
};

/**
 * Helper function to generate CSV content
 */
function generateCSV(data) {
  if (data.length === 0) {
    return '';
  }

  // Get the headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create the header row
  const headerRow = headers.join(',');
  
  // Create the data rows
  const rows = data.map(item => {
    return headers.map(header => {
      // Handle special characters in CSV
      const value = item[header]?.toString() || '';
      // Escape quotes and wrap in quotes if needed
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  // Combine header and rows
  return [headerRow, ...rows].join('\n');
} 