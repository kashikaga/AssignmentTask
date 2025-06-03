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
}
  export default App;
