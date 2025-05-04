import React from 'react';

interface WorkflowStepProps {
  number: string;
  title: string;
  description: string;
}

export function WorkflowStep({ number, title, description }: WorkflowStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
} 