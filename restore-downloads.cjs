const fs = require('fs');
const execSync = require('child_process').execSync;

const scripts = [
  'fix-downloads-hold-button.cjs',
  'fix-fuse-buttons.cjs',
  'fix-favorites-button.cjs',
  'fix-fav-hover.cjs',
  'fix-downloads-albums-fav.cjs',
  'fix-cards-fav.cjs',
  'fix-biblioteca-text.cjs',
  'fix-downloads-toasts.cjs',
  'fix-view-ui.cjs',
  'fix-tabs-ring.cjs',
  'fix-imports.cjs',
  'fix-imports-2.cjs',
  'fix-imports-3.cjs',
  'fix-downloads-colors.cjs',
  'fix-downloads-colors-safe.cjs',
  'fix-empty-state.cjs',
  'fix-library-view.cjs',
  'fix-library-view-2.cjs',
  'fix-empty-layout.cjs',
  'fix-library-animation.cjs',
  'update-downloads-view.cjs',
  'update-search-and-cover.cjs',
  'fix-cover-animation.cjs',
  'advanced-icon-animations.cjs',
  'fix-playlist-icon.cjs',
  'update-playlist-anim.cjs',
  'fix-playlist-fluid.cjs',
  'fix-playlist-final.cjs',
  'fix-playlist-no-pauses.cjs',
  'speed-up-playlist.cjs',
  'get-downloads-css.cjs',
  'fix-downloads-icon.cjs',
  'fix-downloads-target.cjs',
  'fix-playlist-moment.cjs',
  'fix-hover-text.cjs',
  'fix-modal-and-button.cjs',
  'fix-downloads-button.cjs',
  'fix-downloads-1.cjs',
  'fix-sort-modal.cjs',
  'fix-sort-portal.cjs'
];

// Revert to ensure clean slate
console.log("Restoring DownloadsView.tsx...");

for (const script of scripts) {
  if (fs.existsSync(script)) {
    const content = fs.readFileSync(script, 'utf8');
    if (content.includes('DownloadsView.tsx')) {
       console.log("Running " + script);
       try {
         execSync('node ' + script, { stdio: 'inherit' });
       } catch (e) {
         console.log("Error running " + script);
       }
    }
  }
}
