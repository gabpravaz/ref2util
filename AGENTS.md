# Development Guidelines for ref2util

This document outlines best practices and coding standards for the ref2util project. All contributors should follow these guidelines to maintain code quality, performance, and maintainability.

## Stack Overview

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest
- **Linting & Formatting**: Biome
- **UI Libraries**: Base UI, shadcn/ui, Tailwind CSS
- **Styling**: Tailwind CSS with class-variance-authority (CVA) for component variants
- **Icons**: Lucide React
- **Client-Side Focused**: This application processes data primarily on the client side
- **Component Architecture**: Modular UI components with custom hooks

---

## Core Principles

### 1. KISS (Keep It Simple, Stupid)
- Write straightforward, readable code that doesn't over-engineer solutions
- Avoid premature optimization at the expense of clarity
- Each function/component should have a single, obvious purpose
- Prefer simple solutions over complex ones when both work equally well

### 2. Single Responsibility Principle (SRP)
- **Components** should handle only one responsibility (e.g., rendering UI, not business logic)
- **Hooks** should encapsulate a single concern (e.g., form handling, API calls, or state management)
- **Utilities** should do one thing well
- Split complex components into smaller, focused sub-components

### 3. Modularity
- Break down functionality into small, reusable modules
- Avoid creating large files with multiple concerns
- Keep related code close together (co-locate styles, tests, and logic)
- Use named exports for better tree-shaking and explicit dependencies

### 4. Performance First (Client-Side Processing)
Since all processing happens client-side, performance optimization is critical:

- **Memoization**: Use `React.memo()` for expensive components and `useMemo()` for expensive computations
- **Lazy Evaluation**: Load data and compute results only when needed
- **Avoid Re-renders**: Structure state to minimize unnecessary component re-renders
- **Efficient Algorithms**: Prefer O(n) over O(n²) operations, especially for large datasets
- **Code Splitting**: Use dynamic imports for large modules
- **Web Workers**: Consider for CPU-intensive operations on large data
- **Avoid Blocking Operations**: Use `requestIdleCallback()` or async patterns for non-critical work

---

## Styling & UI Library Guidelines

### Tailwind CSS Best Practices
- Use Tailwind utility classes for all styling (avoid inline CSS or separate stylesheets)
- Leverage Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, etc.) for responsive design
- Use Tailwind's arbitrary values for custom values: `w-[600px]`, `bg-[#1a2b3c]`
- Avoid hardcoding color values; use Tailwind's color palette
- Group related utilities for readability using consistent ordering

```typescript
// Good: Clear, organized Tailwind utilities
export function Button({ variant = 'primary' }: ButtonProps): JSX.Element {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-semibold transition-colors duration-200',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300'
      )}
    >
      Click me
    </button>
  );
}
```

### Class Variance Authority (CVA) for Component Variants
- Use CVA for managing component variants with Tailwind classes
- Define variant schemas to ensure consistency and type safety
- Reduces className string complexity and improves maintainability

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'px-4 py-2 rounded-lg font-semibold transition-colors duration-200',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-6 py-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export function Button({ variant, size, children }: ButtonProps): JSX.Element {
  return (
    <button className={buttonVariants({ variant, size })}>
      {children}
    </button>
  );
}
```

### shadcn/ui Components
- Use shadcn/ui components as building blocks for common UI patterns
- Customize shadcn components using CVA and Tailwind
- Treat shadcn components as base components; extend them for specific needs
- Common shadcn components in this project: Button, Input, Dialog, Card, Tabs, etc.

```typescript
// Example: Composing shadcn Button with custom variants
import { Button } from '@/components/ui/button';

export function CustomButton(): JSX.Element {
  return (
    <Button variant="outline" size="lg" className="gap-2">
      <LucideIcon className="w-4 h-4" />
      Click me
    </Button>
  );
}
```

### Base UI Integration
- Use Base UI for unstyled, headless components with full accessibility
- Combine Base UI with Tailwind for custom styling
- Leverage Base UI's slot-based composition for advanced customization

```typescript
// Example: Using Base UI's Popup with Tailwind styling
import { Popup } from '@base-ui/react/Popup';

export function PopupMenu(): JSX.Element {
  return (
    <Popup.Root>
      <Popup.Trigger className="px-4 py-2 bg-blue-600 text-white rounded">
        Open Menu
      </Popup.Trigger>
      <Popup.Positioner>
        <Popup.Popup className="bg-white border border-gray-300 rounded shadow-lg p-2">
          <ul className="space-y-1">
            <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Item 1</a></li>
            <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Item 2</a></li>
          </ul>
        </Popup.Popup>
      </Popup.Positioner>
    </Popup.Root>
  );
}
```

### Icon Usage with Lucide React
- Use Lucide React for consistent iconography
- Pair icons with text for clarity
- Size icons consistently using `w-4 h-4` (inline), `w-5 h-5` (default), `w-6 h-6` (large)

```typescript
import { ChevronDown, Settings, AlertCircle } from 'lucide-react';

