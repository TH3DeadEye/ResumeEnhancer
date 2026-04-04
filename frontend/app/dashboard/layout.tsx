'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/app/components/protected-route';
import { LayoutDashboard, Upload, Clock, Settings, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/**
 * DASHBOARD LAYOUT
 *
 * Protected layout for all dashboard pages.
 * Top navbar only — no sidebar on desktop. Full-width content.
 *
 * Responsive strategy:
 *   < md (768 px): top navbar shows wordmark + hamburger button only.
 *                  Tapping the hamburger opens a fixed overlay drawer that
 *                  slides over the content (does NOT push it). A semi-
 *                  transparent backdrop dismisses the drawer on tap.
 *   ≥ md (768 px): top navbar shows wordmark + centered tab links + icon
 *                  buttons. Hamburger and drawer are never rendered.
 */

const NAV_TABS = [
  { href: '/dashboard',          label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/upload',   label: 'Upload',    icon: Upload           },
  { href: '/dashboard/history',  label: 'History',   icon: Clock            },
  { href: '/dashboard/settings', label: 'Settings',  icon: Settings         },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname        = usePathname();
  const router          = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            {/* LEFT — hamburger (mobile only) + wordmark */}
            <div className="flex items-center" style={{ gap: '4px' }}>
              {/* Hamburger: 44×44 touch target, hidden on md+ */}
              <button
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginLeft: '-8px', // visually align with left edge
                }}
              >
                <Menu className="h-5 w-5" />
              </button>

              <span
                className="tracking-tight shrink-0"
                style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.125rem' }}
              >
                Resumence
              </span>
            </div>

            {/* CENTER — tab nav, desktop only.
                Absolutely positioned so it is always centred in the bar
                regardless of how wide the left/right elements are. */}
            <nav
              className="hidden md:flex items-center h-full"
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                gap: '4px',
              }}
            >
              {NAV_TABS.slice(0, 3).map(({ href, label }) => {
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

            {/* RIGHT — settings icon + logout icon */}
            <div className="flex items-center shrink-0" style={{ gap: '4px' }}>
              <Link href="/dashboard/settings">
                <button
                  style={{
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSettingsActive ? 'var(--accent)' : 'var(--text-muted)',
                    backgroundColor: isSettingsActive ? 'var(--accent-subtle)' : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'color 0.15s, background-color 0.15s',
                  }}
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ── Mobile overlay sidebar ────────────────────────────────────────
            Only rendered when sidebarOpen === true and the viewport is < md.
            md:hidden prevents it from appearing on desktop even if state is
            somehow true (e.g. after a window resize). */}
        {sidebarOpen && (
          <>
            {/* Backdrop — fills viewport, dismisses drawer on tap.
                Uses color-mix so no hardcoded rgba value. */}
            <div
              className="md:hidden"
              aria-hidden="true"
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 60,
                backgroundColor: 'color-mix(in oklch, black 50%, transparent)',
              }}
            />

            {/* Drawer — overlays content from the left, never pushes it. */}
            <aside
              className="md:hidden"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                width: '260px',
                zIndex: 70,
                backgroundColor: 'var(--bg-surface)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Drawer header: wordmark + close button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 8px 0 16px',
                  height: '56px',
                  borderBottom: '1px solid var(--border)',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Resumence
                </span>

                {/* Close button — 44×44 touch target */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close navigation menu"
                  style={{
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'color 0.15s',
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
                {NAV_TABS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '2px',
                        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                        backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                        fontWeight: isActive ? 500 : 400,
                        fontSize: '0.9375rem',
                        textDecoration: 'none',
                        transition: 'background-color 0.15s, color 0.15s',
                        minHeight: '44px', // 44px touch target
                      }}
                    >
                      <Icon
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                      />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout — pinned to drawer bottom */}
              <div
                style={{
                  padding: '8px',
                  borderTop: '1px solid var(--border)',
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => { setSidebarOpen(false); handleLogout(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    width: '100%',
                    minHeight: '44px', // 44px touch target
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-muted)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontWeight: 400,
                    fontSize: '0.9375rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'color 0.15s',
                  }}
                >
                  <LogOut className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  Log out
                </button>
              </div>
            </aside>
          </>
        )}

        {/* ── Main content ─────────────────────────────────────────────────── */}
        {/* paddingTop clears the fixed 56px navbar. No bottom padding needed
            since the mobile bottom tab bar has been replaced by the drawer. */}
        <main
          style={{ paddingTop: '56px' }}
          className="overflow-x-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}
