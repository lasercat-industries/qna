import React, { useState, useEffect } from 'react';
import type {
  MultipleChoiceQuestion,
  MultipleChoiceOption,
  QuestionComponentProps,
  MultipleChoiceAnswer,
} from '../types';
import QuestionWrapper from '../core/QuestionWrapper';

export const MultipleChoice: React.FC<QuestionComponentProps<MultipleChoiceAnswer>> = ({
  question,
  response,
  onChange,
  onValidate,
  disabled = false,
  readOnly = false,
  className = '',
  renderQuestionText,
  hideAnswerWhenVetoed,
}) => {
  const q = question as MultipleChoiceQuestion;
  const additionalTextMode = q.additionalTextMode || 'additional';

  const defaultValue: MultipleChoiceAnswer = {
    selectedChoices: [],
    additionalText: '',
  };

  const currentValue = response?.value || defaultValue;

  const [selectedChoices, setSelectedChoices] = useState<string[]>(
    currentValue.selectedChoices || [],
  );
  const [additionalText, setAdditionalText] = useState(currentValue.additionalText || '');

  useEffect(() => {
    const val = response?.value || defaultValue;
    setSelectedChoices(val.selectedChoices || []);
    setAdditionalText(val.additionalText || '');
  }, [response?.value]);

  const emitChange = (choices: string[], text: string) => {
    const answer: MultipleChoiceAnswer = {
      selectedChoices: choices,
      additionalText: text,
    };

    // Emit full response
    onChange({
      questionId: question.id,
      value: answer,
      timestamp: new Date(),
      valid: true, // Will be validated by wrapper
      errors: [],
      vetoed: response?.vetoed,
      vetoReason: response?.vetoReason,
    });
  };

  const handleOptionChange = (optionId: string) => {
    let newChoices: string[];

    if (q.multiple) {
      if (selectedChoices.includes(optionId)) {
        newChoices = selectedChoices.filter((v) => v !== optionId);
      } else {
        newChoices = [...selectedChoices, optionId];
      }
    } else {
      // In exclusive mode with radio buttons, allow deselection by clicking again
      if (additionalTextMode === 'exclusive' && selectedChoices.includes(optionId)) {
        newChoices = [];
      } else {
        newChoices = [optionId];
      }
    }

    // In exclusive mode, clear additional text when selecting an option
    let newText = additionalText;
    if (q.allowAdditionalText && additionalTextMode === 'exclusive' && newChoices.length > 0) {
      newText = '';
    }

    // Update states together
    setSelectedChoices(newChoices);
    setAdditionalText(newText);
    emitChange(newChoices, newText);
  };

  const handleAdditionalTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setAdditionalText(newText);

    // In exclusive mode, clear selections when typing text
    let newChoices = selectedChoices;
    if (additionalTextMode === 'exclusive' && newText.trim().length > 0) {
      newChoices = [];
      setSelectedChoices([]);
    }

    emitChange(newChoices, newText);
  };

  const isOptionSelected = (optionId: string): boolean => {
    return selectedChoices.includes(optionId);
  };

  const renderOption = (option: MultipleChoiceOption) => {
    const inputType = q.multiple ? 'checkbox' : 'radio';
    const isSelected = isOptionSelected(option.id);
    const isDisabledByExclusiveMode =
      q.allowAdditionalText &&
      additionalTextMode === 'exclusive' &&
      additionalText.trim().length > 0;

    const handleClick = (e: React.MouseEvent) => {
      if (disabled || readOnly || isDisabledByExclusiveMode) {
        e.preventDefault();
        return;
      }
      // For radio buttons, allow clicking to deselect
      handleOptionChange(option.id);
    };

    return (
      <label
        key={option.id}
        className={`
          flex items-start gap-3 p-3 rounded-lg border cursor-pointer
          transition-colors duration-200
          ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
          ${disabled || readOnly || isDisabledByExclusiveMode ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
        onClick={handleClick}
      >
        <input
          aria-label={option.label}
          checked={isSelected}
          className="mt-1 pointer-events-none"
          disabled={disabled || readOnly || isDisabledByExclusiveMode}
          name={`question-${question.id}`}
          type={inputType}
          value={option.id}
          readOnly
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

  const isTextInputDisabledByExclusiveMode =
    additionalTextMode === 'exclusive' && selectedChoices.length > 0;

  return (
    <QuestionWrapper<MultipleChoiceAnswer>
      className={className}
      disabled={disabled}
      question={question}
      readOnly={readOnly}
      response={response}
      onChange={onChange}
      onValidate={onValidate}
      renderQuestionText={renderQuestionText}
      hideAnswerWhenVetoed={hideAnswerWhenVetoed}
    >
      <div className="space-y-3">
        <div className={`grid ${gridClass} gap-2`}>{q.options.map(renderOption)}</div>

        {q.allowAdditionalText && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-start justify-between mb-2">
              {q.additionalTextLabel && (
                <label className="block text-sm font-medium text-gray-700">
                  {q.additionalTextLabel}
                </label>
              )}
              {additionalTextMode === 'exclusive' && (
                <span className="text-xs text-gray-500 italic">
                  {selectedChoices.length > 0
                    ? 'Text disabled while options are selected'
                    : 'Typing here will disable option selection'}
                </span>
              )}
            </div>
            <input
              className={`
                w-full px-3 py-2 border rounded-md
                ${disabled || readOnly || isTextInputDisabledByExclusiveMode ? 'bg-gray-100' : 'bg-white'}
                border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
              disabled={disabled || readOnly || isTextInputDisabledByExclusiveMode}
              placeholder={q.additionalTextPlaceholder || 'Additional comments or information...'}
              type="text"
              value={additionalText}
              onChange={handleAdditionalTextChange}
            />
          </div>
        )}
      </div>
    </QuestionWrapper>
  );
};

export default MultipleChoice;
