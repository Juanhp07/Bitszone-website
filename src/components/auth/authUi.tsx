import React from 'react';

// Look shared by the login card and the welcome (onboarding) card.
export const titleStyle: React.CSSProperties = { fontFamily: '"DM Serif Display", serif', fontStyle: 'italic' };

export const cardStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid rgba(216, 180, 254, 0.18)',
  boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
};

export const inputClass =
  'w-full pl-12 pr-4 py-4 text-base leading-normal bg-black/30 border border-white/25 rounded-xl text-white placeholder-white/75 focus:placeholder-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all text-left';

export const slide = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -28 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

export const Heading = ({ title, subtitle }: { title: string; subtitle: React.ReactNode }) => (
  <div className="mb-8 text-center">
    <h2 className="text-5xl font-bold mb-3" style={titleStyle}>{title}</h2>
    <p className="text-base text-white/85">{subtitle}</p>
  </div>
);
