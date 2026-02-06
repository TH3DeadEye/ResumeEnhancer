'use client';

import { useEffect, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Bot, Zap, Shield, FileText, TrendingUp, Clock } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * FEATURES SECTION COMPONENT
 * 
 * Enhanced features display with:
 * - Staggered scroll-triggered animations
 * - 3D hover tilt and lift effects
 * - Icon rotation animations
 * - Parallax scroll effects
 * - Smooth reversible animations
 */

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ============================================================
// FEATURES DATA - Edit here to add/modify features
// ============================================================
const features = [
  {
    icon: Bot,
    title: "AI-Powered Tailoring",
    description:
      "Advanced Amazon Bedrock AI analyzes job descriptions and optimizes your resume with relevant keywords and skills.",
    color: "from-blue-500 to-cyan-500",
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
  
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // SCROLL-TRIGGERED ANIMATIONS
  // ============================================================
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // ──────────────────────────────────────────────────────────
      // ANIMATION 1: Section Title - Fade and slide from below
      // ──────────────────────────────────────────────────────────
      gsap.fromTo(
        titleRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
            end: "top 50%",
            scrub: 1,
            toggleActions: "play none none reverse",
          },
        }
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 2: Feature Cards - Enhanced entrance with 3D effect
      // ──────────────────────────────────────────────────────────
      const cards = gsap.utils.toArray(".feature-card");
      
      cards.forEach((card: any, index: number) => {
        // Entrance animation - Faster and more responsive
        gsap.fromTo(
          card,
          {
            y: 80,
            opacity: 0,
            scale: 0.9,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // ──────────────────────────────────────────────────────────
        // ANIMATION 3: Simple hover interactions - Fast and smooth
        // ──────────────────────────────────────────────────────────
        const cardElement = card as HTMLElement;
        const iconElement = cardElement.querySelector(".feature-icon");
        
        // Mouse enter - Quick lift
        cardElement.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -8,
            scale: 1.02,
            duration: 0.2,
            ease: "power1.out"
          });
          
          // Simple icon rotation
          if (iconElement) {
            gsap.to(iconElement, {
              rotation: 360,
              duration: 0.4,
              ease: "power2.out"
            });
          }
        });

        // Mouse leave - Quick return
        cardElement.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.2,
            ease: "power1.out"
          });
        });
      });

    }, sectionRef);

    // Cleanup ScrollTriggers on unmount
    return () => ctx.revert();
  }, []);

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <section id="features" ref={sectionRef} className="py-24" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================ */}
        {/* SECTION TITLE - Animated on scroll */}
        {/* ============================================================ */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "var(--text)" }}>
            Powerful Features for Job Seekers
          </h2>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Everything you need to create perfect, tailored resumes that get noticed by recruiters
            and pass ATS filters.
          </p>
        </div>

        {/* ============================================================ */}
        {/* FEATURE CARDS GRID - Staggered animations with hover effects */}
        {/* ============================================================ */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <Card
                key={index}
                className="feature-card border-none shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                style={{ 
                  transformStyle: "preserve-3d",
                  background: "linear-gradient(to bottom right, var(--bg-light), var(--bg))"
                }}
              >
                <CardContent className="p-8">
                  {/* Icon with gradient background and rotation animation */}
                  <div
                    className="feature-icon w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                    style={{
                      background: index % 3 === 0 
                        ? "var(--primary)" 
                        : index % 3 === 1 
                        ? "var(--secondary)" 
                        : "var(--success)"
                    }}
                  >
                    <Icon className="h-8 w-8" style={{ color: "var(--bg-light)" }} />
                  </div>
                  
                  {/* Feature title */}
                  <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--text)" }}>
                    {feature.title}
                  </h3>
                  
                  {/* Feature description */}
                  <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
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
