const fs = require('fs');

function fixImports(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (file.includes('DownloadsView.tsx')) {
    content = content.replace("import { DownloadCloud, Play, Heart, Clock, X, Trash2, Search, Loader2 } from 'lucide-react';", "import { DownloadCloud, Play, Heart, HeartOff, Clock, X, Trash2, Search, Loader2, Check, AlertCircle } from 'lucide-react';\nimport FuseButton from '../ui/FuseButton';\nimport HoldButton from '../ui/HoldButton';");
    
    // Add showCancelConfirm to DownloadsView
    if (!content.includes('showCancelConfirm')) {
      content = content.replace('const [showClearConfirm, setShowClearConfirm] = useState(false);', 'const [showClearConfirm, setShowClearConfirm] = useState(false);\n  const [showCancelConfirm, setShowCancelConfirm] = useState<any>(null);');
    }
  }
  
  if (file.includes('ArtistView.tsx')) {
    content = content.replace("import { Play, Pause, Heart, MoreHorizontal, Clock, ArrowLeft, Download, Check, Loader2 } from 'lucide-react';", "import { Play, Pause, Heart, HeartOff, MoreHorizontal, Clock, ArrowLeft, Download, Check, Loader2, AlertCircle } from 'lucide-react';");
  }
  
  if (file.includes('CatalogView.tsx')) {
    content = content.replace("import { Play, Pause, Heart, MoreHorizontal, Clock, ArrowLeft, Download, Check, Loader2 } from 'lucide-react';", "import { Play, Pause, Heart, HeartOff, MoreHorizontal, Clock, ArrowLeft, Download, Check, Loader2, AlertCircle } from 'lucide-react';");
  }
  
  if (file.includes('SadView.tsx')) {
    content = content.replace(/className="w-16 h-16 rounded-full bg-white\/10 hover:bg-white\/20 flex items-center justify-center text-white transition-all"\s*className="w-16 h-16 bg-white\/10/g, 'className="w-16 h-16 bg-white/10');
  }
  
  fs.writeFileSync(file, content);
}

fixImports('src/components/player/DownloadsView.tsx');
fixImports('src/components/player/ArtistView.tsx');
fixImports('src/components/player/CatalogView.tsx');
fixImports('src/components/player/SadView.tsx');

console.log("Fixed missing imports");
