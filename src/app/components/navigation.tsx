import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import gsap from "gsap";
import { ThemeToggle } from "./theme-toggle";

/**
 * NAVIGATION COMPONENT
 * 
 * Sticky navigation bar with:
 * - Logo and navigation links
 * - Desktop and mobile responsive layouts
 * - Smooth scroll to sections
 * - Theme toggle button
 * - Background blur effect on scroll
 */

// Props interface - defines what data this component receives from parent
interface NavigationProps {
  onNavigate: (page: string) => void; // Function to switch between pages
  currentPage: string;                 // Current page name ("landing" or "signin")
}

export function Navigation({ onNavigate, currentPage }: NavigationProps) {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  // Track if user has scrolled down (changes navbar styling)
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Track if mobile menu is open/closed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Reference to nav element for GSAP animation
  const navRef = useRef<HTMLElement>(null);

  // ============================================================
  // SCROLL DETECTION EFFECT
  // ============================================================
  
  useEffect(() => {
    /**
     * Updates isScrolled state when user scrolls
     * - Adds stronger blur and shadow to navbar when scrolled > 50px
     */
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Listen for scroll events
    window.addEventListener("scroll", handleScroll);
    
    // Cleanup: remove listener when component unmounts
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // Empty array = run once on mount

  // ============================================================
  // ENTRANCE ANIMATION
  // ============================================================
  
  useEffect(() => {
    if (navRef.current) {
      /**
       * ANIMATION: Navbar slides down from top on page load
       * - Starts: 100px above viewport, invisible
       * - Ends: Normal position, fully visible
       * - Duration: 0.8 seconds
       * - Easing: power3.out (smooth deceleration)
       */
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },  // FROM: hidden above screen
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }  // TO: visible in position
      );
    }
  }, []); // Run once on mount

  // ============================================================
  // SMOOTH SCROLL FUNCTION
  // ============================================================
  
  /**
   * Scrolls smoothly to a section by ID
   * @param sectionId - The id attribute of the section to scroll to
   * 
   * Used for: Home, Features, About Us, Contact links
   */
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });  // Smooth scroll animation
      setIsMobileMenuOpen(false);                      // Close mobile menu after click
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          // SCROLLED STATE: Stronger blur and shadow
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg"
          // DEFAULT STATE: Lighter blur and shadow
          : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* ============================================================ */}
          {/* LOGO - Clickable, navigates to landing page */}
          {/* ============================================================ */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate("landing")}
          >
            <div className="flex items-center gap-2">
              {/* AI Icon with gradient background */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              {/* Brand name */}
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Resume Enhancer
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* DESKTOP NAVIGATION - Hidden on mobile (md:flex) */}
          {/* ============================================================ */}
          <div className="hidden md:flex items-center gap-8">
            {/* Show different links based on current page */}
            {currentPage === "landing" ? (
              <>
                {/* Landing page navigation links - scroll to sections */}
                <button
                  onClick={() => scrollToSection("home")}
                  className="transition-colors text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="transition-colors text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="transition-colors text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  About Us
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="transition-colors text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Contact
                </button>
              </>
            ) : (
              // On sign-in page, show "Back to Home" button
              <button
                onClick={() => onNavigate("landing")}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Back to Home
              </button>
            )}
            
            {/* Sign In button with gradient */}
            <Button
              onClick={() => onNavigate("signin")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Sign In
            </Button>
            
            {/* Theme toggle (light/dark mode) */}
            <ThemeToggle />
          </div>

          {/* ============================================================ */}
          {/* MOBILE MENU BUTTON - Hidden on desktop (md:hidden) */}
          {/* ============================================================ */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-900 dark:text-white"
          >
            {/* Toggle between hamburger (Menu) and close (X) icon */}
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* ============================================================ */}
        {/* MOBILE MENU DROPDOWN - Only visible when isMobileMenuOpen is true */}
        {/* ============================================================ */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800">
            <div className="px-4 py-6 space-y-4">
              {currentPage === "landing" ? (
                <>
                  {/* Landing page links */}
                  <button
                    onClick={() => scrollToSection("home")}
                    className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  >
                    About Us
                  </button>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  >
                    Contact
                  </button>
                </>
              ) : (
                // On sign-in page
                <button
                  onClick={() => onNavigate("landing")}
                  className="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600"
                >
                  Back to Home
                </button>
              )}
              
              {/* Sign In button */}
              <Button
                onClick={() => onNavigate("signin")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Sign In
              </Button>
              
              {/* Theme toggle centered */}
              <div className="flex justify-center pt-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
