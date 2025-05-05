import { HttpError } from "wasp/server";
import axios from "axios";
import { requireAnyRole } from '../auth/authorization.js';

/**
 * Execute a search query using the Google Search API via Serper
 */
export const executeSearchQuery = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }
  
  // Check if user has the required role to execute searches (Lead Reviewer or Admin)
  requireAnyRole(context.user, ['Lead Reviewer', 'Admin'], 'Only Lead Reviewers and Admins can execute searches');

  const { queryId, maxResults = 100 } = args;

  if (!queryId) {
    throw new HttpError(400, 'Query ID is required');
  }

  try {
    // Fetch the query
    const query = await context.entities.SearchQuery.findUnique({
      where: { id: queryId },
      include: { searchSession: true }
    });
    
    if (!query) {
      throw new HttpError(404, "Query not found");
    }

    // Check if the user has access to this query
    if (query.searchSession.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this query");
    }
    
    // Create execution record
    const execution = await context.entities.SearchExecution.create({
      data: {
        queryId: query.id,
        sessionId: query.searchSession.id,
        status: 'running',
        startTime: new Date()
      }
    });
    
    // Execute search (separate function for cleaner code)
    await executeSearch(context.entities, execution.id, query, maxResults);
    
    return {
      executionId: execution.id,
      queryId: query.id,
      status: 'running',
      startTime: execution.startTime
    };
  } catch (error) {
    // Re-throw HttpError instances
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error('Error executing query:', error);
    throw new HttpError(500, 'An error occurred while executing the search query');
  }
};

/**
 * Execute a search query in the background
 */
async function executeSearch(entities, executionId, query, maxResults) {
  try {
    const serperApiKey = process.env.SERPER_API_KEY;
    if (!serperApiKey) {
      throw new Error('SERPER_API_KEY is not defined');
    }

    const response = await axios.post('https://google.serper.dev/search', {
      q: query.query,
      num: maxResults
    }, {
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const results = response.data.organic || [];
    
    // Store results
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      await entities.RawSearchResult.create({
        data: {
          queryId: query.id,
          title: result.title || 'Untitled',
          url: result.link || '',
          snippet: result.snippet || '',
          rank: i + 1,
          searchEngine: 'google',
          rawResponse: result
        }
      });
    }
    
    // Update execution status
    await entities.SearchExecution.update({
      where: { id: executionId },
      data: {
        status: 'completed',
        endTime: new Date(),
        resultCount: results.length
      }
    });
  } catch (error) {
    console.error('Error in search execution:', error);
    
    // Update execution status
    await entities.SearchExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        endTime: new Date(),
        error: error.message || 'Unknown error occurred'
      }
    });
  }
} 