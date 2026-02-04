import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { AboutSection } from "./about-section";
import { ContactSection } from "./contact-section";
import { LandingFooter } from "./landing-footer";
import { Toaster } from "./ui/sonner";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="size-full">
      <HeroSection onGetStarted={onGetStarted} />
      <FeaturesSection />
      <AboutSection />
      <ContactSection />
      <LandingFooter />
      <Toaster />
    </div>
  );
}
