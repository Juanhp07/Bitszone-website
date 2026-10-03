import sys

# 1. Fix ArtistView
with open('src/components/player/ArtistView.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    "import { ArrowLeft, Play, Download, Check, Loader2, Heart } from 'lucide-react';",
    "import { ArrowLeft, Play, Download, Check, Loader2, Heart, HeartOff, AlertCircle } from 'lucide-react';"
)
code = code.replace(
    "const { downloadTrack, isDownloaded, isFavorite, toggleFavoriteAlbum } = useDownloads();",
    "const { downloadTrack, isDownloaded, isFavorite, toggleFavoriteAlbum, cancelAlbumDownload, downloadingAlbums } = useDownloads();"
)
with open('src/components/player/ArtistView.tsx', 'w') as f:
    f.write(code)

# 2. Fix CatalogView
with open('src/components/player/CatalogView.tsx', 'r') as f:
    code = f.read()

# Fix duplicate AlertCircle
code = code.replace('AlertCircle, HeartOff, AlertCircle', 'AlertCircle, HeartOff')
# Ensure cancelAlbumDownload
if 'cancelAlbumDownload' not in code.split('useDownloads()')[0]:
    code = code.replace('downloadingAlbums } = useDownloads();', 'downloadingAlbums, cancelAlbumDownload } = useDownloads();')

with open('src/components/player/CatalogView.tsx', 'w') as f:
    f.write(code)

