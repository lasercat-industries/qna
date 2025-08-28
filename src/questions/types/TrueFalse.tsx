import React, { useState, useEffect } from 'react';
import type { TrueFalseQuestion, QuestionComponentProps } from '../types';
import QuestionWrapper from '../core/QuestionWrapper';

export const TrueFalse: React.FC<QuestionComponentProps<boolean>> = ({
  question,
  value = false,
  onChange,
  onValidate,
  disabled = false,
  readOnly = false,
  error,
  className = ''
}) => {
  const q = question as TrueFalseQuestion;
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: boolean) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const trueLabel = q.trueLabel || 'True';
  const falseLabel = q.falseLabel || 'False';

  return (
    <QuestionWrapper<boolean>
      className={className}
      disabled={disabled}
      error={error}
      question={question}
      readOnly={readOnly}
      value={localValue}
      onChange={onChange}
      onValidate={onValidate}
    >
      <div className="flex items-center gap-4">
        <button
          aria-label={trueLabel}
          aria-pressed={localValue === true}
          className={`
            flex-1 px-4 py-3 rounded-lg border-2 font-medium
            transition-all duration-200
            ${localValue === true 
              ? 'bg-green-50 border-green-500 text-green-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'}
            ${disabled || readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          `}
          disabled={disabled || readOnly}
          type="button"
          onClick={() => handleChange(true)}
        >
          <span className="text-lg mr-2">✓</span>
          {trueLabel}
        </button>

        <button
          aria-label={falseLabel}
          aria-pressed={localValue === false}
          className={`
            flex-1 px-4 py-3 rounded-lg border-2 font-medium
            transition-all duration-200
            ${localValue === false 
              ? 'bg-red-50 border-red-500 text-red-700' 
              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'}
            ${disabled || readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          `}
          disabled={disabled || readOnly}
          type="button"
          onClick={() => handleChange(false)}
        >
          <span className="text-lg mr-2">✗</span>
          {falseLabel}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <div className="relative inline-block">
          <input
            aria-label={`Toggle between ${trueLabel} and ${falseLabel}`}
            checked={localValue}
            className="sr-only"
            disabled={disabled || readOnly}
            type="checkbox"
            onChange={(e) => handleChange(e.target.checked)}
          />
          <div
            className={`
              w-14 h-8 rounded-full cursor-pointer transition-colors duration-200
              ${localValue ? 'bg-green-500' : 'bg-gray-300'}
              ${disabled || readOnly ? 'opacity-60 cursor-not-allowed' : ''}
            `}
            onClick={() => !disabled && !readOnly && handleChange(!localValue)}
          >
            <div
              className={`
                absolute top-1 w-6 h-6 bg-white rounded-full shadow-md
                transform transition-transform duration-200
                ${localValue ? 'translate-x-7' : 'translate-x-1'}
              `}
            />
          </div>
        </div>
        <span className="ml-3 text-sm font-medium text-gray-700">
          {localValue ? trueLabel : falseLabel}
        </span>
      </div>
    </QuestionWrapper>
  );
};

export default TrueFalse;