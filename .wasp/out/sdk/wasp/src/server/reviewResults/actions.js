import { HttpError } from "wasp/server";

/**
 * Create a new review tag
 */
export const createReviewTag = async ({ sessionId, name, color }, context) => {
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

    // Validate input
    if (!name || !name.trim()) {
      throw new HttpError(400, "Tag name is required");
    }

    if (!color || !color.trim()) {
      throw new HttpError(400, "Tag color is required");
    }

    // Check if a tag with the same name already exists for this session
    const existingTag = await context.entities.ReviewTag.findFirst({
      where: {
        sessionId,
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingTag) {
      throw new HttpError(400, `A tag with the name "${name}" already exists`);
    }

    // Create the new tag
    return await context.entities.ReviewTag.create({
      data: {
        sessionId,
        name,
        color
      }
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error("Error creating review tag:", error);
    throw new HttpError(500, "Failed to create review tag");
  }
};

/**
 * Assign a tag to a result
 */
export const assignTag = async ({ resultId, tagId, remove = false }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  try {
    // Get the result and ensure it exists
    const result = await context.entities.ProcessedResult.findUnique({
      where: { id: resultId },
      include: {
        searchSession: true,
        reviewTags: true
      }
    });

    if (!result) {
      throw new HttpError(404, "Result not found");
    }

    // Check if the user has access to the session
    if (result.searchSession.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this result");
    }

    // If removing the tag
    if (remove) {
      const tagAssignment = await context.entities.ReviewTagAssignment.findFirst({
        where: {
          resultId,
          tagId
        }
      });

      if (!tagAssignment) {
        throw new HttpError(404, "Tag not assigned to this result");
      }

      await context.entities.ReviewTagAssignment.delete({
        where: { id: tagAssignment.id }
      });

      return { success: true, message: "Tag removed" };
    }

    // If adding the tag, ensure the tag exists and belongs to the same session
    const tag = await context.entities.ReviewTag.findUnique({
      where: { id: tagId }
    });

    if (!tag) {
      throw new HttpError(404, "Tag not found");
    }

    if (tag.sessionId !== result.searchSession.id) {
      throw new HttpError(400, "Tag does not belong to the same session as the result");
    }

    // Check if the tag is already assigned
    const existingAssignment = result.reviewTags.find(t => t.tagId === tagId);
    
    if (existingAssignment) {
      return { success: true, message: "Tag already assigned" };
    }

    // Assign the tag
    await context.entities.ReviewTagAssignment.create({
      data: {
        resultId,
        tagId
      }
    });

    return { success: true, message: "Tag assigned successfully" };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error("Error assigning tag:", error);
    throw new HttpError(500, "Failed to assign tag");
  }
};

/**
 * Create a note for a result
 */
export const createNote = async ({ resultId, content }, context) => {
  if (!context.user) {
    throw new HttpError(401, "Unauthorized");
  }

  try {
    // Validate input
    if (!content || !content.trim()) {
      throw new HttpError(400, "Note content is required");
    }

    // Get the result and ensure it exists
    const result = await context.entities.ProcessedResult.findUnique({
      where: { id: resultId },
      include: {
        searchSession: true
      }
    });

    if (!result) {
      throw new HttpError(404, "Result not found");
    }

    // Check if the user has access to the session
    if (result.searchSession.userId !== context.user.id) {
      throw new HttpError(403, "You don't have access to this result");
    }

    // Create the note
    return await context.entities.Note.create({
      data: {
        resultId,
        content
      }
    });
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    
    console.error("Error creating note:", error);
    throw new HttpError(500, "Failed to create note");
  }
}; 