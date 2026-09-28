const fs = require('fs');

// 1. Update global.css
let globalCss = fs.readFileSync('src/styles/global.css', 'utf8');
if (!globalCss.includes('@keyframes marquee')) {
  globalCss += `\n
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}
.animate-marquee {
  animation: marquee 15s linear infinite;
  width: max-content;
}
`;
  fs.writeFileSync('src/styles/global.css', globalCss);
  console.log('Added marquee keyframes to global.css');
}

// 2. Update ImmersivePlayer.tsx
let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// Change Artistas to Pistas
player = player.replace('Artistas</div>', 'Pistas</div>');
player = player.replace('ARTISTAS</div>', 'PISTAS</div>');

// Inject the MarqueeTitle component just above the ImmersivePlayer declaration
const marqueeComponent = `
const MarqueeTitle = ({ text }: { text: string }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  React.useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        setIsOverflowing(textRef.current.scrollWidth > containerRef.current.clientWidth);
      }
    };
    checkOverflow();
    // Delay check slightly to allow font rendering
    setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div ref={containerRef} className="overflow-hidden flex-1 relative" style={{ maskImage: isOverflowing ? 'linear-gradient(to right, black 85%, transparent 100%)' : 'none', WebkitMaskImage: isOverflowing ? 'linear-gradient(to right, black 85%, transparent 100%)' : 'none' }}>
      <div className={\`flex whitespace-nowrap \${isOverflowing ? 'animate-marquee' : ''}\`}>
        <span ref={textRef} className={isOverflowing ? 'pr-16' : 'truncate block w-full'}>
          {text}
        </span>
        {isOverflowing && (
          <span className="pr-16">{text}</span>
        )}
      </div>
    </div>
  );
};

export const ImmersivePlayer`;

if (!player.includes('const MarqueeTitle')) {
  player = player.replace('export const ImmersivePlayer', marqueeComponent);
}

// Replace the line-clamp title with the MarqueeTitle
player = player.replace(
  '<span className="line-clamp-1">{t.title}</span>',
  '<MarqueeTitle text={t.title} />'
);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
console.log('ImmersivePlayer updated with MarqueeTitle and PISTAS.');

