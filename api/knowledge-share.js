const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

export default async function handler(request, response) {
  const slug = String(request.query?.slug || '').replace(/[^a-z0-9-]/g, '');
  const appUrl = `${process.env.PUBLIC_APP_URL || 'https://app.greencompass.app'}/knowledge/content/${slug}`;
  let title = 'Knowledge Hub | Green Compass';
  let description = 'Trusted sustainability knowledge connected to practical action.';
  try {
    const endpoint = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/published_knowledge_items?slug=eq.${encodeURIComponent(slug)}&select=title,summary&limit=1`;
    const result = await fetch(endpoint, { headers: { apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}` } });
    const [item] = result.ok ? await result.json() : [];
    if (item) { title = `${item.title} | Green Compass`; description = item.summary; }
  } catch {}
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  response.status(200).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(appUrl)}"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="${escapeHtml(appUrl)}"><meta http-equiv="refresh" content="0;url=${escapeHtml(appUrl)}"></head><body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><p><a href="${escapeHtml(appUrl)}">Read in Green Compass</a></p></main></body></html>`);
}
