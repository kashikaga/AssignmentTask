import React, { useState, useEffect } from 'react';
import { Play, Key, Settings, Loader2, CheckCircle, XCircle } from 'lucide-react';
import './App.css'; // Assuming you have a CSS file for styles

const AppifyActorRunner = () => {
  const [apiKey, setApiKey] = useState('');
  const [actors, setActors] = useState([]);
  const [selectedActor, setSelectedActor] = useState('');
  const [actorSchema, setActorSchema] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [executionResult, setExecutionResult] = useState(null);
  const [error, setError] = useState('');

  // Mock API calls - replace these with actual Appify API endpoints
  const mockActors = [
    { id: 'google-maps-scraper', name: 'Google Maps Scraper', description: 'Scrapes business data from Google Maps' },
    { id: 'web-scraper', name: 'Web Scraper', description: 'General purpose web scraper' },
    { id: 'email-extractor', name: 'Email Extractor', description: 'Extracts emails from websites' }
  ];

  const mockSchemas = {
    'google-maps-scraper': {
      properties: {
        location: {
          type: 'string',
          title: 'Location',
          description: 'The location to search (e.g., "New York, NY")',
          required: true
        },
        keywords: {
          type: 'string',
          title: 'Keywords',
          description: 'Search keywords (e.g., "restaurants")',
          required: true
        },
        maxResults: {
          type: 'number',
          title: 'Max Results',
          description: 'Maximum number of results to return',
          default: 10,
          required: false
        }
      }
    },
    'web-scraper': {
      properties: {
        url: {
          type: 'string',
          title: 'URL',
          description: 'The website URL to scrape',
          required: true
        },
        selector: {
          type: 'string',
          title: 'CSS Selector',
          description: 'CSS selector for elements to extract',
          required: true
        }
      }
    },
    'email-extractor': {
      properties: {
        domain: {
          type: 'string',
          title: 'Domain',
          description: 'Domain to extract emails from',
          required: true
        },
        pages: {
          type: 'number',
          title: 'Pages to crawl',
          description: 'Number of pages to crawl',
          default: 5,
          required: false
        }
      }
    }
  };

  // Step 1: Validate API Key and fetch actors
  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your API key');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // In real implementation, replace with actual API call
      // const response = await fetch('https://api.appify.com/v1/actors', {
      //   headers: { 'Authorization': `Bearer ${apiKey}` }
      // });
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      setActors(mockActors);
      setCurrentStep(2);
    } catch (err) {
      setError('Invalid API key or network error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Fetch actor schema
  const handleActorSelect = async (actorId) => {
    setSelectedActor(actorId);
    setIsLoading(true);
    setError('');
    
    try {
      // In real implementation, replace with actual API call
      // const response = await fetch(`https://api.appify.com/v1/actors/${actorId}/schema`, {
      //   headers: { 'Authorization': `Bearer ${apiKey}` }
      // });
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock schema response
      setActorSchema(mockSchemas[actorId]);
      setCurrentStep(3);
      
      // Initialize input values with defaults
      const schema = mockSchemas[actorId];
      const initialValues = {};
      Object.keys(schema.properties).forEach(key => {
        if (schema.properties[key].default !== undefined) {
          initialValues[key] = schema.properties[key].default;
        } else {
          initialValues[key] = '';
        }
      });
      setInputValues(initialValues);
      
    } catch (err) {
      setError('Failed to fetch actor schema');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Execute actor
  const handleExecuteActor = async () => {
    // Validate required fields
    const requiredFields = Object.keys(actorSchema.properties).filter(
      key => actorSchema.properties[key].required
    );
    
    const missingFields = requiredFields.filter(field => !inputValues[field]?.toString().trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setCurrentStep(4);
    
    try {
      // In real implementation, replace with actual API call
      // const response = await fetch(`https://api.appify.com/v1/actors/${selectedActor}/run`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${apiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(inputValues)
      // });
      
      // Mock execution delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock successful result
      const mockResult = {
        status: 'success',
        data: [
          { name: 'Sample Business 1', address: '123 Main St', rating: 4.5 },
          { name: 'Sample Business 2', address: '456 Oak Ave', rating: 4.2 },
          { name: 'Sample Business 3', address: '789 Pine Rd', rating: 4.8 }
        ],
        executionTime: '2.3s',
        resultCount: 3
      };
      
      setExecutionResult(mockResult);
      setCurrentStep(5);
      
    } catch (err) {
      setError('Actor execution failed');
      setExecutionResult({ status: 'error', message: err.message });
      setCurrentStep(5);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (fieldName, value) => {
    setInputValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Render dynamic form based on schema
  const renderSchemaForm = () => {
    if (!actorSchema) return null;
    
    return (
      <div className="space-y-4">
        {Object.keys(actorSchema.properties).map(fieldName => {
          const field = actorSchema.properties[fieldName];
          return (
            <div key={fieldName} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.title}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'string' ? (
                <input
                  type="text"
                  value={inputValues[fieldName] || ''}
                  onChange={(e) => handleInputChange(fieldName, e.target.value)}
                  placeholder={field.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  value={inputValues[fieldName] || ''}
                  onChange={(e) => handleInputChange(fieldName, parseInt(e.target.value) || '')}
                  placeholder={field.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : null}
              <p className="text-xs text-gray-500">{field.description}</p>
            </div>
          );
        })}
      </div>
    );
  };

  // Reset to start
  const handleReset = () => {
    setApiKey('');
    setActors([]);
    setSelectedActor('');
    setActorSchema(null);
    setInputValues({});
    setExecutionResult(null);
    setError('');
    setCurrentStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Appify Actor Runner</h1>
        <p className="text-gray-600">Execute actors with dynamic inputs</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= step ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 5 && (
              <div className={`w-12 h-1 ${
                currentStep > step ? 'bg-blue-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: API Key Input */}
      {currentStep === 1 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Key className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold">Step 1: Enter API Key</h2>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Appify API key"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleApiKeySubmit}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Actor Selection */}
      {currentStep === 2 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold">Step 2: Select Actor</h2>
          </div>
          <div className="grid gap-4">
            {actors.map((actor) => (
              <div
                key={actor.id}
                onClick={() => handleActorSelect(actor.id)}
                className="p-4 border border-gray-200 rounded-md hover:border-blue-500 cursor-pointer transition-colors"
              >
                <h3 className="font-medium text-gray-900">{actor.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{actor.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Input Form */}
      {currentStep === 3 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold">Step 3: Configure Inputs</h2>
          </div>
          <div className="mb-6">
            <h3 className="font-medium mb-2">Selected Actor: {actors.find(a => a.id === selectedActor)?.name}</h3>
            {renderSchemaForm()}
          </div>
          <button
            onClick={handleExecuteActor}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 flex items-center justify-center"
          >
            <Play className="w-4 h-4 mr-2" />
            Execute Actor
          </button>
        </div>
      )}

      {/* Step 4: Execution in Progress */}
      {currentStep === 4 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin mb-4" />
          <h2 className="text-xl font-semibold mb-2">Executing Actor...</h2>
          <p className="text-gray-600">Please wait while the actor processes your request</p>
        </div>
      )}

      {/* Step 5: Results */}
      {currentStep === 5 && executionResult && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            {executionResult.status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <h2 className="text-xl font-semibold">Execution Results</h2>
          </div>
          
          {executionResult.status === 'success' ? (
            <div>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700">
                  ✓ Execution completed successfully in {executionResult.executionTime}
                </p>
                <p className="text-green-600 text-sm">
                  Found {executionResult.resultCount} results
                </p>
              </div>
              
              <div className="bg-white rounded-md border overflow-hidden">
                <div className="p-3 bg-gray-100 border-b">
                  <h3 className="font-medium">Data Results</h3>
                </div>
                <div className="p-3">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(executionResult.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">
                ✗ Execution failed: {executionResult.message}
              </p>
            </div>
          )}
          
          <button
            onClick={handleReset}
            className="w-full mt-4 bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600"
          >
            Start New Execution
          </button>
        </div>
      )}
    </div>
  );
};

export default AppifyActorRunner;