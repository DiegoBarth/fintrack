# Fintrack 💰

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-730%2B%20passing-success)](#-automated-testing)
[![Coverage](https://img.shields.io/badge/Coverage-~97%25-success)](#-automated-testing)

Modern **production-level** personal financial control web system, built with React 19, TypeScript 5.9, and industry best practices.

## ✨ Project Highlights

- 🧪 **730+ Automated Tests** (86 test files) with ~97% coverage.
- ♿ **WCAG 2.1 Accessibility** complete (ARIA, focus trap, keyboard navigation).
- ⚡ **Optimized Performance** (React.memo, useMemo, useCallback).
- 🔒 **Robust Security** (CSRF protection, rate limiting, timeout).
- 📚 **Full Documentation** (JSDoc in complex functions, technical README).
- 🎯 **Type-safe** with TypeScript and Zod.

## 🚀 Features

### Core Features
- ✅ **Google Authentication** - Secure login with Google OAuth 2.0.
- 📊 **Intuitive Dashboard** - Visualize your balance with charts and metrics.
- 💳 **Commitment Management** - Organize fixed, variable, and installment obligations.
- 💸 **Expense Control** - Record and categorize spending.
- 📈 **Income Tracking** - Monitor inflows and receipt dates.
- 🎨 **Responsive Interface** - Mobile-first design functional across all devices.

### Quality & Performance
- ⚡ **Optimized Performance** - React.memo, useMemo, and useCallback in critical components.
- 🛡️ **Robust Validation** - Centralized Zod schemas with type inference.
- 🔄 **Global Error Handling** - ErrorBoundary + centralized useApiError.
- ♿ **Total Accessibility** - WCAG 2.1 Level AA (keyboard navigation, ARIA, focus management).
- 🧪 **Automated Testing** - 730+ tests in 86 files (utils, hooks, components, API, cache services).
- 🔒 **Security** - CSRF tokens, rate limiting, input validation.

## 📚 Standards Documentation

### Project Architecture

src/
├── api/                       # HTTP calls to the backend
│   └── endpoints/             # Organized by feature (expense.ts, income.ts, etc.)
│
├── components/                # Reusable React components
│   ├── layout/                # Layout components
│   ├── ui/                    # Base components (Modal, Input, etc.)
│   └── [feature]/             # Feature-specific components
│
├── contexts/                  # React Context (Global State)
│   └── toast/                 # Notification system
│
├── hooks/                     # Custom hooks
│   ├── use[Feature].ts        # Hooks for each feature
│   ├── useValidation.ts       # Validation with Zod
│   └── useApiError.ts         # Centralized error handling
│
├── schemas/                   # Zod schemas for validation
│
├── types/                     # TypeScript types
│
├── utils/                     # Utility functions
│
└── pages/                     # Application pages

### Coding Patterns

#### 1. **Functional Components with Hooks**

```tsx
// ✅ Pattern: Functional component with hooks
import { useState, useCallback } from 'react';

interface ModalProps {
   open: boolean;
   onClose: () => void;
}

export function MyModal({ open, onClose }: ModalProps) {
   const [state, setState] = useState('');
   
   const handleSave = useCallback(() => {
      // logic here
      onClose();
   }, [onClose]);

   return (
      <div>
          {/* JSX here */}
      </div>
   );
}
```

#### 2. Custom Hooks for Business Logic

```tsx
// ✅ Pattern: Separate logic into hooks
export function useExpense(month: string, year: string) {
   const queryClient = useQueryClient();
   
   const { data: expenses } = useQuery({
      queryKey: ['expenses', month, year],
      queryFn: () => listExpenses(month, year),
      staleTime: Infinity,
      retry: 1
   });

   const createMutation = useMutation({
      mutationFn: (newExpense) => createExpense(newExpense),
      onSuccess: () => {
          // Update cache
      },
      onError: (error) => {
          handleError(error); // Centralized!
      }
   });

   return { expenses, create: createMutation.mutateAsync };
}
```

#### 3. Validation with Zod

```tsx
// ✅ Pattern: Schema centralized in /schemas
import { z } from 'zod';

export const ExpenseCreateSchema = z.object({
   description: z.string().min(1, 'Description required'),
   amount: z.number().positive('Amount must be positive'),
   category: z.string().min(1, 'Category required')
});

// Use in components
const { validate } = useValidation();
const data = validate(ExpenseCreateSchema, payload);
if (!data) return; // Error already displayed
```

#### 4. Centralized Error Handling

```tsx
// ✅ Pattern: useApiError for global handling
import { useApiError } from '@/hooks/useApiError';

export function useExpense(month: string, year: string) {
   const { handleError } = useApiError();

   const createMutation = useMutation({
      mutationFn: createExpense,
      onError: (error) => handleError(error) // Centralized!
   });
}
```

#### 5. ErrorBoundary for React Errors

```tsx
// ✅ Pattern: Wrap App with ErrorBoundary
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
   return (
      <ErrorBoundary>
          <AppProvider>
             <AppRouter />
          </AppProvider>
      </ErrorBoundary>
   );
}
```

### Naming Convention

| Type | Pattern | Example |
|------|--------|---------|
| **Components** | PascalCase | `NewExpenseModal.tsx` |
| **Hooks** | camelCase `use*` | `useExpense.ts` |
| **Types** | PascalCase | `Expense.ts` |
| **Constants** | UPPER_SNAKE_CASE | `API_TIMEOUT_MS` |
| **Variables** | camelCase | `description`, `totalValue` |

### React Query (TanStack Query)

**Query Keys Convention:**
```tsx
// Format: ['entity', 'optional_filter', 'period']
['incomes', year]
['expenses', year]
```

### Context API

**PeriodContext** - Global Period State (Month/Year)
```tsx
const { month, year, summary, expenses, incomes } = usePeriod();
```

## 🔧 Getting Started

### Pré-requisitos
- Node.js 18+ 
- npm or yarn

### Install
```bash
# Install dependencies
npm install

# Install dev dependencies (testing)
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui happy-dom
```

### Development
```bash
npm run dev          # Starts development server
```

### Build
```bash
npm run build        # Production build
npm run preview      # Preview build
```

### Testing
```bash
npm test                  # Watch mode (recommended)
npm run test:ui           # Visual interface
npm run test:coverage     # Full coverage (~97%)
```

### Code Quality
```bash
npm run lint              # Check for issues
npm run lint:fix          # Auto-fix fixable issues (ESLint)
```

## 🧪 Automated Testing

### Current status

- **730+ tests** in **86 test files** (Vitest + Testing Library).
- Coverage around **~97%** (run `npm run test:coverage` for the latest report).

Coverage includes: `api/`, `hooks/`, `services/` (cache and query layer), `utils/`, `contexts/`, UI and feature components, pages, and React Query integration.

## ♿ Accessibility (WCAG 2.1)

### Full Implementation

✅ **WCAG 2.1 Level AA Compliance**

#### Focus Management
- Focus trap in modals (useFocusTrap hook).
- Tab/Shift+Tab cycles within modals.
- Focus restoration on close.

#### ARIA Attributes
- `role="dialog"`, `aria-modal="true"` in modals
- `role="listbox"`, `role="option"` in selects
- `aria-expanded`, `aria-selected`, `aria-activedescendant`
- Semantic labels with `htmlFor` on all inputs

#### Keyboard Navigation
- **CustomSelect**: Arrow Up/Down, Enter, Escape, Home, End
- **Modals**: Tab, Shift+Tab, Escape
- All inputs accessible via Tab

## 🔒 Security

### Implemented

✅ **CSRF Protection** - Automatic token in all POST requests
✅ **Rate Limiting** - 1s throttle between POSTs (frontend)  
✅ **Timeout Protection** - AbortController with 30s timeout
✅ **Input Validation** - Zod schemas prevent SQL injection
✅ **XSS Protection** - React auto-escape + data validation
✅ **Type Safety** - TypeScript prevents type-related bugs

### Authentication (Google OAuth)

Login uses Google OAuth 2.0. The client decodes the JWT **only to read the email** (e.g. for display and to send to the backend). **Authorization is not decided on the client:** the backend validates the token and checks whether the email is allowed via `verifyEmailAuthorization`. Never trust the client for access control.

### Configuration (client.ts)

```typescript
// CSRF token from meta tag (meta[name="csrf-token"] or csrf_token / csrfToken)
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')

// Frontend rate limiting
const POST_RATE_LIMIT_MS = 1000

// Timeout protection (AbortController, 30s)
const controller = new AbortController()
setTimeout(() => controller.abort(), API_TIMEOUT_MS)
```

## 📦 Main Dependencies

### Core
- **React 19.2** - Modern UI Framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Ultra-fast build tool

### State Management
- **TanStack Query 5.90** - Server state management
- **React Hook Form 7.71** - Performant forms

### Validation & Security
- **Zod** - Schema validation with type inference (via react-hook-form / schemas)

### UI & Styling
- **Tailwind CSS 3.4** - Utility-first CSS
- **Lucide React** - Modern icons

### Testing
- **Vitest** - Fast test runner
- **Testing Library** - User-centric testing
- **Happy-DOM** - Lightweight DOM environment

## 🏗️ Component Structure

### Modal Pattern
```tsx
// All modals follow this pattern:
interface Props {
   open: boolean;
   onClose: () => void;
}

export function NewExpenseModal({ open, onClose }: Props) {
   const { validate } = useValidation();
   const { create } = useExpense();

   const handleSave = async () => {
      const data = validate(ExpenseCreateSchema, payload);
      if (!data) return; // Error already displayed via toast
      await create(data);
      onClose();
   };

   return <BaseModal>{/* ... */}</BaseModal>;
}
```

### Hook Pattern
```tsx
// All feature hooks follow this pattern:
export function useExpense(month: string, year: string) {
   const queryClient = useQueryClient();
   const { handleError } = useApiError();

   const { data } = useQuery({ 
      queryKey: ['expenses', year],
      queryFn: () => listExpenses('all', year),
      onError: handleError // Centralized!
   });

   const expenses =
      month === 'all'
         ? data
         : data.filter(expense => {
            const { month: refMonth } =
               getMonthAndYearFromReference(expense.paymentDate)

            return String(refMonth) === String(month)
         })
   
   const mutation = useMutation({ 
      mutationFn: createExpense,
      onError: handleError,
      onSuccess: () => queryClient.invalidateQueries(['expenses'])
   });

   return {
      expenses: data,
      create: mutation.mutateAsync,
      isSaving: mutation.isPending
   };
}
```

## ⚡ Performance

### Implemented Optimizations

#### React.memo on list components
```tsx
export const ExpenseList = memo(function ExpenseList({ expenses, onSelect }) {
   const renderItem = useCallback((expense) => (
      <ExpenseItem key={expense.id} expense={expense} onSelect={onSelect} />
   ), [onSelect]);
   
   return expenses.map(renderItem);
});
```

#### useMemo for heavy calculations
```tsx
const totals = useMemo(() => ({
   income: summary.incomes.total,
   expenses: summary.expenses.total + summary.commitments.total,
   balance: summary.incomes.total - (summary.expenses.total + summary.commitments.total)
}), [summary]);
```

#### React Query with cache strategies
```tsx
useQuery({
   queryKey: ['expenses', month, year],
   queryFn: listExpenses,
   staleTime: Infinity,  // Infinite cache
   retry: 1              // Minimum retry
})
```

### Results
- 60-80% reduction in unnecessary re-renders.
- Intelligent caching with React Query.
- Optimized data loading.

## 📝 Contributing

### Development Workflow

1. **Always validate with Zod schemas**
   ```tsx
   const { validate } = useValidation();
   const data = validate(MySchema, payload);
   if (!data) return;
   ```

2. **Use custom hooks for logic**
   ```tsx
   const { items, create, update } = useMyFeature(month, year);
   ```

3. **Centralize errors with useApiError**
   ```tsx
   const { handleError } = useApiError();
   onError: (error) => handleError(error)
   ```

4. **Add TypeScript types**
   ```tsx
   interface MyInterface { ... }
   type MyType = z.infer<typeof MySchema>
   ```

5. **Write tests**
   ```tsx
   describe('MyComponent', () => {
      it('should do X', () => {
         // Arrange, Act, Assert
      });
   });
   ```

### Example: Adding a New Feature

1. **Create schema** (`src/schemas/new-feature.schema.ts`)
   ```tsx
   export const NewFeatureSchema = z.object({
      field: z.string().min(1, 'Field required')
   });
   ```

2. **Create type** (`src/types/NewFeature.ts`)
   ```tsx
   export type NewFeature = z.infer<typeof NewFeatureSchema>
   ```

3. **Create hook** (`src/hooks/useNewFeature.ts`)
   ```tsx
   export function useNewFeature(month: string, year: string) {
      // useQuery + useMutation
   }
   ```

4. **Create component** (`src/components/new-feature/`)
   ```tsx
   export function NewFeatureModal() {
      const { create } = useNewFeature();
      const { validate } = useValidation();
      // ...
   }
   ```

5. **Create tests** (`*.test.ts(x)`)
   ```tsx
   describe('NewFeature', () => {
      it('should validate correctly', () => {
         // ...
      });
   });
   ```

## 📚 Resources & Documentation

### Internal Documentation
- [README.md](./README.md) - This file
- JSDoc comments in complex functions

### Technologies Used
- [React 19 Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest Guide](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Support

Questions about patterns? Check:
1. This README.
2. JSDoc comments in the code.
3. Examples in existing components.
4. Tests as usage documentation.

---

## 📄 License

This project is private code.