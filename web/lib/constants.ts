import { Address, defineChain } from "viem";

export const ETHEREUM_SEPOLIA_CHAIN_ID = 11155111;
export const ROBINHOOD_TESTNET_CHAIN_ID = 46630;
export const DEFAULT_CHAIN_ID = ETHEREUM_SEPOLIA_CHAIN_ID;

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_DAY = 86400;
export const DEFAULT_MARKET_DURATION_DAYS = 7;
export const DEFAULT_MARKET_DURATION_SECONDS = DEFAULT_MARKET_DURATION_DAYS * SECONDS_PER_DAY;

export const BASIS_POINTS_DIVISOR = 10000;
export const BPS_DENOMINATOR = BASIS_POINTS_DIVISOR;

export const ETHEREUM_SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
export const ROBINHOOD_TESTNET_RPC_URL = "https://rpc.testnet.chain.robinhood.com";

export const ETHEREUM_SEPOLIA_EXPLORER_URL = "https://sepolia.etherscan.io";
export const ROBINHOOD_TESTNET_EXPLORER_URL = "https://explorer.testnet.chain.robinhood.com";

export const OMEN_FACTORY_ADDRESS_SEPOLIA: Address = "0x274f1c838226e4efd8083e787949a28f815d0261";
export const OMEN_FACTORY_ADDRESS_ROBINHOOD: Address = "0x074605e9504c9967fde94107f954d6218b7a09cc";
export const OMEN_FACTORY_ADDRESS: Address = OMEN_FACTORY_ADDRESS_SEPOLIA;

export type ChainlinkFeedInfo = {
  asset: string;
  symbol: string;
  name: string;
  address: Address;
  heartbeatSec: number;
};

export const CHAINLINK_SEPOLIA_FEED_LIST: ChainlinkFeedInfo[] = [
  { asset: "BTC", symbol: "BTC/USD", name: "Bitcoin / US Dollar", address: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43", heartbeatSec: 3600 },
  { asset: "ETH", symbol: "ETH/USD", name: "Ethereum / US Dollar", address: "0x694AA1769357215DE4FAC081bf1f309aDC325306", heartbeatSec: 3600 },
  { asset: "LINK", symbol: "LINK/USD", name: "Chainlink / US Dollar", address: "0xc59E3633BAAC79493d908e63626716e204A45EdF", heartbeatSec: 3600 },
  { asset: "WSTETH", symbol: "WSTETH/USD", name: "Wrapped stETH / US Dollar", address: "0xaaabb530434B0EeAAc9A42E25dbC6A22D7bE218E", heartbeatSec: 86400 },
  { asset: "SNX", symbol: "SNX/USD", name: "Synthetix / US Dollar", address: "0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC", heartbeatSec: 86400 },
  { asset: "XAU", symbol: "XAU/USD", name: "Gold / US Dollar", address: "0xC5981F461d74c46eB4b0CF3f4Ec79f025573B0Ea", heartbeatSec: 86400 },
  { asset: "CSPX", symbol: "CSPX/USD", name: "iShares S&P 500 / US Dollar", address: "0x4b531A318B0e44B549F3b2f824721b3D0d51930A", heartbeatSec: 86400 },
  { asset: "EUR", symbol: "EUR/USD", name: "Euro / US Dollar", address: "0x1a81afB8146aeFfCFc5E50e8479e826E7D55b910", heartbeatSec: 86400 },
  { asset: "GBP", symbol: "GBP/USD", name: "British Pound / US Dollar", address: "0x91FAB41F5f3bE955963a986366edAcff1aaeaa83", heartbeatSec: 86400 },
];

const feedAddress = (asset: string) => CHAINLINK_SEPOLIA_FEED_LIST.find((f) => f.asset === asset)!.address;

export const CHAINLINK_ETH_USD_FEED: Address = feedAddress("ETH");
export const CHAINLINK_BTC_USD_FEED: Address = feedAddress("BTC");
export const CHAINLINK_LINK_USD_FEED: Address = feedAddress("LINK");

export const CHAINLINK_PRICE_FEEDS: Record<number, Record<string, Address>> = {
  [ETHEREUM_SEPOLIA_CHAIN_ID]: Object.fromEntries(CHAINLINK_SEPOLIA_FEED_LIST.map((f) => [f.asset, f.address])),
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
