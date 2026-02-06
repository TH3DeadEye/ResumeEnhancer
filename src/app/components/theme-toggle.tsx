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
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  // Track current theme ("light" or "dark")
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // ============================================================
  // INITIALIZE THEME ON MOUNT
  // ============================================================
  
  useEffect(() => {
    // Check if user has a saved preference in localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    
    // Check if user's system prefers dark mode
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Priority: saved preference > system preference > default to light
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    
    // Update state and apply theme to document
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []); // Empty dependency array = run once on mount

  // ============================================================
  // TOGGLE THEME FUNCTION
  // ============================================================
  
  /**
   * Switches between light and dark mode
   * - Updates state
   * - Saves to localStorage
   * - Applies "dark" class to <html> element
   */
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    
    // Update state
    setTheme(newTheme);
    
    // Save preference to browser storage (persists across sessions)
    localStorage.setItem("theme", newTheme);
    
    // Toggle "dark" class on <html> element
    // This triggers all "dark:" Tailwind classes throughout the app
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full"
      aria-label="Toggle theme"
    >
      {/* 
        SUN ICON (visible in light mode)
        - rotate-0 scale-100: visible in light mode
        - dark:-rotate-90 dark:scale-0: hidden in dark mode (rotates and shrinks)
      */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      
      {/* 
        MOON ICON (visible in dark mode)
        - rotate-90 scale-0: hidden in light mode
        - dark:rotate-0 dark:scale-100: visible in dark mode
        - absolute: positioned on top of sun icon
      */}
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}