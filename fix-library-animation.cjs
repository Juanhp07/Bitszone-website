const fs = require('fs');
let code = fs.readFileSync('src/components/player/LibraryView.tsx', 'utf8');

const oldAnimationBlock = `<div className="relative h-[1.1em] overflow-hidden flex items-center">
          <div className="flex flex-col animate-roll-text-up">
            <span className="h-[1.1em] flex items-center">{titles[activeTab]}</span>
            <span className="h-[1.1em] flex items-center">{titles[activeTab]}</span>
          </div>
        </div>`;

const newAnimationBlock = `<div className="relative h-[48px] overflow-hidden">
          <div className="flex flex-col animate-roll-text-up">
            <span className="h-[48px] leading-none flex items-center">{titles[activeTab]}</span>
            <span className="h-[48px] leading-none flex items-center">{titles[activeTab]}</span>
          </div>
        </div>`;

if (code.includes(oldAnimationBlock)) {
  code = code.replace(oldAnimationBlock, newAnimationBlock);
  fs.writeFileSync('src/components/player/LibraryView.tsx', code);
  console.log("Animation dimensions fixed to precise pixel boundaries.");
} else {
  console.log("Could not find the old animation block.");
}
