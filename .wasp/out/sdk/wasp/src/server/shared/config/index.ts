/**
 * Application configuration
 * 
 * Note: Many settings previously defined here are now handled by Wasp automatically.
 * For example, authentication and database configuration are managed by Wasp.
 */
export const config = {
  /**
   * Search configuration
   */
  search: {
    serperApiKey: process.env.SERPER_API_KEY || '',
    defaultMaxResults: parseInt(process.env.DEFAULT_MAX_RESULTS || '100')
  }
};
