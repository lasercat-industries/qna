import React, { useState, useEffect, useMemo } from 'react';
import type { SliderQuestion, QuestionComponentProps } from '../types';
import QuestionWrapper from '../core/QuestionWrapper';

export const Slider: React.FC<QuestionComponentProps<number | [number, number]>> = ({
  question,
  value,
  onChange,
  onValidate,
  disabled = false,
  readOnly = false,
  error,
  className = '',
}) => {
  const q = question as SliderQuestion;
  const defaultValue = useMemo(
    () => (q.dual ? ([q.min, q.max] as [number, number]) : q.min),
    [q.dual, q.min, q.max],
  );
  const [localValue, setLocalValue] = useState<number | [number, number]>(value ?? defaultValue);

  useEffect(() => {
    setLocalValue(value ?? defaultValue);
  }, [value, defaultValue]);

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleDualChange = (index: number, newValue: number) => {
    if (!Array.isArray(localValue)) return;

    const updated: [number, number] = [...localValue] as [number, number];
    updated[index] = newValue;

    // Ensure min <= max
    if (index === 0 && updated[0] > updated[1]) {
      updated[1] = updated[0];
    } else if (index === 1 && updated[1] < updated[0]) {
      updated[0] = updated[1];
    }

    setLocalValue(updated);
    onChange(updated);
  };

  const percentage = (val: number) => {
    return ((val - q.min) / (q.max - q.min)) * 100;
  };

  const formatValue = (val: number) => {
    if (q.unit) return `${val}${q.unit}`;
    return val.toString();
  };

  if (q.dual) {
    const values: [number, number] = Array.isArray(localValue)
      ? (localValue as [number, number])
      : [q.min, q.max];
    const leftPercent = percentage(values[0]);
    const rightPercent = percentage(values[1]);

    return (
      <QuestionWrapper<[number, number]>
        className={className}
        disabled={disabled}
        error={error}
        question={{
          ...q,
          defaultValue: [q.min, q.max] as [number, number],
        }}
        readOnly={readOnly}
        value={values}
        onChange={onChange as (value: [number, number]) => void}
        onValidate={onValidate as ((value: [number, number]) => string[]) | undefined}
      >
        <div className="space-y-4">
          <div className="relative pt-6 pb-2">
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div
                className="absolute h-2 bg-blue-500 rounded-full"
                style={{
                  left: `${leftPercent}%`,
                  width: `${rightPercent - leftPercent}%`,
                }}
              />

              <input
                aria-label={`${q.text} - Minimum value`}
                className="absolute w-full -top-1 opacity-0 cursor-pointer"
                disabled={disabled || readOnly}
                max={q.max}
                min={q.min}
                step={q.step}
                style={{ pointerEvents: disabled || readOnly ? 'none' : 'auto' }}
                type="range"
                value={values[0]}
                onChange={(e) => handleDualChange(0, parseFloat(e.target.value))}
              />

              <input
                aria-label={`${q.text} - Maximum value`}
                className="absolute w-full -top-1 opacity-0 cursor-pointer"
                disabled={disabled || readOnly}
                max={q.max}
                min={q.min}
                step={q.step}
                style={{ pointerEvents: disabled || readOnly ? 'none' : 'auto' }}
                type="range"
                value={values[1]}
                onChange={(e) => handleDualChange(1, parseFloat(e.target.value))}
              />

              <div
                className="absolute w-4 h-4 bg-blue-600 rounded-full -top-1 shadow-md"
                style={{ left: `calc(${leftPercent}% - 8px)` }}
              />
              <div
                className="absolute w-4 h-4 bg-blue-600 rounded-full -top-1 shadow-md"
                style={{ left: `calc(${rightPercent}% - 8px)` }}
              />
            </div>

            {q.marks && (
              <div className="relative mt-2">
                {q.marks.map((mark) => (
                  <div
                    key={mark.value}
                    className="absolute text-xs text-gray-600"
                    style={{ left: `${percentage(mark.value)}%`, transform: 'translateX(-50%)' }}
                  >
                    {mark.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {q.showValue && (
            <div className="flex justify-center gap-4">
              <div className="px-3 py-1 bg-blue-50 rounded-md text-sm font-medium">
                {formatValue(values[0] ?? q.min)} - {formatValue(values[1] ?? q.max)}
              </div>
            </div>
          )}
        </div>
      </QuestionWrapper>
    );
  }

  // Single slider
  const singleValue = typeof localValue === 'number' ? localValue : q.min;

  return (
    <QuestionWrapper<number>
      className={className}
      disabled={disabled}
      error={error}
      question={{
        ...q,
        defaultValue: q.min,
      }}
      readOnly={readOnly}
      value={singleValue}
      onChange={onChange as (value: number) => void}
      onValidate={onValidate as ((value: number) => string[]) | undefined}
    >
      <div className="space-y-4">
        <div className="relative pt-6 pb-2">
          <input
            aria-label={q.text}
            aria-valuemax={q.max}
            aria-valuemin={q.min}
            aria-valuenow={singleValue}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            disabled={disabled || readOnly}
            max={q.max}
            min={q.min}
            step={q.step}
            type="range"
            value={singleValue}
            onChange={handleSingleChange}
          />

          {q.marks && (
            <div className="relative mt-2">
              {q.marks.map((mark) => (
                <div
                  key={mark.value}
                  className="absolute text-xs text-gray-600"
                  style={{ left: `${percentage(mark.value)}%`, transform: 'translateX(-50%)' }}
                >
                  {mark.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {q.showValue && (
          <div className="flex justify-center">
            <div className="px-3 py-1 bg-blue-50 rounded-md text-sm font-medium">
              {formatValue(singleValue)}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: #2563eb;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #2563eb;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: none;
        }
      `}</style>
    </QuestionWrapper>
  );
};

export default Slider;
