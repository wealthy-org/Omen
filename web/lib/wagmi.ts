import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC ||
          "https://rpc.testnet.chain.robinhood.com",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Explorer",
      url:
        process.env.NEXT_PUBLIC_ROBINHOOD_EXPLORER ||
        "https://explorer.testnet.chain.robinhood.com",
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
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC ||
        process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
        "https://rpc.sepolia.org"
    ),
    [robinhoodTestnet.id]: http(
      process.env.NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC ||
        "https://rpc.testnet.chain.robinhood.com"
    ),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

