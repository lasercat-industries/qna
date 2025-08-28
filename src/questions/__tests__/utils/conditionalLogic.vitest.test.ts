import { describe, it, expect, beforeEach } from 'vitest';
import { ConditionalLogicEngine } from '../../utils/conditionalLogic';
import type { AnyQuestion, QuestionResponse } from '../../types';
import { 
  createMockShortAnswerQuestion,
  createMockNumericQuestion,
  createMockMultipleChoiceQuestion,
  createMockTrueFalseQuestion,
  createMockResponse
} from '../test-utils';

describe('ConditionalLogicEngine', () => {
  let questions: AnyQuestion[];
  let responses: Record<string, QuestionResponse>;
  let engine: ConditionalLogicEngine;

  beforeEach(() => {
    questions = [
      createMockShortAnswerQuestion({ id: 'q1', text: 'Name' }),
      createMockNumericQuestion({ id: 'q2', text: 'Age' }),
      createMockMultipleChoiceQuestion({ id: 'q3', text: 'Skills', multiple: true }),
      createMockTrueFalseQuestion({ id: 'q4', text: 'Remote?' })
    ];
    responses = {};
    engine = new ConditionalLogicEngine(questions, responses);
  });

  describe('Condition Operators', () => {
    it('evaluates equals condition correctly', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q1',
          operator: 'equals',
          value: 'John',
          action: 'show'
        }]
      });
      questions.push(question);
      
      // Without response, should be hidden
      engine = new ConditionalLogicEngine(questions, responses);
      let state = engine.getQuestionState('q5');
      expect(state.visible).toBe(false);
      
      // With matching response, should be visible
      responses['q1'] = createMockResponse('q1', 'John');
      engine = new ConditionalLogicEngine(questions, responses);
      state = engine.getQuestionState('q5');
      expect(state.visible).toBe(true);
      
      // With non-matching response, should be hidden
      responses['q1'] = createMockResponse('q1', 'Jane');
      engine = new ConditionalLogicEngine(questions, responses);
      state = engine.getQuestionState('q5');
      expect(state.visible).toBe(false);
    });

    it('evaluates not-equals condition correctly', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q1',
          operator: 'not-equals',
          value: 'John',
          action: 'show'
        }]
      });
      questions.push(question);
      responses['q1'] = createMockResponse('q1', 'Jane');
      
      engine = new ConditionalLogicEngine(questions, responses);
      const state = engine.getQuestionState('q5');
      expect(state.visible).toBe(true);
    });

    it('evaluates contains condition for strings', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q1',
          operator: 'contains',
          value: 'oh',
          action: 'show'
        }]
      });
      questions.push(question);
      responses['q1'] = createMockResponse('q1', 'John Doe');
      
      engine = new ConditionalLogicEngine(questions, responses);
      const state = engine.getQuestionState('q5');
      expect(state.visible).toBe(true);
    });

    it('evaluates contains condition for arrays', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q3',
          operator: 'contains',
          value: 'js',
          action: 'show'
        }]
      });
      questions.push(question);
      responses['q3'] = createMockResponse('q3', ['js', 'ts', 'python']);
      
      engine = new ConditionalLogicEngine(questions, responses);
      const state = engine.getQuestionState('q5');
      expect(state.visible).toBe(true);
    });

    it('evaluates greater-than condition', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q2',
          operator: 'greater-than',
          value: 18,
          action: 'show'
        }]
      });
      questions.push(question);
      responses['q2'] = createMockResponse('q2', 25);
      
      engine = new ConditionalLogicEngine(questions, responses);
      const state = engine.getQuestionState('q5');
      expect(state.visible).toBe(true);
      
      responses['q2'] = createMockResponse('q2', 15);
      engine = new ConditionalLogicEngine(questions, responses);
      const state2 = engine.getQuestionState('q5');
      expect(state2.visible).toBe(false);
    });

    it('evaluates less-than condition', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q2',
          operator: 'less-than',
          value: 65,
          action: 'show'
        }]
      });
      questions.push(question);
      responses['q2'] = createMockResponse('q2', 30);
      
      engine = new ConditionalLogicEngine(questions, responses);
      const state = engine.getQuestionState('q5');
      expect(state.visible).toBe(true);
    });

    it('evaluates in condition', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q1',
          operator: 'in',
          value: ['John', 'Jane', 'Bob'],
          action: 'show'
        }]
      });
      questions.push(question);
      responses['q1'] = createMockResponse('q1', 'Jane');
      
      engine = new ConditionalLogicEngine(questions, responses);
      const state = engine.getQuestionState('q5');
      expect(state.visible).toBe(true);
    });

    it('evaluates is-empty condition', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q1',
          operator: 'is-empty',
          action: 'show'
        }]
      });
      questions.push(question);
      
      // Empty string
      responses['q1'] = createMockResponse('q1', '');
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').visible).toBe(true);
      
      // Whitespace only
      responses['q1'] = createMockResponse('q1', '   ');
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').visible).toBe(true);
      
      // Empty array
      responses['q3'] = createMockResponse('q3', []);
      engine = new ConditionalLogicEngine(questions, responses);
      const firstCondition = question.conditions![0];
      const question2 = { ...question, id: 'q6', conditions: [{ 
        questionId: 'q3',
        operator: firstCondition?.operator || 'equals',
        action: firstCondition?.action || 'show'
      }] };
      questions.push(question2);
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q6').visible).toBe(true);
    });

    it('evaluates is-not-empty condition', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q1',
          operator: 'is-not-empty',
          action: 'show'
        }]
      });
      questions.push(question);
      responses['q1'] = createMockResponse('q1', 'John');
      
      engine = new ConditionalLogicEngine(questions, responses);
      const state = engine.getQuestionState('q5');
      expect(state.visible).toBe(true);
    });
  });

  describe('Condition Actions', () => {
    it('handles show action', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q4',
          operator: 'equals',
          value: true,
          action: 'show'
        }]
      });
      questions.push(question);
      
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').visible).toBe(false);
      
      responses['q4'] = createMockResponse('q4', true);
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').visible).toBe(true);
    });

    it('handles hide action', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q4',
          operator: 'equals',
          value: false,
          action: 'hide'
        }]
      });
      questions.push(question);
      
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').visible).toBe(true);
      
      responses['q4'] = createMockResponse('q4', false);
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').visible).toBe(false);
    });

    it('handles require action', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        required: false,
        conditions: [{
          questionId: 'q4',
          operator: 'equals',
          value: true,
          action: 'require'
        }]
      });
      questions.push(question);
      
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').required).toBe(false);
      
      responses['q4'] = createMockResponse('q4', true);
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').required).toBe(true);
    });

    it('handles disable action', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q4',
          operator: 'equals',
          value: false,
          action: 'disable'
        }]
      });
      questions.push(question);
      
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').disabled).toBe(false);
      
      responses['q4'] = createMockResponse('q4', false);
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').disabled).toBe(true);
    });

    it('handles enable action', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q4',
          operator: 'equals',
          value: true,
          action: 'enable'
        }]
      });
      questions.push(question);
      
      // Should be disabled when condition is not met
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').disabled).toBe(true);
      
      // Should be enabled when condition is met
      responses['q4'] = createMockResponse('q4', true);
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').disabled).toBe(false);
    });
  });

  describe('Multiple Conditions', () => {
    it('handles multiple conditions on same question', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [
          {
            questionId: 'q2',
            operator: 'greater-than',
            value: 18,
            action: 'show'
          },
          {
            questionId: 'q4',
            operator: 'equals',
            value: true,
            action: 'require'
          }
        ]
      });
      questions.push(question);
      
      // Question hidden, not required
      engine = new ConditionalLogicEngine(questions, responses);
      let state = engine.getQuestionState('q5');
      expect(state.visible).toBe(false);
      expect(state.required).toBe(false);
      
      // Question visible, not required
      responses['q2'] = createMockResponse('q2', 25);
      engine = new ConditionalLogicEngine(questions, responses);
      state = engine.getQuestionState('q5');
      expect(state.visible).toBe(true);
      expect(state.required).toBe(false);
      
      // Question visible and required
      responses['q4'] = createMockResponse('q4', true);
      engine = new ConditionalLogicEngine(questions, responses);
      state = engine.getQuestionState('q5');
      expect(state.visible).toBe(true);
      expect(state.required).toBe(true);
    });
  });

  describe('Dependency Management', () => {
    it('identifies dependent questions', () => {
      const q5 = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q1',
          operator: 'equals',
          value: 'John',
          action: 'show'
        }]
      });
      
      const q6 = createMockShortAnswerQuestion({
        id: 'q6',
        conditions: [{
          questionId: 'q5',
          operator: 'is-not-empty',
          action: 'show'
        }]
      });
      
      questions.push(q5, q6);
      engine = new ConditionalLogicEngine(questions, responses);
      
      const dependents = engine.getDependentQuestions('q1');
      expect(dependents.has('q5')).toBe(true);
      expect(dependents.has('q6')).toBe(true); // Transitive dependency
    });

    it('clears cache when response updates', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q2',
          operator: 'greater-than',
          value: 18,
          action: 'show'
        }]
      });
      questions.push(question);
      responses['q2'] = createMockResponse('q2', 15);
      
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').visible).toBe(false);
      
      // Update response
      engine.updateResponse('q2', createMockResponse('q2', 25));
      expect(engine.getQuestionState('q5').visible).toBe(true);
    });

    it('handles nested dependencies correctly', () => {
      // q5 depends on q1, q6 depends on q5, q7 depends on q6
      const q5 = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q1',
          operator: 'equals',
          value: 'trigger',
          action: 'show'
        }]
      });
      
      const q6 = createMockShortAnswerQuestion({
        id: 'q6',
        conditions: [{
          questionId: 'q5',
          operator: 'is-not-empty',
          action: 'show'
        }]
      });
      
      const q7 = createMockShortAnswerQuestion({
        id: 'q7',
        conditions: [{
          questionId: 'q6',
          operator: 'is-not-empty',
          action: 'show'
        }]
      });
      
      questions.push(q5, q6, q7);
      
      // Initially all hidden
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').visible).toBe(false);
      expect(engine.getQuestionState('q6').visible).toBe(false);
      expect(engine.getQuestionState('q7').visible).toBe(false);
      
      // Trigger first condition
      responses['q1'] = createMockResponse('q1', 'trigger');
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q5').visible).toBe(true);
      expect(engine.getQuestionState('q6').visible).toBe(false);
      expect(engine.getQuestionState('q7').visible).toBe(false);
      
      // Trigger second condition
      responses['q5'] = createMockResponse('q5', 'value');
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q6').visible).toBe(true);
      expect(engine.getQuestionState('q7').visible).toBe(false);
      
      // Trigger third condition
      responses['q6'] = createMockResponse('q6', 'value');
      engine = new ConditionalLogicEngine(questions, responses);
      expect(engine.getQuestionState('q7').visible).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    it('gets all visible questions', () => {
      const q5 = createMockShortAnswerQuestion({
        id: 'q5',
        conditions: [{
          questionId: 'q2',
          operator: 'greater-than',
          value: 18,
          action: 'show'
        }]
      });
      
      const q6 = createMockShortAnswerQuestion({
        id: 'q6',
        conditions: [{
          questionId: 'q4',
          operator: 'equals',
          value: true,
          action: 'hide'
        }]
      });
      
      questions.push(q5, q6);
      responses['q2'] = createMockResponse('q2', 25);
      responses['q4'] = createMockResponse('q4', false);
      
      engine = new ConditionalLogicEngine(questions, responses);
      const visible = engine.getVisibleQuestions();
      
      expect(visible.has('q1')).toBe(true); // No conditions
      expect(visible.has('q2')).toBe(true); // No conditions
      expect(visible.has('q3')).toBe(true); // No conditions
      expect(visible.has('q4')).toBe(true); // No conditions
      expect(visible.has('q5')).toBe(true); // Show condition met
      expect(visible.has('q6')).toBe(true); // Hide condition not met
    });

    it('gets evaluation path for debugging', () => {
      const question = createMockShortAnswerQuestion({
        id: 'q5',
        text: 'Follow-up',
        conditions: [
          {
            questionId: 'q1',
            operator: 'equals',
            value: 'John',
            action: 'show'
          },
          {
            questionId: 'q2',
            operator: 'greater-than',
            value: 18,
            action: 'require'
          }
        ]
      });
      if (questions[0]) questions[0].text = 'Name';
      if (questions[1]) questions[1].text = 'Age';
      questions.push(question);
      responses['q1'] = createMockResponse('q1', 'Jane');
      responses['q2'] = createMockResponse('q2', 25);
      
      engine = new ConditionalLogicEngine(questions, responses);
      const path = engine.getEvaluationPath('q5');
      
      expect(path).toHaveLength(2);
      expect(path[0]).toContain('Name equals John → show (NOT MET)');
      expect(path[1]).toContain('Age greater-than 18 → require (MET)');
    });
  });
});