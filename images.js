// URL-only image workflow. No file uploads or Firebase Storage required.
export function imageFromLink(raw) {
  const value=String(raw||'').trim();
  if(!value) return '';
  let url; try { url=new URL(value); } catch { throw Error('Paste a valid HTTPS image URL.'); }
  if(url.protocol!=='https:') throw Error('Image links must use HTTPS.');
  const host=url.hostname.toLowerCase();
  if(host==='drive.google.com'||host==='docs.google.com') {
    const match=url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const id=match?.[1] || url.searchParams.get('id');
    if(!id || !/^[a-zA-Z0-9_-]{10,}$/.test(id)) throw Error('Could not find a Google Drive file ID.');
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600`;
  }
  return url.href;
}
export function displayImage(link,fallback) {
  try {return imageFromLink(link)||fallback;} catch {return fallback;}
}
