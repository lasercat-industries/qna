import React, { useState, useEffect } from 'react';
import type { ShortAnswerQuestion, QuestionComponentProps } from '../types';
import QuestionWrapper from '../core/QuestionWrapper';

export const ShortAnswer: React.FC<QuestionComponentProps<string>> = ({
  question,
  response,
  onChange,
  onValidate,
  disabled = false,
  readOnly = false,
  className = '',
  renderQuestionText,
  renderVetoButton,
}) => {
  const q = question as ShortAnswerQuestion;
  const value = response?.value ?? '';
  const error = response?.errors?.[0];
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (q.suggestions && localValue && !disabled && !readOnly) {
      const filtered = q.suggestions.filter((s) =>
        s.toLowerCase().includes(localValue.toLowerCase()),
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [localValue, q.suggestions, disabled, readOnly]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (q.maxLength && newValue.length > q.maxLength) return;

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

  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion);
    onChange({
      questionId: question.id,
      value: suggestion,
      timestamp: new Date(),
      valid: true,
      errors: [],
      vetoed: response?.vetoed,
      vetoReason: response?.vetoReason,
    });
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <QuestionWrapper<string>
      className={className}
      disabled={disabled}
      question={question}
      readOnly={readOnly}
      response={response}
      onChange={onChange}
      onValidate={onValidate}
      renderQuestionText={renderQuestionText}
      renderVetoButton={renderVetoButton}
    >
      <div className="relative">
        <input
          aria-invalid={!!error}
          aria-label={q.text}
          aria-required={q.required}
          className={`
            w-full px-3 py-2 border rounded-md
            ${disabled || readOnly ? 'bg-gray-100' : 'bg-white'}
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
          disabled={disabled}
          maxLength={q.maxLength}
          pattern={q.pattern}
          placeholder={q.placeholder}
          readOnly={readOnly}
          type="text"
          value={localValue}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onChange={handleChange}
          onFocus={() => q.suggestions && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />

        {q.maxLength && (
          <div className="absolute right-2 top-2 text-xs text-gray-500">
            {localValue.length}/{q.maxLength}
          </div>
        )}

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={`suggestion-${suggestion}`}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </QuestionWrapper>
  );
};

export default ShortAnswer;
