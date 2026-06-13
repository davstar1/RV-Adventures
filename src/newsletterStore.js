import { isSupabaseConfigured, subscribeRemoteEmail } from './supabaseApi';

const NEWSLETTER_KEY = 'rv-adventures-newsletter-emails';

function readLocalEmails() {
  try {
    return JSON.parse(window.localStorage.getItem(NEWSLETTER_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalEmail(email, source) {
  const emails = readLocalEmails();
  const normalized = email.toLowerCase();
  const existing = emails.some(entry => entry.email === normalized);

  if (!existing) {
    window.localStorage.setItem(NEWSLETTER_KEY, JSON.stringify([
      { email: normalized, source, subscribedAt: new Date().toISOString() },
      ...emails,
    ]));
  }
}

export async function subscribeEmail(email, source = 'website') {
  const normalized = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

  if (!valid) {
    throw new Error('Enter a valid email address.');
  }

  if (isSupabaseConfigured) {
    await subscribeRemoteEmail(normalized, source);
    return;
  }

  saveLocalEmail(normalized, source);
}
