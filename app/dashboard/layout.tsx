'use client';

import { ProtectedRoute } from '@/app/components/protected-route';
import { Button } from '@/app/components/ui/button';
import { ThemeToggle } from '@/app/components/theme-toggle';
import { LogOut, Upload, Home, History, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/**
 * DASHBOARD LAYOUT
 * 
 * Protected layout for all dashboard pages.
 * Includes sidebar navigation and header.
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const { handleSignOut } = await import('@/lib/auth-service');
    await handleSignOut();
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/upload', icon: Upload, label: 'Upload Resume' },
    { href: '/dashboard/history', icon: History, label: 'History' },
  ];

  const settingsItem = { href: '/dashboard/settings', icon: Settings, label: 'Settings' };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 w-full backdrop-blur-md shadow-lg"
          style={{ 
            backgroundColor: "color-mix(in oklch, var(--bg-light), transparent 5%)",
            borderBottom: "1px solid var(--border)"
          }}>
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  background: "linear-gradient(to bottom right, var(--primary), var(--secondary))"
                }}
              >
                <span className="font-bold text-lg" style={{ color: "var(--bg-light)" }}>AI</span>
              </div>
              <span className="text-xl font-bold hidden sm:inline" style={{ color: "var(--text)" }}>Resume Enhancer</span>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="gap-2 transition-colors"
                style={{ color: "var(--text)" }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md md:hidden shadow-lg"
          style={{ 
            backgroundColor: "color-mix(in oklch, var(--bg-light), var(--border) 10%)",
            borderTop: "2px solid var(--border)"
          }}>
          <div className="grid grid-cols-4 gap-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center gap-1 rounded-lg p-2 transition-all"
                  style={{
                    backgroundColor: isActive ? "color-mix(in oklch, var(--primary), transparent 85%)" : "transparent",
                    color: isActive ? "var(--primary)" : "var(--text)",
                    fontWeight: isActive ? 600 : 400,
                    border: isActive ? "1px solid var(--primary)" : "1px solid transparent"
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
            {/* Settings for mobile */}
            <Link
              href={settingsItem.href}
              className="flex flex-col items-center gap-1 rounded-lg p-2 transition-all"
              style={{
                backgroundColor: pathname === settingsItem.href ? "color-mix(in oklch, var(--primary), transparent 85%)" : "transparent",
                color: pathname === settingsItem.href ? "var(--primary)" : "var(--text)",
                fontWeight: pathname === settingsItem.href ? 600 : 400,
                border: pathname === settingsItem.href ? "1px solid var(--primary)" : "1px solid transparent"
              }}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">{settingsItem.label}</span>
            </Link>
          </div>
        </nav>

        {/* Desktop Sidebar */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:pt-16">
          <div className="flex flex-col h-full" style={{ 
            backgroundColor: "color-mix(in oklch, var(--bg-light), var(--border) 15%)",
            borderRight: "2px solid var(--border)",
            boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)"
          }}>
            {/* Main navigation */}
            <div className="flex flex-col gap-2 p-4 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 transition-all hover:scale-105"
                    style={{
                      backgroundColor: isActive 
                        ? "color-mix(in oklch, var(--primary), transparent 85%)" 
                        : "transparent",
                      color: isActive ? "var(--primary)" : "var(--text)",
                      fontWeight: isActive ? 600 : 500,
                      border: isActive ? "1px solid var(--primary)" : "1px solid transparent"
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Settings at bottom */}
            <div className="p-4 border-t-2" style={{ borderColor: "var(--border)" }}>
              <Link
                href={settingsItem.href}
                className="flex items-center gap-3 rounded-lg px-3 py-3 transition-all hover:scale-105"
                style={{
                  backgroundColor: pathname === settingsItem.href 
                    ? "color-mix(in oklch, var(--primary), transparent 85%)" 
                    : "transparent",
                  color: pathname === settingsItem.href ? "var(--primary)" : "var(--text)",
                  fontWeight: pathname === settingsItem.href ? 600 : 500,
                  border: pathname === settingsItem.href ? "1px solid var(--primary)" : "1px solid transparent"
                }}
              >
                <Settings className="h-5 w-5" />
                <span>{settingsItem.label}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="md:pl-64 pb-16 md:pb-0 pt-4">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
