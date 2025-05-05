import React from 'react';
import { ResetPasswordForm } from 'wasp/client/auth';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../shared/components/ui/card';

export function PasswordResetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Return to{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 