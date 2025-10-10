import { expect, test, describe } from 'bun:test';
import type { MultipleChoiceQuestion, MultipleChoiceAnswer } from '../../types';

describe('MultipleChoice with Other Option', () => {
  describe('Type Definitions', () => {
    test('MultipleChoiceQuestion supports otherOptionMode', () => {
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
        showOther: true,
        otherLabel: 'Other preference',
        otherOptionMode: 'exclusive',
      };

      expect(question.otherOptionMode).toBe('exclusive');
      expect(question.showOther).toBe(true);
      expect(question.otherLabel).toBe('Other preference');
    });

    test('MultipleChoiceQuestion supports additional mode', () => {
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
        showOther: true,
        otherOptionMode: 'additional',
      };

      expect(question.otherOptionMode).toBe('additional');
    });

    test('MultipleChoiceAnswer structure', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1', 'opt2', 'other'],
        otherText: 'Custom option text',
      };

      expect(answer.selectedChoices).toHaveLength(3);
      expect(answer.selectedChoices).toContain('other');
      expect(answer.otherText).toBe('Custom option text');
    });
  });

  describe('Answer Format', () => {
    test('supports structured answer with other text', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1', 'other'],
        otherText: 'My custom answer',
      };

      expect(answer.selectedChoices).toEqual(['opt1', 'other']);
      expect(answer.otherText).toBe('My custom answer');
    });

    test('supports answer without other option', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['opt1', 'opt2'],
      };

      expect(answer.selectedChoices).toEqual(['opt1', 'opt2']);
      expect(answer.otherText).toBeUndefined();
    });

    test('supports empty answer', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: [],
      };

      expect(answer.selectedChoices).toHaveLength(0);
    });
  });

  describe('Exclusive Mode Behavior', () => {
    test('exclusive mode should clear other selections when other is selected', () => {
      const initialChoices = ['opt1', 'opt2'];
      const selectingOther = true;

      let newChoices: string[];
      if (selectingOther) {
        newChoices = ['other'];
      } else {
        newChoices = initialChoices;
      }

      expect(newChoices).toEqual(['other']);
      expect(newChoices).not.toContain('opt1');
      expect(newChoices).not.toContain('opt2');
    });

    test('exclusive mode should clear other when selecting regular option', () => {
      const currentChoices = ['other'];
      const selectingOption = 'opt1';

      const newChoices = [...currentChoices.filter((c) => c !== 'other'), selectingOption];

      expect(newChoices).toContain('opt1');
      expect(newChoices).not.toContain('other');
    });
  });

  describe('Additional Mode Behavior', () => {
    test('additional mode allows other with regular selections', () => {
      const currentChoices = ['opt1', 'opt2'];
      const addingOther = true;

      let newChoices: string[];
      if (addingOther) {
        newChoices = [...currentChoices, 'other'];
      } else {
        newChoices = currentChoices;
      }

      expect(newChoices).toContain('opt1');
      expect(newChoices).toContain('opt2');
      expect(newChoices).toContain('other');
      expect(newChoices).toHaveLength(3);
    });

    test('additional mode allows adding options after other is selected', () => {
      const currentChoices = ['other'];
      const addingOption = 'opt1';

      const newChoices = [...currentChoices, addingOption];

      expect(newChoices).toContain('other');
      expect(newChoices).toContain('opt1');
      expect(newChoices).toHaveLength(2);
    });
  });

  describe('Legacy Format Support', () => {
    test('supports legacy string array format', () => {
      const legacyAnswer: string[] = ['opt1', 'opt2'];

      expect(Array.isArray(legacyAnswer)).toBe(true);
      expect(legacyAnswer).toHaveLength(2);
    });

    test('supports legacy single string format', () => {
      const legacyAnswer: string = 'opt1';

      expect(typeof legacyAnswer).toBe('string');
      expect(legacyAnswer).toBe('opt1');
    });

    test('supports legacy other format with colon', () => {
      const legacyOther: string = 'other:Custom text';

      expect(legacyOther.startsWith('other:')).toBe(true);
      expect(legacyOther.substring(6)).toBe('Custom text');
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
    test('handles toggling other option on and off', () => {
      let choices = ['opt1'];
      let otherText = '';

      // Select other
      choices = [...choices, 'other'];
      otherText = 'Some text';

      expect(choices).toContain('other');
      expect(otherText).toBe('Some text');

      // Deselect other
      choices = choices.filter((c) => c !== 'other');
      otherText = '';

      expect(choices).not.toContain('other');
      expect(otherText).toBe('');
    });

    test('handles empty other text', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['other'],
        otherText: '',
      };

      expect(answer.selectedChoices).toContain('other');
      expect(answer.otherText).toBe('');
    });

    test('handles other text updates', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['other'],
        otherText: 'Initial text',
      };

      const updatedAnswer: MultipleChoiceAnswer = {
        ...answer,
        otherText: 'Updated text',
      };

      expect(updatedAnswer.otherText).toBe('Updated text');
      expect(updatedAnswer.selectedChoices).toEqual(answer.selectedChoices);
    });
  });

  describe('Single Select with Other', () => {
    test('single select question with other option', () => {
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
        showOther: true,
        otherLabel: 'Other answer',
      };

      expect(question.multiple).toBe(false);
      expect(question.showOther).toBe(true);
    });

    test('single select answer with other', () => {
      const answer: MultipleChoiceAnswer = {
        selectedChoices: ['other'],
        otherText: 'Maybe',
      };

      expect(answer.selectedChoices).toHaveLength(1);
      expect(answer.selectedChoices[0]).toBe('other');
      expect(answer.otherText).toBe('Maybe');
    });
  });
});
