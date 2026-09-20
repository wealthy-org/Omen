import { Address, defineChain } from "viem";

export const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
export const ROBINHOOD_TESTNET_CHAIN_ID = 46630;

export const ETHEREUM_SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
export const ROBINHOOD_TESTNET_RPC_URL = "https://rpc.testnet.chain.robinhood.com";

export const ETHEREUM_SEPOLIA_EXPLORER_URL = "https://sepolia.etherscan.io";
export const ROBINHOOD_TESTNET_EXPLORER_URL = "https://explorer.testnet.chain.robinhood.com";

export const OMEN_FACTORY_ADDRESS_SEPOLIA: Address = "0x274f1c838226e4efd8083e787949a28f815d0261";
export const OMEN_FACTORY_ADDRESS_ROBINHOOD: Address = "0x274f1c838226e4efd8083e787949a28f815d0261";
export const OMEN_FACTORY_ADDRESS: Address = OMEN_FACTORY_ADDRESS_SEPOLIA;

export const CHAINLINK_ETH_USD_FEED: Address = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
export const CHAINLINK_BTC_USD_FEED: Address = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";
export const CHAINLINK_SOL_USD_FEED: Address = "0x0c9973e7a27d00e656B9f153348dA46CaD70d03d";
export const CHAINLINK_LINK_USD_FEED: Address = "0xc59E3633BAAC79493d908e636ee6716c2D0ca80b";

export const CHAINLINK_PRICE_FEEDS: Record<number, Record<string, Address>> = {
  [ETHEREUM_SEPOLIA_CHAIN_ID]: {
    ETH: CHAINLINK_ETH_USD_FEED,
    BTC: CHAINLINK_BTC_USD_FEED,
    LINK: CHAINLINK_LINK_USD_FEED,
    SOL: CHAINLINK_SOL_USD_FEED,
  },
  [ROBINHOOD_TESTNET_CHAIN_ID]: {
    ETH: CHAINLINK_ETH_USD_FEED,
    BTC: CHAINLINK_BTC_USD_FEED,
    LINK: CHAINLINK_LINK_USD_FEED,
    SOL: CHAINLINK_SOL_USD_FEED,
  },
};


export const robinhoodChain = defineChain({
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
