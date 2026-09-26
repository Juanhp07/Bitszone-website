const fs = require('fs');

// 1. Patch HeroSection.tsx
let hero = fs.readFileSync('src/components/HeroSection.tsx', 'utf8');

// The user wants much more blur on the button
// Currently:
// <GlassSurface
//    ...
//    backgroundOpacity={0.05}
//    blur={16}
// >
//   <SpecularButton
//      ...
//      tintOpacity={0.15}
//      blur={12}
hero = hero.replace('backgroundOpacity={0.05}', 'backgroundOpacity={0.15}');
hero = hero.replace('blur={16}', 'blur={40}');
hero = hero.replace('tintOpacity={0.15}', 'tintOpacity={0.25}');
hero = hero.replace('blur={12}', 'blur={40}');

fs.writeFileSync('src/components/HeroSection.tsx', hero);

// 2. Patch ProblemSection.tsx
let problem = fs.readFileSync('src/components/ProblemSection.tsx', 'utf8');

// Change max-w-4xl to max-w-5xl to give it more width so it fits in 2 lines
problem = problem.replace('max-w-4xl', 'max-w-5xl text-balance');
// Remove the forced break
problem = problem.replace('<br className="hidden md:block" />', '');
// To be safe, remove the line break in code if it was formatted differently
problem = problem.replace('Toma el control absoluto de tu \n          <span', 'Toma el control absoluto de tu <span');

fs.writeFileSync('src/components/ProblemSection.tsx', problem);
