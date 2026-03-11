'use client';

import { useRouter } from 'next/navigation';
import { LandingPage } from './components/landing-page';
import { Navigation } from './components/navigation';

/**
 * HOME PAGE (Root Route)
 *
 * Always shows the landing page.
 * Sign-in is now at /signin (standalone route).
 */
export default function Home() {
  const router = useRouter();

  const handleNavigate = (page: string) => {
    if (page === 'signin') {
      router.push('/signin');
    }
    // 'landing' = stay on this page (no-op)
  };

  return (
    <div className="min-h-screen">
      <Navigation onNavigate={handleNavigate} currentPage="landing" />
      <LandingPage onNavigate={handleNavigate} />
    </div>
  );
}
