/**
 * User Entity Test
 * 
 * This is a manual test file that can be run to verify the User entity functionality.
 * Note: Wasp doesn't have built-in testing, so this is more of a guide for manual testing.
 */

// Test Cases for User Entity:

/**
 * Test Case 1: User Registration
 * 
 * 1. Visit /signup
 * 2. Fill in the form with:
 *    - Username: testuser123
 *    - Email: test@example.com
 *    - Password: SecurePassword123!
 * 3. Submit the form
 * 4. Expected: User created successfully and redirected to homepage
 * 5. Verification: Check the database using wasp db studio
 */

/**
 * Test Case 2: User Login
 * 
 * 1. Visit /login
 * 2. Enter credentials:
 *    - Username: testuser123 (or email: test@example.com)
 *    - Password: SecurePassword123!
 * 3. Submit the form
 * 4. Expected: Successful login and redirect to homepage
 * 5. Verification: Check that the user object is available in client using useAuth()
 */

/**
 * Test Case 3: User Role
 * 
 * 1. Create a user with default role (should be 'Researcher')
 * 2. Verify in database that role is set correctly
 * 3. Test that user can access Researcher-level functionality
 */

/**
 * Test Case 4: Protected Routes
 * 
 * 1. Visit a protected route (e.g., /profile) while logged out
 * 2. Expected: Redirect to login page
 * 3. Login and revisit the protected route
 * 4. Expected: Access granted to the protected page
 */

/**
 * How to run these tests manually:
 * 
 * 1. Start the application: wasp start
 * 2. Open a browser and navigate to localhost:3000
 * 3. Follow the steps in each test case
 * 4. To check the database, run: wasp db studio
 */ 