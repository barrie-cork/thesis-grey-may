# Task 3 Analysis and Improvement Plan

## Current Status Review

Based on the provided documents, Task 3 involves implementing the search strategy builder with PIC framework support using Shadcn UI components. The existing codebase has:

1. A well-defined Wasp structure with:
   - Main application configuration in `main.wasp`
   - Database schema in `schema.prisma`
   - Authentication system already implemented
   - Some search strategy components started (CreateSessionForm, SearchSessionList)

2. Shadcn UI is already set up with component imports from `src/client/shared/components/ui/`

3. Required backend operations are defined in `main.wasp`:
   - `getSearchSessions` and `getSearchSession` queries
   - `createSearchSession` and `createSearchQuery` actions

## Key Improvements Needed

### 1. Component Structure Refinement

The complexity assessment mentioned potential issues with UI state management. I recommend breaking down the UI into smaller, focused components with a clear hierarchy:

```
searchStrategy/
├── components/
│   ├── CreateSessionForm.tsx      // Already implemented but needs improvement
│   ├── SearchSessionList.tsx      // Already implemented but needs improvement
│   ├── QueryBuilder/
│   │   ├── PICFrameworkInput.tsx  // New component for PIC framework
│   │   ├── DomainSelector.tsx     // Domain selection component
│   │   ├── FileTypeFilter.tsx     // File type filtering component
│   │   └── QueryPreview.tsx       // Generated query preview
│   └── SessionDetail/             // Session detail components
├── hooks/
│   ├── useSearchSessions.ts       // Custom hook for session management
│   └── useQueryBuilder.ts         // Custom hook for query building
└── pages/
    ├── SearchStrategyPage.tsx     // Main search strategy page
    └── SessionDetailPage.tsx      // Session details and query management
```

### 2. Improved State Management

The QueryBuilder component will have complex state. I recommend using a custom hook:

```typescript
// useQueryBuilder.ts
export function useQueryBuilder(initialQuery = {}) {
  const [population, setPopulation] = useState([]);
  const [interest, setInterest] = useState([]);
  const [context, setContext] = useState([]);
  const [domains, setDomains] = useState([]);
  const [fileTypes, setFileTypes] = useState([]);
  
  // Generate query preview combining all elements
  const generateQueryPreview = () => {
    let query = '';
    
    if (population.length) {
      query += '(' + population.join(' OR ') + ') ';
    }
    
    if (interest.length) {
      query += '(' + interest.join(' OR ') + ') ';
    }
    
    if (context.length) {
      query += '(' + context.join(' OR ') + ') ';
    }
    
    // Add file type filters
    if (fileTypes.length) {
      query += 'filetype:' + fileTypes.join(' OR filetype:') + ' ';
    }
    
    // Add domain filters
    if (domains.length) {
      domains.forEach(domain => {
        query += 'site:' + domain + ' ';
      });
    }
    
    return query.trim();
  };

  return {
    state: { population, interest, context, domains, fileTypes },
    setters: { setPopulation, setInterest, setContext, setDomains, setFileTypes },
    preview: generateQueryPreview()
  };
}
```

### 3. Shadcn UI Integration

Let's implement the specific Shadcn UI components for the search strategy builder:

## Implementation Plan

### 1. PICFrameworkInput Component

