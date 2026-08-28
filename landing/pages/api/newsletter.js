const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return response.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }

  const formId = process.env.KIT_FORM_ID;
  const apiKey = process.env.KIT_API_KEY;
  if (!formId || !apiKey) {
    return response.status(503).json({ success: false, message: 'Newsletter signup is temporarily unavailable.' });
  }

  try {
    const result = await fetch(`https://api.kit.com/v3/forms/${encodeURIComponent(formId)}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ api_key: apiKey, email }),
    });
    if (!result.ok) return response.status(502).json({ success: false, message: 'Newsletter signup is temporarily unavailable.' });
    return response.status(200).json({ success: true, message: 'Subscription confirmed.' });
  } catch {
    return response.status(502).json({ success: false, message: 'Newsletter signup is temporarily unavailable.' });
  }
}
