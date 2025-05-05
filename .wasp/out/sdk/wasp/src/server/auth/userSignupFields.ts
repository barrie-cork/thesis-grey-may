import { UserSignupFields } from 'wasp/auth/providers/types';

export const userSignupFields: UserSignupFields = {
  email: async (data: any) => {
    // Ensure email exists and is valid
    if (!data.email) {
      throw new Error('Email is required');
    }
    
    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(data.email)) {
      throw new Error('Invalid email format');
    }
    
    return data.email;
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