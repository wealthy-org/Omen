import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_SEPOLIA = "0x1111111111111111111111111111111111111111";
process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS_ROBINHOOD = "0x2222222222222222222222222222222222222222";
process.env.NEXT_PUBLIC_OMEN_FACTORY_ADDRESS = "0x1111111111111111111111111111111111111111";

vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  const React = await import("react");
  return {
    ...actual,
    WagmiContext: React.createContext({}),
    useAccount: () => ({ address: "0x1234567890123456789012345678901234567890", isConnected: true }),
    useWriteContract: () => ({ writeContractAsync: vi.fn().mockResolvedValue("0xmocktx"), isPending: false }),
    useWaitForTransactionReceipt: () => ({ isLoading: false, isSuccess: false }),
    usePublicClient: () => ({ waitForTransactionReceipt: vi.fn().mockResolvedValue({ logs: [] }) }),
    useReadContract: () => ({ data: undefined, isLoading: false, refetch: vi.fn() }),
    useChainId: () => 11155111,
    useSignTypedData: () => ({ signTypedDataAsync: vi.fn().mockResolvedValue("0xmocksignature"), isPending: false }),
  };
});
