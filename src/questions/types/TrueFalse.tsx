import React, { useState, useEffect } from 'react';
import type { TrueFalseQuestion, QuestionComponentProps } from '../types';
import QuestionWrapper from '../core/QuestionWrapper';

export const TrueFalse: React.FC<QuestionComponentProps<boolean | undefined>> = ({
  question,
  response,
  onChange,
  onValidate,
  disabled = false,
  readOnly = false,
  className = '',
  renderQuestionText,
  hideAnswerWhenVetoed,
  renderVetoButton,
}) => {
  const q = question as TrueFalseQuestion;
  const value = response?.value ?? q.defaultValue;
  const [localValue, setLocalValue] = useState<boolean | undefined>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: boolean) => {
    setLocalValue(newValue);
    onChange({
      questionId: question.id,
      value: newValue,
      timestamp: new Date(),
      valid: true,
      errors: [],
      vetoed: response?.vetoed,
      vetoReason: response?.vetoReason,
    });
  };

  const trueLabel = q.trueLabel || 'True';
  const falseLabel = q.falseLabel || 'False';
  const displayStyle = q.displayStyle || 'buttons';

  const renderButtons = () => (
    <div className="flex items-center gap-4">
      <button
        aria-label={trueLabel}
        aria-pressed={localValue === true}
        className={`
          flex-1 px-4 py-3 rounded-lg border-2 font-medium
          transition-all duration-200
          ${
            localValue === true
              ? 'bg-green-50 border-green-500 text-green-700'
              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
          }
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
          ${
            localValue === false && localValue !== undefined
              ? 'bg-red-50 border-red-500 text-red-700'
              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
          }
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
  );

  const renderToggle = () => {
    const getToggleLabel = () => {
      if (localValue === undefined) return 'Not selected';
      return localValue ? trueLabel : falseLabel;
    };

    const getToggleColor = () => {
      if (localValue === true) return 'bg-green-500';
      if (localValue === false) return 'bg-red-500';
      return 'bg-gray-300';
    };

    const getTogglePosition = () => {
      if (localValue === true) return 'translate-x-7';
      if (localValue === false) return 'translate-x-1';
      return 'translate-x-4'; // Center position for undefined
    };

    return (
      <div className="flex items-center">
        <div className="relative inline-block">
          <input
            aria-label={`Toggle between ${trueLabel} and ${falseLabel}`}
            checked={localValue === true}
            className="sr-only"
            disabled={disabled || readOnly}
            type="checkbox"
            onChange={(e) => handleChange(e.target.checked)}
          />
          <div
            className={`
              w-14 h-8 rounded-full cursor-pointer transition-colors duration-200
              ${getToggleColor()}
              ${disabled || readOnly ? 'opacity-60 cursor-not-allowed' : ''}
            `}
            onClick={() => {
              if (disabled || readOnly) return;
              if (localValue === undefined) handleChange(true);
              else if (localValue === true) handleChange(false);
              else handleChange(true);
            }}
          >
            <div
              className={`
                absolute top-1 w-6 h-6 bg-white rounded-full shadow-md
                transform transition-transform duration-200
                ${getTogglePosition()}
              `}
            />
          </div>
        </div>
        <span className="ml-3 text-sm font-medium text-gray-700">{getToggleLabel()}</span>
      </div>
    );
  };

  const renderRadio = () => (
    <div className="space-y-2">
      <label className="flex items-center cursor-pointer">
        <input
          type="radio"
          name={`true-false-${question.id}`}
          checked={localValue === true}
          onChange={() => handleChange(true)}
          disabled={disabled || readOnly}
          className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
        />
        <span
          className={`ml-2 ${localValue === true ? 'font-medium text-green-700' : 'text-gray-700'}`}
        >
          {trueLabel}
        </span>
      </label>
      <label className="flex items-center cursor-pointer">
        <input
          type="radio"
          name={`true-false-${question.id}`}
          checked={localValue === false && localValue !== undefined}
          onChange={() => handleChange(false)}
          disabled={disabled || readOnly}
          className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
        />
        <span
          className={`ml-2 ${localValue === false && localValue !== undefined ? 'font-medium text-red-700' : 'text-gray-700'}`}
        >
          {falseLabel}
        </span>
      </label>
    </div>
  );

  return (
    <QuestionWrapper<boolean | undefined>
      className={className}
      disabled={disabled}
      question={question}
      readOnly={readOnly}
      response={response}
      onChange={onChange}
      onValidate={onValidate}
      renderQuestionText={renderQuestionText}
      hideAnswerWhenVetoed={hideAnswerWhenVetoed}
      renderVetoButton={renderVetoButton}
    >
      {displayStyle === 'toggle' && renderToggle()}
      {displayStyle === 'radio' && renderRadio()}
      {displayStyle === 'buttons' && renderButtons()}
    </QuestionWrapper>
  );
};

export default TrueFalse;
