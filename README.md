# React Router v7 + Vite Starter

React web starter with a strong dim theme, atomic state, and a lean utility layer — built on React Router v7 **Framework mode**.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React Router v7 (Framework mode) + Vite 6 |
| Styling | Tailwind CSS v4 |
| State | Jotai (atoms) |
| Storage | localStorage via `jotai/utils` |
| Data Fetching | SWR |
| Testing | Vitest + `@testing-library/react` |

## Quick Start

```bash
npm install
npm run dev        # Start development server
npm run build      # Production build (client + server)
npm run start      # Start production server
```

## Project Structure

```
app/                  # React Router framework app directory
  root.tsx            # Root layout (Meta, Links, Outlet, Scripts, ScrollRestoration)
  entry.client.tsx    # Client hydration entry
  entry.server.tsx    # Server render entry
  routes.ts           # Route configuration
  routes/             # Route modules
    _index.tsx        # Home page
src/                  # Shared source code
  components/         # Reusable UI components
  config/             # Configuration files
  contexts/           # React contexts (ThemeContext, etc.)
  hooks/              # Custom hooks
    utils/            # Hook utilities
  services/           # Business logic services
  storages/           # Jotai atoms for state
  utils/              # General utilities (event-emitter, etc.)
  test/               # Test files (Vitest)
public/               # Static assets
```

## Routing

Routes are defined in `app/routes.ts` using `@react-router/dev/routes`. Route modules live in `app/routes/`.

```ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("about", "routes/about.tsx"),
] satisfies RouteConfig;
```

Each route module can export `loader`, `action`, and default component:

```tsx
import type { Route } from "./+types/about";

export function loader(_args: Route.LoaderArgs) {
  return { message: "Hello from loader" };
}

export default function About({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.message}</div>;
}
```

## Theming

The theme is built with **Tailwind CSS v4** using CSS variables and a `dark` variant. It follows a **strong dim aesthetic** — low saturation, muted tones, and only essential accent colors.

### What's in the theme

- **12-step gray palettes** for both light and dark modes
- **Primary**: muted steel blue
- **Secondary**: muted sage teal
- **Semantic colors**: `success`, `warning`, `danger` (all dimmed)
- **Self-contained**: no dependency on external color packages

### Using theme values

Use Tailwind utility classes with semantic tokens:

```tsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-white">Primary Action</button>
  <button className="bg-secondary text-white">Secondary Action</button>
</div>
```

### Switching themes

The app wraps everything in `ThemeProvider` (from `src/contexts/ThemeContext.tsx`). It reads/writes the current theme via Jotai to localStorage so the choice persists.

```tsx
import { useThemeContext } from "../contexts/ThemeContext";

const { theme, setTheme } = useThemeContext();

// Toggle between light and dark
setTheme(theme === "dark" ? "light" : "dark");
```

### Important theming notes

- The root `<html>` element gets the `.dark` class when dark mode is active.
- Tailwind v4 maps `dark` variants automatically via `@theme dark`.
- `app/root.tsx` renders every route inside a wrapper with `bg-background` to ensure the app background always respects the active theme.

## Utilities

### `src/storages/index.ts`

Factory for Jotai's `createJSONStorage` backed by `localStorage`.

```ts
import { storage } from "./storages";

const myStorage = storage<MyType>();
```

### `src/storages/theme.ts`

Persistent theme atom. Default is `"dark"`.

```ts
import { themeAtom, ThemeOptions } from "./storages/theme";
import { useAtom } from "jotai";

const [theme, setTheme] = useAtom(themeAtom);
```

### `src/contexts/ThemeContext.tsx`

Provider that bridges the Jotai `themeAtom` with the DOM. Exposes:

- `theme: ThemeOptions` — current theme name
- `setTheme(theme: ThemeOptions)` — change theme

```ts
import { useThemeContext } from "../contexts/ThemeContext";
```

### `src/hooks/utils/useDebounceIt.ts`

Debounces a string value by a configurable delay (default: 1 second).

```ts
import useDebounceIt from "../hooks/utils/useDebounceIt";

const debouncedSearch = useDebounceIt({ value: searchInput, delay: 0.5 });
```

### `src/hooks/utils/useCustomFetch.ts`

SWR wrapper for typed data fetching. Supports conditional fetching via `disabled`.

```ts
import useCustomFetch from "../hooks/utils/useCustomFetch";

const { data, error, isLoading } = useCustomFetch<MyData>({
  url: "/api/data",
  fetcher: async () => { /* ... */ },
  disabled: !shouldFetch,
});
```

### `src/hooks/utils/useEventEmitter.ts`

Subscribes to an event emitter instance inside a `useEffect` and cleans up on unmount.

```ts
import { useEventEmitter } from "../hooks/utils/useEventEmitter";

useEventEmitter<MyPayload>("event-name", (data) => {
  console.log(data);
});
```

> **Note:** This hook expects `utils/event-emitter` to exist.

## TypeScript

Strict mode is enabled. The project uses `tsconfig.app.json` with `"strict": true`.

### Route types

React Router v7 Framework mode generates route types automatically. Run before type-checking:

```bash
npm run typecheck   # Generates types + runs tsc
```

## Testing

Tests live in the `src/test/` directory and are run with **Vitest**.

### Commands

```bash
npm test              # Run all tests once
npm run test:watch    # Run in watch mode
npm run test:coverage # Run with coverage report
```

### Writing tests

Import utilities from `@testing-library/react`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "../../app/routes/_index";
import ThemeProvider from "../contexts/ThemeContext";

const renderWithProviders = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

describe("Home", () => {
  it("renders correctly", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

For hooks, use `renderHook` and wrap timer advances in `act()` when using `vi.useFakeTimers()`:

```ts
import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import useMyHook from "../hooks/useMyHook";

it("updates after delay", () => {
  vi.useFakeTimers();
  const { result } = renderHook(() => useMyHook());

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current).toBe("expected");
  vi.useRealTimers();
});
```

### Setup file

`src/test/setup.ts` contains global mocks (`matchMedia`) and imports custom matchers from `@testing-library/jest-dom/vitest`.
