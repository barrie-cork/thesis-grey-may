import { type RawSearchResult, type ProcessedResult, type DuplicateRelationship } from 'wasp/entities';

/**
 * Interface for result processors
 */
export interface ResultProcessor {
  /**
   * Process a raw search result
   * @param rawResult The raw search result
   * @returns A promise that resolves to a processed result
   */
  processResult(rawResult: RawSearchResult): Promise<ProcessedResult>;

  /**
   * Detect duplicates in a list of processed results
   * @param results The list of processed results
   * @returns A promise that resolves to an array of duplicate relationships
   */
  detectDuplicates(results: ProcessedResult[]): Promise<DuplicateRelationship[]>;
}
