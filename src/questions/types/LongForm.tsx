import React, { useState, useEffect, useRef } from 'react';
import type { LongFormQuestion, QuestionComponentProps } from '../types';
import QuestionWrapper from '../core/QuestionWrapper';

export const LongForm: React.FC<QuestionComponentProps<string>> = ({
  question,
  response,
  onChange,
  onValidate,
  disabled = false,
  readOnly = false,
  className = '',
  renderQuestionText,
  hideAnswerWhenVetoed,
  vetoButtonClassName,
}) => {
  const q = question as LongFormQuestion;
  const value = response?.value ?? '';
  const error = response?.errors?.[0];
  const [localValue, setLocalValue] = useState(value);
  const [wordCount, setWordCount] = useState(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
    updateWordCount(value);
  }, [value]);

  useEffect(() => {
    adjustTextAreaHeight();
  }, [localValue]);

  const updateWordCount = (text: string) => {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  };

  const adjustTextAreaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  };

  const emitChange = (newValue: string) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (q.maxLength && newValue.length > q.maxLength) return;

    setLocalValue(newValue);
    updateWordCount(newValue);
    emitChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (q.enableMarkdown) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;
        const newValue = localValue.substring(0, start) + '  ' + localValue.substring(end);
        setLocalValue(newValue);
        emitChange(newValue);
        setTimeout(() => {
          if (textAreaRef.current) {
            textAreaRef.current.selectionStart = textAreaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textAreaRef.current) return;

    const start = textAreaRef.current.selectionStart;
    const end = textAreaRef.current.selectionEnd;
    const selectedText = localValue.substring(start, end);
    const newText =
      localValue.substring(0, start) + prefix + selectedText + suffix + localValue.substring(end);

    setLocalValue(newText);
    emitChange(newText);

    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const newCursorPos = start + prefix.length + selectedText.length;
        textAreaRef.current.selectionStart = textAreaRef.current.selectionEnd = newCursorPos;
      }
    }, 0);
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
      hideAnswerWhenVetoed={hideAnswerWhenVetoed}
      vetoButtonClassName={vetoButtonClassName}
    >
      <div className="space-y-2">
        {q.enableMarkdown && !disabled && !readOnly && (
          <div className="flex gap-1 p-1 bg-gray-50 rounded border border-gray-200">
            <button
              className="px-2 py-1 text-sm hover:bg-white rounded"
              title="Bold"
              type="button"
              onClick={() => insertMarkdown('**', '**')}
            >
              <strong>B</strong>
            </button>
            <button
              className="px-2 py-1 text-sm hover:bg-white rounded"
              title="Italic"
              type="button"
              onClick={() => insertMarkdown('*', '*')}
            >
              <em>I</em>
            </button>
            <button
              className="px-2 py-1 text-sm hover:bg-white rounded font-mono"
              title="Code"
              type="button"
              onClick={() => insertMarkdown('`', '`')}
            >
              &lt;/&gt;
            </button>
            <button
              className="px-2 py-1 text-sm hover:bg-white rounded"
              title="List"
              type="button"
              onClick={() => insertMarkdown('- ')}
            >
              •
            </button>
            <button
              className="px-2 py-1 text-sm hover:bg-white rounded"
              title="Link"
              type="button"
              onClick={() => insertMarkdown('[', '](url)')}
            >
              🔗
            </button>
          </div>
        )}

        <textarea
          ref={textAreaRef}
          aria-invalid={!!error}
          aria-label={q.text}
          aria-required={q.required}
          className={`
            w-full px-3 py-2 border rounded-md resize-none
            ${disabled || readOnly ? 'bg-gray-100' : 'bg-white'}
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${q.enableMarkdown ? 'font-mono text-sm' : ''}
          `}
          disabled={disabled}
          maxLength={q.maxLength}
          placeholder={q.placeholder}
          readOnly={readOnly}
          rows={q.rows || 4}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <div className="flex justify-between text-xs text-gray-500">
          <span>{wordCount} words</span>
          {q.maxLength && (
            <span>
              {localValue.length}/{q.maxLength} characters
            </span>
          )}
        </div>
      </div>
    </QuestionWrapper>
  );
};

export default LongForm;
