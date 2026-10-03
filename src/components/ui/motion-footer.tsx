"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../../lib/utils";
import { ShaderBackground } from "./waves-shader";
import { SpecularText } from "./SpecularText";

// Register ScrollTrigger safely for React
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. THEME-ADAPTIVE INLINE STYLES
// -------------------------------------------------------------------------
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  
  --pill-bg-1: rgba(0, 0, 0, 0.4);
  --pill-bg-2: rgba(0, 0, 0, 0.2);
  --pill-shadow: rgba(0, 0, 0, 0.8);
  --pill-highlight: rgba(255, 255, 255, 0.05);
  --pill-inset-shadow: rgba(0, 0, 0, 0.8);
  --pill-border: rgba(255, 255, 255, 0.08);
  
  --pill-bg-1-hover: rgba(0, 0, 0, 0.6);
  --pill-bg-2-hover: rgba(0, 0, 0, 0.3);
  --pill-border-hover: rgba(255, 255, 255, 0.2);
  --pill-shadow-hover: rgba(0, 0, 0, 0.9);
  --pill-highlight-hover: rgba(255, 255, 255, 0.15);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255, 0, 0, 0.5)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.8)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Theme-adaptive Grid Background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image: 
    linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Glass Pill Theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow: 
      0 10px 30px -10px var(--pill-shadow), 
      inset 0 1px 1px var(--pill-highlight), 
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow: 
      0 20px 40px -10px var(--pill-shadow-hover), 
      inset 0 1px 1px var(--pill-highlight-hover);
  color: white;
}

/* Giant Background Text Masking */
.footer-giant-bg-text {
  font-size: 19.5vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,255,255,0.05);
  background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Metallic Text Glow */
