import { NextRequest } from "next/server";

export function isAuthorizedAdmin(req: NextRequest): boolean {
  const adminKeyHeader = req.headers.get("x-admin-key")?.trim();
  const authHeader = req.headers.get("authorization")?.trim();
  const bearerToken = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const adminWalletHeader = req.headers.get("x-admin-wallet")?.trim().toLowerCase();

  const validAdminKeys = [
    process.env.ADMIN_SECRET_KEY?.trim(),
  ].filter(Boolean) as string[];

  const validAdminWallets = [
    ...(process.env.ADMIN_WALLET_ADDRESS?.split(",").map((s) => s.trim().toLowerCase()) || []),
  ].filter(Boolean) as string[];

  if (adminKeyHeader && validAdminKeys.includes(adminKeyHeader)) {
    return true;
  }

  if (bearerToken && validAdminKeys.includes(bearerToken)) {
    return true;
  }

  if (adminWalletHeader && validAdminWallets.includes(adminWalletHeader)) {
    return true;
  }

  return false;
}
