import { useState } from 'react';
import { subscribeEmail } from './newsletterStore';

export default function NewsletterForm({ className = '', inputClassName = '', buttonText = 'Subscribe', source = 'website' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setStatus('Checking your email...');
    setStatusType('info');
    setLoading(true);

    try {
      const mode = await subscribeEmail(email, source);
      setEmail('');
      if (mode === 'supabase') {
        setStatus('Thanks, you are subscribed.');
        setStatusType('success');
      } else {
        setStatus('Saved on this browser only. Connect Supabase secrets in GitHub to collect live emails.');
        setStatusType('error');
      }
    } catch (error) {
      setStatus(error.message);
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={className} onSubmit={submit} noValidate>
      <input
        type="text"
        value={email}
        placeholder="your@email.com"
        className={inputClassName}
        onChange={event => setEmail(event.target.value)}
        inputMode="email"
        autoComplete="email"
      />
      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : buttonText}
      </button>
      {status && <span className={`newsletter-status newsletter-status--${statusType}`} aria-live="polite">{status}</span>}
    </form>
  );
}
