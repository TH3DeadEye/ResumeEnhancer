'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { User, Mail, Lock, Bell, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';

// ── Shared card styles ────────────────────────────────────────────────────────

const sectionCard: React.CSSProperties = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '32px',
  marginBottom: '24px',
  width: '100%',
};

const sectionDivider: React.CSSProperties = {
  borderTop: '1px solid var(--border)',
  margin: '20px 0',
};

const iconWrap: React.CSSProperties = {
  backgroundColor: 'var(--accent-subtle)',
  borderRadius: '8px',
  padding: '6px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [userName,  setUserName ] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => {
    try {
      const { getUserInfo } = await import('@/lib/auth-service');
      const result = await getUserInfo();
      if (result.success && result.result) {
        setUserName(result.result.name  || '');
        setUserEmail(result.result.email || '');
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    toast.info('Password change coming soon!');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion coming soon!');
    }
  };

  return (
    <div style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            color: 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '1.5rem',
            letterSpacing: '-0.01em',
            marginBottom: '4px',
          }}
        >
          Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* ── Profile card ────────────────────────────────────────────────── */}
      <div style={sectionCard}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div style={iconWrap}>
            <User style={{ color: 'var(--accent)', width: '18px', height: '18px' }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
              Profile Information
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Update your personal information
            </p>
          </div>
        </div>

        <div style={sectionDivider} />

        {/* Name field */}
        <div style={{ marginBottom: '16px' }}>
          <Label htmlFor="settings-name" style={{ color: 'var(--text-primary)' }}>
            Full Name
          </Label>
          <Input
            id="settings-name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your full name"
            className="mt-1.5"
            style={{
              backgroundColor: 'var(--bg-sunken)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Email field */}
        <div style={{ marginBottom: '24px' }}>
          <Label htmlFor="settings-email" style={{ color: 'var(--text-primary)' }}>
            Email
          </Label>
          <div className="flex items-center gap-2 mt-1.5">
            <Mail style={{ color: 'var(--text-muted)', width: '16px', height: '16px', flexShrink: 0 }} />
            <Input
              id="settings-email"
              type="email"
              value={userEmail}
              disabled
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border)',
                color: 'var(--text-muted)',
              }}
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            Email cannot be changed. Contact support if needed.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="text-sm font-medium transition-all"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            padding: '10px 20px',
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
          }}
        >
          {isLoading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* ── Security card ────────────────────────────────────────────────── */}
      <div style={sectionCard}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div style={iconWrap}>
            <Shield style={{ color: 'var(--accent)', width: '18px', height: '18px' }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
              Security
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Manage your account security
            </p>
          </div>
        </div>

        <div style={sectionDivider} />

        {/* Password row */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            marginBottom: '12px',
          }}
        >
          <div className="flex items-center gap-3">
            <Lock style={{ color: 'var(--text-muted)', width: '18px', height: '18px' }} />
            <div>
              <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                Password
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Last changed 30 days ago
              </p>
            </div>
          </div>
          <button
            onClick={handleChangePassword}
            className="text-sm font-medium transition-colors"
            style={{
              color: 'var(--accent-text)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 14px',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Change
          </button>
        </div>

        {/* Notifications row */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-3">
            <Bell style={{ color: 'var(--text-muted)', width: '18px', height: '18px' }} />
            <div>
              <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                Email Notifications
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Receive email updates about your resumes
              </p>
            </div>
          </div>
          <span
            className="text-xs font-medium"
            style={{
              color: 'var(--success)',
              border: '1px solid var(--success)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
            }}
          >
            Enabled
          </span>
        </div>
      </div>

      {/* ── Danger Zone card ─────────────────────────────────────────────── */}
      <div
        style={{
          ...sectionCard,
          border: '1px solid color-mix(in oklch, var(--danger), transparent 40%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div style={{ ...iconWrap, backgroundColor: 'color-mix(in oklch, var(--danger), transparent 85%)' }}>
            <Trash2 style={{ color: 'var(--danger)', width: '18px', height: '18px' }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--danger)', fontSize: '1rem' }}>
              Danger Zone
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Irreversible actions
            </p>
          </div>
        </div>

        <div style={{ ...sectionDivider, borderColor: 'color-mix(in oklch, var(--danger), transparent 60%)' }} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '4px' }}>
              Delete Account
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Permanently delete your account and all associated data
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="text-sm font-medium transition-all flex-shrink-0"
            style={{
              backgroundColor: 'var(--danger)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '10px 20px',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.opacity = '0.85')
            }
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Delete Account
          </button>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
