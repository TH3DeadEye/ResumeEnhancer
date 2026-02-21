import { useRef, useState } from "react";
import { LandingPage } from "./components/landing-page";
import { SignInPage } from "./components/signin-page";
import { Navigation } from "./components/navigation";
import gsap from "gsap";

/**
 * MAIN APP COMPONENT
 * 
 * Root component managing page navigation with enhanced transitions:
 * - 3D flip page transitions
 * - Smooth fade and slide effects
 * - Scale and rotation animations
 * - Optimized scroll reset
 */

export default function App() {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  const [currentPage, setCurrentPage] = useState<"landing" | "signin">("landing");
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const pageRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // ENHANCED PAGE NAVIGATION WITH ADVANCED TRANSITIONS
  // ============================================================
  
  /**
   * Handles smooth page transitions with advanced animations
   * 
   * Animation sequence:
   * 1. Scale down and rotate current page
   * 2. Fade out with blur effect
   * 3. Switch page content
   * 4. Reset scroll position
   * 5. Scale up and rotate new page in
   * 6. Fade in with clarity
   */
  const handleNavigate = (page: "landing" | "signin") => {
    // Prevent multiple transitions at once
    if (page === currentPage || isTransitioning) return;

    setIsTransitioning(true);

    if (pageRef.current) {
      // Create timeline for coordinated animations
      const timeline = gsap.timeline({
        onComplete: () => setIsTransitioning(false)
      });

      // ──────────────────────────────────────────────────────────
      // PHASE 1: Exit animation - Smooth fade with subtle scale
      // ──────────────────────────────────────────────────────────
      timeline.to(pageRef.current, {
        opacity: 0,
        scale: 0.98,
        y: -20,
        filter: "blur(5px)",
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          // ──────────────────────────────────────────────────────────
          // PHASE 2: Switch page content and reset scroll
          // ──────────────────────────────────────────────────────────
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      });

      // ──────────────────────────────────────────────────────────
      // PHASE 3: Entrance animation - Smooth fade in
      // ──────────────────────────────────────────────────────────
      timeline.fromTo(
        pageRef.current,
        { 
          opacity: 0, 
          scale: 1.02, 
          y: 20,
          filter: "blur(5px)"
        },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          filter: "blur(0px)",
          duration: 0.4,
          ease: "power2.out",
          clearProps: "all" // Clear all inline styles after animation
        }
      );
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <div className="min-h-screen">
      {/* 
        NAVIGATION BAR
        - Fixed at top
        - Handles page switching
        - Shows scroll progress
      */}
      <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
      
      {/* 
        PAGE CONTENT CONTAINER
        - Smooth fade transitions between pages
      */}
      <div ref={pageRef}>
        {currentPage === "landing" ? (
          <LandingPage onNavigate={handleNavigate} />
        ) : (
          <SignInPage />
        )}
      </div>
    </div>
  );
}
