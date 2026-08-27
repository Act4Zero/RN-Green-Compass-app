const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value, limit) => typeof value === 'string' ? value.trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, limit) : '';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const name = clean(request.body?.name, 100);
  const email = clean(request.body?.email, 254).toLowerCase();
  const message = clean(request.body?.message, 3000);
  if (!EMAIL_PATTERN.test(email) || !message) {
    return response.status(400).json({ success: false, message: 'Enter a valid email and message.' });
  }

  const endpoint = process.env.SHEETS_ENDPOINT;
  const tabId = process.env.SHEETS_TAB_ID;
  if (!endpoint || !tabId) {
    return response.status(503).json({ success: false, message: 'Contact is temporarily unavailable.' });
  }

  try {
    const result = await fetch(`${endpoint}?tabId=${encodeURIComponent(tabId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify([[name, email, message, new Date().toISOString()]]),
    });
    if (!result.ok) return response.status(502).json({ success: false, message: 'Contact is temporarily unavailable.' });
    return response.status(200).json({ success: true, message: 'Message sent.' });
  } catch {
    return response.status(502).json({ success: false, message: 'Contact is temporarily unavailable.' });
  }
}
