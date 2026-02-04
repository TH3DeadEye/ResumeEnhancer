import { useEffect, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Bot, Zap, Shield, FileText, TrendingUp, Clock } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Bot,
    title: "AI-Powered Tailoring",
    description:
      "Advanced Amazon Bedrock AI analyzes job descriptions and optimizes your resume with relevant keywords and skills.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Get your tailored resume in under 30 seconds. Our serverless architecture ensures instant processing.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description:
      "Your data is encrypted at rest and in transit. Built on AWS with enterprise-grade security standards.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: FileText,
    title: "PDF Support",
    description:
      "Upload your resume in PDF format and download the tailored version ready to submit immediately.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: TrendingUp,
    title: "ATS Optimization",
    description:
      "Bypass Applicant Tracking Systems with AI-optimized formatting and keyword placement.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Clock,
    title: "Save Hours",
    description:
      "Stop manually customizing resumes. Let AI do the heavy lifting while you focus on interview prep.",
    color: "from-pink-500 to-rose-500",
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation with scrub
      gsap.fromTo(
        titleRef.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            end: "top 30%",
            scrub: 1,
            toggleActions: "play none none reverse",
          },
        }
      );

      // Cards animation with scrub - each card animates individually
      const cards = gsap.utils.toArray(".feature-card");
      cards.forEach((card: any, index: number) => {
        gsap.fromTo(
          card,
          {
            y: 100,
            opacity: 0,
            scale: 0.9,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              end: "top 40%",
              scrub: 1.5,
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            Powerful Features for Job Seekers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create perfect, tailored resumes that get noticed by recruiters
            and pass ATS filters.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="feature-card border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}