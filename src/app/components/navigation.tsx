import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import gsap from "gsap";

interface NavigationProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navigation({ onNavigate, currentPage }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white/90 backdrop-blur-sm shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate("landing")}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className={`text-xl font-bold ${isScrolled ? "text-gray-900" : "text-gray-900"}`}>
                Resume Enhancer
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {currentPage === "landing" ? (
              <>
                <button
                  onClick={() => scrollToSection("home")}
                  className={`transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-blue-600" : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className={`transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-blue-600" : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className={`transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-blue-600" : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  About Us
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className={`transition-colors ${
                    isScrolled ? "text-gray-700 hover:text-blue-600" : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Contact
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate("landing")}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Back to Home
              </button>
            )}
            <Button
              onClick={() => onNavigate("signin")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Sign In
            </Button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden ${isScrolled ? "text-gray-900" : "text-gray-900"}`}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-6 space-y-4">
              {currentPage === "landing" ? (
                <>
                  <button
                    onClick={() => scrollToSection("home")}
                    className="block w-full text-left text-gray-700 hover:text-blue-600"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="block w-full text-left text-gray-700 hover:text-blue-600"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="block w-full text-left text-gray-700 hover:text-blue-600"
                  >
                    About Us
                  </button>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="block w-full text-left text-gray-700 hover:text-blue-600"
                  >
                    Contact
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigate("landing")}
                  className="block w-full text-left text-gray-700 hover:text-blue-600"
                >
                  Back to Home
                </button>
              )}
              <Button
                onClick={() => onNavigate("signin")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}