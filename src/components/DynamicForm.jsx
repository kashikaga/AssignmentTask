import React from 'react';
import { Play, Settings } from 'lucide-react';
import { renderFormField } from '../utils/schemaUtils';
import { executeActor } from '../services/appifyApi';

const DynamicForm = ({ 
  apiKey,
  selectedActor,
  actors,
  actorSchema, 
  inputValues, 
  setInputValues,
  setCurrentStep,
  setExecutionResult,
  setError,
  isLoading,
  setIsLoading
}) => {
  const handleInputChange = (fieldName, value) => {
    setInputValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleExecute = async () => {
    // Validate required fields
    const requiredFields = Object.keys(actorSchema.properties || {}).filter(
      key => actorSchema.properties[key].required
    );

    const missingFields = requiredFields.filter(
      field => !inputValues[field]?.toString().trim()
    );

    if (missingFields.length > 0) {
      setError(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);
    setError('');
    setCurrentStep(4);

    try {
      const result = await executeActor(apiKey, selectedActor, inputValues);
      setExecutionResult(result);
      setCurrentStep(5);
    } catch (error) {
      setError(error.message);
      setExecutionResult({ 
        status: 'error', 
        message: error.message 
      });
      setCurrentStep(5);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedActorData = actors.find(a => a.id === selectedActor);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Settings className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Step 3: Configure Inputs</h2>
          <p className="text-gray-600">
            Configure inputs for: <span className="font-medium">{selectedActorData?.name}</span>
          </p>
        </div>
      </div>

      {actorSchema && actorSchema.properties && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Actor Information</h3>
            <p className="text-sm text-gray-600">{selectedActorData?.description}</p>
          </div>

          <div className="space-y-4">
            {Object.keys(actorSchema.properties).map(fieldName => {
              const field = actorSchema.properties[fieldName];
              return (
                <div key={fieldName} className="space-y-2">
                  {renderFormField(
                    fieldName,
                    field,
                    inputValues[fieldName] || '',
                    (value) => handleInputChange(fieldName, value)
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center font-medium text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Execute Actor
          </button>
        </div>
      )}
    </div>
  );
};

export default DynamicForm;