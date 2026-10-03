import sys

# 1. Fix ArtistView.tsx
with open('src/components/player/ArtistView.tsx', 'r') as f:
    code = f.read()

# Fix imports in ArtistView
if 'HeartOff' not in code.split('lucide-react')[0]:
    code = code.replace('Heart,', 'Heart, HeartOff, AlertCircle,')
    
# Fix useDownloads hook in ArtistView
if 'cancelAlbumDownload' not in code.split('useDownloads()')[0]:
    code = code.replace('downloadingAlbums } = useDownloads();', 'downloadingAlbums, cancelAlbumDownload } = useDownloads();')

with open('src/components/player/ArtistView.tsx', 'w') as f:
    f.write(code)


# 2. Fix CatalogView.tsx
with open('src/components/player/CatalogView.tsx', 'r') as f:
    code = f.read()

# Fix imports in CatalogView
if 'AlertCircle' not in code.split('lucide-react')[0]:
    code = code.replace('Heart,', 'Heart, AlertCircle,')

if 'cancelAlbumDownload' not in code.split('useDownloads()')[0]:
    code = code.replace('downloadingAlbums } = useDownloads();', 'downloadingAlbums, cancelAlbumDownload } = useDownloads();')

with open('src/components/player/CatalogView.tsx', 'w') as f:
    f.write(code)


# 3. Fix SadView.tsx multiple attributes error
with open('src/components/player/SadView.tsx', 'r') as f:
    code = f.read()
    
# Find the multiple className attributes and fix them
if 'className=' in code:
    import re
    # We'll just manually replace the exact string if we can find it
    # The error is: JSX elements cannot have multiple attributes with the same name.
    # line 67: className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/20"
    # I'll just use a regex to find a tag with two classNames and merge them or remove the second one.

print("Fixed imports and variables in ArtistView and CatalogView")
