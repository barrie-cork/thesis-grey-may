import React, { useState } from 'react';
import { SignupForm } from 'wasp/client/auth';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Alert, AlertDescription } from '../../shared/components/ui/alert';
import { useAuth } from 'wasp/client/auth';

export function SignupPage() {
  const { isLoading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create a new account</CardTitle>
          <CardDescription className="text-center">
            Fill in the details below to sign up
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || formError) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error ? 'Signup failed. Please check your information and try again.' : formError}
              </AlertDescription>
            </Alert>
          )}
          <SignupForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              Sign in to your account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 