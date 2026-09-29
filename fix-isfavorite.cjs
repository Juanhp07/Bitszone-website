const fs = require('fs');

let player = fs.readFileSync('src/components/player/ImmersivePlayer.tsx', 'utf8');

const regex = /const \[activeTab, setActiveTab\] = React\.useState<"portada" \| "letra">.*?;/;

if (player.match(regex)) {
  player = player.replace(
    regex,
    `$&
  const { isFavorite } = useDownloads();`
  );
  fs.writeFileSync('src/components/player/ImmersivePlayer.tsx', player);
  console.log('Successfully injected useDownloads hook.');
} else {
  console.log('Could not find activeTab definition.');
}
