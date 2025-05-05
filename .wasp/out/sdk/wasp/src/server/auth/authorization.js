import { HttpError } from 'wasp/server';

// Define roles and their hierarchies
export const ROLES = {
  ADMIN: 'Admin',
  LEAD_REVIEWER: 'Lead Reviewer',
  RESEARCHER: 'Researcher'
};

// Role hierarchy - higher roles have all permissions of lower roles
const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.LEAD_REVIEWER, ROLES.RESEARCHER],
  [ROLES.LEAD_REVIEWER]: [ROLES.RESEARCHER],
  [ROLES.RESEARCHER]: []
};

/**
 * Check if user has a specific role
 * @param {Object} user - The user object
 * @param {String} role - The role to check
 * @returns {Boolean} True if user has the role
 */
export const hasRole = (user, role) => {
  if (!user) return false;
  
  // Direct role match
  if (user.role === role) return true;
  
  // Check role hierarchy (if user has a higher role that includes this role)
  return ROLE_HIERARCHY[user.role]?.includes(role) || false;
};

/**
 * Check if user has any of the specified roles
 * @param {Object} user - The user object
 * @param {Array} roles - Array of roles to check
 * @returns {Boolean} True if user has any of the roles
 */
export const hasAnyRole = (user, roles) => {
  if (!user || !roles.length) return false;
  return roles.some(role => hasRole(user, role));
};

/**
 * Require a specific role or throw error
 * @param {Object} user - The user object
 * @param {String} role - The required role
 * @param {String} message - Optional custom error message
 * @throws {HttpError} If user doesn't have the required role
 */
export const requireRole = (user, role, message = `Role ${role} required for this operation`) => {
  if (!user) {
    throw new HttpError(401, 'Authentication required');
  }
  
  if (!hasRole(user, role)) {
    throw new HttpError(403, message);
  }
};

/**
 * Require any of the specified roles or throw error
 * @param {Object} user - The user object 
 * @param {Array} roles - Array of acceptable roles
 * @param {String} message - Optional custom error message
 * @throws {HttpError} If user doesn't have any of the required roles
 */
export const requireAnyRole = (user, roles, message = `One of these roles required: ${roles.join(', ')}`) => {
  if (!user) {
    throw new HttpError(401, 'Authentication required');
  }
  
  if (!hasAnyRole(user, roles)) {
    throw new HttpError(403, message);
  }
};

/**
 * Check if user is a session owner or has admin privileges
 * @param {Object} user - The user object
 * @param {String} sessionUserId - The ID of the user who owns the session
 * @returns {Boolean} True if user is owner or admin
 */
export const isSessionOwnerOrAdmin = (user, sessionUserId) => {
  if (!user) return false;
  return user.id === sessionUserId || user.role === ROLES.ADMIN;
};

/**
 * Promote a user to Lead Reviewer
 * @param {Object} prisma - Prisma client
 * @param {String} userId - User ID to promote
 * @returns {Promise<Object>} Updated user
 */
export const promoteToLeadReviewer = async (prisma, userId) => {
  if (!userId) {
    throw new HttpError(400, 'User ID is required');
  }
  
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: ROLES.LEAD_REVIEWER }
    });
    
    return updatedUser;
  } catch (error) {
    console.error('Error promoting user to Lead Reviewer:', error);
    throw new HttpError(500, 'Failed to update user role');
  }
};

/**
 * Check if user can access a specific search session
 * @param {Object} context - The operation context with prisma client
 * @param {String} sessionId - ID of the session to check
 * @param {Object} user - The user object
 * @returns {Promise<Boolean>} True if user can access this session
 * @throws {HttpError} If session not found or user can't access it
 */
export const canAccessSession = async (context, sessionId, user) => {
  if (!user) {
    throw new HttpError(401, 'Authentication required');
  }
  
  if (!sessionId) {
    throw new HttpError(400, 'Session ID is required');
  }
  
  // Admins can access any session
  if (user.role === ROLES.ADMIN) {
    return true;
  }
  
  // Get the session and check ownership
  const session = await context.entities.SearchSession.findUnique({
    where: { id: sessionId },
    select: { userId: true }
  });
  
  if (!session) {
    throw new HttpError(404, 'Search session not found');
  }
  
  // Session owner can always access
  if (session.userId === user.id) {
    return true;
  }
  
  // Lead Reviewers can access sessions if they have specific permissions
  // This would be expanded in Phase 2 with team-based permissions
  if (user.role === ROLES.LEAD_REVIEWER) {
    // In Phase 1, Lead Reviewers can only access their own sessions
    // In Phase 2, this would check team membership
    return false;
  }
  
  // Regular researchers can only access their own sessions
  return false;
}; 