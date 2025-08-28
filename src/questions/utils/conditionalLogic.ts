import type { Condition, AnyQuestion, QuestionResponse } from '../types';

export class ConditionalLogicEngine {
  private questions: Map<string, AnyQuestion>;
  private responses: Map<string, QuestionResponse>;
  private visibilityCache: Map<string, boolean>;
  private requiredCache: Map<string, boolean>;
  private disabledCache: Map<string, boolean>;

  constructor(questions: AnyQuestion[], responses: Record<string, QuestionResponse>) {
    this.questions = new Map(questions.map((q) => [q.id, q]));
    this.responses = new Map(Object.entries(responses));
    this.visibilityCache = new Map();
    this.requiredCache = new Map();
    this.disabledCache = new Map();
  }

  /**
   * Evaluate a condition against a response value
   */
  private evaluateCondition(condition: Condition, value: unknown): boolean {
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;

      case 'not-equals':
        return value !== condition.value;

      case 'contains':
        if (typeof value === 'string' && typeof condition.value === 'string') {
          return value.includes(condition.value);
        }
        if (Array.isArray(value)) {
          return value.includes(condition.value as string);
        }
        return false;

      case 'not-contains':
        if (typeof value === 'string' && typeof condition.value === 'string') {
          return !value.includes(condition.value);
        }
        if (Array.isArray(value)) {
          return !value.includes(condition.value as string);
        }
        return true;

      case 'greater-than':
        return (
          typeof value === 'number' &&
          typeof condition.value === 'number' &&
          value > condition.value
        );

      case 'less-than':
        return (
          typeof value === 'number' &&
          typeof condition.value === 'number' &&
          value < condition.value
        );

      case 'greater-than-or-equal':
        return (
          typeof value === 'number' &&
          typeof condition.value === 'number' &&
          value >= condition.value
        );

      case 'less-than-or-equal':
        return (
          typeof value === 'number' &&
          typeof condition.value === 'number' &&
          value <= condition.value
        );

      case 'in':
        if (!Array.isArray(condition.value)) return false;
        return (condition.value as Array<string | number | boolean>).includes(
          value as string | number | boolean,
        );

      case 'not-in':
        if (!Array.isArray(condition.value)) return false;
        return !(condition.value as Array<string | number | boolean>).includes(
          value as string | number | boolean,
        );

      case 'is-empty':
        if (value === null || value === undefined || value === '') return true;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'string') return value.trim() === '';
        return false;

      case 'is-not-empty':
        if (value === null || value === undefined || value === '') return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';
        return true;

      default:
        console.warn(`Unknown condition operator: ${condition.operator}`);
        return false;
    }
  }

  /**
   * Get the effective state of a question based on conditions
   */
  getQuestionState(questionId: string): {
    visible: boolean;
    required: boolean;
    disabled: boolean;
  } {
    const question = this.questions.get(questionId);
    if (!question) {
      return { visible: true, required: false, disabled: false };
    }

    // Check cached values first
    if (this.visibilityCache.has(questionId)) {
      return {
        visible: this.visibilityCache.get(questionId)!,
        required: this.requiredCache.get(questionId)!,
        disabled: this.disabledCache.get(questionId)!,
      };
    }

    let visible = true;
    let required = question.required;
    let disabled = false;

    if (question.conditions && question.conditions.length > 0) {
      for (const condition of question.conditions) {
        const dependentResponse = this.responses.get(condition.questionId);
        const dependentValue = dependentResponse?.value;
        const conditionMet = this.evaluateCondition(condition, dependentValue);

        switch (condition.action) {
          case 'show':
            if (!conditionMet) visible = false;
            break;

          case 'hide':
            if (conditionMet) visible = false;
            break;

          case 'require':
            if (conditionMet) required = true;
            break;

          case 'disable':
            if (conditionMet) disabled = true;
            break;

          case 'enable':
            if (!conditionMet) disabled = true;
            break;
        }
      }
    }

    // Cache the results
    this.visibilityCache.set(questionId, visible);
    this.requiredCache.set(questionId, required);
    this.disabledCache.set(questionId, disabled);

    return { visible, required, disabled };
  }

  /**
   * Get all questions that should be visible
   */
  getVisibleQuestions(): Set<string> {
    const visible = new Set<string>();

    for (const question of this.questions.values()) {
      const state = this.getQuestionState(question.id);
      if (state.visible) {
        visible.add(question.id);
      }
    }

    return visible;
  }

  /**
   * Get all questions that depend on a given question
   */
  getDependentQuestions(questionId: string): Set<string> {
    const dependents = new Set<string>();

    for (const question of this.questions.values()) {
      if (question.conditions) {
        for (const condition of question.conditions) {
          if (condition.questionId === questionId) {
            dependents.add(question.id);
            // Recursively get dependents of dependents
            const nestedDependents = this.getDependentQuestions(question.id);
            nestedDependents.forEach((id) => dependents.add(id));
          }
        }
      }
    }

    return dependents;
  }

  /**
   * Clear cache for a question and its dependents when a value changes
   */
  clearCache(questionId: string) {
    // Clear cache for the question itself
    this.visibilityCache.delete(questionId);
    this.requiredCache.delete(questionId);
    this.disabledCache.delete(questionId);

    // Clear cache for all dependent questions
    const dependents = this.getDependentQuestions(questionId);
    dependents.forEach((id) => {
      this.visibilityCache.delete(id);
      this.requiredCache.delete(id);
      this.disabledCache.delete(id);
    });
  }

  /**
   * Update a response and recalculate states
   */
  updateResponse(questionId: string, response: QuestionResponse) {
    this.responses.set(questionId, response);
    this.clearCache(questionId);
  }

  /**
   * Get the evaluation path for debugging
   */
  getEvaluationPath(questionId: string): string[] {
    const path: string[] = [];
    const question = this.questions.get(questionId);

    if (!question || !question.conditions) return path;

    for (const condition of question.conditions) {
      const dependentResponse = this.responses.get(condition.questionId);
      const dependentQuestion = this.questions.get(condition.questionId);
      const conditionMet = this.evaluateCondition(condition, dependentResponse?.value);

      path.push(
        `${dependentQuestion?.text || condition.questionId} ${condition.operator} ${condition.value} → ${condition.action} (${conditionMet ? 'MET' : 'NOT MET'})`,
      );
    }

    return path;
  }
}

export default ConditionalLogicEngine;
