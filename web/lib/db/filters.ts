import { eq, or, type SQL } from "drizzle-orm";
import { markets } from "./schema";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PG_INT_MAX = 2_147_483_647;

export const isUuid = (value: string): boolean => UUID_PATTERN.test(value);

export function marketIdentifierFilter(rawId: string): SQL {
  const id = rawId.trim();

  if (isUuid(id)) {
    return or(eq(markets.id, id), eq(markets.contract_address, id))!;
  }

  const numericId = Number(id);
  if (/^\d+$/.test(id) && numericId <= PG_INT_MAX) {
    return or(eq(markets.contract_market_id, numericId), eq(markets.contract_address, id))!;
  }

  return eq(markets.contract_address, id);
}
