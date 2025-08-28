/**
 * Test utilities for Vitest tests
 */
import type {
  ShortAnswerQuestion,
  NumericQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  QuestionResponse,
} from '../types';

export const createMockShortAnswerQuestion = (
  overrides?: Partial<ShortAnswerQuestion>,
): ShortAnswerQuestion => ({
  id: 'short-1',
  type: 'short-answer',
  text: 'What is your name?',
  required: false,
  priority: 'medium',
  tags: ['personal'],
  ...overrides,
});

export const createMockNumericQuestion = (
  overrides?: Partial<NumericQuestion>,
): NumericQuestion => ({
  id: 'num-1',
  type: 'numeric',
  text: 'Enter a number',
  required: false,
  priority: 'medium',
  tags: [],
  min: 0,
  max: 100,
  step: 1,
  ...overrides,
});

export const createMockMultipleChoiceQuestion = (
  overrides?: Partial<MultipleChoiceQuestion>,
): MultipleChoiceQuestion => ({
  id: 'mc-1',
  type: 'multiple-choice',
  text: 'Select your option',
  required: false,
  priority: 'medium',
  tags: [],
  options: [
    { id: 'opt1', label: 'Option 1' },
    { id: 'opt2', label: 'Option 2' },
  ],
  multiple: false,
  showOther: false,
  ...overrides,
});

export const createMockTrueFalseQuestion = (
  overrides?: Partial<TrueFalseQuestion>,
): TrueFalseQuestion => ({
  id: 'tf-1',
  type: 'true-false',
  text: 'Is this true?',
  required: false,
  priority: 'medium',
  tags: [],
  ...overrides,
});

export const createMockResponse = (
  questionId: string,
  value: unknown,
  valid = true,
): QuestionResponse => ({
  questionId,
  value,
  timestamp: new Date(),
  valid,
  errors: [],
});
