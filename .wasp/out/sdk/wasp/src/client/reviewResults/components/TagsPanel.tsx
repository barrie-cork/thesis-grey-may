import React, { useState } from 'react';
import { ReviewTag } from 'wasp/entities';

interface TagsPanelProps {
  tags: ReviewTag[];
  selectedTagId: string | null;
  untaggedOnly: boolean;
  onSelectTag: (tagId: string | null) => void;
  onToggleUntaggedOnly: (value: boolean) => void;
  onCreateTag: (name: string, color: string) => Promise<void>;
}

export function TagsPanel({
  tags,
  selectedTagId,
  untaggedOnly,
  onSelectTag,
  onToggleUntaggedOnly,
  onCreateTag
}: TagsPanelProps) {
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6'); // Default blue

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      alert('Tag name is required');
      return;
    }
    
    try {
      await onCreateTag(newTagName, newTagColor);
      setNewTagName('');
      setIsCreatingTag(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tags</h2>
        <button
          onClick={() => setIsCreatingTag(!isCreatingTag)}
          className="text-blue-500 hover:text-blue-700"
        >
          {isCreatingTag ? 'Cancel' : '+ Add Tag'}
        </button>
      </div>
      
      {isCreatingTag && (
        <div className="mb-4 p-3 border rounded">
          <div className="mb-2">
            <label className="block text-sm text-gray-700 mb-1">Tag Name</label>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter tag name"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-700 mb-1">Color</label>
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="w-full p-1 border rounded"
            />
          </div>
          <button
            onClick={handleCreateTag}
            className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            Create Tag
          </button>
        </div>
      )}
      
      <div className="space-y-2">
        <button
          onClick={() => {
            onSelectTag(null);
            onToggleUntaggedOnly(false);
          }}
          className={`w-full text-left px-3 py-2 rounded ${
            !selectedTagId && !untaggedOnly ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
          }`}
        >
          All Results
        </button>
        <button
          onClick={() => {
            onSelectTag(null);
            onToggleUntaggedOnly(true);
          }}
          className={`w-full text-left px-3 py-2 rounded ${
            untaggedOnly ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
          }`}
        >
          Untagged Results
        </button>
        
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => {
              onSelectTag(tag.id);
              onToggleUntaggedOnly(false);
            }}
            className={`w-full text-left px-3 py-2 rounded flex items-center ${
              selectedTagId === tag.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
            }`}
          >
            <span 
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: tag.color }}
            ></span>
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
} 