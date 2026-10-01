import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checkEmail, setCheckEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  // Where to go after sign-up, e.g. back to the cart.
  const from = useLocation().state?.from || '/account';

  if (user && !busy) return <Navigate to={from} replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}${from}`,
      },
    });
    setBusy(false);

    if (error) return setError(error.message);
    // Email confirmation is on in Supabase → no session until they click the link.
    if (!data.session) return setCheckEmail(true);
    navigate(from, { replace: true });
  }

  if (checkEmail) {
    return (
      <AuthLayout title="Check your inbox" subtitle={`We sent a confirmation link to ${email}.`}>
        <p>Click the link in the email to activate your account. Your cart will be saved.</p>
        <Link to="/login" state={{ from }} className="btn btn-primary btn-block">Go to sign in</Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Track your orders and keep all your eBooks in one library.">
      <form className="auth-form" onSubmit={submit}>
        <label>
          Your name
          <input type="text" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label>
          Email
          <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary btn-block" disabled={busy || !isSupabaseConfigured}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login" state={{ from }}>Sign in</Link></p>
    </AuthLayout>
  );
}
