import { SignInPage } from '@/app/components/signin-page';

export const metadata = {
  title: 'Sign In — Resumence',
};

/**
 * Standalone sign-in route — no navbar or footer.
 * Renders the SignInPage component centered on a subtle background.
 */
export default function SignInRoute() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-subtle)' }}>
      <SignInPage />
    </div>
  );
}
