import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../../shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/components/ui/tabs';
import { Badge } from '../../../shared/components/ui/badge'; // Using Badge for terms
import { X } from 'lucide-react'; // Icon for removing terms

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

  // Helper to render term list with remove buttons
  const renderTermList = (terms: string[], onRemove: (index: number) => void) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {terms.map((term, index) => (
        <Badge key={index} variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
          <span>{term}</span>
          <button
            onClick={() => onRemove(index)}
            className="rounded-full hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label={`Remove ${term}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>PIC Framework</CardTitle>
        <CardDescription>
          Build your search query using the Population, Interest, Context framework.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="population" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="population">Population</TabsTrigger>
            <TabsTrigger value="interest">Interest</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
          </TabsList>
          
          {/* Population Tab */}
          <TabsContent value="population">
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add population term (e.g., elderly patients)"
                  value={populationInput}
                  onChange={(e) => setPopulationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPopulation()}
                />
                <Button onClick={handleAddPopulation}>Add</Button>
              </div>
              {renderTermList(population, onRemovePopulation)}
              <div className="text-sm text-muted-foreground pt-2">
                <p>Define WHO or WHAT your search is about.</p>
                <p className="mt-1 italic">Example: "elderly patients" OR "senior citizens" OR "geriatric"</p>
              </div>
            </div>
          </TabsContent>
          
          {/* Interest Tab */}
          <TabsContent value="interest">
             <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add interest term (e.g., fall prevention)"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                />
                <Button onClick={handleAddInterest}>Add</Button>
              </div>
              {renderTermList(interest, onRemoveInterest)}
              <div className="text-sm text-muted-foreground pt-2">
                <p>Define WHAT you want to know about the population.</p>
                <p className="mt-1 italic">Example: "fall prevention" OR "balance issues" OR "mobility"</p>
              </div>
            </div>
          </TabsContent>
          
          {/* Context Tab */}
          <TabsContent value="context">
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add context term (e.g., nursing home)"
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddContext()}
                />
                <Button onClick={handleAddContext}>Add</Button>
              </div>
              {renderTermList(context, onRemoveContext)}
              <div className="text-sm text-muted-foreground pt-2">
                <p>Define settings, conditions, or limitations.</p>
                <p className="mt-1 italic">Example: "nursing home" OR "assisted living" OR "community care"</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 