# Fintrack 💰

Modern personal financial control web system built with **React 19**, **TypeScript**, and **Vite**.

## 🚀 Features

- ✅ **Google Authentication** - Secure login using Google OAuth 2.0.
- 📊 **Intuitive Dashboard** - Balance visualization with dynamic charts.
- 💳 **Commitment Management** - Organize and track your financial obligations.
- 💸 **Expense Control** - Record and categorize your spending.
- 📈 **Income Tracking** - Monitor your incoming cash flow.
- 🎨 **Responsive Interface** - Optimized for desktop, tablet, and mobile devices.
- ⚡ **High Performance** - Fast loading times and smooth transitions.
- 🛡️ **Robust Validation** - Strict data verification powered by **Zod**.
- 🔄 **Global Error Handling** - Combined use of ErrorBoundary and Centralized Error Handlers.

## 📚 Pattern Documentation

### Project Architecture

```
src/
├── api/                 # HTTP calls to the backend
│   └── endpoints/       # Organized by feature (expense.ts, income.ts, etc.)
├── components/          # Reusable React components
│   ├── layout/          # Structural layout components
│   ├── ui/              # Base UI components (Modal, Input, etc.)
│   └── [feature]/       # Feature-specific components
├── contexts/            # React Context (Global State)
│   └── toast/           # Notification system logic
├── hooks/               # Custom hooks
│   ├── use[Feature].ts  # Domain-specific hooks
│   ├── useValidation.ts # Form validation logic with Zod
│   └── useApiError.ts   # Centralized API error handling
├── schemas/             # Zod schemas for data validation
├── types/               # TypeScript type definitions
├── utils/               # Helper and utility functions
└── pages/               # Main application views/routes
```

### Coding Standards

#### 1. Functional Components with Hooks

```tsx
// ✅ Pattern: Functional component with hooks
import { useState, useCallback } from 'react';

interface ModalProps {
   isOpen: boolean;
   onClose: () => void;
}

export function MyModal({ isOpen, onClose }: ModalProps) {
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

#### 2. **Custom Hooks for Business Logic**

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

#### 3. **Validation with Zod**

```tsx
// ✅ Pattern: Schema centralized in /schemas
import { z } from 'zod';

export const ExpenseCreateSchema = z.object({
   description: z.string().min(1, 'Description is required'),
   value: z.number().positive('Value must be positive'),
   category: z.string().min(1, 'Category is required')
});

// Usage in components
const { validate } = useValidation();
const data = validate(ExpenseCreateSchema, payload);
if (!data) return; // Error already displayed
```

#### 4. **Centralized Error Handling**

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

#### 5. **ErrorBoundary for React Errors**

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
// Formact: ['entity', 'optional_filter', 'period']
['incomes', month, year]
['expenses', month, year]
['commitments', 'alerts', year]`
```

### Context API

**PeriodContext** - Global Period State (Month/Year)
```tsx
const { month, year, summary, expenses, incomes } = usePeriod();
```

## 🔧 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
npm run lint:fix
```

### Format
```bash
npm run format
```

## 📦 Core Dependencies

- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool & dev server
- **React Router 7** - Client-side routing
- **TanStack Query 5** - Server state management
- **Zod** - Schema-based validation
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Declarative animations
- **React Swipeable** - Touch gestures support

## 🏗️ Component Structure

### Modal Pattern
```tsx
// All modals follow this pattern:
interface Props {
   isOpen: boolean;
   onClose: () => void;
}

export function AddExpenseModal({ isOpen, onClose }: Props) {
   const { validae } = useValidation();
   const { create } = useExpense();

   const handleSave = async () => {
      const data = validate(CreateExpenseSchema, payload);

      if (!data) return;

      await create(data);

      onClose();
   };

   return <ModalBase>{/* ... */}</ModalBase>;
}
```

### Hook Pattern
```tsx
// All feature hooks follow this pattern:
export function useExpense(month: string, year: string) {
   const queryClient = useQueryClient();
   const { handleError } = useApiError();

   const { data } = useQuery({ /* ... onError */ });
   const mutation = useMutation({ /* ... onError */ });

   return {
      expenses: data,
      create: mutation.mutateAsync,
      isSaving: mutation.isPending
   };
}
```

## 🧪 Testing

> ⚠️ Not implemented yet
> 
> Roadmap:
> - [ ] Setup Vitest environment
> - [ ] Unit tests for custom hooks
> - [ ] Component testing with React Testing Library
> - [ ] Integration tests

## 🔒 Security

### Implemented
- ✅ **Google Authentication** - OAuth 2.0 integration
- ✅ **VInput Validation** - Enforced via Zod schemas
- ✅ **TypeScript Typing** - Prevents type-related runtime errors

### Missing / To-Do
- ⚠️ CSRF protection
- ⚠️ Rate limiting
- ⚠️ Backend input sanitization

## 📝 Contributing

### Workflow
1. Always validate data with **Zod schemas**.
2. Use **custom hooks** for business logic separation.
3. Centralize error handling using the `useApiError` hook.
4. Provide comprehensive **TypeScript types**.
5. Test your changes locally before committing.

### Example: Adding a New Feature

1. **Create schema** (`src/schemas/new-feature.schema.ts`)
2. **Create hook** (`src/hooks/useNewFeature.ts`)
3. **Create component** (`src/components/new-feature/`)
4. **Integrate with types** (`src/types/NewFeature.ts`)

## 📞 Support

Questions about patterns? Refer to this README or the comments within the code.

---

**Last updated:** February 2026