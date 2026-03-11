import Link from 'next/link';
import { SignInPage } from '@/app/components/signin-page';

export const metadata = {
  title: 'Sign In — Resumence',
};

/**
 * Standalone sign-in route — no navbar or footer.
 * Renders the SignInPage component with a top-left "Back to home" link.
 */
export default function SignInRoute() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-subtle)', position: 'relative' }}>
      {/* Hover style for back link — CSS variable safe */}
      <style>{`
        .back-home-link { color: var(--text-muted); }
        .back-home-link:hover { color: var(--text-primary); }
      `}</style>

      {/* Back to home — top-left, outside card */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
        <Link
          href="/"
          className="back-home-link"
          style={{
            fontSize: '0.8125rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.15s',
          }}
        >
          ← Back to home
        </Link>
      </div>

      <SignInPage />
    </div>
  );
}
