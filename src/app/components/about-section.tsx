import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Target, Users, Rocket } from "lucide-react";

/**
 * ABOUT SECTION COMPONENT
 * 
 * Displays information about the project with:
 * - Split layout (image left, content right)
 * - Scroll-based animations that reverse on scroll up
 * - Individual animations for value cards
 * - Team and mission information
 */

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  // ============================================================
  // REFS - For GSAP scroll animations
  // ============================================================
  
  const sectionRef = useRef<HTMLElement>(null);   // Entire section (trigger point)
  const imageRef = useRef<HTMLDivElement>(null);  // Left side image
  const contentRef = useRef<HTMLDivElement>(null); // Right side text content

  // ============================================================
  // SCROLL-TRIGGERED ANIMATIONS
  // ============================================================
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // ──────────────────────────────────────────────────────────
      // ANIMATION 1: Image (Left Side)
      // ──────────────────────────────────────────────────────────
      /**
       * Image slides in from the left while fading in and scaling up
       * 
       * ScrollTrigger settings:
       * - Triggers when section enters viewport at 75%
       * - Animation completes when section is at 25% of viewport
       * - scrub: 1.2 = smooth scroll-linked animation with 1.2s lag
       * - toggleActions: Reverses animation when scrolling up
       */
      gsap.fromTo(
        imageRef.current,
        {
          x: -150,      // Start 150px to the left
          opacity: 0,   // Start invisible
          scale: 0.9,   // Start at 90% size
        },
        {
          x: 0,         // End at original position
          opacity: 1,   // End fully visible
          scale: 1,     // End at 100% size
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,  // Watch the section element
            start: "top 75%",   // When section top hits 75% of viewport
            end: "top 25%",     // Complete when section top hits 25%
            scrub: 1.2,         // Smooth scroll-linked (1.2 second lag for smoothness)
            toggleActions: "play none none reverse", // Reverse on scroll up
          },
        }
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 2: Content (Right Side)
      // ──────────────────────────────────────────────────────────
      /**
       * Content slides in from the right (opposite of image)
       * Creates a "split reveal" effect
       */
      gsap.fromTo(
        contentRef.current,
        {
          x: 150,       // Start 150px to the right
          opacity: 0,
          scale: 0.9,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "top 25%",
            scrub: 1.2,
            toggleActions: "play none none reverse",
          },
        }
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 3: Value Cards (Individual animations)
      // ──────────────────────────────────────────────────────────
      /**
       * Each value card (Mission, Team, Vision) animates individually
       * Creates a cascading effect as they enter viewport
       */
      const valueCards = gsap.utils.toArray(".about-value-card");
      
      valueCards.forEach((card: any, index: number) => {
        gsap.fromTo(
          card,
          {
            x: 50,        // Start 50px to the right
            opacity: 0,   // Start invisible
          },
          {
            x: 0,         // End at original position
            opacity: 1,   // End fully visible
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,      // Each card triggers independently
              start: "top 90%",   // Start when card is 90% down viewport
              end: "top 40%",     // Complete when card is 40% down
              scrub: 1,           // Quick scroll-link (1 second lag)
              toggleActions: "play none none reverse",
            },
          }
        );
      });
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
      className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* ============================================================ */}
          {/* LEFT SIDE: Team Image with Badge */}
          {/* ============================================================ */}
          <div ref={imageRef} className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG9mZmljZXxlbnwxfHx8fDE3NzAxNTUwNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay for better text contrast */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20"></div>
            </div>
            
            {/* Team Badge - Positioned bottom-right */}
            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">KMR</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Team</div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT SIDE: Content */}
          {/* ============================================================ */}
          <div ref={contentRef}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              About Our Project
            </h2>
            
            {/* Introduction paragraphs */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              The <span className="font-semibold text-blue-600 dark:text-blue-400">AI Resume Enhancer</span> is a
              cutting-edge, cloud-native web application developed as part of the{" "}
              <span className="font-semibold">COMP 2154 System Development Project</span>. Our
              mission is to revolutionize the job application process for students and
              professionals.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Built on a serverless AWS architecture using Lambda, S3, DynamoDB, and Amazon
              Bedrock, our platform leverages Generative AI to automatically tailor resumes to
              specific job descriptions, helping candidates bypass ATS filters and increase their
              interview success rate.
            </p>

            {/* ============================================================ */}
            {/* VALUE CARDS - Mission, Team, Vision */}
            {/* Each has "about-value-card" class for GSAP targeting */}
            {/* ============================================================ */}
            <div className="space-y-4">
              
              {/* Mission Card */}
              <div className="about-value-card flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
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
              <div className="about-value-card flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
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
              <div className="about-value-card flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
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
