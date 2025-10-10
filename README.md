# QNA - Question and Answer Framework

A flexible, type-safe React-based framework for building dynamic questionnaires and forms with advanced features like conditional logic, validation, and priority management.

## Features

- **Multiple Question Types**: Support for various question types including short-answer, long-form, multiple-choice, true/false, slider, stack-ranking, and numeric inputs
- **Conditional Logic**: Show/hide questions based on answers to other questions
- **Validation**: Built-in validation with support for custom validators
- **Priority System**: Assign priority levels to questions with customizable display styles
- **Veto System**: Allow users to flag problematic questions
- **TypeScript Support**: Fully typed with comprehensive TypeScript definitions
- **Responsive Design**: Built with Tailwind CSS for responsive, accessible UIs

## Installation

```bash
bun install
```

## Usage

### Basic Example

```tsx
import { QuestionRenderer } from './questions/core/QuestionRenderer';
import type { MultipleChoiceQuestion } from './questions/types';

const question: MultipleChoiceQuestion = {
  id: 'skills',
  type: 'multiple-choice',
  text: 'What are your programming skills?',
  required: true,
  priority: 'high',
  tags: ['technical'],
  options: [
    { id: 'js', label: 'JavaScript' },
    { id: 'ts', label: 'TypeScript' },
    { id: 'py', label: 'Python' },
  ],
  multiple: true,
  allowAdditionalText: false,
};

function MyForm() {
  const [value, setValue] = useState<string[]>([]);

  return <QuestionRenderer question={question} value={value} onChange={setValue} />;
}
```

## Question Types

### Multiple Choice Questions

Multiple choice questions support both single and multi-select modes, with an optional always-visible text input for additional information.

#### Basic Multiple Choice

```tsx
const question: MultipleChoiceQuestion = {
  id: 'q1',
  type: 'multiple-choice',
  text: 'Select your favorite color',
  required: true,
  priority: 'medium',
  tags: [],
  options: [
    { id: 'red', label: 'Red' },
    { id: 'blue', label: 'Blue' },
    { id: 'green', label: 'Green' },
  ],
  multiple: false,
  allowAdditionalText: false,
};
```

#### Multiple Choice with Additional Text Input

The additional text feature allows users to provide free-form text alongside their selections. The text input is always visible at the bottom of the question when enabled. You can configure whether the text input and option selections work together or are mutually exclusive.

##### Additional Mode (Default)

When `additionalTextMode` is set to `'additional'` (or omitted, as it's the default), users can select options AND provide additional text - both work together.

```tsx
const question: MultipleChoiceQuestion = {
  id: 'q2',
  type: 'multiple-choice',
  text: 'What programming languages do you know?',
  required: true,
  priority: 'high',
  tags: [],
  options: [
    { id: 'js', label: 'JavaScript' },
    { id: 'py', label: 'Python' },
    { id: 'java', label: 'Java' },
  ],
  multiple: true,
  allowAdditionalText: true,
  additionalTextMode: 'additional', // Users can select options AND type text
  additionalTextLabel: 'Any other languages?',
  additionalTextPlaceholder: 'e.g., Rust, Go, C++...',
};
```

##### Exclusive Mode

When `additionalTextMode` is set to `'exclusive'`, the text input and option selections are mutually exclusive:

- Typing text in the input will clear all selected options and disable them
- Selecting an option will clear the text input and disable it

```tsx
const question: MultipleChoiceQuestion = {
  id: 'q3',
  type: 'multiple-choice',
  text: 'What is your PRIMARY development tool?',
  required: true,
  priority: 'high',
  tags: [],
  options: [
    { id: 'vscode', label: 'VS Code' },
    { id: 'intellij', label: 'IntelliJ IDEA' },
    { id: 'vim', label: 'Vim/Neovim' },
  ],
  multiple: false,
  allowAdditionalText: true,
  additionalTextMode: 'exclusive', // Text and selections are mutually exclusive
  additionalTextLabel: 'Or enter a different tool',
  additionalTextPlaceholder: 'e.g., Sublime Text, Emacs...',
};
```

#### Answer Format

When using the additional text feature, answers are returned in a structured format:

```tsx
type MultipleChoiceAnswer = {
  selectedChoices: string[]; // Array of selected option IDs
  additionalText?: string; // The additional text provided
};

// Example answer with both selections and text (additional mode):
const answer: MultipleChoiceAnswer = {
  selectedChoices: ['js', 'py'],
  additionalText: 'Also learning Rust',
};

// Example answer with only text (exclusive mode):
const answer: MultipleChoiceAnswer = {
  selectedChoices: [],
  additionalText: 'Sublime Text',
};
```

**Note**: All multiple choice questions now use the `MultipleChoiceAnswer` format, regardless of whether `allowAdditionalText` is enabled. When `allowAdditionalText` is `false`, the `additionalText` field will be an empty string.

### Other Question Types

- **Short Answer**: Single-line text input with optional max length and pattern validation
- **Long Form**: Multi-line text input with markdown/rich text support
- **True/False**: Boolean questions with customizable labels and display styles
- **Slider**: Numeric range selection with optional dual handles
- **Stack Ranking**: Drag-and-drop ranking with optional tie support
- **Numeric**: Number input with min/max constraints and unit display

## Validation

All question types support built-in validation rules:

```tsx
const question: ShortAnswerQuestion = {
  id: 'email',
  type: 'short-answer',
  text: 'Email address',
  required: true,
  priority: 'high',
  tags: [],
  validation: [
    {
      type: 'required',
      message: 'Email is required',
    },
    {
      type: 'pattern',
      value: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
      message: 'Invalid email format',
    },
  ],
};
```

Supported validation types:

- `required`: Field must have a value
- `min`: Minimum value (number) or length (string/array)
- `max`: Maximum value (number) or length (string/array)
- `pattern`: Regex pattern matching
- `custom`: Custom validator function

## Conditional Logic

Show or hide questions based on answers to other questions:

```tsx
const questions = [
  {
    id: 'employed',
    type: 'true-false',
    text: 'Are you employed?',
    required: true,
    priority: 'high',
    tags: [],
  },
  {
    id: 'company',
    type: 'short-answer',
    text: 'Company name',
    required: false,
    priority: 'medium',
    tags: [],
    conditions: [
      {
        questionId: 'employed',
        operator: 'equals',
        value: true,
        action: 'show',
      },
    ],
  },
];
```

Supported operators:

- `equals`, `not-equals`
- `contains`, `not-contains`
- `greater-than`, `less-than`, `greater-than-or-equal`, `less-than-or-equal`
- `in`, `not-in`
- `is-empty`, `is-not-empty`

Supported actions:

- `show`, `hide`
- `require`, `disable`, `enable`

## Priority System

Questions can be assigned priority levels (`low`, `medium`, `high`, `critical`) with different display styles:

```tsx
const question: Question = {
  // ... other properties
  priority: 'high',
  priorityDisplayStyle: 'chip', // 'border-left' | 'border-all' | 'background' | 'chip' | 'dot' | 'none'
};
```

## Development

### Running Tests

```bash
bun test
```

### Type Checking

```bash
bun run typecheck
```

### Linting

```bash
bun run lint
```

## License

MIT
