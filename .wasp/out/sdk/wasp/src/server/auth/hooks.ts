import { OnBeforeSignupHook } from 'wasp/server/auth';

export const onBeforeSignup: OnBeforeSignupHook = async ({ providerId, req, prisma }) => {
  // In Wasp 0.16.0, we can't modify the data in this hook
  // It should just perform validation or preliminary checks
  console.log('Signup request received for provider ID:', providerId);
  
  // No return value needed (void)
}; 