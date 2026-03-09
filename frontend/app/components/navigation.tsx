'use client';

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { gsap, ScrollTrigger } from "@/app/lib/gsap";
import { FillButton } from "./ui/fill-button";

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navigation({ onNavigate, currentPage }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // ── Scroll detection & progress ──────────────────────────────────────────

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.scrollY / windowHeight) * 100;

      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          width: `${scrollProgress}%`,
          duration: 0.2,
          ease: "none",
        });
      }

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

  // ── Entrance animation ────────────────────────────────────────────────────

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );

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
            delay: 0.5,
          }
        );
      }
    }
  }, []);

  // ── Logo morph scroll animation ───────────────────────────────────────────
  // hero-wordmark (#hero-wordmark) fades out as user scrolls;
  // nav-wordmark (#nav-wordmark) fades in, creating the illusion of morphing.

  useEffect(() => {
    if (currentPage !== "landing") return;

    const ctx = gsap.context(() => {
      const heroWordmark = document.getElementById("hero-wordmark");
      const navWordmark  = document.getElementById("nav-wordmark");

      if (!heroWordmark || !navWordmark) return;

      const triggerConfig: ScrollTrigger.Vars = {
        trigger: "#home",
        start: "top top",
        end: "+=200",
        scrub: true,
      };

      // Hero wordmark: fade out + subtle scale down
      gsap.fromTo(
        heroWordmark,
        { opacity: 1, scale: 1 },
        { opacity: 0, scale: 0.92, ease: "none", scrollTrigger: triggerConfig }
      );

      // Nav wordmark: fade in + scale from slightly large to 1
      gsap.fromTo(
        navWordmark,
        { opacity: 0, scale: 1.35 },
        { opacity: 1, scale: 1, ease: "none", scrollTrigger: triggerConfig }
      );
    });

    return () => ctx.revert();
  }, [currentPage]);

  // ── Mobile menu animation ─────────────────────────────────────────────────

  useEffect(() => {
    if (mobileMenuRef.current) {
      if (isMobileMenuOpen) {
        gsap.fromTo(
          mobileMenuRef.current,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" }
        );
        const items =
          mobileMenuRef.current.querySelectorAll(".mobile-menu-item");
        gsap.fromTo(
          Array.from(items),
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.3,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.1,
          }
        );
      } else {
        gsap.to(mobileMenuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }
    }
  }, [isMobileMenuOpen]);

  // ── Smooth scroll ─────────────────────────────────────────────────────────

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Scroll progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]">
        <div
          ref={progressBarRef}
          className="h-full"
          style={{ width: "0%", backgroundColor: "var(--accent)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div
            ref={logoRef}
            className="cursor-pointer select-none"
            onClick={() => onNavigate("landing")}
          >
            <span
              id="nav-wordmark"
              className="text-xl tracking-tight"
              style={{ color: "var(--text-primary)", fontWeight: 600, opacity: 0 }}
            >
              Resumence
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {currentPage === "landing" ? (
              <>
                {["home", "features", "about", "contact"].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="nav-menu-item relative text-sm transition-colors duration-200"
                    style={{
                      color:
                        activeSection === section
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                      fontWeight: activeSection === section ? 500 : 400,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--text-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        activeSection === section
                          ? "var(--text-primary)"
                          : "var(--text-secondary)")
                    }
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                    {activeSection === section && (
                      <span
                        className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full"
                        style={{ backgroundColor: "var(--accent)" }}
                      />
                    )}
                  </button>
                ))}
              </>
            ) : (
              <button
                onClick={() => onNavigate("landing")}
                className="nav-menu-item text-sm transition-colors duration-200"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-secondary)")
                }
              >
                Back to Home
              </button>
            )}

            <FillButton
              onClick={() => onNavigate("signin")}
              className="nav-menu-item text-sm font-medium"
              style={{
                backgroundColor: "var(--accent)",
                color: "white",
                borderRadius: "var(--radius-md)",
                padding: "10px 20px",
              }}
            >
              Sign In
            </FillButton>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative z-50 p-2 rounded-lg transition-colors touch-manipulation"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              style={{
                color: "var(--text-primary)",
                minWidth: "44px",
                minHeight: "44px",
              }}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden border-t overflow-hidden"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="px-4 py-5 space-y-1">
              {currentPage === "landing" ? (
                <>
                  {["home", "features", "about", "contact"].map((section) => (
                    <button
                      key={section}
                      onClick={() => scrollToSection(section)}
                      className="mobile-menu-item block w-full text-left py-3 px-4 rounded-lg text-sm transition-all touch-manipulation"
                      style={{
                        color:
                          activeSection === section
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                        backgroundColor:
                          activeSection === section
                            ? "var(--accent-subtle)"
                            : "transparent",
                        fontWeight: activeSection === section ? 500 : 400,
                        minHeight: "44px",
                      }}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  ))}
                </>
              ) : (
                <button
                  onClick={() => onNavigate("landing")}
                  className="mobile-menu-item block w-full text-left py-3 px-4 rounded-lg text-sm"
                  style={{ color: "var(--text-secondary)", minHeight: "44px" }}
                >
                  Back to Home
                </button>
              )}

              <FillButton
                onClick={() => onNavigate("signin")}
                className="mobile-menu-item block w-full text-center py-3 px-4 text-sm font-medium mt-2 touch-manipulation"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "white",
                  borderRadius: "var(--radius-md)",
                  minHeight: "44px",
                }}
              >
                Sign In
              </FillButton>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
