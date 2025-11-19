import React from 'react';
import type {
  AnyQuestion,
  QuestionResponse,
  ShortAnswerQuestion,
  LongFormQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  SliderQuestion,
  StackRankingQuestion,
  NumericQuestion,
  MultipleChoiceAnswer,
} from '../types';
import ShortAnswer from '../types/ShortAnswer';
import LongForm from '../types/LongForm';
import MultipleChoice from '../types/MultipleChoice';
import TrueFalse from '../types/TrueFalse';
import Slider from '../types/Slider';
import StackRanking from '../types/StackRanking';
import NumericAnswer from '../types/NumericAnswer';

interface QuestionRendererProps<T = unknown> {
  question: AnyQuestion;
  response?: QuestionResponse<T>;
  onChange: (response: QuestionResponse<T>) => void;
  onValidate?: (value: T) => string[];
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  renderQuestionText?: (question: AnyQuestion) => React.ReactNode;
  hideAnswerWhenVetoed?: boolean;
  vetoButtonClassName?: (isVetoed: boolean) => string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  response,
  onChange,
  onValidate,
  disabled,
  readOnly,
  className,
  renderQuestionText,
  hideAnswerWhenVetoed,
  vetoButtonClassName,
}) => {
  // Props are passed directly to each component with proper typing

  switch (question.type) {
    case 'short-answer':
      return (
        <ShortAnswer
          question={question as ShortAnswerQuestion}
          response={response as QuestionResponse<string> | undefined}
          onChange={onChange as (response: QuestionResponse<string>) => void}
          onValidate={onValidate as ((value: string) => string[]) | undefined}
          disabled={disabled}
          readOnly={readOnly}
          className={className}
          renderQuestionText={renderQuestionText}
          hideAnswerWhenVetoed={hideAnswerWhenVetoed}
          vetoButtonClassName={vetoButtonClassName}
        />
      );

    case 'long-form':
      return (
        <LongForm
          question={question as LongFormQuestion}
          response={response as QuestionResponse<string> | undefined}
          onChange={onChange as (response: QuestionResponse<string>) => void}
          onValidate={onValidate as ((value: string) => string[]) | undefined}
          disabled={disabled}
          readOnly={readOnly}
          className={className}
          renderQuestionText={renderQuestionText}
          hideAnswerWhenVetoed={hideAnswerWhenVetoed}
          vetoButtonClassName={vetoButtonClassName}
        />
      );

    case 'multiple-choice':
      return (
        <MultipleChoice
          question={question as MultipleChoiceQuestion}
          response={response as QuestionResponse<MultipleChoiceAnswer> | undefined}
          onChange={onChange as (response: QuestionResponse<MultipleChoiceAnswer>) => void}
          onValidate={onValidate as ((value: MultipleChoiceAnswer) => string[]) | undefined}
          disabled={disabled}
          readOnly={readOnly}
          className={className}
          renderQuestionText={renderQuestionText}
          hideAnswerWhenVetoed={hideAnswerWhenVetoed}
          vetoButtonClassName={vetoButtonClassName}
        />
      );

    case 'true-false':
      return (
        <TrueFalse
          question={question as TrueFalseQuestion}
          response={response as QuestionResponse<boolean | undefined> | undefined}
          onChange={onChange as (response: QuestionResponse<boolean | undefined>) => void}
          onValidate={onValidate as ((value: boolean | undefined) => string[]) | undefined}
          disabled={disabled}
          readOnly={readOnly}
          className={className}
          renderQuestionText={renderQuestionText}
          hideAnswerWhenVetoed={hideAnswerWhenVetoed}
          vetoButtonClassName={vetoButtonClassName}
        />
      );

    case 'slider':
      return (
        <Slider
          question={question as SliderQuestion}
          response={response as QuestionResponse<number | [number, number]> | undefined}
          onChange={onChange as (response: QuestionResponse<number | [number, number]>) => void}
          onValidate={onValidate as ((value: number | [number, number]) => string[]) | undefined}
          disabled={disabled}
          readOnly={readOnly}
          className={className}
          renderQuestionText={renderQuestionText}
          hideAnswerWhenVetoed={hideAnswerWhenVetoed}
          vetoButtonClassName={vetoButtonClassName}
        />
      );

    case 'stack-ranking':
      return (
        <StackRanking
          question={question as StackRankingQuestion}
          response={response as QuestionResponse<string[]> | undefined}
          onChange={onChange as (response: QuestionResponse<string[]>) => void}
          onValidate={onValidate as ((value: string[]) => string[]) | undefined}
          disabled={disabled}
          readOnly={readOnly}
          className={className}
          renderQuestionText={renderQuestionText}
          hideAnswerWhenVetoed={hideAnswerWhenVetoed}
          vetoButtonClassName={vetoButtonClassName}
        />
      );

    case 'numeric':
      return (
        <NumericAnswer
          question={question as NumericQuestion}
          response={response as QuestionResponse<number> | undefined}
          onChange={onChange as (response: QuestionResponse<number>) => void}
          onValidate={onValidate as ((value: number) => string[]) | undefined}
          disabled={disabled}
          readOnly={readOnly}
          className={className}
          renderQuestionText={renderQuestionText}
          hideAnswerWhenVetoed={hideAnswerWhenVetoed}
          vetoButtonClassName={vetoButtonClassName}
        />
      );

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
