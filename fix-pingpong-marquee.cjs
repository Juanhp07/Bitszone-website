const fs = require('fs');

// 1. Update global.css
let globalCss = fs.readFileSync('src/styles/global.css', 'utf8');

// Replace the old marquee with the ping-pong marquee
const oldMarquee = `@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 15s linear infinite;
  width: max-content;
}`;

const newMarquee = `@keyframes marquee-pingpong {
  0%, 10% { transform: translateX(0px); }
  45%, 55% { transform: translateX(var(--overflow-amount, -50px)); }
  90%, 100% { transform: translateX(0px); }
}
.animate-marquee-pingpong {
  animation: marquee-pingpong 20s ease-in-out infinite;
  width: max-content;
}`;

if (globalCss.includes('@keyframes marquee {')) {
  globalCss = globalCss.replace(oldMarquee, newMarquee);
} else if (!globalCss.includes('@keyframes marquee-pingpong')) {
  globalCss += `\n${newMarquee}\n`;
}
fs.writeFileSync('src/styles/global.css', globalCss);
console.log('Updated global.css with ping-pong marquee');

// 2. Update ImmersivePlayer.tsx
let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const oldComponentRegex = /const MarqueeTitle = \(\{ text \}: \{ text: string \}\) => \{[\s\S]*?return \([\s\S]*?\);\n\};/;

const newComponent = `const MarqueeTitle = ({ text }: { text: string }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [overflowAmount, setOverflowAmount] = React.useState(0);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        const cWidth = containerRef.current.clientWidth;
        const tWidth = textRef.current.scrollWidth;
        if (tWidth > cWidth) {
          setIsOverflowing(true);
          setOverflowAmount(tWidth - cWidth + 30); // 30px extra padding so it scrolls past the last letter
        } else {
          setIsOverflowing(false);
          setOverflowAmount(0);
        }
      }
    };
    checkOverflow();
    setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div ref={containerRef} className="overflow-hidden flex-1 relative" style={{ maskImage: isOverflowing ? 'linear-gradient(to right, black 90%, transparent 100%)' : 'none', WebkitMaskImage: isOverflowing ? 'linear-gradient(to right, black 90%, transparent 100%)' : 'none' }}>
      <div 
        className={\`whitespace-nowrap \${isOverflowing ? 'animate-marquee-pingpong' : ''}\`}
        style={isOverflowing ? { '--overflow-amount': \`-\${overflowAmount}px\` } as React.CSSProperties : {}}
      >
        <span ref={textRef} className="inline-block truncate-none">
          {text}
        </span>
      </div>
    </div>
  );
};`;

player = player.replace(oldComponentRegex, newComponent);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('Updated ImmersivePlayer.tsx with ping-pong MarqueeTitle');

