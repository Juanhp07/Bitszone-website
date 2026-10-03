const fs = require('fs');

const svg1 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 200' preserveAspectRatio='none'><defs><linearGradient id='g1' x1='0' y1='0' x2='1' y2='0'><stop offset='25%' stop-color='black'/><stop offset='100%' stop-color='transparent'/></linearGradient><filter id='b1' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='10'/></filter></defs><path fill='url(#g1)' filter='url(#b1)'><animate attributeName='d' dur='5s' repeatCount='indefinite' values='M0,-50 L280,-50 C360,0 250,50 340,100 C430,150 320,200 400,250 L0,250 Z; M0,-50 L300,-50 C250,0 380,50 360,100 C310,150 440,200 420,250 L0,250 Z; M0,-50 L280,-50 C360,0 250,50 340,100 C430,150 320,200 400,250 L0,250 Z'/></path></svg>`;

const svg2 = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 200' preserveAspectRatio='none'><defs><linearGradient id='g2' x1='0' y1='0' x2='1' y2='0'><stop offset='30%' stop-color='black'/><stop offset='100%' stop-color='transparent'/></linearGradient><filter id='b2' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='12'/></filter></defs><path fill='url(#g2)' filter='url(#b2)'><animate attributeName='d' dur='7s' repeatCount='indefinite' values='M0,-50 L290,-50 C240,0 360,50 350,100 C300,150 420,200 410,250 L0,250 Z; M0,-50 L270,-50 C350,0 240,50 330,100 C410,150 300,200 390,250 L0,250 Z; M0,-50 L290,-50 C240,0 360,50 350,100 C300,150 420,200 410,250 L0,250 Z'/></path></svg>`;

const dataUri1 = `data:image/svg+xml;base64,${Buffer.from(svg1).toString('base64')}`;
const dataUri2 = `data:image/svg+xml;base64,${Buffer.from(svg2).toString('base64')}`;

let code = fs.readFileSync('src/components/player/MiniPlayer.tsx', 'utf8');

// The code currently has the two divs with animate-mask-wave-1 and animate-mask-wave-2
// We will replace their maskImage to use these SVGs and remove the CSS mask animation from the styles (since the SVG itself animates).

const targetDivs = code.match(/<div className="absolute left-\[-50px\] top-\[-50px\] bottom-\[-50px\] w-\[600px\] pointer-events-none z-0 opacity-40 saturate-\[200%\] animate-mask-wave-1".*?mixBlendMode: 'screen' \}\} \/>/s);

if (targetDivs) {
  const newDivs = `<div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-50 saturate-[200%]" style={{ backgroundImage: \`url(\${(track.albumCover || album.coverUrl)})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px)', maskImage: \`url(\${'${dataUri1}'})\`, WebkitMaskImage: \`url(\${'${dataUri1}'})\`, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }} />
      <div className="absolute left-[-50px] top-[-50px] bottom-[-50px] w-[600px] pointer-events-none z-0 opacity-70 saturate-[250%]" style={{ backgroundImage: \`url(\${(track.albumCover || album.coverUrl)})\`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)', maskImage: \`url(\${'${dataUri2}'})\`, WebkitMaskImage: \`url(\${'${dataUri2}'})\`, maskSize: '100% 100%', WebkitMaskSize: '100% 100%', mixBlendMode: 'screen' }} />`;

  code = code.replace(targetDivs[0], newDivs);
  
  // We can also remove the @keyframes from the <style> block, but leaving them is harmless.
  fs.writeFileSync('src/components/player/MiniPlayer.tsx', code);
  console.log('Successfully applied SVG diagonal waves');
} else {
  console.log('Could not find the target divs to replace.');
}

