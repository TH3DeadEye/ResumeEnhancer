import { useRef, useState } from "react";
import { LandingPage } from "./components/landing-page";
import { SignInPage } from "./components/signin-page";
import { Navigation } from "./components/navigation";
import gsap from "gsap";

/**
 * MAIN APP COMPONENT
 * This is the root component that manages page navigation between Landing and Sign In pages
 * Uses GSAP for smooth page transition animations
 */
export default function App() {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  // Track which page is currently displayed ("landing" or "signin")
  const [currentPage, setCurrentPage] = useState<"landing" | "signin">("landing");
  
  // Reference to the page container for GSAP animations
  const pageRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // PAGE NAVIGATION WITH ANIMATION
  // ============================================================
  
  /**
   * Handles smooth page transitions with fade animation
   * @param page - The page to navigate to ("landing" or "signin")
   * 
   * Animation Flow:
   * 1. Fade out current page (opacity 0, move up 20px)
   * 2. Switch page content
   * 3. Scroll to top of new page
   * 4. Fade in new page (opacity 1, move to original position)
   */
  const handleNavigate = (page: "landing" | "signin") => {
    // Don't animate if already on the requested page
    if (page === currentPage) return;

    // PHASE 1: Fade out animation (0.3 seconds)
    if (pageRef.current) {
      gsap.to(pageRef.current, {
        opacity: 0,          // Fade to transparent
        y: -20,              // Move up 20 pixels
        duration: 0.3,       // Animation takes 0.3 seconds
        onComplete: () => {  // After fade out completes...
          
          // PHASE 2: Switch to new page
          setCurrentPage(page);
          
          // PHASE 3: Reset scroll position to top
          window.scrollTo(0, 0);
          
          // PHASE 4: Fade in new page (0.3 seconds)
          gsap.fromTo(
            pageRef.current,
            { opacity: 0, y: 20 },    // Start: invisible, 20px down
            { opacity: 1, y: 0, duration: 0.3 }  // End: visible, original position
          );
        },
      });
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <div className="min-h-screen">
      {/* 
        NAVIGATION BAR
        - Always visible at top
        - Handles page switching
        - Includes theme toggle button
      */}
      <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
      
      {/* 
        PAGE CONTENT CONTAINER
        - Animated container that holds current page
        - Referenced by pageRef for GSAP animations
      */}
      <div ref={pageRef}>
        {/* Conditionally render Landing or Sign In page based on currentPage state */}
        {currentPage === "landing" ? (
          <LandingPage onNavigate={handleNavigate} />
        ) : (
          <SignInPage />
        )}
      </div>
    </div>
  );
}