import React, { useState, useEffect, useMemo } from 'react';
import type { SliderQuestion, QuestionComponentProps, QuestionResponse } from '../types';
import QuestionWrapper from '../core/QuestionWrapper';

export const Slider: React.FC<QuestionComponentProps<number | [number, number]>> = ({
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
  const q = question as SliderQuestion;
  const defaultValue = useMemo(
    () => (q.dual ? ([q.min, q.max] as [number, number]) : q.min),
    [q.dual, q.min, q.max],
  );
  const value = response?.value ?? defaultValue;
  const [localValue, setLocalValue] = useState<number | [number, number]>(value);
  const [activeThumb, setActiveThumb] = useState<number | null>(null);
  const [inputValues, setInputValues] = useState<{ single?: string; dual?: [string, string] }>({});

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const emitChange = (newValue: number | [number, number]) => {
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

  const handleSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    emitChange(newValue);
  };

  const handleSingleInputChange = (inputValue: string) => {
    setInputValues({ ...inputValues, single: inputValue });
  };

  const handleSingleInputBlur = () => {
    const inputValue = inputValues.single;
    if (inputValue === undefined) return;

    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed >= q.min && parsed <= q.max) {
      setLocalValue(parsed);
      emitChange(parsed);
    }
    // Clear the input value to show the actual value
    setInputValues({ ...inputValues, single: undefined });
  };

  const handleDualChange = (index: number, newValue: number) => {
    if (!Array.isArray(localValue)) return;

    const updated: [number, number] = [...localValue] as [number, number];

    // Clamp value to valid range
    const clampedValue = Math.max(q.min, Math.min(q.max, newValue));
    updated[index] = clampedValue;

    // Ensure min <= max without auto-adjusting the other value
    if (index === 0 && updated[0] > updated[1]) {
      updated[0] = updated[1];
    } else if (index === 1 && updated[1] < updated[0]) {
      updated[1] = updated[0];
    }

    setLocalValue(updated);
    emitChange(updated);
  };

  const handleDualInputChange = (index: number, inputValue: string) => {
    const currentDual = inputValues.dual || ['', ''];
    const newDual: [string, string] = [...currentDual] as [string, string];
    newDual[index] = inputValue;
    setInputValues({ ...inputValues, dual: newDual });
  };

  const handleDualInputBlur = (index: number) => {
    const currentDual = inputValues.dual;
    if (!currentDual || !currentDual[index]) return;

    const parsed = parseFloat(currentDual[index]);
    const values: [number, number] = Array.isArray(localValue)
      ? (localValue as [number, number])
      : [q.min, q.max];

    if (!isNaN(parsed) && parsed >= q.min && parsed <= q.max) {
      // Check that min <= max constraint is satisfied
      if (index === 0 && parsed <= values[1]) {
        handleDualChange(index, parsed);
      } else if (index === 1 && parsed >= values[0]) {
        handleDualChange(index, parsed);
      }
    }

    // Clear the input value to show the actual value
    const newDual: [string, string] = inputValues.dual
      ? ([...inputValues.dual] as [string, string])
      : ['', ''];
    newDual[index] = '';
    setInputValues({ ...inputValues, dual: newDual });
  };

  const percentage = (val: number) => {
    return ((val - q.min) / (q.max - q.min)) * 100;
  };

  if (q.dual) {
    const values: [number, number] = Array.isArray(localValue)
      ? (localValue as [number, number])
      : [q.min, q.max];
    const leftPercent = percentage(values[0]);
    const rightPercent = percentage(values[1]);

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || readOnly) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const distToLeft = Math.abs(x - leftPercent);
      const distToRight = Math.abs(x - rightPercent);

      // Set which thumb should be active based on proximity
      if (distToLeft < distToRight) {
        setActiveThumb(0);
      } else {
        setActiveThumb(1);
      }
    };

    return (
      <QuestionWrapper<[number, number]>
        className={className}
        disabled={disabled}
        question={{
          ...q,
          defaultValue: [q.min, q.max] as [number, number],
        }}
        readOnly={readOnly}
        response={response as QuestionResponse<[number, number]> | undefined}
        onChange={onChange as (response: QuestionResponse<[number, number]>) => void}
        onValidate={onValidate as ((value: [number, number]) => string[]) | undefined}
        renderQuestionText={renderQuestionText}
        renderVetoButton={renderVetoButton}
      >
        <div className="space-y-4">
          <div
            className="relative py-4 px-4"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setActiveThumb(null)}
          >
            <div className="relative h-2 bg-gray-200 rounded-full overflow-visible">
              <div
                className="absolute h-2 bg-blue-500 rounded-full"
                style={{
                  left: `${leftPercent}%`,
                  width: `${rightPercent - leftPercent}%`,
                }}
              />

              <div
                className="absolute w-5 h-5 bg-blue-600 rounded-full shadow-md -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${leftPercent}%`,
                  top: '50%',
                  pointerEvents: 'none',
                }}
              />
              <div
                className="absolute w-5 h-5 bg-blue-600 rounded-full shadow-md -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${rightPercent}%`,
                  top: '50%',
                  pointerEvents: 'none',
                }}
              />

              <input
                aria-label={`${q.text} - Minimum value`}
                className="absolute w-full h-5 opacity-0 cursor-pointer"
                disabled={disabled || readOnly}
                max={q.max}
                min={q.min}
                step={q.step}
                style={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: disabled || readOnly || activeThumb === 1 ? 'none' : 'auto',
                  zIndex: activeThumb === 0 ? 10 : 1,
                }}
                type="range"
                value={values[0]}
                onChange={(e) => handleDualChange(0, parseFloat(e.target.value))}
              />

              <input
                aria-label={`${q.text} - Maximum value`}
                className="absolute w-full h-5 opacity-0 cursor-pointer"
                disabled={disabled || readOnly}
                max={q.max}
                min={q.min}
                step={q.step}
                style={{
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: disabled || readOnly || activeThumb === 0 ? 'none' : 'auto',
                  zIndex: activeThumb === 1 ? 10 : 2,
                }}
                type="range"
                value={values[1]}
                onChange={(e) => handleDualChange(1, parseFloat(e.target.value))}
              />
            </div>

            {q.marks && (
              <div className="relative mt-2 px-2">
                {q.marks.map((mark, index) => {
                  const percent = percentage(mark.value);
                  // Adjust positioning for edge marks to stay within bounds
                  let transform = 'translateX(-50%)';
                  let left = `${percent}%`;

                  if (index === 0 && percent <= 10) {
                    // First mark - align to left edge if too close to start
                    transform = 'translateX(0)';
                    left = '0';
                  } else if (q.marks && index === q.marks.length - 1 && percent >= 90) {
                    // Last mark - align to right edge if too close to end
                    transform = 'translateX(-100%)';
                    left = '100%';
                  }

                  return (
                    <div
                      key={mark.value}
                      className="absolute text-xs text-gray-600 whitespace-nowrap"
                      style={{ left, transform }}
                    >
                      {mark.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {q.showValue && (
            <div className="flex justify-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Min:</label>
                <input
                  type="text"
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={
                    inputValues.dual?.[0] !== '' && inputValues.dual?.[0] !== undefined
                      ? inputValues.dual[0]
                      : values[0]
                  }
                  onChange={(e) => handleDualInputChange(0, e.target.value)}
                  onBlur={() => handleDualInputBlur(0)}
                  disabled={disabled || readOnly}
                />
                <span className="text-sm text-gray-600">{q.unit || ''}</span>
              </div>
              <span className="text-gray-400">–</span>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Max:</label>
                <input
                  type="text"
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={
                    inputValues.dual?.[1] !== '' && inputValues.dual?.[1] !== undefined
                      ? inputValues.dual[1]
                      : values[1]
                  }
                  onChange={(e) => handleDualInputChange(1, e.target.value)}
                  onBlur={() => handleDualInputBlur(1)}
                  disabled={disabled || readOnly}
                />
                <span className="text-sm text-gray-600">{q.unit || ''}</span>
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
      question={{
        ...q,
        defaultValue: q.min,
      }}
      readOnly={readOnly}
      response={response as QuestionResponse<number> | undefined}
      onChange={onChange as (response: QuestionResponse<number>) => void}
      onValidate={onValidate as ((value: number) => string[]) | undefined}
      renderQuestionText={renderQuestionText}
      renderVetoButton={renderVetoButton}
    >
      <div className="space-y-4">
        <div className="relative pt-6 pb-2 px-4">
          <div className="relative h-2 bg-gray-200 rounded-full overflow-visible">
            <div
              className="absolute h-2 bg-blue-500 rounded-full"
              style={{
                left: '0',
                width: `${percentage(singleValue)}%`,
              }}
            />

            <div
              className="absolute w-5 h-5 bg-blue-600 rounded-full shadow-md -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${percentage(singleValue)}%`,
                top: '50%',
                pointerEvents: 'none',
              }}
            />

            <input
              aria-label={q.text}
              aria-valuemax={q.max}
              aria-valuemin={q.min}
              aria-valuenow={singleValue}
              className="absolute w-full h-5 opacity-0 cursor-pointer"
              disabled={disabled || readOnly}
              max={q.max}
              min={q.min}
              step={q.step}
              style={{
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
              }}
              type="range"
              value={singleValue}
              onChange={handleSingleChange}
            />
          </div>

          {q.marks && (
            <div className="relative mt-2 px-2">
              {q.marks.map((mark, index) => {
                const percent = percentage(mark.value);
                // Adjust positioning for edge marks to stay within bounds
                let transform = 'translateX(-50%)';
                let left = `${percent}%`;

                if (index === 0 && percent <= 10) {
                  // First mark - align to left edge if too close to start
                  transform = 'translateX(0)';
                  left = '0';
                } else if (q.marks && index === q.marks.length - 1 && percent >= 90) {
                  // Last mark - align to right edge if too close to end
                  transform = 'translateX(-100%)';
                  left = '100%';
                }

                return (
                  <div
                    key={mark.value}
                    className="absolute text-xs text-gray-600 whitespace-nowrap"
                    style={{ left, transform }}
                  >
                    {mark.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {q.showValue && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={
                  inputValues.single !== '' && inputValues.single !== undefined
                    ? inputValues.single
                    : singleValue
                }
                onChange={(e) => handleSingleInputChange(e.target.value)}
                onBlur={handleSingleInputBlur}
                disabled={disabled || readOnly}
              />
              {q.unit && <span className="text-sm text-gray-600">{q.unit}</span>}
            </div>
          </div>
        )}
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: transparent;
          cursor: pointer;
          border-radius: 50%;
          position: relative;
          z-index: 10;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: transparent;
          cursor: pointer;
          border-radius: 50%;
          border: none;
          position: relative;
          z-index: 10;
        }
      `}</style>
    </QuestionWrapper>
  );
};

export default Slider;
