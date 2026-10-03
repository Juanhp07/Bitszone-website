const fs = require('fs');
let code = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

// 1. Add keyframes
const targetStyle = `      <style>{\`
        @keyframes wave-slide {`;
        
const newStyle = `      <style>{\`
        @keyframes mask-wave-anim {
          0% { mask-position: 0% 0%; }
          50% { mask-position: 30% 0%; }
          100% { mask-position: 0% 0%; }
        }
        .animate-mask-wave {
          animation: mask-wave-anim 6s ease-in-out infinite;
          mask-size: 150% 100%;
        }
        @keyframes wave-slide {`;
code = code.replace(targetStyle, newStyle);

// 2. Add diagonal and class
const targetMask = `maskImage: 'linear-gradient(to right, black 5%, transparent 70%)', WebkitMaskImage: 'linear-gradient(to right, black 5%, transparent 70%)' }}`;
const newMask = `maskImage: 'linear-gradient(115deg, black 10%, transparent 60%)', WebkitMaskImage: 'linear-gradient(115deg, black 10%, transparent 60%)' }} className="animate-mask-wave"`;

code = code.replace(targetMask, newMask);

fs.writeFileSync('src/components/player/MiniPlayer.tsx', code);
console.log('MiniPlayer wave added');
