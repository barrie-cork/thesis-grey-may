import { HttpError } from "wasp/server";

/**
 * Process raw search results into normalized processed results for a session
 */
export const processSessionResults = async ({ sessionId }, context) => {
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

    // Get raw results that haven't been processed yet
    const rawResults = await context.entities.RawSearchResult.findMany({
      where: {
        searchQuery: { sessionId },
        processedResult: null
      }
    });

    if (rawResults.length === 0) {
      return { processed: 0, message: "No new results to process" };
    }

    // Track the processed results
    const processedResults = [];
    const duplicateRelationships = [];

    // Process each raw result
    for (const rawResult of rawResults) {
      // Create a normalized result
      const processedResult = await createProcessedResult(
        context,
        rawResult,
        sessionId
      );
      
      processedResults.push(processedResult);
      
      // Check for duplicates (simple URL-based in Phase 1)
      await findDuplicates(
        context,
        processedResult,
        duplicateRelationships
      );
    }

    return {
      processed: processedResults.length,
      duplicatesFound: duplicateRelationships.length,
      message: `Processed ${processedResults.length} results with ${duplicateRelationships.length} potential duplicates identified`
    };
  } catch (error) {
    console.error("Error processing session results:", error);
    throw new HttpError(500, "Failed to process session results");
  }
};

/**
 * Helper function to create a processed result from a raw result
 */
async function createProcessedResult(context, rawResult, sessionId) {
  // Extract basic metadata
  const metadata = {
    domain: extractDomain(rawResult.url),
    fileType: extractFileType(rawResult.url),
    source: rawResult.searchEngine,
    rawRank: rawResult.rank,
    processedAt: new Date().toISOString()
  };

  // Create processed result
  return await context.entities.ProcessedResult.create({
    data: {
      rawResultId: rawResult.id,
      sessionId,
      title: rawResult.title,
      url: normalizeUrl(rawResult.url),
      snippet: rawResult.snippet,
      metadata
    }
  });
}

/**
 * Helper function to find potential duplicates
 */
async function findDuplicates(context, newResult, duplicateRelationships) {
  // In Phase 1, just do basic URL normalization to find duplicates
  const normalizedUrl = normalizeUrl(newResult.url);
  
  // Find other results with the same normalized URL
  const potentialDuplicates = await context.entities.ProcessedResult.findMany({
    where: {
      url: normalizedUrl,
      id: { not: newResult.id }
    }
  });

  // For each potential duplicate, create a relationship
  for (const duplicate of potentialDuplicates) {
    const relationship = await context.entities.DuplicateRelationship.create({
      data: {
        primaryResultId: 
          duplicate.id < newResult.id ? duplicate.id : newResult.id,
        duplicateResultId: 
          duplicate.id < newResult.id ? newResult.id : duplicate.id,
        similarityScore: 1.0,  // Full match based on URL
        duplicateType: 'url_match'
      }
    });
    
    duplicateRelationships.push(relationship);
  }
  
  return duplicateRelationships;
}

/**
 * Helper function to extract domain from URL
 */
function extractDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain;
  } catch (error) {
    return '';
  }
}

/**
 * Helper function to extract file type from URL
 */
function extractFileType(url) {
  try {
    const path = new URL(url).pathname;
    const extension = path.split('.').pop().toLowerCase();
    
    // Check if it's a known document type
    const documentTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'];
    if (documentTypes.includes(extension)) {
      return extension;
    }
    
    // Default to 'html' for web pages
    return 'html';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Helper function to normalize URL for comparison
 */
function normalizeUrl(url) {
  try {
    // Basic normalization - remove protocol, trailing slash, and www.
    let normalized = url.trim().toLowerCase();
    normalized = normalized.replace(/^https?:\/\//, '');
    normalized = normalized.replace(/^www\./, '');
    normalized = normalized.replace(/\/$/, '');
    
    return normalized;
  } catch (error) {
    return url;
  }
} 