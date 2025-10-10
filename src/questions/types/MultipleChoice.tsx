import React, { useState, useEffect } from 'react';
import type {
  MultipleChoiceQuestion,
  MultipleChoiceOption,
  QuestionComponentProps,
  MultipleChoiceAnswer,
} from '../types';
import QuestionWrapper from '../core/QuestionWrapper';

export const MultipleChoice: React.FC<
  QuestionComponentProps<string | string[] | MultipleChoiceAnswer>
> = ({
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
  const otherOptionMode = q.otherOptionMode || 'exclusive';

  // Parse initial value
  const parseValue = (val: string | string[] | MultipleChoiceAnswer) => {
    if (typeof val === 'object' && val !== null && 'selectedChoices' in val) {
      return {
        selectedChoices: val.selectedChoices || [],
        otherText: val.otherText || '',
      };
    }

    // Legacy format support
    if (Array.isArray(val)) {
      const otherItem = val.find((v) => v.startsWith('other:'));
      const selectedChoices = val.filter((v) => v !== 'other' && !v.startsWith('other:'));
      return {
        selectedChoices: otherItem ? [...selectedChoices, 'other'] : selectedChoices,
        otherText: otherItem ? otherItem.substring(6) : '',
      };
    }

    if (typeof val === 'string') {
      if (val.startsWith('other:')) {
        return { selectedChoices: ['other'], otherText: val.substring(6) };
      }
      return { selectedChoices: val ? [val] : [], otherText: '' };
    }

    return { selectedChoices: [], otherText: '' };
  };

  const initialParsed = parseValue(value);
  const [selectedChoices, setSelectedChoices] = useState<string[]>(initialParsed.selectedChoices);
  const [otherText, setOtherText] = useState(initialParsed.otherText);

  useEffect(() => {
    const parsed = parseValue(value);
    setSelectedChoices(parsed.selectedChoices);
    setOtherText(parsed.otherText);
  }, [value]);

  const emitChange = (choices: string[], text: string) => {
    if (q.showOther && choices.includes('other')) {
      // New format with structured answer
      const answer: MultipleChoiceAnswer = {
        selectedChoices: choices,
        otherText: text,
      };
      onChange(answer as string | string[] | MultipleChoiceAnswer);
    } else {
      // Legacy format for backward compatibility
      if (q.multiple) {
        onChange(choices as string | string[] | MultipleChoiceAnswer);
      } else {
        onChange((choices[0] || '') as string | string[] | MultipleChoiceAnswer);
      }
    }
  };

  const handleOptionChange = (optionId: string) => {
    if (optionId === 'other') {
      handleOtherChange();
      return;
    }

    let newChoices: string[];

    if (q.multiple) {
      if (selectedChoices.includes(optionId)) {
        newChoices = selectedChoices.filter((v) => v !== optionId);
      } else {
        newChoices = [...selectedChoices, optionId];

        // If exclusive mode and other is selected, deselect other
        if (otherOptionMode === 'exclusive' && selectedChoices.includes('other')) {
          newChoices = newChoices.filter((v) => v !== 'other');
          setOtherText('');
        }
      }
    } else {
      newChoices = [optionId];
      // Clear other text when selecting a different option
      if (selectedChoices.includes('other')) {
        setOtherText('');
      }
    }

    setSelectedChoices(newChoices);
    emitChange(newChoices, otherText);
  };

  const handleOtherChange = () => {
    let newChoices: string[];

    if (q.multiple) {
      if (selectedChoices.includes('other')) {
        // Deselecting other
        newChoices = selectedChoices.filter((v) => v !== 'other');
        setOtherText('');
        setSelectedChoices(newChoices);
        emitChange(newChoices, '');
      } else {
        // Selecting other
        if (otherOptionMode === 'exclusive') {
          // Clear all other selections
          newChoices = ['other'];
        } else {
          // Keep other selections
          newChoices = [...selectedChoices, 'other'];
        }
        setSelectedChoices(newChoices);
        emitChange(newChoices, otherText);
      }
    } else {
      // Single select
      if (selectedChoices.includes('other')) {
        newChoices = [];
        setOtherText('');
      } else {
        newChoices = ['other'];
      }
      setSelectedChoices(newChoices);
      emitChange(newChoices, otherText);
    }
  };

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOtherValue = e.target.value;
    setOtherText(newOtherValue);
    emitChange(selectedChoices, newOtherValue);
  };

  const isOptionSelected = (optionId: string): boolean => {
    return selectedChoices.includes(optionId);
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
          onChange={() => handleOptionChange(option.id)}
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

  const showOtherInput = q.showOther && selectedChoices.includes('other');

  return (
    <QuestionWrapper<string | string[] | MultipleChoiceAnswer>
      className={className}
      disabled={disabled}
      error={error}
      question={question}
      readOnly={readOnly}
      value={value}
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
                onChange={handleOtherChange}
              />
              <div className="flex-1">
                <div className="font-medium">{q.otherLabel || 'Other'}</div>
                {q.otherOptionMode && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {q.otherOptionMode === 'exclusive'
                      ? 'Selecting this will deselect other options'
                      : 'Can be selected with other options'}
                  </div>
                )}
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
            value={otherText}
            onChange={handleOtherInputChange}
          />
        )}
      </div>
    </QuestionWrapper>
  );
};

export default MultipleChoice;
