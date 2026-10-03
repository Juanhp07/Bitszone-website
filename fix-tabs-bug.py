import sys
with open('src/components/player/DownloadsView.tsx', 'r') as f:
    code = f.read()

bad_str = """'${type === 'licenses' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : type === 'playlists' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-[#a855f7]/20 text-[#c084fc] border-[#a855f7]/30'} shadow-md'"""

good_str = """(type === 'licenses' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : type === 'playlists' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-[#a855f7]/20 text-[#c084fc] border-[#a855f7]/30 shadow-md')"""

if bad_str in code:
    code = code.replace(bad_str, good_str)
    with open('src/components/player/DownloadsView.tsx', 'w') as f:
        f.write(code)
    print("Fixed bad template literal string from earlier script")
else:
    print("Bad string not found")

