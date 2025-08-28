import React, { useState, useEffect } from 'react';
import type { QuestionGroupType, QuestionResponse, Priority } from '../types';
import QuestionRenderer from './QuestionRenderer';

interface QuestionGroupProps {
  group: QuestionGroupType;
  responses: Record<string, QuestionResponse>;
  onQuestionChange: (questionId: string, value: unknown) => void;
  onGroupComplete?: (groupId: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}

const getPriorityBadge = (priority: Priority) => {
  const colors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority]}`}>
      {priority}
    </span>
  );
};

export const QuestionGroup: React.FC<QuestionGroupProps> = ({
  group,
  responses,
  onQuestionChange,
  onGroupComplete,
  disabled = false,
  readOnly = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(group.defaultExpanded ?? true);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [visibleQuestions, setVisibleQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize all questions as visible
    const initialVisible = new Set(group.questions.map((q) => q.id));
    setVisibleQuestions(initialVisible);
  }, [group.questions]);

  useEffect(() => {
    // Track completed questions
    const completed = new Set<string>();
    group.questions.forEach((question) => {
      const response = responses[question.id];
      if (response && response.valid) {
        completed.add(question.id);
      }
    });
    setCompletedQuestions(completed);

    // Check if group is complete
    const requiredQuestions = group.questions.filter(
      (q) => q.required && visibleQuestions.has(q.id),
    );
    const allRequiredComplete = requiredQuestions.every((q) => completed.has(q.id));

    if (allRequiredComplete && requiredQuestions.length > 0 && onGroupComplete) {
      onGroupComplete(group.id);
    }
  }, [responses, group, visibleQuestions, onGroupComplete]);

  const handleQuestionChange = (questionId: string, value: unknown) => {
    onQuestionChange(questionId, value);
  };

  const toggleExpand = () => {
    if (group.collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const progress = Math.round((completedQuestions.size / group.questions.length) * 100);

  return (
    <div
      className={`
        question-group 
        border rounded-lg shadow-sm bg-white
        ${className}
      `}
      data-group-id={group.id}
    >
      <div
        className={`
          flex items-center justify-between p-4 border-b
          ${group.collapsible ? 'cursor-pointer hover:bg-gray-50' : ''}
        `}
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          {group.collapsible && (
            <button
              aria-label={isExpanded ? 'Collapse group' : 'Expand group'}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              type="button"
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  fillRule="evenodd"
                />
              </svg>
            </button>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
            {group.description && <p className="text-sm text-gray-600 mt-1">{group.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {group.tags.length > 0 && (
            <div className="flex gap-1">
              {group.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {getPriorityBadge(group.priority)}

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">
              {completedQuestions.size}/{group.questions.length}
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6">
          {group.questions.map((question, index) => {
            if (!visibleQuestions.has(question.id)) {
              return null;
            }

            const response = responses[question.id];
            const isCompleted = completedQuestions.has(question.id);

            return (
              <div
                key={question.id}
                className={`
                  relative
                  ${index < group.questions.length - 1 ? 'pb-6 border-b' : ''}
                `}
              >
                {isCompleted && <div className="absolute -left-8 top-3 text-green-500">✓</div>}

                <QuestionRenderer
                  disabled={disabled}
                  error={response?.errors?.[0]}
                  question={question}
                  readOnly={readOnly}
                  value={response?.value}
                  onChange={(value) => handleQuestionChange(question.id, value)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuestionGroup;
