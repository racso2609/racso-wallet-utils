# Agent Guidelines for React Router v7 + Vite Starter

This document provides guidelines for agents operating in this codebase.

## Project Overview

- **Type**: React web application
- **Framework**: React Router v7 (Framework mode) + Vite 6
- **Styling**: Tailwind CSS v4
- **State Management**: Jotai (atoms)
- **Routing**: React Router v7 Framework (file-based routes via `app/routes.ts`)
- **Language**: TypeScript (strict mode enabled)

## Build Commands

```bash
# Start development server
npm run dev

# Production build (client + server)
npm run build

# Start production server
npm run start

# Type check (generates route types + tsc)
npm run typecheck
```

## Testing

Tests are located in the `src/test/` directory.

```bash
# Run tests
npm test
npm run test:watch
npm run test:coverage
```

## Code Style Guidelines

### Imports

- Use single quotes for all imports (local and npm packages)
- Order imports: external packages → relative imports
- Group imports: React/NPM packages → components → hooks/contexts → services → storages → config

```typescript
import { FC, PropsWithChildren } from 'react'
import { useNavigate } from 'react-router'
import { useAtom } from 'jotai'
import { userAtom } from '../storages/user'
import { authService } from '../services/AuthService'
```

### Components

- Use `FC` (Functional Component) type from React
- Use `PropsWithChildren` for components that accept children
- Export components as named exports or default exports for page/route components
- Use Tailwind utility classes for styling

```typescript
export const MyComponent: FC<PropsWithChildren<MyComponentProps>> = ({ children, prop1 }) => {
  return <div className="bg-card p-4">{children}</div>
}
```

### Icons

- **Never use inline `<svg>` elements directly in components.** Always use the centralized `Icon` component (`@src/components/Icon.tsx`).
- Add new icons to the `ICON_NAME` union and `ICONS` map in `Icon.tsx` instead of duplicating SVG markup.
- This ensures consistency, reusability, and easy theme/styling updates.

```typescript
import { Icon } from './Icon'

<Icon name="close" size={20} className="text-muted" />
```

### Naming Conventions

- **Components**: PascalCase (e.g., `Navbar`, `ProfileSection`)
- **Route files**: Use React Router conventions — `_index.tsx` for index route, `$id.tsx` for dynamic params, `_layout.tsx` for layout routes
- **Files**: PascalCase for components, camelCase for utilities (e.g., `AuthService.ts`, `useEventEmitter.ts`)
- **Interfaces**: PascalCase with descriptive names (e.g., `UserIdentity`, `EncryptedMessage`)
- **Variables/Functions**: camelCase
- **Atoms**: PascalCase with `Atom` suffix (e.g., `userAtom`, `themeAtom`)

### Types

- Enable strict mode in TypeScript
- Define interfaces for all data structures
- Use explicit return types for service methods
- Use generated route types when available (`import type { Route } from "./+types/some-route"`)

```typescript
interface UserIdentity {
  did: string
  address: string
  publicKey: string
}

async function generateWallet(): Promise<{ did: string; address: string; publicKey: string }> {
  // implementation
}
```

### Services

- Use singleton pattern with `getInstance()` method
- Export a default instance as named export
- Wrap async operations in try/catch
- Throw descriptive errors

```typescript
export class AuthService {
  private static instance: AuthService

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }
}

export const authService = AuthService.getInstance()
```

### Error Handling

- Use try/catch for async operations
- Log errors with console.error
- Throw descriptive Error objects with context

```typescript
try {
  const result = await someAsyncOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error(`Failed to operation: ${error}`)
}
```

### State Management

- Use Jotai atoms with `atomWithStorage` for persistent state
- Use `createJSONStorage` with localStorage for custom storage

```typescript
import { atomWithStorage } from 'jotai/utils'
import { storage } from './index'

export const userAtom = atomWithStorage<UserIdentity | null>('user_identity', null, storage())
```

### Context

- Create context with createContext
- Use FC<PropsWithChildren> for providers
- Export hook for consuming context
- Throw error if context is used outside provider

```typescript
const MyContext = createContext<ContextType | null>(null)

export const MyProvider: FC<PropsWithChildren> = ({ children }) => {
  // provider implementation
}

export const useMyContext = () => {
  const context = useContext(MyContext)
  if (!context) throw new Error('Empty context')
  return context
}
```

## Project Structure

```
app/                  # React Router framework app directory
  root.tsx            # Root layout
  entry.client.tsx    # Client entry
  entry.server.tsx    # Server entry
  routes.ts           # Route config
  routes/             # Route modules
src/                  # Shared source code
  components/         # Reusable UI components
  config/             # Configuration files
  contexts/           # React contexts
  hooks/              # Custom hooks
    /utils            # Hook utilities
  services/           # Business logic services
  storages/           # Jotai atoms for state
  utils/              # General utilities
  test/               # Test files
public/               # Static assets
```

## Dependencies

Key dependencies to be aware of:
- `react-router` / `@react-router/dev` - Framework and build tool
- `tailwindcss` - Utility-first CSS framework
- `jotai` - Atomic state management
- `swr` - Data fetching
