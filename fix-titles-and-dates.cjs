const fs = require('fs');

// 1. Fix MainApp.tsx title
let mainApp = fs.readFileSync('src/components/player/MainApp.tsx', 'utf8');
mainApp = mainApp.replace(/title="Tus Favoritos"/g, 'title="Canciones favoritas"');
fs.writeFileSync('src/components/player/MainApp.tsx', mainApp);

// 2. Fix DownloadsView.tsx
let dv = fs.readFileSync('src/components/player/DownloadsView.tsx', 'utf8');

// A. Change default title
dv = dv.replace(/title = "Mis descargas"/g, 'title = "Canciones descargadas"');

// B. Inject TimeAgo component
const timeAgoComponent = `const TimeAgo = ({ dateStr }: { dateStr?: string }) => {
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  if (!dateStr) return <span title="Desconocido">-</span>;

  const d = new Date(dateStr);
  const diffSeconds = Math.floor((now - d.getTime()) / 1000);
  
  const exactDate = d.toLocaleString('es-ES', { 
    day: 'numeric', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  }).replace(',', '');

  let displayDate = '';
  if (diffSeconds < 60) {
    displayDate = \`hace \${Math.max(0, diffSeconds)} segundos\`;
  } else if (diffSeconds < 3600) {
    const m = Math.floor(diffSeconds / 60);
    displayDate = \`hace \${m} minuto\${m !== 1 ? 's' : ''}\`;
  } else if (diffSeconds < 86400) {
    const h = Math.floor(diffSeconds / 3600);
    displayDate = \`hace \${h} hora\${h !== 1 ? 's' : ''}\`;
  } else {
    displayDate = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return <span title={exactDate}>{displayDate}</span>;
};

export const DownloadsView =`;

dv = dv.replace('export const DownloadsView =', timeAgoComponent);

// C. Replace formatDate with TimeAgo in renderTrack
const oldDateRender = `<div className="text-white/50 text-xs font-medium truncate">
          {formatDate(track.addedAt)}
        </div>`;
const newDateRender = `<div className="text-white/50 text-xs font-medium truncate">
          <TimeAgo dateStr={track.addedAt} />
        </div>`;
        
dv = dv.replace(oldDateRender, newDateRender);

fs.writeFileSync('src/components/player/DownloadsView.tsx', dv);
console.log('Titles and dates patched!');
