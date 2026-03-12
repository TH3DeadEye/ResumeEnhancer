'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import { gsap } from '@/app/lib/gsap';
import { FillButton } from './ui/fill-button';
import {
  handleSignIn,
  handleSignUp,
  handleConfirmSignUp,
  handleForgotPassword,
  handleConfirmResetPassword,
} from '@/lib/auth-service';

// ── Password requirements ─────────────────────────────────────────────────────

const PASSWORD_RULES = [
  { label: 'At least 8 characters',  test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter',        test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter',        test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number',                  test: (p: string) => /[0-9]/.test(p) },
  { label: 'Special character',       test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordRuleRow({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: met ? 'var(--success)' : 'var(--danger)' }}
      >
        {met
          ? <Check className="w-2 h-2" style={{ color: 'var(--bg-surface)' }} />
          : <X     className="w-2 h-2" style={{ color: 'var(--bg-surface)' }} />
        }
      </div>
      <span style={{ color: met ? 'var(--success)' : 'var(--danger)' }}>{label}</span>
    </div>
  );
}

// ── Shared layout & style constants ──────────────────────────────────────────

const outerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--bg-subtle)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: '10vh',
  paddingBottom: '4rem',
  paddingLeft: '1rem',
  paddingRight: '1rem',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-xl)',
  padding: '40px',
  boxShadow: 'var(--shadow-lg)',
  width: '100%',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: 'var(--accent)',
  color: 'white',
  width: '100%',
  minHeight: '48px',
  borderRadius: 'var(--radius-md)',
  fontWeight: 500,
  fontSize: '0.9375rem',
  cursor: 'pointer',
  transition: 'background-color 0.15s',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function SignInPage() {
  const router = useRouter();

  // ── Refs for GSAP animation ────────────────────────────────────────────────

  const mainContainerRef   = useRef<HTMLDivElement>(null);
  const forgotContainerRef = useRef<HTMLDivElement>(null);

  // ── Page-level flow state ──────────────────────────────────────────────────

  const [isSignUp,           setIsSignUp          ] = useState(false);
  const [isLoading,          setIsLoading         ] = useState(false);
  const [needsVerification,  setNeedsVerification ] = useState(false);
  const [verificationCode,   setVerificationCode  ] = useState('');
  const [signInError,        setSignInError       ] = useState<string | null>(null);

  // Forgot-password flow state
  const [forgotPw, setForgotPw] = useState({
    active: false,
    codeSent: false,
    email: '',
    code: '',
    newPassword: '',
  });

  // Password visibility
  const [showPassword,    setShowPassword   ] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Main form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rememberMe: false,
  });

  // ── Derived: password strength rules ──────────────────────────────────────

  const passwordStrength = PASSWORD_RULES.map(rule => ({
    label: rule.label,
    met: rule.test(formData.password),
  }));

  // ── Reset stale state on mount ────────────────────────────────────────────

  useEffect(() => {
    setSignInError(null);
    setIsSignUp(false);
    setNeedsVerification(false);
    setForgotPw(fp => ({ ...fp, active: false, codeSent: false }));
  }, []);

  // ── GSAP: animate main card on mount ─────────────────────────────────────

  useEffect(() => {
    if (mainContainerRef.current) {
      gsap.fromTo(
        mainContainerRef.current,
        { opacity: 0, y: 32, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }
      );
    }
  }, []);

  // ── GSAP: animate forgot-password card when it appears ────────────────────

  useEffect(() => {
    if (forgotPw.active && forgotContainerRef.current) {
      gsap.fromTo(
        forgotContainerRef.current,
        { opacity: 0, y: 32, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }
      );
    }
  }, [forgotPw.active]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (signInError) setSignInError(null);
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleForgotPwSubmit = async () => {
    setIsLoading(true);
    try {
      if (!forgotPw.codeSent) {
        const result = await handleForgotPassword(forgotPw.email);
        if (result.success) {
          toast.success('Reset code sent! Check your email.');
          setForgotPw(prev => ({ ...prev, codeSent: true }));
        } else {
          toast.error(result.error || 'Failed to send reset code');
        }
      } else {
        const result = await handleConfirmResetPassword(
          forgotPw.email,
          forgotPw.code,
          forgotPw.newPassword,
        );
        if (result.success) {
          toast.success('Password reset successfully! You can now sign in.');
          setForgotPw({ active: false, codeSent: false, email: '', code: '', newPassword: '' });
          setIsSignUp(false);
        } else {
          toast.error(result.error || 'Password reset failed');
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSignInError(null);

    try {
      if (needsVerification) {
        const result = await handleConfirmSignUp({ email: formData.email, code: verificationCode });
        if (result.success) {
          toast.success('Email verified! You can now sign in.');
          setNeedsVerification(false);
          setIsSignUp(false);
          setVerificationCode('');
        } else {
          toast.error(result.error || 'Verification failed');
        }

      } else if (isSignUp) {
        const result = await handleSignUp({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
        if (result.success) {
          toast.success('Account created! Check your email for verification code.');
          setNeedsVerification(true);
        } else {
          if (result.error?.includes('already registered')) {
            toast.error(result.error);
            setTimeout(() => setIsSignUp(false), 2000);
          } else {
            toast.error(result.error || 'Sign up failed');
          }
        }

      } else {
        const result = await handleSignIn({ email: formData.email, password: formData.password });
        if (result.success) {
          const { fetchAuthSession } = await import('aws-amplify/auth');
          const session = await fetchAuthSession();
          if (session.tokens) {
            toast.success('Signed in successfully! Redirecting...');
            setTimeout(() => {
              router.push('/dashboard');
              router.refresh();
            }, 1000);
          } else {
            setSignInError('Session not established. Please try again.');
          }
        } else {
          if (result.error?.includes('verify your email')) {
            toast.error(result.error);
            setNeedsVerification(true);
            setIsSignUp(true);
          } else if (result.error?.includes('Please sign up first')) {
            toast.error(result.error);
            setTimeout(() => setIsSignUp(true), 2000);
          } else {
            setSignInError(result.error || 'Incorrect email or password. Please try again.');
          }
        }
      }
    } catch (err: unknown) {
      if (!isSignUp && !needsVerification) {
        setSignInError(err instanceof Error ? err.message : 'Authentication failed');
      } else {
        toast.error(err instanceof Error ? err.message : 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot-password screen ─────────────────────────────────────────────────

  if (forgotPw.active) {
    return (
      <div style={outerStyle}>
        <div ref={forgotContainerRef} style={{ maxWidth: '440px', width: '100%' }}>
          {/* Wordmark */}
          <div className="text-center" style={{ marginBottom: '32px' }}>
            <span style={{ fontWeight: 600, fontSize: '1.375rem', color: 'var(--accent)' }}>
              Resumence
            </span>
          </div>

          {/* Card */}
          <div style={cardStyle}>
            <div className="text-center" style={{ marginBottom: '28px' }}>
              <h2
                style={{ fontWeight: 500, fontSize: '1.375rem', color: 'var(--text-primary)', marginBottom: '6px' }}
              >
                {forgotPw.codeSent ? 'Set New Password' : 'Reset Password'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {forgotPw.codeSent
                  ? 'Enter the reset code and your new password'
                  : "Enter your email and we'll send you a reset code"}
              </p>
            </div>

            <div
              className="flex flex-col"
              style={{ gap: '20px' }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) handleForgotPwSubmit(); }}
            >
              {!forgotPw.codeSent ? (
                <div>
                  <Label htmlFor="forgot-email" style={{ color: 'var(--text-primary)' }}>
                    Email Address
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotPw.email}
                    onChange={e => setForgotPw(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="Enter your email"
                    className="mt-1"
                    style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border)' }}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="reset-code" style={{ color: 'var(--text-primary)' }}>
                      Reset Code
                    </Label>
                    <Input
                      id="reset-code"
                      type="text"
                      value={forgotPw.code}
                      onChange={e => setForgotPw(prev => ({ ...prev, code: e.target.value }))}
                      required
                      placeholder="6-digit code from email"
                      maxLength={6}
                      className="mt-1 text-center text-xl tracking-widest"
                      style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password" style={{ color: 'var(--text-primary)' }}>
                      New Password
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={forgotPw.newPassword}
                        onChange={e => setForgotPw(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                        placeholder="Enter new password"
                        className="pr-10"
                        style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border)' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {showNewPassword
                          ? <EyeOff className="h-5 w-5" />
                          : <Eye    className="h-5 w-5" />
                        }
                      </button>
                    </div>
                    {forgotPw.newPassword && (
                      <div className="mt-2 space-y-1">
                        {PASSWORD_RULES.map(rule => (
                          <PasswordRuleRow
                            key={rule.label}
                            label={rule.label}
                            met={rule.test(forgotPw.newPassword)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <FillButton
                type="button"
                onClick={handleForgotPwSubmit}
                disabled={isLoading}
                style={{ ...buttonStyle, opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading
                  ? 'Please wait...'
                  : forgotPw.codeSent
                  ? 'Reset Password'
                  : 'Send Reset Code'}
              </FillButton>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() =>
                    setForgotPw({ active: false, codeSent: false, email: '', code: '', newPassword: '' })
                  }
                  className="text-sm"
                  style={{ color: 'var(--accent-text)' }}
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: 'var(--text-disabled)' }}>
            By continuing you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>
        <Toaster />
      </div>
    );
  }

  // ── Main sign-in / sign-up screen ─────────────────────────────────────────

  return (
    <div style={outerStyle}>
      <div ref={mainContainerRef} style={{ maxWidth: '440px', width: '100%' }}>

        {/* Wordmark */}
        <div className="text-center" style={{ marginBottom: '32px' }}>
          <span style={{ fontWeight: 600, fontSize: '1.375rem', color: 'var(--accent)' }}>
            Resumence
          </span>
        </div>

        {/* Card */}
        <div style={cardStyle}>

          {/* Header */}
          <div className="text-center" style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontWeight: 500,
                fontSize: '1.375rem',
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              {needsVerification ? 'Verify Email' : isSignUp ? 'Create account' : 'Welcome back'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {needsVerification
                ? 'Enter the code sent to your email'
                : isSignUp
                ? 'Sign up to start tailoring resumes'
                : 'Sign in to your account'}
            </p>
          </div>

          {/* Form */}
          <div
            className="flex flex-col"
            style={{ gap: '20px' }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) handleSubmit(); }}
          >

            {needsVerification ? (
              /* ── Email verification step ── */
              <div>
                <Label htmlFor="code" style={{ color: 'var(--text-primary)' }}>
                  Verification Code
                </Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  required
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="mt-1 text-center text-2xl tracking-widest"
                  style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border)' }}
                />
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Check your email for the verification code
                </p>
              </div>
            ) : (
              <>
                {/* Name — sign-up only */}
                {isSignUp && (
                  <div>
                    <Label htmlFor="name" style={{ color: 'var(--text-primary)' }}>
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required={isSignUp}
                      placeholder="Enter your full name"
                      className="mt-1"
                      style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border)' }}
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <Label htmlFor="email" style={{ color: 'var(--text-primary)' }}>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="mt-1"
                    style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border)' }}
                  />
                </div>

                {/* Password + forgot + strength */}
                <div>
                  <Label htmlFor="password" style={{ color: 'var(--text-primary)' }}>
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      className="pr-10"
                      style={{ backgroundColor: 'var(--bg-sunken)', borderColor: 'var(--border)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {showPassword
                        ? <EyeOff className="h-5 w-5" />
                        : <Eye    className="h-5 w-5" />
                      }
                    </button>
                  </div>

                  {/* Forgot password — sign-in only */}
                  {!isSignUp && (
                    <div className="mt-1.5 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setForgotPw(prev => ({ ...prev, active: true, email: formData.email }))
                        }
                        className="text-xs"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Live password strength — sign-up only */}
                  {isSignUp && formData.password && (
                    <div className="mt-2 space-y-1">
                      {passwordStrength.map(({ label, met }) => (
                        <PasswordRuleRow key={label} label={label} met={met} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Remember me — sign-in only */}
                {!isSignUp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onChange={(e) =>
                        setFormData({ ...formData, rememberMe: e.target.checked })
                      }
                      style={{
                        width: '14px',
                        height: '14px',
                        flexShrink: 0,
                        cursor: 'pointer',
                        accentColor: 'var(--accent)',
                      }}
                    />
                    <label
                      htmlFor="rememberMe"
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      Remember me
                    </label>
                  </div>
                )}
              </>
            )}

            {/* Inline error */}
            {signInError && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-sm"
                style={{
                  backgroundColor: 'color-mix(in oklch, var(--danger), transparent 90%)',
                  color: 'var(--danger)',
                  border: '1px solid color-mix(in oklch, var(--danger), transparent 60%)',
                }}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{signInError}</span>
              </div>
            )}

            {/* Submit */}
            <FillButton
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              style={{ ...buttonStyle, opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading
                ? 'Please wait...'
                : needsVerification
                ? 'Verify Email'
                : isSignUp
                ? 'Create Account'
                : 'Sign In'}
            </FillButton>

            {/* Toggle sign-in / sign-up */}
            {!needsVerification && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setSignInError(null);
                    setFormData({ name: '', email: '', password: '', rememberMe: false });
                  }}
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {isSignUp ? (
                    <>Already have an account?{' '}
                      <span style={{ color: 'var(--accent-text)', fontWeight: 500 }}>Sign In</span>
                    </>
                  ) : (
                    <>Don&apos;t have an account?{' '}
                      <span style={{ color: 'var(--accent-text)', fontWeight: 500 }}>Sign Up</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {needsVerification && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setNeedsVerification(false);
                    setIsSignUp(false);
                  }}
                  className="text-sm"
                  style={{ color: 'var(--accent-text)' }}
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Below card */}
        <p className="text-xs text-center mt-6" style={{ color: 'var(--text-disabled)' }}>
          By continuing you agree to our Terms &amp; Privacy Policy.
        </p>
      </div>

      <Toaster />
    </div>
  );
}
