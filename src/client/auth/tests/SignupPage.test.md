# SignupPage Component Test Documentation

This document outlines the SignupPage component implementation and testing procedures.

## Component Overview

The `SignupPage` component has been implemented with the following features:

- Modern UI using Shadcn UI components (Card, Alert, etc.)
- Error handling for form submission errors
- Form validation for required fields
- Default role hint with 'Researcher' as the default role
- Consistent styling with the LoginPage component

## Implementation Details

The component uses:
- Wasp's built-in `SignupForm` component with additional fields (username, role)
- `useAuth` hook to access authentication state and errors
- Shadcn UI's Card components for layout
- Shadcn UI's Alert component for error display

## Testing Procedure

### Manual Testing

1. **Basic Functionality**
   - Navigate to `/signup` route
   - Verify the form displays correctly with username, password, and role fields
   - Verify the "Already have an account?" link works and navigates to login page

2. **Form Validation**
   - Try submitting the form without username → Verify error message appears
   - Try submitting the form without password → Verify error message appears
   - Try submitting the form without role → Verify error message appears
   - Try entering an invalid role (other than 'Researcher' or 'Admin') → Verify error message appears

3. **Successful Signup**
   - Fill in valid details (username: "testuser", password: "Password123!", role: "Researcher")
   - Submit the form
   - Verify successful signup and redirection to homepage

4. **Error Handling**
   - Try signing up with a username that already exists
   - Verify appropriate error message is displayed in the Alert component

### Automated Testing Points (To Be Implemented)

Future automated tests should verify:

1. Component renders without errors
2. Form validation works as expected
3. Error handling displays appropriate messages
4. Successful form submission calls the appropriate authentication functions
5. Role field defaults to 'Researcher' if not provided

## Notes

- The role field accepts 'Researcher' or 'Admin' values, with 'Researcher' as the default
- Password validation happens on the server side through Wasp's authentication system
- The UI has been designed to match the Thesis Grey application's overall aesthetic 