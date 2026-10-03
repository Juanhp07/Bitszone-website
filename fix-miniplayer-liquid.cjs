const fs = require('fs');

let code = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

// 1. Remove the old SVG layers and replace with the new CSS mask layers
const targetDivs = code.match(/<div className="absolute left-\[-50px\].*?mixBlendMode: 'screen' \}\} \/>/s);

const newDivs = `<div className="absolute left-0 top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-60 saturate-[200%] animate-wave-1" style={{ backgroundImage: \`url(\${(track.albumCover || album.coverUrl)})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(40px)', maskImage: 'linear-gradient(80deg, transparent 0%, black 15%, black 35%, transparent 45%)', WebkitMaskImage: 'linear-gradient(80deg, transparent 0%, black 15%, black 35%, transparent 45%)' }} />
      <div className="absolute left-0 top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-80 saturate-[250%] animate-wave-2" style={{ backgroundImage: \`url(\${(track.albumCover || album.coverUrl)})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px)', maskImage: 'linear-gradient(85deg, transparent 0%, black 10%, black 30%, transparent 40%)', WebkitMaskImage: 'linear-gradient(85deg, transparent 0%, black 10%, black 30%, transparent 40%)', mixBlendMode: 'screen' }} />`;

if (targetDivs) {
  code = code.replace(targetDivs[0], newDivs);
} else {
  console.log("Could not find divs to replace");
}

// 2. Replace the entire <style> block with the new fluid keyframes
const styleRegex = /<style>\{`.*?`\}<\/style>/s;

const newStyle = `<style>{\`
        @keyframes liquid-wave-1 {
          0% { mask-position: 0% 0%; -webkit-mask-position: 0% 0%; mask-size: 150% 150%; -webkit-mask-size: 150% 150%; }
          33% { mask-position: 10% 5%; -webkit-mask-position: 10% 5%; mask-size: 160% 140%; -webkit-mask-size: 160% 140%; }
          66% { mask-position: -5% 10%; -webkit-mask-position: -5% 10%; mask-size: 140% 160%; -webkit-mask-size: 140% 160%; }
          100% { mask-position: 0% 0%; -webkit-mask-position: 0% 0%; mask-size: 150% 150%; -webkit-mask-size: 150% 150%; }
        }
        @keyframes liquid-wave-2 {
          0% { mask-position: 0% 0%; -webkit-mask-position: 0% 0%; mask-size: 140% 140%; -webkit-mask-size: 140% 140%; }
          33% { mask-position: -10% 10%; -webkit-mask-position: -10% 10%; mask-size: 150% 130%; -webkit-mask-size: 150% 130%; }
          66% { mask-position: 5% -5%; -webkit-mask-position: 5% -5%; mask-size: 130% 150%; -webkit-mask-size: 130% 150%; }
          100% { mask-position: 0% 0%; -webkit-mask-position: 0% 0%; mask-size: 140% 140%; -webkit-mask-size: 140% 140%; }
        }
        .animate-wave-1 {
          animation: liquid-wave-1 13s ease-in-out infinite;
        }
        .animate-wave-2 {
          animation: liquid-wave-2 19s ease-in-out infinite;
        }
        @keyframes wave-slide {
          from { background-position-x: 0px; }
          to { background-position-x: -80px; }
        }
        .animate-wave-slide {
          animation: wave-slide 1s linear infinite;
        }
      \`}</style>`;

if (code.match(styleRegex)) {
  code = code.replace(styleRegex, newStyle);
  fs.writeFileSync('src/components/player/MiniPlayer.tsx', code);
  console.log('Successfully applied liquid CSS waves');
} else {
  console.log("Could not find style block to replace");
}
