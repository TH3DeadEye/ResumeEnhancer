import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Target, Users, Rocket } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image animation with scrub
      gsap.fromTo(
        imageRef.current,
        {
          x: -150,
          opacity: 0,
          scale: 0.9,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "top 20%",
            scrub: 1.5,
            toggleActions: "play none none reverse",
          },
        }
      );

      // Content animation with scrub
      gsap.fromTo(
        contentRef.current,
        {
          x: 150,
          opacity: 0,
          scale: 0.9,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "top 20%",
            scrub: 1.5,
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animate individual value cards
      const valueCards = gsap.utils.toArray(".about-value-card");
      valueCards.forEach((card: any, index: number) => {
        gsap.fromTo(
          card,
          {
            x: 50,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              end: "top 50%",
              scrub: 1,
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div ref={imageRef} className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1739298061740-5ed03045b280?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG9mZmljZXxlbnwxfHx8fDE3NzAxNTUwNTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-6">
              <div className="text-4xl font-bold text-blue-600">KMR</div>
              <div className="text-sm text-gray-600">Team</div>
            </div>
          </div>

          <div ref={contentRef}>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
              About Our Project
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              The <span className="font-semibold text-blue-600">AI Resume Enhancer</span> is a
              cutting-edge, cloud-native web application developed as part of the{" "}
              <span className="font-semibold">COMP 2154 System Development Project</span>. Our
              mission is to revolutionize the job application process for students and
              professionals.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Built on a serverless AWS architecture using Lambda, S3, DynamoDB, and Amazon
              Bedrock, our platform leverages Generative AI to automatically tailor resumes to
              specific job descriptions, helping candidates bypass ATS filters and increase their
              interview success rate.
            </p>

            <div className="space-y-4">
              <div className="about-value-card flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-gray-900">Our Mission</h3>
                  <p className="text-gray-600">
                    Eliminate application fatigue and help job seekers land more interviews with
                    AI-powered resume optimization.
                  </p>
                </div>
              </div>

              <div className="about-value-card flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-gray-900">The Team</h3>
                  <p className="text-gray-600">
                    Developed by Team KMR: Arman Milani and Ramtin Loghmani, dedicated to building
                    innovative solutions.
                  </p>
                </div>
              </div>

              <div className="about-value-card flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Rocket className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 text-gray-900">Our Vision</h3>
                  <p className="text-gray-600">
                    Create a scalable, serverless platform that evolves into an autonomous job
                    application assistant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}