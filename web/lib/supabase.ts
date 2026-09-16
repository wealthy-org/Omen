import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

let supabaseClient: SupabaseClient<any> | null = null;
let supabaseAdminClient: SupabaseClient<any> | null = null;

export const getSupabaseClient = (): SupabaseClient<any> => {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase public configuration");
  }

  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
};

export const getSupabaseAdminClient = (): SupabaseClient<any> => {
  if (supabaseAdminClient) return supabaseAdminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin configuration");
  }

  supabaseAdminClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return supabaseAdminClient;
};

export const resetSupabaseClients = () => {
  supabaseClient = null;
  supabaseAdminClient = null;
};
