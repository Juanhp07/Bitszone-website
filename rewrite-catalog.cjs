const fs = require('fs');

let content = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');

// Add ChevronLeft to lucide-react imports if not there
if (!content.includes('ChevronLeft')) {
  content = content.replace("import { Play, Pause, Download, Check, Loader2 } from 'lucide-react';", "import { Play, Pause, Download, Check, Loader2, ChevronLeft } from 'lucide-react';");
}

// Add state
content = content.replace(
  "const [isDownloadingAlbum, setIsDownloadingAlbum] = useState<number | null>(null);",
  "const [isDownloadingAlbum, setIsDownloadingAlbum] = useState<number | null>(null);\n  const [expandedSection, setExpandedSection] = useState<'canciones' | 'artistas' | 'destacados' | null>(null);"
);

// We need a helper to render a list either as ScrollableList or as Grid
const helperCode = `
  const renderList = (items, isExpanded, renderItem) => {
    if (isExpanded) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-20">
          {items.map(renderItem)}
        </div>
      );
    }
    return (
      <ScrollableList>
        {items.map(renderItem)}
      </ScrollableList>
    );
  };
`;
// Let's insert the helperCode after dynamicArtists
content = content.replace(
  "  const dynamicArtists = Array.from(artistsMap.values());",
  "  const dynamicArtists = Array.from(artistsMap.values());\n" + helperCode
);

fs.writeFileSync('src/components/player/CatalogView.tsx', content);
