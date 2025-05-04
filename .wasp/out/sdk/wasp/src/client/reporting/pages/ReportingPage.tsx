import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getReportData } from 'wasp/client/operations';
import { exportResults } from 'wasp/client/operations';

export function ReportingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const reportQuery = useQuery(getReportData, { sessionId: sessionId! });
  
  if (!sessionId) {
    return <div className="p-4 text-red-500">Session ID is required</div>;
  }
  
  if (reportQuery.isLoading) {
    return <div className="p-4">Loading report data...</div>;
  }
  
  if (reportQuery.error) {
    return <div className="p-4 text-red-500">Error: {reportQuery.error.message}</div>;
  }
  
  const { summary, queries, tags, fileTypes } = reportQuery.data || {
    summary: {},
    queries: [],
    tags: [],
    fileTypes: []
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const result = await exportResults();
      
      // Create a blob and download the file
      const blob = new Blob([result.content], {
        type: exportFormat === 'csv' ? 'text/csv' : 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export results:', error);
      alert(`Failed to export results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Reporting & Export</h1>
      
      {/* Session Summary Card */}
      <div className="bg-white shadow rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{summary.name}</h2>
        {summary.description && (
          <p className="text-gray-600 mb-4">{summary.description}</p>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Queries"
            value={summary.queriesCount}
            icon="📝"
          />
          <StatCard
            title="Raw Results"
            value={summary.rawResultsCount}
            icon="📊"
          />
          <StatCard
            title="Processed Results"
            value={summary.processedResultsCount}
            icon="✅"
          />
          <StatCard
            title="Duplicates"
            value={summary.duplicatesCount}
            icon="🔄"
          />
        </div>
      </div>
      
      {/* PRISMA Flow */}
      <div className="bg-white shadow rounded p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">PRISMA Flow</h2>
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="flex flex-col items-center">
              {/* Identification */}
              <FlowBox
                title="Identification"
                details={[
                  `${summary.rawResultsCount} results identified through search queries`,
                  `${queries.length} search queries executed`
                ]}
              />
              
              <FlowArrow />
              
              {/* Screening */}
              <FlowBox
                title="Screening"
                details={[
                  `${summary.processedResultsCount} results after processing`,
                  `${summary.duplicatesCount} duplicates identified`,
                  `${summary.rawResultsCount - summary.processedResultsCount - summary.duplicatesCount} results excluded`
                ]}
              />
              
              <FlowArrow />
              
              {/* Eligibility */}
              <FlowBox
                title="Eligibility"
                details={[
                  `${summary.taggedResultsCount} results reviewed and tagged`,
                  `${summary.untaggedResultsCount} results awaiting review`
                ]}
              />
              
              <FlowArrow />
              
              {/* Included */}
              <FlowBox
                title="Included"
                details={
                  tags.length > 0 
                    ? tags.map(tag => `${tag.count} results tagged as "${tag.name}"`)
                    : ["No tags defined yet"]
                }
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Tags Distribution */}
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Tags Distribution</h2>
          {tags.length === 0 ? (
            <p className="text-gray-500">No tags have been created yet.</p>
          ) : (
            <div className="space-y-3">
              {tags.map(tag => (
                <div key={tag.id} className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <span>{tag.name}</span>
                      <span className="text-gray-600">{tag.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${tag.count / Math.max(summary.processedResultsCount, 1) * 100}%`,
                          backgroundColor: tag.color 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Untagged */}
              {summary.untaggedResultsCount > 0 && (
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3 bg-gray-300" />
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <span>Untagged</span>
                      <span className="text-gray-600">{summary.untaggedResultsCount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gray-300" 
                        style={{ 
                          width: `${summary.untaggedResultsCount / Math.max(summary.processedResultsCount, 1) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* File Types */}
        <div className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">File Types</h2>
          {fileTypes.length === 0 ? (
            <p className="text-gray-500">No file types identified yet.</p>
          ) : (
            <div className="space-y-3">
              {fileTypes.map(({ type, count }) => (
                <div key={type} className="flex items-center">
                  <div className="w-4 h-4 flex items-center justify-center mr-3 text-xs">
                    {getFileTypeIcon(type)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between mb-1">
                      <span>{type.toUpperCase()}</span>
                      <span className="text-gray-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500" 
                        style={{ 
                          width: `${count / Math.max(summary.processedResultsCount, 1) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Export Section */}
      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Export Results</h2>
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-grow">
            <label className="block text-sm text-gray-700 mb-1">Filter by Tag (optional)</label>
            <select
              value={selectedTagId || ''}
              onChange={(e) => setSelectedTagId(e.target.value || null)}
              className="w-full border rounded p-2"
            >
              <option value="">All Results</option>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div>
            <button
              onClick={handleExport}
              disabled={isExporting || summary.processedResultsCount === 0}
              className={`px-4 py-2 rounded text-white ${
                isExporting || summary.processedResultsCount === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-gray-50 rounded p-4">
      <div className="flex items-center mb-2">
        <span className="text-xl mr-2">{icon}</span>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-2xl font-bold">{value || 0}</p>
    </div>
  );
}

function FlowBox({ title, details }) {
  return (
    <div className="border-2 border-blue-500 rounded p-4 w-full text-center">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <ul className="text-sm text-left list-disc pl-5">
        {details.map((detail, index) => (
          <li key={index}>{detail}</li>
        ))}
      </ul>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="h-8 flex justify-center items-center">
      <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-[12px] border-t-blue-500"></div>
    </div>
  );
}

function getFileTypeIcon(type) {
  switch (type.toLowerCase()) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'ppt':
    case 'pptx':
      return '📊';
    case 'xls':
    case 'xlsx':
      return '📈';
    case 'html':
      return '🌐';
    default:
      return '📁';
  }
} 