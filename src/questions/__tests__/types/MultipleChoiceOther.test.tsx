import { expect, test, describe } from 'bun:test';
import type { MultipleChoiceQuestion, MultipleChoiceAnswer } from '../../types';

describe('MultipleChoice with Additional Text', () => {
  describe('Type Definitions', () => {
    test('MultipleChoiceQuestion supports allowAdditionalText', () => {
      const question: MultipleChoiceQuestion = {
        id: 'q1',
        type: 'multiple-choice',
        text: 'Select your preferences',
        required: true,
        priority: 'high',
        tags: [],
        options: [
          { id: 'opt1', label: 'Option 1' },
          { id: 'opt2', label: 'Option 2' },
        ],
        multiple: true,
        allowAdditionalText: true,
        additionalTextLabel: 'Additional comments',
        additionalTextPlaceholder: 'Enter any additional information...',
      };

      expect(question.allowAdditionalText).toBe(true);
      expect(question.additionalTextLabel).toBe('Additional comments');
      expect(question.additionalTextPlaceholder).toBe('Enter any additional information...');
    });

    test('MultipleChoiceQuestion without additional text', () => {
      const question: MultipleChoiceQuestion = {
        id: 'q2',
        type: 'multiple-choice',
        text: 'Select your skills',
        required: false,
        priority: 'medium',
        tags: [],
        options: [
          { id: 'js', label: 'JavaScript' },
          { id: 'py', label: 'Python' },
        ],
        multiple: true,
        allowAdditionalText: false,
      };

      expect(question.allowAdditionalText).toBe(false);
    });

    test('MultipleChoiceAnswer structure', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1', 'opt2'],
        additionalText: 'Custom text input',
      };

      expect(answer.selectedChoices).toHaveLength(2);
      expect(answer.additionalText).toBe('Custom text input');
    });
  });

  describe('Answer Format', () => {
    test('supports structured answer with additional text', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1'],
        additionalText: 'My custom answer',
      };

      expect(answer.selectedChoices).toEqual(['opt1']);
      expect(answer.additionalText).toBe('My custom answer');
    });

    test('supports answer without additional text', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1', 'opt2'],
      };

      expect(answer.selectedChoices).toEqual(['opt1', 'opt2']);
      expect(answer.additionalText).toBeUndefined();
    });

    test('supports empty answer', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: [],
      };

      expect(answer.selectedChoices).toHaveLength(0);
    });

    test('supports answer with choices and text', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['js', 'py'],
        additionalText: 'I also know Rust and Go',
      };

      expect(answer.selectedChoices).toContain('js');
      expect(answer.selectedChoices).toContain('py');
      expect(answer.additionalText).toBe('I also know Rust and Go');
    });
  });

  describe('Validation Scenarios', () => {
    test('required validation with MultipleChoiceAnswer', () => {
      const emptyAnswer: MultipleChoiceAnswer = {
        selectedChoices: [],
      };

      const validAnswer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1'],
      };

      expect(emptyAnswer.selectedChoices.length === 0).toBe(true);
      expect(validAnswer.selectedChoices.length > 0).toBe(true);
    });

    test('minimum selection validation', () => {
      const minRequired = 2;

      const insufficientAnswer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1'],
      };

      const sufficientAnswer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1', 'opt2'],
      };

      expect(insufficientAnswer.selectedChoices.length < minRequired).toBe(true);
      expect(sufficientAnswer.selectedChoices.length >= minRequired).toBe(true);
    });

    test('maximum selection validation', () => {
      const maxAllowed = 2;

      const validAnswer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1', 'opt2'],
      };

      const exceededAnswer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1', 'opt2', 'opt3'],
      };

      expect(validAnswer.selectedChoices.length <= maxAllowed).toBe(true);
      expect(exceededAnswer.selectedChoices.length > maxAllowed).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty additional text', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1'],
        additionalText: '',
      };

      expect(answer.selectedChoices).toContain('opt1');
      expect(answer.additionalText).toBe('');
    });

    test('handles additional text updates', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1'],
        additionalText: 'Initial text',
      };

      const updatedAnswer: MultipleChoiceAnswer = {
        ...answer,
        additionalText: 'Updated text',
      };

      expect(updatedAnswer.additionalText).toBe('Updated text');
      expect(updatedAnswer.selectedChoices).toEqual(answer.selectedChoices);
    });

    test('handles no selections with additional text', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: [],
        additionalText: 'Just some text without selections',
      };

      expect(answer.selectedChoices).toHaveLength(0);
      expect(answer.additionalText).toBe('Just some text without selections');
    });

    test('handles whitespace in additional text', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1'],
        additionalText: '   ',
      };

      expect(answer.additionalText).toBe('   ');
      if (answer.additionalText) {
        expect(answer.additionalText.trim()).toBe('');
      }
    });
  });

  describe('Single Select with Additional Text', () => {
    test('single select question with additional text', () => {
      const question: MultipleChoiceQuestion = {
        id: 'q3',
        type: 'multiple-choice',
        text: 'Select one',
        required: true,
        priority: 'high',
        tags: [],
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
        multiple: false,
        allowAdditionalText: true,
        additionalTextLabel: 'Please explain',
      };

      expect(question.multiple).toBe(false);
      expect(question.allowAdditionalText).toBe(true);
    });

    test('single select answer with additional text', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['yes'],
        additionalText: 'Because it makes sense',
      };

      expect(answer.selectedChoices).toHaveLength(1);
      expect(answer.selectedChoices[0]).toBe('yes');
      expect(answer.additionalText).toBe('Because it makes sense');
    });
  });

  describe('Multi-Select with Additional Text', () => {
    test('can select multiple options and provide additional text', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['js', 'ts', 'py'],
        additionalText: 'Also learning Rust',
      };

      expect(answer.selectedChoices).toHaveLength(3);
      expect(answer.additionalText).toBeDefined();
    });

    test('can update selections without changing additional text', () => {
      const initial: MultipleChoiceAnswer = {
        selectedChoices: ['opt1'],
        additionalText: 'My comment',
      };

      const updated: MultipleChoiceAnswer = {
        ...initial,
        selectedChoices: ['opt1', 'opt2'],
      };

      expect(updated.selectedChoices).toHaveLength(2);
      expect(updated.additionalText).toBe('My comment');
    });
  });
});
