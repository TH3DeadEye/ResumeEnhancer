'use client';

import { ProtectedRoute } from '@/app/components/protected-route';
import { Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/**
 * DASHBOARD LAYOUT
 *
 * Protected layout for all dashboard pages.
 * Top navbar only — no sidebar. Full-width content.
 */

const NAV_TABS = [
  { href: '/dashboard',         label: 'Dashboard' },
  { href: '/dashboard/upload',  label: 'Upload'    },
  { href: '/dashboard/history', label: 'History'   },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    const { handleSignOut } = await import('@/lib/auth-service');
    await handleSignOut();
    router.push('/signin');
  };

  const isSettingsActive = pathname === '/dashboard/settings';

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>

        {/* ── Top navbar ───────────────────────────────────────────────────── */}
        <header
          className="fixed top-0 left-0 right-0 z-50"
          style={{
            height: '56px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            className="flex items-center justify-between h-full"
            style={{ padding: '0 24px' }}
          >
            {/* LEFT — wordmark */}
            <span
              className="tracking-tight"
              style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '1.125rem' }}
            >
              Resumence
            </span>

            {/* CENTER — tab links */}
            <nav className="hidden sm:flex items-center h-full" style={{ gap: '4px' }}>
              {NAV_TABS.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex items-center h-full px-4 text-sm font-medium transition-colors"
                    style={{
                      color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    {label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0"
                        style={{ height: '2px', backgroundColor: 'var(--accent)' }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT — settings + logout */}
            <div className="flex items-center" style={{ gap: '4px' }}>
              <Link href="/dashboard/settings">
                <button
                  className="p-2 rounded-md transition-colors"
                  style={{
                    color: isSettingsActive ? 'var(--accent)' : 'var(--text-muted)',
                    backgroundColor: isSettingsActive
                      ? 'var(--accent-subtle)'
                      : 'transparent',
                  }}
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-md transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--text-primary)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'var(--text-muted)')
                }
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile bottom nav — 3 tabs only */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div className="grid grid-cols-4 h-14">
            {NAV_TABS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {label}
                  {isActive && (
                    <span
                      className="absolute bottom-0"
                      style={{ height: '2px', width: '32px', backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </Link>
              );
            })}
            <Link
              href="/dashboard/settings"
              className="flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
              style={{
                color: isSettingsActive ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </nav>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main
          style={{
            paddingTop: '56px',
          }}
          className="overflow-x-hidden pb-16 sm:pb-0"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
