'use client';

import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "sonner";

gsap.registerPlugin(ScrollTrigger);

// ── Component ─────────────────────────────────────────────────────────────────

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unified scroll animation: label → headline → subtext → form card
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-animate",
        { opacity: 0, y: 32, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Message sent! We'll get back to you soon.");
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.info(data.message);
      }
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{
        backgroundColor: "var(--bg-subtle)",
        padding: "120px max(24px, 10%)",
      }}
    >
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        {/* Header */}
        <div className="contact-animate" style={{ marginBottom: "40px" }}>
          <span
            className="block text-xs font-medium uppercase tracking-widest mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Contact
          </span>
          <h2
            style={{
              fontWeight: 300,
              fontSize: "clamp(2rem, 3vw, 3rem)",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              marginBottom: "0.75rem",
            }}
          >
            Say hello.
          </h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.65 }}>
            Questions, feedback, or just curious? We read everything.
          </p>
        </div>

        {/* Form card */}
        <div
          className="contact-animate"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-xl)",
            padding: "40px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: "20px" }}>
            {/* Name */}
            <div>
              <label
                htmlFor="contact-name"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Name
              </label>
              <Input
                id="contact-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
                style={{
                  backgroundColor: "var(--bg-sunken)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="contact-email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Email
              </label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                style={{
                  backgroundColor: "var(--bg-sunken)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="contact-message"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                Message
              </label>
              <Textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="What's on your mind?"
                style={{
                  backgroundColor: "var(--bg-sunken)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                  resize: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium transition-all"
              style={{
                backgroundColor: "var(--accent)",
                color: "white",
                borderRadius: "var(--radius-md)",
                padding: "12px 24px",
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting)
                  e.currentTarget.style.backgroundColor = "var(--accent-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent)";
              }}
            >
              {isSubmitting ? "Sending…" : "Send message"}
              {!isSubmitting && <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
