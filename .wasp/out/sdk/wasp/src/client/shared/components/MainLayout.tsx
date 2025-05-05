import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, logout } from 'wasp/client/auth';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Example Header - Replace with actual Header component later */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">Thesis Grey</h1>
          {/* Navigation links can go here */}
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6">
        {children}
      </main>

      {/* Example Footer */}
      <footer className="bg-white mt-8 py-4 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Thesis Grey. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 