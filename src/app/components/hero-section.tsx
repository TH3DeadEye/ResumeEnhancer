import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * HERO SECTION COMPONENT
 * 
 * Enhanced main landing section featuring:
 * - Staggered entrance animations for content
 * - Parallax scrolling background blobs
 * - Animated statistics with bounce effect
 * - Hover micro-interactions
 * - Floating badge animation
 */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onGetStarted: () => void; // Function to call when "Get Started" button is clicked
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  // ============================================================
  // REFS - DOM element references for GSAP animations
  // ============================================================
  
  const heroRef = useRef<HTMLElement>(null);           // Entire hero section
  const titleRef = useRef<HTMLHeadingElement>(null);   // Main heading
  const subtitleRef = useRef<HTMLParagraphElement>(null); // Subtitle text
  const buttonsRef = useRef<HTMLDivElement>(null);     // Button container
  const badgeRef = useRef<HTMLDivElement>(null);       // AWS Bedrock badge
  const statsContainerRef = useRef<HTMLDivElement>(null); // Stats container
  const blob1Ref = useRef<HTMLDivElement>(null);       // Background blob 1
  const blob2Ref = useRef<HTMLDivElement>(null);       // Background blob 2
  const blob3Ref = useRef<HTMLDivElement>(null);       // Background blob 3

  // ============================================================
  // STATE - Animated counter values
  // ============================================================
  
  const [stat1, setStat1] = useState(0);   // 0 → 30 seconds
  const [stat2, setStat2] = useState(0);   // 0 → 99.9%
  const [stat3, setStat3] = useState(0);   // 0 → 100%

  // ============================================================
  // ENTRANCE & SCROLL ANIMATIONS
  // ============================================================
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Main timeline for coordinated entrance animations
      const mainTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      // ──────────────────────────────────────────────────────────
      // ANIMATION 1: Floating Badge
      // ──────────────────────────────────────────────────────────
      mainTimeline.fromTo(
        badgeRef.current,
        { y: -30, opacity: 0, scale: 0.8 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.6,
          clearProps: "transform" // Allow continuous floating after entrance
        }
      );

      // Continuous floating animation for badge
      gsap.to(badgeRef.current, {
        y: -10,
        duration: 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true
      });

      // ──────────────────────────────────────────────────────────
      // ANIMATION 2: Main Title with 3D rotation reveal
      // ──────────────────────────────────────────────────────────
      mainTimeline.fromTo(
        titleRef.current,
        { y: 60, opacity: 0, rotateX: -15 },
        { 
          y: 0, 
          opacity: 1, 
          rotateX: 0,
          duration: 1.2,
          ease: "back.out(1.2)"
        },
        "-=0.3"
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 3: Subtitle with blur effect
      // ──────────────────────────────────────────────────────────
      mainTimeline.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0, filter: "blur(10px)" },
        { 
          y: 0, 
          opacity: 1, 
          filter: "blur(0px)",
          duration: 1,
        },
        "-=0.8"
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 4: Buttons with stagger
      // ──────────────────────────────────────────────────────────
      const buttons = buttonsRef.current?.children;
      if (buttons) {
        mainTimeline.fromTo(
          Array.from(buttons),
          { y: 30, opacity: 0, scale: 0.9 },
          { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            duration: 0.6,
            stagger: 0.15, // Each button animates 0.15s after previous
            ease: "back.out(1.5)"
          },
          "-=0.6"
        );
      }

      // ──────────────────────────────────────────────────────────
      // ANIMATION 5: Stats with bounce entrance and stagger
      // ──────────────────────────────────────────────────────────
      const statCards = gsap.utils.toArray(".hero-stat-card");
      mainTimeline.fromTo(
        statCards,
        { y: 50, opacity: 0, scale: 0.8, rotateY: -15 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateY: 0,
          duration: 0.8,
          stagger: 0.2, // Each stat animates 0.2s after previous
          ease: "elastic.out(1, 0.6)" // Bouncy effect
        },
        "-=0.4"
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 6: Counter animation with ease
      // ──────────────────────────────────────────────────────────
      gsap.to({}, {
        duration: 2.5,
        delay: 1.2,
        ease: "power2.out",
        onUpdate: function() {
          const progress = this.progress();
          
          // Smooth counting with easing
          setStat1(Math.floor(30 * progress));
          setStat2(Number((99.9 * progress).toFixed(1)));
          setStat3(Math.floor(100 * progress));
        }
      });

      // ──────────────────────────────────────────────────────────
      // ANIMATION 7: Parallax effect for background blobs
      // ──────────────────────────────────────────────────────────
      gsap.to(blob1Ref.current, {
        y: 100,
        x: -50,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.5
        }
      });

      gsap.to(blob2Ref.current, {
        y: -80,
        x: 60,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 2
        }
      });

      gsap.to(blob3Ref.current, {
        y: 120,
        scale: 1.2,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1
        }
      });

      // ──────────────────────────────────────────────────────────
      // ANIMATION 8: Button hover effects
      // ──────────────────────────────────────────────────────────
      const buttonElements = buttonsRef.current?.querySelectorAll("button");
      buttonElements?.forEach((btn) => {
        btn.addEventListener("mouseenter", () => {
          gsap.to(btn, { scale: 1.05, duration: 0.3, ease: "back.out(2)" });
        });
        btn.addEventListener("mouseleave", () => {
          gsap.to(btn, { scale: 1, duration: 0.3, ease: "power2.out" });
        });
      });

    }, heroRef);

    // Cleanup all animations on unmount
    return () => ctx.revert();
  }, []);

  // ============================================================
  // SMOOTH SCROLL TO CONTACT SECTION
  // ============================================================
  
  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <section
      id="home"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ 
        background: "linear-gradient(to bottom right, var(--bg), var(--bg-light), var(--bg))"
      }}
    >
      {/* ============================================================ */}
      {/* ANIMATED BACKGROUND BLOBS - Parallax scrolling effect */}
      {/* ============================================================ */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blob 1: Top-left with pulse and parallax */}
        <div 
          ref={blob1Ref}
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: "var(--primary)", opacity: 0.1 }}
        ></div>
        
        {/* Blob 2: Bottom-right with delayed pulse and parallax */}
        <div 
          ref={blob2Ref}
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ backgroundColor: "var(--secondary)", opacity: 0.1, animationDelay: "1s" }}
        ></div>
        
        {/* Blob 3: Center with parallax */}
        <div 
          ref={blob3Ref}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ backgroundColor: "var(--primary)", opacity: 0.05 }}
        ></div>
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================================ */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        
        {/* AWS Bedrock Badge - Floating animation */}
        <div 
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-full mb-8 shadow-lg relative z-30"
          style={{ backgroundColor: "color-mix(in oklch, var(--bg-light), transparent 20%)" }}
        >
          <Sparkles className="h-4 w-4" style={{ color: "var(--primary)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
            Powered by AWS Bedrock AI
          </span>
        </div>

        {/* Main Title - Animated with 3D rotation */}
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
          style={{ 
            background: "linear-gradient(to right, var(--primary), var(--secondary), var(--primary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}
        >
          Transform Your Resume
          <br />
          Land Your Dream Job
        </h1>

        {/* Subtitle - Animated with blur effect */}
        <p
          ref={subtitleRef}
          className="text-xl sm:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          AI-powered resume tailoring that automatically optimizes your resume for any job
          description, helping you bypass ATS filters and secure more interviews.
        </p>

        {/* Call-to-Action Buttons - Staggered animation with hover effect */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
            style={{ 
              background: "linear-gradient(to right, var(--primary), var(--secondary))",
              color: "var(--bg-light)"
            }}
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToContact}
            className="border-2 text-lg px-8 py-6 transition-all"
            style={{ 
              borderColor: "var(--border)",
              backgroundColor: "var(--bg-light)",
              color: "var(--text)"
            }}
          >
            Contact Us
          </Button>
        </div>

        {/* ============================================================ */}
        {/* ANIMATED STATISTICS - Staggered bounce entrance */}
        {/* ============================================================ */}
        <div ref={statsContainerRef} className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          
          {/* Stat 1: AI Processing Time */}
          <div 
            className="hero-stat-card backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            style={{ backgroundColor: "color-mix(in oklch, var(--bg-light), transparent 20%)" }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color: "var(--primary)" }}>
              {stat1}s
            </div>
            <div style={{ color: "var(--text-muted)" }}>AI Processing Time</div>
          </div>
          
          {/* Stat 2: ATS Compatibility */}
          <div 
            className="hero-stat-card backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            style={{ backgroundColor: "color-mix(in oklch, var(--bg-light), transparent 20%)" }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color: "var(--secondary)" }}>
              {stat2}%
            </div>
            <div style={{ color: "var(--text-muted)" }}>ATS Compatibility</div>
          </div>
          
          {/* Stat 3: Security */}
          <div 
            className="hero-stat-card backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            style={{ backgroundColor: "color-mix(in oklch, var(--bg-light), transparent 20%)" }}
          >
            <div className="text-4xl font-bold mb-2" style={{ color: "var(--success)" }}>
              {stat3}%
            </div>
            <div style={{ color: "var(--text-muted)" }}>Secure & Private</div>
          </div>
        </div>
      </div>
    </section>
  );
}
