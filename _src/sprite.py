import re, os
L='/tmp/claude-0/-home-claude/3d83fcb7-e6e7-5ab1-ae4d-a5aadbc775ef/scratchpad/npmw/node_modules/lucide-static/icons/'
S='/tmp/claude-0/-home-claude/3d83fcb7-e6e7-5ab1-ae4d-a5aadbc775ef/scratchpad/npmw/node_modules/simple-icons/icons/'
names="heart users leaf star graduation-cap tent trophy shopping-bag baby briefcase heart-handshake party-popper calendar-heart menu x chevron-down chevron-left chevron-right map-pin mail school sparkles camera hand-heart handshake heart-pulse megaphone gift building-2 sun check arrow-up-right ticket music clock send footprints smile book-open shirt backpack".split()
out=['<svg xmlns="http://www.w3.org/2000/svg">']
for n in names:
    p=L+n+'.svg'
    if not os.path.exists(p): print('missing',n); continue
    s=open(p).read()
    s=re.sub(r'<!--.*?-->','',s,flags=re.S)
    inner=re.search(r'<svg[^>]*>(.*)</svg>',s,re.S).group(1)
    inner=re.sub(r'\s+',' ',inner).strip()
    out.append(f'<symbol id="i-{n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{inner}</symbol>')
for n in ['tiktok','instagram','facebook','youtube']:
    s=open(S+n+'.svg').read()
    d=re.search(r'<path d="([^"]+)"',s).group(1)
    out.append(f'<symbol id="s-{n}" viewBox="0 0 24 24"><path fill="currentColor" d="{d}"/></symbol>')
out.append('<symbol id="s-linkedin" viewBox="0 0 24 24"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.91h-4z"/></symbol>')
out.append('</svg>')
open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'icons.svg'),'w').write('\n'.join(out))
print(len(names), os.path.getsize(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'icons.svg')))
