import { createClient } from "@supabase/supabase-js";

// Placeholders keep module import (and `next build`) from crashing when the
// env vars are not present (e.g. CI build test). Real values are required at
// runtime for any Supabase call to succeed.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-placeholder";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

/**
 * Calls a Supabase Edge Function with the signed-in user's JWT.
 * All functions require authentication (verify_jwt = true), so a missing
 * session fails fast with a clear message instead of a 401 from the gateway.
 */
export async function callEdgeFunction<T = unknown>(
  name: string,
  options: { method?: string; body?: unknown; params?: Record<string, string> } = {}
): Promise<T> {
  const { method = "POST", body, params } = options;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new Error("Bitte zuerst anmelden, um diese Funktion zu nutzen.");
  }

  let url = `${FUNCTIONS_URL}/${name}`;
  if (params) {
    url += `?${new URLSearchParams(params).toString()}`;
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    throw new Error(data?.error || `Edge function ${name} failed (${res.status})`);
  }
  return data as T;
}
