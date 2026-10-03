const fs = require('fs');

const svg1 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 200' preserveAspectRatio='none'><defs><linearGradient id='g1' x1='0' y1='0' x2='1' y2='0'><stop offset='0%' stop-color='black'/><stop offset='90%' stop-color='transparent'/></linearGradient><filter id='b1' x='-30%' y='-30%' width='160%' height='160%'><feGaussianBlur stdDeviation='20'/></filter></defs><path fill='url(#g1)' filter='url(#b1)'><animate attributeName='d' dur='8s' repeatCount='indefinite' values='M0,-100 L280,-100 C370,-25 370,50 340,100 C310,150 310,225 400,300 L0,300 Z; M0,-100 L240,-100 C240,-25 400,50 380,100 C360,150 360,225 360,300 L0,300 Z; M0,-100 L280,-100 C250,-25 250,50 340,100 C430,150 430,225 400,300 L0,300 Z; M0,-100 L320,-100 C320,-25 280,50 300,100 C320,150 460,225 440,300 L0,300 Z; M0,-100 L280,-100 C370,-25 370,50 340,100 C310,150 310,225 400,300 L0,300 Z'/></path></svg>`;

const svg2 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 200' preserveAspectRatio='none'><defs><linearGradient id='g2' x1='0' y1='0' x2='1' y2='0'><stop offset='10%' stop-color='black'/><stop offset='85%' stop-color='transparent'/></linearGradient><filter id='b2' x='-30%' y='-30%' width='160%' height='160%'><feGaussianBlur stdDeviation='25'/></filter></defs><path fill='url(#g2)' filter='url(#b2)'><animate attributeName='d' dur='11s' repeatCount='indefinite' values='M0,-100 L280,-100 C250,-25 250,50 340,100 C430,150 430,225 400,300 L0,300 Z; M0,-100 L320,-100 C320,-25 280,50 300,100 C320,150 460,225 440,300 L0,300 Z; M0,-100 L280,-100 C370,-25 370,50 340,100 C310,150 310,225 400,300 L0,300 Z; M0,-100 L240,-100 C240,-25 400,50 380,100 C360,150 360,225 360,300 L0,300 Z; M0,-100 L280,-100 C250,-25 250,50 340,100 C430,150 430,225 400,300 L0,300 Z'/></path></svg>`;

const dataUri1 = `data:image/svg+xml;base64,${Buffer.from(svg1).toString('base64')}`;
const dataUri2 = `data:image/svg+xml;base64,${Buffer.from(svg2).toString('base64')}`;

let code = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

const targetRegex = /<div className="absolute left-\[-50px\] top-\[-50px\] bottom-\[-50px\] w-\[600px\] pointer-events-none z-0 opacity-50 saturate-\[200%\].*?mixBlendMode: 'screen' \}\} \/>/s;

const newDivs = `<div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-30 saturate-100" style={{ backgroundImage: \`url(\${(track.albumCover || album.coverUrl)})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(60px)', maskImage: \`url(\${'${dataUri1}'})\`, WebkitMaskImage: \`url(\${'${dataUri1}'})\`, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }} />
      <div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-20 saturate-150" style={{ backgroundImage: \`url(\${(track.albumCover || album.coverUrl)})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(50px)', maskImage: \`url(\${'${dataUri2}'})\`, WebkitMaskImage: \`url(\${'${dataUri2}'})\`, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }} />`;

if (code.match(targetRegex)) {
  code = code.replace(targetRegex, newDivs);
  fs.writeFileSync('src/components/player/MiniPlayer.tsx', code);
  console.log('Successfully made the effect subtle and highly blurred');
} else {
  console.log('Could not find target divs to replace');
}
