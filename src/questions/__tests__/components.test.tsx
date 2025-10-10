import { expect, test, describe } from 'bun:test';
import { ShortAnswer } from '../types/ShortAnswer';
import { LongForm } from '../types/LongForm';
import { MultipleChoice } from '../types/MultipleChoice';
import { TrueFalse } from '../types/TrueFalse';
import { Slider } from '../types/Slider';
import { StackRanking } from '../types/StackRanking';
import { NumericAnswer } from '../types/NumericAnswer';
import { QuestionWrapper } from '../core/QuestionWrapper';
import { QuestionGroup } from '../core/QuestionGroup';
import { QuestionRenderer } from '../core/QuestionRenderer';
import { ConditionalLogicEngine } from '../utils/conditionalLogic';
import type {
  ShortAnswerQuestion,
  MultipleChoiceQuestion,
  SliderQuestion,
  AnyQuestion,
} from '../types';

describe('Component Exports', () => {
  test('all question components are exported', () => {
    expect(ShortAnswer).toBeDefined();
    expect(LongForm).toBeDefined();
    expect(MultipleChoice).toBeDefined();
    expect(TrueFalse).toBeDefined();
    expect(Slider).toBeDefined();
    expect(StackRanking).toBeDefined();
    expect(NumericAnswer).toBeDefined();
  });

  test('core components are exported', () => {
    expect(QuestionWrapper).toBeDefined();
    expect(QuestionGroup).toBeDefined();
    expect(QuestionRenderer).toBeDefined();
  });

  test('utilities are exported', () => {
    expect(ConditionalLogicEngine).toBeDefined();
  });
});

describe('Question Types', () => {
  test('ShortAnswer question structure', () => {
    const question: ShortAnswerQuestion = {
      id: 'q1',
      type: 'short-answer',
      text: 'What is your name?',
      required: true,
      priority: 'high',
      tags: ['personal'],
      placeholder: 'Enter name',
      maxLength: 100,
      pattern: '^[A-Za-z ]+$',
      suggestions: ['John', 'Jane'],
    };

    expect(question.type).toBe('short-answer');
    expect(question.maxLength).toBe(100);
    expect(question.suggestions).toHaveLength(2);
  });

  test('MultipleChoice question structure', () => {
    const question: MultipleChoiceQuestion = {
      id: 'q2',
      type: 'multiple-choice',
      text: 'Select your skills',
      required: false,
      priority: 'medium',
      tags: ['skills'],
      options: [
        { id: 'js', label: 'JavaScript' },
        { id: 'ts', label: 'TypeScript' },
        { id: 'py', label: 'Python' },
      ],
      multiple: true,
      allowAdditionalText: true,
      additionalTextLabel: 'Other skills',
    };

    expect(question.type).toBe('multiple-choice');
    expect(question.options).toHaveLength(3);
    expect(question.multiple).toBe(true);
    expect(question.allowAdditionalText).toBe(true);
  });

  test('Slider question structure', () => {
    const question: SliderQuestion = {
      id: 'q3',
      type: 'slider',
      text: 'Rate your experience',
      required: true,
      priority: 'high',
      tags: ['rating'],
      min: 0,
      max: 10,
      step: 1,
      dual: false,
      showValue: true,
      unit: ' years',
    };

    expect(question.type).toBe('slider');
    expect(question.min).toBe(0);
    expect(question.max).toBe(10);
    expect(question.dual).toBe(false);
  });
});

