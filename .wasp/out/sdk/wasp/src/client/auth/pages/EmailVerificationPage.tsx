import React from 'react';
import { VerifyEmailForm } from 'wasp/client/auth';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../shared/components/ui/card';

export function EmailVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
          <CardDescription className="text-center">
            Please verify your email address to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VerifyEmailForm />
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