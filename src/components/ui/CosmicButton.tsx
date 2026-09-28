import React from 'react';
import SpecularButton from './SpecularButton';

interface CosmicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const CosmicButton: React.FC<CosmicButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <>
      <SpecularButton 
        className={`cosmic-btn !h-auto !p-0 !bg-transparent ${className}`} 
        radius={999}
        tint="transparent"
        tintOpacity={0}
        blur={40}
        lineColor="#FF9FFC"
        baseColor="#000000"
        intensity={4.0}
        thickness={2}
        onClick={props.onClick}
        type={props.type}
        disabled={props.disabled}
      >
        <div className="wrapper">
          <span className="flex items-center gap-2">{children}</span>
          {/* 12 Animated Circles for the liquid effect */}
          <div className="circles-container">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`circle circle-${12 - i}`}></div>
            ))}
          </div>
        </div>
      </SpecularButton>

      <style>{`
        .cosmic-btn {
          --duration: 8s;
          --easing: linear;
          /* Liquid Metal Text Colors */
          --c-color-1: rgba(82, 39, 255, 0.9); /* #5227FF Deep Purple */
          --c-color-2: rgba(255, 159, 252, 0.9); /* #FF9FFC Bright Pink */
          --c-color-3: rgba(197, 118, 209, 0.9); /* #c576d1 Lavender blend */
          --c-color-4: rgba(255, 255, 255, 0.6); /* White highlight */
          
          --c-color: #ffffff;
          
          -webkit-tap-highlight-color: transparent;
          -webkit-appearance: none;
          outline: none;
          position: relative;
          cursor: pointer;
          border: none;
          display: table;
          border-radius: 999px; /* Max pill shape */
          padding: 0;
          margin: 0;
          text-align: center;
          font-weight: 500;
          font-size: 18px;
          letter-spacing: 0.02em;
          color: var(--c-color);
          background: transparent;
          box-shadow: none !important;
          transition: transform 0.2s ease;
        }

        .cosmic-btn:active {
          transform: scale(0.95);
        }

        .cosmic-btn:before {
          content: "";
          pointer-events: none;
          position: absolute;
          z-index: 3;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          border-radius: 999px;
          box-shadow:
            inset 0 3px 12px rgba(255, 158, 249, 0.4),
            inset 0 -3px 8px rgba(82, 38, 255, 0.6);
        }

        .cosmic-btn .wrapper {
          -webkit-mask-image: -webkit-radial-gradient(white, black);
          overflow: hidden;
          border-radius: 999px;
          min-width: 260px;
          padding: 16px 32px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .cosmic-btn .wrapper span {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          position: relative;
          z-index: 10;
        }

        .cosmic-btn .circles-container {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.6s ease;
          z-index: 1;
        }

        @keyframes cosmic-bounce-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }

        .cosmic-btn:hover {
          --duration: 5000ms; /* Slowed down from 1400ms */
        }

        .cosmic-btn:hover .circles-container {
          opacity: 1;
        }

        .cosmic-btn:hover .arrow-icon {
          animation: cosmic-bounce-right 1s infinite ease-in-out;
          color: var(--c-color-2);
        }

        .cosmic-btn .wrapper .circle {
          position: absolute;
          left: 0;
          top: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          filter: blur(var(--blur, 8px));
          background: var(--background, transparent);
          transform: translate(var(--x, 0), var(--y, 0)) translateZ(0);
          animation: var(--animation, none) var(--duration) var(--easing) infinite;
        }

        .cosmic-btn .wrapper .circle.circle-1,
        .cosmic-btn .wrapper .circle.circle-9,
        .cosmic-btn .wrapper .circle.circle-10 {
          --background: var(--c-color-4);
        }

        .cosmic-btn .wrapper .circle.circle-3,
        .cosmic-btn .wrapper .circle.circle-4 {
          --background: var(--c-color-2);
          --blur: 14px;
        }

        .cosmic-btn .wrapper .circle.circle-5,
        .cosmic-btn .wrapper .circle.circle-6 {
          --background: var(--c-color-3);
          --blur: 16px;
        }

        .cosmic-btn .wrapper .circle.circle-2,
        .cosmic-btn .wrapper .circle.circle-7,
        .cosmic-btn .wrapper .circle.circle-8,
        .cosmic-btn .wrapper .circle.circle-11,
        .cosmic-btn .wrapper .circle.circle-12 {
          --background: var(--c-color-1);
          --blur: 12px;
        }

        .cosmic-btn .wrapper .circle.circle-1 { --x: 0; --y: -40px; --animation: circle-1; }
        .cosmic-btn .wrapper .circle.circle-2 { --x: 202px; --y: 8px; --animation: circle-2; }
        .cosmic-btn .wrapper .circle.circle-3 { --x: -26px; --y: -12px; --animation: circle-3; }
        .cosmic-btn .wrapper .circle.circle-4 { --x: 176px; --y: -12px; --animation: circle-4; }
        .cosmic-btn .wrapper .circle.circle-5 { --x: 26px; --y: -4px; --animation: circle-5; }
        .cosmic-btn .wrapper .circle.circle-6 { --x: 123px; --y: 16px; --animation: circle-6; }
        .cosmic-btn .wrapper .circle.circle-7 { --x: 17px; --y: 28px; --animation: circle-7; }
        .cosmic-btn .wrapper .circle.circle-8 { --x: 61px; --y: -4px; --animation: circle-8; }
        .cosmic-btn .wrapper .circle.circle-9 { --x: 44px; --y: -12px; --animation: circle-9; }
        .cosmic-btn .wrapper .circle.circle-10 { --x: 140px; --y: 16px; --animation: circle-10; }
        .cosmic-btn .wrapper .circle.circle-11 { --x: 8px; --y: 4px; --animation: circle-11; }
        .cosmic-btn .wrapper .circle.circle-12 { --blur: 14px; --x: 114px; --y: 4px; --animation: circle-12; }

        @keyframes circle-1 {
          33% { transform: translate(0px, 16px) translateZ(0); }
          66% { transform: translate(26px, 64px) translateZ(0); }
        }

        @keyframes circle-2 {
          33% { transform: translate(176px, -10px) translateZ(0); }
          66% { transform: translate(158px, -48px) translateZ(0); }
        }

        @keyframes circle-3 {
          33% { transform: translate(44px, 12px) translateZ(0); }
          66% { transform: translate(26px, 4px) translateZ(0); }
        }

        @keyframes circle-4 {
          33% { transform: translate(167px, -12px) translateZ(0); }
          66% { transform: translate(246px, -8px) translateZ(0); }
        }

        @keyframes circle-5 {
          33% { transform: translate(184px, 28px) translateZ(0); }
          66% { transform: translate(88px, -32px) translateZ(0); }
        }

        @keyframes circle-6 {
          33% { transform: translate(61px, -16px) translateZ(0); }
          66% { transform: translate(167px, -56px) translateZ(0); }
        }

        @keyframes circle-7 {
          33% { transform: translate(17px, 28px) translateZ(0); }
          66% { transform: translate(44px, -60px) translateZ(0); }
        }

        @keyframes circle-8 {
          33% { transform: translate(70px, -4px) translateZ(0); }
          66% { transform: translate(123px, -20px) translateZ(0); }
        }

        @keyframes circle-9 {
          33% { transform: translate(44px, -12px) translateZ(0); }
          66% { transform: translate(176px, -8px) translateZ(0); }
        }

        @keyframes circle-10 {
          33% { transform: translate(149px, 20px) translateZ(0); }
          66% { transform: translate(220px, 28px) translateZ(0); }
        }

        @keyframes circle-11 {
          33% { transform: translate(8px, 4px) translateZ(0); }
          66% { transform: translate(149px, 20px) translateZ(0); }
        }

        @keyframes circle-12 {
          33% { transform: translate(123px, 0px) translateZ(0); }
          66% { transform: translate(132px, -32px) translateZ(0); }
        }
      `}</style>
    </>
  );
};

export default CosmicButton;
