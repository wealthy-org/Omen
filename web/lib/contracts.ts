import OmenFactoryJson from "@/contracts/OmenFactory.json";
import OmenMarketJson from "@/contracts/OmenMarket.json";
import {
  ETHEREUM_SEPOLIA_EXPLORER_URL,
  ROBINHOOD_TESTNET_CHAIN_ID,
  ROBINHOOD_TESTNET_EXPLORER_URL,
  OMEN_FACTORY_ADDRESS_ROBINHOOD,
  OMEN_FACTORY_ADDRESS_SEPOLIA,
} from "./constants";

export const getExplorerBaseUrl = (chainId?: number): string => {
  if (chainId === ROBINHOOD_TESTNET_CHAIN_ID) {
    return ROBINHOOD_TESTNET_EXPLORER_URL;
  }
  return ETHEREUM_SEPOLIA_EXPLORER_URL;
};

export const getExplorerTxUrl = (chainId: number | undefined, txHash: string): string => {
  const base = getExplorerBaseUrl(chainId);
  return `${base}/tx/${txHash}`;
};

export const getOmenFactoryAddress = (chainId?: number): `0x${string}` => {
  if (chainId === ROBINHOOD_TESTNET_CHAIN_ID) {
    return OMEN_FACTORY_ADDRESS_ROBINHOOD;
  }
  return OMEN_FACTORY_ADDRESS_SEPOLIA;
};

export const OMEN_FACTORY_ABI = OmenFactoryJson;

export const OMEN_MARKET_ABI = OmenMarketJson;