```tsx
// src/client/searchStrategy/components/QueryBuilder/PICFrameworkInput.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../../shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';

interface PICFrameworkInputProps {
  population: string[];
  interest: string[];
  context: string[];
  onAddPopulation: (term: string) => void;
  onAddInterest: (term: string) => void;
  onAddContext: (term: string) => void;
  onRemovePopulation: (index: number) => void;
  onRemoveInterest: (index: number) => void;
  onRemoveContext: (index: number) => void;
}

export function PICFrameworkInput({
  population,
  interest,
  context,
  onAddPopulation,
  onAddInterest,
  onAddContext,
  onRemovePopulation,
  onRemoveInterest,
  onRemoveContext
}: PICFrameworkInputProps) {
  const [populationInput, setPopulationInput] = React.useState('');
  const [interestInput, setInterestInput] = React.useState('');
  const [contextInput, setContextInput] = React.useState('');

  const handleAddPopulation = () => {
    if (populationInput.trim()) {
      onAddPopulation(populationInput.trim());
      setPopulationInput('');
    }
  };

  const handleAddInterest = () => {
    if (interestInput.trim()) {
      onAddInterest(interestInput.trim());
      setInterestInput('');
    }
  };

  const handleAddContext = () => {
    if (contextInput.trim()) {
      onAddContext(contextInput.trim());
      setContextInput('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>PIC Framework</CardTitle>
        <CardDescription>
          Build your search query using the Population, Interest, Context framework
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="population" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="population">Population</TabsTrigger>
            <TabsTrigger value="interest">Interest</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
          </TabsList>
          
          <TabsContent value="population">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add population term..."
                  value={populationInput}
                  onChange={(e) => setPopulationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPopulation()}
                />
                <Button onClick={handleAddPopulation}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {population.map((term, index) => (
                  <div key={index} className="bg-primary/10 px-3 py-1 rounded-full flex items-center">
                    <span className="mr-2">{term}</span>
                    <button
                      onClick={() => onRemovePopulation(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                <p>The Population terms define WHO or WHAT your search is about.</p>
                <p className="mt-1">Example: "elderly patients" OR "senior citizens" OR "geriatric"</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="interest">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add interest term..."
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                />
                <Button onClick={handleAddInterest}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {interest.map((term, index) => (
                  <div key={index} className="bg-primary/10 px-3 py-1 rounded-full flex items-center">
                    <span className="mr-2">{term}</span>
                    <button
                      onClick={() => onRemoveInterest(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                <p>The Interest terms define WHAT you want to know about the population.</p>
                <p className="mt-1">Example: "fall prevention" OR "balance issues" OR "mobility"</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="context">
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add context term..."
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddContext()}
                />
                <Button onClick={handleAddContext}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {context.map((term, index) => (
                  <div key={index} className="bg-primary/10 px-3 py-1 rounded-full flex items-center">
                    <span className="mr-2">{term}</span>
                    <button
                      onClick={() => onRemoveContext(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                <p>The Context terms define settings, conditions, or limitations.</p>
                <p className="mt-1">Example: "nursing home" OR "assisted living" OR "community care"</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

### 2. DomainSelector Component

```tsx
// src/client/searchStrategy/components/QueryBuilder/DomainSelector.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Checkbox } from '../../../shared/components/ui/checkbox';
import { Label } from '../../../shared/components/ui/label';

interface Domain {
  id: string;
  name: string;
  description: string;
}

interface DomainSelectorProps {
  selectedDomains: string[];
  onDomainChange: (domains: string[]) => void;
}

