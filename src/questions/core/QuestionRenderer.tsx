import React from 'react';
import type { 
  AnyQuestion, 
  QuestionComponentProps,
  ShortAnswerQuestion,
  LongFormQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  SliderQuestion,
  StackRankingQuestion,
  NumericQuestion
} from '../types';
import ShortAnswer from '../types/ShortAnswer';
import LongForm from '../types/LongForm';
import MultipleChoice from '../types/MultipleChoice';
import TrueFalse from '../types/TrueFalse';
import Slider from '../types/Slider';
import StackRanking from '../types/StackRanking';
import NumericAnswer from '../types/NumericAnswer';

interface QuestionRendererProps extends Omit<QuestionComponentProps, 'question'> {
  question: AnyQuestion;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  onValidate,
  disabled,
  readOnly,
  error,
  className
}) => {
  // Props are passed directly to each component with proper typing

  switch (question.type) {
    case 'short-answer':
      return <ShortAnswer
        question={question as ShortAnswerQuestion}
        value={value as string | undefined}
        onChange={onChange as (value: string) => void}
        onValidate={onValidate as ((value: string) => string[]) | undefined}
        disabled={disabled}
        readOnly={readOnly}
        error={error}
        className={className}
      />;
    
    case 'long-form':
      return <LongForm
        question={question as LongFormQuestion}
        value={value as string | undefined}
        onChange={onChange as (value: string) => void}
        onValidate={onValidate as ((value: string) => string[]) | undefined}
        disabled={disabled}
        readOnly={readOnly}
        error={error}
        className={className}
      />;
    
    case 'multiple-choice':
      return <MultipleChoice
        question={question as MultipleChoiceQuestion}
        value={value as (string | string[]) | undefined}
        onChange={onChange as (value: string | string[]) => void}
        onValidate={onValidate as ((value: string | string[]) => string[]) | undefined}
        disabled={disabled}
        readOnly={readOnly}
        error={error}
        className={className}
      />;
    
    case 'true-false':
      return <TrueFalse
        question={question as TrueFalseQuestion}
        value={value as boolean | undefined}
        onChange={onChange as (value: boolean) => void}
        onValidate={onValidate as ((value: boolean) => string[]) | undefined}
        disabled={disabled}
        readOnly={readOnly}
        error={error}
        className={className}
      />;
    
    case 'slider':
      return <Slider
        question={question as SliderQuestion}
        value={value as (number | [number, number]) | undefined}
        onChange={onChange as (value: number | [number, number]) => void}
        onValidate={onValidate as ((value: number | [number, number]) => string[]) | undefined}
        disabled={disabled}
        readOnly={readOnly}
        error={error}
        className={className}
      />;
    
    case 'stack-ranking':
      return <StackRanking
        question={question as StackRankingQuestion}
        value={value as string[] | undefined}
        onChange={onChange as (value: string[]) => void}
        onValidate={onValidate as ((value: string[]) => string[]) | undefined}
        disabled={disabled}
        readOnly={readOnly}
        error={error}
        className={className}
      />;
    
    case 'numeric':
      return <NumericAnswer
        question={question as NumericQuestion}
        value={value as number | undefined}
        onChange={onChange as (value: number) => void}
        onValidate={onValidate as ((value: number) => string[]) | undefined}
        disabled={disabled}
        readOnly={readOnly}
        error={error}
        className={className}
      />;
    
    default: {
      const unknownQuestion = question as AnyQuestion;
      console.error(`Unknown question type: ${unknownQuestion.type}`);
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">Unknown question type: {unknownQuestion.type}</p>
        </div>
      );
    }
  }
};

export default QuestionRenderer;