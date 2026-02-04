import { useState, useEffect, useRef } from "react";
import { Navigation } from "./components/navigation";
import { LandingPage } from "./components/landing-page";
import { SignInPage } from "./components/signin-page";
import gsap from "gsap";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"landing" | "signin">("landing");
  const pageRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (page: "landing" | "signin") => {
    if (page === currentPage) return;

    // Page transition animation
    if (pageRef.current) {
      gsap.to(pageRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => {
          setCurrentPage(page);
          
          // Scroll to top
          window.scrollTo(0, 0);
          
          // Fade in new page
          gsap.fromTo(
            pageRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.3 }
          );
        },
      });
    }
  };

  return (
    <div className="size-full">
      <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
      <div ref={pageRef}>
        {currentPage === "landing" ? (
          <LandingPage onGetStarted={() => handleNavigate("signin")} />
        ) : (
          <SignInPage />
        )}
      </div>
    </div>
  );
}
