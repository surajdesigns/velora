import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

const SERVICES = [
  { id: "website-dev", label: "Website Development", icon: "🌐" },
  { id: "landing-page", label: "Landing Page", icon: "🚀" },
  { id: "ecommerce", label: "E-commerce Website", icon: "🛒" },
  { id: "wordpress", label: "WordPress Website", icon: "⚙️" },
  { id: "seo", label: "SEO Optimization", icon: "📈" },
  { id: "technical-seo", label: "Technical SEO", icon: "🔍" },
  { id: "local-seo", label: "Local SEO", icon: "📍" },
  { id: "social-media", label: "Social Media Management", icon: "📱" },
  { id: "instagram", label: "Instagram Growth", icon: "✨" },
  { id: "content", label: "Content Creation", icon: "✍️" },
  { id: "branding", label: "Branding", icon: "🎨" },
  { id: "logo", label: "Logo Design", icon: "💎" },
  { id: "redesign", label: "Website Redesign", icon: "🔄" },
  { id: "maintenance", label: "Website Maintenance", icon: "🛠️" },
];

const BUDGETS = [
  "Under $500",
  "$500 – $1,000",
  "$1,000 – $3,000",
  "$3,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
];

const TIMELINES = [
  "ASAP (1–2 weeks)",
  "1 month",
  "2–3 months",
  "3–6 months",
  "Flexible",
];

interface FormData {
  name: string;
  email: string;
  business: string;
  website: string;
  budget: string;
  timeline: string;
}

