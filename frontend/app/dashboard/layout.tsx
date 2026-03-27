'use client';

import { ProtectedRoute } from '@/app/components/protected-route';
import { LayoutDashboard, Upload, Clock, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/**
 * DASHBOARD LAYOUT
 *
 * Protected layout for all dashboard pages.
 * Top navbar only — no sidebar. Full-width content.
 *
 * Responsive strategy:
 *   < md (768 px): top navbar shows wordmark + icon buttons only;
 *                  a fixed bottom tab bar provides primary navigation.
 *   ≥ md (768 px): top navbar shows wordmark + centered tab links + icon buttons;
 *                  bottom tab bar is hidden.
 */

const NAV_TABS = [
  { href: '/dashboard',         label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/upload',  label: 'Upload',    icon: Upload           },
  { href: '/dashboard/history', label: 'History',   icon: Clock            },
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
          className="fixed top-0 left-0 right-0 z-50 overflow-x-hidden"
          style={{
            height: '56px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            className="relative flex items-center justify-between h-full"
            style={{ padding: '0 16px' }}
          >
            {/* LEFT — wordmark */}
            <span
              className="tracking-tight shrink-0"
              style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.125rem' }}
            >
              Resumence
            </span>

            {/* CENTER — absolutely positioned for true centering.
                Hidden below md (768 px); mobile uses the bottom tab bar instead. */}
            <nav
              className="hidden md:flex items-center h-full"
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                gap: '4px',
              }}
            >
              {NAV_TABS.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex items-center h-full px-4 text-sm transition-colors"
                    style={{
                      color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: isActive ? 500 : 400,
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
            <div className="flex items-center shrink-0" style={{ gap: '4px' }}>
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

        {/* ── Mobile bottom tab bar ─────────────────────────────────────────
            Visible only below md (768 px). Each item is 1/4 of the viewport
            width and full h-14 (56 px), satisfying the 44 × 44 touch target.
            The active indicator is positioned inside each Link via relative. */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div className="grid grid-cols-4 h-14">
            {NAV_TABS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                  />
                  {label}
                  {/* Active underline — positioned inside this Link via relative */}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2"
                      style={{
                        height: '2px',
                        width: '32px',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--accent)',
                      }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Settings tab */}
            <Link
              href="/dashboard/settings"
              className="relative flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
              style={{
                color: isSettingsActive ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              <Settings
                className="h-4 w-4"
                style={{ color: isSettingsActive ? 'var(--accent)' : 'var(--text-muted)' }}
              />
              Settings
              {isSettingsActive && (
                <span
                  className="absolute bottom-0 left-1/2"
                  style={{
                    height: '2px',
                    width: '32px',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--accent)',
                  }}
                />
              )}
            </Link>
          </div>
        </nav>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        {/* paddingTop clears the fixed header.
            pb-16 (64 px) clears the fixed bottom bar on mobile.
            md:pb-0 removes that offset once the bottom bar is hidden. */}
        <main
          style={{ paddingTop: '56px' }}
          className="overflow-x-hidden pb-16 md:pb-0"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}
