import React, { useState, useEffect } from 'react';
import { useAuth, logout } from 'wasp/client/auth';
import { Link } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getUserProfile } from 'wasp/client/operations';
import { updateUserProfile } from 'wasp/client/operations';
import { MainLayout } from '../../shared/components/MainLayout';

export function ProfilePage() {
  const { data: user } = useAuth();
  const { data: profile, isLoading, error } = useQuery(getUserProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (profile?.email) {
      setEmail(profile.email);
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError('');
    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      await updateUserProfile({ email });
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err: any) {
      setUpdateError(err.message || 'Error updating profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper to display user role information
  const getUserRoleDisplay = () => {
    if (!profile?.role) {
      return 'Researcher'; // Default role in Phase 1
    }
    return profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="spinner-border h-8 w-8 text-blue-600" role="status"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center text-red-600">
            <p>Error loading profile: {error.message}</p>
            <button 
              onClick={() => logout()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
        </div>
        
        <div className="p-6">
          {updateSuccess && (
            <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
              Profile updated successfully!
            </div>
          )}
          
          {updateError && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {updateError}
            </div>
          )}

          {!isEditing ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-gray-500 text-sm font-semibold">Username</h3>
                <p className="mt-1 text-gray-900">{profile?.username}</p>
              </div>
              
              <div>
                <h3 className="text-gray-500 text-sm font-semibold">Email</h3>
                <p className="mt-1 text-gray-900">{profile?.email || 'No email provided'}</p>
              </div>
              
              <div>
                <h3 className="text-gray-500 text-sm font-semibold">Role</h3>
                <p className="mt-1 text-gray-900">{getUserRoleDisplay()}</p>
              </div>

              {/* Organization info - will be used in Phase 2 */}
              {profile?.organizationId && (
                <div>
                  <h3 className="text-gray-500 text-sm font-semibold">Organization</h3>
                  <p className="mt-1 text-gray-900">
                    {/* In Phase 2, this would show the actual organization name */}
                    Connected to organization
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="text-gray-500 text-sm font-semibold">Account Created</h3>
                <p className="mt-1 text-gray-900">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </button>
                
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    disabled
                    value={profile?.username}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Username cannot be changed.</p>
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Role information is read-only in Phase 1 */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="role"
                    name="role"
                    disabled
                    value={getUserRoleDisplay()}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500">Role assignment will be available in a future update.</p>
                </div>
              </div>
              
              <div className="pt-4 flex space-x-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <div className="mt-6 max-w-3xl mx-auto">
        <Link
          to="/"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          ← Back to Home
        </Link>
      </div>
    </MainLayout>
  );
} 