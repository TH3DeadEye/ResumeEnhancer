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
 * Features:
 * - Toggle between Sign In and Sign Up modes
 * - Smooth entrance animations using GSAP
 * - Password visibility toggle
 * - "Remember Me" checkbox (Sign In only)
 * - Form validation with toast notifications
 * - Responsive two-column layout
 */

export function SignInPage() {
  // ============================================================
  // REFS - For GSAP animations
  // ============================================================
  
  const containerRef = useRef<HTMLDivElement>(null);  // Entire page container
  const formRef = useRef<HTMLDivElement>(null);       // Right side (form)
  const imageRef = useRef<HTMLDivElement>(null);      // Left side (branding)
  
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  
  const [showPassword, setShowPassword] = useState(false);  // Toggle password visibility
  const [isSignUp, setIsSignUp] = useState(false);          // Toggle between Sign In / Sign Up
  
  // Form data state
  const [formData, setFormData] = useState({
    name: "",              // Only used in Sign Up mode
    email: "",
    password: "",
    rememberMe: false,     // Only used in Sign In mode
  });

  // ============================================================
  // ENTRANCE ANIMATIONS (Runs once on page load)
  // ============================================================
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      /**
       * TIMELINE: Two-panel reveal animation
       * Left panel (image) and right panel (form) slide in from opposite sides
       */
      const tl = gsap.timeline();

      // ANIMATION 1: Left panel slides in from left
      tl.fromTo(
        imageRef.current,
        { x: -100, opacity: 0 },  // FROM: 100px to the left, invisible
        { 
          x: 0,                   // TO: original position
          opacity: 1,             // fully visible
          duration: 1,            // takes 1 second
          ease: "power3.out"      // smooth deceleration
        },
      )
      // ANIMATION 2: Right panel slides in from right
      .fromTo(
        formRef.current,
        { x: 100, opacity: 0 },   // FROM: 100px to the right, invisible
        { 
          x: 0, 
          opacity: 1, 
          duration: 1, 
          ease: "power3.out" 
        },
        "-=0.7",  // OVERLAP: Start 0.7 seconds before left panel finishes
                  // Creates simultaneous sliding effect
      );
    }, containerRef);

    // Cleanup on unmount
    return () => ctx.revert();
  }, []); // Run once on mount

  // ============================================================
  // TOGGLE ANIMATION (Runs when switching Sign In ↔ Sign Up)
  // ============================================================
  
  useEffect(() => {
    if (formRef.current) {
      /**
       * ANIMATION: Quick scale/fade effect when switching modes
       * - Prevents jarring instant change when "Full Name" field appears/disappears
       * - Creates smooth transition between Sign In and Sign Up forms
       */
      gsap.fromTo(
        formRef.current,
        { scale: 0.95, opacity: 0 },  // FROM: Slightly smaller, invisible
        {
          scale: 1,                   // TO: Normal size
          opacity: 1,                 // fully visible
          duration: 0.3,              // Quick transition (0.3 seconds)
          ease: "power2.out",
        },
      );
    }
  }, [isSignUp]); // Trigger whenever isSignUp changes

  // ============================================================
  // FORM HANDLERS
  // ============================================================
  
  /**
   * Handles form submission
   * - Shows appropriate success message based on mode
   * - Resets form fields
   * 
   * TO INTEGRATE WITH AWS COGNITO:
   * - Add AWS Cognito SDK calls here
   * - Handle authentication tokens
   * - Redirect to dashboard on success
   * - Handle error cases (invalid credentials, etc.)
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload

    // Show different messages for Sign Up vs Sign In
    if (isSignUp) {
      toast.success(
        "Account created successfully! Welcome to AI Resume Enhancer.",
      );
    } else {
      toast.success(
        "Signed in successfully! Redirecting to dashboard...",
      );
    }

    // Reset form to empty state
    setFormData({
      name: "",
      email: "",
      password: "",
      rememberMe: false,
    });
  };

  /**
   * Updates form state when user types
   * - Handles both text inputs and checkboxes
   * - Uses input name attribute to update correct field
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      // For checkboxes, use 'checked' value; for text inputs, use 'value'
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ============================================================
  // RENDER
  // ============================================================
  
  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* ============================================================ */}
            {/* LEFT PANEL: Branding / Marketing */}
            {/* ============================================================ */}
            <div
              ref={imageRef}
              className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-12 flex flex-col justify-center items-center text-white"
            >
              {/* Background image with low opacity */}
              <div className="absolute inset-0 opacity-10">
                <img
                  src="https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzAwNjM4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="AI Technology"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content overlaying background image */}
              <div className="relative z-10 text-center">
                {/* App Icon */}
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 mx-auto">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                    <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
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

                {/* Feature List */}
                <div className="space-y-4 text-left max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-blue-100">
                      AI-Powered Tailoring
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-blue-100">
                      ATS Optimization
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="text-blue-100">
                      100% Secure & Private
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT PANEL: Sign In / Sign Up Form */}
            {/* ============================================================ */}
            <div ref={formRef} className="p-12 flex items-center bg-white dark:bg-gray-800">
              <div className="max-w-md mx-auto w-full">
                
                {/* Form Header - Changes based on isSignUp state */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {isSignUp
                      ? "Create Account"
                      : "Welcome Back"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isSignUp
                      ? "Sign up to start optimizing your resumes"
                      : "Sign in to your account to continue"}
                  </p>
                </div>

                {/* Sign In / Sign Up Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* ============================================================ */}
                  {/* FULL NAME FIELD - Only visible in Sign Up mode */}
                  {/* ============================================================ */}
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
                        required={isSignUp}  // Only required in Sign Up mode
                        placeholder="John Doe"
                        className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* EMAIL FIELD - Always visible */}
                  {/* ============================================================ */}
                  <div>
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"  // HTML5 email validation
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* ============================================================ */}
                  {/* PASSWORD FIELD with visibility toggle */}
                  {/* ============================================================ */}
                  <div>
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                      Password
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}  // Toggle type
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        className="pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                      {/* Eye icon button to toggle password visibility */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />  // Closed eye = hide password
                        ) : (
                          <Eye className="h-5 w-5" />     // Open eye = show password
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ============================================================ */}
                  {/* REMEMBER ME & FORGOT PASSWORD - Only in Sign In mode */}
                  {/* ============================================================ */}
                  {!isSignUp && (
                    <div className="flex items-center justify-between animate-in fade-in duration-200">
                      {/* Remember Me checkbox */}
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
                      
                      {/* Forgot password link */}
                      <a
                        href="#"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Forgot password?
                      </a>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* SUBMIT BUTTON - Text changes based on mode */}
                  {/* ============================================================ */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isSignUp ? "Create Account" : "Sign In"}
                  </Button>

                  {/* ============================================================ */}
                  {/* TOGGLE BETWEEN SIGN IN / SIGN UP */}
                  {/* ============================================================ */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}  // Toggle mode
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {isSignUp ? (
                        <>
                          Already have an account?{" "}
                          <span className="font-semibold">
                            Sign In
                          </span>
                        </>
                      ) : (
                        <>
                          Don't have an account?{" "}
                          <span className="font-semibold">
                            Sign Up
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer Text */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    By continuing, you agree to our Terms of
                    Service and Privacy Policy.
                    <br />
                    Powered by AWS Cognito for secure
                    authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast notifications container */}
      <Toaster />
    </div>
  );
}
