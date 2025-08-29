import React, { useState, useEffect } from 'react';
import { QuestionRenderer } from './questions';
import type { AnyQuestion, QuestionResponse } from './questions';

const SimpleDemo: React.FC = () => {
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [isValid, setIsValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [vetoedQuestions, setVetoedQuestions] = useState<Set<string>>(new Set());

  // Simple set of questions - no groups
  const questions: AnyQuestion[] = [
    {
      id: 'name',
      type: 'short-answer',
      text: 'What is your name?',
      placeholder: 'Enter your full name',
      required: true,
      priority: 'high',
      tags: [],
      maxLength: 100,
    },
    {
      id: 'age',
      type: 'numeric',
      text: 'What is your age?',
      required: true,
      priority: 'high',
      tags: [],
      min: 1,
      max: 120,
      step: 1,
      precision: 0,
      unit: ' years',
    },
    {
      id: 'feedback',
      type: 'long-form',
      text: 'Any feedback for us?',
      description: 'Optional - share your thoughts',
      placeholder: 'Your feedback...',
      required: false,
      priority: 'low',
      tags: [],
      maxLength: 500,
      rows: 4,
    },
    {
      id: 'subscribe',
      type: 'true-false',
      text: 'Would you like to receive updates?',
      required: false,
      priority: 'low',
      tags: [],
      trueLabel: 'Yes, subscribe me',
      falseLabel: 'No thanks',
      displayStyle: 'toggle',
    },
  ];

  // Get default values for all questions
  const getDefaultValue = (question: AnyQuestion): unknown => {
    switch (question.type) {
      case 'short-answer':
      case 'long-form':
        return '';
      case 'multiple-choice':
        return question.multiple ? [] : '';
      case 'true-false':
        return false;
      case 'slider':
        return question.dual ? [question.min, question.max] : question.min;
      case 'stack-ranking':
        return question.items.map(item => item.id);
      case 'numeric':
        return 0;
      default:
        return null;
    }
  };

  // Initialize responses with default values for all questions
  useEffect(() => {
    const initialResponses: Record<string, QuestionResponse> = {};
    questions.forEach(question => {
      if (!responses[question.id]) {
        initialResponses[question.id] = {
          questionId: question.id,
          value: getDefaultValue(question),
          timestamp: new Date(),
          valid: !question.required, // Optional questions start as valid
          errors: [],
        };
      }
    });
    
    if (Object.keys(initialResponses).length > 0) {
      setResponses(prev => ({ ...initialResponses, ...prev }));
    }
  }, []);

  // Validate form whenever responses change
  useEffect(() => {
    const requiredQuestions = questions.filter(q => q.required);
    const allRequiredAnswered = requiredQuestions.every(question => {
      const response = responses[question.id];
      if (!response) return false;
      if (vetoedQuestions.has(question.id)) return true; // Vetoed questions count as answered
      
      const value = response.value;
      
      // Check if value is actually provided (not just default)
      switch (question.type) {
        case 'short-answer':
        case 'long-form':
          return typeof value === 'string' && value.trim().length > 0;
        case 'multiple-choice':
          return Array.isArray(value) ? value.length > 0 : !!value;
        case 'true-false':
          return response.timestamp.getTime() > 0; // Has been interacted with
        case 'numeric':
          return typeof value === 'number';
        case 'slider':
          return value !== undefined && value !== null;
        case 'stack-ranking':
          return Array.isArray(value) && value.length > 0;
        default:
          return false;
      }
    });
    
    setIsValid(allRequiredAnswered);
  }, [responses, vetoedQuestions]);

  const handleQuestionChange = (questionId: string, value: unknown) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        value,
        timestamp: new Date(),
        valid: true,
        errors: [],
      },
    }));
  };

  const handleVeto = (questionId: string, vetoed: boolean, reason?: string) => {
    setVetoedQuestions(prev => {
      const newSet = new Set(prev);
      if (vetoed) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });
    
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        questionId,
        value: prev[questionId]?.value ?? getDefaultValue(questions.find(q => q.id === questionId)!),
        timestamp: prev[questionId]?.timestamp ?? new Date(),
        valid: prev[questionId]?.valid ?? true,
        errors: prev[questionId]?.errors ?? [],
        vetoed,
        vetoReason: reason,
      },
    }));
  };

  const handleSubmit = () => {
    if (!isValid) {
      alert('Please answer all required questions before submitting.');
      return;
    }

    // Include all responses, even for untouched optional questions
    const completeResponses: Record<string, QuestionResponse> = {};
    questions.forEach(question => {
      const response = responses[question.id];
      if (response) {
        completeResponses[question.id] = response;
      } else {
        // Add default response for untouched questions
        completeResponses[question.id] = {
          questionId: question.id,
          value: getDefaultValue(question),
          timestamp: new Date(),
          valid: true,
          errors: [],
        };
      }
    });

    console.log('Form Submitted:', completeResponses);
    setSubmitted(true);
  };

  const handleReset = () => {
    setResponses({});
    setVetoedQuestions(new Set());
    setSubmitted(false);
    
    // Reinitialize with defaults
    const initialResponses: Record<string, QuestionResponse> = {};
    questions.forEach(question => {
      initialResponses[question.id] = {
        questionId: question.id,
        value: getDefaultValue(question),
        timestamp: new Date(),
        valid: !question.required,
        errors: [],
      };
    });
    setResponses(initialResponses);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your responses have been submitted successfully.</p>
            
            <div className="bg-gray-50 rounded p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2">Submitted Data:</h3>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(responses, null, 2)}
              </pre>
            </div>
            
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Simple Form Demo</h1>
          <p className="text-gray-600">
            A minimal example with just a few questions. Required fields are marked with *.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {questions.map(question => (
              <QuestionRenderer
                key={question.id}
                question={question}
                value={responses[question.id]?.value}
                onChange={(value) => handleQuestionChange(question.id, value)}
                onVeto={(vetoed, reason) => handleVeto(question.id, vetoed, reason)}
                vetoed={vetoedQuestions.has(question.id)}
              />
            ))}
          </div>

          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`px-6 py-3 font-medium rounded-lg transition-colors ${
                isValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Form
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Reset
            </button>
          </div>

          {!isValid && (
            <p className="mt-4 text-center text-sm text-red-600">
              Please complete all required fields before submitting.
            </p>
          )}
        </div>

        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Form State (Debug)</h3>
          <div className="text-xs">
            <p>Valid: {isValid ? '✅' : '❌'}</p>
            <p>Responses: {Object.keys(responses).length}</p>
            <p>Vetoed: {vetoedQuestions.size}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDemo;