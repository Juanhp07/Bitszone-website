const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

// 1. Add state for volume hovering
const targetState = `  if (!track || !album) return null;
  
  const volumeRef = React.useRef<HTMLDivElement>(null);`;

const newState = `  if (!track || !album) return null;
  
  const [showVolumeForce, setShowVolumeForce] = React.useState(false);
  const volumeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setShowVolumeForce(true);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeForce(false);
    }, 2500);
    return () => { if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current); };
  }, [volume]);
  
  const volumeRef = React.useRef<HTMLDivElement>(null);`;

code = code.replace(targetState, newState);

// 2. Modify the className to respect showVolumeForce
const targetClass = `className="absolute right-8 xl:right-12 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0"`;

const newClass = `className={\`absolute right-8 xl:right-12 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 transition-all duration-500 \${showVolumeForce ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'}\`}`;

code = code.replace(targetClass, newClass);

fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
console.log('Fixed ImmersivePlayer volume visibility');
