import { useState } from 'react';

async function submitForm(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Please try again.');
  return body;
}

export function NewsletterForm({ inverse = false }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const result = await submitForm('/api/newsletter', { email });
      setStatus('success');
      setMessage(result.message);
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  return (
    <form className={`inline-form ${inverse ? 'inverse' : ''}`} onSubmit={onSubmit} noValidate>
      <label htmlFor="newsletter-email">Email address</label>
      <div>
        <input id="newsletter-email" type="email" autoComplete="email" maxLength="254" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        <button className="button button-accent" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Joining…' : 'Follow the journey'}</button>
      </div>
      <p className={`form-note ${status}`}>{message || 'Occasional updates. Unsubscribe whenever you like.'}</p>
    </form>
  );
}

export function ContactForm() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  function update(event) {
    setFields((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const result = await submitForm('/api/contact', fields);
      setStatus('success');
      setMessage(result.message);
      setFields({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="form-row">
        <label>Name<input name="name" maxLength="100" value={fields.name} onChange={update} autoComplete="name" /></label>
        <label>Email address<input name="email" type="email" maxLength="254" required value={fields.email} onChange={update} autoComplete="email" /></label>
      </div>
      <label>Message<textarea name="message" maxLength="3000" required rows="6" value={fields.message} onChange={update} /></label>
      <button className="button button-primary" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : 'Send message'}</button>
      {message ? <p className={`form-note ${status}`} role="status">{message}</p> : null}
    </form>
  );
}
