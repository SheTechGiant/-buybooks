import { isSupabaseConfigured } from '../lib/supabase';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <h1>{title}</h1>
        {subtitle && <p className="auth-sub">{subtitle}</p>}
        {!isSupabaseConfigured && (
          <p className="form-error">
            Accounts are not connected yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file.
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
