import React from 'react';
import { Settings, Loader2, ChevronRight } from 'lucide-react';
import { fetchActorSchema } from '../services/appifyApi';

const ActorSelector = ({ 
  apiKey,
  actors, 
  setSelectedActor, 
  setActorSchema, 
  setCurrentStep, 
  setInputValues,
  setError, 
  isLoading, 
  setIsLoading 
}) => {
  const handleActorSelect = async (actorId) => {
    setSelectedActor(actorId);
    setIsLoading(true);
    setError('');

    try {
      const schema = await fetchActorSchema(apiKey, actorId);
      setActorSchema(schema);
      
      // Initialize input values with defaults
      const initialValues = {};
      if (schema.properties) {
        Object.keys(schema.properties).forEach(key => {
          if (schema.properties[key].default !== undefined) {
            initialValues[key] = schema.properties[key].default;
          } else {
            initialValues[key] = '';
          }
        });
      }
      setInputValues(initialValues);
      setCurrentStep(3);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Settings className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Step 2: Select Actor</h2>
          <p className="text-gray-600">Choose an actor to execute</p>
        </div>
      </div>

      <div className="grid gap-4">
        {actors.map((actor) => (
          <div
            key={actor.id}
            onClick={() => !isLoading && handleActorSelect(actor.id)}
            className={`p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {actor.name}
                </h3>
                <p className="text-gray-600 mt-1">{actor.description}</p>
                {actor.category && (
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {actor.category}
                  </span>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading actor schema...</span>
        </div>
      )}
    </div>
  );
};

export default ActorSelector;