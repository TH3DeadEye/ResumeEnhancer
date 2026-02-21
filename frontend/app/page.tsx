'use client';

import { useState } from 'react';
import { LandingPage } from './components/landing-page';
import { SignInPage } from './components/signin-page';
import { Navigation } from './components/navigation';
import gsap from 'gsap';

/**
 * HOME PAGE (Root Route)
 * 
 * Main page component that handles navigation between
 * landing and signin pages with smooth transitions
 */
export default function Home() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'signin'>('landing');
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * Handle page navigation with smooth GSAP transition
   */
  const handleNavigate = (page: 'landing' | 'signin') => {
    if (page === currentPage || isTransitioning) return;

    setIsTransitioning(true);

    // Smooth fade transition
    const element = document.getElementById('page-content');
    if (element) {
      gsap.to(element, {
        opacity: 0,
        scale: 0.98,
        y: -20,
        filter: 'blur(5px)',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'instant' });
          
          gsap.fromTo(
            element,
            { opacity: 0, scale: 1.02, y: 20, filter: 'blur(5px)' },
            { 
              opacity: 1, 
              scale: 1, 
              y: 0,
              filter: 'blur(0px)',
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => setIsTransitioning(false)
            }
          );
        },
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
      
      <div id="page-content">
        {currentPage === 'landing' ? (
          <LandingPage onNavigate={handleNavigate} />
        ) : (
          <SignInPage />
        )}
      </div>
    </div>
  );
}
