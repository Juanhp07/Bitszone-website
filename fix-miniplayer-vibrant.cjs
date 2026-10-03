const fs = require('fs');
let code = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

// Replace style block
const oldStyle = `      <style>{\`
        @keyframes mask-wave-anim {
          0% { mask-position: 0% 0%; }
          50% { mask-position: 30% 0%; }
          100% { mask-position: 0% 0%; }
        }
        .animate-mask-wave {
          animation: mask-wave-anim 6s ease-in-out infinite;
          mask-size: 150% 100%;
        }`;

const newStyle = `      <style>{\`
        @keyframes mask-wave-anim-1 {
          0% { mask-position: 0% 0%; }
          50% { mask-position: 15% 15%; }
          100% { mask-position: 0% 0%; }
        }
        @keyframes mask-wave-anim-2 {
          0% { mask-position: 15% 0%; }
          50% { mask-position: -5% 10%; }
          100% { mask-position: 15% 0%; }
        }
        .animate-mask-wave-1 {
          animation: mask-wave-anim-1 5s ease-in-out infinite;
          mask-size: 140% 140%;
        }
        .animate-mask-wave-2 {
          animation: mask-wave-anim-2 4s ease-in-out infinite;
          mask-size: 150% 150%;
        }`;
code = code.replace(oldStyle, newStyle);

// Replace divs
const oldDivs = `<div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-50 saturate-150 animate-mask-wave" style={{ backgroundImage: \`url(\${(track.albumCover || album.coverUrl)})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(60px)', maskImage: 'linear-gradient(115deg, black 10%, transparent 60%)', WebkitMaskImage: 'linear-gradient(115deg, black 10%, transparent 60%)' }} />`;

const newDivs = `<div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-40 saturate-[200%] animate-mask-wave-1" style={{ backgroundImage: \`url(\${(track.albumCover || album.coverUrl)})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(50px)', maskImage: 'linear-gradient(110deg, black 5%, transparent 50%)', WebkitMaskImage: 'linear-gradient(110deg, black 5%, transparent 50%)' }} />
      <div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-50 saturate-[250%] animate-mask-wave-2" style={{ backgroundImage: \`url(\${(track.albumCover || album.coverUrl)})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(40px)', maskImage: 'linear-gradient(125deg, black 0%, transparent 45%)', WebkitMaskImage: 'linear-gradient(125deg, black 0%, transparent 45%)', mixBlendMode: 'screen' }} />`;

code = code.replace(oldDivs, newDivs);

fs.writeFileSync('src/components/player/MiniPlayer.tsx', code);
console.log('Fixed MiniPlayer to dual vibrant wave gradients');
