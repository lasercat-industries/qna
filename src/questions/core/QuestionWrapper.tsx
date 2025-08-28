import React, { useEffect, useState, useCallback } from 'react';
import type { Question, Priority } from '../types';

interface QuestionWrapperProps<T = unknown> {
  question: Question<T>;
  children: React.ReactNode;
  value?: T;
  onChange?: (value: T) => void;
  onValidate?: (value: T) => string[];
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  className?: string;
}

const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'critical':
      return 'border-red-500';
    case 'high':
      return 'border-orange-500';
    case 'medium':
      return 'border-yellow-500';
    case 'low':
      return 'border-gray-300';
    default:
      return 'border-gray-300';
  }
};

const getPriorityIcon = (priority: Priority): string => {
  switch (priority) {
    case 'critical':
      return '🔴';
    case 'high':
      return '🟠';
    case 'medium':
      return '🟡';
    case 'low':
      return '⚪';
    default:
      return '';
  }
};

export function QuestionWrapper<T = unknown>({
  question,
  children,
  value,
  onChange: _onChange,
  onValidate,
  disabled = false,
  readOnly = false,
  error: externalError,
  className = '',
}: QuestionWrapperProps<T>) {
  const [internalError, setInternalError] = useState<string>('');
  const [touched, setTouched] = useState(false);

  const validateValue = useCallback(
    (val: T): string[] => {
      const errors: string[] = [];

      if (!question.validation) return errors;

      for (const rule of question.validation) {
        switch (rule.type) {
          case 'required':
            if (!val || (typeof val === 'string' && !val.trim())) {
              errors.push(rule.message || 'This field is required');
            }
            break;
          case 'min':
            if (typeof rule.value === 'number') {
              if (typeof val === 'number' && val < rule.value) {
                errors.push(rule.message || `Value must be at least ${rule.value}`);
              }
              if (typeof val === 'string' && val.length < rule.value) {
                errors.push(rule.message || `Must be at least ${rule.value} characters`);
              }
              if (Array.isArray(val) && val.length < rule.value) {
                errors.push(rule.message || `Select at least ${rule.value} items`);
              }
            }
            break;
          case 'max':
            if (typeof rule.value === 'number') {
              if (typeof val === 'number' && val > rule.value) {
                errors.push(rule.message || `Value must be at most ${rule.value}`);
              }
              if (typeof val === 'string' && val.length > rule.value) {
                errors.push(rule.message || `Must be at most ${rule.value} characters`);
              }
              if (Array.isArray(val) && val.length > rule.value) {
                errors.push(rule.message || `Select at most ${rule.value} items`);
              }
            }
            break;
          case 'pattern':
            if (
              typeof val === 'string' &&
              rule.value &&
              !new RegExp(rule.value as string | RegExp).test(val)
            ) {
              errors.push(rule.message || 'Invalid format');
            }
            break;
          case 'custom':
            if (rule.validator && !rule.validator(val)) {
              errors.push(rule.message || 'Validation failed');
            }
            break;
        }
      }

      if (onValidate) {
        errors.push(...onValidate(val));
      }

      return errors;
    },
    [question.validation, onValidate],
  );

  useEffect(() => {
    if (touched && value !== undefined) {
      const errors = validateValue(value);
      setInternalError(errors[0] || '');
    }
  }, [value, touched, validateValue]);

  const handleBlur = () => {
    setTouched(true);
  };

  const error = externalError || internalError;
  const showError = error && touched;
  const isDisabled = disabled || readOnly;

  return (
    <div
      className={`
        question-wrapper 
        ${className}
        ${isDisabled ? 'opacity-60' : ''}
        ${showError ? 'has-error' : ''}
      `}
      data-priority={question.priority}
      data-question-id={question.id}
      data-question-type={question.type}
    >
      <div className="flex items-start gap-2 mb-2">
        {getPriorityIcon(question.priority) && (
          <span className="text-sm" title={`Priority: ${question.priority}`}>
            {getPriorityIcon(question.priority)}
          </span>
        )}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {question.description && (
            <p className="text-sm text-gray-600 mb-2">{question.description}</p>
          )}
        </div>
        {question.tags && question.tags.length > 0 && (
          <div className="flex gap-1">
            {question.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className={`
          question-content 
          p-3 
          border-l-4 
          ${getPriorityColor(question.priority)}
          ${showError ? 'bg-red-50' : 'bg-white'}
        `}
        onBlur={handleBlur}
      >
        {children}
      </div>

      {showError && (
        <div className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export default QuestionWrapper;
