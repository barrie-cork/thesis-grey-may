import React from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../shared/components/MainLayout';
import { FeatureCard } from '../components/FeatureCard';
import { WorkflowStep } from '../components/WorkflowStep';
import { useHomePageData } from '../hooks/useHomePageData';

export function HomePage() {
  const { user, isLoading, features, workflowSteps } = useHomePageData();
  
  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16 px-4 rounded-lg">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Thesis Grey
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-3xl">
            A specialized search application designed to facilitate the discovery and management of grey literature for clinical guideline development.
          </p>
          {!isLoading && !user ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="px-8 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-gray-100 text-center"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border border-white text-white rounded-md font-semibold hover:bg-blue-600 text-center"
              >
                Log In
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/search-strategy"
                className="px-8 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-gray-100 text-center"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Workflow Section */}
      <div className="py-16 px-4 bg-gray-50 rounded-lg">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Streamlined Workflow</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {workflowSteps.map((step, index) => (
              <WorkflowStep 
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 px-4 bg-blue-500 text-white rounded-lg mt-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your literature reviews?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join researchers who are saving time and improving their systematic reviews.
          </p>
          {!isLoading && !user ? (
            <Link
              to="/signup"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-gray-100"
            >
              Get Started Now
            </Link>
          ) : (
            <Link
              to="/search-strategy"
              className="inline-block px-8 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-gray-100"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 