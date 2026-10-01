import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from || '/account';

  if (user) return <Navigate to={from} replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    navigate(from, { replace: true });
  }

  async function resetPassword() {
    setError('');
    setNotice('');
    if (!email) return setError('Enter your email above first.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`,
    });
    if (error) return setError(error.message);
    setNotice('Check your inbox for a password reset link.');
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to check out, track orders and read your eBooks.">
      <form className="auth-form" onSubmit={submit}>
        <label>
          Email
          <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        {notice && <p className="form-notice">{notice}</p>}
        <button className="btn btn-primary btn-block" disabled={busy || !isSupabaseConfigured}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
        <button type="button" className="link-btn" onClick={resetPassword} disabled={!isSupabaseConfigured}>
          Forgot your password?
        </button>
      </form>
      <p className="auth-switch">New to BuyBooks? <Link to="/signup" state={{ from }}>Create an account</Link></p>
    </AuthLayout>
  );
}
