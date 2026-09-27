const fs = require('fs');

let problem = fs.readFileSync('src/components/ProblemSection.tsx', 'utf8');

// The current text is:
// Toma el control absoluto de tu biblioteca <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c0a3e5] to-[#818cf8]">sin conexión de forma sencilla.</span>

problem = problem.replace(
  'Toma el control absoluto de tu biblioteca <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c0a3e5] to-[#818cf8]">sin conexión de forma sencilla.</span>',
  'Toma el control absoluto <br className="hidden md:block" />\n          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c0a3e5] to-[#818cf8]">sin conexión de forma sencilla</span>'
);

fs.writeFileSync('src/components/ProblemSection.tsx', problem);
