const fs = require('fs');

let code = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// Add HeartOff to import
if (!code.includes('HeartOff')) {
  code = code.replace(
    "Heart, Clock, X, Trash2, Search, Loader2, AlertCircle, Check",
    "Heart, HeartOff, Clock, X, Trash2, Search, Loader2, AlertCircle, Check"
  );
}

// Replace the button block
const oldBtn = /<button \s*onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*toggleFavorite\(track\);\s*\}\}\s*className="text-\[#a855f7\] hover:text-\[#b066f8\] opacity-100 transition-all p-2"\s*title="Quitar de favoritos"\s*>\s*<Heart className="w-4 h-4" fill="currentColor" \/>\s*<\/button>/g;

const newBtn = `<button 
              onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
              className="group/favbtn text-[#a855f7] hover:text-[#ef4444] opacity-100 transition-all p-2"
              title="Quitar de favoritos"
            >
              <Heart className="w-4 h-4 block group-hover/favbtn:hidden" fill="currentColor" />
              <HeartOff className="w-4 h-4 hidden group-hover/favbtn:block" />
            </button>`;

if (code.match(oldBtn)) {
  code = code.replace(oldBtn, newBtn);
  console.log("Successfully replaced the fav button hover state.");
} else {
  console.log("Could not find fav button block.");
}

fs.writeFileSync('src/components/player/DownloadsView.tsx', code);
