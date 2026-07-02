import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class SupabaseConfigError extends Error {
  constructor() {
    super(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY hoặc SUPABASE_SERVICE_ROLE_KEY. Hãy cấu hình .env.local và chạy migration Supabase trước khi upload."
    );
    this.name = "SupabaseConfigError";
  }
}

export function assertSupabaseConfigured() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !getSupabaseServerKey()) {
    throw new SupabaseConfigError();
  }
}

export function isSupabaseConfigError(error: unknown): error is SupabaseConfigError {
  return error instanceof SupabaseConfigError;
}

let cachedClient: SupabaseClient | null = null;
let cachedKey: string | null = null;

export function getSupabaseServerClient() {
  assertSupabaseConfigured();

  const key = getSupabaseServerKey() as string;

  if (!cachedClient || cachedKey !== key) {
    cachedKey = key;
    cachedClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return cachedClient;
}

function getSupabaseServerKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
}