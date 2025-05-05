import { OnBeforeSignupHook } from 'wasp/server/auth';

export const onBeforeSignup: OnBeforeSignupHook = async ({ providerId, req, prisma }) => {
  // In Wasp 0.16.0, we can't modify the data in this hook
  // It should just perform validation or preliminary checks
  console.log('Signup request received for provider ID:', providerId);
  
  // Additional validation can be added here if needed
  const userData = req.body;
  if (userData.role && userData.role !== 'Researcher') {
    // For example, we could limit non-Researcher role creation to admins
    // or implement organization-specific validation
    console.log(`User requesting non-default role: ${userData.role}`);
  }
  
  // No return value needed (void)
}; 