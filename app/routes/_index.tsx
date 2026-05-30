import { FC, useEffect } from "react";
import { useThemeContext } from "../../src/contexts/ThemeContext";

const Home: FC = () => {
  const { theme, setTheme } = useThemeContext();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        Hello
      </h1>
      <p className="text-muted max-w-md text-center">
        React Router v7 Framework mode + Vite starter with a strong dim theme,
        Jotai state, and Tailwind CSS.
      </p>
      <button
        type="button"
        onClick={() => {
          setTheme(theme === "dark" ? "light" : "dark");
        }}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Toggle Theme
      </button>
    </main>
  );
};

export default Home;
