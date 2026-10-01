import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminSubscribers() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.from('leads').select('email, created_at').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) setError(error.message);
      setLeads(data || []);
    });
  }, []);

  function downloadCsv() {
    const csv = 'email,subscribed_at\n' + leads.map(l => `${l.email},${l.created_at}`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'buybooks-subscribers.csv' });
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyAll() {
    await navigator.clipboard.writeText(leads.map(l => l.email).join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!leads) return <p className="muted">Loading…</p>;

  return (
    <div className="dash-card">
      <div className="admin-toolbar">
        <p className="muted" style={{ margin: 0 }}>{leads.length} newsletter subscriber{leads.length === 1 ? '' : 's'}</p>
        {leads.length > 0 && (
          <div className="admin-toolbar-actions">
            <button className="btn btn-outline btn-sm" onClick={copyAll}>{copied ? 'Copied ✓' : 'Copy all emails'}</button>
            <button className="btn btn-primary btn-sm" onClick={downloadCsv}>Download CSV</button>
          </div>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
      <ul className="simple-list">
        {leads.map(l => (
          <li key={l.email}><span>{l.email}</span><small className="muted">{new Date(l.created_at).toLocaleDateString()}</small></li>
        ))}
      </ul>
    </div>
  );
}
