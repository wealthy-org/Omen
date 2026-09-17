export const MOCK_PREDICTION_MARKET_ADDRESS: `0x${string}` =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const MOCK_OMEN_FACTORY_ADDRESS_SEPOLIA: `0x${string}` =
  "0x1111111111111111111111111111111111111111";

export const MOCK_OMEN_FACTORY_ADDRESS_ROBINHOOD: `0x${string}` =
  "0x2222222222222222222222222222222222222222";

export const USE_MOCK_CONTRACT =
  process.env.NEXT_PUBLIC_USE_MOCK_CONTRACT !== "false";

export function getMockOmenFactoryAddress(chainId?: number): `0x${string}` {
  if (chainId === 46630) {
    return MOCK_OMEN_FACTORY_ADDRESS_ROBINHOOD;
  }
  return MOCK_OMEN_FACTORY_ADDRESS_SEPOLIA;
}
