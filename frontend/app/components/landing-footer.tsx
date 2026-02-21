'use client';

import { Github, Linkedin, Mail } from "lucide-react";

/**
 * LANDING FOOTER COMPONENT
 * 
 * Footer with:
 * - Company branding and description
 * - Social media links
 * - Navigation links (Product and Legal sections)
 * - Copyright information
 * - Tech stack mention
 * 
 * CUSTOMIZATION:
 * - Update social media URLs in the <a> tags
 * - Add/remove navigation links in the Product/Legal sections
 * - Modify copyright year and team name
 */

export function LandingFooter() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================ */}
        {/* MAIN FOOTER CONTENT - 4 Column Grid */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* ──────────────────────────────────────────────────────── */}
          {/* COLUMN 1-2: Brand and Social Media (spans 2 columns) */}
          {/* ──────────────────────────────────────────────────────── */}
          <div className="md:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="text-xl font-bold text-white">Resume Enhancer</span>
            </div>
            
            {/* Company Description */}
            <p className="text-gray-400 dark:text-gray-500 max-w-md mb-4">
              Revolutionizing the job application process with AI-powered resume optimization.
              Built on AWS serverless architecture for students and professionals.
            </p>
            
            {/* Social Media Links */}
            <div className="flex gap-4">
              {/* GitHub - UPDATE href with your GitHub URL */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"  // Security best practice for external links
                className="hover:text-white transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              
              {/* LinkedIn - UPDATE href with your LinkedIn URL */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              
              {/* Email - UPDATE href with your support email */}
              <a
                href="mailto:support@airesume.com"
                className="hover:text-white transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* COLUMN 3: Product Links */}
          {/* ──────────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {/* Features link - scrolls to Features section */}
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              {/* About link - scrolls to About section */}
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              {/* Contact link - scrolls to Contact section */}
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* COLUMN 4: Legal Links */}
          {/* ──────────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {/* 
                NOTE: These are placeholder links (#)
                Replace with actual policy pages when ready
              */}
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM BAR - Copyright and Tech Stack */}
        {/* ============================================================ */}
        <div className="border-t border-gray-800 dark:border-gray-900 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright Notice */}
            <p className="text-sm text-gray-400 dark:text-gray-500">
              © 2026 AI Resume Enhancer - Team KMR. COMP 2154 Project.
            </p>
            
            {/* Tech Stack Mention */}
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Built with React, TypeScript, AWS & Amazon Bedrock
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
