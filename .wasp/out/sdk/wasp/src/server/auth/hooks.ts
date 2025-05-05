import { OnBeforeSignupHook } from 'wasp/server/auth';
import { HttpError } from 'wasp/server';
import { type User } from 'wasp/entities';

export const onBeforeSignup: OnBeforeSignupHook = async ({ providerId, req, prisma }) => {
  // In Wasp 0.16.0, we can't modify the data in this hook
  // It should just perform validation or preliminary checks
  console.log('Signup request received for provider ID:', providerId);
  
  // Explicitly check for existing email before allowing signup
  if (providerId.providerName === 'email' && req.body?.email) {
    const email = req.body.email;
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Throwing HttpError here should properly signal failure to the client
      throw new HttpError(400, 'Validation failed: Email is already in use.');
    }
  }
  
  // Additional validation can be added here if needed
  const userData = req.body;
  if (userData.role && userData.role !== 'Researcher') {
    // For example, we could limit non-Researcher role creation to admins
    // or implement organization-specific validation
    console.log(`User requesting non-default role: ${userData.role}`);
  }
  
  // No return value needed (void)
}; 