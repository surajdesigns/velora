import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(0, 0, 5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0x8866ff, 0.5));

    const bluePoint = new THREE.PointLight(0x4488ff, 4, 20);
    bluePoint.position.set(-3, 3, 3);
    scene.add(bluePoint);

    const purplePoint = new THREE.PointLight(0xaa44ff, 4, 20);
    purplePoint.position.set(3, -2, 2);
    scene.add(purplePoint);

    const whitePoint = new THREE.PointLight(0xffffff, 1.5, 15);
    whitePoint.position.set(0, 4, 4);
    scene.add(whitePoint);

    // Logo group — GLTF model
    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    // Gradient palette for the 4 meshes: deep blue → indigo → violet → purple
    const meshColors = [
      { color: 0x1a2eaa, emissive: 0x2233cc, emissiveIntensity: 0.55 },
      { color: 0x2d22bb, emissive: 0x4433ee, emissiveIntensity: 0.65 },
      { color: 0x5522cc, emissive: 0x7744ff, emissiveIntensity: 0.7 },
      { color: 0x8833ee, emissive: 0xaa55ff, emissiveIntensity: 0.75 },
    ];

    const loader = new GLTFLoader();
    loader.load(
      "/logo_model.gltf",
      (gltf) => {
        const model = gltf.scene;

        // Center model using its bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        // Scale model to fit nicely in view
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 2.8;
        const scaleFactor = targetSize / maxDim;
        model.scale.setScalar(scaleFactor);

        // Re-center after scale
        const box2 = new THREE.Box3().setFromObject(model);
        const center2 = new THREE.Vector3();
        box2.getCenter(center2);
        model.position.sub(center2);

        // Apply premium gradient materials to each mesh
        let meshIdx = 0;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const cfg = meshColors[meshIdx % meshColors.length];
            (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
              color: cfg.color,
              emissive: cfg.emissive,
              emissiveIntensity: cfg.emissiveIntensity,
              metalness: 0.85,
              roughness: 0.12,
            });
            meshIdx++;
          }
        });

        logoGroup.add(model);

        // Glow halo behind the model
        const glowCanvas = document.createElement("canvas");
        glowCanvas.width = 256; glowCanvas.height = 256;
        const gc = glowCanvas.getContext("2d")!;
        const grad = gc.createRadialGradient(128, 128, 10, 128, 128, 128);
        grad.addColorStop(0,    "rgba(110, 60, 255, 0.5)");
        grad.addColorStop(0.4,  "rgba(80,  40, 200, 0.2)");
        grad.addColorStop(1,    "rgba(40,  10, 180, 0)");
        gc.fillStyle = grad;
        gc.fillRect(0, 0, 256, 256);
        const glowPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(5.5, 5.5),
          new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(glowCanvas),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        glowPlane.position.z = -0.3;
        logoGroup.add(glowPlane);

        // GSAP spring entrance
        logoGroup.scale.set(0, 0, 0);
        gsap.to(logoGroup.scale, {
          x: 1, y: 1, z: 1,
          duration: 1.5,
          ease: "elastic.out(1, 0.55)",
          delay: 0.3,
        });
      },
      undefined,
      (err) => console.error("GLTF load error", err)
    );

    // Particles
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 180 : 360;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 1.8 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
      const t = Math.random();
      particleColors[i * 3] = 0.2 + t * 0.5;
      particleColors[i * 3 + 1] = 0.05 + (1 - t) * 0.08;
      particleColors[i * 3 + 2] = 0.85 + t * 0.15;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    scene.add(particles);

    // Orbital rings
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.007, 16, 130),
      new THREE.MeshBasicMaterial({ color: 0x5566ff, transparent: true, opacity: 0.4 })
    );
    ring1.rotation.x = Math.PI / 5;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.005, 16, 130),
      new THREE.MeshBasicMaterial({ color: 0x9933ff, transparent: true, opacity: 0.22 })
    );
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 6;
    scene.add(ring2);

    // Mouse tracking
    let targetRotX = 0, targetRotY = 0, currentRotX = 0, currentRotY = 0;
    let mouse = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
      targetRotY = mouse.x * 0.5;
      targetRotX = mouse.y * 0.35;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        mouse.y = -(e.touches[0].clientY / window.innerHeight - 0.5) * 2;
        targetRotY = mouse.x * 0.5;
        targetRotX = mouse.y * 0.35;
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      logoGroup.rotation.y = currentRotY + Math.sin(t * 0.35) * 0.06;
      logoGroup.rotation.x = currentRotX + Math.cos(t * 0.28) * 0.04;
      logoGroup.position.y = Math.sin(t * 0.5) * 0.14;

      particles.rotation.y = t * 0.045 + currentRotY * 0.2;
      particles.rotation.x = t * 0.028 + currentRotX * 0.15;

      ring1.rotation.y = t * 0.14;
      ring1.rotation.z = t * 0.07;
      ring2.rotation.y = -t * 0.09;
      ring2.rotation.x = t * 0.05 - Math.PI / 4;

      bluePoint.position.x = Math.sin(t * 0.5) * 3.5;
      bluePoint.position.y = Math.cos(t * 0.4) * 2.5;
      purplePoint.position.x = Math.cos(t * 0.6) * 3.5;
      purplePoint.position.z = Math.sin(t * 0.35) * 2 + 2;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      if (renderer) {
        renderer.dispose();
        if (mount?.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={mountRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />
  );
}

const STATS = [
  { display: "99.99%", label: "Uptime SLA", targetNum: 99.99, suffix: "%", prefix: "", decimals: 2 },
  { display: "< 10ms", label: "Global Latency", targetNum: 10, suffix: "ms", prefix: "< ", decimals: 0 },
  { display: "∞", label: "Scalability", targetNum: null, suffix: "", prefix: "∞", decimals: 0 },
];

const FEATURES = [
  { icon: "⚡", title: "Blazing Fast", desc: "Sub-10ms response times globally. Edge-first architecture built for the modern web." },
  { icon: "🔒", title: "Secure by Default", desc: "End-to-end encryption, zero-trust networking, and SOC 2 compliance out of the box." },
  { icon: "🌐", title: "Global Edge Network", desc: "Deploy to 200+ edge locations in seconds. Automatic failover and load balancing." },
  { icon: "🧠", title: "AI-Powered", desc: "Intelligent auto-scaling, anomaly detection, and performance optimization built in." },
  { icon: "📊", title: "Real-time Analytics", desc: "Deep observability with live dashboards, traces, and alerting across every service." },
  { icon: "🔧", title: "Developer First", desc: "SDKs in every language, first-class CLI tooling, and a 5-minute quickstart." },
];

function StatCounter({ stat }: { stat: typeof STATS[0] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || stat.targetNum === null) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: stat.targetNum,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
      onUpdate() {
        el.textContent = stat.prefix + obj.val.toFixed(stat.decimals) + stat.suffix;
      },
    });
  }, [stat]);

  return (
    <div ref={ref} className="text-2xl font-bold" style={{
      background: "linear-gradient(135deg, #fff 0%, #9977ff 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}>
      {stat.display}
    </div>
  );
}

function FeatureCard({ icon, title, desc, index }: { icon: string; title: string; desc: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    gsap.to(ref.current, {
      y: -8,
      scale: 1.025,
      boxShadow: "0 16px 48px rgba(80,40,200,0.28), 0 0 0 1px rgba(140,100,255,0.4)",
      background: "rgba(100,60,255,0.1)",
      borderColor: "rgba(130,100,255,0.45)",
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(ref.current!.querySelector(".card-icon"), {
      scale: 1.2,
      rotate: -8,
      duration: 0.35,
      ease: "back.out(1.5)",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, {
      y: 0,
      scale: 1,
      boxShadow: "none",
      background: "rgba(255,255,255,0.03)",
      borderColor: "rgba(130,100,255,0.15)",
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(ref.current!.querySelector(".card-icon"), {
      scale: 1,
      rotate: 0,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  return (
    <div
      ref={ref}
      className="feature-card rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(130,100,255,0.15)",
        backdropFilter: "blur(12px)",
        willChange: "transform, box-shadow",
        opacity: 0,
        transform: "translateY(40px)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-icon text-3xl mb-3 inline-block" style={{ willChange: "transform" }}>{icon}</div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(160,150,200,0.7)" }}>{desc}</p>
    </div>
  );
}

function PrimaryButton({ children, href }: { children: React.ReactNode; href?: string }) {
  const ref = useRef<HTMLElement>(null);

  const btnStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #5533ff 0%, #8844ff 100%)",
    boxShadow: "0 0 30px rgba(100,50,255,0.5), 0 2px 8px rgba(0,0,0,0.4)",
    color: "#fff",
    willChange: "transform, box-shadow",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    borderRadius: "9999px",
    padding: "0.75rem 1.75rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
  };

  const handleMouseEnter = () => {
    gsap.to(ref.current, { scale: 1.06, boxShadow: "0 0 56px rgba(120,70,255,0.75), 0 6px 20px rgba(0,0,0,0.5)", y: -3, duration: 0.25, ease: "power2.out", overwrite: "auto" });
  };
  const handleMouseLeave = () => {
    gsap.to(ref.current, { scale: 1, boxShadow: "0 0 30px rgba(100,50,255,0.5), 0 2px 8px rgba(0,0,0,0.4)", y: 0, duration: 0.35, ease: "power2.out", overwrite: "auto" });
  };
  const handleMouseDown = () => {
    gsap.to(ref.current, { scale: 0.97, duration: 0.1, ease: "power2.in", overwrite: "auto" });
  };
  const handleMouseUp = () => {
    gsap.to(ref.current, { scale: 1.06, duration: 0.15, ease: "back.out(2)", overwrite: "auto" });
  };

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        style={btnStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      style={btnStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    gsap.to(ref.current, {
      scale: 1.04,
      boxShadow: "0 0 24px rgba(100,80,255,0.2)",
      background: "rgba(255,255,255,0.08)",
      borderColor: "rgba(150,130,255,0.5)",
      y: -2,
      duration: 0.25,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(ref.current, {
      scale: 1,
      boxShadow: "none",
      background: "rgba(255,255,255,0.04)",
      borderColor: "rgba(150,130,255,0.25)",
      y: 0,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  return (
    <button
      ref={ref}
      className="relative inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(150,130,255,0.25)",
        color: "rgba(210,200,255,0.9)",
        backdropFilter: "blur(8px)",
        willChange: "transform, box-shadow",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}

const PROJECTS = [
  {
    id: 1,
    title: "Luminary Finance",
    category: "Web Development",
    tags: ["React", "Node.js", "Stripe"],
    desc: "A next-generation fintech dashboard with real-time analytics, AI-powered insights, and seamless payment processing. Reduced load time by 60% and boosted conversion by 34%.",
    result: "+34% conversions",
    gradient: "linear-gradient(135deg, #1a1040 0%, #2d1b69 40%, #4422aa 80%, #6633ff 100%)",
    accent: "#6633ff",
    highlight: "rgba(100,60,255,0.35)",
    icon: "💰",
  },
  {
    id: 2,
    title: "Aura Creative Studio",
    category: "Brand Identity",
    tags: ["Branding", "Logo", "UI Design"],
    desc: "Full brand identity for a high-end creative studio — from logo system and typography to a fully bespoke website that tripled their inbound inquiries in 3 months.",
    result: "3× inbound leads",
    gradient: "linear-gradient(135deg, #0f0828 0%, #2a0a4a 45%, #7722cc 80%, #cc44ff 100%)",
    accent: "#cc44ff",
    highlight: "rgba(180,60,255,0.35)",
    icon: "🎨",
  },
  {
    id: 3,
    title: "NexCart Commerce",
    category: "E-commerce",
    tags: ["Shopify", "SEO", "Performance"],
    desc: "Enterprise-grade e-commerce platform for a fashion brand with 12,000+ SKUs. Custom Shopify theme, AI product recommendations, and a full SEO overhaul.",
    result: "$2.4M in 6 months",
    gradient: "linear-gradient(135deg, #051520 0%, #0a2840 45%, #0f4a80 80%, #1177cc 100%)",
    accent: "#1177ff",
    highlight: "rgba(30,100,255,0.35)",
    icon: "🛒",
  },
  {
    id: 4,
    title: "Orbit SaaS Platform",
    category: "Product Design",
    tags: ["Figma", "React", "Motion"],
    desc: "End-to-end UX design and engineering for a B2B SaaS product. Shipped a new design system, reduced onboarding time by 50%, and achieved a 4.9★ App Store rating.",
    result: "4.9★ rating",
    gradient: "linear-gradient(135deg, #0a1a10 0%, #0d3520 45%, #1a6640 80%, #22cc77 100%)",
    accent: "#22cc77",
    highlight: "rgba(30,180,100,0.3)",
    icon: "🚀",
  },
  {
    id: 5,
    title: "Solaris Media",
    category: "Digital Marketing",
    tags: ["SEO", "Content", "Social"],
    desc: "360° digital growth strategy for a media house — technical SEO, content calendar, social campaigns. Grew organic traffic by 280% in 6 months.",
    result: "+280% organic traffic",
    gradient: "linear-gradient(135deg, #1a0f00 0%, #3d2400 45%, #884400 80%, #ff9900 100%)",
    accent: "#ff9900",
    highlight: "rgba(255,150,0,0.3)",
    icon: "📈",
  },
  {
    id: 6,
    title: "Velox AI Assistant",
    category: "Web App",
    tags: ["AI", "React", "OpenAI"],
    desc: "Customer-facing AI assistant platform with conversational UX, streaming responses, memory, and multi-modal input. Used by 50,000+ monthly active users.",
    result: "50K MAU",
    gradient: "linear-gradient(135deg, #10001a 0%, #2a0040 45%, #6600aa 80%, #aa00ff 100%)",
    accent: "#aa00ff",
    highlight: "rgba(160,0,255,0.35)",
    icon: "🤖",
  },
];

type Project = (typeof PROJECTS)[0];

function PortfolioModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
      .fromTo(cardRef.current, { opacity: 0, scale: 0.88, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.4)" }, "-=0.15");

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(cardRef.current, { opacity: 0, scale: 0.9, y: 30, duration: 0.25, ease: "power2.in" })
      .to(overlayRef.current, { opacity: 0, duration: 0.2, ease: "power2.in" }, "-=0.1");
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-5"
      style={{ zIndex: 9999, background: "rgba(4,3,15,0.88)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === overlayRef.current && handleClose()}
    >
      <div
        ref={cardRef}
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden"
        style={{
          background: "rgba(12,10,28,0.95)",
          border: "1px solid rgba(130,100,255,0.2)",
          boxShadow: `0 0 80px ${project.highlight}, 0 40px 80px rgba(0,0,0,0.6)`,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          className="relative h-52 flex items-center justify-center overflow-hidden"
          style={{ background: project.gradient }}
        >
          <div className="text-7xl select-none" style={{ filter: "drop-shadow(0 0 32px rgba(255,255,255,0.2))" }}>
            {project.icon}
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, transparent 40%, rgba(12,10,28,0.95) 100%)",
            }}
          />
          <div
            className="absolute top-4 right-4 flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "rgba(0,0,0,0.45)",
              border: `1px solid ${project.accent}55`,
              color: project.accent,
              backdropFilter: "blur(8px)",
            }}
          >
            {project.result}
          </div>
        </div>

        <div className="px-8 pb-8 pt-2">
          <div className="mb-1 text-xs font-medium tracking-widest uppercase" style={{ color: project.accent }}>
            {project.category}
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{project.title}</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(130,100,255,0.2)",
                  color: "rgba(200,190,255,0.8)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(170,160,210,0.8)" }}>
            {project.desc}
          </p>
          <div className="flex items-center justify-between gap-4">
            <div
              className="rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{
                background: `${project.accent}18`,
                border: `1px solid ${project.accent}44`,
                color: project.accent,
              }}
            >
              🏆 {project.result}
            </div>
            <button
              onClick={handleClose}
              className="rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(150,130,255,0.2)",
                color: "rgba(200,190,255,0.8)",
              }}
            >
              Close
            </button>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full text-sm transition-opacity"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(200,190,255,0.7)",
            backdropFilter: "blur(8px)",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function PortfolioCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(ref.current, {
      opacity: 0,
      y: 50,
      scale: 0.93,
      duration: 0.65,
      delay: index * 0.09,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 85%",
        once: true,
      },
    });
  }, [index]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -10;
    const rotY = ((x - cx) / cx) * 10;

    gsap.to(inner, {
      rotationX: rotX,
      rotationY: rotY,
      transformPerspective: 900,
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (glowRef.current) {
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      gsap.to(glowRef.current, {
        background: `radial-gradient(circle at ${pctX}% ${pctY}%, ${project.highlight} 0%, transparent 65%)`,
        opacity: 1,
        duration: 0.3,
        overwrite: "auto",
      });
    }
  };

  const handleMouseEnter = () => {
    gsap.to(innerRef.current, {
      scale: 1.02,
      boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 40px ${project.highlight}`,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(imgRef.current, {
      scale: 1.08,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(innerRef.current, {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      transformPerspective: 900,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(imgRef.current, {
      scale: 1,
      duration: 0.45,
      ease: "power2.out",
      overwrite: "auto",
    });
    gsap.to(glowRef.current, {
      opacity: 0,
      duration: 0.35,
      overwrite: "auto",
    });
  };

  const handleClick = () => {
    gsap.to(innerRef.current, {
      scale: 0.97,
      duration: 0.1,
      ease: "power2.in",
      yoyo: true,
      repeat: 1,
      onComplete: () => onOpen(project),
    });
  };

  return (
    <div ref={ref} style={{ perspective: "1000px" }}>
      <div
        ref={innerRef}
        className="relative rounded-2xl overflow-hidden cursor-pointer"
        style={{
          background: "rgba(14,12,30,0.85)",
          border: "1px solid rgba(130,100,255,0.14)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          transformStyle: "preserve-3d",
          willChange: "transform, box-shadow",
          transformOrigin: "center center",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0, zIndex: 2, mixBlendMode: "screen", borderRadius: "inherit" }}
        />

        <div className="relative overflow-hidden" style={{ height: 200 }}>
          <div
            ref={imgRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: project.gradient,
              transformOrigin: "center center",
              willChange: "transform",
            }}
          >
            <div className="text-6xl select-none" style={{ filter: "drop-shadow(0 0 20px rgba(255,255,255,0.15))" }}>
              {project.icon}
            </div>
          </div>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(14,12,30,0.9) 100%)" }}
          />
          <div
            className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              background: "rgba(0,0,0,0.5)",
              border: `1px solid ${project.accent}44`,
              color: project.accent,
              backdropFilter: "blur(6px)",
              zIndex: 3,
            }}
          >
            {project.result}
          </div>
        </div>

        <div className="p-5" style={{ transform: "translateZ(20px)" }}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: project.accent }}>
            {project.category}
          </div>
          <h3 className="font-bold text-white text-lg leading-tight mb-2">{project.title}</h3>
          <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: "rgba(160,150,200,0.65)" }}>
            {project.desc}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full px-2.5 py-0.5 text-xs"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(130,100,255,0.16)",
                  color: "rgba(180,170,220,0.7)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <div
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "rgba(160,150,210,0.55)" }}
          >
            View case study
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{
            border: `1px solid ${project.accent}33`,
            opacity: 0,
          }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const openProject = useCallback((p: Project) => setActiveProject(p), []);
  const closeProject = useCallback(() => setActiveProject(null), []);

  const mainRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const sectionHeadRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const parallaxBg1 = useRef<HTMLDivElement>(null);
  const parallaxBg2 = useRef<HTMLDivElement>(null);
  const parallaxBg3 = useRef<HTMLDivElement>(null);
  const portfolioHeadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.defaults({ ease: "power3.out" });

      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTl
        .from(badgeRef.current, { opacity: 0, y: 24, duration: 0.7 }, 0.2)
        .from(h1Ref.current, { opacity: 0, y: 40, duration: 0.85, ease: "expo.out" }, 0.45)
        .from(subtitleRef.current, { opacity: 0, y: 28, duration: 0.7 }, 0.75)
        .from(ctaRef.current, { opacity: 0, y: 24, duration: 0.6 }, 0.95)
        .from(statsRef.current, { opacity: 0, y: 20, duration: 0.6 }, 1.1)
        .from(scrollIndicatorRef.current, { opacity: 0, duration: 0.5 }, 1.4);

      if (parallaxBg1.current) {
        gsap.to(parallaxBg1.current, {
          y: "-25%",
          ease: "none",
          scrollTrigger: {
            trigger: mainRef.current,
            start: "top top",
            end: "50% top",
            scrub: 1.5,
          },
        });
      }
      if (parallaxBg2.current) {
        gsap.to(parallaxBg2.current, {
          y: "-18%",
          ease: "none",
          scrollTrigger: {
            trigger: mainRef.current,
            start: "top top",
            end: "50% top",
            scrub: 2,
          },
        });
      }
      if (parallaxBg3.current) {
        gsap.to(parallaxBg3.current, {
          y: "-12%",
          ease: "none",
          scrollTrigger: {
            trigger: mainRef.current,
            start: "top top",
            end: "50% top",
            scrub: 2.5,
          },
        });
      }

      if (sectionHeadRef.current) {
        gsap.from(sectionHeadRef.current.querySelectorAll("h2, p"), {
          opacity: 0,
          y: 36,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionHeadRef.current,
            start: "top 82%",
            once: true,
          },
        });
      }

      if (featuresRef.current) {
        const cards = featuresRef.current.querySelectorAll(".feature-card");
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            once: true,
          },
        });
      }

      if (portfolioHeadRef.current) {
        gsap.from(portfolioHeadRef.current.querySelectorAll("h2, p, a"), {
          opacity: 0,
          y: 30,
          stagger: 0.12,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: portfolioHeadRef.current,
            start: "top 82%",
            once: true,
          },
        });
      }

      ScrollTrigger.refresh();
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={mainRef} className="min-h-screen bg-[#06060e] text-white overflow-x-hidden" style={{ scrollBehavior: "smooth" }}>
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: "100vh" }}
      >
        <div
          ref={parallaxBg1}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(80,40,200,0.18) 0%, rgba(20,10,60,0.12) 60%, transparent 100%)",
            zIndex: 0,
            willChange: "transform",
          }}
        />
        <div
          ref={parallaxBg2}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 55% 40% at 30% 70%, rgba(30,80,255,0.1) 0%, transparent 70%)",
            zIndex: 0,
            willChange: "transform",
          }}
        />
        <div
          ref={parallaxBg3}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 50% 35% at 75% 30%, rgba(140,40,255,0.09) 0%, transparent 70%)",
            zIndex: 0,
            willChange: "transform",
          }}
        />

        <HeroCanvas />

        <div
          className="relative flex flex-col items-center text-center px-6 py-24"
          style={{ zIndex: 10, pointerEvents: "none" }}
        >
          <div
            ref={badgeRef}
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-widest uppercase"
            style={{
              borderColor: "rgba(100,80,255,0.35)",
              background: "rgba(60,30,180,0.15)",
              color: "rgba(180,160,255,0.9)",
              backdropFilter: "blur(8px)",
              pointerEvents: "auto",
              willChange: "transform, opacity",
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#7c5cff", boxShadow: "0 0 6px #7c5cff" }}
            />
            Next Generation Platform
          </div>

          <h1
            ref={h1Ref}
            className="font-extrabold leading-none tracking-tight"
            style={{
              fontSize: "clamp(2.8rem, 8vw, 6.5rem)",
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #ffffff 0%, #c0b4ff 40%, #8866ff 75%, #4444cc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              maxWidth: "15ch",
              willChange: "transform, opacity",
            }}
          >
            Build the Future,{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #6644ff 0%, #aa55ff 50%, #4488ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Today.
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="mt-6 text-lg leading-relaxed max-w-xl"
            style={{ color: "rgba(180,170,220,0.75)", willChange: "transform, opacity" }}
          >
            A futuristic platform engineered for performance, scale, and craft.
            Move fast without breaking things.
          </p>

          <div
            ref={ctaRef}
            className="mt-10 flex flex-wrap gap-4 justify-center"
            style={{ pointerEvents: "auto", willChange: "transform, opacity" }}
          >
            <PrimaryButton href="/start-project">
              Get Started Free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </PrimaryButton>
            <SecondaryButton>View Docs</SecondaryButton>
          </div>

          <div
            ref={statsRef}
            className="mt-16 grid grid-cols-3 gap-8 text-center"
            style={{ maxWidth: 480, willChange: "transform, opacity" }}
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <StatCounter stat={stat} />
                <div className="text-xs mt-1" style={{ color: "rgba(160,150,200,0.65)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ zIndex: 10, willChange: "opacity" }}
        >
          <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(140,120,220,0.5)" }}>
            Scroll
          </div>
          <div
            className="w-px h-8"
            style={{ background: "linear-gradient(to bottom, rgba(120,80,255,0.6), transparent)" }}
          />
        </div>
      </section>

      <section
        className="relative py-24 px-6"
        style={{ background: "linear-gradient(180deg, #06060e 0%, #090915 50%, #06060e 100%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div ref={sectionHeadRef} className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4"
              style={{
                background: "linear-gradient(135deg, #fff 0%, #9977ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                willChange: "transform, opacity",
              }}
            >
              Built for scale
            </h2>
            <p style={{ color: "rgba(170,160,210,0.7)", willChange: "transform, opacity" }}>
              Everything you need to ship fast and grow without limits.
            </p>
          </div>

          <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <FeatureCard key={title} icon={icon} title={title} desc={desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section
        className="relative py-28 px-6 overflow-hidden"
        style={{ background: "linear-gradient(180deg, #06060e 0%, #07060f 50%, #06060e 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 40% at 50% 50%, rgba(80,40,200,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto relative">
          <div ref={portfolioHeadRef} className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-medium tracking-widest uppercase mb-4"
                style={{
                  borderColor: "rgba(100,80,255,0.3)",
                  background: "rgba(60,30,180,0.1)",
                  color: "rgba(170,150,255,0.8)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#7c5cff", boxShadow: "0 0 5px #7c5cff" }} />
                Our Work
              </div>
              <h2
                className="text-4xl sm:text-5xl font-extrabold leading-tight"
                style={{
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #ffffff 0%, #c0b4ff 50%, #8866ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Selected Projects
              </h2>
              <p className="mt-3 text-base" style={{ color: "rgba(170,160,210,0.65)" }}>
                Real results for real businesses — click any card to dive deeper.
              </p>
            </div>
            <a
              href="/start-project"
              className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full px-6 py-2.5 text-sm font-semibold shrink-0 transition-all duration-200"
              style={{
                background: "rgba(85,51,255,0.12)",
                border: "1px solid rgba(120,90,255,0.3)",
                color: "rgba(200,190,255,0.9)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(85,51,255,0.22)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(120,90,255,0.55)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "rgba(85,51,255,0.12)";
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(120,90,255,0.3)";
              }}
            >
              Start your project
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROJECTS.map((project, i) => (
              <PortfolioCard
                key={project.id}
                project={project}
                index={i}
                onOpen={openProject}
              />
            ))}
          </div>
        </div>
      </section>

      <footer
        className="py-8 text-center text-sm"
        style={{ color: "rgba(120,110,160,0.5)", borderTop: "1px solid rgba(100,80,200,0.1)" }}
      >
        © 2026 VPlatform. All rights reserved.
      </footer>

      {activeProject && (
        <PortfolioModal project={activeProject} onClose={closeProject} />
      )}
    </main>
  );
}
