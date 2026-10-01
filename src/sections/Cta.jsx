import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Cta() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!supabase) {
      setStatus('error');
      setError('The email list is not connected yet — add your Supabase keys to .env.');
      return;
    }
    setStatus('sending');
    const { error } = await supabase.from('leads').insert({ email: email.trim().toLowerCase() });
    // 23505 = already on the list — treat as success.
    if (error && error.code !== '23505') {
      setStatus('error');
      setError('Could not save your email. Please try again.');
      return;
    }
    setStatus('done');
    setEmail('');
  }

  return (
    <section className="cta">
      <div className="container cta-inner">
        <h2>Never miss a great read.</h2>
        <p>Get new releases, staff picks and members-only deals in your inbox every week.</p>
        {status === 'done' ? (
          <p className="cta-msg">Thanks for subscribing! Look out for our next newsletter.</p>
        ) : (
          <form className="cta-form" onSubmit={submit}>
            <input
              type="email"
              placeholder="Enter your email"
              aria-label="Email address"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-dark" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'error' && <p className="cta-msg">{error}</p>}
      </div>
    </section>
  );
}
