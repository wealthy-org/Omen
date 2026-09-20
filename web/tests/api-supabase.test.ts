import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getSupabaseClient, getSupabaseAdminClient, resetSupabaseClients } from "@/lib/supabase";

describe("TICKET-24: Supabase Database Client Helper", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    resetSupabaseClients();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    resetSupabaseClients();
    process.env = { ...originalEnv };
  });

  it("should throw error if public environment variables are missing for client", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => getSupabaseClient()).toThrow("Missing Supabase public configuration");
  });

  it("should successfully initialize Supabase public client with valid env vars", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy-anon-key-token";

    const client = getSupabaseClient();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
  });

  it("should reuse cached instance for public client", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy-anon-key-token";

    const client1 = getSupabaseClient();
    const client2 = getSupabaseClient();
    expect(client1).toBe(client2);
  });

  it("should throw error if admin secret role key is missing", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => getSupabaseAdminClient()).toThrow("Missing Supabase admin configuration");
  });

  it("should successfully initialize Supabase admin client with service role key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-role-secret-token";

    const adminClient = getSupabaseAdminClient();
    expect(adminClient).toBeDefined();
    expect(typeof adminClient.from).toBe("function");
  });

  it("should reuse cached instance for admin client", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-role-secret-token";

    const admin1 = getSupabaseAdminClient();
    const admin2 = getSupabaseAdminClient();
    expect(admin1).toBe(admin2);
  });

  it("should create distinct instances after resetSupabaseClients is called", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy-anon-key-token";

    const client1 = getSupabaseClient();
    resetSupabaseClients();
    const client2 = getSupabaseClient();
    expect(client1).not.toBe(client2);
  });

  it("should strictly adhere to the Zero-Comment Policy on target files", () => {
    const filesToCheck = [
      path.resolve(process.cwd(), "lib/supabase.ts"),
      path.resolve(process.cwd(), "types/database.ts"),
    ];

    for (const filePath of filesToCheck) {
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        expect(trimmed.startsWith("//")).toBe(false);
        expect(trimmed.includes("/" + "*")).toBe(false);
        expect(trimmed.includes("*" + "/")).toBe(false);
      }
    }
  });
});
