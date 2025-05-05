import { HttpError } from 'wasp/server';
import { type CreateSearchSession } from 'wasp/server/operations';
import { type User, type SearchSession } from 'wasp/entities';
import { Prisma, PrismaClient } from '@prisma/client'; // Import Prisma types for casting and PrismaClient

// Role constants (can be removed if not used elsewhere in this file)
// const ROLES = {
//   RESEARCHER: 'Researcher',
//   LEAD_REVIEWER: 'Lead Reviewer',
//   ADMIN: 'Admin',
// } as const;

type CreateSearchSessionArgs = {
  name: string;
  description?: string | null; // Make description optional
};

/**
 * Create a new search session.
 * In Phase 1, the creator implicitly becomes the Lead Reviewer for this session.
 * Authorization checks elsewhere should verify ownership (context.user.id === session.userId).
 */
export const createSearchSession = (async (
  args: CreateSearchSessionArgs, // Explicitly type args
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  const { name, description } = args;

  // Validate inputs (name is now guaranteed to be string)
  if (!name || name.trim() === '') {
    throw new HttpError(400, 'Session name is required');
  }

  try {
    // Cast context.entities._prisma to PrismaClient to access $transaction
    const prisma = (context.entities as any)._prisma as PrismaClient;
    
    // Now call $transaction on the main PrismaClient instance
    const newSession = await prisma.$transaction(async (tx) => {
      // tx is of type Prisma.TransactionClient, used for operations within the transaction
      const session = await tx.searchSession.create({
        data: {
          name: name.trim(), // Trim whitespace from name
          description: description?.trim(), // Trim description if provided
          userId: context.user!.id // context.user is guaranteed non-null here
        }
      });
      
      // 2. REMOVED: User role promotion logic is deferred to Phase 2 (or handled implicitly)
      // console.log(`User ${context.user!.id} created session ${session.id}. No role promotion in Phase 1.`);
            
      return session; // Return only the created session
    });

    // Log success
    console.log('Search session created successfully:', newSession);

    return newSession;
  } catch (error) {
    console.error('Error creating search session:', error);
    // Check for specific Prisma errors if needed, otherwise throw generic error
    throw new HttpError(500, 'Failed to create search session. Please check server logs.');
  }
}) satisfies CreateSearchSession;

// createSearchQuery action will be added later 