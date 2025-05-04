/**
 * Interface for report generators
 */
export interface ReportGenerator {
  /**
   * Generate a PRISMA flow diagram
   * @param sessionId The session ID
   * @returns A promise that resolves to the PRISMA flow data
   */
  generatePrismaFlow(sessionId: string): Promise<PrismaFlowData>;

  /**
   * Generate statistics for a session
   * @param sessionId The session ID
   * @returns A promise that resolves to the session statistics
   */
  generateStatistics(sessionId: string): Promise<SessionStatistics>;

  /**
   * Export results for a session
   * @param sessionId The session ID
   * @param format The export format
   * @returns A promise that resolves to the exported data
   */
  exportResults(sessionId: string, format: 'csv' | 'json'): Promise<string>;
}

/**
 * PRISMA flow data
 */
export interface PrismaFlowData {
  identification: {
    total: number;
  };
  screening: {
    included: number;
    excluded: number;
  };
  eligibility: {
    included: number;
    excluded: number;
  };
  included: {
    total: number;
  };
}

/**
 * Session statistics
 */
export interface SessionStatistics {
  totalQueries: number;
  totalResults: number;
  totalProcessedResults: number;
  totalTagged: number;
  tagDistribution: Record<string, number>;
  domainDistribution: Record<string, number>;
  fileTypeDistribution: Record<string, number>;
}
