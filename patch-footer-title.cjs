const fs = require('fs');

// 1. Patch src/pages/index.astro for Footer margin issue
let astro = fs.readFileSync('src/pages/index.astro', 'utf8');
astro = astro.replace('<p>&copy;', '<p class="m-0">&copy;');
astro = astro.replace('<p>Desarrollado', '<p class="m-0">Desarrollado');
fs.writeFileSync('src/pages/index.astro', astro);

// 2. Patch src/components/ProblemSection.tsx for 2-line title
let problem = fs.readFileSync('src/components/ProblemSection.tsx', 'utf8');

// Replace the max-w-5xl text-balance with max-w-6xl
problem = problem.replace('max-w-5xl text-balance', 'w-full max-w-[1200px]');

// Insert <br /> to force 2 lines
problem = problem.replace(
  'Toma el control absoluto de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c0a3e5] to-[#818cf8]">biblioteca sin conexión de forma sencilla.</span>',
  'Toma el control absoluto de tu biblioteca <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c0a3e5] to-[#818cf8]">sin conexión de forma sencilla.</span>'
);

fs.writeFileSync('src/components/ProblemSection.tsx', problem);
