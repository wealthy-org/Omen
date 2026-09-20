import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useConfig, useChainId } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { Web3Providers } from "@/app/providers";
import { config, robinhoodTestnet } from "@/lib/wagmi";
import { ETHEREUM_SEPOLIA_CHAIN_ID } from "@/lib/constants";

function TestConsumer() {
  const wagmiConfig = useConfig();
  const chainId = useChainId();
  const queryClient = useQueryClient();

  return (
    <div>
      <span data-testid="consumer-content">Provider Content Loaded</span>
      <span data-testid="chain-id">{chainId}</span>
      <span data-testid="has-wagmi-config">{wagmiConfig ? "yes" : "no"}</span>
      <span data-testid="has-query-client">{queryClient ? "yes" : "no"}</span>
    </div>
  );
}

describe("Web3Providers Component", () => {
  it("renders children properly within Web3Providers context", () => {
    render(
      <Web3Providers>
        <div data-testid="child-element">Active Child Element</div>
      </Web3Providers>
    );

    expect(screen.getByTestId("child-element")).toBeInTheDocument();
    expect(screen.getByText("Active Child Element")).toBeInTheDocument();
  });

  it("provides access to Wagmi and React Query contexts", () => {
    render(
      <Web3Providers>
        <TestConsumer />
      </Web3Providers>
    );

    expect(screen.getByTestId("consumer-content")).toBeInTheDocument();
    expect(screen.getByTestId("has-wagmi-config")).toHaveTextContent("yes");
    expect(screen.getByTestId("has-query-client")).toHaveTextContent("yes");
    expect(screen.getByTestId("chain-id")).toHaveTextContent(String(ETHEREUM_SEPOLIA_CHAIN_ID));
  });

  it("has correct Wagmi configuration for Sepolia and Robinhood Testnet", () => {
    expect(config.chains).toBeDefined();
    expect(config.chains.length).toBeGreaterThanOrEqual(2);
    expect(config.chains.map((c) => c.id)).toContain(ETHEREUM_SEPOLIA_CHAIN_ID);
    expect(config.chains.map((c) => c.id)).toContain(robinhoodTestnet.id);
  });
});
