import { useAuth } from 'wasp/client/auth';

// Define roles
export const ROLES = {
  ADMIN: 'Admin',
  LEAD_REVIEWER: 'Lead Reviewer',
  RESEARCHER: 'Researcher'
};

// Role hierarchy - higher roles have all permissions of lower roles
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.LEAD_REVIEWER, ROLES.RESEARCHER],
  [ROLES.LEAD_REVIEWER]: [ROLES.RESEARCHER],
  [ROLES.RESEARCHER]: []
};

/**
 * Hook for checking user roles
 * @returns {Object} Role check utilities
 */
export function useRoleCheck() {
  const { data: user, isLoading, error } = useAuth();
  
  /**
   * Check if user has a specific role
   * @param {String} role - The role to check
   * @returns {Boolean} True if user has the role, false otherwise
   */
  const hasRole = (role) => {
    if (!user) return false;
    
    // Direct role match
    if (user.role === role) return true;
    
    // Check role hierarchy
    return ROLE_HIERARCHY[user.role]?.includes(role) || false;
  };
  
  /**
   * Check if user has any of the specified roles
   * @param {Array} roles - Array of roles to check
   * @returns {Boolean} True if user has any of the roles
   */
  const hasAnyRole = (roles) => {
    if (!user || !roles.length) return false;
    return roles.some(role => hasRole(role));
  };
  
  /**
   * Check if the current user is the owner of a resource
   * @param {String} userId - User ID of the resource owner
   * @returns {Boolean} True if user is the owner
   */
  const isOwner = (userId) => {
    if (!user) return false;
    return user.id === userId;
  };
  
  /**
   * Check if user is owner or has admin privileges
   * @param {String} userId - User ID of the resource owner
   * @returns {Boolean} True if user is owner or admin
   */
  const isOwnerOrAdmin = (userId) => {
    if (!user) return false;
    return isOwner(userId) || user.role === ROLES.ADMIN;
  };
  
  return {
    user,
    isLoading,
    error,
    hasRole,
    hasAnyRole,
    isOwner,
    isOwnerOrAdmin,
    ROLES
  };
} 