import React, { useEffect, useState, useCallback } from 'react';
import type { Question, Priority, PriorityDisplayStyle } from '../types';

interface QuestionWrapperProps<T = unknown> {
  question: Question<T>;
  children: React.ReactNode;
  value?: T;
  onChange?: (value: T) => void;
  onValidate?: (value: T) => string[];
  onVeto?: (vetoed: boolean, reason?: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  className?: string;
  vetoed?: boolean;
}

const getPriorityColor = (
  priority: Priority,
  style: PriorityDisplayStyle = 'border-left',
): string => {
  const colors = {
    critical: { border: 'border-red-500', bg: 'bg-red-50', chip: 'bg-red-100 text-red-700' },
    high: {
      border: 'border-orange-500',
      bg: 'bg-orange-50',
      chip: 'bg-orange-100 text-orange-700',
    },
    medium: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-50',
      chip: 'bg-yellow-100 text-yellow-700',
    },
    low: { border: 'border-gray-300', bg: 'bg-gray-50', chip: 'bg-gray-100 text-gray-700' },
  };

  const colorSet = colors[priority] || colors.low;

  switch (style) {
    case 'border-left':
      return `border-l-4 ${colorSet.border}`;
    case 'border-all':
      return ''; // Handled at wrapper level
    case 'background':
      return colorSet.bg;
    case 'chip':
      return '';
    case 'dot':
      return '';
    case 'none':
      return '';
    default:
      return `border-l-4 ${colorSet.border}`;
  }
};

const getPriorityChipClass = (priority: Priority): string => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'low':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getWrapperBorderClass = (priority: Priority): string => {
  switch (priority) {
    case 'critical':
      return 'border-2 border-red-500';
    case 'high':
      return 'border-2 border-orange-500';
    case 'medium':
      return 'border-2 border-yellow-500';
    case 'low':
      return 'border-2 border-gray-300';
    default:
      return 'border-2 border-gray-300';
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
  onVeto,
  disabled = false,
  readOnly = false,
  error: externalError,
  className = '',
  vetoed: externalVetoed = false,
}: QuestionWrapperProps<T>) {
  const [internalError, setInternalError] = useState<string>('');
  const [isVetoed, setIsVetoed] = useState(externalVetoed);
  const [showVetoReason, setShowVetoReason] = useState(false);
  const [vetoReason, setVetoReason] = useState<string>('');
  const [touched, setTouched] = useState(false);

  const validateValue = useCallback(
    (val: T): string[] => {
      const errors: string[] = [];

      if (!question.validation) return errors;

      for (const rule of question.validation) {
        switch (rule.type) {
          case 'required':
            // Handle MultipleChoiceAnswer type
            if (typeof val === 'object' && val !== null && 'selectedChoices' in val) {
              const multiChoiceVal = val as { selectedChoices: string[] };
              const choices = multiChoiceVal.selectedChoices;
              if (!choices || choices.length === 0) {
                errors.push(rule.message || 'This field is required');
              }
            } else if (!val || (typeof val === 'string' && !val.trim())) {
              errors.push(rule.message || 'This field is required');
            } else if (Array.isArray(val) && val.length === 0) {
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
              // Handle MultipleChoiceAnswer type
              if (typeof val === 'object' && val !== null && 'selectedChoices' in val) {
                const multiChoiceVal = val as { selectedChoices: string[] };
                const choices = multiChoiceVal.selectedChoices;
                if (choices.length < rule.value) {
                  errors.push(rule.message || `Select at least ${rule.value} items`);
                }
              } else if (Array.isArray(val) && val.length < rule.value) {
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
              // Handle MultipleChoiceAnswer type
              if (typeof val === 'object' && val !== null && 'selectedChoices' in val) {
                const multiChoiceVal = val as { selectedChoices: string[] };
                const choices = multiChoiceVal.selectedChoices;
                if (choices.length > rule.value) {
                  errors.push(rule.message || `Select at most ${rule.value} items`);
                }
              } else if (Array.isArray(val) && val.length > rule.value) {
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
  const isDisabled = disabled || readOnly || isVetoed;

  const handleVetoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVetoed = e.target.checked;
    setIsVetoed(newVetoed);
    if (!newVetoed) {
      setVetoReason('');
      setShowVetoReason(false);
    }
    onVeto?.(newVetoed, newVetoed ? vetoReason : undefined);
  };

  const handleVetoReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setVetoReason(e.target.value);
    if (isVetoed) {
      onVeto?.(true, e.target.value);
    }
  };

  const priorityStyle = question.priorityDisplayStyle || 'border-left';

  return (
    <div
      className={`
        question-wrapper 
        ${className}
        ${isDisabled ? 'opacity-60' : ''}
        ${showError ? 'has-error' : ''}
        ${priorityStyle === 'border-all' ? `${getWrapperBorderClass(question.priority)} p-4 rounded-lg` : ''}
      `}
      data-priority={question.priority}
      data-question-id={question.id}
      data-question-type={question.type}
    >
      <div className="flex items-start gap-2 mb-2">
        {priorityStyle === 'dot' && (
          <span className="text-sm" title={`Priority: ${question.priority}`}>
            {getPriorityIcon(question.priority)}
          </span>
        )}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{question.text}</label>
          {question.description && (
            <p className="text-sm text-gray-600 mb-2">{question.description}</p>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {priorityStyle === 'chip' && (
            <span
              className={`px-2 py-1 text-xs rounded-full border ${getPriorityChipClass(question.priority)}`}
            >
              {question.priority.toUpperCase()}
            </span>
          )}
          {question.required && !isVetoed && (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 border border-red-300">
              Required
            </span>
          )}
          {question.tags &&
            question.tags.length > 0 &&
            question.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {tag}
              </span>
            ))}
        </div>
      </div>

      {question.allowVeto && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isVetoed}
              onChange={handleVetoChange}
              className="mt-1 h-4 w-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
              disabled={disabled || readOnly}
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-amber-800">
                {question.vetoLabel || 'This question is problematic'}
              </span>
              {isVetoed && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowVetoReason(!showVetoReason)}
                    className="text-xs text-amber-700 hover:text-amber-900 underline"
                  >
                    {showVetoReason ? 'Hide' : 'Add'} reason (optional)
                  </button>
                  {showVetoReason && (
                    <textarea
                      value={vetoReason}
                      onChange={handleVetoReasonChange}
                      placeholder="Please explain why this question is problematic..."
                      className="mt-2 w-full p-2 text-sm border border-amber-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                      rows={2}
                      disabled={disabled || readOnly}
                    />
                  )}
                </div>
              )}
            </div>
          </label>
        </div>
      )}

      <div
        className={`
          question-content 
          ${priorityStyle === 'border-all' ? '' : priorityStyle === 'background' ? 'p-4' : 'p-3'}
          ${getPriorityColor(question.priority, priorityStyle)}
          ${showError ? 'bg-red-50' : priorityStyle === 'background' ? '' : priorityStyle === 'border-all' ? '' : 'bg-white'}
          ${isVetoed ? 'opacity-50 pointer-events-none' : ''}
          ${priorityStyle === 'border-all' ? '' : 'rounded-md'}
        `}
        onBlur={handleBlur}
      >
        {children}
      </div>

      {isVetoed && (
        <div className="mt-2 text-sm text-amber-600 font-medium" role="alert">
          This question has been vetoed and will not be included in the submission.
        </div>
      )}

      {showError && !isVetoed && (
        <div className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

export default QuestionWrapper;
