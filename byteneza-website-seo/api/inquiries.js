const MAX_BODY_BYTES = 12 * 1024;
const RECIPIENT = 'bytenezateam@gmail.com';
const SERVICES = new Set(['Web Development', 'Portfolio Solutions', 'App Development', 'AI & Automation', 'Other']);
const TIMELINES = new Set(['ASAP', '2–4 weeks', '1–3 months', '3+ months', 'Not sure yet']);

function reply(res, status, message) {
  res.status(status).json({ message });
}

function clean(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

module.exports = async function inquiries(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(res, 405, 'Method not allowed.');
  }

  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return reply(res, 403, 'Request origin is not allowed.');
    } catch (_) {
      return reply(res, 403, 'Request origin is not allowed.');
    }
  }

  const rawLength = Number(req.headers['content-length'] || 0);
  if (rawLength > MAX_BODY_BYTES) return reply(res, 413, 'Request is too large.');
  if (!String(req.headers['content-type'] || '').toLowerCase().includes('application/json')) {
    return reply(res, 415, 'Expected JSON.');
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { return reply(res, 400, 'Invalid request.'); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(res, 400, 'Invalid request.');
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) return reply(res, 413, 'Request is too large.');

  // Quietly accept automated honeypot submissions without sending email.
  if (clean(body.website, 200)) return reply(res, 200, 'Request received.');

  const inquiry = {
    fullName: clean(body.fullName, 120),
    email: clean(body.email, 200),
    phone: clean(body.phone, 40),
    company: clean(body.company, 160),
    service: clean(body.service, 80),
    timeline: clean(body.timeline, 40),
    description: clean(body.description, 4000),
    budget: clean(body.budget, 160)
  };
  if (inquiry.fullName.length < 2 || inquiry.email.length > 200 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email) ||
      inquiry.phone.replace(/\D/g, '').length < 7 || !SERVICES.has(inquiry.service) ||
      !TIMELINES.has(inquiry.timeline) || inquiry.description.length < 10) {
    return reply(res, 400, 'Please check the required fields and try again.');
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error('Contact email delivery is not configured.');
    return reply(res, 503, 'Email delivery is not configured yet. Please email bytenezateam@gmail.com.');
  }

  const text = [
    'New BYTENEZA project request',
    '',
    `Name: ${inquiry.fullName}`,
    `Email: ${inquiry.email}`,
    `Phone: ${inquiry.phone}`,
    `Company: ${inquiry.company || 'Not provided'}`,
    `Service: ${inquiry.service}`,
    `Timeline: ${inquiry.timeline}`,
    `Budget: ${inquiry.budget || 'Not provided'}`,
    '',
    'Project description:',
    inquiry.description
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [RECIPIENT], reply_to: inquiry.email, subject: `Project request: ${inquiry.service}`, text })
    });
    if (!response.ok) {
      console.error('Email provider rejected contact request:', response.status);
      return reply(res, 502, 'We could not send your request. Please try again or email bytenezateam@gmail.com.');
    }
    return reply(res, 200, 'Your project request was sent.');
  } catch (error) {
    console.error('Email provider request failed:', error && error.name ? error.name : 'unknown error');
    return reply(res, 502, 'We could not send your request. Please try again or email bytenezateam@gmail.com.');
  }
};
