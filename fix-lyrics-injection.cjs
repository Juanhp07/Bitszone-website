const fs = require('fs');
let code = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const stateVariablesFind = 'const [activeTab, setActiveTab] = React.useState<"portada" | "letra">("portada");';
const logicAdd = `
  const lyricsContainerRef = React.useRef<HTMLDivElement>(null);
  const activeLineRef = React.useRef<HTMLParagraphElement>(null);

  const isSomewhereIBelong = track.title === "Somewhere I Belong";
  const activeLyrics = isSomewhereIBelong ? somewhereIBelongLyrics : [];
  const currentSecs = progress * (track.duration / 1000);

  const activeLineIndex = React.useMemo(() => {
    return activeLyrics.reduce((acc, line, i) => {
      if (currentSecs >= line.time) return i;
      return acc;
    }, -1);
  }, [currentSecs, activeLyrics]);

  React.useEffect(() => {
    if (activeTab === 'letra' && activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLineIndex, activeTab]);
`;

if (!code.includes('const lyricsContainerRef')) {
  code = code.replace(stateVariablesFind, stateVariablesFind + logicAdd);
  fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', code);
  console.log('Fixed lyrics logic injection');
} else {
  console.log('Already injected');
}
