import React, { useState } from 'react';
import { ProcessedResultWithTags, ReviewTag } from '../types';

interface ResultItemProps {
  result: ProcessedResultWithTags;
  tags: ReviewTag[];
  onAssignTag: (resultId: string, tagId: string) => Promise<void>;
  onRemoveTag: (resultId: string, tagId: string) => Promise<void>;
  onAddNote: (resultId: string, content: string) => Promise<void>;
}

export function ResultItem({
  result,
  tags,
  onAssignTag,
  onRemoveTag,
  onAddNote
}: ResultItemProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      alert('Note content is required');
      return;
    }
    
    try {
      await onAddNote(result.id, noteContent);
      setNoteContent('');
      setIsAddingNote(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  return (
    <div className="border rounded p-4">
      <h3 className="text-lg font-medium mb-1">
        <a 
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {result.title}
        </a>
      </h3>
      
      <p className="text-sm text-gray-600 mb-2">{result.url}</p>
      
      {result.snippet && (
        <p className="text-sm mb-3">{result.snippet}</p>
      )}
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {result.reviewTags.map(tagAssignment => (
          <span 
            key={tagAssignment.id}
            className="inline-flex items-center px-2 py-1 rounded text-xs"
            style={{ 
              backgroundColor: `${tagAssignment.tag.color}20`,
              color: tagAssignment.tag.color
            }}
          >
            {tagAssignment.tag.name}
            <button
              onClick={() => onRemoveTag(result.id, tagAssignment.tag.id)}
              className="ml-1 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      {/* Tag Selector */}
      <div className="flex items-center space-x-2 mb-3">
        <label className="text-sm text-gray-700">Add tag:</label>
        <select
          onChange={(e) => {
            if (e.target.value) {
              onAssignTag(result.id, e.target.value);
              e.target.value = ''; // Reset after selection
            }
          }}
          value=""
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Select tag...</option>
          {tags
            .filter(tag => !result.reviewTags.some(rt => rt.tagId === tag.id))
            .map(tag => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
        </select>
      </div>
      
      {/* Notes */}
      {result.notes.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes:</h4>
          <div className="space-y-1">
            {result.notes.map(note => (
              <p key={note.id} className="text-sm text-gray-600 pl-3 border-l-2 border-gray-300">
                {note.content}
              </p>
            ))}
          </div>
        </div>
      )}
      
      {/* Add Note Button/Form */}
      {isAddingNote ? (
        <div className="mt-3 border-t pt-3">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full p-2 border rounded text-sm"
            placeholder="Type your note here..."
            rows={3}
          />
          <div className="flex justify-end mt-2 space-x-2">
            <button
              onClick={() => {
                setIsAddingNote(false);
                setNoteContent('');
              }}
              className="px-3 py-1 border rounded text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Add Note
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingNote(true)}
          className="text-blue-500 text-sm hover:text-blue-700"
        >
          + Add Note
        </button>
      )}
    </div>
  );
} 