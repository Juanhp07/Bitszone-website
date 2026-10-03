const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { DownloadCloud, Play, Heart, Clock, X, Trash2, Search, Loader2, AlertCircle } from 'lucide-react';",
  "import { DownloadCloud, Play, Heart, Clock, X, Trash2, Search, Loader2, AlertCircle, Check } from 'lucide-react';\nimport HoldButton from '../ui/HoldButton';"
);

// Replace button
const oldButtonRegex = /<button\s*onClick=\{\(\) => setShowClearConfirm\(true\)\}\s*className="flex items-center gap-2 px-5 py-2\.5 rounded-full bg-white\/5 hover:bg-white\/10 border border-white\/5 text-white\/70 hover:text-white transition-all font-semibold text-xs"\s*>\s*<Trash2 className="w-4 h-4" \/>\s*Eliminar todo\s*<\/button>/;

const newButton = `<HoldButton
              size="sm"
              radius={9999}
              holdTime={5000}
              backgroundColor="rgba(255, 255, 255, 0.05)"
              fillColor="#e11d48"
              textColor="rgba(255, 255, 255, 0.7)"
              fillTextColor="#ffffff"
              icon={<Trash2 className="w-4 h-4" />}
              doneIcon={<Check className="w-4 h-4" />}
              doneLabel="Eliminado"
              className="border border-white/5 font-semibold hover:bg-white/10 transition-colors"
              onHold={() => {
                if (type === 'downloads') {
                  clearDownloads();
                } else {
                  clearFavorites();
                }
              }}
            >
              Eliminar todo
            </HoldButton>`;

if (code.match(oldButtonRegex)) {
  code = code.replace(oldButtonRegex, newButton);
  console.log("Replaced old button with HoldButton");
} else {
  console.log("Could not find the old button!");
}

// Remove modal
const modalRegex = /\{showClearConfirm && createPortal\([\s\S]*?document\.body\s*\)\}/;

if (code.match(modalRegex)) {
  code = code.replace(modalRegex, '');
  console.log("Removed old modal");
} else {
  console.log("Could not find old modal!");
}

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
