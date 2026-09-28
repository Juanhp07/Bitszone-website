"use client"

import type React from "react"
import SpecularButton from "./SpecularButton"

interface ShinyButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function ShinyButton({ children, onClick, className = "" }: ShinyButtonProps) {
  return (
    <>
      <style>{`
        .shiny-cta {
          --shiny-cta-bg: rgba(5, 5, 10, 0.6); /* Dark Glass */
          --shiny-cta-bg-subtle: rgba(255, 159, 252, 0.15); /* Subtle pink inner border */
          --shiny-cta-fg: #ffffff;
          --shiny-cta-highlight: #FF9FFC; /* Bright Pink */
          --shiny-cta-highlight-subtle: #5B2C6F; /* Deep Plum Purple from Image 3 */
          --duration: 3s;
          --shadow-size: 2px;
          --transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);
          
          isolation: isolate;
          position: relative;
          overflow: hidden;
          font-family: "Inter", sans-serif;
          font-size: 1.125rem;
          line-height: 1.2;
          font-weight: 500;
          border-radius: 999px;
          color: var(--shiny-cta-fg);
          
          /* Dark Glass Background */
          background: var(--shiny-cta-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          
          box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle);
          transition: var(--transition);
          
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          height: 100%;
        }

        .shiny-cta::before,
        .shiny-cta::after,
        .shiny-cta span::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset-inline-start: 50%;
          inset-block-start: 50%;
          translate: -50% -50%;
          z-index: -1;
        }

        /* Dots pattern */
        .shiny-cta::before {
          --size: calc(100% - var(--shadow-size) * 3);
          --position: 2px;
          --space: calc(var(--position) * 2);
          width: var(--size);
          height: var(--size);
          background: radial-gradient(
            circle at var(--position) var(--position),
            white calc(var(--position) / 4),
            transparent 0
          ) padding-box;
          background-size: var(--space) var(--space);
          background-repeat: space;
          border-radius: inherit;
          opacity: 0.15;
          z-index: -1;
          animation: shimmer linear infinite;
          animation-duration: var(--duration);
          animation-play-state: running;
          transition: opacity var(--transition);
        }

        /* Inner shimmer */
        .shiny-cta::after {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(
            -50deg,
            transparent,
            var(--shiny-cta-highlight),
            transparent
          );
          mask-image: radial-gradient(circle at bottom, transparent 40%, black);
          opacity: 0.3;
          animation: shimmer linear infinite;
          animation-duration: var(--duration);
          animation-play-state: running;
          transition: opacity var(--transition);
        }

        .shiny-cta span {
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .shiny-cta span::before {
          --size: calc(100% + 1rem);
          width: var(--size);
          height: var(--size);
          box-shadow: inset 0 -1ex 2rem 2px var(--shiny-cta-highlight-subtle);
          opacity: 0.6;
          transition: opacity var(--transition), box-shadow var(--transition);
          animation: calc(var(--duration) * 1.5) breathe linear infinite;
        }

        /* Hover states (Intensify) */
        .shiny-cta-wrapper:is(:hover, :focus-visible) .shiny-cta::before {
          opacity: 0.35;
        }
        
        .shiny-cta-wrapper:is(:hover, :focus-visible) .shiny-cta::after {
          opacity: 0.6;
        }

        .shiny-cta-wrapper:is(:hover, :focus-visible) .shiny-cta span::before {
          opacity: 1;
          box-shadow: inset 0 -1ex 2rem 6px var(--shiny-cta-highlight-subtle);
        }

        @keyframes shimmer {
          to {
            rotate: 360deg;
          }
        }

        @keyframes breathe {
          from, to {
            scale: 1;
          }
          50% {
            scale: 1.2;
          }
        }
        
        /* Bouncing Arrow */
        @keyframes shiny-bounce-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }

        .shiny-cta-wrapper:hover .arrow-icon {
          animation: shiny-bounce-right 1s infinite ease-in-out;
          color: var(--shiny-cta-highlight);
        }
      `}</style>

      <SpecularButton
        className="shiny-cta-wrapper !h-auto !p-0 !bg-transparent !border-none"
        radius={999}
        tint="transparent"
        tintOpacity={0}
        blur={0}
        lineColor="#FF9FFC"
        baseColor="#000000"
        intensity={4.0}
        thickness={2}
        onClick={onClick}
      >
        <div className={`shiny-cta ${className}`}>
          <span>{children}</span>
        </div>
      </SpecularButton>
    </>
  )
}

export default ShinyButton;
