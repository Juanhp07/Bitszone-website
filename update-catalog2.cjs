const fs = require('fs');
let file = fs.readFileSync('src/components/player/CatalogView.tsx', 'utf8');

// Replace import
file = file.replace(
  "import { useDraggableScroll } from './useDraggableScroll';",
  "import { ScrollableList } from '../ui/ScrollableList';"
);

// Remove hooks
file = file.replace(/ *const artistsScrollRef = useDraggableScroll\(\);\n/g, "");
file = file.replace(/ *const albumsScrollRef = useDraggableScroll\(\);\n/g, "");
file = file.replace(/ *const albumsScrollRef2 = useDraggableScroll\(\);\n/g, "");

// Replace opening tags
file = file.replace(/<div ref=\{[^}]+\} className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide" style=\{\{ scrollbarWidth: 'none' \}\}>/g, "<ScrollableList>");

// Replace closing tags
// Because we have exactly 3 lists, and they are closed right before `</section>`,
// we can replace `</div>\n      </section>` with `</ScrollableList>\n      </section>`
file = file.replace(/<\/div>\n      <\/section>/g, "</ScrollableList>\n      </section>");

fs.writeFileSync('src/components/player/CatalogView.tsx', file);
