import React, { useState } from 'react';
import { LoginForm } from 'wasp/client/auth';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../shared/components/ui/card';
import { Alert, AlertDescription } from '../../shared/components/ui/alert';
import { useAuth } from 'wasp/client/auth';

export function LoginPage() {
  const { isLoading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your username and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(error || formError) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {error ? 'Authentication failed. Please check your credentials.' : formError}
              </AlertDescription>
            </Alert>
          )}
          <LoginForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/80">
              Create a new account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 