'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Eye, EyeOff, Sparkles, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import {
  handleSignIn,
  handleSignUp,
  handleConfirmSignUp,
  handleForgotPassword,
  handleConfirmResetPassword,
} from '@/lib/auth-service';

// Password requirements checked in real time
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
          ? <Check className="w-2 h-2" style={{ color: 'var(--bg-light)' }} />
          : <X     className="w-2 h-2" style={{ color: 'var(--bg-light)' }} />
        }
      </div>
      <span style={{ color: met ? 'var(--success)' : 'var(--danger)' }}>{label}</span>
    </div>
  );
}

export function SignInPage() {
  const router = useRouter();

  // ── Page-level flow state ──────────────────────────────────────────────────
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Sign-in inline error (Bug 10)
  const [signInError, setSignInError] = useState<string | null>(null);

  // Forgot-password flow state (Bug 8)
  const [forgotPw, setForgotPw] = useState({
    active: false,
    codeSent: false,
    email: '',
    code: '',
    newPassword: '',
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Main form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rememberMe: false,
  });

  // ── Derived: password strength rules (Bug 9) ──────────────────────────────
  const passwordStrength = PASSWORD_RULES.map(rule => ({
    label: rule.label,
    met: rule.test(formData.password),
  }));

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // Clear inline error as soon as user edits any field
    if (signInError) setSignInError(null);
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  /** Forgot-password form submission */
  const handleForgotPwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /** Main auth form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            // Show error inline, not just in a toast (Bug 10)
            setSignInError(result.error || 'Incorrect email or password. Please try again.');
          }
        }
      }
    } catch (err: any) {
      if (!isSignUp && !needsVerification) {
        setSignInError(err.message || 'Authentication failed');
      } else {
        toast.error(err.message || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared styles ──────────────────────────────────────────────────────────

  const pageWrapperStyle = {
    background: 'linear-gradient(to bottom right, var(--bg), var(--bg-light), var(--bg))',
  };

  const gradientButtonStyle = {
    background: 'linear-gradient(to right, var(--primary), var(--secondary))',
    color: 'var(--bg-light)',
    minHeight: '48px',
  };

  // ── Forgot-password screen ─────────────────────────────────────────────────

  if (forgotPw.active) {
    return (
      <div
        className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8"
        style={pageWrapperStyle}
      >
        <div className="max-w-md w-full">
          <div
            className="rounded-2xl shadow-2xl p-8"
            style={{ backgroundColor: 'var(--bg-light)' }}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                {forgotPw.codeSent ? 'Set New Password' : 'Reset Password'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {forgotPw.codeSent
                  ? 'Enter the reset code and your new password'
                  : "Enter your email and we'll send you a reset code"}
              </p>
            </div>

            <form onSubmit={handleForgotPwSubmit} className="space-y-5">
              {!forgotPw.codeSent ? (
                <div>
                  <Label htmlFor="forgot-email" style={{ color: 'var(--text)' }}>Email Address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotPw.email}
                    onChange={e => setForgotPw(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="Enter your email"
                    className="mt-1"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="reset-code" style={{ color: 'var(--text)' }}>Reset Code</Label>
                    <Input
                      id="reset-code"
                      type="text"
                      value={forgotPw.code}
                      onChange={e => setForgotPw(prev => ({ ...prev, code: e.target.value }))}
                      required
                      placeholder="6-digit code from email"
                      maxLength={6}
                      className="mt-1 text-center text-xl tracking-widest"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password" style={{ color: 'var(--text)' }}>New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={forgotPw.newPassword}
                        onChange={e => setForgotPw(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                        placeholder="Enter new password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full touch-manipulation"
                style={gradientButtonStyle}
              >
                {isLoading
                  ? 'Please wait...'
                  : forgotPw.codeSent
                  ? 'Reset Password'
                  : 'Send Reset Code'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() =>
                    setForgotPw({ active: false, codeSent: false, email: '', code: '', newPassword: '' })
                  }
                  className="text-sm"
                  style={{ color: 'var(--primary)' }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  // ── Main sign-in / sign-up screen ─────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8"
      style={pageWrapperStyle}
    >
      <div className="max-w-6xl w-full">
        <div
          className="rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-light)' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* ── Left panel: branding — hidden on mobile so card fits viewport (Bug 7) ── */}
            <div
              className="hidden lg:flex relative p-12 flex-col justify-center items-center"
              style={{
                background: 'linear-gradient(to bottom right, var(--primary), var(--secondary))',
                color: 'var(--bg-light)',
              }}
            >
              <div className="absolute inset-0 opacity-10">
                <img
                  src="https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzAwNjM4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="AI Technology"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative z-10 text-center">
                <div
                  className="w-20 h-20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 mx-auto"
                  style={{ backgroundColor: 'color-mix(in oklch, var(--bg-light), transparent 80%)' }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-light)' }}
                  >
                    <span
                      className="text-4xl font-bold"
                      style={{
                        background: 'linear-gradient(to bottom right, var(--primary), var(--secondary))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >AI</span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold mb-4">AI Resume Enhancer</h1>
                <p
                  className="text-xl mb-8"
                  style={{ color: 'color-mix(in oklch, var(--bg-light), transparent 20%)' }}
                >
                  Transform your resume with AI
                </p>

                <div className="space-y-4 text-left max-w-sm mx-auto">
                  {['AI-Powered Tailoring', 'ATS Optimization', '100% Secure & Private'].map(text => (
                    <div
                      key={text}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: 'color-mix(in oklch, var(--bg-light), transparent 90%)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'color-mix(in oklch, var(--bg-light), transparent 80%)' }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <span
                        className="text-sm"
                        style={{ color: 'color-mix(in oklch, var(--bg-light), transparent 15%)' }}
                      >
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right panel: form ── */}
            <div
              className="p-6 sm:p-10 flex items-center"
              style={{ backgroundColor: 'var(--bg-light)' }}
            >
              <div className="max-w-md mx-auto w-full">

                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                    {needsVerification ? 'Verify Email' : isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {needsVerification
                      ? 'Enter the code sent to your email'
                      : isSignUp
                      ? 'Sign up to start optimizing resumes'
                      : 'Sign in to continue'}
                  </p>
                </div>

                {/* Form — no hard-coded minHeight so page never forces a scrollbar (Bug 7) */}
                <form onSubmit={handleSubmit} className="space-y-5">

                  {needsVerification ? (
                    /* ── Email verification step ── */
                    <div>
                      <Label htmlFor="code" style={{ color: 'var(--text)' }}>Verification Code</Label>
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
                      />
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        Check your email for the verification code
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Name field — sign up only */}
                      {isSignUp && (
                        <div>
                          <Label htmlFor="name" style={{ color: 'var(--text)' }}>Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required={isSignUp}
                            placeholder="Enter your full name"
                            className="mt-1"
                          />
                        </div>
                      )}

                      {/* Email */}
                      <div>
                        <Label htmlFor="email" style={{ color: 'var(--text)' }}>Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email"
                          className="mt-1"
                        />
                      </div>

                      {/* Password + forgot link + strength checker */}
                      <div>
                        <Label htmlFor="password" style={{ color: 'var(--text)' }}>Password</Label>
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
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>

                        {/* Forgot password — sign-in only, placed right below the field (Bug 8) */}
                        {!isSignUp && (
                          <div className="mt-1.5 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setForgotPw(prev => ({ ...prev, active: true, email: formData.email }))
                              }
                              className="text-xs"
                              style={{ color: 'var(--primary)' }}
                            >
                              Forgot password?
                            </button>
                          </div>
                        )}

                        {/* Live password strength — sign-up only, appears when typing (Bug 9) */}
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
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="rememberMe"
                            checked={formData.rememberMe}
                            onCheckedChange={checked =>
                              setFormData({ ...formData, rememberMe: checked as boolean })
                            }
                          />
                          <Label
                            htmlFor="rememberMe"
                            className="text-sm cursor-pointer"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Remember me
                          </Label>
                        </div>
                      )}
                    </>
                  )}

                  {/* Inline error for wrong credentials — dynamic, never always-visible (Bug 10) */}
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
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full touch-manipulation"
                    style={gradientButtonStyle}
                  >
                    {isLoading
                      ? 'Please wait...'
                      : needsVerification
                      ? 'Verify Email'
                      : isSignUp
                      ? 'Create Account'
                      : 'Sign In'}
                  </Button>

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
                            <span className="font-semibold" style={{ color: 'var(--primary)' }}>Sign In</span>
                          </>
                        ) : (
                          <>Don&apos;t have an account?{' '}
                            <span className="font-semibold" style={{ color: 'var(--primary)' }}>Sign Up</span>
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
                        style={{ color: 'var(--primary)' }}
                      >
                        Back to Sign In
                      </button>
                    </div>
                  )}
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                    By continuing, you agree to our Terms & Privacy Policy.
                    <br />
                    Powered by AWS Cognito
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