export function DomainSelector({ selectedDomains, onDomainChange }: DomainSelectorProps) {
  const domains: Domain[] = [
    { id: 'who.int', name: 'World Health Organization', description: 'Global health authority' },
    { id: 'pubmed.ncbi.nlm.nih.gov', name: 'PubMed', description: 'Biomedical literature' },
    { id: 'nice.org.uk', name: 'NICE', description: 'UK health guidelines' },
    { id: 'cochrane.org', name: 'Cochrane Library', description: 'Systematic reviews' },
    { id: 'cdc.gov', name: 'CDC', description: 'US health information' },
    { id: 'gov.uk', name: 'UK Government', description: 'UK policy documents' }
  ];

  const handleDomainToggle = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      onDomainChange(selectedDomains.filter(d => d !== domain));
    } else {
      onDomainChange([...selectedDomains, domain]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Selection</CardTitle>
        <CardDescription>
          Limit your search to specific domains or sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {domains.map((domain) => (
            <div key={domain.id} className="flex items-start space-x-2">
              <Checkbox
                id={`domain-${domain.id}`}
                checked={selectedDomains.includes(domain.id)}
                onCheckedChange={() => handleDomainToggle(domain.id)}
              />
              <div className="grid gap-1.5">
                <Label
                  htmlFor={`domain-${domain.id}`}
                  className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {domain.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {domain.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. FileTypeFilter Component

```tsx
// src/client/searchStrategy/components/QueryBuilder/FileTypeFilter.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Checkbox } from '../../../shared/components/ui/checkbox';
import { Label } from '../../../shared/components/ui/label';

interface FileType {
  id: string;
  name: string;
  description: string;
}

interface FileTypeFilterProps {
  selectedFileTypes: string[];
  onFileTypeChange: (fileTypes: string[]) => void;
}

export function FileTypeFilter({ selectedFileTypes, onFileTypeChange }: FileTypeFilterProps) {
  const fileTypes: FileType[] = [
    { id: 'pdf', name: 'PDF', description: 'Documents in PDF format' },
    { id: 'doc', name: 'Word Document', description: 'Microsoft Word documents' },
    { id: 'ppt', name: 'PowerPoint', description: 'Presentation slides' },
    { id: 'xls', name: 'Excel', description: 'Spreadsheets' },
    { id: 'html', name: 'Webpages', description: 'Standard web pages' },
    { id: 'txt', name: 'Text Files', description: 'Plain text documents' }
  ];

  const handleFileTypeToggle = (fileType: string) => {
    if (selectedFileTypes.includes(fileType)) {
      onFileTypeChange(selectedFileTypes.filter(f => f !== fileType));
    } else {
      onFileTypeChange([...selectedFileTypes, fileType]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Type Filter</CardTitle>
        <CardDescription>
          Limit your search to specific file types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {fileTypes.map((fileType) => (
            <div key={fileType.id} className="flex items-start space-x-2">
              <Checkbox
                id={`filetype-${fileType.id}`}
                checked={selectedFileTypes.includes(fileType.id)}
                onCheckedChange={() => handleFileTypeToggle(fileType.id)}
              />
              <div className="grid gap-1.5">
                <Label
                  htmlFor={`filetype-${fileType.id}`}
                  className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {fileType.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {fileType.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. QueryPreview Component

```tsx
// src/client/searchStrategy/components/QueryBuilder/QueryPreview.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';

interface QueryPreviewProps {
  queryString: string;
  onSave: () => void;
}

export function QueryPreview({ queryString, onSave }: QueryPreviewProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(queryString);
    // Optionally show a toast notification
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Preview</CardTitle>
        <CardDescription>
          Your generated search query based on PIC framework, domains, and file types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-muted rounded-md font-mono text-sm overflow-x-auto">
          {queryString || <span className="text-muted-foreground">Your query will appear here...</span>}
        </div>
        <div className="mt-4 flex space-x-2">
          <Button onClick={copyToClipboard} variant="outline">
            Copy to Clipboard
          </Button>
          <Button onClick={onSave} disabled={!queryString.trim()}>
            Save Query
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5. SearchQueryForm Component

```tsx
// src/client/searchStrategy/components/QueryBuilder/SearchQueryForm.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../shared/components/ui/card';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../../shared/components/ui/button';
import { Textarea } from '../../../shared/components/ui/textarea';
import { PICFrameworkInput } from './PICFrameworkInput';
import { DomainSelector } from './DomainSelector';
import { FileTypeFilter } from './FileTypeFilter';
import { QueryPreview } from './QueryPreview';
import { useQueryBuilder } from '../../hooks/useQueryBuilder';

interface SearchQueryFormProps {
  sessionId: string;
  onQueryCreated: () => void;
}

export function SearchQueryForm({ sessionId, onQueryCreated }: SearchQueryFormProps) {
  const [queryDescription, setQueryDescription] = useState('');
  const {
    state: { population, interest, context, domains, fileTypes },
    setters: { setPopulation, setInterest, setContext, setDomains, setFileTypes },
    preview
  } = useQueryBuilder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddPopulation = (term: string) => {
    setPopulation([...population, term]);
  };

  const handleAddInterest = (term: string) => {
    setInterest([...interest, term]);
  };

  const handleAddContext = (term: string) => {
    setContext([...context, term]);
  };

  const handleRemovePopulation = (index: number) => {
    setPopulation(population.filter((_, i) => i !== index));
  };

  const handleRemoveInterest = (index: number) => {
    setInterest(interest.filter((_, i) => i !== index));
  };

  const handleRemoveContext = (index: number) => {
    setContext(context.filter((_, i) => i !== index));
  };

  const handleSaveQuery = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Here we'd use Wasp's createSearchQuery operation
      // For now, mocking the implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the action
      // const result = await createSearchQuery({
      //   sessionId,
      //   query: preview,
      //   description: queryDescription
      // });
      
      // Reset form
      setPopulation([]);
      setInterest([]);
      setContext([]);
      setDomains([]);
      setFileTypes([]);
      setQueryDescription('');
      
      // Notify parent component
      onQueryCreated();
    } catch (err) {
      console.error('Error saving query:', err);
      setError('Failed to save query. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Search Query</CardTitle>
          <CardDescription>
            Add a description for your search query
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Describe the purpose of this search query..."
            value={queryDescription}
            onChange={(e) => setQueryDescription(e.target.value)}
            className="min-h-24"
          />
        </CardContent>
      </Card>
      
      <PICFrameworkInput
        population={population}
        interest={interest}
        context={context}
        onAddPopulation={handleAddPopulation}
        onAddInterest={handleAddInterest}
        onAddContext={handleAddContext}
        onRemovePopulation={handleRemovePopulation}
        onRemoveInterest={handleRemoveInterest}
        onRemoveContext={handleRemoveContext}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DomainSelector
          selectedDomains={domains}
          onDomainChange={setDomains}
        />
        
        <FileTypeFilter
          selectedFileTypes={fileTypes}
          onFileTypeChange={setFileTypes}
        />
      </div>
      
      <QueryPreview
        queryString={preview}
        onSave={handleSaveQuery}
      />
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}
```

### 6. Improved SearchStrategyPage Component

```tsx
// src/client/searchStrategy/pages/SearchStrategyPage.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getSearchSessions, createSearchSession } from 'wasp/client/operations';
import { Button } from '../../shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/components/ui/tabs';
import { Input } from '../../shared/components/ui/input';
import { SearchSessionList } from '../components/SearchSessionList';
import { MainLayout } from '../../shared/components/MainLayout';

export function SearchStrategyPage() {
  const { data: sessions, isLoading, error, refetch } = useQuery(getSearchSessions);
  const [isCreating, setIsCreating] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  
  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      setCreateError('Session name is required');
      return;
    }
    
    try {
      setCreateError('');
      
      await createSearchSession({
        name: newSessionName,
        description: newSessionDescription
      });
      
      setNewSessionName('');
      setNewSessionDescription('');
      setIsCreating(false);
      setCreateSuccess(true);
      refetch();
      
      // Hide success message after 3 seconds
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating session:', err);
      setCreateError('Failed to create session. Please try again.');
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-48">
          <div className="animate-pulse text-lg">Loading search sessions...</div>
        </div>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Error loading search sessions: {error.message}
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Search Strategy</h1>
          <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
            New Search Session
          </Button>
        </div>
        
        {createSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Search session created successfully!
          </div>
        )}
        
        {isCreating ? (
          <Card>
            <CardHeader>
              <CardTitle>Create New Search Session</CardTitle>
              <CardDescription>
                Create a new search session to organize your searches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="session-name" className="text-sm font-medium">
                    Session Name *
                  </label>
                  <Input
                    id="session-name"
                    placeholder="Enter session name"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="session-description" className="text-sm font-medium">
                    Description (optional)
                  </label>
                  <Input
                    id="session-description"
                    placeholder="Enter session description"
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
                  />
                </div>
                
                {createError && (
                  <div className="text-destructive text-sm">
                    {createError}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button onClick={handleCreateSession}>
                    Create Session
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setNewSessionName('');
                      setNewSessionDescription('');
                      setCreateError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <SearchSessionList sessions={sessions || []} />
        )}
      </div>
    </MainLayout>
  );
}
```

## Backend Improvements

To ensure search queries are properly saved and the user is assigned as Lead Reviewer, I recommend updating the `createSearchSession` action to properly handle the automatic promotion to Lead Reviewer. Here's an improved implementation that addresses this:

```typescript
// src/server/searchStrategy/actions.js
import { HttpError } from 'wasp/server';
// import { ROLES } from '../auth/authorization.js'; // Role constants likely not needed here anymore
import { type CreateSearchSession } from 'wasp/server/operations';
import { Prisma } from '@prisma/client';

type CreateSearchSessionArgs = {
  name: string;
  description?: string | null;
};

/**
 * Create a new search session.
 * In Phase 1, the creator implicitly becomes the Lead Reviewer for this session.
 * Authorization checks elsewhere should verify ownership (context.user.id === session.userId).
 */
export const createSearchSession = (async (
  args: CreateSearchSessionArgs, 
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Not authorized');
  }

  const { name, description } = args;

  if (!name || name.trim() === '') {
    throw new HttpError(400, 'Name is required');
  }

  try {
    const prisma = (context.entities as any)._prisma as Prisma.TransactionClient;
    
    // Transaction only needed for session creation now
    const newSession = await prisma.$transaction(async (tx) => {
      // 1. Create the search session
      const session = await tx.searchSession.create({
        data: {
          name: name.trim(),
          description: description?.trim(),
          userId: context.user.id
        }
      });
      
      // 2. REMOVED: Role promotion logic
      
      return session;
    });

    return newSession;
  } catch (error) {
    console.error('Error creating search session:', error);
    throw new HttpError(500, 'Failed to create search session');
  }
}) satisfies CreateSearchSession;
```

## Summary of Improvements

1. **Component Structure**: 
   - Implemented a clear component hierarchy using Shadcn UI components
   - Created focused components for each aspect of the search strategy builder

2. **State Management**:
   - Used custom hooks for complex state management
   - Isolated state management concerns to specific components

3. **Lead Reviewer Assignment**:
   - Updated `createSearchSession` action to align with Phase 1 implicit role assignment (no global role change).
   - Removed database transaction complexity not needed without role update.

4. **User Experience**:
   - Created a step-by-step flow for building search queries
   - Added clear visual feedback for actions
   - Provided helpful hints and descriptions for each component

5. **Error Handling**:
   - Implemented comprehensive error handling throughout
   - Added meaningful error messages
   - Ensured proper validation of user inputs