import { type ReviewTag, type ReviewTagAssignment, type Note } from 'wasp/entities';

/**
 * Interface for review managers
 */
export interface ReviewManager {
  /**
   * Create a review tag
   * @param name The tag name
   * @param color The tag color
   * @param sessionId The session ID
   * @returns A promise that resolves to the created tag
   */
  createTag(name: string, color: string, sessionId: string): Promise<ReviewTag>;

  /**
   * Assign a tag to a result
   * @param tagId The tag ID
   * @param resultId The result ID
   * @returns A promise that resolves to the created tag assignment
   */
  assignTag(tagId: string, resultId: string): Promise<ReviewTagAssignment>;

  /**
   * Create a note for a result
   * @param content The note content
   * @param resultId The result ID
   * @returns A promise that resolves to the created note
   */
  createNote(content: string, resultId: string): Promise<Note>;
}