function ServiceCard({
  service,
  selected,
  onToggle,
  delay,
}: {
  service: (typeof SERVICES)[0];
  selected: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    gsap.from(ref.current, {
      opacity: 0,
      y: 28,
      scale: 0.94,
      duration: 0.5,
      delay,
      ease: "power3.out",
    });
  }, [delay]);

  const handleMouseEnter = () => {
    if (selected) return;
    gsap.to(ref.current, {
      y: -4,
      scale: 1.03,
      duration: 0.22,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    if (selected) return;
    gsap.to(ref.current, {
      y: 0,
      scale: 1,
      duration: 0.28,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleClick = () => {
    gsap.to(ref.current, {
      scale: 0.96,
      duration: 0.08,
      ease: "power2.in",
      yoyo: true,
      repeat: 1,
      onComplete: onToggle,
    });
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative text-left rounded-2xl p-4 transition-colors duration-200 focus:outline-none"
      style={{
        background: selected
          ? "linear-gradient(135deg, rgba(85,51,255,0.18) 0%, rgba(136,68,255,0.12) 100%)"
          : "rgba(255,255,255,0.03)",
        border: selected
          ? "1.5px solid rgba(120,90,255,0.65)"
          : "1.5px solid rgba(130,100,255,0.12)",
        boxShadow: selected
          ? "0 0 24px rgba(100,60,255,0.22), inset 0 0 16px rgba(120,80,255,0.06)"
          : "none",
        willChange: "transform, box-shadow",
        cursor: "pointer",
      }}
    >
      {selected && (
        <span
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-xs"
          style={{
            background: "linear-gradient(135deg, #5533ff, #8844ff)",
            boxShadow: "0 0 10px rgba(100,60,255,0.6)",
          }}
        >
          ✓
        </span>
      )}
      <div className="text-2xl mb-2">{service.icon}</div>
      <div
        className="text-sm font-medium leading-snug"
        style={{ color: selected ? "rgba(220,210,255,0.95)" : "rgba(180,170,220,0.75)" }}
      >
        {service.label}
      </div>
    </button>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-400"
            style={{
              background:
                i < current
                  ? "linear-gradient(135deg, #5533ff, #8844ff)"
                  : i === current
                  ? "rgba(85,51,255,0.15)"
                  : "rgba(255,255,255,0.05)",
              border:
                i === current
                  ? "1.5px solid rgba(120,90,255,0.7)"
                  : i < current
                  ? "none"
                  : "1.5px solid rgba(130,100,255,0.12)",
              color:
                i <= current ? "rgba(220,210,255,0.95)" : "rgba(140,130,180,0.5)",
              boxShadow:
                i === current ? "0 0 16px rgba(100,60,255,0.35)" : "none",
            }}
          >
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className="h-px flex-1"
              style={{
                width: 40,
                background:
                  i < current - 1
                    ? "linear-gradient(90deg, #5533ff, #8844ff)"
                    : "rgba(130,100,255,0.15)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function StartProject() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    business: "",
    website: "",
    budget: "",
    timeline: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);

  const selectedServices = SERVICES.filter((s) => selected.has(s.id));

  const autoMessage =
    selectedServices.length > 0 || form.budget || form.timeline
      ? `Hello Velora Studio, I want help with ${
          selectedServices.length > 0
            ? selectedServices.map((s) => s.label).join(", ")
            : "[services]"
        }. My budget is ${form.budget || "[budget]"} and timeline is ${
          form.timeline || "[timeline]"
        }.`
      : "";

  const toggleService = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const animatePanel = () => {
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 24, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }
    );
  };

  const goTo = (n: number) => {
    gsap.to(panelRef.current, {
      opacity: 0,
      y: -16,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => {
        setStep(n);
        animatePanel();
      },
    });
  };

  useEffect(() => {
    animatePanel();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      name: form.name,
      email: form.email,
      business: form.business,
      website: form.website,
      budget: form.budget,
      timeline: form.timeline,
      services: selectedServices.map((s) => s.label).join(", "),
      message: autoMessage,
    };

    try {
      const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        gsap.from(".success-card", {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          ease: "back.out(1.5)",
        });
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-[#06060e] text-white"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(80,40,200,0.13) 0%, transparent 70%)",
          zIndex: 0,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-5 py-16" style={{ zIndex: 1 }}>
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-12 transition-opacity hover:opacity-100"
          style={{ color: "rgba(150,140,200,0.6)", opacity: 0.7 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to home
        </a>

        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-widest uppercase mb-5"
            style={{
              borderColor: "rgba(100,80,255,0.3)",
              background: "rgba(60,30,180,0.12)",
              color: "rgba(180,160,255,0.85)",
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#7c5cff", boxShadow: "0 0 6px #7c5cff" }}
            />
            Start a Project
          </div>
          <h1
            className="font-extrabold leading-tight"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #ffffff 0%, #c0b4ff 50%, #8866ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Let's build something
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #6644ff, #aa55ff, #4488ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              great together.
            </span>
          </h1>
          <p className="mt-4 text-base" style={{ color: "rgba(170,160,210,0.65)" }}>
            Tell us what you need — we'll handle the rest.
          </p>
        </div>

        <StepIndicator current={step} total={3} />

        <div ref={panelRef}>
          {!submitted ? (
            <>
              {step === 0 && (
                <div>
                  <h2
                    className="text-xl font-semibold mb-2"
                    style={{ color: "rgba(220,210,255,0.9)" }}
                  >
                    Select your services
                  </h2>
                  <p className="text-sm mb-7" style={{ color: "rgba(160,150,200,0.6)" }}>
                    Choose one or more — you can pick as many as you need.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                    {SERVICES.map((s, i) => (
                      <ServiceCard
                        key={s.id}
                        service={s}
                        selected={selected.has(s.id)}
                        onToggle={() => toggleService(s.id)}
                        delay={i * 0.04}
                      />
                    ))}
                  </div>

                  {selected.size > 0 && (
                    <div
                      className="mb-6 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
                      style={{
                        background: "rgba(85,51,255,0.1)",
                        border: "1px solid rgba(120,90,255,0.2)",
                        color: "rgba(200,190,255,0.8)",
                      }}
                    >
                      <span style={{ color: "#7c5cff" }}>✓</span>
                      <span>
                        <strong style={{ color: "rgba(220,210,255,0.95)" }}>
                          {selected.size} service{selected.size > 1 ? "s" : ""}
                        </strong>{" "}
                        selected:{" "}
                        {selectedServices.map((s) => s.label).join(", ")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => selected.size > 0 && goTo(1)}
                      disabled={selected.size === 0}
                      className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200"
                      style={{
                        background:
                          selected.size > 0
                            ? "linear-gradient(135deg, #5533ff 0%, #8844ff 100%)"
                            : "rgba(255,255,255,0.06)",
                        color: selected.size > 0 ? "#fff" : "rgba(160,150,200,0.4)",
                        boxShadow:
                          selected.size > 0
                            ? "0 0 30px rgba(100,50,255,0.4)"
                            : "none",
                        cursor: selected.size > 0 ? "pointer" : "not-allowed",
                        border:
                          selected.size > 0
                            ? "none"
                            : "1px solid rgba(130,100,255,0.12)",
                      }}
                    >
                      Continue
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3 8h10M9 4l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); goTo(2); }}>
                  <h2
                    className="text-xl font-semibold mb-2"
                    style={{ color: "rgba(220,210,255,0.9)" }}
                  >
                    Tell us about your project
                  </h2>
                  <p className="text-sm mb-7" style={{ color: "rgba(160,150,200,0.6)" }}>
                    Fill in a few details so we can prepare the right proposal.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Field
                      label="Your Name"
                      required
                      value={form.name}
                      onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                      placeholder="Jane Smith"
                    />
                    <Field
                      label="Email Address"
                      type="email"
                      required
                      value={form.email}
                      onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                      placeholder="jane@company.com"
                    />
                    <Field
                      label="Business Name"
                      required
                      value={form.business}
                      onChange={(v) => setForm((f) => ({ ...f, business: v }))}
                      placeholder="Acme Inc."
                    />
                    <Field
                      label="Website URL"
                      type="url"
                      value={form.website}
                      onChange={(v) => setForm((f) => ({ ...f, website: v }))}
                      placeholder="https://yoursite.com (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <SelectField
                      label="Budget Range"
                      required
                      value={form.budget}
                      onChange={(v) => setForm((f) => ({ ...f, budget: v }))}
                      options={BUDGETS}
                      placeholder="Select budget"
                    />
                    <SelectField
                      label="Timeline"
                      required
                      value={form.timeline}
                      onChange={(v) => setForm((f) => ({ ...f, timeline: v }))}
                      options={TIMELINES}
                      placeholder="Select timeline"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => goTo(0)}
                      className="text-sm transition-opacity hover:opacity-100"
                      style={{ color: "rgba(150,140,200,0.6)", opacity: 0.7 }}
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold"
                      style={{
                        background: "linear-gradient(135deg, #5533ff 0%, #8844ff 100%)",
                        color: "#fff",
                        boxShadow: "0 0 30px rgba(100,50,255,0.4)",
                      }}
                    >
                      Preview Summary
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3 8h10M9 4l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit}>
                  <h2
                    className="text-xl font-semibold mb-2"
                    style={{ color: "rgba(220,210,255,0.9)" }}
                  >
                    Review & Submit
                  </h2>
                  <p className="text-sm mb-7" style={{ color: "rgba(160,150,200,0.6)" }}>
                    Everything looks right? Hit send and we'll be in touch.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(130,100,255,0.15)",
                      }}
                    >
                      <div
                        className="text-xs font-semibold uppercase tracking-widest mb-4"
                        style={{ color: "rgba(130,120,200,0.6)" }}
                      >
                        Selected Services
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                              background: "rgba(85,51,255,0.14)",
                              border: "1px solid rgba(120,90,255,0.3)",
                              color: "rgba(200,190,255,0.9)",
                            }}
                          >
                            {s.icon} {s.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(130,100,255,0.15)",
                      }}
                    >
                      <div
                        className="text-xs font-semibold uppercase tracking-widest mb-4"
                        style={{ color: "rgba(130,120,200,0.6)" }}
                      >
                        Project Details
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: "Name", value: form.name },
                          { label: "Email", value: form.email },
                          { label: "Business", value: form.business },
                          ...(form.website
                            ? [{ label: "Website", value: form.website }]
                            : []),
                          { label: "Budget", value: form.budget },
                          { label: "Timeline", value: form.timeline },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between text-sm gap-4">
                            <span style={{ color: "rgba(140,130,190,0.6)" }}>{label}</span>
                            <span
                              className="text-right font-medium"
                              style={{ color: "rgba(210,200,255,0.9)" }}
                            >
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-2xl p-5 mb-6"
                    style={{
                      background: "rgba(85,51,255,0.07)",
                      border: "1px solid rgba(120,90,255,0.2)",
                    }}
                  >
                    <div
                      className="text-xs font-semibold uppercase tracking-widest mb-3"
                      style={{ color: "rgba(130,120,200,0.6)" }}
                    >
                      Auto-generated Message
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "rgba(200,190,255,0.85)" }}
                    >
                      {autoMessage}
                    </p>
                    <textarea
                      name="message"
                      readOnly
                      value={autoMessage}
                      className="hidden"
                      aria-hidden="true"
                    />
                  </div>

                  <input type="hidden" name="services" value={selectedServices.map((s) => s.label).join(", ")} />
                  <input type="hidden" name="name" value={form.name} />
                  <input type="hidden" name="email" value={form.email} />
                  <input type="hidden" name="business" value={form.business} />
                  <input type="hidden" name="website" value={form.website} />
                  <input type="hidden" name="budget" value={form.budget} />
                  <input type="hidden" name="timeline" value={form.timeline} />

                  {error && (
                    <div
                      className="mb-5 rounded-xl px-4 py-3 text-sm"
                      style={{
                        background: "rgba(255,60,60,0.08)",
                        border: "1px solid rgba(255,80,80,0.25)",
                        color: "rgba(255,160,160,0.9)",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => goTo(1)}
                      className="text-sm transition-opacity hover:opacity-100"
                      style={{ color: "rgba(150,140,200,0.6)", opacity: 0.7 }}
                    >
                      ← Edit details
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-all"
                      style={{
                        background: submitting
                          ? "rgba(85,51,255,0.4)"
                          : "linear-gradient(135deg, #5533ff 0%, #8844ff 100%)",
                        color: "#fff",
                        boxShadow: submitting ? "none" : "0 0 30px rgba(100,50,255,0.45)",
                        cursor: submitting ? "not-allowed" : "pointer",
                      }}
                    >
                      {submitting ? (
                        <>
                          <span
                            className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                          />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send Proposal Request
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M2 8l10-6-3 6 3 6-10-6z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div
              className="success-card rounded-3xl p-10 text-center"
              style={{
                background: "rgba(85,51,255,0.08)",
                border: "1px solid rgba(120,90,255,0.25)",
              }}
            >
              <div
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl"
                style={{
                  background: "linear-gradient(135deg, #5533ff, #8844ff)",
                  boxShadow: "0 0 40px rgba(100,60,255,0.5)",
                }}
              >
                ✓
              </div>
              <h2
                className="text-2xl font-bold mb-3"
                style={{
                  background: "linear-gradient(135deg, #fff 0%, #c0b4ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Request Sent!
              </h2>
              <p
                className="text-base mb-8 max-w-sm mx-auto"
                style={{ color: "rgba(180,170,220,0.7)" }}
              >
                Thanks, <strong style={{ color: "rgba(210,200,255,0.9)" }}>{form.name}</strong>! We've received your project brief and will reach out to{" "}
                <strong style={{ color: "rgba(210,200,255,0.9)" }}>{form.email}</strong> within 24 hours.
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(150,130,255,0.2)",
                  color: "rgba(210,200,255,0.85)",
                }}
              >
                ← Back to Home
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: "rgba(160,150,210,0.75)" }}
      >
        {label}
        {required && (
          <span style={{ color: "#7c5cff", marginLeft: 3 }}>*</span>
        )}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: focused
            ? "1.5px solid rgba(120,90,255,0.65)"
            : "1.5px solid rgba(130,100,255,0.15)",
          color: "rgba(220,210,255,0.95)",
          boxShadow: focused ? "0 0 0 3px rgba(100,60,255,0.1)" : "none",
        }}
      />
    </div>
  );
}

function SelectField({
  label,
  required,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: "rgba(160,150,210,0.75)" }}
      >
        {label}
        {required && <span style={{ color: "#7c5cff", marginLeft: 3 }}>*</span>}
      </label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 appearance-none"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: focused
            ? "1.5px solid rgba(120,90,255,0.65)"
            : "1.5px solid rgba(130,100,255,0.15)",
          color: value ? "rgba(220,210,255,0.95)" : "rgba(140,130,180,0.5)",
          boxShadow: focused ? "0 0 0 3px rgba(100,60,255,0.1)" : "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 16 16'%3E%3Cpath stroke='rgba(140,120,220,0.6)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M4 6l4 4 4-4'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center",
          paddingRight: 40,
        }}
      >
        <option value="" disabled style={{ background: "#0e0e1c" }}>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "#0e0e1c", color: "#ddd" }}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
