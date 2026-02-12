'use client';

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ThemeToggle } from "./theme-toggle";

/**
 * NAVIGATION COMPONENT
 * 
 * Enhanced sticky navigation bar featuring:
 * - Scroll progress indicator
 * - Logo animation on scroll
 * - Menu item hover effects
 * - Mobile menu slide animation
 * - Background blur on scroll
 * - Active section highlighting
 */

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navigation({ onNavigate, currentPage }: NavigationProps) {
  // ============================================================
  // STATE & REFS
  // ============================================================
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  
  const navRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // SCROLL DETECTION & PROGRESS
  // ============================================================
  
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);

      // Update scroll progress bar
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.scrollY / windowHeight) * 100;
      
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          width: `${scrollProgress}%`,
          duration: 0.2,
          ease: "none"
        });
      }

      // Detect active section
      if (currentPage === "landing") {
        const sections = ["home", "features", "about", "contact"];
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage]);

  // ============================================================
  // ENTRANCE ANIMATION
  // ============================================================
  
  useEffect(() => {
    if (navRef.current) {
      // Navbar slides down from top
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );

      // Logo pulse animation
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { scale: 0, rotation: -180 },
          { 
            scale: 1, 
            rotation: 0, 
            duration: 0.8, 
            ease: "elastic.out(1, 0.5)",
            delay: 0.3
          }
        );
      }

      // Stagger menu items
      const menuItems = navRef.current.querySelectorAll(".nav-menu-item");
      if (menuItems.length > 0) {
        gsap.fromTo(
          Array.from(menuItems),
          { y: -20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.5
          }
        );
      }
    }
  }, []);

  // ============================================================
  // LOGO SCALE ANIMATION ON SCROLL (removed rotation to prevent flipping)
  // ============================================================
  
  useEffect(() => {
    if (logoRef.current) {
      // Subtle pulse on scroll instead of rotation
      gsap.to(logoRef.current, {
        scale: 1.1,
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "100px",
          scrub: 1,
          toggleActions: "play none none reverse"
        }
      });
    }
  }, []);

  // ============================================================
  // MOBILE MENU ANIMATION
  // ============================================================
  
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (isMobileMenuOpen) {
        // Slide in animation
        gsap.fromTo(
          mobileMenuRef.current,
          { height: 0, opacity: 0 },
          { 
            height: "auto", 
            opacity: 1, 
            duration: 0.4, 
            ease: "power2.out" 
          }
        );

        // Stagger menu items
        const items = mobileMenuRef.current.querySelectorAll(".mobile-menu-item");
        gsap.fromTo(
          Array.from(items),
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.3,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.1
          }
        );
      } else {
        // Slide out animation
        gsap.to(mobileMenuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in"
        });
      }
    }
  }, [isMobileMenuOpen]);

  // ============================================================
  // SMOOTH SCROLL FUNCTION
  // ============================================================
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md shadow-lg"
      style={{
        backgroundColor: isScrolled 
          ? "color-mix(in oklch, var(--bg), transparent 5%)"
          : "color-mix(in oklch, var(--bg), transparent 10%)"
      }}
    >
      {/* Scroll Progress Bar - Enhanced visibility */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-lg"
          style={{ width: "0%", boxShadow: "0 0 10px rgba(147, 51, 234, 0.5)" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* ============================================================ */}
          {/* LOGO - Animated scale on scroll */}
          {/* ============================================================ */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate("landing")}
          >
            <div className="flex items-center gap-2">
              <div 
                ref={logoRef}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  background: "linear-gradient(to bottom right, var(--primary), var(--secondary))"
                }}
              >
                <span className="font-bold text-lg" style={{ color: "var(--bg-light)" }}>AI</span>
              </div>
              <span className="text-xl font-bold" style={{ color: "var(--text)" }}>
                Resume Enhancer
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* DESKTOP NAVIGATION - With active section highlighting */}
          {/* ============================================================ */}
          <div className="hidden md:flex items-center gap-8">
            {currentPage === "landing" ? (
              <>
                {["home", "features", "about", "contact"].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="nav-menu-item transition-all duration-300 relative"
                    style={{ 
                      color: activeSection === section ? "var(--primary)" : "var(--text)",
                      fontWeight: activeSection === section ? 600 : 400
                    }}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                    {/* Active indicator */}
                    {activeSection === section && (
                      <span 
                        className="absolute -bottom-1 left-0 right-0 h-0.5"
                        style={{ 
                          background: "linear-gradient(to right, var(--primary), var(--secondary))"
                        }}
                      ></span>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <button
                onClick={() => onNavigate("landing")}
                className="nav-menu-item text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Back to Home
              </button>
            )}
            
            <Button
              onClick={() => onNavigate("signin")}
              className="nav-menu-item"
              style={{ 
                background: "linear-gradient(to right, var(--primary), var(--secondary))",
                color: "var(--bg-light)"
              }}
            >
              Sign In
            </Button>
            
            <ThemeToggle />
          </div>

          {/* ============================================================ */}
          {/* MOBILE MENU BUTTON */}
          {/* ============================================================ */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative z-50 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              style={{ 
                color: "var(--text)",
                minWidth: "44px",
                minHeight: "44px"
              }}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE MENU DROPDOWN - Animated slide */}
        {/* ============================================================ */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden border-t overflow-hidden"
            style={{
              backgroundColor: "var(--bg-light)",
              borderColor: "var(--border)"
            }}
          >
            <div className="px-4 py-6 space-y-3">
              {currentPage === "landing" ? (
                <>
                  {["home", "features", "about", "contact"].map((section) => (
                    <button
                      key={section}
                      onClick={() => scrollToSection(section)}
                      className="mobile-menu-item block w-full text-left py-3 px-4 rounded-lg transition-all touch-manipulation"
                      style={{
                        color: activeSection === section ? "var(--primary)" : "var(--text)",
                        backgroundColor: activeSection === section ? "color-mix(in oklch, var(--primary), transparent 90%)" : "transparent",
                        fontWeight: activeSection === section ? 600 : 400,
                        minHeight: "44px"
                      }}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  ))}
                </>
              ) : (
                <button
                  onClick={() => onNavigate("landing")}
                  className="mobile-menu-item block w-full text-left py-3 px-4 rounded-lg transition-all touch-manipulation"
                  style={{
                    color: "var(--text)",
                    minHeight: "44px"
                  }}
                >
                  Back to Home
                </button>
              )}
              
              <Button
                onClick={() => onNavigate("signin")}
                className="mobile-menu-item w-full text-base py-6 touch-manipulation"
                style={{ 
                  background: "linear-gradient(to right, var(--primary), var(--secondary))",
                  color: "var(--bg-light)",
                  minHeight: "44px"
                }}
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
