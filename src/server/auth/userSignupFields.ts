import { UserSignupFields } from 'wasp/auth/providers/types';

export const userSignupFields: UserSignupFields = {
  username: async (data: any) => {
    // Ensure username exists
    if (!data.username) {
      throw new Error('Username is required');
    }
    // Add any other username validation if needed
    return data.username;
  },
  role: async (data: any) => {
    // Only allow Researcher or Admin selection at signup for Phase 1
    const validRoles = ['Researcher', 'Admin'];
    
    // Default to 'Researcher' if role is empty or not provided, or invalid
    const providedRole = data.role ? String(data.role).trim() : '';
    const role = validRoles.includes(providedRole) ? providedRole : 'Researcher';

    if (providedRole && !validRoles.includes(providedRole)) {
      // Optionally log a warning if an invalid role was attempted
      console.warn(`Invalid role "${providedRole}" provided during signup. Defaulting to 'Researcher'.`);
    }
    
    return role;
  }
}; 