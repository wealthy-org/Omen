import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

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
