import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreatorsPage from "@/app/creators/page";

const MOCK_CREATORS = [
  {
    address: "0x1111111111111111111111111111111111111111",
    name: "Vitalik Buterin",
    handle: "@vitalik.eth",
    accuracyRate: 92,
    confirmedBeliefs: 18,
    totalBeliefs: 20,
    volumeGeneratedEth: 450.5,
    earnedFeesEth: 6.75,
    isVerified: true,
  },
  {
    address: "0x2222222222222222222222222222222222222222",
    name: "Satoshi Disciple",
    handle: "@satoshidisciple",
    accuracyRate: 75,
    confirmedBeliefs: 30,
    totalBeliefs: 35,
    volumeGeneratedEth: 120.0,
    earnedFeesEth: 1.8,
    isVerified: true,
  },
];

describe("CreatorsPage (/creators)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          creators: MOCK_CREATORS,
        }),
      } as Response)
    );
  });

  it("renders page header and creator ranking cards", async () => {
    render(<CreatorsPage />);

    expect(screen.getByRole("heading", { level: 1, name: /Creators Directory/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Vitalik Buterin")).toBeInTheDocument();
      expect(screen.getByText("@vitalik.eth")).toBeInTheDocument();
      expect(screen.getByText("92%")).toBeInTheDocument();
      expect(screen.getByText("450.5 ETH")).toBeInTheDocument();
    });
  });

  it("sorts creators by active sorting tab", async () => {
    render(<CreatorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vitalik Buterin")).toBeInTheDocument();
    });

    const mostConfirmedTab = screen.getByRole("button", { name: /Most Confirmed/i });
    fireEvent.click(mostConfirmedTab);

    const cards = screen.getAllByTestId(/creator-card-/i);
    expect(cards[0]).toHaveTextContent("Satoshi Disciple");
  });

  it("filters creators by search query (name or address)", async () => {
    render(<CreatorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vitalik Buterin")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search creators by name, handle, or address\.\.\./i);
    fireEvent.change(searchInput, { target: { value: "satoshidisciple" } });

    expect(screen.getByText("Satoshi Disciple")).toBeInTheDocument();
    expect(screen.queryByText("Vitalik Buterin")).not.toBeInTheDocument();
  });

  it("links to individual creator profile page /creator/[address]", async () => {
    render(<CreatorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Vitalik Buterin")).toBeInTheDocument();
    });

    const profileLinks = screen.getAllByRole("link", { name: /view profile/i });
    expect(profileLinks[0]).toHaveAttribute("href", "/creator/0x1111111111111111111111111111111111111111");
  });
});
