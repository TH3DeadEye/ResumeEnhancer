'use client';

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Mail, MessageSquare, Send } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "sonner";

/**
 * CONTACT SECTION COMPONENT
 * 
 * Enhanced contact form featuring:
 * - Input field focus animations with glow effects
 * - Staggered form field entrance
 * - Button pulse and hover animations
 * - Contact card animations
 * - Form validation with smooth feedback
 */

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export function ContactSection() {
  // ============================================================
  // REFS & STATE
  // ============================================================
  
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const contactInfoRef = useRef<HTMLDivElement>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // ============================================================
  // SCROLL & ENTRANCE ANIMATIONS
  // ============================================================
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // ──────────────────────────────────────────────────────────
      // ANIMATION 1: Title fade and slide
      // ──────────────────────────────────────────────────────────
      gsap.fromTo(
        titleRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 2: Contact info cards with stagger
      // ──────────────────────────────────────────────────────────
      const contactCards = contactInfoRef.current?.querySelectorAll(".contact-info-card");
      if (contactCards) {
        gsap.fromTo(
          Array.from(contactCards),
          { x: -60, opacity: 0, scale: 0.9 },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: contactInfoRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // ──────────────────────────────────────────────────────────
      // ANIMATION 3: Form fields with stagger from right
      // ──────────────────────────────────────────────────────────
      const formFields = formRef.current?.querySelectorAll(".form-field");
      if (formFields) {
        gsap.fromTo(
          Array.from(formFields),
          { x: 60, opacity: 0, rotateY: -10 },
          {
            x: 0,
            opacity: 1,
            rotateY: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: formRef.current,
              start: "top 80%",
            },
          }
        );
      }

      // ──────────────────────────────────────────────────────────
      // ANIMATION 4: Submit button with bounce
      // ──────────────────────────────────────────────────────────
      const submitButton = formRef.current?.querySelector(".submit-button");
      if (submitButton) {
        gsap.fromTo(
          submitButton,
          { y: 30, opacity: 0, scale: 0.8 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)",
            scrollTrigger: {
              trigger: submitButton,
              start: "top 90%",
            },
          }
        );
      }

      // ──────────────────────────────────────────────────────────
      // ANIMATION 5: Input focus animations
      // ──────────────────────────────────────────────────────────
      const inputs = formRef.current?.querySelectorAll("input, textarea");
      inputs?.forEach((input) => {
        // Focus - Glow and scale
        input.addEventListener("focus", () => {
          gsap.to(input, {
            scale: 1.02,
            boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
            duration: 0.3,
            ease: "power2.out"
          });
        });

        // Blur - Return to normal
        input.addEventListener("blur", () => {
          gsap.to(input, {
            scale: 1,
            boxShadow: "none",
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });

      // ──────────────────────────────────────────────────────────
      // ANIMATION 6: Hover effects for contact cards
      // ──────────────────────────────────────────────────────────
      contactCards?.forEach((card) => {
        const icon = card.querySelector(".contact-icon");
        
        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -5,
            scale: 1.03,
            duration: 0.3,
            ease: "power2.out"
          });
          
          if (icon) {
            gsap.to(icon, {
              rotation: 360,
              scale: 1.1,
              duration: 0.5,
              ease: "back.out(2)"
            });
          }
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
          
          if (icon) {
            gsap.to(icon, {
              rotation: 0,
              scale: 1,
              duration: 0.3,
              ease: "power2.out"
            });
          }
        });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ============================================================
  // FORM HANDLERS
  // ============================================================
  
  /**
   * Handles form submission with API call
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Animate submit button on click
    const submitButton = formRef.current?.querySelector(".submit-button");
    if (submitButton) {
      gsap.to(submitButton, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    
    // Call API
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        
        // Reset form with animation
        gsap.to(formRef.current, {
          opacity: 0.5,
          duration: 0.2,
          onComplete: () => {
            setFormData({ name: "", email: "", message: "" });
            gsap.to(formRef.current, {
              opacity: 1,
              duration: 0.3
            });
          }
        });
      } else {
        toast.info(data.message);
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  /**
   * Updates form state on input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ 
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <section id="contact" ref={sectionRef} className="py-24" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================ */}
        {/* SECTION HEADER - Animated entrance */}
        {/* ============================================================ */}
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Get In Touch
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon
            as possible.
          </p>
        </div>

        {/* ============================================================ */}
        {/* TWO COLUMN LAYOUT */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT COLUMN: Contact Information with animated cards */}
          <div ref={contactInfoRef} className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Contact Information
              </h3>
              
              <div className="space-y-4">
                {/* Email Contact Card */}
                <div className="contact-info-card flex items-start gap-4 p-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                  <div className="contact-icon w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h4>
                    <p className="text-gray-600 dark:text-gray-400">support@airesume.com</p>
                  </div>
                </div>

                {/* Live Chat Info Card */}
                <div className="contact-info-card flex items-start gap-4 p-4 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer">
                  <div className="contact-icon w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Live Chat</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Available Monday - Friday, 9AM - 5PM EST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Project Details
              </h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-400">
                <p>
                  <span className="font-semibold">Course:</span> COMP 2154 - System Development
                  Project
                </p>
                <p>
                  <span className="font-semibold">Team:</span> KMR
                </p>
                <p>
                  <span className="font-semibold">Members:</span> Arman Milani, Ramtin Loghmani
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Contact Form with animated fields */}
          <div ref={formRef}>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Field */}
              <div className="form-field">
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Your Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-all"
                />
              </div>

              {/* Email Field */}
              <div className="form-field">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-all"
                />
              </div>

              {/* Message Field */}
              <div className="form-field">
                <label 
                  htmlFor="message" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us more about your inquiry..."
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-all"
                />
              </div>

              {/* Submit Button with animated feedback */}
              <Button
                type="submit"
                size="lg"
                className="submit-button w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Send Message <Send className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
