import React, { useState, useEffect } from 'react';
import type { NumericQuestion, QuestionComponentProps } from '../types';
import QuestionWrapper from '../core/QuestionWrapper';

export const NumericAnswer: React.FC<QuestionComponentProps<number>> = ({
  question,
  value = 0,
  onChange,
  onValidate,
  disabled = false,
  readOnly = false,
  error,
  className = ''
}) => {
  const q = question as NumericQuestion;
  const [localValue, setLocalValue] = useState<string>(value?.toString() || '');
  const [displayAsPercentage, setDisplayAsPercentage] = useState(q.showAsPercentage || false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty string for clearing
    if (inputValue === '') {
      setLocalValue('');
      onChange(0);
      return;
    }

    // Validate numeric input
    const regex = q.precision !== undefined && q.precision > 0
      ? /^-?\d*\.?\d*$/
      : /^-?\d*$/;
    
    if (!regex.test(inputValue)) return;

    // Check decimal places
    if (q.precision !== undefined && inputValue.includes('.')) {
      const parts = inputValue.split('.');
      if (parts[1] && parts[1].length > q.precision) return;
    }

    setLocalValue(inputValue);
    
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      // Apply min/max constraints
      let constrainedValue = numValue;
      if (q.min !== undefined && numValue < q.min) {
        constrainedValue = q.min;
      }
      if (q.max !== undefined && numValue > q.max) {
        constrainedValue = q.max;
      }
      
      onChange(constrainedValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // Format on blur
    const numValue = parseFloat(localValue);
    if (!isNaN(numValue)) {
      let formatted = numValue.toString();
      
      if (q.precision !== undefined && q.precision >= 0) {
        formatted = numValue.toFixed(q.precision);
      }
      
      setLocalValue(formatted);
    } else if (localValue === '') {
      setLocalValue('0');
      onChange(0);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleIncrement = () => {
    const current = parseFloat(localValue) || 0;
    const step = q.step || 1;
    const newValue = current + step;
    
    if (q.max === undefined || newValue <= q.max) {
      const formatted = q.precision !== undefined ? newValue.toFixed(q.precision) : newValue.toString();
      setLocalValue(formatted);
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const current = parseFloat(localValue) || 0;
    const step = q.step || 1;
    const newValue = current - step;
    
    if (q.min === undefined || newValue >= q.min) {
      const formatted = q.precision !== undefined ? newValue.toFixed(q.precision) : newValue.toString();
      setLocalValue(formatted);
      onChange(newValue);
    }
  };

  const togglePercentage = () => {
    if (!q.showAsPercentage) return;
    setDisplayAsPercentage(!displayAsPercentage);
  };

  const displayValue = () => {
    if (!isFocused && displayAsPercentage && localValue) {
      const num = parseFloat(localValue);
      if (!isNaN(num)) {
        return `${(num * 100).toFixed(q.precision || 0)}%`;
      }
    }
    return localValue;
  };

  return (
    <QuestionWrapper<number>
      className={className}
      disabled={disabled}
      error={error}
      question={question}
      readOnly={readOnly}
      value={parseFloat(localValue) || 0}
      onChange={onChange}
      onValidate={onValidate}
    >
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <input
            aria-label={q.text}
            aria-valuemax={q.max}
            aria-valuemin={q.min}
            aria-valuenow={parseFloat(localValue) || 0}
            className={`
              w-full px-3 py-2 border rounded-md text-right
              ${disabled || readOnly ? 'bg-gray-100' : 'bg-white'}
              ${error ? 'border-red-500' : 'border-gray-300'}
              ${q.unit || q.showAsPercentage ? 'pr-12' : ''}
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            disabled={disabled || readOnly}
            placeholder={q.placeholder || '0'}
            type="text"
            value={displayValue()}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          
          {(q.unit || displayAsPercentage) && (
            <div 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none"
            >
              {displayAsPercentage && !isFocused ? '' : q.unit}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <button
            aria-label="Increment value"
            className={`
              px-2 h-1/2 bg-gray-100 border border-gray-300 rounded-t-md
              hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${disabled || readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={disabled || readOnly || (q.max !== undefined && parseFloat(localValue) >= q.max)}
            type="button"
            onClick={handleIncrement}
          >
            <svg className="w-3 h-3 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" fillRule="evenodd" />
            </svg>
          </button>
          <button
            aria-label="Decrement value"
            className={`
              px-2 h-1/2 bg-gray-100 border border-gray-300 rounded-b-md border-t-0
              hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${disabled || readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={disabled || readOnly || (q.min !== undefined && parseFloat(localValue) <= q.min)}
            type="button"
            onClick={handleDecrement}
          >
            <svg className="w-3 h-3 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fillRule="evenodd" />
            </svg>
          </button>
        </div>

        {q.showAsPercentage && (
          <button
            aria-label="Toggle percentage display"
            className={`
              px-3 py-2 border rounded-md text-sm font-medium
              ${displayAsPercentage ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${disabled || readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={disabled || readOnly}
            type="button"
            onClick={togglePercentage}
          >
            %
          </button>
        )}
      </div>

      {(q.min !== undefined || q.max !== undefined) && (
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {q.min !== undefined && <span>Min: {q.min}</span>}
          {q.max !== undefined && <span>Max: {q.max}</span>}
        </div>
      )}

      {q.step && (
        <div className="text-xs text-gray-500 mt-1">
          Step: {q.step}
        </div>
      )}
    </QuestionWrapper>
  );
};

export default NumericAnswer;