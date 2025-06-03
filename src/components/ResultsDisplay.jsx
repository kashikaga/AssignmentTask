import React from 'react';
import { CheckCircle, XCircle, RotateCcw, Download } from 'lucide-react';

const ResultsDisplay = ({ executionResult, handleReset }) => {
  const downloadResults = () => {
    const dataStr = JSON.stringify(executionResult, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `actor-results-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-2 rounded-lg ${
          executionResult?.status === 'success' ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {executionResult?.status === 'success' ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Execution Results</h2>
          <p className="text-gray-600">
            {executionResult?.status === 'success' ? 'Completed successfully' : 'Execution failed'}
          </p>
        </div>
      </div>

      {executionResult?.status === 'success' ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Execution Successful</span>
            </div>
            {executionResult.executionTime && (
              <p className="text-green-700 text-sm mt-1">
                Completed in {executionResult.executionTime}
              </p>
            )}
            {executionResult.resultCount && (
              <p className="text-green-700 text-sm">
                Found {executionResult.resultCount} results
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg border overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Results Data</h3>
              <button
                onClick={downloadResults}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(executionResult.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">Execution Failed</span>
          </div>
          <p className="text-red-700 mt-2">
            {executionResult?.message || 'An unknown error occurred'}
          </p>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={handleReset}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center font-medium"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Start New Execution
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;