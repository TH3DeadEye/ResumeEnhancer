import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";

export function SignInPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        imageRef.current,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out" },
      ).fromTo(
        formRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out" },
        "-=0.7",
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        },
      );
    }
  }, [isSignUp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      toast.success(
        "Account created successfully! Welcome to AI Resume Enhancer.",
      );
    } else {
      toast.success(
        "Signed in successfully! Redirecting to dashboard...",
      );
    }

    setFormData({
      name: "",
      email: "",
      password: "",
      rememberMe: false,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div
              ref={imageRef}
              className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-12 flex flex-col justify-center items-center text-white"
            >
              <div className="absolute inset-0 opacity-10">
                <img
                  src="https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NzAwNjM4MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="AI Technology"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 mx-auto">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
                    <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI
                    </span>
                  </div>
                </div>

                <h1 className="text-4xl font-bold mb-4">
                  AI Resume Enhancer
                </h1>
                <p className="text-xl mb-8 text-blue-100">
                  Transform your resume with the power of AI
                </p>

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

            <div ref={formRef} className="p-12">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isSignUp
                      ? "Create Account"
                      : "Welcome Back"}
                  </h2>
                  <p className="text-gray-600">
                    {isSignUp
                      ? "Sign up to start optimizing your resumes"
                      : "Sign in to your account to continue"}
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {isSignUp && (
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required={isSignUp}
                        placeholder="John Doe"
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        name="password"
                        type={
                          showPassword ? "text" : "password"
                        }
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {!isSignUp && (
                    <div className="flex items-center justify-between">
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
                          className="text-sm cursor-pointer"
                        >
                          Remember me
                        </Label>
                      </div>
                      <a
                        href="#"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Forgot password?
                      </a>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isSignUp ? "Create Account" : "Sign In"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-sm text-gray-600 hover:text-blue-600"
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

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs text-center text-gray-500">
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
      <Toaster />
    </div>
  );
}