import { useState } from 'react';
import { subscribeEmail } from './newsletterStore';

export default function NewsletterForm({ className = '', inputClassName = '', buttonText = 'Subscribe', source = 'website' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      await subscribeEmail(email, source);
      setEmail('');
      setStatus('Thanks, you are subscribed.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={className} onSubmit={submit}>
      <input
        type="email"
        value={email}
        placeholder="your@email.com"
        className={inputClassName}
        onChange={event => setEmail(event.target.value)}
        required
      />
      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : buttonText}
      </button>
      {status && <span className="newsletter-status">{status}</span>}
    </form>
  );
}
