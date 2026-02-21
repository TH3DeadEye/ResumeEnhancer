import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";

/**
 * SIGN IN / SIGN UP PAGE COMPONENT
 * 
 * Enhanced authentication page featuring:
 * - Smooth two-panel entrance animations
 * - Form toggle animations with morphing effect
 * - Input focus micro-interactions
 * - Password visibility toggle with animation
 * - Floating feature list items
 * - Button hover and click feedback
 */

export function SignInPage() {
  // ============================================================
  // REFS - For GSAP animations
  // ============================================================
  
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  // ============================================================
  // ENTRANCE ANIMATIONS - Initial page load
  // ============================================================
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mainTimeline = gsap.timeline();

      // ──────────────────────────────────────────────────────────
      // ANIMATION 1: Left panel slides in with 3D effect
      // ──────────────────────────────────────────────────────────
      mainTimeline.fromTo(
        imageRef.current,
        { x: -120, opacity: 0, rotateY: -15 },
        { 
          x: 0, 
          opacity: 1, 
          rotateY: 0,
          duration: 1.2, 
          ease: "power3.out"
        },
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 2: Logo bounce in
      // ──────────────────────────────────────────────────────────
      mainTimeline.fromTo(
        logoRef.current,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.6)"
        },
        "-=0.8"
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 3: Feature list items float in with stagger
      // ──────────────────────────────────────────────────────────
      const featureItems = imageRef.current?.querySelectorAll(".feature-item");
      if (featureItems) {
        mainTimeline.fromTo(
          Array.from(featureItems),
          { x: -30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out"
          },
          "-=0.6"
        );
      }

      // ──────────────────────────────────────────────────────────
      // ANIMATION 4: Right panel (form) slides in
      // ──────────────────────────────────────────────────────────
      mainTimeline.fromTo(
        formRef.current,
        { x: 120, opacity: 0, rotateY: 15 },
        { 
          x: 0, 
          opacity: 1, 
          rotateY: 0,
          duration: 1.2, 
          ease: "power3.out" 
        },
        "-=1.0"
      );

      // ──────────────────────────────────────────────────────────
      // ANIMATION 5: Input focus animations
      // ──────────────────────────────────────────────────────────
      const inputs = formRef.current?.querySelectorAll("input");
      inputs?.forEach((input) => {
        input.addEventListener("focus", () => {
          gsap.to(input, {
            scale: 1.02,
            borderColor: "rgb(59, 130, 246)",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
            duration: 0.3,
            ease: "power2.out"
          });
        });

        input.addEventListener("blur", () => {
          gsap.to(input, {
            scale: 1,
            boxShadow: "none",
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });

      // ──────────────────────────────────────────────────────────
      // ANIMATION 6: Continuous floating animation for features
      // ──────────────────────────────────────────────────────────
      if (featureItems) {
        featureItems.forEach((item, index) => {
          gsap.to(item, {
            y: -5,
            duration: 2 + (index * 0.3),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
          });
        });
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ============================================================
  // TOGGLE ANIMATION - Smooth transition without size jump
  // ============================================================
  
  useEffect(() => {
    if (formRef.current) {
      // Simple fade animation to prevent jumping
      gsap.fromTo(
        formRef.current,
        { 
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        },
      );
    }
  }, [isSignUp]);

  // ============================================================
  // FORM HANDLERS
  // ============================================================
  
  /**
   * Handles form submission with animation feedback
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Button click feedback animation
    const submitButton = formRef.current?.querySelector("button[type='submit']");
    if (submitButton) {
      gsap.to(submitButton, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }

    // Show success message
    if (isSignUp) {
      toast.success("Account created successfully! Welcome to AI Resume Enhancer.");
    } else {
      toast.success("Signed in successfully! Redirecting to dashboard...");
    }

    // Reset form
    setFormData({
      name: "",
      email: "",
      password: "",
      rememberMe: false,
    });
  };

  /**
   * Updates form state on input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  /**
   * Toggles password visibility with animation
   */
  const togglePasswordVisibility = () => {
    const eyeIcon = formRef.current?.querySelector(".password-toggle-icon");
    if (eyeIcon) {
      gsap.to(eyeIcon, {
        rotation: 180,
        duration: 0.3,
        ease: "power2.out"
      });
    }
    setShowPassword(!showPassword);
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ 
        background: "linear-gradient(to bottom right, var(--bg), var(--bg-light), var(--bg))"
      }}
    >
      <div className="max-w-6xl w-full">
        <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-light)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ perspective: "1000px" }}>
            
            {/* ============================================================ */}
            {/* LEFT PANEL: Branding with floating elements */}
            {/* ============================================================ */}
            <div
              ref={imageRef}
              className="relative p-12 flex flex-col justify-center items-center"
              style={{ 
                transformStyle: "preserve-3d",
                background: "linear-gradient(to bottom right, var(--primary), var(--secondary))",
                color: "var(--bg-light)"
              }}
            >
              {/* Background image */}
              <div className="absolute inset-0 opacity-10">
                <img
                  src="https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzAwNjM4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="AI Technology"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* App Icon with bounce animation */}
                <div 
                  ref={logoRef}
                  className="w-20 h-20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 mx-auto"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--bg-light)" }}>
                    <span 
                      className="text-4xl font-bold"
                      style={{ 
                        background: "linear-gradient(to bottom right, var(--primary), var(--secondary))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                      }}
                    >
                      AI
                    </span>
                  </div>
                </div>

                {/* App Name & Tagline */}
                <h1 className="text-4xl font-bold mb-4">
                  AI Resume Enhancer
                </h1>
                <p className="text-xl mb-8 text-blue-100">
                  Transform your resume with the power of AI
                </p>

                {/* Feature List with floating animation */}
                <div className="space-y-4 text-left max-w-md mx-auto">
                  <div className="feature-item flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-blue-100">AI-Powered Tailoring</span>
                  </div>
                  <div className="feature-item flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-blue-100">ATS Optimization</span>
                  </div>
                  <div className="feature-item flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-blue-100">100% Secure & Private</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT PANEL: Form with micro-interactions */}
            {/* ============================================================ */}
            <div 
              ref={formRef} 
              className="p-12 flex items-center"
              style={{ 
                transformStyle: "preserve-3d",
                backgroundColor: "var(--bg-light)"
              }}
            >
              <div className="max-w-md mx-auto w-full">
                
                {/* Form Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text)" }}>
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p style={{ color: "var(--text-muted)" }}>
                    {isSignUp
                      ? "Sign up to start optimizing your resumes"
                      : "Sign in to your account to continue"}
                  </p>
                </div>

                {/* Sign In / Sign Up Form - Fixed height container to prevent jumping */}
                <form onSubmit={handleSubmit} className="space-y-6" style={{ minHeight: "400px" }}>
                  
                  {/* Full Name Field - Only in Sign Up */}
                  {isSignUp && (
                    <div className="animate-in fade-in duration-200">
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
                        placeholder="John Doe"
                        className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-all"
                      />
                    </div>
                  )}

                  {/* Email Field */}
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
                      placeholder="you@example.com"
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-all"
                    />
                  </div>

                  {/* Password Field with visibility toggle */}
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
                        placeholder="••••••••"
                        className="pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="password-toggle-icon absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password - Sign In only */}
                  {!isSignUp && (
                    <div className="flex items-center justify-between animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="rememberMe"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              rememberMe: checked as boolean,
                            })
                          }
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-sm cursor-pointer text-gray-700 dark:text-gray-300"
                        >
                          Remember me
                        </Label>
                      </div>
                      
                      <a
                        href="#"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Forgot password?
                      </a>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full transition-all"
                    style={{ 
                      background: "linear-gradient(to right, var(--primary), var(--secondary))",
                      color: "var(--bg-light)"
                    }}
                  >
                    {isSignUp ? "Create Account" : "Sign In"}
                  </Button>

                  {/* Toggle between Sign In / Sign Up */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {isSignUp ? (
                        <>
                          Already have an account?{" "}
                          <span className="font-semibold">Sign In</span>
                        </>
                      ) : (
                        <>
                          Don't have an account?{" "}
                          <span className="font-semibold">Sign Up</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer Text */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                    <br />
                    Powered by AWS Cognito for secure authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
