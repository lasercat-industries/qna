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
npm install @lasercat/qna
# or
yarn add @lasercat/qna
# or
bun add @lasercat/qna
```

### Styling Requirements

This library uses Tailwind CSS for styling. You must have Tailwind CSS v4 installed in your project:

```bash
npm install -D tailwindcss@4
```

Then configure Tailwind to process the library's components:

```js
// tailwind.config.js
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@lasercat/qna/**/*.{js,jsx}', // Add this line
  ],
};
```

## Usage

### Basic Example

```tsx
import { QuestionRenderer } from '@lasercat/qna';
import type { MultipleChoiceQuestion, QuestionResponse } from '@lasercat/qna';

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
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});

  const handleChange = (response: QuestionResponse) => {
    setResponses((prev) => ({
      ...prev,
      [response.questionId]: response,
    }));
  };

  return (
    <QuestionRenderer
      question={question}
      response={responses[question.id]}
      onChange={handleChange}
    />
  );
}
```

### Response Format

All question changes emit a complete `QuestionResponse` object:

```tsx
interface QuestionResponse<T = unknown> {
  questionId: string;
  value: T; // The answer value
  timestamp: Date;
  valid: boolean; // Whether it passes validation
  errors?: string[]; // Validation error messages
  vetoed?: boolean; // If user vetoed the question (see Veto System)
  vetoReason?: string; // Optional reason for veto
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

## Veto System

The veto system allows users to mark questions as problematic or not applicable. Vetoed questions:

- Display with reduced opacity and are disabled
- Show a message indicating they're vetoed
- Are still included in form submission with `vetoed: true` flag
- Count as "complete" for progress tracking
- Preserve their answer value (can be un-vetoed without data loss)

### Enabling Veto

Enable veto on individual questions:

```tsx
const question: ShortAnswerQuestion = {
  id: 'income',
  type: 'short-answer',
  text: 'What is your annual income?',
  required: true,
  priority: 'medium',
  tags: [],
  allowVeto: true, // Enable veto checkbox
  vetoLabel: 'I prefer not to answer this', // Optional custom label
};
```

### Handling Vetoed Responses

Vetoed questions are included in responses with a flag:

```tsx
// Filter out vetoed questions before submission (if desired)
const finalResponses = Object.entries(responses)
  .filter(([_, response]) => !response.vetoed)
  .reduce((acc, [id, response]) => ({ ...acc, [id]: response }), {});

// Or keep them to track which questions were problematic
const allResponses = responses; // Includes vetoed with { vetoed: true, vetoReason: "..." }
```

### Hiding Answer Controls When Vetoed

By default, vetoed questions show their answer controls in a disabled/grayed-out state. You can configure the form to completely hide answer controls when a question is vetoed:

```tsx
import { QuestionRenderer } from '@lasercat/qna';

function MyForm() {
  return (
    <QuestionRenderer
      question={question}
      response={responses[question.id]}
      onChange={handleChange}
      hideAnswerWhenVetoed={true} // Hide answer controls when vetoed
    />
  );
}
```

This also works with `QuestionGroup`:

```tsx
import { QuestionGroup } from '@lasercat/qna';

function MyForm() {
  return (
    <QuestionGroup
      group={group}
      responses={responses}
      onChange={handleChange}
      hideAnswerWhenVetoed={true} // Hide all answer controls when vetoed
    />
  );
}
```

When `hideAnswerWhenVetoed` is enabled:

- Checking the veto checkbox hides the answer input/controls
- Only the question text, veto checkbox, and veto message remain visible
- Unchecking the veto checkbox reveals the answer controls again
- Previous answer values are preserved when toggling veto on/off

## Question Groups

Organize related questions into groups with progress tracking:

```tsx
import { QuestionGroup } from '@lasercat/qna';
import type { QuestionGroupType, QuestionResponse } from '@lasercat/qna';

const group: QuestionGroupType = {
  id: 'personal-info',
  name: 'Personal Information',
  description: 'Tell us about yourself',
  priority: 'high',
  tags: ['onboarding'],
  collapsible: true,
  defaultExpanded: true,
  questions: [
    // ... your questions
  ],
};

function MyForm() {
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});

  const handleChange = (response: QuestionResponse) => {
    setResponses((prev) => ({
      ...prev,
      [response.questionId]: response,
    }));
  };

  return (
    <QuestionGroup
      group={group}
      responses={responses}
      onChange={handleChange}
      onGroupComplete={(groupId) => console.log(`${groupId} completed!`)}
    />
  );
}
```

## Custom Question Text Rendering

The `renderQuestionText` prop allows you to customize how question text is displayed. This is useful for adding inline badges, icons, or other custom content within the question text.

### Basic Example

```tsx
import { QuestionRenderer } from '@lasercat/qna';
import type { AnyQuestion, QuestionResponse } from '@lasercat/qna';

function MyForm() {
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});

  const handleChange = (response: QuestionResponse) => {
    setResponses((prev) => ({
      ...prev,
      [response.questionId]: response,
    }));
  };

  return (
    <QuestionRenderer
      question={question}
      response={responses[question.id]}
      onChange={handleChange}
      renderQuestionText={(q) => (
        <span>
          {q.text}{' '}
          <span className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">NEW</span>
        </span>
      )}
    />
  );
}
```

### Advanced Example with Conditional Badges

You can use the question object to conditionally render different content:

```tsx
function MyForm() {
  const renderQuestionText = (question: AnyQuestion) => {
    return (
      <span className="flex items-center gap-2">
        <span>{question.text}</span>
        {question.priority === 'critical' && (
          <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-700 font-semibold">
            URGENT
          </span>
        )}
        {question.tags.includes('beta') && (
          <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700">BETA</span>
        )}
      </span>
    );
  };

  return (
    <QuestionRenderer
      question={question}
      response={responses[question.id]}
      onChange={handleChange}
      renderQuestionText={renderQuestionText}
    />
  );
}
```

### With Question Groups

The `renderQuestionText` prop also works with `QuestionGroup`:

```tsx
import { QuestionGroup } from '@lasercat/qna';

function MyForm() {
  return (
    <QuestionGroup
      group={group}
      responses={responses}
      onChange={handleChange}
      renderQuestionText={(q) => (
        <span>
          {q.text}
          {q.required && <span className="ml-1 text-red-500">*</span>}
        </span>
      )}
    />
  );
}
```

**Note**: The `renderQuestionText` function receives the full question object, giving you access to all question properties including `id`, `type`, `priority`, `tags`, and type-specific properties.

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