export function IconExample(): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <AlertCircle className="w-5 h-5 text-red-600" />
      <span>Alert message</span>
    </div>
  );
}
```

---

### Component Guidelines

#### Structure
```typescript
// Use functional components and hooks exclusively
// Export as named export for better debugging
export function MyComponent(): JSX.Element {
  // ...
}
```

#### Prop Types
- Always define explicit prop interfaces
- Avoid `any` types; use `unknown` if necessary and narrow the type
- Use discriminated unions for complex prop patterns

```typescript
interface MyComponentProps {
  title: string;
  onClose?: () => void;
  variant?: 'primary' | 'secondary';
}

export function MyComponent({ title, onClose, variant = 'primary' }: MyComponentProps): JSX.Element {
  // ...
}
```

#### Return Types
- Always explicitly type component return values as `JSX.Element` or `React.ReactNode`
- Use `null` instead of `undefined` for conditional rendering

#### Avoid Unnecessary `useEffect`
`useEffect` should only be used for:
- Syncing with external systems (APIs, subscriptions, timers)
- Cleaning up resources (event listeners, timers)
- Initializing state based on props changes

**Do NOT use `useEffect` for:**
- Transforming data (move to custom hooks or before render)
- Responding to user actions (use event handlers)
- State synchronization between related state (use reducer or derive state)

**Good Example:**
```typescript
// Derive state instead of using useEffect
function MyComponent({ userId }: MyComponentProps): JSX.Element {
  const user = useUser(userId); // Custom hook that handles fetching
  const displayName = user?.name ?? 'Unknown'; // Derived, not in state
  return <div>{displayName}</div>;
}
```

**Avoid:**
```typescript
// Bad: useEffect for data transformation
const [displayName, setDisplayName] = useState('');
useEffect(() => {
  setDisplayName(user?.name ?? 'Unknown');
}, [user]);
```

### Custom Hooks

#### When to Create Custom Hooks
- Encapsulate stateful logic (form handling, API calls, local state management)
- Share logic across multiple components
- Abstract complex operations into reusable units
- Keep components focused on rendering

#### Hook Naming
- Always prefix with `use` (e.g., `useLocalStorage`, `useApiCall`, `useFormState`)
- Name after the behavior, not the state (e.g., `useFetch` not `useData`)

#### Hook Guidelines
```typescript
// Good: Clear responsibility, performant
export function useFetch<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch(url, { ...options, signal: controller.signal })
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url, options]);

  return { data, loading, error };
}
```

---

## Testing Guidelines

### Vitest Usage

#### Test Business Logic Only
- Write unit tests for **pure functions** and **complex business logic**
- Test **custom hooks** that contain significant logic
- **Skip testing**: UI rendering details, simple presentational components, library code
- **Focus on**: Input/output, edge cases, error handling

#### Test File Organization
- Place test files next to the code they test: `utils.ts` → `utils.test.ts`
- Use descriptive test names that explain the scenario and expected outcome
- Group related tests with `describe` blocks

```typescript
// Good: tests/utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRefUtility } from '../lib/utils';

describe('calculateRefUtility', () => {
  it('should return correct utility score for valid references', () => {
    expect(calculateRefUtility('ref123')).toBe(42);
  });

  it('should throw for invalid reference format', () => {
    expect(() => calculateRefUtility('invalid')).toThrow();
  });

  it('should handle edge case with empty string', () => {
    expect(calculateRefUtility('')).toBe(0);
  });
});
```

#### What to Test
- Edge cases and boundary conditions
- Error states and exception handling
- Pure function computations
- Custom hook state changes

#### What NOT to Test
- React rendering (unless critical behavior)
- Third-party library functionality
- Simple pass-through functions

---

## Code Quality & Formatting

### Biome Compliance
All code must pass Biome checks:
- Run `biome check` before committing
- Use `biome check --write` to auto-fix formatting
- Follow configured rules for linting and formatting
- Address all warnings and errors

### TypeScript Best Practices
- Enable strict mode (already configured)
- Avoid `any` types
- Use utility types for DRY prop/type definitions
- Prefer `const` over `let`, never use `var`
- Use proper type narrowing instead of type assertions when possible

### Import/Export
- Use ES modules exclusively
- Group imports: React → Base UI/shadcn → types → custom hooks → utilities → components → styles
- Use named exports; default exports only for default views/pages
- Import UI components from `@/components/ui/` for shadcn/ui
- Import Base UI components from `@base-ui/react/`

```typescript
import React, { useState, useCallback } from 'react';
import { Popup } from '@base-ui/react/Popup';
import type { MyType } from './types';
import { useCustomHook } from './hooks/useCustomHook';
import { calculateValue } from './lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import './styles.css';
```

---

## File Organization

```
src/
├── components/
│   ├── ui/                 # shadcn/ui & Base UI components (button, input, dialog, etc.)
│   │   ├── button.tsx      # shadcn/ui button with CVA variants
│   │   ├── input.tsx       # shadcn/ui input with Tailwind styling
│   │   └── card.tsx        # shadcn/ui card component
│   └── features/           # Feature-specific components
│       └── SearchPanel.tsx # Custom component composing UI components
├── hooks/                  # Custom React hooks
│   ├── useCustomHook.ts
│   └── useCustomHook.test.ts
├── lib/                    # Utility functions and business logic
│   ├── utils.ts            # Tailwind cn() merge utility
│   └── utils.test.ts
├── types/                  # TypeScript type definitions
│   └── index.ts
├── app.css                 # Tailwind directives (@tailwind, @layer)
├── app.tsx                 # Root component
└── main.tsx                # Entry point
```

---

## Performance Optimization Checklist

### Rendering
- [ ] Memoize expensive components with `React.memo()`
- [ ] Use `useMemo()` for expensive computations
- [ ] Use `useCallback()` for stable function references passed to children
- [ ] Split large components into smaller, memoizable pieces
- [ ] Use dynamic imports for code splitting

### State Management
- [ ] Keep state as close as possible to where it's used
- [ ] Avoid lifting state unnecessarily
- [ ] Use state machines or reducers for complex state logic
- [ ] Batch state updates when possible

### Data Processing
- [ ] Pre-compute or cache expensive calculations
- [ ] Debounce expensive operations (filtering, searching)
- [ ] Use `Set` instead of arrays for membership testing
- [ ] Avoid creating new objects/arrays on every render
- [ ] Consider Web Workers for CPU-intensive tasks

### Bundle Size
- [ ] Tree-shake unused code with named exports
- [ ] Lazy-load non-critical features
- [ ] Monitor bundle size during development
- [ ] Use dynamic imports strategically

---

## Common Patterns

### Component Composition with shadcn/ui + Tailwind
```typescript
// Good: Composing multiple UI components with clear separation of concerns
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SearchFormProps {
  onSearch: (query: string) => void;
}

