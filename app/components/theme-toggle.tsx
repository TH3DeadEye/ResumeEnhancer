'use client';

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

/**
 * THEME TOGGLE COMPONENT
 * 
 * Allows users to switch between light and dark mode
 * - Saves preference to localStorage
 * - Respects system preference on first visit
 * - Smooth icon transition animation
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div className="w-10 h-10" />;
  }
  
  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
      style={{
        backgroundColor: "color-mix(in oklch, var(--primary), transparent 85%)",
        border: "2px solid var(--primary)"
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="h-5 w-5" style={{ color: "var(--primary)" }} />
      ) : (
        <Sun className="h-5 w-5" style={{ color: "var(--primary)" }} />
      )}
    </button>
  );
}
