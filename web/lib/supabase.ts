import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let supabaseClient: SupabaseClient<any> | null = null;
let supabaseAdminClient: SupabaseClient<any> | null = null;

const sanitizeUrl = (rawUrl: string): string => {
  return rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
};

const resolveEnv = (key: string): string | undefined => {
  if (process.env[key]) return process.env[key];
  if (typeof window === "undefined" && process.env.NODE_ENV !== "test" && !process.env.VITEST) {
    try {
      const fs = require("fs");
      const path = require("path");
      const candidates = [
        path.join(process.cwd(), ".env.local"),
        path.join(process.cwd(), ".env"),
        path.join(process.cwd(), "web", ".env.local"),
        path.join(process.cwd(), "web", ".env"),
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          const content = fs.readFileSync(p, "utf-8");
          for (const line of content.split("\n")) {
            const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/);
            if (match && match[1] === key) {
              let val = match[2].trim();
              if (
                (val.startsWith('"') && val.endsWith('"')) ||
                (val.startsWith("'") && val.endsWith("'"))
              ) {
                val = val.slice(1, -1);
              }
              return val;
            }
          }
        }
      }
    } catch {
    }
  }
  return undefined;
};

export const getSupabaseClient = (): SupabaseClient<any> => {
  if (supabaseClient) return supabaseClient;

  const url = resolveEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = resolveEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    throw new Error("Missing Supabase public configuration");
  }

  supabaseClient = createClient(sanitizeUrl(url), anonKey);
  return supabaseClient;
};

export const getSupabaseAdminClient = (): SupabaseClient<any> => {
  if (supabaseAdminClient) return supabaseAdminClient;

  const url = resolveEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey =
    resolveEnv("SUPABASE_SERVICE_ROLE_KEY") ||
    resolveEnv("NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY") ||
    resolveEnv("SUPABASE_SERVICE_KEY") ||
    resolveEnv("SUPABASE_ADMIN_KEY");

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin configuration");
  }

  supabaseAdminClient = createClient(sanitizeUrl(url), serviceKey, {
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
