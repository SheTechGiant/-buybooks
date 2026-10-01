// Shared server helpers. Files starting with "_" are not deployed as endpoints by Vercel.
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

// Created on first use so a missing key gives a clear error instead of crashing on import.
function lazy(create) {
  let instance;
  return new Proxy({}, {
    get(_, prop) {
      instance ??= create();
      const value = instance[prop];
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  });
}

export const stripe = lazy(() => new Stripe(requireEnv('STRIPE_SECRET_KEY')));

// Admin client: bypasses Row Level Security. Server-side only.
export const supabaseAdmin = lazy(() =>
  createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  })
);

export function siteUrl() {
  return (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

// Countries paperbacks can ship to (2-letter codes), e.g. "US,CA,GB,GH,NG".
export function shippingCountries() {
  return (process.env.SHIPPING_COUNTRIES || 'US,CA,GB,IE,GH,NG,KE,ZA,AU,DE,FR,NL')
    .split(',')
    .map(c => c.trim().toUpperCase())
    .filter(Boolean);
}

// Reads the Supabase access token from "Authorization: Bearer <token>" and returns the user.
export async function getUserFromRequest(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error) return null;
  return data.user;
}

export function methodNotAllowed(res) {
  res.setHeader('Allow', 'POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
