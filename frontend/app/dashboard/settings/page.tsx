'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { User, Mail, Lock, Bell, Shield, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/app/components/ui/sonner';
import { FillButton } from '@/app/components/ui/fill-button';

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

// ── Inline feedback banner ────────────────────────────────────────────────────

type InlineFeedback = { type: 'success' | 'error'; text: string };

function InlineAlert({ msg }: { msg: InlineFeedback }) {
  const ok = msg.type === 'success';
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: ok
          ? 'color-mix(in oklch, var(--success) 12%, transparent)'
          : 'color-mix(in oklch, var(--danger)  12%, transparent)',
        border: `1px solid ${ok ? 'var(--success)' : 'var(--danger)'}`,
        color: ok ? 'var(--success)' : 'var(--danger)',
        fontSize: '0.875rem',
        marginTop: '16px',
      }}
    >
      {ok
        ? <CheckCircle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
        : <AlertCircle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
      }
      {msg.text}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Profile fields
  const [userName,     setUserName    ] = useState('');
  const [userEmail,    setUserEmail   ] = useState('');
  const [userPhone,    setUserPhone   ] = useState('');
  const [userLinkedin, setUserLinkedin] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg,   setProfileMsg  ] = useState<InlineFeedback | null>(null);

  // Password change fields
  const [currentPw,  setCurrentPw ] = useState('');
  const [newPw,      setNewPw     ] = useState('');
  const [pwLoading,  setPwLoading ] = useState(false);
  const [pwMsg,      setPwMsg     ] = useState<InlineFeedback | null>(null);

  useEffect(() => { loadUserData(); }, []);

  // Pre-fill form with Cognito attributes via Amplify fetchUserAttributes()
  const loadUserData = async () => {
    try {
      const { fetchUserAttributes } = await import('aws-amplify/auth');
      const attrs = await fetchUserAttributes();
      setUserName(    (attrs as Record<string, string | undefined>).name           ?? '');
      setUserEmail(   (attrs as Record<string, string | undefined>).email          ?? '');
      setUserPhone(   (attrs as Record<string, string | undefined>)['custom:phone']    ?? '');
      setUserLinkedin((attrs as Record<string, string | undefined>)['custom:linkedin'] ?? '');
    } catch (err) {
      console.error('fetchUserAttributes failed:', err);
      // Graceful fallback: at least show the name/email we already have in session
      try {
        const { getUserInfo } = await import('@/lib/auth-service');
        const result = await getUserInfo();
        if (result.success && result.result) {
          setUserName( result.result.name  ?? '');
          setUserEmail(result.result.email ?? '');
        }
      } catch { /* ignore */ }
    }
  };

  // Save profile → Amplify updateUserAttributes()
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const { updateUserAttributes } = await import('aws-amplify/auth');
      await updateUserAttributes({
        userAttributes: {
          name: userName,
          // Only send custom attributes when the user has actually provided a value
          ...(userPhone    ? { 'custom:phone':    userPhone    } : {}),
          ...(userLinkedin ? { 'custom:linkedin': userLinkedin } : {}),
        },
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
      toast.success('Profile updated');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to update profile';
      setProfileMsg({ type: 'error', text });
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Change password → Amplify updatePassword()
  const handleChangePassword = async () => {
    if (!currentPw || !newPw) {
      setPwMsg({ type: 'error', text: 'Please fill in both password fields.' });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      const { updatePassword } = await import('aws-amplify/auth');
      await updatePassword({ oldPassword: currentPw, newPassword: newPw });
      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPw('');
      setNewPw('');
      toast.success('Password updated');
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Failed to update password';
      setPwMsg({ type: 'error', text });
      toast.error('Failed to update password');
    } finally {
      setPwLoading(false);
    }
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

        {/* Full Name */}
        <div style={{ marginBottom: '16px' }}>
          <Label htmlFor="settings-name" style={{ color: 'var(--text-primary)' }}>
            Full Name
          </Label>
          <Input
            id="settings-name"
            value={userName}
            onChange={(e) => { setUserName(e.target.value); setProfileMsg(null); }}
            placeholder="Enter your full name"
            className="mt-1.5"
            style={{
              backgroundColor: 'var(--bg-sunken)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Email (read-only) */}
        <div style={{ marginBottom: '16px' }}>
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

        {/* Phone (custom:phone) */}
        <div style={{ marginBottom: '16px' }}>
          <Label htmlFor="settings-phone" style={{ color: 'var(--text-primary)' }}>
            Phone Number{' '}
            <span style={{ color: 'var(--text-disabled)', fontWeight: 400, fontSize: '0.8125rem' }}>
              (optional)
            </span>
          </Label>
          <Input
            id="settings-phone"
            type="tel"
            value={userPhone}
            onChange={(e) => { setUserPhone(e.target.value); setProfileMsg(null); }}
            placeholder="+1 (555) 000-0000"
            className="mt-1.5"
            style={{
              backgroundColor: 'var(--bg-sunken)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* LinkedIn (custom:linkedin) */}
        <div style={{ marginBottom: '24px' }}>
          <Label htmlFor="settings-linkedin" style={{ color: 'var(--text-primary)' }}>
            LinkedIn URL{' '}
            <span style={{ color: 'var(--text-disabled)', fontWeight: 400, fontSize: '0.8125rem' }}>
              (optional)
            </span>
          </Label>
          <Input
            id="settings-linkedin"
            type="url"
            value={userLinkedin}
            onChange={(e) => { setUserLinkedin(e.target.value); setProfileMsg(null); }}
            placeholder="https://linkedin.com/in/your-profile"
            className="mt-1.5"
            style={{
              backgroundColor: 'var(--bg-sunken)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <FillButton
          onClick={handleSaveProfile}
          disabled={profileLoading}
          className="text-sm font-medium"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            padding: '10px 20px',
            opacity: profileLoading ? 0.7 : 1,
            cursor: profileLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {profileLoading ? 'Saving…' : 'Save Changes'}
        </FillButton>

        {/* Inline profile feedback */}
        {profileMsg && <InlineAlert msg={profileMsg} />}
      </div>

      {/* ── Security card ────────────────────────────────────────────────── */}
      <div style={sectionCard}>
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

        {/* Change Password form */}
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            marginBottom: '12px',
          }}
        >
          <div className="flex items-center gap-3" style={{ marginBottom: '16px' }}>
            <Lock style={{ color: 'var(--text-muted)', width: '18px', height: '18px' }} />
            <p style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              Change Password
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div>
              <Label htmlFor="current-pw" style={{ color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                Current Password
              </Label>
              <Input
                id="current-pw"
                type="password"
                value={currentPw}
                onChange={(e) => { setCurrentPw(e.target.value); setPwMsg(null); }}
                placeholder="Enter current password"
                className="mt-1"
                style={{
                  backgroundColor: 'var(--bg-sunken)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <Label htmlFor="new-pw" style={{ color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
                New Password
              </Label>
              <Input
                id="new-pw"
                type="password"
                value={newPw}
                onChange={(e) => { setNewPw(e.target.value); setPwMsg(null); }}
                placeholder="Enter new password"
                className="mt-1"
                style={{
                  backgroundColor: 'var(--bg-sunken)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <FillButton
            onClick={handleChangePassword}
            disabled={pwLoading}
            fillColor="var(--accent)"
            fillOpacity={0.12}
            hoverTextColor="var(--accent)"
            className="text-sm font-medium"
            style={{
              color: pwLoading ? 'var(--text-disabled)' : 'var(--accent-text)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              opacity: pwLoading ? 0.7 : 1,
              cursor: pwLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {pwLoading ? 'Updating…' : 'Update Password'}
          </FillButton>

          {/* Inline password feedback */}
          {pwMsg && <InlineAlert msg={pwMsg} />}
        </div>

        {/* Email Notifications row */}
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
          <FillButton
            onClick={handleDeleteAccount}
            className="text-sm font-medium flex-shrink-0"
            style={{
              backgroundColor: 'var(--danger)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '10px 20px',
            }}
          >
            Delete Account
          </FillButton>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
