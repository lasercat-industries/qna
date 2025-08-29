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
- 🎨 **Priority Levels**: Critical, High, Medium, Low with configurable display styles
- 🏷️ **Tag System**: Categorize and filter questions
- 🚫 **Veto System**: Mark problematic questions with explanations
- ♿ **Accessibility**: Full ARIA support and keyboard navigation
- 📱 **Responsive**: Mobile-friendly design
- 🎯 **Visual Indicators**: Required/Optional chips for questions and groups

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
    priorityDisplayStyle: 'chip', // New: configurable priority display
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
  priorityDisplayStyle: 'border-left', // Options: border-left, border-all, background, chip, dot, none
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
  priorityDisplayStyle: 'background',
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
  priorityDisplayStyle: 'chip',
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
Binary choice questions with configurable display styles.

```tsx
const trueFalseQuestion = {
  id: 'remote',
  type: 'true-false',
  text: 'Are you open to remote work?',
  required: true,
  priority: 'medium',
  priorityDisplayStyle: 'dot',
  tags: ['preferences'],
  trueLabel: 'Yes, I prefer remote',
  falseLabel: 'No, I prefer in-office',
  displayStyle: 'buttons' // Options: buttons, toggle, radio
};
```

### 5. Slider
Single or dual-handle range sliders with manual input support.

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

// Dual range slider with manual input
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
Drag-and-drop ranking with keyboard navigation support.

```tsx
const stackRankingQuestion = {
  id: 'priorities',
  type: 'stack-ranking',
  text: 'Rank your priorities',
  description: 'Drag to reorder or use arrow keys',
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
  maxSelections: 3   // Optional: limit how many can be ranked
};
```

### 7. Numeric Answer
Number input with increment/decrement controls and percentage display.

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
  showAsPercentage: true,  // Can toggle between percentage and raw value
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
  vetoed?: boolean;  // If question was marked as problematic
  vetoReason?: string;  // Explanation for veto
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
  "value": ["balance", "salary", "growth", "culture"],
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

#### Vetoed Question
```json
{
  "questionId": "confusing-question",
  "value": "",
  "timestamp": "2024-01-15T10:30:00Z",
  "valid": true,
  "errors": [],
  "vetoed": true,
  "vetoReason": "This question is unclear and needs clarification"
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

## Advanced Features

### Priority Display Styles
Configure how priority is visually represented:

- `border-left`: Colored left border on input area (default)
- `border-all`: Colored border around entire question
- `background`: Colored background for input area
- `chip`: Priority level shown as a chip/badge
- `dot`: Colored dot icon next to question
- `none`: No priority indication

```tsx
const question = {
  // ...
  priority: 'high',
  priorityDisplayStyle: 'chip' // Shows as "HIGH" chip
};
```

### Veto System
Allow users to flag problematic questions:

```tsx
const question = {
  // ...
  allowVeto: true,
  vetoLabel: 'This question is problematic' // Custom label
};

// Handler
const handleVeto = (questionId: string, vetoed: boolean, reason?: string) => {
  console.log(`Question ${questionId} vetoed: ${vetoed}, reason: ${reason}`);
};
```

### Question Groups
Groups automatically determine if they're required based on their contents:
- A group is **required** if it contains any required questions
- A group is **optional** if all questions are optional

```tsx
const group = {
  id: 'personal',
  name: 'Personal Information',
  description: 'Basic information about you',
  questions: [
    { id: 'name', required: true, ... },  // This makes the group required
    { id: 'bio', required: false, ... }
  ],
  priority: 'high',
  tags: [],
  collapsible: true,
  defaultExpanded: true
};
// This group will display "Required" chip automatically
```

### Visual Indicators
- **Required Fields**: Red "Required" chip displayed with tags
- **Optional Fields**: No chip (implicit)
- **Priority Indicators**: Configurable via `priorityDisplayStyle`
- **Group Status**: Automatic "Required"/"Optional" chips based on contents

### Form Validation
- Prevents submission if required fields are incomplete
- Includes default values for untouched optional questions
- Vetoed questions are excluded from validation
- Real-time validation feedback

### Demo Pages
The library includes two demo pages:

1. **Full Demo** (`/`): Comprehensive showcase with all question types, groups, and conditional logic
2. **Simple Demo** (`/simple`): Minimal example with 4 basic questions

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
  PriorityDisplayStyle,
  QuestionGroupType,
  ShortAnswerQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  SliderQuestion,
  StackRankingQuestion,
  NumericQuestion,
  LongFormQuestion
} from '@your-org/qna';
```

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## License

MIT