import React, { useEffect, useState, useCallback } from 'react';
import type {
  Question,
  Priority,
  PriorityDisplayStyle,
  QuestionResponse,
  AnyQuestion,
} from '../types';

interface QuestionWrapperProps<T = unknown> {
  question: Question<T>;
  children: React.ReactNode;
  response?: QuestionResponse<T>;
  onChange?: (response: QuestionResponse<T>) => void;
  onValidate?: (value: T) => string[];
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  renderQuestionText?: (question: AnyQuestion) => React.ReactNode;
  hideAnswerWhenVetoed?: boolean;
  renderVetoButton?: (isVetoed: boolean, handleToggle: () => void) => React.ReactNode;
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
  response,
  onChange,
  onValidate,
  disabled = false,
  readOnly = false,
  className = '',
  renderQuestionText,
  hideAnswerWhenVetoed = false,
  renderVetoButton,
}: QuestionWrapperProps<T>) {
  const value = response?.value;
  const externalError = response?.errors?.[0];
  const externalVetoed = response?.vetoed ?? false;

  const [internalError, setInternalError] = useState<string>('');
  const [isVetoed, setIsVetoed] = useState(externalVetoed);
  const [vetoReason, setVetoReason] = useState(response?.vetoReason ?? '');
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

  const handleVetoToggle = () => {
    if (disabled || readOnly) return;

    const newVetoed = !isVetoed;
    setIsVetoed(newVetoed);
    if (!newVetoed) {
      setVetoReason('');
    }

    // Emit full response with veto update
    if (onChange) {
      // Create response if it doesn't exist yet (question not answered)
      const baseResponse = response || {
        questionId: question.id,
        value: undefined as unknown as T,
        timestamp: new Date(),
        valid: !question.required, // Vetoed questions don't need to be valid
        errors: [],
      };

      onChange({
        ...baseResponse,
        vetoed: newVetoed,
        vetoReason: newVetoed ? vetoReason : undefined,
        timestamp: new Date(),
      });
    }
  };

  const handleVetoReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newReason = e.target.value;
    setVetoReason(newReason);

    // Emit full response with reason update
    if (isVetoed && onChange) {
      // Create response if it doesn't exist yet
      const baseResponse = response || {
        questionId: question.id,
        value: undefined as unknown as T,
        timestamp: new Date(),
        valid: !question.required,
        errors: [],
      };

      onChange({
        ...baseResponse,
        vetoed: true,
        vetoReason: newReason,
        timestamp: new Date(),
      });
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
      <div className="flex items-start gap-2">
        {priorityStyle === 'dot' && (
          <span className="text-sm" title={`Priority: ${question.priority}`}>
            {getPriorityIcon(question.priority)}
          </span>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <label className="text-sm font-medium text-gray-700">
              {renderQuestionText ? renderQuestionText(question as AnyQuestion) : question.text}
            </label>
            <div className="flex-grow"></div>
            {question.allowVeto &&
              (renderVetoButton ? (
                renderVetoButton(isVetoed, handleVetoToggle)
              ) : (
                <button
                  type="button"
                  onClick={handleVetoToggle}
                  disabled={disabled || readOnly}
                  className={`
                    px-2 py-1 text-xs rounded-full border font-medium
                    transition-colors duration-200
                    ${
                      isVetoed
                        ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                    }
                    ${disabled || readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  title={isVetoed ? 'Click to unveto this question' : 'Click to veto this question'}
                >
                  {isVetoed ? 'Unveto' : 'Veto'}
                </button>
              ))}
          </div>
          <div className="flex gap-1 flex-wrap items-center mb-2">
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
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
          </div>
          {question.description && (
            <p className="text-sm text-gray-600 mb-2">{question.description}</p>
          )}
        </div>
      </div>

      {question.allowVeto && isVetoed && (
        <div className="mb-3">
          <textarea
            value={vetoReason}
            onChange={handleVetoReasonChange}
            placeholder="Reason for veto (optional)"
            className="w-full p-2 text-sm border border-amber-300 rounded-md bg-amber-50 focus:ring-amber-500 focus:border-amber-500"
            rows={2}
            disabled={disabled || readOnly}
          />
        </div>
      )}

      <div
        className={`
          grid transition-all duration-300 ease-in-out
          ${hideAnswerWhenVetoed && isVetoed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}
        `}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`
              question-content
              ${priorityStyle === 'border-all' ? '' : priorityStyle === 'background' ? 'p-4' : 'p-3'}
              ${getPriorityColor(question.priority, priorityStyle)}
              ${showError ? 'bg-red-50' : priorityStyle === 'background' ? '' : priorityStyle === 'border-all' ? '' : 'bg-white'}
              ${isVetoed && !hideAnswerWhenVetoed ? 'opacity-50 pointer-events-none' : ''}
              ${priorityStyle === 'border-all' ? '' : 'rounded-md'}
            `}
            onBlur={handleBlur}
          >
            {children}
          </div>
        </div>
      </div>

      {isVetoed && (
        <div className="mt-2 text-sm text-amber-600 font-medium" role="alert">
          This question has been vetoed and will be marked as such in the submission.
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
