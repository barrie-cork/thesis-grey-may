import { HttpError } from 'wasp/server';

export const updateUserProfile = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  const { email, role, organizationId } = args;

  // Validate email format
  if (email && !isValidEmail(email)) {
    throw new HttpError(400, 'Invalid email format');
  }

  // Check if email is already in use
  if (email) {
    const existingUser = await context.entities.User.findUnique({
      where: { email }
    });

    if (existingUser && existingUser.id !== context.user.id) {
      throw new HttpError(400, 'Email is already in use');
    }
  }

  // Prepare update data
  const updateData = {};
  if (email !== undefined) updateData.email = email;

  // Phase 2 fields - these will be handled in Phase 2
  if (role !== undefined) {
    // In Phase 2, we would check if the user has permission to change roles
    // For now, don't allow role updates
    // updateData.role = role;
  }

  if (organizationId !== undefined) {
    // In Phase 2, we would validate the organization and user's permission
    // For now, don't allow organization updates
    // updateData.organizationId = organizationId;
  }

  // Update user profile
  try {
    const updatedUser = await context.entities.User.update({
      where: { id: context.user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        organizationId: true,
        updatedAt: true
      }
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new HttpError(500, 'Failed to update user profile');
  }
};

export const changePassword = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  const { currentPassword, newPassword } = args;

  // Validate password
  if (!newPassword || newPassword.length < 8) {
    throw new HttpError(400, 'New password must be at least 8 characters long');
  }

  try {
    // Get user with password
    const user = await context.entities.User.findUnique({
      where: { id: context.user.id },
      select: { password: true }
    });

    // Verify current password
    const passwordValid = await context.auth.verifyPassword(
      currentPassword, 
      user.password
    );

    if (!passwordValid) {
      throw new HttpError(400, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await context.auth.hashPassword(newPassword);

    // Update user password
    await context.entities.User.update({
      where: { id: context.user.id },
      data: { password: hashedPassword }
    });

    return { success: true };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    console.error('Error changing password:', error);
    throw new HttpError(500, 'Failed to change password');
  }
};

// Phase 2 Functions (commented out for now)
/*
export const assignUserRole = async (args, context) => {
  // This would be implemented in Phase 2
  // It would require admin privileges to change user roles
  if (!context.user || context.user.role !== 'admin') {
    throw new HttpError(403, 'Unauthorized: Requires admin privileges');
  }

  const { userId, role } = args;
  
  // Validate role
  const validRoles = ['researcher', 'reviewer', 'admin'];
  if (!validRoles.includes(role)) {
    throw new HttpError(400, `Invalid role: must be one of ${validRoles.join(', ')}`);
  }
  
  // Update user role
  try {
    const updatedUser = await context.entities.User.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        role: true
      }
    });
    
    return updatedUser;
  } catch (error) {
    console.error('Error assigning user role:', error);
    throw new HttpError(500, 'Failed to assign user role');
  }
};
*/

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 