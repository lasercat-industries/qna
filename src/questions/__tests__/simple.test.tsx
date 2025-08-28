import { expect, test, describe } from 'bun:test';
import { ShortAnswer } from '../types/ShortAnswer';
import type { ShortAnswerQuestion } from '../types';

describe('ShortAnswer Component Basic', () => {
  test('component exports correctly', () => {
    expect(ShortAnswer).toBeDefined();
    expect(typeof ShortAnswer).toBe('function');
  });

  test('question type structure', () => {
    const mockQuestion: ShortAnswerQuestion = {
      id: 'test-1',
      type: 'short-answer',
      text: 'Test question',
      required: false,
      priority: 'medium',
      tags: ['test']
    };

    expect(mockQuestion.type).toBe('short-answer');
    expect(mockQuestion.text).toBe('Test question');
  });
});

describe('ConditionalLogic', () => {
  test('conditional logic imports', async () => {
    const { ConditionalLogicEngine } = await import('../utils/conditionalLogic');
    expect(ConditionalLogicEngine).toBeDefined();
  });

  test('creates engine instance', async () => {
    const { ConditionalLogicEngine } = await import('../utils/conditionalLogic');
    const engine = new ConditionalLogicEngine([], {});
    expect(engine).toBeDefined();
    expect(engine.getVisibleQuestions()).toBeDefined();
  });
});