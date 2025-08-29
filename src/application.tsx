import React, { useState, useEffect } from 'react';
import { QuestionGroup, ConditionalLogicEngine, QuestionRenderer } from './questions';
import type { AnyQuestion, QuestionResponse, FormState, Priority } from './questions';
import type { QuestionGroupType as QGroupType } from './questions/types';

const QuestionsDemo: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    responses: {},
    currentGroup: undefined,
    completedGroups: [],
    errors: {},
    isDirty: false,
    isSubmitting: false,
    isValid: false,
  });

  const [conditionalEngine, setConditionalEngine] = useState<ConditionalLogicEngine | null>(null);
  const [visibleQuestions, setVisibleQuestions] = useState<Set<string>>(new Set());

  // Sample questions for demonstration
  const sampleQuestions: AnyQuestion[] = [
    {
      id: 'name',
      type: 'short-answer',
      text: 'What is your name?',
      description: 'Please enter your full name',
      placeholder: 'John Doe',
      required: true,
      priority: 'high' as Priority,
      tags: ['personal'],
      maxLength: 100,
      suggestions: ['Alice Smith', 'Bob Johnson', 'Carol Williams'],
    },
    {
      id: 'bio',
      type: 'long-form',
      text: 'Tell us about yourself',
      description: 'Share your background and interests',
      placeholder: 'I am a...',
      required: false,
      priority: 'medium',
      tags: ['personal'],
      maxLength: 500,
      rows: 5,
      enableMarkdown: true,
    },
    {
      id: 'experience',
      type: 'multiple-choice',
      text: 'What is your experience level?',
      required: true,
      priority: 'high' as Priority,
      tags: ['professional'],
      options: [
        { id: 'beginner', label: 'Beginner', description: '0-2 years' },
        { id: 'intermediate', label: 'Intermediate', description: '2-5 years' },
        { id: 'advanced', label: 'Advanced', description: '5-10 years' },
        { id: 'expert', label: 'Expert', description: '10+ years' },
      ],
      multiple: false,
      showOther: true,
      otherLabel: 'Other experience level',
    },
    {
      id: 'skills',
      type: 'multiple-choice',
      text: 'Select your skills',
      description: 'Choose all that apply',
      required: false,
      priority: 'medium',
      tags: ['professional'],
      options: [
        { id: 'javascript', label: 'JavaScript' },
        { id: 'typescript', label: 'TypeScript' },
        { id: 'react', label: 'React' },
        { id: 'nodejs', label: 'Node.js' },
        { id: 'python', label: 'Python' },
      ],
      multiple: true,
      showOther: false,
    },
    {
      id: 'remote',
      type: 'true-false',
      text: 'Are you interested in remote work?',
      required: true,
      priority: 'medium',
      tags: ['preferences'],
      trueLabel: 'Yes, I prefer remote',
      falseLabel: 'No, I prefer in-office',
      displayStyle: 'toggle',  // Use toggle switch style
    },
    {
      id: 'remote-experience',
      type: 'slider',
      text: 'How many years of remote work experience do you have?',
      required: false,
      priority: 'low',
      tags: ['preferences'],
      min: 0,
      max: 20,
      step: 0.5,
      dual: false,
      showValue: true,
      unit: ' years',
      marks: [
        { value: 0, label: 'None' },
        { value: 5, label: '5' },
        { value: 10, label: '10' },
        { value: 15, label: '15' },
        { value: 20, label: '20+' },
      ],
      conditions: [
        {
          questionId: 'remote',
          operator: 'equals',
          value: true,
          action: 'show',
        },
      ],
    },
    {
      id: 'salary-range',
      type: 'slider',
      text: 'What is your expected salary range?',
      required: true,
      priority: 'high' as Priority,
      tags: ['compensation'],
      min: 30000,
      max: 200000,
      step: 5000,
      dual: true,
      showValue: true,
      unit: '$',
      marks: [
        { value: 30000, label: '$30k' },
        { value: 100000, label: '$100k' },
        { value: 200000, label: '$200k' },
      ],
    },
    {
      id: 'priorities',
      type: 'stack-ranking',
      text: 'Rank your priorities',
      description: 'Drag to reorder from most to least important',
      required: true,
      priority: 'medium',
      tags: ['preferences'],
      items: [
        { id: 'salary', label: 'Competitive Salary', description: 'Above market compensation' },
        { id: 'balance', label: 'Work-Life Balance', description: 'Flexible hours and time off' },
        {
          id: 'growth',
          label: 'Career Growth',
          description: 'Learning and advancement opportunities',
        },
        { id: 'culture', label: 'Company Culture', description: 'Positive work environment' },
        {
          id: 'tech',
          label: 'Technology Stack',
          description: 'Modern tools and frameworks',
          fixed: false,
        },
      ],
      allowTies: false,
    },
    {
      id: 'team-size',
      type: 'numeric',
      text: 'What is your ideal team size?',
      required: false,
      priority: 'low',
      tags: ['preferences'],
      min: 1,
      max: 100,
      step: 1,
      precision: 0,
      unit: ' people',
      allowVeto: true,
      vetoLabel: 'This question is not applicable to my situation',
    },
    {
      id: 'availability',
      type: 'numeric',
      text: 'How many hours per week are you available?',
      required: true,
      priority: 'high' as Priority,
      tags: ['availability'],
      min: 0,
      max: 168,
      step: 0.5,
      precision: 1,
      unit: ' hours',
      showAsPercentage: true,
    },
    {
      id: 'start-date',
      type: 'short-answer',
      text: 'When can you start?',
      placeholder: 'MM/DD/YYYY or "Immediately"',
      required: true,
      priority: 'critical',
      tags: ['availability'],
      pattern: '^(\\d{2}/\\d{2}/\\d{4}|Immediately)$',
    },
  ];

  // Individual questions not in any group - demonstrating different priority styles
  const individualQuestions: AnyQuestion[] = [
    {
      id: 'consent',
      type: 'true-false',
      text: 'I consent to the processing of my data',
      description: 'Required for form submission',
      required: true,
      priority: 'critical',
      priorityDisplayStyle: 'chip',  // Display as chip badge
      tags: ['legal'],
      trueLabel: 'I agree',
      falseLabel: 'I do not agree',
      displayStyle: 'buttons',  // Use button style
    },
    {
      id: 'newsletter',
      type: 'true-false',
      text: 'Would you like to receive our newsletter?',
      description: 'Optional - Get updates about new opportunities',
      required: false,
      priority: 'low',
      priorityDisplayStyle: 'background',  // Display as background color
      tags: ['marketing'],
      trueLabel: 'Yes, subscribe me',
      falseLabel: 'No thanks',
      displayStyle: 'radio',  // Use radio button style
    },
    {
      id: 'referral',
      type: 'short-answer',
      text: 'How did you hear about us?',
      placeholder: 'e.g., Google, Friend, LinkedIn',
      required: false,
      priority: 'low',
      priorityDisplayStyle: 'border-all',  // Display as full border
      tags: ['marketing'],
      maxLength: 200,
      allowVeto: true,  // Allow users to veto this question
      vetoLabel: 'This question feels irrelevant',
    },
    {
      id: 'urgency',
      type: 'multiple-choice',
      text: 'How soon do you need a response?',
      required: true,
      priority: 'high' as Priority,
      priorityDisplayStyle: 'background',  // Default left border style
      tags: ['timing'],
      options: [
        { id: 'asap', label: 'ASAP', description: 'Within 24 hours' },
        { id: 'week', label: 'This week', description: 'Within 7 days' },
        { id: 'month', label: 'This month', description: 'Within 30 days' },
        { id: 'flexible', label: 'I\'m flexible', description: 'No rush' },
      ],
      multiple: false,
      showOther: false,
    },
    {
      id: 'additional-comments',
      type: 'long-form',
      text: 'Any additional comments or questions?',
      placeholder: 'Feel free to share any other thoughts...',
      required: false,
      priority: 'low',
      tags: ['feedback'],
      maxLength: 1000,
      rows: 4,
      enableMarkdown: false,
    },
  ];

  const questionGroups: QGroupType[] = [
    {
      id: 'personal',
      name: 'Personal Information',
      description: 'Basic information about you',
      questions: sampleQuestions.filter((q) => q.tags.includes('personal')),
      priority: 'high' as Priority,
      tags: [],
      collapsible: true,
      defaultExpanded: true,
    },
    {
      id: 'professional',
      name: 'Professional Background',
      description: 'Your experience and skills',
      questions: sampleQuestions.filter((q) => q.tags.includes('professional')),
      priority: 'high' as Priority,
      tags: [],
      collapsible: true,
      defaultExpanded: false,
    },
    {
      id: 'preferences',
      name: 'Work Preferences',
      description: 'What you are looking for',
      questions: sampleQuestions.filter((q) => q.tags.includes('preferences')),
      priority: 'medium',
      tags: [],
      collapsible: true,
      defaultExpanded: false,
    },
    {
      id: 'other',
      name: 'Additional Information',
      description: 'Compensation and availability',
      questions: sampleQuestions.filter(
        (q) => q.tags.includes('compensation') || q.tags.includes('availability'),
      ),
      priority: 'low',
      tags: ['optional'],
      collapsible: true,
      defaultExpanded: false,
    },
  ];

  useEffect(() => {
    // Initialize conditional logic engine with all questions (grouped and individual)
    const allQuestions = [...sampleQuestions, ...individualQuestions];
    const engine = new ConditionalLogicEngine(allQuestions, {});
    setConditionalEngine(engine);
    setVisibleQuestions(engine.getVisibleQuestions());
  }, []);

  const handleQuestionChange = (questionId: string, value: unknown) => {
    const response: QuestionResponse = {
      questionId,
      value,
      timestamp: new Date(),
      valid: true, // Simple validation for demo
      errors: [],
    };

    const newResponses = {
      ...formState.responses,
      [questionId]: response,
    };

    setFormState((prev) => ({
      ...prev,
      responses: newResponses,
      isDirty: true,
    }));

    // Update conditional logic
    if (conditionalEngine) {
      conditionalEngine.updateResponse(questionId, response);
      setVisibleQuestions(conditionalEngine.getVisibleQuestions());
    }
  };

  const handleGroupComplete = (groupId: string) => {
    setFormState((prev) => ({
      ...prev,
      completedGroups: [...prev.completedGroups.filter((id) => id !== groupId), groupId],
    }));
  };

  const handleSubmit = () => {
    // Check if all required questions are answered
    const allQuestions = [...sampleQuestions, ...individualQuestions];
    const requiredQuestions = allQuestions.filter(q => q.required && visibleQuestions.has(q.id));
    
    const unansweredRequired = requiredQuestions.filter(question => {
      const response = formState.responses[question.id];
      if (!response) return true;
      
      // Check if vetoed (counts as answered)
      if (response.vetoed) return false;
      
      const value = response.value;
      
      // Check if value is actually provided
      switch (question.type) {
        case 'short-answer':
        case 'long-form':
          return !value || (typeof value === 'string' && value.trim().length === 0);
        case 'multiple-choice':
          return Array.isArray(value) ? value.length === 0 : !value;
        case 'true-false':
          return value === undefined || value === null;
        case 'numeric':
          return value === undefined || value === null;
        case 'slider':
          return value === undefined || value === null;
        case 'stack-ranking':
          return !Array.isArray(value) || value.length === 0;
        default:
          return true;
      }
    });
    
    if (unansweredRequired.length > 0) {
      alert(`Please answer all required questions:\n${unansweredRequired.map(q => `- ${q.text}`).join('\n')}`);
      return;
    }
    
    setFormState((prev) => ({ ...prev, isSubmitting: true }));
    
    // Include default values for all untouched optional questions
    const completeResponses = { ...formState.responses };
    allQuestions.forEach(question => {
      if (!completeResponses[question.id] && visibleQuestions.has(question.id)) {
        let defaultValue: unknown;
        switch (question.type) {
          case 'short-answer':
          case 'long-form':
            defaultValue = '';
            break;
          case 'multiple-choice':
            defaultValue = question.multiple ? [] : '';
            break;
          case 'true-false':
            defaultValue = false;
            break;
          case 'slider':
            defaultValue = question.dual ? [question.min, question.max] : question.min;
            break;
          case 'stack-ranking':
            defaultValue = question.items.map(item => item.id);
            break;
          case 'numeric':
            defaultValue = 0;
            break;
          default:
            defaultValue = null;
        }
        
        completeResponses[question.id] = {
          questionId: question.id,
          value: defaultValue,
          timestamp: new Date(),
          valid: true,
          errors: [],
        };
      }
    });

    // Simulate submission
    setTimeout(() => {
      console.log('Form submitted with all values:', completeResponses);
      alert('Form submitted successfully! Check console for complete data including defaults.');
      setFormState((prev) => ({ ...prev, isSubmitting: false, isDirty: false }));
    }, 1000);
  };

  const handleReset = () => {
    setFormState({
      responses: {},
      currentGroup: undefined,
      completedGroups: [],
      errors: {},
      isDirty: false,
      isSubmitting: false,
      isValid: false,
    });

    if (conditionalEngine) {
      const allQuestions = [...sampleQuestions, ...individualQuestions];
      const engine = new ConditionalLogicEngine(allQuestions, {});
      setConditionalEngine(engine);
      setVisibleQuestions(engine.getVisibleQuestions());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Components Demo</h1>
          <p className="text-gray-600">
            Interactive demonstration of all question types with conditional logic
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">Demo Features:</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • All 7 question types (Short Answer, Long Form, Multiple Choice, True/False,
                Slider, Stack Ranking, Numeric)
              </li>
              <li>
                • Conditional questions (answer &quot;Yes&quot; to remote work to see follow-up)
              </li>
              <li>• Priority indicators (critical, high, medium, low)</li>
              <li>• Question groups with progress tracking</li>
              <li>• Validation and error states</li>
              <li>• Collapsible sections</li>
              <li>• Tag system for categorization</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {/* Individual Questions (not in groups) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Questions</h2>
            <p className="text-sm text-gray-600 mb-6">Please answer these initial questions before proceeding to the main form.</p>
            <div className="space-y-4">
              {individualQuestions
                .filter(q => visibleQuestions.has(q.id))
                .map((question) => (
                  <div key={question.id}>
                    <QuestionRenderer
                      question={question}
                      value={formState.responses[question.id]?.value}
                      onChange={(value) => handleQuestionChange(question.id, value)}
                      disabled={formState.isSubmitting}
                    />
                  </div>
              ))}
            </div>
          </div>

          {/* Question Groups */}
          {questionGroups.map((group) => (
            <QuestionGroup
              key={group.id}
              disabled={formState.isSubmitting}
              group={{
                ...group,
                questions: group.questions.filter((q: AnyQuestion) => visibleQuestions.has(q.id)),
              }}
              responses={formState.responses}
              onGroupComplete={handleGroupComplete}
              onQuestionChange={handleQuestionChange}
            />
          ))}
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={formState.isSubmitting}
            onClick={handleSubmit}
            title="Complete all required fields to submit"
          >
            {formState.isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
          <button
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={formState.isSubmitting}
            onClick={handleReset}
          >
            Reset Form
          </button>
        </div>

        {formState.isDirty && (
          <div className="mt-4 text-center text-sm text-gray-600">Form has unsaved changes</div>
        )}

        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Form State (Debug)</h2>
          <pre className="text-xs bg-white p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(formState.responses, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default QuestionsDemo;