export function SearchForm({ onSearch }: SearchFormProps): JSX.Element {
  const [query, setQuery] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  }, [query, onSearch]);

  return (
    <Card className="p-6 space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="primary">
          Search
        </Button>
      </form>
    </Card>
  );
}
```

### Base UI with Popover Pattern
```typescript
// Good: Base UI for complex interactive patterns
import { Popup } from '@base-ui/react/Popup';
import { Button } from '@/components/ui/button';
import { useCallback, useState } from 'react';

export function FilterMenu(): JSX.Element {
  const [open, setOpen] = useState(false);

  const handleFilterChange = useCallback((filter: string) => {
    // Apply filter
    setOpen(false);
  }, []);

  return (
    <Popup.Root open={open} onOpenChange={setOpen}>
      <Popup.Trigger asChild>
        <Button variant="outline">Filters</Button>
      </Popup.Trigger>
      <Popup.Positioner>
        <Popup.Popup className="bg-white border border-gray-300 rounded shadow-lg p-4 min-w-48">
          <div className="space-y-2">
            <button
              onClick={() => handleFilterChange('recent')}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
            >
              Most Recent
            </button>
            <button
              onClick={() => handleFilterChange('popular')}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
            >
              Most Popular
            </button>
          </div>
        </Popup.Popup>
      </Popup.Positioner>
    </Popup.Root>
  );
}
```

### Custom Hook Pattern (Fetching Data)
```typescript
export function useFetchReferenceData(refId: string | null) {
  const [data, setData] = useState<ReferenceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!refId) return;

    const controller = new AbortController();
    setIsLoading(true);

    processReference(refId, { signal: controller.signal })
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [refId]);

  return { data, isLoading, error };
}
```

### Memoized Component Pattern
```typescript
interface ReferenceItemProps {
  id: string;
  title: string;
  onSelect: (id: string) => void;
}

export const ReferenceItem = React.memo(
  function ReferenceItem({ id, title, onSelect }: ReferenceItemProps) {
    const handleClick = useCallback(() => {
      onSelect(id);
    }, [id, onSelect]);

    return <button onClick={handleClick}>{title}</button>;
  },
  (prevProps, nextProps) => 
    prevProps.id === nextProps.id && 
    prevProps.title === nextProps.title
);
```

### Utility Function Pattern
```typescript
// lib/calculateRef.ts - Pure, testable function
export function calculateRefScore(refs: Reference[]): number {
  return refs.reduce((sum, ref) => sum + ref.weight, 0);
}

// Custom hook using utility
export function useRefScore(refs: Reference[]) {
  return useMemo(() => calculateRefScore(refs), [refs]);
}
```

---

## Commit & Review Checklist

Before committing code:
- [ ] Code passes `biome check`
- [ ] All unit tests pass (`vitest`)
- [ ] No console errors or warnings
- [ ] Components follow SRP
- [ ] Custom hooks are properly extracted
- [ ] No unnecessary `useEffect` hooks
- [ ] TypeScript is strict (no `any` types)
- [ ] Performance optimizations applied where appropriate
- [ ] Complex logic is documented with comments

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev)
- [Biome Documentation](https://biomejs.dev)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
