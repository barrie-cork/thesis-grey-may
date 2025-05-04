import { UserSignupFields } from 'wasp/auth/providers/types';

export const userSignupFields: UserSignupFields = {
  username: async (data: any) => {
    // Ensure username exists and is unique
    if (!data.username) {
      throw new Error('Username is required');
    }
    return data.username;
  }
}; 