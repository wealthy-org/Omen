import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";
import {
  ROBINHOOD_TESTNET_CHAIN_ID,
  ETHEREUM_SEPOLIA_RPC_URL,
  ROBINHOOD_TESTNET_RPC_URL,
  ROBINHOOD_TESTNET_EXPLORER_URL,
} from "./constants";

export const robinhoodTestnet = defineChain({
  id: ROBINHOOD_TESTNET_CHAIN_ID,
  name: "Robinhood Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [ROBINHOOD_TESTNET_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Explorer",
      url: ROBINHOOD_TESTNET_EXPLORER_URL,
    },
  },
  testnet: true,
});

export const supportedChains = [sepolia, robinhoodTestnet] as const;
export const DEFAULT_CHAIN_ID = sepolia.id;

export const config = createConfig({
  chains: [sepolia, robinhoodTestnet],
  connectors: [
    injected({
      target: "phantom",
    }),
    injected({
      target: "metaMask",
    }),
    injected({
      target: "rabby",
    }),
    injected({
      target: "coinbaseWallet",
    }),
    injected(),
  ],
  transports: {
    [sepolia.id]: http(ETHEREUM_SEPOLIA_RPC_URL),
    [robinhoodTestnet.id]: http(ROBINHOOD_TESTNET_RPC_URL),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

