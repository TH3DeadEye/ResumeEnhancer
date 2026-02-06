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
 * Contact form with:
 * - Name, email, and message fields
 * - Scroll-triggered fade-in animation
 * - Form validation and toast notifications
 * - Contact information display
 */

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

export function ContactSection() {
  // ============================================================
  // REFS & STATE
  // ============================================================
  
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // ============================================================
  // SCROLL ANIMATION
  // ============================================================
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      /**
       * ANIMATION: Form fades in and slides up when scrolling to this section
       * 
       * NOTE: This animation does NOT use "scrub"
       * - It triggers once when section enters viewport
       * - Does not reverse on scroll up (one-time entrance animation)
       */
      gsap.fromTo(
        formRef.current,
        { y: 60, opacity: 0 },  // FROM: 60px below, invisible
        {
          y: 0,                 // TO: original position, visible
          opacity: 1,
          duration: 1,          // Takes 1 second (not tied to scroll)
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",   // Trigger when section is 70% down viewport
            // NO "scrub" - fires once instead of following scroll
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ============================================================
  // FORM HANDLERS
  // ============================================================
  
  /**
   * Handles form submission
   * - Prevents default form behavior
   * - Shows success toast notification
   * - Resets form fields
   * 
   * TO INTEGRATE WITH BACKEND:
   * - Add API call here (e.g., fetch, axios)
   * - Handle loading state
   * - Handle error cases
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    
    // Show success message (uses Sonner toast library)
    toast.success("Message sent successfully! We'll get back to you soon.");
    
    // Reset form to empty state
    setFormData({ name: "", email: "", message: "" });
  };

  /**
   * Updates form state when user types
   * Handles both Input and Textarea elements
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ 
      ...formData,                    // Keep existing values
      [e.target.name]: e.target.value // Update only the changed field
    });
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <section id="contact" ref={sectionRef} className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================ */}
        {/* SECTION HEADER */}
        {/* ============================================================ */}
        <div className="text-center mb-16">
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
        {/* Left: Contact info | Right: Contact form */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT COLUMN: Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Contact Information
              </h3>
              
              <div className="space-y-4">
                {/* Email Contact */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h4>
                    <p className="text-gray-600 dark:text-gray-400">support@airesume.com</p>
                  </div>
                </div>

                {/* Live Chat Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
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
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
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

          {/* RIGHT COLUMN: Contact Form (Animated) */}
          <div ref={formRef}>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name Field */}
              <div>
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
                  required  // HTML5 validation
                  placeholder="John Doe"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"  // HTML5 email validation
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Message Field */}
              <div>
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
                  rows={6}  // Height of textarea (6 lines)
                  placeholder="Tell us more about your inquiry..."
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
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
