const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// The props block for HoldButton is:
// backgroundColor="rgba(255, 255, 255, 0.05)"
// fillColor="#e11d48"
// textColor="rgba(255, 255, 255, 0.7)"
// fillTextColor="#ffffff"
// icon={<Trash2 className="w-4 h-4" />}
// doneIcon={<Check className="w-4 h-4" />}
// doneLabel="Eliminado"
// className="border border-white/5 font-semibold hover:bg-white/10 transition-colors"

code = code.replace(
  'backgroundColor="rgba(255, 255, 255, 0.05)"',
  'backgroundColor="transparent"'
);

code = code.replace(
  'textColor="rgba(255, 255, 255, 0.7)"',
  'textColor="rgba(255, 255, 255, 0.3)"'
);

code = code.replace(
  'className="border border-white/5 font-semibold hover:bg-white/10 transition-colors"',
  'className="border border-transparent font-medium hover:!border-red-500/30 hover:!bg-red-500/10 hover:!text-red-400 transition-colors group"'
);

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
console.log("Updated HoldButton props and classes.");
