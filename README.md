# QnA - Advanced Question & Answer Components for React

A comprehensive library of React components for building dynamic forms with advanced question types, conditional logic, validation, and grouping capabilities.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Available Components](#available-components)
- [Data Formats](#data-formats)
- [Usage Examples](#usage-examples)
- [Advanced Features](#advanced-features)
- [Development](#development)

## Features

- 🎯 **7 Question Types**: Short Answer, Long Form, Multiple Choice, True/False, Slider (single & dual range), Stack Ranking, Numeric
- 🔧 **Conditional Logic**: Show/hide questions based on other answers
- ✅ **Built-in Validation**: Required fields, patterns, min/max constraints
- 📊 **Question Groups**: Organize questions with collapsible sections
- 🎨 **Priority Levels**: Critical, High, Medium, Low indicators
- 🏷️ **Tag System**: Categorize and filter questions
- ♿ **Accessibility**: Full ARIA support and keyboard navigation
- 📱 **Responsive**: Mobile-friendly design

## Installation

```bash
npm install @your-org/qna
# or
yarn add @your-org/qna
# or
bun add @your-org/qna
```

## Quick Start

```tsx
import React, { useState } from 'react';
import { QuestionRenderer } from '@your-org/qna';

function App() {
  const [value, setValue] = useState('');
  
  const question = {
    id: 'name',
    type: 'short-answer',
    text: 'What is your name?',
    required: true,
    priority: 'high',
    tags: ['personal'],
    placeholder: 'Enter your full name',
    maxLength: 100
  };

  return (
    <QuestionRenderer
      question={question}
      value={value}
      onChange={setValue}
    />
  );
}
```

## Available Components

### 1. Short Answer
Text input for brief responses.

```tsx
const shortAnswerQuestion = {
  id: 'email',
  type: 'short-answer',
  text: 'What is your email?',
  description: 'We\'ll use this to contact you',
  placeholder: 'email@example.com',
  required: true,
  priority: 'high',
  tags: ['contact'],
  maxLength: 255,
  pattern: '^[\\w-\\.]+@[\\w-]+\\.[a-z]{2,4}$',
  suggestions: ['@gmail.com', '@yahoo.com', '@outlook.com']
};
```

### 2. Long Form
Textarea for detailed responses with optional markdown support.

```tsx
const longFormQuestion = {
  id: 'bio',
  type: 'long-form',
  text: 'Tell us about yourself',
  description: 'Share your background and experience',
  required: false,
  priority: 'medium',
  tags: ['profile'],
  maxLength: 1000,
  rows: 5,
  enableMarkdown: true
};
```

### 3. Multiple Choice
Single or multi-select options with optional "Other" field.

```tsx
const multipleChoiceQuestion = {
  id: 'skills',
  type: 'multiple-choice',
  text: 'Select your skills',
  required: true,
  priority: 'high',
  tags: ['technical'],
  options: [
    { id: 'js', label: 'JavaScript', description: 'ES6+' },
    { id: 'ts', label: 'TypeScript' },
    { id: 'react', label: 'React', disabled: false },
    { id: 'vue', label: 'Vue.js' }
  ],
  multiple: true,  // Allow multiple selections
  showOther: true,  // Show "Other" option
  otherLabel: 'Other skill',
  minSelections: 1,
  maxSelections: 3
};
```

### 4. True/False
Binary choice questions with custom labels.

```tsx
const trueFalseQuestion = {
  id: 'remote',
  type: 'true-false',
  text: 'Are you open to remote work?',
  required: true,
  priority: 'medium',
  tags: ['preferences'],
  trueLabel: 'Yes, I prefer remote',
  falseLabel: 'No, I prefer in-office'
};
```

### 5. Slider
Single or dual-handle range sliders with manual input.

```tsx
// Single slider
const singleSliderQuestion = {
  id: 'experience',
  type: 'slider',
  text: 'Years of experience',
  required: true,
  priority: 'high',
  tags: ['professional'],
  min: 0,
  max: 20,
  step: 0.5,
  dual: false,
  showValue: true,
  unit: ' years',
  marks: [
    { value: 0, label: 'Entry' },
    { value: 5, label: 'Mid' },
    { value: 10, label: 'Senior' },
    { value: 20, label: 'Expert' }
  ]
};

// Dual range slider
const dualSliderQuestion = {
  id: 'salary-range',
  type: 'slider',
  text: 'Expected salary range',
  required: true,
  priority: 'high',
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
    { value: 200000, label: '$200k' }
  ]
};
```

### 6. Stack Ranking
Drag-and-drop ranking with optional fixed items and ties.

```tsx
const stackRankingQuestion = {
  id: 'priorities',
  type: 'stack-ranking',
  text: 'Rank your priorities',
  description: 'Drag to reorder from most to least important',
  required: true,
  priority: 'medium',
  tags: ['preferences'],
  items: [
    { 
      id: 'salary', 
      label: 'Competitive Salary',
      description: 'Above market compensation',
      fixed: false  // Can be reordered
    },
    { 
      id: 'balance', 
      label: 'Work-Life Balance',
      description: 'Flexible hours',
      fixed: true,  // Cannot be moved
      fixedPosition: 0  // Always first
    },
    { id: 'growth', label: 'Career Growth' },
    { id: 'culture', label: 'Company Culture' }
  ],
  allowTies: false,  // Cannot have same rank
  showNumbers: true
};
```

### 7. Numeric Answer
Number input with increment/decrement controls.

```tsx
const numericQuestion = {
  id: 'team-size',
  type: 'numeric',
  text: 'Ideal team size?',
  required: false,
  priority: 'low',
  tags: ['preferences'],
  min: 1,
  max: 100,
  step: 1,
  precision: 0,  // Decimal places
  unit: ' people',
  showAsPercentage: false,
  placeholder: 'Enter a number'
};
```

## Data Formats

### Question Response Format
All questions output data in a consistent format:

```typescript
interface QuestionResponse {
  questionId: string;
  value: any;  // Type depends on question
  timestamp: Date;
  valid: boolean;
  errors: string[];
}
```

### Output by Question Type

#### Short Answer & Long Form
```json
{
  "questionId": "name",
  "value": "John Doe",
  "timestamp": "2024-01-15T10:30:00Z",
  "valid": true,
  "errors": []
}
```

#### Multiple Choice (Single)
```json
{
  "questionId": "experience",
  "value": "intermediate",
  "timestamp": "2024-01-15T10:30:00Z",
  "valid": true,
  "errors": []
}
```

#### Multiple Choice (Multiple)
```json
{
  "questionId": "skills",
  "value": ["javascript", "typescript", "react"],
  "timestamp": "2024-01-15T10:30:00Z",
  "valid": true,
  "errors": []
}
```

#### Multiple Choice (with Other)
```json
{
  "questionId": "skills",
  "value": {
    "selected": ["javascript", "other"],
    "otherValue": "Python"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "valid": true,
  "errors": []
}
```

#### True/False
```json
{
  "questionId": "remote",
  "value": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "valid": true,
  "errors": []
}
```

#### Slider (Single)
```json
{
  "questionId": "experience",
  "value": 5.5,
  "timestamp": "2024-01-15T10:30:00Z",
  "valid": true,
  "errors": []
}
```

#### Slider (Dual Range)
```json
{
  "questionId": "salary-range",
  "value": [75000, 95000],
  "timestamp": "2024-01-15T10:30:00Z",
  "valid": true,
  "errors": []
}
```

#### Stack Ranking
```json
{
  "questionId": "priorities",
  "value": [
    { "id": "balance", "rank": 1 },
    { "id": "salary", "rank": 2 },
    { "id": "growth", "rank": 3 },
    { "id": "culture", "rank": 4 }
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "valid": true,
  "errors": []
}
```

#### Numeric
```json
{
  "questionId": "team-size",
  "value": 12,
  "timestamp": "2024-01-15T10:30:00Z",
  "valid": true,
  "errors": []
}
```

### Form State Format
When using multiple questions together:

```typescript
interface FormState {
  responses: {
    [questionId: string]: QuestionResponse;
  };
  currentGroup?: string;
  completedGroups: string[];
  errors: {
    [questionId: string]: string[];
  };
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
}
```

Example complete form submission:
```json
{
  "responses": {
    "name": {
      "questionId": "name",
      "value": "John Doe",
      "timestamp": "2024-01-15T10:30:00Z",
      "valid": true,
      "errors": []
    },
    "email": {
      "questionId": "email",
      "value": "john@example.com",
      "timestamp": "2024-01-15T10:30:01Z",
      "valid": true,
      "errors": []
    },
    "skills": {
      "questionId": "skills",
      "value": ["javascript", "react", "typescript"],
      "timestamp": "2024-01-15T10:30:05Z",
      "valid": true,
      "errors": []
    },
    "remote": {
      "questionId": "remote",
      "value": true,
      "timestamp": "2024-01-15T10:30:10Z",
      "valid": true,
      "errors": []
    },
    "salary-range": {
      "questionId": "salary-range",
      "value": [80000, 120000],
      "timestamp": "2024-01-15T10:30:15Z",
      "valid": true,
      "errors": []
    }
  },
  "completedGroups": ["personal", "professional"],
  "errors": {},
  "isDirty": false,
  "isSubmitting": false,
  "isValid": true
}
```

## Usage Examples

### Complete Form with Groups

```tsx
import React, { useState } from 'react';
import { 
  QuestionGroup, 
  QuestionRenderer,
  ConditionalLogicEngine 
} from '@your-org/qna';

function JobApplicationForm() {
  const [formState, setFormState] = useState({
    responses: {},
    errors: {},
    isDirty: false
  });

  // Define individual questions (not in groups)
  const standaloneQuestions = [
    {
      id: 'consent',
      type: 'true-false',
      text: 'I agree to the terms and conditions',
      required: true,
      priority: 'critical',
      tags: ['legal']
    },
    {
      id: 'newsletter',
      type: 'true-false', 
      text: 'Subscribe to newsletter?',
      required: false,
      priority: 'low',
      tags: ['marketing']
    }
  ];

  // Define questions for groups
  const personalQuestions = [
    {
      id: 'name',
      type: 'short-answer',
      text: 'Full Name',
      required: true,
      priority: 'high',
      tags: ['personal']
    },
    {
      id: 'email',
      type: 'short-answer',
      text: 'Email Address',
      required: true,
      priority: 'high',
      tags: ['personal'],
      pattern: '^[\\w-\\.]+@[\\w-]+\\.[a-z]{2,4}$'
    }
  ];

  // Define groups
  const questionGroups = [
    {
      id: 'personal',
      name: 'Personal Information',
      description: 'Basic contact details',
      questions: personalQuestions,
      priority: 'high',
      tags: ['required'],
      collapsible: true,
      defaultExpanded: true
    }
  ];

  const handleQuestionChange = (questionId, value) => {
    setFormState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: {
          questionId,
          value,
          timestamp: new Date(),
          valid: true,
          errors: []
        }
      },
      isDirty: true
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1>Job Application</h1>
      
      {/* Standalone Questions */}
      <div className="mb-8">
        <h2>Quick Questions</h2>
        {standaloneQuestions.map(question => (
          <div key={question.id} className="mb-4">
            <QuestionRenderer
              question={question}
              value={formState.responses[question.id]?.value}
              onChange={(value) => handleQuestionChange(question.id, value)}
            />
          </div>
        ))}
      </div>

      {/* Question Groups */}
      {questionGroups.map(group => (
        <QuestionGroup
          key={group.id}
          group={group}
          responses={formState.responses}
          onQuestionChange={handleQuestionChange}
        />
      ))}
    </div>
  );
}
```

### With Conditional Logic

```tsx
const questions = [
  {
    id: 'has-experience',
    type: 'true-false',
    text: 'Do you have prior experience?',
    required: true
  },
  {
    id: 'years-experience',
    type: 'numeric',
    text: 'How many years?',
    min: 0,
    max: 50,
    // This question only shows if has-experience is true
    conditions: [
      {
        questionId: 'has-experience',
        operator: 'equals',
        value: true,
        action: 'show'
      }
    ]
  }
];
```

## Advanced Features

### Priority Levels
- `critical`: Red indicator, highest importance
- `high`: Orange indicator, important
- `medium`: Yellow indicator, moderate importance  
- `low`: Gray indicator, optional/nice-to-have

### Conditional Logic Operators
- `equals` / `not-equals`
- `contains` / `not-contains`
- `greater-than` / `less-than`
- `greater-than-or-equal` / `less-than-or-equal`
- `in` / `not-in`
- `is-empty` / `is-not-empty`

### Conditional Actions
- `show` / `hide`: Toggle visibility
- `require` / `disable` / `enable`: Change interaction state

## Development

```bash
# Install dependencies
bun install

# Build the library
bun run build

# Run linting
bun run lint

# Run tests
bun test

# Type checking
bun run typecheck

# Run demo application
bun run dev
```

## TypeScript Support

All components are fully typed. Import types as needed:

```typescript
import type {
  AnyQuestion,
  QuestionResponse,
  FormState,
  Priority,
  QuestionGroupType,
  ShortAnswerQuestion,
  MultipleChoiceQuestion,
  // ... etc
} from '@your-org/qna';
```

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## License

MIT
