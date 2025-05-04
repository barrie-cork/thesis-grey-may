import React, { useState } from 'react';

interface SearchEngineSelectorProps {
  onSelect: (engines: string[]) => void;
  selectedEngines?: string[];
}

export function SearchEngineSelector({ onSelect, selectedEngines = [] }: SearchEngineSelectorProps) {
  const [selected, setSelected] = useState<string[]>(selectedEngines);
  
  const availableEngines = [
    { id: 'google', name: 'Google', icon: '🔍' },
    { id: 'bing', name: 'Bing', icon: '🔎' },
    { id: 'pubmed', name: 'PubMed', icon: '📚' },
    { id: 'cochrane', name: 'Cochrane Library', icon: '🔬' },
    { id: 'who', name: 'WHO', icon: '🌐' },
    { id: 'nice', name: 'NICE', icon: '📋' }
  ];
  
  const toggleEngine = (engineId: string) => {
    const newSelected = selected.includes(engineId)
      ? selected.filter(id => id !== engineId)
      : [...selected, engineId];
    
    setSelected(newSelected);
    onSelect(newSelected);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium mb-3">Select Search Engines</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {availableEngines.map(engine => (
          <div 
            key={engine.id}
            onClick={() => toggleEngine(engine.id)}
            className={`flex items-center p-3 rounded-md cursor-pointer border ${
              selected.includes(engine.id) 
                ? 'bg-blue-50 border-blue-300 text-blue-800' 
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl mr-2">{engine.icon}</span>
            <span>{engine.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 