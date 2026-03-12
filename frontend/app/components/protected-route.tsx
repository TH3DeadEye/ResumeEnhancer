'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth-service';

// Protected route wrapper - checks Cognito authentication
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      
      // Give Amplify time to load session from storage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const authed = await isAuthenticated();
      console.log('Auth check result:', authed);
      
      if (authed) {
        console.log('User authenticated, loading dashboard');
        setIsAuthed(true);
      } else {
        console.log('Not authenticated, redirecting to sign in');
        router.push('/signin');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/signin');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--accent)" }}></div>
          <p style={{ color: "var(--text-muted)" }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
}
