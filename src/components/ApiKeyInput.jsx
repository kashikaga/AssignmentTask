import React from 'react';
import { Key, Loader2 } from 'lucide-react';
import { validateApiKeyAndFetchActors } from '../services/appifyApi';

const ApiKeyInput = ({ 
  apiKey, 
  setApiKey, 
  setCurrentStep, 
  setActors, 
  setError, 
  isLoading, 
  setIsLoading 
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const actors = await validateApiKeyAndFetchActors(apiKey);
      setActors(actors);
      setCurrentStep(2);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Key className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Step 1: Enter API Key</h2>
          <p className="text-gray-600">Enter your Appify API key to get started</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Appify API key..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Your API key will be stored securely and only used for this session
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !apiKey.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Validating API Key...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </form>
    </div>
  );
};

export default ApiKeyInput;