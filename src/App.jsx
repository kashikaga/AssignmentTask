import React, { useState } from 'react';
import ApiKeyInput from './components/ApiKeyInput';
import ActorSelector from './components/ActorSelector';
import DynamicForm from './components/DynamicForm';
import ExecutionProgress from './components/ExecutionProgress';
import ResultsDisplay from './components/ResultsDisplay';
import ProgressSteps from './components/ProgressSteps';

const App = () => {
  const [apiKey, setApiKey] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [actors, setActors] = useState([]);
  const [selectedActor, setSelectedActor] = useState('');
  const [actorSchema, setActorSchema] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [executionResult, setExecutionResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = () => {
    setApiKey('');
    setCurrentStep(1);
    setActors([]);
    setSelectedActor('');
    setActorSchema(null);
    setInputValues({});
    setExecutionResult(null);
    setError('');
    setIsLoading(false);
  };

  const appProps = {
    apiKey,
    setApiKey,
    currentStep,
    setCurrentStep,
    actors,
    setActors,
    selectedActor,
    setSelectedActor,
    actorSchema,
    setActorSchema,
    inputValues,
    setInputValues,
    executionResult,
    setExecutionResult,
    error,
    setError,
    isLoading,
    setIsLoading,
    handleReset
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Appify Actor Runner
          </h1>
          <p className="text-lg text-gray-600">
            Execute actors with dynamic inputs
          </p>
        </div>

        <ProgressSteps currentStep={currentStep} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          {currentStep === 1 && <ApiKeyInput {...appProps} />}
          {currentStep === 2 && <ActorSelector {...appProps} />}
          {currentStep === 3 && <DynamicForm {...appProps} />}
          {currentStep === 4 && <ExecutionProgress {...appProps} />}
          {currentStep === 5 && <ResultsDisplay {...appProps} />}
        </div>
      </div>
    </div>
  );
};

export default App;