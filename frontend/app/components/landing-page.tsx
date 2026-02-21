'use client';

import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { AboutSection } from "./about-section";
import { ContactSection } from "./contact-section";
import { LandingFooter } from "./landing-footer";
import { Toaster } from "./ui/sonner";

/**
 * LANDING PAGE COMPONENT
 * 
 * Main landing page that composes all sections together
 * Sections are stacked vertically in this order:
 * 1. Hero Section (Transform Your Resume)
 * 2. Features Section (6 feature cards)
 * 3. About Section (Project information)
 * 4. Contact Section (Contact form)
 * 5. Footer (Links and copyright)
 * 
 * Each section handles its own GSAP animations independently
 */

interface LandingPageProps {
  onNavigate: (page: string) => void; // Function to navigate to Sign In page
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  /**
   * Handler for "Get Started" button in Hero section
   * Navigates user to Sign In page
   */
  const handleGetStarted = () => {
    onNavigate("signin");
  };

  return (
    <>
      {/* ============================================================ */}
      {/* HERO SECTION - "Transform Your Resume" */}
      {/* - Animated title, subtitle, buttons */}
      {/* - Counting statistics (30s, 99.9%, 100%) */}
      {/* - Gradient background with animated blobs */}
      {/* ============================================================ */}
      <HeroSection onGetStarted={handleGetStarted} />
      
      {/* ============================================================ */}
      {/* FEATURES SECTION - "Powerful Features" */}
      {/* - 6 feature cards in 3-column grid */}
      {/* - Each card animates on scroll */}
      {/* - Icons: Bot, Zap, Shield, FileText, TrendingUp, Clock */}
      {/* ============================================================ */}
      <FeaturesSection />
      
      {/* ============================================================ */}
      {/* ABOUT SECTION - "About Our Project" */}
      {/* - Split layout: image left, content right */}
      {/* - Team information (KMR: Arman & Ramtin) */}
      {/* - Mission, Team, Vision cards */}
      {/* ============================================================ */}
      <AboutSection />
      
      {/* ============================================================ */}
      {/* CONTACT SECTION - "Get In Touch" */}
      {/* - Contact form (name, email, message) */}
      {/* - Contact information (email, live chat) */}
      {/* - Project details card */}
      {/* ============================================================ */}
      <ContactSection />
      
      {/* ============================================================ */}
      {/* FOOTER - Company info and links */}
      {/* - Logo and description */}
      {/* - Social media links (GitHub, LinkedIn, Email) */}
      {/* - Product links (Features, About, Contact) */}
      {/* - Legal links (Privacy, Terms, Security) */}
      {/* - Copyright notice */}
      {/* ============================================================ */}
      <LandingFooter />
      
      {/* 
        TOAST NOTIFICATIONS 
        - Shows success/error messages from Contact form
        - Appears at bottom-right of screen
        - Auto-dismisses after 3 seconds
      */}
      <Toaster />
    </>
  );
}
