import React, { useState, useEffect } from 'react';
import type {
  MultipleChoiceQuestion,
  MultipleChoiceOption,
  QuestionComponentProps,
} from '../types';
import QuestionWrapper from '../core/QuestionWrapper';

export const MultipleChoice: React.FC<QuestionComponentProps<string | string[]>> = ({
  question,
  value = '',
  onChange,
  onValidate,
  disabled = false,
  readOnly = false,
  error,
  className = '',
}) => {
  const q = question as MultipleChoiceQuestion;
  const [localValue, setLocalValue] = useState<string | string[]>(
    q.multiple ? (Array.isArray(value) ? value : []) : (value as string),
  );
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState('');

  useEffect(() => {
    if (q.multiple) {
      setLocalValue(Array.isArray(value) ? value : []);
    } else {
      setLocalValue(value as string);
    }

    if (q.showOther) {
      const isOtherSelected = q.multiple
        ? Array.isArray(value) && value.includes('other')
        : value === 'other';
      setShowOtherInput(isOtherSelected);

      if (isOtherSelected && typeof value === 'string' && value.startsWith('other:')) {
        setOtherValue(value.substring(6));
      }
    }
  }, [value, q.multiple, q.showOther]);

  const handleSingleChange = (optionId: string) => {
    if (optionId === 'other' && q.showOther) {
      setShowOtherInput(true);
      setLocalValue('other');
      onChange('other');
    } else {
      setShowOtherInput(false);
      setLocalValue(optionId);
      onChange(optionId);
    }
  };

  const handleMultipleChange = (optionId: string) => {
    const currentValues = Array.isArray(localValue) ? localValue : [];
    let newValues: string[];

    if (optionId === 'other' && q.showOther) {
      if (currentValues.includes('other')) {
        setShowOtherInput(false);
        newValues = currentValues.filter((v) => v !== 'other');
      } else {
        setShowOtherInput(true);
        newValues = [...currentValues, 'other'];
      }
    } else {
      if (currentValues.includes(optionId)) {
        newValues = currentValues.filter((v) => v !== optionId);
      } else {
        newValues = [...currentValues, optionId];
      }
    }

    setLocalValue(newValues);
    onChange(newValues);
  };

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOtherValue = e.target.value;
    setOtherValue(newOtherValue);

    if (q.multiple) {
      const currentValues = Array.isArray(localValue) ? localValue : [];
      const filteredValues = currentValues.filter((v) => !v.startsWith('other'));
      onChange([...filteredValues, `other:${newOtherValue}`]);
    } else {
      onChange(`other:${newOtherValue}`);
    }
  };

  const isOptionSelected = (optionId: string): boolean => {
    if (q.multiple) {
      return Array.isArray(localValue) && localValue.includes(optionId);
    } else {
      return localValue === optionId;
    }
  };

  const renderOption = (option: MultipleChoiceOption) => {
    const inputType = q.multiple ? 'checkbox' : 'radio';
    const isSelected = isOptionSelected(option.id);

    return (
      <label
        key={option.id}
        className={`
          flex items-start gap-3 p-3 rounded-lg border cursor-pointer
          transition-colors duration-200
          ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
          ${disabled || readOnly ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
      >
        <input
          aria-label={option.label}
          checked={isSelected}
          className="mt-1"
          disabled={disabled || readOnly}
          name={`question-${question.id}`}
          type={inputType}
          value={option.id}
          onChange={() =>
            q.multiple ? handleMultipleChange(option.id) : handleSingleChange(option.id)
          }
        />
        <div className="flex-1">
          {option.image && (
            <img
              alt={option.label}
              className="w-full h-32 object-cover rounded mb-2"
              src={option.image}
            />
          )}
          <div className="font-medium">{option.label}</div>
          {option.description && (
            <div className="text-sm text-gray-600 mt-1">{option.description}</div>
          )}
        </div>
      </label>
    );
  };

  const gridColumns = q.columns || (q.options.length <= 2 ? 1 : 2);
  const gridClass = `grid-cols-${gridColumns}`;

  return (
    <QuestionWrapper<string | string[]>
      className={className}
      disabled={disabled}
      error={error}
      question={question}
      readOnly={readOnly}
      value={localValue}
      onChange={onChange}
      onValidate={onValidate}
    >
      <div className="space-y-3">
        <div className={`grid ${gridClass} gap-2`}>
          {q.options.map(renderOption)}

          {q.showOther && (
            <label
              className={`
                flex items-start gap-3 p-3 rounded-lg border cursor-pointer
                transition-colors duration-200
                ${showOtherInput ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
                ${disabled || readOnly ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}
              `}
            >
              <input
                aria-label={q.otherLabel || 'Other'}
                checked={showOtherInput}
                className="mt-1"
                disabled={disabled || readOnly}
                name={`question-${question.id}`}
                type={q.multiple ? 'checkbox' : 'radio'}
                value="other"
                onChange={() =>
                  q.multiple ? handleMultipleChange('other') : handleSingleChange('other')
                }
              />
              <div className="flex-1">
                <div className="font-medium">{q.otherLabel || 'Other'}</div>
              </div>
            </label>
          )}
        </div>

        {showOtherInput && (
          <input
            className={`
              w-full px-3 py-2 border rounded-md
              ${disabled || readOnly ? 'bg-gray-100' : 'bg-white'}
              border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
            disabled={disabled || readOnly}
            placeholder="Please specify..."
            type="text"
            value={otherValue}
            onChange={handleOtherInputChange}
          />
        )}
      </div>
    </QuestionWrapper>
  );
};

export default MultipleChoice;
