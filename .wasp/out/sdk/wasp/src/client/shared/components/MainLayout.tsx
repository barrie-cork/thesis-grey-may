import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, logout } from 'wasp/client/auth';

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const { data: user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  Thesis Grey
                </Link>
              </div>
              {user && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/search-strategy"
                    className={`${
                      isActive('/search-strategy')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Search Strategy
                  </Link>
                  <Link
                    to="/review"
                    className={`${
                      isActive('/review')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Review
                  </Link>
                  <Link
                    to="/reporting"
                    className={`${
                      isActive('/reporting')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Reporting
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  <div className="ml-3 relative">
                    <div className="flex items-center space-x-4">
                      <Link
                        to="/profile"
                        className={`${
                          isActive('/profile')
                            ? 'bg-gray-100'
                            : 'text-gray-500 hover:text-gray-700'
                        } px-3 py-2 rounded-md text-sm font-medium`}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu, show/hide based on menu state. */}
      <div className="sm:hidden bg-white border-b border-gray-200 p-2">
        {user && (
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/search-strategy"
              className={`${
                isActive('/search-strategy')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Search Strategy
            </Link>
            <Link
              to="/review"
              className={`${
                isActive('/review')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Review
            </Link>
            <Link
              to="/reporting"
              className={`${
                isActive('/reporting')
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Reporting
            </Link>
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Thesis Grey — A specialized application for managing grey literature in clinical guideline development
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 