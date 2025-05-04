import { useAuth } from 'wasp/client/auth';

export interface FeatureData {
  icon: string;
  title: string;
  description: string;
}

export interface WorkflowStepData {
  number: string;
  title: string;
  description: string;
}

export function useHomePageData() {
  const { data: user, isLoading } = useAuth();
  
  const features: FeatureData[] = [
    {
      icon: "🔍",
      title: "Search Strategy Building",
      description: "Create and manage comprehensive search strategies with PICO framework support for systematic reviews."
    },
    {
      icon: "⚡",
      title: "Automated Search Execution",
      description: "Execute searches across multiple sources with automated result aggregation and deduplication."
    },
    {
      icon: "📋",
      title: "PRISMA-Compliant Workflow",
      description: "Follow standardized PRISMA guidelines with integrated tools for review and documentation."
    }
  ];
  
  const workflowSteps: WorkflowStepData[] = [
    {
      number: "1",
      title: "Build Strategy",
      description: "Define your search strategy using structured frameworks like PICO."
    },
    {
      number: "2",
      title: "Execute Search",
      description: "Run searches across multiple sources with a single click."
    },
    {
      number: "3",
      title: "Process Results",
      description: "Automatically process, normalize, and deduplicate search results."
    },
    {
      number: "4",
      title: "Review & Report",
      description: "Tag, annotate, and generate PRISMA-compliant reports."
    }
  ];
  
  return {
    user,
    isLoading,
    features,
    workflowSteps
  };
} 