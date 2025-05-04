import { type RawSearchResult } from 'wasp/entities';

export interface SearchOptions {
  maxResults?: number;
  fileType?: string;
  domain?: string;
}

/**
 * Interface for search providers
 */
export interface SearchProvider {
  /**
   * Execute a search query
   * @param query The search query
   * @param options Search options
   * @returns A promise that resolves to an array of raw search results
   */
  executeSearch(query: string, options: SearchOptions): Promise<RawSearchResult[]>;
}
