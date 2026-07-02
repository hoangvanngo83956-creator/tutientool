import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getLocalDatabasePath, getLocalSupabaseClient } from "@/lib/local-sqlite";

export class SupabaseConfigError extends Error {
  constructor() {
    super("Local database is enabled. Supabase configuration is not required.");
    this.name = "SupabaseConfigError";
  }
}

export function assertSupabaseConfigured() {
  if (isLocalDatabaseEnabled()) return;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !getSupabaseServerKey()) {
    throw new SupabaseConfigError();
  }
}

export function isSupabaseConfigError(error: unknown): error is SupabaseConfigError {
  return error instanceof SupabaseConfigError;
}

let cachedClient: SupabaseClient | null = null;
let cachedKey: string | null = null;

export function getSupabaseServerClient(): any {
  if (isLocalDatabaseEnabled()) {
    return getLocalSupabaseClient();
  }

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

export function isLocalDatabaseEnabled() {
  return process.env.DATABASE_PROVIDER !== "supabase";
}

export function getDatabaseInfo() {
  return isLocalDatabaseEnabled()
    ? { provider: "sqlite", path: getLocalDatabasePath() }
    : { provider: "supabase", path: process.env.NEXT_PUBLIC_SUPABASE_URL || "" };
}

function getSupabaseServerKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
}
