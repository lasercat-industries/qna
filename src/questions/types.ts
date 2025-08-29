export type QuestionType =
  | 'short-answer'
  | 'long-form'
  | 'multiple-choice'
  | 'true-false'
  | 'slider'
  | 'stack-ranking'
  | 'numeric';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type PriorityDisplayStyle = 'border-left' | 'border-all' | 'background' | 'chip' | 'none';

export type ConditionOperator =
  | 'equals'
  | 'not-equals'
  | 'contains'
  | 'not-contains'
  | 'greater-than'
  | 'less-than'
  | 'greater-than-or-equal'
  | 'less-than-or-equal'
  | 'in'
  | 'not-in'
  | 'is-empty'
  | 'is-not-empty';

export type ConditionAction = 'show' | 'hide' | 'require' | 'disable' | 'enable';

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: string | number | RegExp;
  message: string;
  validator?: (value: unknown) => boolean;
}

export interface Condition {
  questionId: string;
  operator: ConditionOperator;
  value?: string | number | boolean | string[] | number[];
  action: ConditionAction;
}

export interface Question<T = unknown> {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  priority: Priority;
  priorityDisplayStyle?: PriorityDisplayStyle;
  tags: string[];
  validation?: ValidationRule[];
  conditions?: Condition[];
  defaultValue?: T;
  metadata?: Record<string, unknown>;
  allowVeto?: boolean;
  vetoLabel?: string;
}

export interface ShortAnswerQuestion extends Question<string> {
  type: 'short-answer';
  maxLength?: number;
  pattern?: string;
  suggestions?: string[];
}

export interface LongFormQuestion extends Question<string> {
  type: 'long-form';
  maxLength?: number;
  minLength?: number;
  rows?: number;
  enableMarkdown?: boolean;
  enableRichText?: boolean;
}

export interface MultipleChoiceOption {
  id: string;
  label: string;
  description?: string;
  image?: string;
}

export interface MultipleChoiceQuestion extends Question<string | string[]> {
  type: 'multiple-choice';
  options: MultipleChoiceOption[];
  multiple: boolean;
  showOther: boolean;
  otherLabel?: string;
  columns?: number;
}

export interface TrueFalseQuestion extends Question<boolean> {
  type: 'true-false';
  trueLabel?: string;
  falseLabel?: string;
  displayStyle?: 'buttons' | 'toggle' | 'radio';
}

export interface SliderQuestion extends Question<number | [number, number]> {
  type: 'slider';
  min: number;
  max: number;
  step: number;
  dual: boolean;
  marks?: { value: number; label: string }[];
  showValue: boolean;
  unit?: string;
}

export interface StackRankingItem {
  id: string;
  label: string;
  description?: string;
  fixed?: boolean;
}

export interface StackRankingQuestion extends Question<string[]> {
  type: 'stack-ranking';
  items: StackRankingItem[];
  allowTies: boolean;
  maxSelections?: number;
}

export interface NumericQuestion extends Question<number> {
  type: 'numeric';
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  unit?: string;
  showAsPercentage?: boolean;
}

export type AnyQuestion =
  | ShortAnswerQuestion
  | LongFormQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | SliderQuestion
  | StackRankingQuestion
  | NumericQuestion;

export interface QuestionGroupType {
  id: string;
  name: string;
  description?: string;
  questions: AnyQuestion[];
  priority: Priority;
  tags: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface QuestionResponse<T = unknown> {
  questionId: string;
  value: T;
  timestamp: Date;
  valid: boolean;
  errors?: string[];
  vetoed?: boolean;
  vetoReason?: string;
}

export interface FormState {
  responses: Record<string, QuestionResponse>;
  currentGroup?: string;
  completedGroups: string[];
  errors: Record<string, string[]>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface QuestionComponentProps<T = unknown> {
  question: Question<T>;
  value?: T;
  onChange: (value: T) => void;
  onValidate?: (value: T) => string[];
  onVeto?: (vetoed: boolean, reason?: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  className?: string;
  vetoed?: boolean;
}
