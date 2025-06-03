import React from 'react';
import { Loader2 } from 'lucide-react';

const ExecutionProgress = ({ selectedActor, actors }) => {
  const selectedActorData = actors.find(a => a.id === selectedActor);

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="p-4 bg-blue-100 rounded-full">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Executing Actor...</h2>
        <p className="text-gray-600 mb-4">
          Running: <span className="font-medium">{selectedActorData?.name}</span>
        </p>
        <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-gray-600">
            Please wait while the actor processes your request. This may take a few moments.
          </p>
        </div>
      </div>

      <div className="flex justify-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  );
};

export default ExecutionProgress;