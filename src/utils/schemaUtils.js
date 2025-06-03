import React from 'react';

export const renderFormField = (fieldName, field, value, onChange) => {
  const baseInputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  
  const renderLabel = () => (
    <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-2">
      {field.title}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const renderDescription = () => (
    field.description && (
      <p className="text-xs text-gray-500 mt-1">{field.description}</p>
    )
  );

  switch (field.type) {
    case 'string':
      return (
        <div>
          {renderLabel()}
          <input
            id={fieldName}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            className={baseInputClasses}
            required={field.required}
          />
          {renderDescription()}
        </div>
      );

    case 'number':
      return (
        <div>
          {renderLabel()}
          <input
            id={fieldName}
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || '')}
            placeholder={field.description}
            min={field.min}
            max={field.max}
            className={baseInputClasses}
            required={field.required}
          />
          {renderDescription()}
          {(field.min !== undefined || field.max !== undefined) && (
            <p className="text-xs text-gray-500 mt-1">
              Range: {field.min || 0} - {field.max || '∞'}
            </p>
          )}
        </div>
      );

    case 'boolean':
      return (
        <div>
          <div className="flex items-center space-x-3">
            <input
              id={fieldName}
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={fieldName} className="text-sm font-medium text-gray-700">
              {field.title}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
          {renderDescription()}
        </div>
      );

    case 'select':
      return (
        <div>
          {renderLabel()}
          <select
            id={fieldName}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClasses}
            required={field.required}
          >
            <option value="">Select an option...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          {renderDescription()}
        </div>
      );

    case 'textarea':
      return (
        <div>
          {renderLabel()}
          <textarea
            id={fieldName}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            rows={4}
            className={baseInputClasses}
            required={field.required}
          />
          {renderDescription()}
        </div>
      );

    default:
      return (
        <div>
          {renderLabel()}
          <input
            id={fieldName}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description}
            className={baseInputClasses}
            required={field.required}
          />
          {renderDescription()}
        </div>
      );
  }
};

export const validateInputs = (schema, values) => {
  const errors = {};
  
  if (!schema.properties) return errors;

  Object.keys(schema.properties).forEach(fieldName => {
    const field = schema.properties[fieldName];
    const value = values[fieldName];

    // Check required fields
    if (field.required && (!value || value.toString().trim() === '')) {
      errors[fieldName] = `${field.title} is required`;
      return;
    }

    // Check number ranges
    if (field.type === 'number' && value !== '' && value !== undefined) {
      const numValue = Number(value);
      if (field.min !== undefined && numValue < field.min) {
        errors[fieldName] = `${field.title} must be at least ${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        errors[fieldName] = `${field.title} must be at most ${field.max}`;
      }
    }

    // Check string length
    if (field.type === 'string' && value && field.maxLength) {
      if (value.length > field.maxLength) {
        errors[fieldName] = `${field.title} must be less than ${field.maxLength} characters`;
      }
    }
  });

  return errors;
};