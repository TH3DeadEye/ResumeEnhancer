'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Target, Users, Rocket } from "lucide-react";

/**
 * ABOUT SECTION COMPONENT
 * 
 * Enhanced about section featuring:
 * - Parallax split-screen reveal (image left, content right)
 * - 3D rotation effects on scroll
 * - Staggered value cards with hover animations
 * - Badge pulse effect
 * - Smooth reversible scroll animations
 */

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  // ============================================================
  // REFS - For GSAP scroll animations
  // ============================================================
  
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // SCROLL-TRIGGERED ANIMATIONS
  // ============================================================
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // ──────────────────────────────────────────────────────────
      // ANIMATION 1: Image with parallax and 3D rotation
      // ──────────────────────────────────────────────────────────
      gsap.fromTo(
        imageRef.current,
        {
          x: -180,
          opacity: 0,
          scale: 0.85,
          rotateY: -20,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          rotateY: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 30%",
            scrub: 1.5,
            toggleActions: "play none none reverse",
          },
        }
      );

      // Add subtle parallax movement to image on scroll
      gsap.to(imageRef.current, {
        y: -40,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        }
      });

      // ──────────────────────────────────────────────────────────
      // ANIMATION 2: Content with parallax and 3D rotation
      // ──────────────────────────────────────────────────────────
      gsap.fromTo(
        contentRef.current,
        {
          x: 180,
          opacity: 0,
          scale: 0.85,
          rotateY: 20,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          rotateY: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 30%",
            scrub: 1.5,
            toggleActions: "play none none reverse",
          },
        }
      );

      // Add subtle parallax movement to content on scroll
      gsap.to(contentRef.current, {
        y: -50,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        }
      });

      // ──────────────────────────────────────────────────────────
      // ANIMATION 3: Simple badge fade in (removed complex animations)
      // ──────────────────────────────────────────────────────────
      gsap.fromTo(
        badgeRef.current,
        {
          scale: 0.8,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 4: Value Cards with stagger and 3D effects
      // ──────────────────────────────────────────────────────────
      const valueCards = gsap.utils.toArray(".about-value-card");
      
      valueCards.forEach((card: any, index: number) => {
        // Entrance animation - Faster and simpler
        gsap.fromTo(
          card,
          {
            x: 60,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
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
        // ANIMATION 5: Simple hover effects - Respond to entire card area
        // ──────────────────────────────────────────────────────────
        const cardElement = card as HTMLElement;
        const iconContainer = cardElement.querySelector(".about-value-icon");
        
        // Mouse enter - Quick lift with background
        cardElement.addEventListener("mouseenter", () => {
          gsap.to(card, {
            x: 8,
            scale: 1.02,
            backgroundColor: "rgba(59, 130, 246, 0.05)",
            duration: 0.2,
            ease: "power1.out"
          });
          
          // Quick icon scale
          if (iconContainer) {
            gsap.to(iconContainer, {
              scale: 1.1,
              duration: 0.2,
              ease: "back.out(2)"
            });
          }
        });

        // Mouse leave - Quick return
        cardElement.addEventListener("mouseleave", () => {
          gsap.to(card, {
            x: 0,
            scale: 1,
            backgroundColor: "transparent",
            duration: 0.2,
            ease: "power1.out"
          });
          
          if (iconContainer) {
            gsap.to(iconContainer, {
              scale: 1,
              duration: 0.2,
              ease: "power1.out"
            });
          }
        });
      });

      // ──────────────────────────────────────────────────────────
      // ANIMATION 6: Heading text reveal with split
      // ──────────────────────────────────────────────────────────
      const heading = contentRef.current?.querySelector("h2");
      if (heading) {
        gsap.fromTo(
          heading,
          { 
            opacity: 0, 
            y: 30,
            filter: "blur(5px)"
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: heading,
              start: "top 85%",
              end: "top 60%",
              scrub: 1,
            }
          }
        );
      }

    }, sectionRef);

    // Cleanup ScrollTriggers on unmount
    return () => ctx.revert();
  }, []);

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <section 
      id="about" 
      ref={sectionRef} 
      className="py-16 sm:py-24"
      style={{ 
        perspective: "1000px",
        background: "linear-gradient(to bottom right, var(--bg-dark), var(--bg))"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          
          {/* ============================================================ */}
          {/* LEFT SIDE: Team Image with animated badge */}
          {/* ============================================================ */}
          <div ref={imageRef} className="relative" style={{ transformStyle: "preserve-3d" }}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG9mZmljZXxlbnwxfHx8fDE3NzAxNTUwNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay for visual depth */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20"></div>
            </div>
            
            {/* Team Badge - Animated with pulse and bounce */}
            <div 
              ref={badgeRef}
              className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">KMR</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Team</div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT SIDE: Content with animated elements */}
          {/* ============================================================ */}
          <div ref={contentRef} style={{ transformStyle: "preserve-3d" }}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4 lg:px-0" style={{ color: "var(--text)" }}>
              About Our Project
            </h2>
            
            {/* Introduction paragraphs */}
            <p className="text-base sm:text-lg mb-6 leading-relaxed px-4 lg:px-0" style={{ color: "var(--text-muted)" }}>
              The <span className="font-semibold" style={{ color: "var(--primary)" }}>AI Resume Enhancer</span> is a
              cutting-edge, cloud-native web application developed as part of the{" "}
              <span className="font-semibold">COMP 2154 System Development Project</span>. Our
              mission is to revolutionize the job application process for students and
              professionals.
            </p>
            <p className="text-base sm:text-lg mb-8 leading-relaxed px-4 lg:px-0" style={{ color: "var(--text-muted)" }}>
              Built on a serverless AWS architecture using Lambda, S3, DynamoDB, and Amazon
              Bedrock, our platform leverages Generative AI to automatically tailor resumes to
              specific job descriptions, helping candidates bypass ATS filters and increase their
              interview success rate.
            </p>

            {/* ============================================================ */}
            {/* VALUE CARDS - Mission, Team, Vision with hover effects */}
            {/* ============================================================ */}
            <div className="space-y-4">
              
              {/* Mission Card */}
              <div className="about-value-card flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer">
                <div className="about-value-icon w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                    Our Mission
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Eliminate application fatigue and help job seekers land more interviews with
                    AI-powered resume optimization.
                  </p>
                </div>
              </div>

              {/* Team Card */}
              <div className="about-value-card flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer">
                <div className="about-value-icon w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                    The Team
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Developed by Team KMR: Arman Milani and Ramtin Loghmani, dedicated to building
                    innovative solutions.
                  </p>
                </div>
              </div>

              {/* Vision Card */}
              <div className="about-value-card flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer">
                <div className="about-value-icon w-12 h-12 bg-pink-100 dark:bg-pink-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Rocket className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                    Our Vision
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create a scalable, serverless platform that evolves into an autonomous job
                    application assistant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
