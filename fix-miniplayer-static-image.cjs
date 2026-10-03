const fs = require('fs');

const svg1 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 200' preserveAspectRatio='none'><defs><linearGradient id='g1' x1='0' y1='0' x2='1' y2='0'><stop offset='40%' stop-color='black'/><stop offset='100%' stop-color='transparent'/></linearGradient><filter id='b1' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='15'/></filter></defs><path fill='url(#g1)' filter='url(#b1)'><animate attributeName='d' dur='8s' repeatCount='indefinite' values='M0,-50 L280,-50 C370,0 370,50 340,100 C310,150 310,200 400,250 L0,250 Z; M0,-50 L240,-50 C240,0 400,50 380,100 C360,150 360,200 360,250 L0,250 Z; M0,-50 L280,-50 C250,0 250,50 340,100 C430,150 430,200 400,250 L0,250 Z; M0,-50 L320,-50 C320,0 280,50 300,100 C320,150 460,200 440,250 L0,250 Z; M0,-50 L280,-50 C370,0 370,50 340,100 C310,150 310,200 400,250 L0,250 Z'/></path></svg>`;

const svg2 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 200' preserveAspectRatio='none'><defs><linearGradient id='g2' x1='0' y1='0' x2='1' y2='0'><stop offset='45%' stop-color='black'/><stop offset='100%' stop-color='transparent'/></linearGradient><filter id='b2' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='18'/></filter></defs><path fill='url(#g2)' filter='url(#b2)'><animate attributeName='d' dur='8s' repeatCount='indefinite' values='M0,-50 L280,-50 C250,0 250,50 340,100 C430,150 430,200 400,250 L0,250 Z; M0,-50 L320,-50 C320,0 280,50 300,100 C320,150 460,200 440,250 L0,250 Z; M0,-50 L280,-50 C370,0 370,50 340,100 C310,150 310,200 400,250 L0,250 Z; M0,-50 L240,-50 C240,0 400,50 380,100 C360,150 360,200 360,250 L0,250 Z; M0,-50 L280,-50 C250,0 250,50 340,100 C430,150 430,200 400,250 L0,250 Z'/></path></svg>`;

const dataUri1 = `data:image/svg+xml;base64,${Buffer.from(svg1).toString('base64')}`;
const dataUri2 = `data:image/svg+xml;base64,${Buffer.from(svg2).toString('base64')}`;

let code = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

// Replace the CSS-animated divs with the SVG masked ones. Also use left-[-50px] to prevent the dark inner shadow gap!
const targetRegex = /<div className="absolute left-0 top-\[-50px\].*?mixBlendMode: 'screen' \}\} \/>/s;

const newDivs = `<div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-50 saturate-[200%]" style={{ backgroundImage: \`url(\${(track.albumCover || album.coverUrl)})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(50px)', maskImage: \`url(\${'${dataUri1}'})\`, WebkitMaskImage: \`url(\${'${dataUri1}'})\`, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }} />
      <div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-70 saturate-[250%]" style={{ backgroundImage: \`url(\${(track.albumCover || album.coverUrl)})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(40px)', maskImage: \`url(\${'${dataUri2}'})\`, WebkitMaskImage: \`url(\${'${dataUri2}'})\`, maskSize: '100% 100%', WebkitMaskSize: '100% 100%', mixBlendMode: 'screen' }} />`;

if (code.match(targetRegex)) {
  code = code.replace(targetRegex, newDivs);
}

// Add clipPath to MiniPlayer root to forcefully prevent Safari/blur bleed into Sidebar
code = code.replace(
  'className="w-full h-[90px] bg-transparent shrink-0 flex items-center justify-between px-6 relative overflow-hidden group/player rounded-none"',
  'className="w-full h-[90px] bg-transparent shrink-0 flex items-center justify-between px-6 relative overflow-hidden group/player rounded-none" style={{ clipPath: \'inset(0)\' }}'
);

fs.writeFileSync('src/components/player/MiniPlayer.tsx', code);
console.log('Successfully applied static image with SVG traveling waves');
