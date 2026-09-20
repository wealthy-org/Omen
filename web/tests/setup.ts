import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "@/lib/constants";

process.env.ADMIN_SECRET_KEY = "omen-admin-2026";
process.env.ADMIN_WALLET_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678,0xAdmin99999999999999999999999999999999999";

vi.mock("wagmi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wagmi")>();
  const React = await import("react");
  return {
    ...actual,
    WagmiContext: React.createContext({}),
    useConnection: () => ({ address: "0x1234567890123456789012345678901234567890", isConnected: true }),
    useWriteContract: () => {
      const mockWrite = vi.fn().mockResolvedValue("0xmocktx");
      return {
        writeContract: mockWrite,
        writeContractAsync: mockWrite,
        mutate: mockWrite,
        mutateAsync: mockWrite,
        isPending: false,
      };
    },
    useWaitForTransactionReceipt: () => ({ isLoading: false, isSuccess: false }),
    usePublicClient: () => ({ waitForTransactionReceipt: vi.fn().mockResolvedValue({ logs: [] }) }),
    useReadContract: () => ({ data: undefined, isLoading: false, refetch: vi.fn() }),
    useChainId: () => ETHEREUM_SEPOLIA_CHAIN_ID,
    useSignTypedData: () => {
      const mockSign = vi.fn().mockResolvedValue("0xmocksignature");
      return {
        signTypedData: mockSign,
        signTypedDataAsync: mockSign,
        mutate: mockSign,
        mutateAsync: mockSign,
        isPending: false,
      };
    },
  };
});
