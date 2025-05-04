import { HttpError } from 'wasp/server';

export const getUserProfile = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  try {
    const user = await context.entities.User.findUnique({
      where: { id: context.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // Phase 2 fields
        role: true,
        organizationId: true
        // In Phase 2, we would also include organization data:
        // organization: {
        //   select: {
        //     id: true,
        //     name: true
        //   }
        // }
      }
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(500, 'Failed to fetch user profile');
  }
};

export const getUserSearchSessions = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  try {
    // Build query with Phase 2 in mind
    const whereClause = { userId: context.user.id };
    
    // In Phase 2, we would also include team-based access
    // if (context.user.role && (context.user.role === 'reviewer' || context.user.role === 'admin')) {
    //   // Allow access to team sessions
    //   whereClause = {
    //     OR: [
    //       { userId: context.user.id },
    //       { team: { members: { some: { userId: context.user.id } } } }
    //     ]
    //   };
    // }

    // Filter by optional parameters
    if (args?.isTemplate !== undefined) {
      whereClause.isTemplate = args.isTemplate;
    }

    const sessions = await context.entities.SearchSession.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        // Phase 2 fields
        teamId: true,
        isTemplate: true,
        _count: {
          select: {
            searchQueries: true,
            processedResults: true
          }
        }
      }
    });

    return sessions;
  } catch (error) {
    console.error('Error fetching user search sessions:', error);
    throw new HttpError(500, 'Failed to fetch search sessions');
  }
};

// Phase 2 Functions (commented out for now)
/*
export const getOrganizationUsers = async (args, context) => {
  // This would be implemented in Phase 2
  // It would require admin or appropriate privileges
  if (!context.user || !context.user.role || !['admin', 'manager'].includes(context.user.role)) {
    throw new HttpError(403, 'Unauthorized: Insufficient privileges');
  }

  const { organizationId } = args;
  
  if (!organizationId) {
    throw new HttpError(400, 'Organization ID is required');
  }
  
  // Ensure user belongs to the organization
  const userOrg = await context.entities.User.findUnique({
    where: { id: context.user.id },
    select: { organizationId: true }
  });
  
  if (userOrg.organizationId !== organizationId) {
    throw new HttpError(403, 'You do not have access to this organization');
  }
  
  try {
    const users = await context.entities.User.findMany({
      where: { organizationId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { username: 'asc' }
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching organization users:', error);
    throw new HttpError(500, 'Failed to fetch organization users');
  }
};
*/ 