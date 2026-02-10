'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './ui/sonner';
import { handleSignIn, handleSignUp, handleConfirmSignUp } from '@/lib/auth-service';

export function SignInPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (needsVerification) {
        // Verify email with code
        const result = await handleConfirmSignUp({
          email: formData.email,
          code: verificationCode,
        });

        if (result.success) {
          toast.success('Email verified! You can now sign in.');
          setNeedsVerification(false);
          setIsSignUp(false);
          setVerificationCode('');
        } else {
          toast.error(result.error || 'Verification failed');
        }
      } else if (isSignUp) {
        // Sign up with Cognito
        const result = await handleSignUp({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });

        if (result.success) {
          toast.success('Account created! Check your email for verification code.');
          setNeedsVerification(true);
        } else {
          // If user already exists, switch to sign in
          if (result.error?.includes('already registered')) {
            toast.error(result.error);
            setTimeout(() => {
              setIsSignUp(false);
            }, 2000);
          } else {
            toast.error(result.error || 'Sign up failed');
          }
        }
      } else {
        // Sign in with Cognito
        const result = await handleSignIn({
          email: formData.email,
          password: formData.password,
        });

        if (result.success) {
          console.log('Sign in successful, checking session...');
          
          // Verify session is established before redirect
          const { fetchAuthSession } = await import('aws-amplify/auth');
          const session = await fetchAuthSession();
          console.log('Session tokens:', {
            accessToken: !!session.tokens?.accessToken,
            idToken: !!session.tokens?.idToken,
          });
          
          if (session.tokens) {
            toast.success('Signed in successfully! Redirecting...');
            
            // Use router.push for proper Next.js navigation
            setTimeout(() => {
              console.log('Redirecting to dashboard...');
              router.push('/dashboard');
              router.refresh();
            }, 1000);
          } else {
            toast.error('Session not established. Please try again.');
          }
        } else {
          // If needs verification
          if (result.error?.includes('verify your email')) {
            toast.error(result.error);
            setNeedsVerification(true);
            setIsSignUp(true);
          } else if (result.error?.includes('Please sign up first')) {
            toast.error(result.error);
            setTimeout(() => {
              setIsSignUp(true);
            }, 2000);
          } else {
            toast.error(result.error || 'Sign in failed');
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8"
      style={{ 
        background: "linear-gradient(to bottom right, var(--bg), var(--bg-light), var(--bg))"
      }}
    >
      <div className="max-w-6xl w-full">
        <div className="rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-light)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Panel: Branding */}
            <div
              className="relative p-8 sm:p-12 flex flex-col justify-center items-center min-h-[300px] sm:min-h-0"
              style={{ 
                background: "linear-gradient(to bottom right, var(--primary), var(--secondary))",
                color: "var(--bg-light)"
              }}
            >
              <div className="absolute inset-0 opacity-10">
                <img
                  src="https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzAwNjM4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="AI Technology"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative z-10 text-center">
                {/* Logo */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 backdrop-blur-sm rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-8 mx-auto"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-light)" }}>
                    <span className="text-3xl sm:text-4xl font-bold" style={{ 
                      background: "linear-gradient(to bottom right, var(--primary), var(--secondary))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>AI</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                  AI Resume Enhancer
                </h1>
                <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-blue-100">
                  Transform your resume with AI
                </p>

                {/* Features */}
                <div className="space-y-3 sm:space-y-4 text-left max-w-md mx-auto hidden sm:block">
                  {['AI-Powered Tailoring', 'ATS Optimization', '100% Secure & Private'].map((text) => (
                    <div key={text} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <span className="text-sm sm:text-base text-blue-100">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel: Form */}
            <div className="p-6 sm:p-8 lg:p-12 flex items-center" style={{ backgroundColor: "var(--bg-light)" }}>
              <div className="max-w-md mx-auto w-full">
                
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--text)" }}>
                    {needsVerification ? "Verify Email" : isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
                    {needsVerification 
                      ? "Enter the code sent to your email" 
                      : isSignUp 
                      ? "Sign up to start optimizing resumes" 
                      : "Sign in to continue"}
                  </p>
                </div>

                {/* Form - Fixed height prevents jumping */}
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" style={{ minHeight: "400px" }}>
                  
                  {needsVerification ? (
                    /* Verification Code Input */
                    <div>
                      <Label htmlFor="code" className="text-gray-700 dark:text-gray-300">
                        Verification Code
                      </Label>
                      <Input
                        id="code"
                        name="code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-center text-2xl tracking-widest"
                      />
                      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                        Check your email for the verification code
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Name field (sign up only) */}
                      {isSignUp && (
                        <div>
                          <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
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
                            className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                          />
                        </div>
                      )}

                      {/* Email */}
                      <div>
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
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
                          className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                          Password
                        </Label>
                        <div className="relative mt-1">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            className="pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {isSignUp && (
                          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                            Must be 8+ characters with uppercase, lowercase, and numbers
                          </p>
                        )}
                      </div>

                      {/* Remember me (sign in only) */}
                      {!isSignUp && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="rememberMe"
                              checked={formData.rememberMe}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, rememberMe: checked as boolean })
                              }
                            />
                            <Label htmlFor="rememberMe" className="text-sm cursor-pointer text-gray-700 dark:text-gray-300">
                              Remember me
                            </Label>
                          </div>
                          <a href="#" className="text-sm" style={{ color: "var(--primary)" }}>
                            Forgot password?
                          </a>
                        </div>
                      )}
                    </>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full touch-manipulation"
                    style={{ 
                      background: "linear-gradient(to right, var(--primary), var(--secondary))",
                      color: "var(--bg-light)",
                      minHeight: "48px"
                    }}
                  >
                    {isLoading 
                      ? 'Loading...' 
                      : needsVerification 
                      ? 'Verify Email'
                      : isSignUp 
                      ? 'Create Account' 
                      : 'Sign In'}
                  </Button>

                  {/* Toggle or Back */}
                  {!needsVerification && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setFormData({ name: '', email: '', password: '', rememberMe: false });
                        }}
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {isSignUp ? (
                          <>Already have an account? <span className="font-semibold" style={{ color: "var(--primary)" }}>Sign In</span></>
                        ) : (
                          <>Don't have an account? <span className="font-semibold" style={{ color: "var(--primary)" }}>Sign Up</span></>
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
                        style={{ color: "var(--primary)" }}
                      >
                        Back to Sign In
                      </button>
                    </div>
                  )}
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                  <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
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
