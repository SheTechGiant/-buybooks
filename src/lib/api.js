import { supabase } from './supabase';

// Calls one of our /api serverless functions with the logged-in user's token.
async function callApi(path, body) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please log in first.');

  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.');
  return json;
}

// items: [{ bookId, format, qty }] — prices are re-checked on the server.
export async function startCheckout(items) {
  const { url } = await callApi('/api/create-checkout-session', { items });
  window.location.href = url;
}

// Returns a short-lived download link for an eBook the user has bought.
export async function getEbookLink(bookId) {
  const { url } = await callApi('/api/ebook-download', { bookId });
  return url;
}
