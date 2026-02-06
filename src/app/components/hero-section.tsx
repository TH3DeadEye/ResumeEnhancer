import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";

/**
 * HERO SECTION COMPONENT
 * 
 * The main landing section with:
 * - Animated title, subtitle, and buttons
 * - Counting statistics (30s, 99.9%, 100%)
 * - Animated gradient background blobs
 * - Call-to-action buttons
 */

interface HeroSectionProps {
  onGetStarted: () => void; // Function to call when "Get Started" button is clicked
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  // ============================================================
  // REFS - References to DOM elements for GSAP animations
  // ============================================================
  
  const heroRef = useRef<HTMLElement>(null);           // Entire hero section
  const titleRef = useRef<HTMLHeadingElement>(null);   // Main heading
  const subtitleRef = useRef<HTMLParagraphElement>(null); // Subtitle text
  const buttonsRef = useRef<HTMLDivElement>(null);     // Button container
  const stat1Ref = useRef<HTMLDivElement>(null);       // "30s" stat
  const stat2Ref = useRef<HTMLDivElement>(null);       // "99.9%" stat
  const stat3Ref = useRef<HTMLDivElement>(null);       // "100%" stat

  // ============================================================
  // STATE - Counter values for animated statistics
  // ============================================================
  
  const [stat1, setStat1] = useState(0);   // Counts from 0 to 30 (seconds)
  const [stat2, setStat2] = useState(0);   // Counts from 0 to 99.9 (percentage)
  const [stat3, setStat3] = useState(0);   // Counts from 0 to 100 (percentage)

  // ============================================================
  // ENTRANCE ANIMATIONS - Runs once when component mounts
  // ============================================================
  
  useEffect(() => {
    // GSAP context ensures cleanup when component unmounts
    const ctx = gsap.context(() => {
      
      /**
       * TIMELINE: Orchestrates multiple animations in sequence
       * Timeline allows animations to overlap using negative position values
       */
      const tl = gsap.timeline();

      // ──────────────────────────────────────────────────────────
      // ANIMATION 1: Main Title
      // ──────────────────────────────────────────────────────────
      tl.fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },  // FROM: 50px below, invisible
        { 
          y: 0,                 // TO: original position
          opacity: 1,           // fully visible
          duration: 1,          // takes 1 second
          ease: "power3.out"    // smooth deceleration
        }
      )
      // ──────────────────────────────────────────────────────────
      // ANIMATION 2: Subtitle
      // ──────────────────────────────────────────────────────────
        .fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },  // Starts 30px below
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            ease: "power3.out" 
          },
          "-=0.5"  // OVERLAP: Start 0.5 seconds before title finishes
                   // This creates a cascading effect
        )
      // ──────────────────────────────────────────────────────────
      // ANIMATION 3: Buttons
      // ──────────────────────────────────────────────────────────
        .fromTo(
          buttonsRef.current,
          { y: 20, opacity: 0 },  // Starts 20px below
          { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            ease: "power3.out" 
          },
          "-=0.4"  // OVERLAP: Start 0.4 seconds before subtitle finishes
        );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 4: Counter Statistics (30s, 99.9%, 100%)
      // ──────────────────────────────────────────────────────────
      /**
       * This animation counts up the statistics from 0 to their target values
       * - Uses an empty object as target (we only care about the progress)
       * - onUpdate callback fires on every frame
       * - We calculate values based on animation progress (0 to 1)
       */
      gsap.to({}, {
        duration: 2,      // Count takes 2 seconds
        delay: 1,         // Wait 1 second before starting (let other animations finish)
        onUpdate: function() {
          const progress = this.progress();  // Returns 0 to 1 (0% to 100% complete)
          
          // Calculate current value based on progress
          setStat1(Math.floor(30 * progress));           // 0 → 30
          setStat2(Number((99.9 * progress).toFixed(1))); // 0 → 99.9 (with decimal)
          setStat3(Math.floor(100 * progress));          // 0 → 100
        }
      });
    }, heroRef);

    // Cleanup: Revert all GSAP animations when component unmounts
    return () => ctx.revert();
  }, []); // Empty array = run once on mount

  // ============================================================
  // SCROLL TO CONTACT FUNCTION
  // ============================================================
  
  /**
   * Smoothly scrolls to the Contact section
   * Triggered by "Contact Us" button
   */
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"
    >
      {/* ============================================================ */}
      {/* BACKGROUND ANIMATED BLOBS */}
      {/* Creates depth and visual interest with pulsing gradient circles */}
      {/* ============================================================ */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top-left blue blob with pulse animation */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Bottom-right purple blob with delayed pulse */}
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Center pink blob (static) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-400/10 dark:bg-pink-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================================ */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        
        {/* AWS Bedrock Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full mb-8 shadow-lg relative z-30">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Powered by AWS Bedrock AI
          </span>
        </div>

        {/* Main Title - Animated with GSAP */}
        <h1
          ref={titleRef}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
        >
          Transform Your Resume
          <br />
          Land Your Dream Job
        </h1>

        {/* Subtitle - Animated with GSAP */}
        <p
          ref={subtitleRef}
          className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          AI-powered resume tailoring that automatically optimizes your resume for any job
          description, helping you bypass ATS filters and secure more interviews.
        </p>

        {/* Call-to-Action Buttons - Animated with GSAP */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Primary CTA: Get Started */}
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {/* Secondary CTA: Contact Us */}
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToContact}
            className="border-2 border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-400 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-lg px-8 py-6 bg-white dark:bg-gray-800"
          >
            Contact Us
          </Button>
        </div>

        {/* ============================================================ */}
        {/* ANIMATED STATISTICS */}
        {/* Numbers count up from 0 using GSAP */}
        {/* ============================================================ */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          
          {/* Stat 1: AI Processing Time */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div ref={stat1Ref} className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {stat1}s {/* Displays current counter value */}
            </div>
            <div className="text-gray-600 dark:text-gray-400">AI Processing Time</div>
          </div>
          
          {/* Stat 2: ATS Compatibility */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div ref={stat2Ref} className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {stat2}% {/* Displays with decimal point */}
            </div>
            <div className="text-gray-600 dark:text-gray-400">ATS Compatibility</div>
          </div>
          
          {/* Stat 3: Security */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div ref={stat3Ref} className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">
              {stat3}%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Secure & Private</div>
          </div>
        </div>
      </div>
    </section>
  );
}