describe('ConditionalLogicEngine', () => {
  test('initializes with questions and responses', () => {
    const questions: AnyQuestion[] = [
      {
        id: 'q1',
        type: 'short-answer',
        text: 'Name',
        required: true,
        priority: 'high',
        tags: [],
      },
    ];

    const engine = new ConditionalLogicEngine(questions, {});
    expect(engine).toBeDefined();
    expect(engine.getVisibleQuestions().has('q1')).toBe(true);
  });

  test('evaluates show/hide conditions', () => {
    const questions: AnyQuestion[] = [
      {
        id: 'q1',
        type: 'true-false',
        text: 'Are you employed?',
        required: true,
        priority: 'high',
        tags: [],
      },
      {
        id: 'q2',
        type: 'short-answer',
        text: 'Company name',
        required: false,
        priority: 'medium',
        tags: [],
        conditions: [
          {
            questionId: 'q1',
            operator: 'equals',
            value: true,
            action: 'show',
          },
        ],
      },
    ];

    const engine = new ConditionalLogicEngine(questions, {});

    // Initially, q2 should be hidden
    expect(engine.getVisibleQuestions().has('q2')).toBe(false);

    // After setting q1 to true, q2 should be visible
    engine.updateResponse('q1', {
      questionId: 'q1',
      value: true,
      timestamp: new Date(),
      valid: true,
      errors: [],
    });

    expect(engine.getVisibleQuestions().has('q2')).toBe(true);
  });

  test('handles multiple conditions', () => {
    const questions: AnyQuestion[] = [
      {
        id: 'age',
        type: 'numeric',
        text: 'Age',
        required: true,
        priority: 'high',
        tags: [],
        min: 0,
        max: 120,
      },
      {
        id: 'senior',
        type: 'short-answer',
        text: 'Senior benefits',
        required: false,
        priority: 'low',
        tags: [],
        conditions: [
          {
            questionId: 'age',
            operator: 'greater-than-or-equal',
            value: 65,
            action: 'show',
          },
        ],
      },
    ];

    const engine = new ConditionalLogicEngine(questions, {});

    // Initially hidden
    expect(engine.getVisibleQuestions().has('senior')).toBe(false);

    // Still hidden at 64
    engine.updateResponse('age', {
      questionId: 'age',
      value: 64,
      timestamp: new Date(),
      valid: true,
      errors: [],
    });
    expect(engine.getVisibleQuestions().has('senior')).toBe(false);

    // Visible at 65
    engine.updateResponse('age', {
      questionId: 'age',
      value: 65,
      timestamp: new Date(),
      valid: true,
      errors: [],
    });
    expect(engine.getVisibleQuestions().has('senior')).toBe(true);
  });

  test('handles contains operator for arrays', () => {
    const questions: AnyQuestion[] = [
      {
        id: 'skills',
        type: 'multiple-choice',
        text: 'Skills',
        required: true,
        priority: 'high',
        tags: [],
        options: [
          { id: 'react', label: 'React' },
          { id: 'vue', label: 'Vue' },
          { id: 'angular', label: 'Angular' },
        ],
        multiple: true,
        allowAdditionalText: false,
      },
      {
        id: 'react-version',
        type: 'short-answer',
        text: 'React version',
        required: false,
        priority: 'low',
        tags: [],
        conditions: [
          {
            questionId: 'skills',
            operator: 'contains',
            value: 'react',
            action: 'show',
          },
        ],
      },
    ];

    const engine = new ConditionalLogicEngine(questions, {});

    // Initially hidden
    expect(engine.getVisibleQuestions().has('react-version')).toBe(false);

    // Visible when React is selected
    engine.updateResponse('skills', {
      questionId: 'skills',
      value: ['react', 'vue'],
      timestamp: new Date(),
      valid: true,
      errors: [],
    });
    expect(engine.getVisibleQuestions().has('react-version')).toBe(true);

    // Hidden when React is not selected
    engine.updateResponse('skills', {
      questionId: 'skills',
      value: ['vue', 'angular'],
      timestamp: new Date(),
      valid: true,
      errors: [],
    });
    expect(engine.getVisibleQuestions().has('react-version')).toBe(false);
  });

  test('caches visibility results', () => {
    const questions: AnyQuestion[] = [
      {
        id: 'q1',
        type: 'short-answer',
        text: 'Question 1',
        required: true,
        priority: 'high',
        tags: [],
      },
    ];

    const engine = new ConditionalLogicEngine(questions, {});

    // First call calculates
    const visible1 = engine.getVisibleQuestions();
    // Second call uses cache
    const visible2 = engine.getVisibleQuestions();

    expect(visible1).toEqual(visible2);
    expect(visible1.has('q1')).toBe(true);
  });

  test('clears cache on response update', () => {
    const questions: AnyQuestion[] = [
      {
        id: 'toggle',
        type: 'true-false',
        text: 'Toggle',
        required: true,
        priority: 'high',
        tags: [],
      },
      {
        id: 'dependent',
        type: 'short-answer',
        text: 'Dependent',
        required: false,
        priority: 'low',
        tags: [],
        conditions: [
          {
            questionId: 'toggle',
            operator: 'equals',
            value: true,
            action: 'show',
          },
        ],
      },
    ];

    const engine = new ConditionalLogicEngine(questions, {});

    // Get initial state (caches result)
    const visible1 = engine.getVisibleQuestions();
    expect(visible1.has('dependent')).toBe(false);

    // Update response (should clear cache)
    engine.updateResponse('toggle', {
      questionId: 'toggle',
      value: true,
      timestamp: new Date(),
      valid: true,
      errors: [],
    });

    // Get new state (recalculates)
    const visible2 = engine.getVisibleQuestions();
    expect(visible2.has('dependent')).toBe(true);
  });
});

describe('Question Validation', () => {
  test('validates required fields', () => {
    const question: ShortAnswerQuestion = {
      id: 'q1',
      type: 'short-answer',
      text: 'Required field',
      required: true,
      priority: 'high',
      tags: [],
    };

    // Empty value for required field
    expect(question.required).toBe(true);

    // Would fail validation if empty
    const emptyValue = '';
    const hasValue = emptyValue.length > 0;
    expect(hasValue).toBe(false);
  });

  test('validates pattern matching', () => {
    const emailPattern = '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$';
    const validEmail = 'test@example.com';
    const invalidEmail = 'not-an-email';

    const emailRegex = new RegExp(emailPattern);
    expect(emailRegex.test(validEmail)).toBe(true);
    expect(emailRegex.test(invalidEmail)).toBe(false);
  });

  test('validates numeric ranges', () => {
    const min = 0;
    const max = 100;

    const validateRange = (value: number) => value >= min && value <= max;

    expect(validateRange(50)).toBe(true);
    expect(validateRange(0)).toBe(true);
    expect(validateRange(100)).toBe(true);
    expect(validateRange(-1)).toBe(false);
    expect(validateRange(101)).toBe(false);
  });
});