.footer-text-glow {
  background: linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px rgba(255,255,255,0.15));
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (Zero Dependency)
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove as any);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove as any);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    },[]);

    return (
      <Component
        ref={(node: HTMLElement) => {
          (localRef as any).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as any).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT
// -------------------------------------------------------------------------
const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Librería Offline</span> <span className="text-[#A855F7]/60">✦</span>
    <span>Sincronización Transparente</span> <span className="text-[#4169E1]/60">✦</span>
    <span>Alta Fidelidad</span> <span className="text-[#A855F7]/60">✦</span>
    <span>Control Local</span> <span className="text-[#4169E1]/60">✦</span>
    <span>Privacidad Absoluta</span> <span className="text-[#A855F7]/60">✦</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const [showTopBtn, setShowTopBtn] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      // Staggered Content Reveal
      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  },[]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      <div
        ref={wrapperRef}
        className="relative min-h-[90vh] w-full mt-[30vh]"
      >
        {/* Difuminado suave para que la sección anterior se funda con el negro del footer */}
        <div className="absolute top-0 left-0 w-full h-[30vh] -translate-y-full bg-gradient-to-b from-transparent to-black pointer-events-none z-[-1]" />

        <footer className="relative flex min-h-[90vh] w-full flex-col justify-between overflow-hidden bg-black text-white cinematic-footer-wrapper">
          
          <div className="footer-bg-grid absolute inset-0 z-0 pointer-events-none opacity-30" />

          {/* Giant background text */}
          <div
            ref={giantTextRef}
            className="footer-giant-bg-text absolute bottom-[2vh] left-0 w-full flex justify-between z-0 pointer-events-none select-none pl-0 pr-4 md:pr-8 lg:pr-[3vw]"
          >
            {"BITSZONE".split("").map((letter, index) => (
              <span key={index}>{letter}</span>
            ))}
          </div>

          {/* 1. Diagonal Sleek Marquee (Top of footer) */}
          <div className="absolute top-12 left-0 w-full overflow-hidden border-y border-white/10 bg-[#05050A]/40 backdrop-blur-md py-4 z-10 -rotate-2 scale-110 shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs md:text-sm font-bold tracking-[0.3em] text-neutral-400 uppercase">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          {/* 2. Main Center Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-32 mb-40 w-full max-w-5xl mx-auto">
            <h2
              ref={headingRef}
              className="text-5xl md:text-8xl font-black footer-text-glow tracking-tighter mb-12 text-center"
            >
              ¿Listo para empezar?
            </h2>

            {/* Interactive Magnetic Pills Layout */}
            <div ref={linksRef} className="flex flex-col items-center gap-6 w-full">
              {/* Primary Links */}
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <MagneticButton as="a" href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="footer-glass-pill px-10 py-5 rounded-full text-white font-bold text-sm md:text-base flex items-center gap-3 group no-underline lowercase">
                  <svg className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  explorar características
                </MagneticButton>
                
                <MagneticButton as="a" href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} className="footer-glass-pill px-10 py-5 rounded-full text-white font-bold text-sm md:text-base flex items-center gap-3 group no-underline lowercase">
                  <svg className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  resolviendo dudas
                </MagneticButton>
              </div>

              {/* Secondary Text Links */}
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 w-full mt-2">
                <MagneticButton as="a" href="#" className="footer-glass-pill px-6 py-3 rounded-full text-neutral-400 font-medium text-xs md:text-sm hover:text-white no-underline">
                  política de privacidad
                </MagneticButton>
                <MagneticButton as="a" href="#" className="footer-glass-pill px-6 py-3 rounded-full text-neutral-400 font-medium text-xs md:text-sm hover:text-white no-underline">
                  términos de servicio
                </MagneticButton>
                <MagneticButton as="a" href="#" className="footer-glass-pill px-6 py-3 rounded-full text-neutral-400 font-medium text-xs md:text-sm hover:text-white no-underline">
                  soporte
                </MagneticButton>
              </div>
            </div>
          </div>

          {/* 3. Bottom Bar / Credits (THE FLOOR BARRIER) */}
          <div className="relative z-20 w-full py-6 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 border-none bg-[#020202]/95 backdrop-blur-[64px] backdrop-saturate-0 shadow-[0_-20px_40px_0px_rgba(0,0,0,0.8)]">
            


            {/* Bitszone Logo (Left) */}
            <div className="order-1 flex items-center justify-start min-w-[200px]">
              <a href="/" className="flex items-center text-decoration-none hover:opacity-80 transition-opacity">
                <SpecularText
                  text="Bitszone"
                  className="pr-2"
                  style={{
                    fontSize: "22px",
                    fontFamily: '"DM Serif Display", serif',
                    fontStyle: "italic",
                  }}
                  specularColor="#5A1B5E"
                  baseStrokeColor="transparent"
                  strokeWidth={1.5}
                  glowSize={30}
                />
              </a>
            </div>

            {/* Copyright (Center) */}
            <div className="text-neutral-500 text-[9px] md:text-[10px] font-semibold tracking-[0.2em] lowercase order-2 md:absolute md:left-1/2 md:-translate-x-1/2 text-center w-full md:w-auto">
              © {new Date().getFullYear()} bitszone. todos los derechos reservados.
            </div>

            {/* "Made with Love" Badge (Right) */}
            <MagneticButton as="div" className="px-6 py-3 rounded-full flex items-center gap-2 order-3 justify-end hover:bg-white/5 transition-colors cursor-pointer group min-w-[200px]">
              <span className="text-neutral-400 text-[10px] md:text-[11px] font-bold lowercase tracking-[0.15em] group-hover:text-white transition-colors">desarrollado por</span>
              <span className="text-white font-black text-xs md:text-sm tracking-normal lowercase ml-1">j3t & juanhp</span>
            </MagneticButton>

          </div>
        </footer>
      </div>

      {/* Global Floating Back to top button */}
      <div 
        className={cn(
          "fixed bottom-8 right-8 lg:bottom-12 lg:right-12 z-[100] transition-all duration-500",
          showTopBtn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        )}
      >
        <MagneticButton
          as="button"
          onClick={scrollToTop}
          className="w-14 h-14 rounded-full flex items-center justify-center footer-glass-pill text-white group shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          style={{
            '--pill-bg-1': 'rgba(168, 85, 247, 0.1)',
            '--pill-bg-2': 'rgba(82, 39, 255, 0.05)',
            '--pill-border': 'rgba(168, 85, 247, 0.3)',
            '--pill-bg-1-hover': 'rgba(168, 85, 247, 0.3)',
            '--pill-bg-2-hover': 'rgba(82, 39, 255, 0.2)',
            '--pill-border-hover': 'rgba(168, 85, 247, 0.6)',
          } as React.CSSProperties}
        >
          <svg className="w-6 h-6 text-purple-300/70 group-hover:text-white transform group-hover:-translate-y-1.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
          </svg>
        </MagneticButton>
      </div>
    </>
  );
}
