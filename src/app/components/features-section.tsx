import { useEffect, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Bot, Zap, Shield, FileText, TrendingUp, Clock } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * FEATURES SECTION COMPONENT
 * 
 * Displays 6 feature cards with scroll-based animations
 * - Each card animates individually as you scroll
 * - Animations reverse when scrolling up
 * - Uses GSAP ScrollTrigger for scroll-linked animations
 */

// Register GSAP plugin for scroll-based animations
gsap.registerPlugin(ScrollTrigger);

// ============================================================
// FEATURES DATA
// To add/edit features: modify this array
// ============================================================
const features = [
  {
    icon: Bot,
    title: "AI-Powered Tailoring",
    description:
      "Advanced Amazon Bedrock AI analyzes job descriptions and optimizes your resume with relevant keywords and skills.",
    color: "from-blue-500 to-cyan-500",  // Gradient colors for icon background
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Get your tailored resume in under 30 seconds. Our serverless architecture ensures instant processing.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description:
      "Your data is encrypted at rest and in transit. Built on AWS with enterprise-grade security standards.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: FileText,
    title: "PDF Support",
    description:
      "Upload your resume in PDF format and download the tailored version ready to submit immediately.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: TrendingUp,
    title: "ATS Optimization",
    description:
      "Bypass Applicant Tracking Systems with AI-optimized formatting and keyword placement.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Clock,
    title: "Save Hours",
    description:
      "Stop manually customizing resumes. Let AI do the heavy lifting while you focus on interview prep.",
    color: "from-pink-500 to-rose-500",
  },
];

export function FeaturesSection() {
  // ============================================================
  // REFS - For GSAP animations
  // ============================================================
  
  const sectionRef = useRef<HTMLElement>(null);  // Entire section
  const titleRef = useRef<HTMLDivElement>(null); // Section title
  const cardsRef = useRef<HTMLDivElement>(null); // Cards container

  // ============================================================
  // SCROLL-TRIGGERED ANIMATIONS
  // ============================================================
  
  useEffect(() => {
    // GSAP context for cleanup
    const ctx = gsap.context(() => {
      
      // ──────────────────────────────────────────────────────────
      // ANIMATION 1: Section Title
      // ──────────────────────────────────────────────────────────
      /**
       * Title fades in and slides up as you scroll
       * 
       * KEY SCROLLTRIGGER CONCEPTS:
       * - trigger: Element to watch for scroll position
       * - start: "top 80%" = when element's top reaches 80% down the viewport
       * - end: "top 30%" = when element's top reaches 30% down the viewport
       * - scrub: Animation progress tied to scroll position (smooth follow)
       * - toggleActions: "play none none reverse" = play on enter, reverse on leave
       */
      gsap.fromTo(
        titleRef.current,
        { y: 80, opacity: 0 },  // FROM: 80px below, invisible
        {
          y: 0,                 // TO: original position, visible
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",   // Start animation when title is 80% down viewport
            end: "top 30%",     // Finish when title is 30% down viewport
            scrub: 1,           // Smooth scroll-linked animation (1 second lag)
            toggleActions: "play none none reverse", // Reverse animation on scroll up
          },
        }
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 2: Feature Cards (Individual animations)
      // ──────────────────────────────────────────────────────────
      /**
       * Each card animates independently as it enters viewport
       * - Cards slide up, fade in, and scale from 90% to 100%
       * - Creates a staggered cascading effect
       */
      
      // Convert all elements with "feature-card" class to array
      const cards = gsap.utils.toArray(".feature-card");
      
      // Loop through each card and create individual animation
      cards.forEach((card: any, index: number) => {
        gsap.fromTo(
          card,
          {
            y: 100,        // Start 100px below
            opacity: 0,    // Start invisible
            scale: 0.9,    // Start at 90% size
          },
          {
            y: 0,          // End at original position
            opacity: 1,    // End fully visible
            scale: 1,      // End at 100% size
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,        // Each card triggers its own animation
              start: "top 85%",     // Start when card is 85% down viewport
              end: "top 30%",       // End when card is 30% down viewport
              scrub: 1.5,           // Slightly slower scroll-link (1.5 second lag)
              toggleActions: "play none none reverse", // Reverse on scroll up
            },
          }
        );
      });
    }, sectionRef);

    // Cleanup: Remove all ScrollTriggers when component unmounts
    return () => ctx.revert();
  }, []); // Run once on mount

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <section id="features" ref={sectionRef} className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================ */}
        {/* SECTION TITLE - Animated on scroll */}
        {/* ============================================================ */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Powerful Features for Job Seekers
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need to create perfect, tailored resumes that get noticed by recruiters
            and pass ATS filters.
          </p>
        </div>

        {/* ============================================================ */}
        {/* FEATURE CARDS GRID - Each card has "feature-card" class */}
        {/* ============================================================ */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon; // Get icon component from feature data
            
            return (
              <Card
                key={index}
                // IMPORTANT: "feature-card" class is used by GSAP to target this element
                className="feature-card border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900"
              >
                <CardContent className="p-8">
                  {/* Icon with gradient background */}
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Feature title */}
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  
                  {/* Feature description */}
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
